/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Help, Support & Contact Desk
 * Features:
 * - Contact Form with prefilled fields, category, message, screenshot upload, auto device/browser metadata
 * - Spam protection: 5 messages per hour per user limit
 * - Email notification dispatched via Netlify Function
 * - "My messages" tab to view message statuses and admin replies
 * - 5 expandable FAQ entries for university students
 * - Quick contact links: WhatsApp and "Built by Danni, Dannistec"
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { callNetlifyAI } from '../../services/apiClient';
import { MessageCategory, SupportMessage } from '../../types';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Upload,
  AlertCircle,
  FileQuestion,
  PhoneCall,
  User,
  ShieldAlert,
  Mail
} from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

const FAQ_ITEMS = [
  {
    q: 'How does CBT scoring and weak-spot diagnosis work?',
    a: 'CBT practice calculates your accuracy percentage and tracks every incorrect answer in your private student record. Missed topics are flagged in the Weak Topics tracker and automatically scheduled into the Spaced Repetition queue at 1-day, 3-day, 7-day, and 14-day intervals until mastered.'
  },
  {
    q: 'How do I use EngiHub offline or save data on slow campus networks?',
    a: 'Toggle Low-Data Mode ON from the sidebar or header. Low-Data mode suppresses heavy illustrations, keeps mathematical derivations concise, and loads ultra-lightweight vector schematics (<3KB) so the entire platform works smoothly on 2G/3G campus connections.'
  },
  {
    q: 'What should I do if an AI derivation step or CBT question seems incorrect?',
    a: 'Click the Flag icon on the question or derivation step to report it immediately. You can also click "Explain it again more simply" to see an everyday Nigerian physical analogy, or submit a message below under the "Bug or Math Error" category with an attached screenshot.'
  },
  {
    q: 'How do I export my completed engineering projects for SIWES / SWEP reports?',
    a: 'Go to the Projects tab -> Technical Portfolio Builder. Complete your design breakdown and click "Export SIWES Dossier" or "Print Formal Technical Report". The document formats cleanly as a standard white-paper matching COREN and university departmental guidelines.'
  },
  {
    q: 'Are my notes, test scores, and uploaded assignment solutions kept private?',
    a: 'Yes. All personal test scores, scanned handwritten notes, chat sessions, and portfolio drafts are stored under your private Firebase user ID and secured by Firestore Security Rules. Only solutions you explicitly publish to the Community Library are publicly visible.'
  }
];

