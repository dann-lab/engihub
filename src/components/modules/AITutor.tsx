/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub AI Tutor
 * Board-work and textbook derivation presentation.
 * Step-gated instruction from zero, defining every term on first appearance.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { callNetlifyAI, FALLBACK_AI_ERROR } from '../../services/apiClient';
import { TutorSession, TutorStep } from '../../types';
import { MarkdownView } from '../MarkdownView';
import { Skeleton } from '../common/Skeleton';
import {
  BookOpen,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Send,
  AlertCircle
} from 'lucide-react';

const PRESET_COURSES = [
  {
    name: 'Thermodynamics',
    code: 'MEE 301',
    topics: [
      'First Law of Thermodynamics & Closed System Analysis',
      'Carnot Engine Efficiency & Reversibility Limits',
      'Air-Standard Diesel & Otto Cycle Sizing',
      'Entropy Generation in Non-Equilibrium Processes',
      'Rankine Cycle & Steam Superheat Optimization'
    ]
  },
  {
    name: 'Differential Equations',
    code: 'MTH 201',
    topics: [
      'First-Order Exact Equations & Integrating Factors',
      'Second-Order Linear ODEs with Constant Coefficients',
      'Method of Undetermined Coefficients for Mechanical Oscillations',
      'Laplace Transform Sizing for RLC Circuits',
      'Fourier Series Expansions for Periodic Engineering Loads'
    ]
  },
  {
    name: 'Engineering Materials',
    code: 'MEE 205',
    topics: [
      'Iron-Carbon Phase Equilibrium & Eutectoid Invariant Points',
      'Heat Treatment Metallurgy: Quenching, Annealing & Normalizing',
      'Crystal Lattice Dislocation Dynamics & Work Hardening',
      'Electrochemical Corrosion of Reinforced Concrete in Coastal Nigeria'
    ]
  },
  {
    name: 'Fluid Mechanics',
    code: 'CEE / MEE 303',
    topics: [
      'Hydrostatic Pressure & Center of Pressure on Submerged Sluice Gates',
      'Bernoulli Equation & Torricelli Venturi Discharge Sizing',
      'Darcy-Weisbach Head Loss in Water Distribution Networks',
      'Laminar vs Turbulent Flow Transition & Reynolds Boundary Criteria'
    ]
  },
  {
    name: 'Workshop Practice & Metallurgy',
    code: 'MEE 101/201',
    topics: [
      'Lathe Cutting Speed, Feed Rate & Machining Power Calculations',
      'TIG and MMA Shielded Arc Welding Metallurgy',
      'Metrology: Vernier Caliper & Micrometer Error Corrections'
    ]
  }
];

