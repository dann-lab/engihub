/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Ask Tab: Universal Academic Assistant & Study Partner
 * Features:
 * - Persistent Firestore chat sessions: reopen, rename, delete
 * - 4 Smart answer styles: Quick, Step-by-step, Exam answer, Deep dive
 * - File attachments: Photo, PDF, Text
 * - KaTeX math rendering, syntax highlighting with copy, inline SVG & Mermaid
 * - Google Search grounding with source attribution
 * - Voice Speech-to-Text input & Text-to-Speech audio readout
 * - Quick actions: Explain simpler, Give example, Make CBT from this, Save to notes, Copy
 * - Safety & ethical guardrails
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { callNetlifyAI, FALLBACK_AI_ERROR } from '../../services/apiClient';
import { AnswerStyle, ChatMessage, ChatSession, ScannedNoteRecord } from '../../types';
import { MarkdownView } from '../MarkdownView';
import { Skeleton } from '../common/Skeleton';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Edit2,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  CheckSquare,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  BookOpen,
  AlertTriangle,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

interface AskAssistantProps {
  onLaunchCBTWithNotes?: (notesText: string, topicName: string) => void;
}

const ANSWER_STYLES: Array<{ id: AnswerStyle; label: string; desc: string }> = [
  { id: 'quick', label: 'Quick Answer', desc: 'Direct, concentrated answer without filler' },
  { id: 'step_by_step', label: 'Step-by-Step Teaching', desc: 'Baby steps, every term defined, worked derivations' },
  { id: 'exam_answer', label: 'Exam Answer', desc: 'Structured to score full marks in university exams' },
  { id: 'deep_dive', label: 'Deep Dive', desc: 'First-principles physics, edge cases & trade-offs' }
];

