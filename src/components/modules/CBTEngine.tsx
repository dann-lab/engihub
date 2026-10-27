/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Expanded CBT Examination System
 * Features:
 * - 4 Sources: Course topic lists (10 courses), free-text topic, note upload, past-question styles.
 * - 5 Question Types: Multiple choice, true/false, fill in blank, numeric calculation with tolerance, multi-select.
 * - 5 Modes: Practice, Exam simulation, Quick 10, Weak-spot drill, Daily challenge.
 * - In-question: Worked explanation, concept tested, why other options wrong, flag, bookmark, "Explain it again more simply".
 * - Results: Score, time per question, topic breakdown, wrong answers review, "Revise this topic" handoff.
 * - Spaced Repetition: 1, 3, 7, 14 days schedule persisted in Firestore.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { callNetlifyAI, FALLBACK_AI_ERROR } from '../../services/apiClient';
import {
  CBTMode,
  CBTQuestion,
  CBTQuiz,
  CBTSource,
  DifficultyLevel,
  QuestionType,
  SpacedRepetitionItem,
  WeakTopic
} from '../../types';
import { MarkdownView } from '../MarkdownView';
import { Skeleton } from '../common/Skeleton';
import { ALL_10_COURSES } from './AITutor';
import {
  CheckSquare,
  Timer,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Bookmark,
  Flag,
  HelpCircle,
  Shuffle,
  Calendar,
  Zap,
  Target,
  Clock,
  Award
} from 'lucide-react';

interface CBTEngineProps {
  initialTopic?: string;
  notesContext?: string;
  onComplete?: () => void;
  onNavigateToTutor?: (topic: string) => void;
}

const PAST_QUESTION_STYLES = [
  'General University & COREN Benchmark Standard',
  'UNILAG Faculty of Engineering Past Questions',
  'FUTA Departmental Semester Examination Style',
  'ABU Zaria Benchmark Examination Style',
  'UNN Nsukka Faculty Standard',
  'UNILORIN Engineering Faculty Standard'
];

