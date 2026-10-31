/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Campus Administrator Console
 * Restricted to dannistec3@gmail.com
 * Features:
 * - Support Messages Inbox with search, status filters, and new message count badge
 * - Admin reply box that saves in Firestore and dispatches email via Netlify function
 * - Flagged community solutions moderation
 * - Campus telemetry & usage overview
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { apiRequest, callNetlifyAI } from '../../services/apiClient';
import { SupportMessage, MessageStatus, MessageCategory, CommunityProblemSolution } from '../../types';
import {
  Shield,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Laptop,
  Check,
  ShieldAlert,
  Trash2,
  BarChart3,
  Plus
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'moderation' | 'telemetry'>('messages');

  // Support Messages state
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MessageStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | MessageCategory>('All');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  // Reply state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyStatusMap, setReplyStatusMap] = useState<Record<string, MessageStatus>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [replyNotice, setReplyNotice] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Moderation state
  const [reportedSolutions, setReportedSolutions] = useState<CommunityProblemSolution[]>([]);
  const [loadingModeration, setLoadingModeration] = useState(false);

  // Telemetry state
  const [serverStats, setServerStats] = useState<{
    activeTrackedUsers: number;
    totalHourlyAIRequests: number;
    totalDailyAIRequests: number;
    serverUptimeSeconds: number;
  } | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [creatingSample, setCreatingSample] = useState(false);

  const [generalError, setGeneralError] = useState('');

  // 1. Fetch support messages manually
  const loadMessages = async () => {
    setLoadingMessages(true);
    setGeneralError('');
    try {
      const data = await firestoreService.getAllMessages();
      setMessages(data);
    } catch (e: any) {
      setGeneralError(e.message || 'Could not load student support messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  // 2. Fetch moderation items
  const loadModeration = async () => {
    setLoadingModeration(true);
    try {
      const allSolutions = await firestoreService.getCommunitySolutions();
      const reported = allSolutions.filter((s) => (s.reportCount || 0) > 0);
      setReportedSolutions(reported);
    } catch (e: any) {
      console.warn('Failed loading moderation items:', e);
    } finally {
      setLoadingModeration(false);
    }
  };

  // 3. Fetch server telemetry
  const loadTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const stats = await callNetlifyAI<any>({ module: 'admin_stats' })
        .catch(() => apiRequest<any>('/api/admin/stats').catch(() => null));
      if (stats) setServerStats(stats);
    } catch (e: any) {
      console.warn('Failed loading telemetry:', e);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  // 4. Create sample student inquiry to test workflow
  const handleCreateSampleInquiry = async () => {
    setCreatingSample(true);
    try {
      await firestoreService.seedSampleInquiry();
      setReplyNotice('Sample student inquiry created successfully.');
      setTimeout(() => setReplyNotice(null), 4000);
      await loadMessages();
    } catch (e: any) {
      alert('Could not create sample inquiry: ' + (e.message || 'Check connection'));
    } finally {
      setCreatingSample(false);
    }
  };

  // Real-time synchronization
  useEffect(() => {
    setLoadingMessages(true);
    setGeneralError('');

    // Subscribe to messages in real time
    const unsubscribe = firestoreService.subscribeToAllMessages(
      (loaded) => {
        setMessages(loaded);
        setLoadingMessages(false);
        // If collection is empty on first load, seed an initial inquiry automatically
        if (loaded.length === 0) {
          firestoreService.seedSampleInquiry().catch(() => {});
        }
      },
      (err) => {
        console.warn('Real-time listener notice, using manual fetch:', err);
        loadMessages();
      }
    );

    loadModeration();
    loadTelemetry();

    return () => {
      unsubscribe();
    };
  }, []);

  // Filtered support messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || msg.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || msg.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [messages, searchQuery, statusFilter, categoryFilter]);

  const newMessagesCount = useMemo(() => {
    return messages.filter((m) => m.status === 'New').length;
  }, [messages]);

  // Handle Admin Reply to Student
  const handleSendReply = async (msg: SupportMessage) => {
    const text = (replyTextMap[msg.id] || '').trim();
    const nextStatus = replyStatusMap[msg.id] || 'In progress';

    if (!text) {
      alert('Please type a reply message before sending.');
      return;
    }

    setSendingReplyId(msg.id);
    setReplyNotice(null);

    try {
      // 1. Update Firestore
      await firestoreService.replyToMessage(msg.id, text, nextStatus);

      // 2. Dispatch email notification to student via Netlify server function
      try {
        await apiRequest('/.netlify/functions/ai', {
          method: 'POST',
          body: JSON.stringify({
            module: 'contact_reply',
            action: 'reply',
            recipientEmail: msg.email,
            recipientName: msg.name,
            replyText: text,
            originalMessage: msg.message,
            status: nextStatus,
          }),
        });
      } catch (mailErr) {
        console.warn('Server email notification dispatched with notice:', mailErr);
      }

      // Update local state
      setMessages((prev) =>
        prev.map((item) =>
          item.id === msg.id
            ? {
                ...item,
                status: nextStatus,
                adminReply: text,
                repliedAt: Date.now(),
              }
            : item
        )
      );

      setReplyNotice(`Reply recorded for ${msg.name} and set to status "${nextStatus}".`);
      setTimeout(() => setReplyNotice(null), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to submit reply. Check Firestore permissions.');
    } finally {
      setSendingReplyId(null);
    }
  };

  // Moderation handlers
  const handleDismissReport = async (sol: CommunityProblemSolution) => {
    try {
      await firestoreService.saveCommunitySolution({
        ...sol,
        reportCount: 0,
        isFlagged: false,
      });
      setReportedSolutions((prev) => prev.filter((s) => s.id !== sol.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Permanently delete this reported community solution?')) return;
    try {
      await firestoreService.deleteCommunitySolution(id);
      setReportedSolutions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E1D3] dark:border-[#223A30] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C67D0A] dark:text-[#E0A844]" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#142E22] dark:text-[#F6F3EE]">
              Faculty Administrator Desk
            </h1>
          </div>
          <p className="text-xs text-[#687D72] dark:text-[#AEC1B6] mt-1">
            Authenticated console for <code className="font-mono text-[#1B4332] dark:text-[#E0A844]">{currentUser?.email}</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateSampleInquiry}
            disabled={creatingSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E1D3] dark:border-[#223A30] bg-[#FAF8F5] dark:bg-[#11221B] text-xs font-medium text-[#1B4332] dark:text-[#E0A844] hover:border-[#1B4332] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{creatingSample ? 'Creating...' : 'New Test Inquiry'}</span>
          </button>

          <button
            onClick={() => {
              loadMessages();
              loadModeration();
              loadTelemetry();
            }}
            disabled={loadingMessages || loadingModeration}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E1D3] dark:border-[#223A30] bg-[#FDFBF7] dark:bg-[#11221B] text-xs font-medium text-[#142E22] dark:text-[#F6F3EE] hover:border-[#1B4332] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {generalError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {generalError}
        </div>
      )}

      {replyNotice && (
        <div className="p-3 rounded-xl bg-[#EAF2ED] dark:bg-[#182C22] border border-[#2D6A4F]/30 text-xs text-[#1B4332] dark:text-[#AEC1B6] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{replyNotice}</span>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D3] dark:border-[#223A30] pb-2">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'messages'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#687D72] dark:text-[#AEC1B6] hover:bg-[#F5EFE6] dark:hover:bg-[#11221B]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Support Inquiries</span>
          {newMessagesCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C67D0A] text-white">
              {newMessagesCount} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'moderation'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#687D72] dark:text-[#AEC1B6] hover:bg-[#F5EFE6] dark:hover:bg-[#11221B]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Reported Blueprints</span>
          {reportedSolutions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white">
              {reportedSolutions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'telemetry'
              ? 'bg-[#1B4332] text-white shadow-xs'
              : 'text-[#687D72] dark:text-[#AEC1B6] hover:bg-[#F5EFE6] dark:hover:bg-[#11221B]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>System Telemetry</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SUPPORT INQUIRIES & REPLIES                                   */}
      {/* ==================================================================== */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-xl border border-[#E8E1D3] dark:border-[#223A30] bg-[#FDFBF7] dark:bg-[#11221B] paper-shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#687D72]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, email, or message content..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E1D3] dark:border-[#223A30] bg-[#FAF8F5] dark:bg-[#0B1612] text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              {/* Status filter buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['All', 'New', 'In progress', 'Resolved'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                      statusFilter === status
                        ? 'bg-[#1B4332] text-white font-semibold'
                        : 'bg-[#F5EFE6] dark:bg-[#182C22] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]'
                    }`}
                  >
                    {status}
                    {status === 'New' && newMessagesCount > 0 && ` (${newMessagesCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 text-xs text-[#687D72] dark:text-[#AEC1B6] pt-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                aria-label="Filter messages by category"
                className="text-xs px-2 py-1 rounded-md border border-[#E8E1D3] dark:border-[#223A30] bg-[#FAF8F5] dark:bg-[#0B1612] text-[#142E22] dark:text-[#F6F3EE]"
              >
                <option value="All">All Categories</option>
                <option value="Bug">Bug</option>
                <option value="Account problem">Account problem</option>
                <option value="Question">Question</option>
                <option value="Suggestion">Suggestion</option>
                <option value="Other">Other</option>
              </select>
              <span className="ml-auto font-mono text-[11px]">
                Showing {filteredMessages.length} of {messages.length} inquiries
              </span>
            </div>
          </div>

          {/* Messages List */}
          {loadingMessages ? (
            <div className="p-8 text-center text-xs text-[#687D72] dark:text-[#AEC1B6] animate-pulse">
              Loading support messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-10 rounded-xl border border-[#E8E1D3] dark:border-[#223A30] bg-[#FDFBF7] dark:bg-[#11221B] text-center space-y-4">
              <div className="space-y-1">
                <p className="font-serif text-sm font-semibold text-[#142E22] dark:text-[#F6F3EE]">
                  No messages match the current criteria
                </p>
                <p className="text-xs text-[#687D72] dark:text-[#AEC1B6] max-w-md mx-auto">
                  When students submit questions or issues through Help & Contact, they arrive here live. You can also generate a sample inquiry to test the workflow.
                </p>
              </div>
              <button
                onClick={handleCreateSampleInquiry}
                disabled={creatingSample}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143427] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{creatingSample ? 'Creating...' : 'Create Sample Student Inquiry'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((msg) => {
                const isExpanded = expandedMessageId === msg.id;
                const dateStr = new Date(msg.createdAt).toLocaleString('en-NG', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                return (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-[#E8E1D3] dark:border-[#223A30] bg-[#FDFBF7] dark:bg-[#11221B] paper-shadow-sm overflow-hidden transition-all"
                  >
                    {/* Message Header Row */}
                    <div
                      onClick={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                      className="p-4 cursor-pointer hover:bg-[#FAF8F5] dark:hover:bg-[#162B22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 sm:mt-0 ${
                            msg.status === 'New'
                              ? 'bg-[#C67D0A] animate-pulse'
                              : msg.status === 'In progress'
                              ? 'bg-blue-500'
                              : 'bg-[#2D6A4F]'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE]">
                              {msg.name}
                            </span>
                            <span className="text-xs text-[#687D72] dark:text-[#AEC1B6] font-mono">
                              &lt;{msg.email}&gt;
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#F5EFE6] dark:bg-[#182C22] text-[#405449] dark:text-[#E0A844] border border-[#E8E1D3] dark:border-[#223A30]">
                              {msg.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#405449] dark:text-[#AEC1B6] truncate mt-0.5">
                            {msg.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            msg.status === 'New'
                              ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                              : msg.status === 'In progress'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-[#E8F1EC] text-[#1B4332] border border-[#2D6A4F]/20'
                          }`}
                        >
                          {msg.status}
                        </span>
                        <span className="text-[11px] font-mono text-[#687D72] dark:text-[#AEC1B6]">
                          {dateStr}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#687D72]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#687D72]" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail and Reply Composer */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 border-t border-[#E8E1D3] dark:border-[#223A30] bg-[#FAF8F5] dark:bg-[#0E1E17] space-y-4">
                        {/* Technical Metadata */}
                        {msg.metadata && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#687D72] dark:text-[#AEC1B6] bg-[#F5EFE6] dark:bg-[#11221B] p-2.5 rounded-lg border border-[#E8E1D3] dark:border-[#223A30]">
                            <span className="flex items-center gap-1">
                              <Laptop className="w-3 h-3 text-[#1B4332] dark:text-[#E0A844]" />
                              Device: {msg.metadata.device || 'Unknown'} / {msg.metadata.browser || 'Unknown'}
                            </span>
                            <span>·</span>
                            <span>Page: {msg.metadata.page || '/'}</span>
                            {msg.userId && (
                              <>
                                <span>·</span>
                                <span>User UID: {msg.userId.slice(0, 8)}...</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Full Message Body */}
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#687D72] dark:text-[#AEC1B6] block mb-1">
                            Student Message
                          </span>
                          <div className="p-3.5 rounded-xl bg-[#FDFBF7] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#223A30] text-xs text-[#142E22] dark:text-[#F6F3EE] whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </div>
                        </div>

                        {/* Attached Screenshot preview */}
                        {msg.screenshotBase64 && (
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#687D72] dark:text-[#AEC1B6] block mb-1">
                              Attached Screenshot
                            </span>
                            <div className="relative inline-block">
                              <img
                                src={msg.screenshotBase64}
                                alt="Student inquiry screenshot"
                                onClick={() => setPreviewImage(msg.screenshotBase64 || null)}
                                className="max-h-48 max-w-full rounded-lg border border-[#E8E1D3] dark:border-[#223A30] object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                              />
                              <span className="text-[10px] text-[#687D72] block mt-1">
                                Click to view full resolution
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Existing Admin Reply if already answered */}
                        {msg.adminReply && (
                          <div className="p-3.5 rounded-xl bg-[#E8F1EC] dark:bg-[#142A20] border border-[#2D6A4F]/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B4332] dark:text-[#AEC1B6]">
                                Prior Admin Reply (by Danni)
                              </span>
                              {msg.repliedAt && (
                                <span className="text-[10px] font-mono text-[#687D72] dark:text-[#AEC1B6]">
                                  {new Date(msg.repliedAt).toLocaleString('en-NG')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#142E22] dark:text-[#F6F3EE] whitespace-pre-wrap">
                              {msg.adminReply}
                            </p>
                          </div>
                        )}

                        {/* Reply Form */}
                        <div className="p-4 rounded-xl border border-[#E8E1D3] dark:border-[#223A30] bg-[#FDFBF7] dark:bg-[#11221B] space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="font-serif text-xs font-bold text-[#142E22] dark:text-[#F6F3EE] flex items-center gap-1.5">
                              <Send className="w-3.5 h-3.5 text-[#C67D0A] dark:text-[#E0A844]" />
                              {msg.adminReply ? 'Update or Send Another Reply' : 'Reply to Student'}
                            </span>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-[#687D72] dark:text-[#AEC1B6]">Update Status:</span>
                              <select
                                value={replyStatusMap[msg.id] || msg.status}
                                onChange={(e) =>
                                  setReplyStatusMap((prev) => ({
                                    ...prev,
                                    [msg.id]: e.target.value as MessageStatus,
                                  }))
                                }
                                aria-label="Update status for message"
                                className="px-2 py-1 rounded-md border border-[#E8E1D3] dark:border-[#223A30] bg-[#FAF8F5] dark:bg-[#0B1612] text-xs font-mono font-semibold text-[#142E22] dark:text-[#F6F3EE]"
                              >
                                <option value="New">New</option>
                                <option value="In progress">In progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </div>
                          </div>

                          <textarea
                            rows={3}
                            value={replyTextMap[msg.id] ?? msg.adminReply ?? ''}
                            onChange={(e) =>
                              setReplyTextMap((prev) => ({
                                ...prev,
                                [msg.id]: e.target.value,
                              }))
                            }
                            placeholder={`Type reply to ${msg.name}... (This will be shown in their 'My messages' tab and sent to their email)`}
                            className="w-full p-3 rounded-lg border border-[#E8E1D3] dark:border-[#223A30] bg-[#FAF8F5] dark:bg-[#0B1612] text-xs text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:border-[#1B4332]"
                          />

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-[#687D72] dark:text-[#AEC1B6]">
                              Dispatches email via Netlify & updates Firestore.
                            </span>

                            <button
                              onClick={() => handleSendReply(msg)}
                              disabled={sendingReplyId === msg.id}
                              className="px-4 py-2 rounded-lg bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#142E22] disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{sendingReplyId === msg.id ? 'Sending...' : 'Send Reply'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MODERATION OF REPORTED COMMUNITY BLUEPRINTS                   */}
      {/* ==================================================================== */}
      {activeTab === 'moderation' && (
        <div className="p-5 rounded-xl bg-[#FDFBF7] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#223A30] paper-shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1D3] dark:border-[#223A30] pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844]" />
              <h3 className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE]">
                Reported Community Solutions ({reportedSolutions.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#687D72] dark:text-[#AEC1B6]">
              Auto-hidden when reports &ge; 3
            </span>
          </div>

          {reportedSolutions.length === 0 ? (
            <p className="text-xs text-[#687D72] dark:text-[#AEC1B6] py-8 text-center">
              No active flagged or reported community blueprints in the library.
            </p>
          ) : (
            <div className="space-y-3">
              {reportedSolutions.map((sol) => (
                <div
                  key={sol.id}
                  className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1E17] border border-[#E8E1D3] dark:border-[#223A30] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold border border-red-200 dark:border-red-800">
                          {sol.reportCount || 0} Reports
                        </span>
                        {sol.isFlagged && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-900 text-white font-bold">
                            HIDDEN FROM LIBRARY
                          </span>
                        )}
                        <span className="text-xs font-mono text-[#687D72] dark:text-[#AEC1B6]">
                          Author: {sol.authorName} ({sol.authorUniversity})
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE]">
                        {sol.problemTitle}
                      </h4>
                      <p className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-1">
                        {sol.localContext}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDismissReport(sol)}
                        className="px-3 py-1.5 rounded-lg bg-[#F5EFE6] dark:bg-[#182C22] border border-[#E8E1D3] dark:border-[#223A30] text-xs text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] transition-colors"
                      >
                        Dismiss Reports
                      </button>
                      <button
                        onClick={() => handleDeletePost(sol.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors"
                      >
                        Delete Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: SYSTEM TELEMETRY                                              */}
      {/* ==================================================================== */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#FDFBF7] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#223A30] paper-shadow-sm">
              <span className="text-[10px] font-mono text-[#687D72] dark:text-[#AEC1B6] uppercase block">
                Total Inquiries
              </span>
              <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-1 block">
                {messages.length}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FDFBF7] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#223A30] paper-shadow-sm">
              <span className="text-[10px] font-mono text-[#687D72] dark:text-[#AEC1B6] uppercase block">
                Pending Reply
              </span>
              <span className="font-mono text-2xl font-bold text-[#C67D0A] dark:text-[#E0A844] mt-1 block">
                {newMessagesCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FDFBF7] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#223A30] paper-shadow-sm">
              <span className="text-[10px] font-mono text-[#687D72] dark:text-[#AEC1B6] uppercase block">
                Hourly AI Traffic
              </span>
              <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-1 block">
                {serverStats?.totalHourlyAIRequests ?? 0}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FDFBF7] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#223A30] paper-shadow-sm">
              <span className="text-[10px] font-mono text-[#687D72] dark:text-[#AEC1B6] uppercase block">
                Daily Requests
              </span>
              <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-1 block">
                {serverStats?.totalDailyAIRequests ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-[#0B1612] p-2 rounded-xl">
            <img src={previewImage} alt="Attachment Full Size" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};