export const AskAssistant: React.FC<AskAssistantProps> = ({ onLaunchCBTWithNotes }) => {
  const { currentUser, userProfile, recordDailyActivity } = useAuth();

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [activeStyle, setActiveStyle] = useState<AnswerStyle>('step_by_step');

  // Input & message state
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noteSavedId, setNoteSavedId] = useState<string | null>(null);

  // File Attachment
  const [attachment, setAttachment] = useState<{
    name: string;
    type: string;
    imageBase64?: string;
    textContent?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition (STT)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Text to Speech (TTS)
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Rename session dialog
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat sessions from Firestore
  useEffect(() => {
    if (currentUser) {
      firestoreService.getChats(currentUser.uid).then((loaded) => {
        setSessions(loaded);
        if (loaded.length > 0 && !activeSession) {
          setActiveSession(loaded[0]);
          setActiveStyle(loaded[0].defaultStyle || 'step_by_step');
        } else if (loaded.length === 0 && !activeSession) {
          createNewChat();
        }
      }).catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-NG'; // Nigerian English or en-US fallback

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Text-to-Speech (TTS)
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text: strip code blocks and mathematical symbols for natural voice
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/\$\$[\s\S]*?\$\$/g, 'Mathematical formula.')
      .replace(/\$[^\$]+\$/g, 'formula')
      .replace(/[#*`_]/g, '')
      .slice(0, 1000);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: `chat_${Date.now()}`,
      title: 'New Discussion',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      defaultStyle: activeStyle,
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          role: 'assistant',
          content: `Welcome to the Ask study desk. You can ask any question here—from engineering derivations and circuit calculations to code, academic papers, and study planning.\n\nChoose an answer style above (Quick, Step-by-Step, Exam, or Deep Dive), or attach a handwritten note or PDF to analyze.`,
          timestamp: Date.now()
        }
      ]
    };

    setActiveSession(newChat);
    setSessions((prev) => [newChat, ...prev]);
    if (currentUser) {
      firestoreService.saveChat(currentUser.uid, newChat).catch(console.error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file, 1600, 0.82);
        setAttachment({
          name: file.name,
          type: file.type,
          imageBase64: compressed.dataUrl
        });
      } catch (err) {
        console.error('Image compression failed, using standard reader:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachment({
            name: file.name,
            type: file.type,
            imageBase64: event.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      // Text / PDF / Code files
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment({
          name: file.name,
          type: file.type || 'text/plain',
          textContent: event.target?.result as string
        });
      };
      reader.readAsText(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if ((!query && !attachment) || isLoading || !currentUser || !activeSession) return;

    setInputText('');
    setError('');

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: query || 'Analyze attached document',
      timestamp: Date.now(),
      attachment: attachment ? { ...attachment } : undefined,
      styleUsed: activeStyle
    };

    const currentAttachment = attachment;
    setAttachment(null);

    // If session title is default, rename based on first query
    let updatedTitle = activeSession.title;
    if (activeSession.title === 'New Discussion') {
      updatedTitle = query.slice(0, 36) + (query.length > 36 ? '...' : '');
    }

    const updatedMessages = [...activeSession.messages, userMsg];
    const sessionWithUser = {
      ...activeSession,
      title: updatedTitle,
      messages: updatedMessages,
      updatedAt: Date.now()
    };

    setActiveSession(sessionWithUser);
    setIsLoading(true);

    try {
      const data = await callNetlifyAI<{ reply: string; sources?: Array<{ title: string; url: string }> }>({
        module: 'ask',
        message: query,
        style: activeStyle,
        history: updatedMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        context: {
          department: userProfile?.department || 'Engineering',
          level: userProfile?.level || '300L',
          courses: userProfile?.courses || []
        },
        attachment: currentAttachment ? {
          fileName: currentAttachment.name,
          mimeType: currentAttachment.type,
          imageBase64: currentAttachment.imageBase64,
          textContent: currentAttachment.textContent?.slice(0, 8000)
        } : undefined,
        lowDataMode: Boolean(userProfile?.lowDataMode)
      });

      const assistantMsg: ChatMessage = {
        id: `msg_assistant_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response recorded.',
        timestamp: Date.now(),
        sources: data.sources || [],
        styleUsed: activeStyle
      };

      const finalSession: ChatSession = {
        ...sessionWithUser,
        messages: [...updatedMessages, assistantMsg],
        updatedAt: Date.now()
      };

      setActiveSession(finalSession);
      await firestoreService.saveChat(currentUser.uid, finalSession);
      recordDailyActivity();

      // Update in sessions list
      setSessions((prev) =>
        prev.map((s) => (s.id === finalSession.id ? finalSession : s))
      );
    } catch (err: any) {
      console.error('Ask invocation error:', err);
      setError(FALLBACK_AI_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Actions under an answer
  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToNotes = async (content: string, id: string) => {
    if (!currentUser) return;
    const noteRecord: ScannedNoteRecord = {
      id: `note_ask_${Date.now()}`,
      title: `Saved Discussion (${activeSession?.title || 'Study Note'})`,
      extractedText: content,
      mode: 'summary',
      analysisResult: content,
      timestamp: Date.now()
    };
    await firestoreService.saveScannedNote(currentUser.uid, noteRecord);
    setNoteSavedId(id);
    setTimeout(() => setNoteSavedId(null), 2500);
  };

  const handleDeleteSession = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    await firestoreService.deleteChat(currentUser.uid, chatId);
    const remaining = sessions.filter((s) => s.id !== chatId);
    setSessions(remaining);
    if (activeSession?.id === chatId) {
      if (remaining.length > 0) {
        setActiveSession(remaining[0]);
      } else {
        createNewChat();
      }
    }
  };

  const handleRenameSubmit = async (chatId: string) => {
    if (!currentUser || !renameTitle.trim()) return;
    await firestoreService.renameChat(currentUser.uid, chatId, renameTitle.trim());
    setSessions((prev) =>
      prev.map((s) => (s.id === chatId ? { ...s, title: renameTitle.trim() } : s))
    );
    if (activeSession?.id === chatId) {
      setActiveSession({ ...activeSession, title: renameTitle.trim() });
    }
    setRenamingId(null);
    setRenameTitle('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C67D0A] dark:text-[#E0A844]">
              Ask Study Desk
            </span>
            <span className="text-[#687D72] dark:text-[#6E8578]">·</span>
            <span className="text-xs text-[#687D72] dark:text-[#AEC1B6]">
              Universal Academic Partner
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#142E22] dark:text-[#F6F3EE]">
            Engineering & Academic Assistant
          </h1>
          <p className="text-sm text-[#405449] dark:text-[#AEC1B6] mt-0.5">
            Ask any question across engineering, science, mathematics, coding, and university life. Grounded in facts, with KaTeX formulas and diagrams.
          </p>
        </div>

        <button
          onClick={createNewChat}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto tap-target-base"
        >
          <Plus className="w-4 h-4" />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Main Grid: Left Chat Sessions Sidebar + Right Active Chat Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Past Chat Sessions List (Collapsible on mobile) */}
        <div className="lg:col-span-1 p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D3] dark:border-[#234436]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#687D72] dark:text-[#6E8578]">
              Past Discussions ({sessions.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-[360px] lg:max-h-[560px] overflow-y-auto">
            {sessions.map((s) => {
              const isActive = activeSession?.id === s.id;
              const isRenaming = renamingId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSession(s)}
                  className={`p-3 rounded-lg text-left text-xs cursor-pointer transition-colors group flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white font-semibold shadow-xs'
                      : 'bg-[#FAF6EE] dark:bg-[#11221B] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
                  }`}
                >
                  <div className="truncate flex-1">
                    {isRenaming ? (
                      <input
                        type="text"
                        autoFocus
                        value={renameTitle}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(s.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        onBlur={() => handleRenameSubmit(s.id)}
                        className="w-full px-2 py-0.5 rounded-sm bg-white dark:bg-[#162C23] text-[#142E22] dark:text-[#F6F3EE] text-xs font-normal"
                      />
                    ) : (
                      <span className="block truncate">{s.title}</span>
                    )}
                    <span className={`text-[10px] block mt-0.5 ${
                      isActive ? 'text-white/80' : 'text-[#687D72] dark:text-[#6E8578]'
                    }`}>
                      {new Date(s.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {!isRenaming && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(s.id);
                          setRenameTitle(s.title);
                        }}
                        className="p-1 hover:text-[#E0A844]"
                        title="Rename discussion"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        className="p-1 hover:text-red-400"
                        title="Delete discussion"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chat Column */}
        <div className="lg:col-span-3 space-y-3">
          {/* Answer Style Selector Bar */}
          <div className="p-3.5 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE]">
              Answer Style:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ANSWER_STYLES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveStyle(st.id)}
                  title={st.desc}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeStyle === st.id
                      ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF6EE] dark:bg-[#11221B] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE] border border-[#E8E1D3] dark:border-[#234436]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream Frame */}
          <div className="min-h-[420px] max-h-[580px] overflow-y-auto p-4 sm:p-6 rounded-xl border bg-white/70 dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-4">
            {activeSession?.messages.map((m) => {
              const isUser = m.role === 'user';
              const isSpeaking = currentlySpeakingId === m.id;

              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-xl p-5 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                      isUser
                        ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white'
                        : 'bg-white dark:bg-[#162C23] border border-[#E8E1D3] dark:border-[#234436] text-[#142E22] dark:text-[#F6F3EE] paper-shadow-sm'
                    }`}
                  >
                    {/* Attachment preview if user uploaded */}
                    {m.attachment && (
                      <div className="p-2.5 rounded-lg bg-black/10 dark:bg-black/30 border border-white/10 text-xs flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="truncate">{m.attachment.name}</span>
                      </div>
                    )}

                    <MarkdownView content={m.content} />

                    {/* Grounding Sources (Google Search) */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="pt-2 border-t border-[#E8E1D3] dark:border-[#234436] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#C67D0A] dark:text-[#E0A844] block">
                          Verified Sources:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {m.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#1B4332] dark:text-[#E0A844] hover:underline bg-[#FAF6EE] dark:bg-[#11221B] px-2 py-0.5 rounded-md border border-[#E8E1D3] dark:border-[#234436]"
                            >
                              <span>{src.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions (Under assistant messages) */}
                    {!isUser && (
                      <div className="pt-3 border-t border-[#E8E1D3] dark:border-[#234436] flex flex-wrap items-center gap-2 text-xs">
                        {/* Audio readout */}
                        <button
                          onClick={() => speakText(m.content, m.id)}
                          title="Read answer aloud"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3 text-red-500" /> : <Volume2 className="w-3 h-3" />}
                          <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                        </button>

                        {/* Explain simpler */}
                        <button
                          onClick={() => handleSendMessage(`Explain your previous answer simpler using a clear everyday Nigerian analogy.`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]"
                        >
                          <HelpCircle className="w-3 h-3 text-[#C67D0A]" />
                          <span>Explain Simpler</span>
                        </button>

                        {/* Give an example */}
                        <button
                          onClick={() => handleSendMessage(`Provide a concrete worked numerical example of this concept.`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Give Example</span>
                        </button>

                        {/* Make CBT questions */}
                        {onLaunchCBTWithNotes && (
                          <button
                            onClick={() => onLaunchCBTWithNotes(m.content, activeSession?.title || 'Ask Topic')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]"
                          >
                            <CheckSquare className="w-3 h-3 text-[#1B4332] dark:text-[#52B788]" />
                            <span>Make CBT Questions</span>
                          </button>
                        )}

                        {/* Save to Notes */}
                        <button
                          onClick={() => handleSaveToNotes(m.content, m.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{noteSavedId === m.id ? 'Saved to Notes!' : 'Save to Notes'}</span>
                        </button>

                        {/* Copy */}
                        <button
                          onClick={() => handleCopyText(m.content, m.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]"
                        >
                          {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-5 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] space-y-3">
                  <span className="font-mono text-xs text-[#C67D0A] dark:text-[#E0A844] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C67D0A] animate-ping" />
                    Formulating answer with {activeStyle.replace('_', ' ')} rigor...
                  </span>
                  <Skeleton lines={4} />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attachment preview if file selected */}
          {attachment && (
            <div className="p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {attachment.imageBase64 ? (
                  <img
                    src={attachment.imageBase64}
                    alt={attachment.name}
                    className="w-12 h-12 object-cover rounded-lg border border-[#E8E1D3] dark:border-[#234436] shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#1B4332]/10 dark:bg-[#E0A844]/15 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#1B4332] dark:text-[#E0A844]" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-[#142E22] dark:text-[#F6F3EE] truncate">
                    {attachment.name}
                  </p>
                  <p className="text-[10px] text-[#687D72] dark:text-[#6E8578] truncate">
                    {attachment.type} · Ready for question
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="p-1 rounded-full text-[#687D72] hover:text-red-600 transition-colors"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input & Voice Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.py,.c,.cpp"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Paperclip file attach */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach photo, handwritten note, or assignment PDF"
              className="p-3 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] tap-target-base flex items-center justify-center"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Microphone button for STT */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Listening... click to stop' : 'Speak your question'}
              className={`p-3 rounded-xl border transition-colors tap-target-base flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything across engineering, mathematics, coding, or coursework..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] text-xs sm:text-sm text-[#142E22] dark:text-[#F6F3EE] placeholder-[#687D72] dark:placeholder-[#6E8578] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#2D6A4F]"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !attachment)}
              className="px-5 py-3 rounded-xl bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors tap-target-base"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5 text-[#DDA15E]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