export const AITutor: React.FC = () => {
  const { currentUser, userProfile, updateProfileData } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(PRESET_COURSES[0].name);
  const [topicInput, setTopicInput] = useState(PRESET_COURSES[0].topics[0]);
  const [customQuestion, setCustomQuestion] = useState('');

  // Active Session State
  const [currentSession, setCurrentSession] = useState<TutorSession | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pastSessions, setPastSessions] = useState<TutorSession[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load sessions from Firestore
  useEffect(() => {
    if (currentUser) {
      firestoreService.getTutorSessions(currentUser.uid).then(setPastSessions).catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isStreaming || streamBuffer) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamBuffer, isStreaming, currentSession?.steps]);

  const handleStartSession = async (topicToUse?: string) => {
    const t = topicToUse || topicInput;
    if (!t.trim() || !currentUser) return;

    setErrorMessage('');
    const newSession: TutorSession = {
      id: `tutor_${Date.now()}`,
      course: selectedCourse,
      topic: t,
      steps: [],
      currentStepIndex: 1,
      isCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setCurrentSession(newSession);
    await streamTutorStep(newSession, 1, false);
  };

  const streamTutorStep = async (
    session: TutorSession,
    stepNum: number,
    isLost: boolean,
    studentQ: string = ''
  ) => {
    if (!currentUser) return;
    setIsStreaming(true);
    setStreamBuffer('');
    setErrorMessage('');

    try {
      const data = await callNetlifyAI<{ text?: string; reply?: string }>({
        module: 'tutor',
        course: session.course,
        topic: session.topic,
        stepNumber: stepNum,
        previousSteps: session.steps.map((s) => ({
          stepNumber: s.stepNumber,
          title: s.title,
          summary: s.content.slice(0, 150)
        })),
        isLostAnalogy: isLost,
        studentQuestion: studentQ,
        lowDataMode: userProfile?.lowDataMode || false
      });

      const fullContent = data.text || data.reply || '';
      if (!fullContent) {
        throw new Error(FALLBACK_AI_ERROR);
      }

      const newStep: TutorStep = {
        id: `step_${Date.now()}`,
        stepNumber: stepNum,
        title: isLost ? `Step ${stepNum}: Physical Analogy & Intuition` : `Step ${stepNum}: First Principles & Calculation`,
        content: fullContent,
        isLostAnalogy: isLost,
        timestamp: Date.now()
      };

      const updatedSession: TutorSession = {
        ...session,
        steps: [...session.steps, newStep],
        currentStepIndex: stepNum,
        updatedAt: Date.now()
      };

      setCurrentSession(updatedSession);
      setStreamBuffer('');
      await firestoreService.saveTutorSession(currentUser.uid, updatedSession);

      const refreshed = await firestoreService.getTutorSessions(currentUser.uid);
      setPastSessions(refreshed);
    } catch (err: any) {
      console.error('Tutor step error:', err);
      setErrorMessage(FALLBACK_AI_ERROR);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleNextStep = () => {
    if (!currentSession || isStreaming) return;
    const nextStepNum = currentSession.steps.length + 1;
    streamTutorStep(currentSession, nextStepNum, false);
  };

  const handleImLost = () => {
    if (!currentSession || isStreaming) return;
    const currentStepNum = currentSession.steps.length || 1;
    streamTutorStep(currentSession, currentStepNum, true);
  };

  const handleAskFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !currentSession || isStreaming) return;
    const q = customQuestion;
    setCustomQuestion('');
    streamTutorStep(currentSession, currentSession.steps.length, false, q);
  };

  const handleMarkMastered = async () => {
    if (!currentSession || !userProfile) return;
    if (!userProfile.topicsMastered.includes(currentSession.topic)) {
      await updateProfileData({
        topicsMastered: [...userProfile.topicsMastered, currentSession.topic]
      });
    }
  };

  const isMastered = currentSession && userProfile?.topicsMastered.includes(currentSession.topic);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="border-b border-[#2C3038] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#EA580C] font-semibold block mb-1">
            Module 01 // Board-Work Engine
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F4]">
            AI Engineering Tutor
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Exhaustive, unabbreviated derivations. One baby step at a time.
          </p>
        </div>

        {currentSession && (
          <button
            onClick={() => setCurrentSession(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs font-mono text-[#F5F5F4] hover:border-[#EA580C] transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Change Course</span>
          </button>
        )}
      </div>

      {!currentSession ? (
        /* Setup / Course Selector */
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-5">
            <div>
              <span className="text-xs font-mono text-[#EA580C] uppercase font-semibold block mb-1">
                Select Course
              </span>
              <p className="text-xs text-[#A8A29E]">
                Aligned with Nigerian university engineering faculty benchmarks.
              </p>
            </div>

            {/* Course grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {PRESET_COURSES.map((c) => {
                const isSelected = selectedCourse === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedCourse(c.name);
                      setTopicInput(c.topics[0]);
                    }}
                    className={`p-3 rounded-[3px] text-left border transition-colors ${
                      isSelected
                        ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                        : 'bg-[#121316] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
                    }`}
                  >
                    <span className="block font-mono text-[10px] text-[#EA580C] font-semibold">{c.code}</span>
                    <span className="block text-xs font-semibold mt-0.5 truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Topic choices */}
            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-2">
                Standard Topics in {selectedCourse}:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COURSES.find((c) => c.name === selectedCourse)?.topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopicInput(t)}
                    className={`text-xs px-3 py-1.5 rounded-[3px] border text-left transition-colors ${
                      topicInput === t
                        ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4] font-medium'
                        : 'bg-[#121316] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom topic */}
            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">
                Or Enter Any Specific Engineering Problem / Topic:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g. Sizing a pelton wheel turbine runner, Mohr's circle stress transformation..."
                  className="flex-1 px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
                />
                <button
                  onClick={() => handleStartSession()}
                  disabled={!topicInput.trim() || isStreaming}
                  className="px-4 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold tracking-wide transition-colors disabled:opacity-50"
                >
                  Start From Zero &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div className="p-5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] block">
                Saved Offline Lessons ({pastSessions.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pastSessions.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSession(s)}
                    className="p-3 rounded-[3px] bg-[#121316] border border-[#2C3038] hover:border-[#EA580C] text-left transition-colors flex items-center justify-between"
                  >
                    <div className="truncate mr-2">
                      <span className="text-[10px] font-mono text-[#EA580C] block">{s.course}</span>
                      <span className="text-xs font-semibold text-[#F5F5F4] truncate block">{s.topic}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#78716C] shrink-0">
                      {s.steps.length} steps
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Active Board Session */
        <div className="space-y-6">
          {/* Top metadata strip */}
          <div className="p-3.5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] text-[#EA580C] uppercase block">
                {currentSession.course}
              </span>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#F5F5F4]">
                {currentSession.topic}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkMastered}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-mono border transition-colors ${
                  isMastered
                    ? 'bg-[#1F2228] text-emerald-400 border-emerald-600/50'
                    : 'bg-[#121316] text-[#78716C] border-[#2C3038] hover:text-[#F5F5F4]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
              <span className="px-2 py-1 rounded-[3px] bg-[#121316] border border-[#2C3038] font-mono text-xs text-[#EA580C]">
                Step {currentSession.steps.length}
              </span>
            </div>
          </div>

          {/* Worked Steps Presentation */}
          <div className="space-y-4">
            {currentSession.steps.map((step) => (
              <div
                key={step.id}
                className={`p-5 sm:p-6 rounded-[4px] border ${
                  step.isLostAnalogy
                    ? 'bg-[#1F2228] border-[#EA580C]/40'
                    : 'bg-[#181A1F] border-[#2C3038]'
                }`}
              >
                <div className="border-b border-[#2C3038] pb-3 mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#EA580C]">
                    {step.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#78716C]">
                    {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <MarkdownView content={step.content} />
              </div>
            ))}

            {/* In-flight streaming block */}
            {isStreaming && (
              <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#EA580C]/40 space-y-4">
                <div className="border-b border-[#2C3038] pb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-[#EA580C] animate-pulse">
                    Deriving next step from first principles...
                  </span>
                </div>
                {streamBuffer ? (
                  <MarkdownView content={streamBuffer} />
                ) : (
                  <Skeleton lines={4} />
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-[3px] bg-[#450A0A] border border-[#DC2626]/50 text-xs text-[#FCA5A5] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Next Step / I'm Lost Control Strip */}
          {!isStreaming && currentSession.steps.length > 0 && (
            <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-3 sticky bottom-4 z-20 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#F5F5F4] block">
                    Step {currentSession.steps.length} complete.
                  </span>
                  <span className="text-xs text-[#78716C]">
                    Ready for the next step?
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleImLost}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[3px] bg-[#1F2228] hover:bg-[#282C34] border border-[#2C3038] text-xs font-mono text-[#EA580C] transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>"I'm Lost" (Simpler Analogy)</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold tracking-wide transition-colors"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Follow-up question input */}
              <form onSubmit={handleAskFollowUp} className="flex gap-2 pt-2 border-t border-[#2C3038]">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Ask a specific question about this step..."
                  className="flex-1 px-3 py-1.5 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
                />
                <button
                  type="submit"
                  disabled={!customQuestion.trim()}
                  className="px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs text-[#F5F5F4] hover:border-[#EA580C] disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-[#EA580C]" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