export const CBTEngine: React.FC<CBTEngineProps> = ({
  initialTopic,
  notesContext,
  onComplete,
  onNavigateToTutor
}) => {
  const { currentUser, userProfile, updateProfileData } = useAuth();

  // Configuration State
  const [sourceType, setSourceType] = useState<CBTSource>(notesContext ? 'uploaded_note' : 'course_topic');
  const [selectedCourse, setSelectedCourse] = useState(ALL_10_COURSES[0].name);
  const [topic, setTopic] = useState(initialTopic || ALL_10_COURSES[0].topics[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [pastedNotes, setPastedNotes] = useState(notesContext || '');
  const [pastQuestionStyle, setPastQuestionStyle] = useState(PAST_QUESTION_STYLES[0]);

  const [mode, setMode] = useState<CBTMode>('practice');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('exam-level');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(true);
  const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(true);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<CBTQuiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Per-question Answer Inputs
  const [userSelectedIndex, setUserSelectedIndex] = useState<number | null>(null);
  const [userSelectedIndices, setUserSelectedIndices] = useState<number[]>([]);
  const [userTextAnswer, setUserTextAnswer] = useState('');
  const [userNumericAnswer, setUserNumericAnswer] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [simplerExplaining, setSimplerExplaining] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Spaced Repetition & Weak Topics History
  const [spacedRepetitionDue, setSpacedRepetitionDue] = useState<SpacedRepetitionItem[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<any[]>([]);

  // Load user data on mount
  useEffect(() => {
    if (currentUser) {
      firestoreService.getSpacedRepetitionDue(currentUser.uid).then(setSpacedRepetitionDue).catch(console.error);
      firestoreService.getWeakTopics(currentUser.uid).then(setWeakTopics).catch(console.error);
      firestoreService.getBookmarkedQuestions(currentUser.uid).then(setBookmarkedQuestions).catch(console.error);
    }
  }, [currentUser]);

  // Quiz Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerEnabled) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerEnabled]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Quiz Generator
  const handleStartQuiz = async (overrideMode?: CBTMode, overrideQuestions?: CBTQuestion[]) => {
    if (!currentUser) return;
    setIsLoading(true);
    setError('');

    const targetMode = overrideMode || mode;

    // 1. Weak Spot Drill: If questions provided or fetched from spaced repetition / weak list
    if (targetMode === 'weak_spot' && overrideQuestions && overrideQuestions.length > 0) {
      startQuizSession(overrideQuestions, 'Weak-Spot Revision Drill', targetMode);
      setIsLoading(false);
      return;
    }

    // Determine target topic
    let targetTopic = topic;
    if (sourceType === 'free_text') {
      targetTopic = customTopic.trim() || 'General Engineering';
    } else if (sourceType === 'uploaded_note') {
      targetTopic = 'Uploaded Lecture Notes / Past Question Sheet';
    }

    try {
      const data = await callNetlifyAI<{ questions: any[] }>({
        module: 'cbt',
        topic: targetTopic,
        course: selectedCourse,
        difficulty,
        questionCount: targetMode === 'quick_10' ? 10 : questionCount,
        mode: targetMode,
        notesContent: sourceType === 'uploaded_note' ? pastedNotes : '',
        pastQuestionStyle: sourceType === 'past_question' ? pastQuestionStyle : '',
        lowDataMode: Boolean(userProfile?.lowDataMode)
      });

      if (!data.questions || data.questions.length === 0) {
        throw new Error(FALLBACK_AI_ERROR);
      }

      let questions: CBTQuestion[] = data.questions.map((q, idx) => ({
        id: q.id || `q_${Date.now()}_${idx}`,
        type: (q.type as QuestionType) || 'multiple_choice',
        question: q.question || q.questionText || '',
        options: q.options || [],
        correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
        correctAnswerIndices: q.correctAnswerIndices || (typeof q.correctAnswerIndex === 'number' ? [q.correctAnswerIndex] : [0]),
        correctAnswerText: q.correctAnswerText || '',
        numericAnswer: typeof q.numericAnswer === 'number' ? q.numericAnswer : undefined,
        numericTolerance: typeof q.numericTolerance === 'number' ? q.numericTolerance : 0.05,
        unit: q.unit || '',
        explanation: q.explanation || 'Worked solution not generated.',
        conceptTested: q.conceptTested || 'Governing Principle',
        whyOtherOptionsWrong: q.whyOtherOptionsWrong || '',
        topic: q.topic || targetTopic,
        subtopic: q.subtopic || 'General Practice',
        difficulty: (q.difficulty as DifficultyLevel) || difficulty
      }));

      if (shuffleEnabled) {
        questions = [...questions].sort(() => Math.random() - 0.5);
      }

      startQuizSession(questions, targetTopic, targetMode);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setError(FALLBACK_AI_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuizSession = (questions: CBTQuestion[], quizTopic: string, quizMode: CBTMode) => {
    const quiz: CBTQuiz = {
      id: `quiz_${Date.now()}`,
      topic: quizTopic,
      course: selectedCourse,
      mode: quizMode,
      difficulty,
      questions,
      score: 0,
      totalQuestions: questions.length,
      durationSeconds: 0
    };

    setActiveQuiz(quiz);
    setCurrentIdx(0);
    resetQuestionInput();
    setElapsedSeconds(0);
    setTimerActive(true);
  };

  const resetQuestionInput = () => {
    setUserSelectedIndex(null);
    setUserSelectedIndices([]);
    setUserTextAnswer('');
    setUserNumericAnswer('');
    setIsAnswerSubmitted(false);
  };

  // Check Answer for current question
  const handleSubmitAnswer = async () => {
    if (!activeQuiz || !currentUser) return;
    const currentQ = activeQuiz.questions[currentIdx];
    let isCorrect = false;

    if (currentQ.type === 'multiple_choice' || currentQ.type === 'true_false') {
      if (userSelectedIndex === null) return;
      isCorrect = userSelectedIndex === currentQ.correctAnswerIndex;
    } else if (currentQ.type === 'multi_select') {
      if (userSelectedIndices.length === 0) return;
      const sortedUser = [...userSelectedIndices].sort();
      const sortedExpected = [...(currentQ.correctAnswerIndices || [])].sort();
      isCorrect =
        sortedUser.length === sortedExpected.length &&
        sortedUser.every((val, i) => val === sortedExpected[i]);
    } else if (currentQ.type === 'fill_blank') {
      if (!userTextAnswer.trim()) return;
      const expected = (currentQ.correctAnswerText || '').trim().toLowerCase();
      isCorrect = userTextAnswer.trim().toLowerCase() === expected;
    } else if (currentQ.type === 'numeric_calc') {
      if (!userNumericAnswer.trim()) return;
      const val = parseFloat(userNumericAnswer);
      if (isNaN(val)) return;
      const expected = currentQ.numericAnswer || 0;
      const tolerance = (currentQ.numericTolerance || 0.05) * Math.abs(expected || 1);
      isCorrect = Math.abs(val - expected) <= tolerance;
    }

    // Update active question record
    const updatedQuestions = [...activeQuiz.questions];
    updatedQuestions[currentIdx] = {
      ...currentQ,
      userSelectedIndex: userSelectedIndex ?? undefined,
      userSelectedIndices: userSelectedIndices.length > 0 ? userSelectedIndices : undefined,
      userTextAnswer: userTextAnswer || undefined,
      userNumericAnswer: userNumericAnswer ? parseFloat(userNumericAnswer) : undefined,
      isCorrect,
      isAnswered: true
    };

    const newScore = isCorrect ? activeQuiz.score + 1 : activeQuiz.score;
    const updatedQuiz: CBTQuiz = {
      ...activeQuiz,
      questions: updatedQuestions,
      score: newScore
    };

    setActiveQuiz(updatedQuiz);
    setIsAnswerSubmitted(true);

    // Save weak topic & schedule spaced repetition
    await firestoreService.recordSpacedRepetitionQuestion(currentUser.uid, currentQ, isCorrect);

    if (!isCorrect) {
      await firestoreService.recordWeakTopic(
        currentUser.uid,
        currentQ.topic || activeQuiz.topic,
        currentQ.subtopic || 'General Principle',
        `Review calculation methodology for: ${currentQ.topic}`
      );
      const refreshedWeak = await firestoreService.getWeakTopics(currentUser.uid);
      setWeakTopics(refreshedWeak);
    }
  };

  const handleNextQuestion = async () => {
    if (!activeQuiz || !currentUser) return;

    if (currentIdx < activeQuiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      resetQuestionInput();
    } else {
      // Quiz Complete
      setTimerActive(false);
      const finished: CBTQuiz = {
        ...activeQuiz,
        durationSeconds: elapsedSeconds,
        completedAt: Date.now()
      };
      setActiveQuiz(finished);
      await firestoreService.saveCBTQuiz(currentUser.uid, finished);

      // Trigger quiet celebratory confetti
      onComplete?.();

      // Refresh spaced repetition due count
      firestoreService.getSpacedRepetitionDue(currentUser.uid).then(setSpacedRepetitionDue).catch(console.error);
    }
  };

  // Toggle Bookmark for current question
  const handleToggleBookmark = async (q: CBTQuestion) => {
    if (!currentUser) return;
    const isNowBookmarked = await firestoreService.toggleBookmarkQuestion(currentUser.uid, q);
    if (activeQuiz) {
      const updated = [...activeQuiz.questions];
      updated[currentIdx] = { ...q, isBookmarked: isNowBookmarked };
      setActiveQuiz({ ...activeQuiz, questions: updated });
    }
    const refreshed = await firestoreService.getBookmarkedQuestions(currentUser.uid);
    setBookmarkedQuestions(refreshed);
  };

  // Flag bad question
  const handleFlagQuestion = async (q: CBTQuestion) => {
    if (!currentUser || !activeQuiz) return;
    const updated = [...activeQuiz.questions];
    updated[currentIdx] = { ...q, isFlagged: true };
    setActiveQuiz({ ...activeQuiz, questions: updated });
  };

  // Explain simpler in place
  const handleExplainSimpler = async (q: CBTQuestion) => {
    setSimplerExplaining(true);
    try {
      const res = await callNetlifyAI<{ reply: string }>({
        module: 'cbt_simpler',
        action: 'explain_simpler',
        question: q.question,
        topic: q.topic,
        explanation: q.explanation
      });
      if (activeQuiz) {
        const updated = [...activeQuiz.questions];
        updated[currentIdx] = { ...q, simplerExplanation: res.reply };
        setActiveQuiz({ ...activeQuiz, questions: updated });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimplerExplaining(false);
    }
  };

  const currentQ = activeQuiz?.questions[currentIdx];
  const isFinished = Boolean(activeQuiz && activeQuiz.completedAt);
  const isPracticeMode = activeQuiz?.mode === 'practice';
  const showImmediateFeedback = isPracticeMode && isAnswerSubmitted;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C67D0A] dark:text-[#E0A844]">
              Examination Preparation Center
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#142E22] dark:text-[#F6F3EE]">
            CBT Exam Practice & Assessment
          </h1>
          <p className="text-sm text-[#405449] dark:text-[#AEC1B6] mt-0.5">
            5 test modes, multiple question formats, worked solutions, and automated spaced repetition tracking.
          </p>
        </div>

        {activeQuiz && !isFinished && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {timerEnabled && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs font-mono font-bold text-[#142E22] dark:text-[#F6F3EE]">
                <Clock className="w-3.5 h-3.5 text-[#C67D0A] dark:text-[#E0A844]" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>
            )}
            <button
              onClick={() => setActiveQuiz(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Exit Set</span>
            </button>
          </div>
        )}
      </div>

      {!activeQuiz ? (
        /* ====================================================================
           SETUP / CONFIGURATION SCREEN
           ==================================================================== */
        <div className="space-y-6">
          {/* Spaced Repetition Due Alert Banner */}
          {spacedRepetitionDue.length > 0 && (
            <div className="p-4 sm:p-5 rounded-xl border bg-[#FDF4E5] dark:bg-[#1D2B20] border-[#E8D4B0] dark:border-[#325C4B] paper-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-[#C67D0A] dark:text-[#E0A844] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE]">
                    Spaced Repetition Review Due ({spacedRepetitionDue.length} Questions)
                  </h3>
                  <p className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-0.5">
                    Questions you missed previously are scheduled for review today (1d, 3d, 7d, 14d retention curve).
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleStartQuiz(
                    'weak_spot',
                    spacedRepetitionDue.map((item) => item.question)
                  )
                }
                className="px-4 py-2 rounded-lg bg-[#C67D0A] dark:bg-[#E0A844] text-white dark:text-[#0B1612] text-xs font-bold shadow-xs whitespace-nowrap self-start sm:self-auto"
              >
                Review Due Questions ({spacedRepetitionDue.length})
              </button>
            </div>
          )}

          {/* Setup Panel */}
          <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-6">
            {/* 1. Select Mode */}
            <div>
              <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-2 uppercase tracking-wider">
                Select Exam Mode:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { id: 'practice', label: 'Practice Mode', desc: 'Instant worked solutions & derivations after each answer' },
                  { id: 'exam_simulation', label: 'Exam Simulation', desc: 'Timed mock exam; solutions revealed only at the end' },
                  { id: 'quick_10', label: 'Quick 10', desc: '10 quick questions in about 5 minutes for rapid check' },
                  { id: 'weak_spot', label: 'Weak-Spot Drill', desc: 'Targeted only at past errors and missed questions' },
                  { id: 'daily_challenge', label: 'Daily Challenge', desc: 'One set per day that powers your study streak' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as CBTMode)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      mode === m.id
                        ? 'bg-[#1B4332] dark:bg-[#2D6A4F] border-[#1B4332] dark:border-[#2D6A4F] text-white shadow-xs'
                        : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
                    }`}
                  >
                    <span className="font-serif text-sm font-bold block">{m.label}</span>
                    <span className={`text-[10px] block mt-1 leading-snug ${
                      mode === m.id ? 'text-white/80' : 'text-[#687D72] dark:text-[#6E8578]'
                    }`}>
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Select Question Source */}
            <div className="pt-2 border-t border-[#E8E1D3] dark:border-[#234436]">
              <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-2 uppercase tracking-wider">
                Select Question Source:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'course_topic', label: 'Course Topics' },
                  { id: 'free_text', label: 'Custom Topic' },
                  { id: 'past_question', label: 'Past-Question Style' },
                  { id: 'uploaded_note', label: 'Uploaded Notes' }
                ].map((src) => (
                  <button
                    key={src.id}
                    onClick={() => setSourceType(src.id as CBTSource)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                      sourceType === src.id
                        ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332]'
                        : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6]'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Details */}
            {sourceType === 'course_topic' && (
              <div className="space-y-3 p-4 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436]">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {ALL_10_COURSES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedCourse(c.name);
                        setTopic(c.topics[0]);
                      }}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium border text-left truncate ${
                        selectedCourse === c.name
                          ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332]'
                          : 'bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6]'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <span className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1.5">
                    Select Topic in {selectedCourse}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_10_COURSES.find((c) => c.name === selectedCourse)?.topics.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(t)}
                        className={`text-xs px-3 py-1.5 rounded-lg border text-left ${
                          topic === t
                            ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332] font-semibold'
                            : 'bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sourceType === 'free_text' && (
              <div className="p-4 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436]">
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1.5">
                  Enter Any Custom Topic or Mathematical Subtopic:
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Sizing a pelton wheel turbine runner, Mohr's circle stress transformation..."
                  className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] text-xs text-[#142E22] dark:text-[#F6F3EE]"
                />
              </div>
            )}

            {sourceType === 'past_question' && (
              <div className="p-4 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] space-y-2">
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1.5">
                  Target Past-Question Standard:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PAST_QUESTION_STYLES.map((pq) => (
                    <button
                      key={pq}
                      onClick={() => setPastQuestionStyle(pq)}
                      className={`p-3 rounded-lg border text-left text-xs ${
                        pastQuestionStyle === pq
                          ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332] font-semibold'
                          : 'bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6]'
                      }`}
                    >
                      {pq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sourceType === 'uploaded_note' && (
              <div className="p-4 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] space-y-2">
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1">
                  Pasted Notes or Extracted Text:
                </label>
                <textarea
                  rows={4}
                  value={pastedNotes}
                  onChange={(e) => setPastedNotes(e.target.value)}
                  placeholder="Paste lecture notes, assignment questions, or OCR transcription text here..."
                  className="w-full px-3.5 py-2.5 rounded-lg border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] text-xs text-[#142E22] dark:text-[#F6F3EE]"
                />
              </div>
            )}

            {/* 3. Question Count, Difficulty & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E8E1D3] dark:border-[#234436]">
              {/* Question count */}
              <div>
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1.5">
                  Question Count:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 20, 40, 60].map((num) => (
                    <button
                      key={num}
                      onClick={() => setQuestionCount(num)}
                      className={`py-2 rounded-lg border text-xs font-bold ${
                        questionCount === num
                          ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332]'
                          : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1.5">
                  Difficulty Level:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'easy', label: 'Easy' },
                    { id: 'exam-level', label: 'Exam' },
                    { id: 'hard', label: 'Hard' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id as DifficultyLevel)}
                      className={`py-2 rounded-lg border text-xs font-bold ${
                        difficulty === d.id
                          ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332]'
                          : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles: Timer & Shuffle */}
              <div>
                <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1.5">
                  Session Controls:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setTimerEnabled(!timerEnabled)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      timerEnabled
                        ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332]'
                        : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#687D72] dark:text-[#6E8578]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timer: {timerEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => setShuffleEnabled(!shuffleEnabled)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      shuffleEnabled
                        ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white border-[#1B4332]'
                        : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#687D72] dark:text-[#6E8578]'
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle: {shuffleEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Launch Button */}
            <button
              onClick={() => handleStartQuiz()}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-bold tracking-wide shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 tap-target-base"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Exam-Standard Questions...</span>
                </>
              ) : (
                <>
                  <span>Start CBT Assessment ({mode === 'quick_10' ? 10 : questionCount} Questions)</span>
                  <ArrowRight className="w-4 h-4 text-[#DDA15E]" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : isFinished ? (
        /* ====================================================================
           RESULTS SCREEN
           ==================================================================== */
        <div className="space-y-6">
          <div className="p-8 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-md text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#1B4332]/10 dark:bg-[#E0A844]/15 text-[#1B4332] dark:text-[#E0A844] flex items-center justify-center mx-auto mb-1">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE]">
              Assessment Complete
            </h2>

            <div className="max-w-md mx-auto grid grid-cols-3 gap-3 py-3">
              <div className="p-3.5 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436]">
                <span className="text-[10px] uppercase font-semibold text-[#687D72] dark:text-[#6E8578] block">
                  Final Score
                </span>
                <span className="font-mono text-2xl font-bold text-[#1B4332] dark:text-[#E0A844] mt-1 block">
                  {activeQuiz.score}/{activeQuiz.totalQuestions}
                </span>
                <span className="text-[11px] font-mono text-[#687D72] dark:text-[#6E8578]">
                  {Math.round((activeQuiz.score / activeQuiz.totalQuestions) * 100)}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436]">
                <span className="text-[10px] uppercase font-semibold text-[#687D72] dark:text-[#6E8578] block">
                  Total Time
                </span>
                <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-1 block">
                  {formatTimer(activeQuiz.durationSeconds)}
                </span>
                <span className="text-[11px] font-mono text-[#687D72] dark:text-[#6E8578]">
                  {Math.round(activeQuiz.durationSeconds / activeQuiz.totalQuestions)}s/question
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436]">
                <span className="text-[10px] uppercase font-semibold text-[#687D72] dark:text-[#6E8578] block">
                  Questions Missed
                </span>
                <span className="font-mono text-2xl font-bold text-red-600 dark:text-red-400 mt-1 block">
                  {activeQuiz.totalQuestions - activeQuiz.score}
                </span>
                <span className="text-[11px] text-[#687D72] dark:text-[#6E8578]">
                  Added to review
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold shadow-xs"
              >
                Back to Exam Center
              </button>
            </div>
          </div>

          {/* List of Questions with Worked Explanations & Tutor Handoff */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#142E22] dark:text-[#F6F3EE]">
              Detailed Question Breakdown & Worked Steps
            </h3>

            {activeQuiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-6 rounded-xl border paper-shadow-sm space-y-4 ${
                  q.isCorrect
                    ? 'bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436]'
                    : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                }`}
              >
                <div className="flex items-center justify-between border-b border-[#E8E1D3] dark:border-[#234436] pb-2.5">
                  <div className="flex items-center gap-2">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    )}
                    <span className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE]">
                      Question {idx + 1} · {q.type.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateToTutor?.(q.topic)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs font-semibold text-[#1B4332] dark:text-[#E0A844] hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Revise This Topic in Tutor</span>
                  </button>
                </div>

                <div className="text-sm font-medium text-[#142E22] dark:text-[#F6F3EE]">
                  <MarkdownView content={q.question} />
                </div>

                {/* Concept Tested Line */}
                <div className="p-3 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs">
                  <span className="font-semibold text-[#C67D0A] dark:text-[#E0A844] block mb-0.5">
                    Concept Evaluated: {q.conceptTested}
                  </span>
                  <MarkdownView content={q.explanation} />
                </div>

                {q.whyOtherOptionsWrong && (
                  <div className="text-xs text-[#405449] dark:text-[#AEC1B6] italic">
                    <span className="font-semibold not-italic text-[#687D72] dark:text-[#6E8578]">Why other options are wrong: </span>
                    {q.whyOtherOptionsWrong}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ====================================================================
           ACTIVE QUIZ QUESTION VIEW
           ==================================================================== */
        currentQ && (
          <div className="space-y-5">
            {/* Progress Bar & Actions */}
            <div className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#C67D0A] dark:text-[#E0A844]">
                  Question {currentIdx + 1} of {activeQuiz.totalQuestions}
                </span>
                <span className="text-[#687D72] dark:text-[#6E8578] mx-2">·</span>
                <span className="text-xs text-[#687D72] dark:text-[#AEC1B6] capitalize">
                  {currentQ.type.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Bookmark */}
                <button
                  onClick={() => handleToggleBookmark(currentQ)}
                  title="Bookmark question for review"
                  className={`p-2 rounded-lg border transition-colors ${
                    currentQ.isBookmarked
                      ? 'bg-[#FDF4E5] border-[#E8D4B0] text-[#C67D0A]'
                      : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#687D72]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>

                {/* Flag */}
                <button
                  onClick={() => handleFlagQuestion(currentQ)}
                  title="Report error in this question"
                  className={`p-2 rounded-lg border transition-colors ${
                    currentQ.isFlagged
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#687D72]'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-6 sm:p-8 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-6">
              <div className="text-sm sm:text-base font-medium text-[#142E22] dark:text-[#F6F3EE] leading-relaxed">
                <MarkdownView content={currentQ.question} />
              </div>

              {/* 1. Multiple Choice or True/False */}
              {(currentQ.type === 'multiple_choice' || currentQ.type === 'true_false') && currentQ.options && (
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userSelectedIndex === optIdx;
                    const isCorrectOpt = optIdx === currentQ.correctAnswerIndex;

                    let optStyle = 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#142E22] dark:text-[#F6F3EE] hover:border-[#1B4332]/40';
                    if (showImmediateFeedback) {
                      if (isCorrectOpt) {
                        optStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (isSelected && !isCorrectOpt) {
                        optStyle = 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200';
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-[#1B4332] dark:bg-[#2D6A4F] border-[#1B4332] text-white font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={showImmediateFeedback}
                        onClick={() => setUserSelectedIndex(optIdx)}
                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${optStyle} tap-target-base`}
                      >
                        <span className="font-mono text-xs font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <div className="flex-1">
                          <MarkdownView content={opt} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Multi-Select */}
              {currentQ.type === 'multi_select' && currentQ.options && (
                <div className="space-y-2.5">
                  <span className="text-xs text-[#687D72] dark:text-[#6E8578] italic block mb-1">
                    Select all options that apply:
                  </span>
                  {currentQ.options.map((opt, optIdx) => {
                    const isChecked = userSelectedIndices.includes(optIdx);

                    return (
                      <button
                        key={optIdx}
                        disabled={showImmediateFeedback}
                        onClick={() => {
                          if (isChecked) {
                            setUserSelectedIndices(userSelectedIndices.filter((i) => i !== optIdx));
                          } else {
                            setUserSelectedIndices([...userSelectedIndices, optIdx]);
                          }
                        }}
                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-[#1B4332] dark:bg-[#2D6A4F] border-[#1B4332] text-white font-semibold'
                            : 'bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#142E22] dark:text-[#F6F3EE]'
                        } tap-target-base`}
                      >
                        <span className="w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 border-current">
                          {isChecked && <span className="w-2 h-2 rounded-xs bg-current" />}
                        </span>
                        <div className="flex-1">
                          <MarkdownView content={opt} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. Fill in the Blank */}
              {currentQ.type === 'fill_blank' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE]">
                    Type Your Exact Answer:
                  </label>
                  <input
                    type="text"
                    disabled={showImmediateFeedback}
                    value={userTextAnswer}
                    onChange={(e) => setUserTextAnswer(e.target.value)}
                    placeholder="Enter mathematical expression, variable, or term..."
                    className="w-full px-4 py-3 rounded-xl border bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-sm text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#2D6A4F]"
                  />
                </div>
              )}

              {/* 4. Numeric Calculation with Tolerance */}
              {currentQ.type === 'numeric_calc' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE]">
                    Calculated Numeric Value {currentQ.unit && `(${currentQ.unit})`}:
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      step="any"
                      disabled={showImmediateFeedback}
                      value={userNumericAnswer}
                      onChange={(e) => setUserNumericAnswer(e.target.value)}
                      placeholder="e.g. 24.5"
                      className="w-full px-4 py-3 rounded-xl border bg-[#FAF6EE] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-sm font-mono text-[#142E22] dark:text-[#F6F3EE]"
                    />
                    {currentQ.unit && (
                      <span className="font-mono text-xs text-[#687D72] dark:text-[#6E8578] font-bold">
                        {currentQ.unit}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Worked Explanation & Simpler Analogy in Practice Mode */}
              {showImmediateFeedback && (
                <div className="pt-4 border-t border-[#E8E1D3] dark:border-[#234436] space-y-3">
                  <div className="p-4 rounded-xl bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-[#142E22] dark:text-[#F6F3EE]">
                        Step-by-Step Worked Solution
                      </span>
                      <span className="text-[11px] font-mono text-[#C67D0A] dark:text-[#E0A844]">
                        {currentQ.conceptTested}
                      </span>
                    </div>
                    <MarkdownView content={currentQ.explanation} />
                    {currentQ.whyOtherOptionsWrong && (
                      <p className="text-xs text-[#405449] dark:text-[#AEC1B6] italic pt-1">
                        <strong>Why other choices fail: </strong>{currentQ.whyOtherOptionsWrong}
                      </p>
                    )}
                  </div>

                  {/* Explain It Again More Simply Button */}
                  <div>
                    {!currentQ.simplerExplanation ? (
                      <button
                        onClick={() => handleExplainSimpler(currentQ)}
                        disabled={simplerExplaining}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FDF4E5] dark:bg-[#1D2B20] border border-[#E8D4B0] dark:border-[#325C4B] text-xs font-semibold text-[#C67D0A] dark:text-[#E0A844]"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{simplerExplaining ? 'Formulating everyday analogy...' : 'Explain it again more simply'}</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#FDF4E5] dark:bg-[#1D2B20] border border-[#E8D4B0] dark:border-[#325C4B] text-xs space-y-1">
                        <span className="font-serif font-bold text-[#C67D0A] dark:text-[#E0A844] block">
                          Everyday Intuition & Analogy:
                        </span>
                        <p className="text-[#142E22] dark:text-[#F6F3EE] leading-relaxed">
                          {currentQ.simplerExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#687D72] dark:text-[#6E8578]">
                {isPracticeMode
                  ? showImmediateFeedback
                    ? 'Review solution then click Next'
                    : 'Submit your answer to see the derivation'
                  : 'Exam simulation active (solutions shown at end)'}
              </span>

              <div className="flex items-center gap-2">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    className="px-6 py-2.5 rounded-xl bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold shadow-xs transition-colors tap-target-base"
                  >
                    <span>{isPracticeMode ? 'Check Answer' : 'Record Answer'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 tap-target-base"
                  >
                    <span>{currentIdx < activeQuiz.questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#DDA15E]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
