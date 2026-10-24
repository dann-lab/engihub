/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub CBT Practice Engine
 * Nigerian university standard exam simulation.
 * Instant worked solutions after every answer and automated weak topics logging.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { callNetlifyAI, FALLBACK_AI_ERROR } from '../../services/apiClient';
import { CBTQuestion, CBTQuiz, DifficultyLevel, WeakTopic } from '../../types';
import { MarkdownView } from '../MarkdownView';
import { Skeleton } from '../common/Skeleton';
import {
  CheckSquare,
  Timer,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface CBTEngineProps {
  initialTopic?: string;
  notesContext?: string;
}

const PRESET_TOPICS = [
  'First Law of Thermodynamics & Heat Engines',
  'Bernoulli Sizing & Pipe Friction Losses',
  'Second-Order Differential Equations with Constant Coefficients',
  'Iron-Carbon Diagram & Heat Treatment Transformations',
  'Thevenin & Norton Equivalent Circuit Sizing',
  'Mohr\'s Circle & Principal Stress Tensors',
  'Laplace Transforms in Electrical Circuit Analysis',
  'Lathe Cutting Power & Tool Life Equations'
];

export const CBTEngine: React.FC<CBTEngineProps> = ({ initialTopic, notesContext }) => {
  const { currentUser, userProfile } = useAuth();
  const [topic, setTopic] = useState(initialTopic || PRESET_TOPICS[0]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('exam-level');
  const [questionCount, setQuestionCount] = useState(5);
  const [timerEnabled, setTimerEnabled] = useState(true);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<CBTQuiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Weak topics
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [showWeakDashboard, setShowWeakDashboard] = useState(false);

  useEffect(() => {
    if (currentUser) {
      firestoreService.getWeakTopics(currentUser.uid).then(setWeakTopics).catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerEnabled) {
      interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerEnabled]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = async () => {
    if (!topic.trim() || !currentUser) return;
    setIsLoading(true);
    setError('');
    setElapsedSeconds(0);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);

    try {
      const data = await callNetlifyAI<{ questions: CBTQuestion[] }>({
        module: 'cbt',
        topic,
        difficulty,
        questionCount,
        notesContent: notesContext || '',
        lowDataMode: userProfile?.lowDataMode || false
      });

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions returned by assessment generator.');
      }

      const newQuiz: CBTQuiz = {
        id: `quiz_${Date.now()}`,
        topic,
        difficulty,
        questions: data.questions.map((q, i) => ({
          ...q,
          id: `q_${i}_${Date.now()}`,
          isAnswered: false
        })),
        score: 0,
        totalQuestions: data.questions.length,
        durationSeconds: 0
      };

      setActiveQuiz(newQuiz);
      setTimerActive(true);
    } catch (err: any) {
      console.error('CBT quiz generation error:', err);
      setError(FALLBACK_AI_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !activeQuiz || !currentUser) return;

    const currentQ = activeQuiz.questions[currentIdx];
    const isCorrect = selectedAnswer === currentQ.correctAnswerIndex;

    const updatedQuestions = [...activeQuiz.questions];
    updatedQuestions[currentIdx] = {
      ...currentQ,
      userSelectedIndex: selectedAnswer,
      isAnswered: true
    };

    const newScore = isCorrect ? activeQuiz.score + 1 : activeQuiz.score;
    const updatedQuiz = {
      ...activeQuiz,
      questions: updatedQuestions,
      score: newScore
    };

    setActiveQuiz(updatedQuiz);
    setIsAnswerSubmitted(true);

    if (!isCorrect) {
      await firestoreService.recordWeakTopic(
        currentUser.uid,
        currentQ.topic || activeQuiz.topic,
        currentQ.subtopic || 'General Principle',
        `Review calculation methodology for: ${currentQ.topic}`
      );
      const refreshed = await firestoreService.getWeakTopics(currentUser.uid);
      setWeakTopics(refreshed);
    }
  };

  const handleNextQuestion = async () => {
    if (!activeQuiz || !currentUser) return;

    if (currentIdx < activeQuiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setTimerActive(false);
      const finished: CBTQuiz = {
        ...activeQuiz,
        durationSeconds: elapsedSeconds,
        completedAt: Date.now()
      };
      setActiveQuiz(finished);
      await firestoreService.saveCBTQuiz(currentUser.uid, finished);
    }
  };

  const currentQ = activeQuiz?.questions[currentIdx];
  const isFinished = activeQuiz && activeQuiz.completedAt;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="border-b border-[#2C3038] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#EA580C] font-semibold block mb-1">
            Module 02 // Assessment Engine
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F4]">
            CBT Practice Engine
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Immediate worked solutions after each question. Automatic weak topics logging.
          </p>
        </div>

        <button
          onClick={() => setShowWeakDashboard(!showWeakDashboard)}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-mono border transition-colors self-start sm:self-auto ${
            showWeakDashboard
              ? 'bg-[#431407] text-[#EA580C] border-[#EA580C]'
              : 'bg-[#181A1F] text-[#A8A29E] border-[#2C3038] hover:text-[#F5F5F4]'
          }`}
        >
          Weak Topics ({weakTopics.filter((w) => w.incorrectCount > 0).length})
        </button>
      </div>

      {/* Weak Topics Drawer */}
      {showWeakDashboard && (
        <div className="p-5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2C3038] pb-2">
            <span className="font-mono text-xs font-semibold text-[#EA580C] uppercase">
              Weak Topics & Suggested Revision
            </span>
            <span className="text-[10px] font-mono text-[#78716C]">
              Diagnosed from your quiz errors
            </span>
          </div>

          {weakTopics.filter((w) => w.incorrectCount > 0).length === 0 ? (
            <p className="text-xs text-[#78716C] py-4 text-center">
              No recorded weak topics yet. Complete a practice drill to diagnose areas needing revision.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {weakTopics
                .filter((w) => w.incorrectCount > 0)
                .map((wt, i) => (
                  <div key={i} className="p-3.5 rounded-[3px] bg-[#121316] border border-[#2C3038] space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-[#EA580C] font-semibold">{wt.incorrectCount} mistakes</span>
                      <span className="text-[#78716C]">{new Date(wt.lastMissedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#F5F5F4]">{wt.topic}</h4>
                    <p className="text-[11px] text-[#A8A29E]">{wt.subtopic}</p>
                    <p className="text-[11px] font-mono text-emerald-400 p-2 rounded-[2px] bg-[#181A1F] border border-[#2C3038]">
                      {wt.suggestedRevision}
                    </p>
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          setTopic(wt.topic);
                          setShowWeakDashboard(false);
                          handleStartQuiz();
                        }}
                        className="text-[10px] font-mono text-[#EA580C] hover:underline"
                      >
                        Retest Topic &rarr;
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Quiz Config */}
      {!activeQuiz ? (
        <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-5">
          <div>
            <span className="text-xs font-mono text-[#EA580C] uppercase font-semibold block mb-1">
              Configure Practice Session
            </span>
            <p className="text-xs text-[#A8A29E]">
              Generates engineering multiple-choice problems with step-by-step calculus and algebraic working.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#A8A29E] mb-2">Preset Topics:</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`text-xs px-3 py-1.5 rounded-[3px] border text-left transition-colors ${
                    topic === t
                      ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                      : 'bg-[#121316] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Topic or Exam Scope:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Otto cycle efficiency, beam shear stress..."
              className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
              >
                <option value="easy">Easy (Definitions & Unit Sizing)</option>
                <option value="exam-level">Exam-Level (Standard Faculty Exam)</option>
                <option value="hard">Hard (Multi-Stage Derivations)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Question Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Exam Timer</label>
              <button
                type="button"
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`w-full py-2 px-3 rounded-[3px] text-xs font-mono border text-center transition-colors ${
                  timerEnabled
                    ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                    : 'bg-[#121316] border-[#2C3038] text-[#78716C]'
                }`}
              >
                {timerEnabled ? 'TIMER ENABLED' : 'TIMER OFF'}
              </button>
            </div>
          </div>

          {notesContext && (
            <div className="p-3 rounded-[3px] bg-[#1F2228] border border-[#EA580C]/40 text-xs text-[#F5F5F4]">
              <span className="font-mono text-[10px] text-[#EA580C] uppercase block mb-0.5">
                Context Attached
              </span>
              Questions will be formulated directly from your uploaded scanned notes.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-[3px] bg-[#450A0A] border border-[#DC2626]/50 text-xs text-[#FCA5A5] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-6 rounded-[3px] bg-[#121316] border border-[#2C3038] space-y-3">
              <span className="text-xs font-mono text-[#EA580C] animate-pulse block">
                Formulating Nigerian university exam questions with worked solutions...
              </span>
              <Skeleton lines={4} />
            </div>
          ) : (
            <button
              onClick={handleStartQuiz}
              disabled={!topic.trim()}
              className="w-full py-2.5 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold tracking-wide transition-colors"
            >
              Start CBT Drill &rarr;
            </button>
          )}
        </div>
      ) : isFinished ? (
        /* Results View */
        <div className="p-6 sm:p-8 rounded-[4px] bg-[#181A1F] border border-[#2C3038] text-center space-y-5">
          <span className="font-mono text-xs uppercase tracking-wider text-[#EA580C] font-semibold block">
            Session Finished
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#F5F5F4]">
            Assessment Performance Summary
          </h2>
          <p className="text-xs text-[#A8A29E]">
            {activeQuiz.topic} • Elapsed: {formatTime(activeQuiz.durationSeconds)}
          </p>

          <div className="inline-block p-4 rounded-[4px] bg-[#121316] border border-[#2C3038]">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-[#EA580C] block">
              {activeQuiz.score} / {activeQuiz.totalQuestions}
            </span>
            <span className="font-mono text-xs text-[#78716C] mt-1 block">
              {Math.round((activeQuiz.score / activeQuiz.totalQuestions) * 100)}% Mastery Score
            </span>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveQuiz(null)}
              className="px-4 py-2 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs font-mono text-[#F5F5F4]"
            >
              Back to Topics
            </button>
            <button
              onClick={handleStartQuiz}
              className="px-4 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold"
            >
              Retake Another Set
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        currentQ && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] flex items-center justify-between">
              <span className="font-mono text-xs text-[#EA580C] font-semibold">
                Question {currentIdx + 1} of {activeQuiz.totalQuestions}
              </span>
              {timerEnabled && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-[#F5F5F4]">
                  <Timer className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-5">
              <div className="text-sm sm:text-base font-medium text-[#F5F5F4] leading-relaxed">
                <MarkdownView content={currentQ.question} />
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedAnswer === idx;
                  const isAnswered = isAnswerSubmitted;
                  const isCorrect = idx === currentQ.correctAnswerIndex;
                  const isUserSelection = isAnswered && currentQ.userSelectedIndex === idx;

                  let border = 'border-[#2C3038] bg-[#121316] text-[#A8A29E]';
                  if (isSelected && !isAnswered) {
                    border = 'border-[#EA580C] bg-[#1F2228] text-[#F5F5F4]';
                  } else if (isAnswered) {
                    if (isCorrect) border = 'border-emerald-600 bg-emerald-950/40 text-emerald-200';
                    else if (isUserSelection && !isCorrect) border = 'border-red-600 bg-red-950/40 text-red-200';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full p-3.5 rounded-[3px] border text-left flex items-start gap-3 transition-colors ${border}`}
                    >
                      <span className="font-mono text-xs font-bold text-[#EA580C] mt-0.5">{letter}.</span>
                      <div className="flex-1 text-xs sm:text-sm">
                        <MarkdownView content={opt} />
                      </div>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isAnswered && isUserSelection && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Instant feedback worked explanation block */}
              {!isAnswerSubmitted ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="px-5 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold tracking-wide disabled:opacity-40 transition-colors"
                  >
                    Submit Choice
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-[3px] bg-[#121316] border border-[#2C3038] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#2C3038] pb-2">
                    <span className="font-mono text-xs font-bold text-[#EA580C]">
                      Worked Mathematical Solution (Option {String.fromCharCode(65 + currentQ.correctAnswerIndex)})
                    </span>
                    <span className="text-[10px] font-mono text-[#78716C]">
                      {selectedAnswer === currentQ.correctAnswerIndex ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </div>

                  <MarkdownView content={currentQ.explanation} />

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold tracking-wide"
                    >
                      <span>{currentIdx < activeQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