export const HelpContact: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'contact' | 'my_messages' | 'faq'>('contact');

  // Form State
  const [category, setCategory] = useState<MessageCategory>('Question');
  const [message, setMessage] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Messages History State
  const [myMessages, setMyMessages] = useState<SupportMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user messages
  useEffect(() => {
    if (currentUser) {
      setLoadingMessages(true);
      firestoreService.getUserMessages(currentUser.uid)
        .then(setMyMessages)
        .catch(console.error)
        .finally(() => setLoadingMessages(false));
    }
  }, [currentUser, submitSuccess]);

  // Detect browser and device automatically
  const getDeviceMetadata = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown Browser';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const device = isMobile ? 'Mobile Device' : 'Desktop Computer';

    return { browser, device, page: window.location.pathname || 'Help Desk' };
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file (PNG, JPEG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Screenshot must be under 3MB.');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit support message with 5 msg/hour spam rate limit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || submitting) return;

    // Check rate limit: max 5 messages per hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = myMessages.filter((m) => m.createdAt > oneHourAgo).length;
    if (recentCount >= 5) {
      setErrorMessage('Rate limit reached: you can submit at most 5 messages per hour. Please wait a bit before sending another.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const metadata = getDeviceMetadata();
    const newMsg: SupportMessage = {
      id: `msg_${Date.now()}`,
      userId: currentUser.uid,
      name: userProfile?.displayName || 'Engineering Student',
      email: currentUser.email || '',
      category,
      message: message.trim(),
      screenshotUrl: screenshotData || undefined,
      device: metadata.device,
      browser: metadata.browser,
      page: metadata.page,
      status: 'New',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      // 1. Save to Firestore
      await firestoreService.submitSupportMessage(newMsg);

      // 2. Dispatch email notification via Netlify Function
      await callNetlifyAI({
        module: 'contact',
        name: newMsg.name,
        email: newMsg.email,
        category: newMsg.category,
        message: newMsg.message,
        metadata
      }).catch((e) => console.warn('Email dispatch notice:', e));

      setSubmitSuccess(true);
      setMessage('');
      setScreenshotData(null);
      setScreenshotName('');

      // Refresh user messages
      const updated = await firestoreService.getUserMessages(currentUser.uid);
      setMyMessages(updated);
    } catch (err: any) {
      console.error('Submit message error:', err);
      setErrorMessage('Could not send message. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '2349040110170';
  const whatsappUrl = `https://wa.me/2349040110170?text=${encodeURIComponent('Hello Danni, I have an inquiry regarding EngiHub.')}`;
  const directEmail = 'dannistec3@gmail.com';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C67D0A] dark:text-[#E0A844]">
              Campus Help Desk
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#142E22] dark:text-[#F6F3EE]">
            Help, Support & Contact Desk
          </h1>
          <p className="text-sm text-[#405449] dark:text-[#AEC1B6] mt-0.5">
            Reach out directly via WhatsApp, email, or send a message below.
          </p>
        </div>

        {/* Quick Contact Links */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>WhatsApp (09040110170)</span>
          </a>

          <a
            href={`mailto:${directEmail}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] hover:border-[#1B4332] dark:hover:border-[#52B788] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#C67D0A] dark:text-[#E0A844]" />
            <span>dannistec3@gmail.com</span>
          </a>

          <a
            href="https://dannistec.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] hover:underline transition-colors"
          >
            <span>Built by Danni, Dannistec</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Tabs: Send Message | My Messages | FAQ */}
      <div className="flex items-center gap-2 p-1 rounded-xl border bg-white/60 dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436]">
        {[
          { id: 'contact', label: 'Send Message' },
          { id: 'my_messages', label: `My Messages (${myMessages.length})` },
          { id: 'faq', label: 'Frequently Asked Questions' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSubmitSuccess(false);
              setErrorMessage('');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white font-semibold shadow-xs'
                : 'text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Send Message Form */}
      {activeTab === 'contact' && (
        <div className="p-6 sm:p-8 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-6">
          {submitSuccess ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#142E22] dark:text-[#F6F3EE]">
                Message Received
              </h3>
              <p className="text-xs sm:text-sm text-[#405449] dark:text-[#AEC1B6] max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. We have received your note and notified the team. You can check for updates under the "My Messages" tab above.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="mt-2 px-5 py-2.5 rounded-lg bg-[#1B4332] dark:bg-[#2D6A4F] text-white text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={userProfile?.displayName || 'Engineering Student'}
                    className="w-full px-4 py-2.5 rounded-lg border bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-xs text-[#405449] dark:text-[#AEC1B6]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1">
                    Student Email
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={currentUser?.email || ''}
                    className="w-full px-4 py-2.5 rounded-lg border bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-xs text-[#405449] dark:text-[#AEC1B6]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1">
                  Inquiry Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MessageCategory)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-xs text-[#142E22] dark:text-[#F6F3EE]"
                >
                  <option value="Question">Question about a formula or course</option>
                  <option value="Bug">Bug or Derivation Math Error</option>
                  <option value="Account problem">Account / Sign-in Problem</option>
                  <option value="Suggestion">Feature Suggestion for Campus Study</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, bug observation, or derivation question in detail..."
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-xs text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#2D6A4F]"
                />
              </div>

              {/* Optional Screenshot Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1">
                  Optional Screenshot Upload (max 3MB):
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotChange}
                />
                {!screenshotData ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach Screenshot / Image</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] max-w-sm text-xs">
                    <span className="truncate flex-1 font-medium">{screenshotName}</span>
                    <button
                      type="button"
                      onClick={() => { setScreenshotData(null); setScreenshotName(''); }}
                      className="text-red-500 font-bold px-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-colors tap-target-base"
              >
                <Send className="w-3.5 h-3.5 text-[#DDA15E]" />
                <span>{submitting ? 'Submitting Message...' : 'Submit Message'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: My Messages */}
      {activeTab === 'my_messages' && (
        <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1D3] dark:border-[#234436] pb-3">
            <h2 className="font-serif text-lg font-bold text-[#142E22] dark:text-[#F6F3EE]">
              My Past Messages & Inquiries
            </h2>
            <span className="text-xs text-[#687D72] dark:text-[#6E8578]">
              {myMessages.length} total messages
            </span>
          </div>

          {loadingMessages ? (
            <Skeleton lines={4} />
          ) : myMessages.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <MessageSquare className="w-8 h-8 text-[#687D72] dark:text-[#6E8578] mx-auto opacity-50" />
              <p className="text-xs text-[#687D72] dark:text-[#6E8578]">
                You haven't submitted any messages yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {myMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-5 rounded-xl border bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#142E22] dark:text-[#F6F3EE]">
                        {msg.category}
                      </span>
                      <span className="text-[#687D72] dark:text-[#6E8578]">·</span>
                      <span className="text-[11px] font-mono text-[#687D72] dark:text-[#6E8578]">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        msg.status === 'Resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : msg.status === 'In progress'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#405449] dark:text-[#AEC1B6] leading-relaxed">
                    {msg.message}
                  </p>

                  {/* Admin Reply */}
                  {msg.adminReply && (
                    <div className="mt-3 p-4 rounded-lg bg-white dark:bg-[#162C23] border border-[#E8E1D3] dark:border-[#234436] space-y-1">
                      <span className="text-[11px] font-bold text-[#C67D0A] dark:text-[#E0A844] block">
                        Admin Reply:
                      </span>
                      <p className="text-xs text-[#142E22] dark:text-[#F6F3EE] leading-relaxed">
                        {msg.adminReply}
                      </p>
                      {msg.repliedAt && (
                        <span className="text-[10px] text-[#687D72] dark:text-[#6E8578] block">
                          Replied on {new Date(msg.repliedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FAQ */}
      {activeTab === 'faq' && (
        <div className="p-6 sm:p-8 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-4">
          <div className="border-b border-[#E8E1D3] dark:border-[#234436] pb-3">
            <h2 className="font-serif text-lg font-bold text-[#142E22] dark:text-[#F6F3EE]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#405449] dark:text-[#AEC1B6]">
              Common questions on university engineering study, CBT scoring, and data saving.
            </p>
          </div>

          <div className="divide-y divide-[#E8E1D3] dark:divide-[#234436]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#142E22] dark:text-[#F6F3EE] hover:text-[#1B4332] dark:hover:text-[#E0A844] transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#C67D0A]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#687D72]" />}
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs text-[#405449] dark:text-[#AEC1B6] leading-relaxed pr-6">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
