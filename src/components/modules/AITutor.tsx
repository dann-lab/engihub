/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub AI Engineering Tutor
 * Step-by-step mathematical derivations and engineering theory.
 * Features:
 * - 10 Core Engineering Course Cards with hand-crafted illustrated covers
 * - Low-data mode optimization
 * - Inline SVG engineering diagrams with labelled components
 * - Mermaid flowchart support
 * - Baby-step progression and "I'm Lost" Nigerian real-life analogies
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
  AlertCircle,
  Lightbulb
} from 'lucide-react';

export const ALL_10_COURSES = [
  {
    name: 'Thermodynamics',
    code: 'MEE 301',
    description: 'Closed systems, Diesel/Otto cycles, second law & entropy.',
    topics: [
      'First Law of Thermodynamics & Closed System Analysis',
      'Carnot Engine Efficiency & Reversibility Limits',
      'Air-Standard Diesel & Otto Cycle Sizing',
      'Entropy Generation in Non-Equilibrium Processes',
      'Rankine Cycle & Steam Superheat Optimization'
    ]
  },
  {
    name: 'Engineering Materials',
    code: 'MEE 205',
    description: 'Phase diagrams, Fe-C equilibrium, heat treatments & corrosion.',
    topics: [
      'Iron-Carbon Phase Equilibrium & Eutectoid Invariant Points',
      'Heat Treatment Metallurgy: Quenching, Annealing & Normalizing',
      'Crystal Lattice Dislocation Dynamics & Work Hardening',
      'Electrochemical Corrosion of Reinforced Concrete in Coastal Nigeria'
    ]
  },
  {
    name: 'Differential Equations',
    code: 'MTH 201',
    description: 'Exact equations, second-order linear ODEs & Laplace transforms.',
    topics: [
      'First-Order Exact Equations & Integrating Factors',
      'Second-Order Linear ODEs with Constant Coefficients',
      'Method of Undetermined Coefficients for Mechanical Oscillations',
      'Laplace Transform Sizing for RLC Circuits',
      'Fourier Series Expansions for Periodic Engineering Loads'
    ]
  },
  {
    name: 'Complex Analysis',
    code: 'MTH 301',
    description: 'Cauchy-Riemann equations, contour integration & residue calculus.',
    topics: [
      'Cauchy-Riemann Equations & Analytic Functions',
      'Cauchy Integral Theorem & Path Independence',
      'Residue Theorem & Evaluating Real Definite Integrals',
      'Conformal Mapping in Fluid Flow & Electrostatics'
    ]
  },
  {
    name: 'Workshop Practice',
    code: 'MEE 101/201',
    description: 'Lathe kinematics, cutting tool geometry, welding & metrology.',
    topics: [
      'Lathe Cutting Speed, Feed Rate & Machining Power Calculations',
      'TIG and MMA Shielded Arc Welding Metallurgy',
      'Metrology: Vernier Caliper & Micrometer Error Corrections',
      'Foundry Sand Casting & Pattern Shrinkage Allowances'
    ]
  },
  {
    name: 'Fluid Mechanics',
    code: 'CEE / MEE 303',
    description: 'Hydrostatics, Bernoulli sizing, pipe network friction & pump head.',
    topics: [
      'Hydrostatic Pressure & Center of Pressure on Submerged Sluice Gates',
      'Bernoulli Equation & Torricelli Venturi Discharge Sizing',
      'Darcy-Weisbach Head Loss in Water Distribution Networks',
      'Laminar vs Turbulent Flow Transition & Reynolds Boundary Criteria'
    ]
  },
  {
    name: 'Circuit Theory',
    code: 'EEE 201 / 301',
    description: 'Thevenin/Norton equivalents, RLC transients, AC power & phasor analysis.',
    topics: [
      'Thevenin and Norton Equivalent Circuit Derivations',
      'Second-Order RLC Transient Response: Damped Oscillations',
      'AC Complex Power, Power Factor Correction & Phasors',
      'Two-Port Network Parameters (Z, Y, ABCD matrices)'
    ]
  },
  {
    name: 'Strength of Materials',
    code: 'MEE / CVE 305',
    description: 'Mohr’s circle, shear force/bending moments & Euler buckling.',
    topics: [
      'Mohr\'s Circle & Principal Stress Tensors in 2D Plane Stress',
      'Shear Force & Bending Moment Equations for Cantilever Beams',
      'Euler Column Buckling Theory & Slenderness Ratio Criteria',
      'Torsion in Thin-Walled Hollow Cylinders & Shaft Power Sizing'
    ]
  },
  {
    name: 'Engineering Drawing',
    code: 'MEE 102 / 202',
    description: 'Orthographic projections, isometric views, sections & tolerances.',
    topics: [
      'First Angle vs Third Angle Orthographic Projections',
      'Isometric and Axonometric Technical Projections',
      'Sectional Views, Hatching Rules & Revolved Sections',
      'Geometric Dimensioning & Tolerancing (GD&T) Standards'
    ]
  },
  {
    name: 'Programming',
    code: 'CSC 201 / EEE 305',
    description: 'Engineering algorithms, numerical methods, arrays & flowcharts.',
    topics: [
      'Newton-Raphson Numerical Root Finding Algorithm',
      'Runge-Kutta 4th Order Numerical Integration for ODEs',
      'Matrix Inversion & Gaussian Elimination in C / Python',
      'Microcontroller Digital I/O & Interrupt Service Routines'
    ]
  }
];

export const AITutor: React.FC = () => {
  const { currentUser, userProfile, updateProfileData } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(ALL_10_COURSES[0].name);
  const [topicInput, setTopicInput] = useState(ALL_10_COURSES[0].topics[0]);
  const [customQuestion, setCustomQuestion] = useState('');

  // Active Session State
  const [currentSession, setCurrentSession] = useState<TutorSession | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pastSessions, setPastSessions] = useState<TutorSession[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const isLowData = Boolean(userProfile?.lowDataMode);

  // Load past sessions from Firestore
  useEffect(() => {
    if (currentUser) {
      firestoreService.getTutorSessions(currentUser.uid).then(setPastSessions).catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isStreaming || currentSession?.steps.length) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isStreaming, currentSession?.steps]);

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
        lowDataMode: isLowData
      });

      const fullContent = data.text || data.reply || '';
      if (!fullContent) {
        throw new Error(FALLBACK_AI_ERROR);
      }

      const newStep: TutorStep = {
        id: `step_${Date.now()}`,
        stepNumber: stepNum,
        title: isLost ? 'Everyday Analogy' : `Step ${stepNum}`,
        content: fullContent,
        isLostAnalogy: isLost,
        timestamp: Date.now()
      };

      const updatedSteps = [...session.steps, newStep];
      const updatedSession: TutorSession = {
        ...session,
        steps: updatedSteps,
        currentStepIndex: isLost ? stepNum : stepNum + 1,
        updatedAt: Date.now()
      };

      setCurrentSession(updatedSession);
      await firestoreService.saveTutorSession(currentUser.uid, updatedSession);

      // Refresh past sessions
      firestoreService.getTutorSessions(currentUser.uid).then(setPastSessions).catch(console.error);
    } catch (err: any) {
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

  const handleLost = () => {
    if (!currentSession || isStreaming) return;
    const currentStepNum = currentSession.steps.length;
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

  const isMastered = Boolean(currentSession && userProfile?.topicsMastered.includes(currentSession.topic));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Module Title */}
      <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C67D0A] dark:text-[#E0A844]">
              Step-by-Step Board
            </span>
            <span className="text-[#687D72] dark:text-[#6E8578]">·</span>
            <span className="text-xs text-[#687D72] dark:text-[#AEC1B6]">
              Nigerian University Benchmarks
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#142E22] dark:text-[#F6F3EE]">
            AI Engineering Tutor
          </h1>
          <p className="text-sm text-[#405449] dark:text-[#AEC1B6] mt-0.5">
            Exhaustive derivations starting from governing equations. Definitions for every term, inline SVG diagrams, and real-life Nigerian analogies.
          </p>
        </div>

        {currentSession && (
          <button
            onClick={() => setCurrentSession(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#F5EFE6] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] hover:border-[#1B4332] dark:hover:border-[#52B788] transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Switch Topic</span>
          </button>
        )}
      </div>

      {!currentSession ? (
        /* Course Selector & 10 Course Cards */
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#142E22] dark:text-[#F6F3EE]">
                Select an Engineering Course
              </h2>
              <p className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-0.5">
                Choose any of the 10 university syllabus courses to explore worked derivations.
              </p>
            </div>

            {/* 10 Course Cards Grid - Clean, Typographic, No Pictures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_10_COURSES.map((c) => {
                const isSelected = selectedCourse === c.name;

                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedCourse(c.name);
                      setTopicInput(c.topics[0]);
                    }}
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between tap-target-base ${
                      isSelected
                        ? 'border-[#1B4332] dark:border-[#E0A844] ring-2 ring-[#1B4332]/20 dark:ring-[#E0A844]/20 shadow-xs bg-[#FAF6EE] dark:bg-[#1A3328]'
                        : 'border-[#E8E1D3] dark:border-[#234436] hover:border-[#1B4332]/40 bg-white dark:bg-[#11221B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#1B4332]/10 dark:bg-[#E0A844]/15 text-[#1B4332] dark:text-[#E0A844]">
                          {c.code}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#1B4332] dark:bg-[#E0A844]" />
                        )}
                      </div>
                      <h3 className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE] mt-2.5">
                        {c.name}
                      </h3>
                      <p className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-1 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E8E1D3]/60 dark:border-[#234436]/60 flex items-center justify-between text-[11px] text-[#687D72] dark:text-[#6E8578]">
                      <span>{c.topics.length} syllabus topics</span>
                      <span className="font-medium text-[#1B4332] dark:text-[#E0A844]">&rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Topic choices */}
            <div className="pt-2 border-t border-[#E8E1D3] dark:border-[#234436]">
              <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-2">
                Standard Topics in {selectedCourse}:
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_10_COURSES.find((c) => c.name === selectedCourse)?.topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopicInput(t)}
                    className={`text-xs px-3.5 py-2 rounded-lg border text-left transition-colors ${
                      topicInput === t
                        ? 'bg-[#1B4332] dark:bg-[#2D6A4F] border-[#1B4332] dark:border-[#2D6A4F] text-white font-semibold'
                        : 'bg-[#F5EFE6] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom problem or topic input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] mb-1.5">
                Or Enter Any Specific Engineering Problem:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g. Sizing a Pelton wheel turbine runner, Mohr's circle plane stress..."
                  className="flex-1 px-4 py-2.5 rounded-lg border bg-white dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-xs text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#2D6A4F]"
                />
                <button
                  onClick={() => handleStartSession()}
                  disabled={!topicInput.trim() || isStreaming}
                  className="px-5 py-2.5 rounded-lg bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 tap-target-base"
                >
                  <span>Start Derivation</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DDA15E]" />
                </button>
              </div>
            </div>
          </div>

          {/* Past Sessions List */}
          <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#687D72] dark:text-[#6E8578] block">
              Saved Lesson History ({pastSessions.length})
            </span>

            {pastSessions.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center">
                <BookOpen className="w-7 h-7 text-[#687D72] dark:text-[#6E8578] mb-2 opacity-50" />
                <p className="text-xs text-[#687D72] dark:text-[#6E8578]">
                  No past derivations on record. Pick a course above to start learning.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pastSessions.slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSession(s)}
                    className="p-3.5 rounded-lg bg-[#F5EFE6] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] hover:border-[#1B4332] dark:hover:border-[#E0A844] text-left transition-colors flex items-center justify-between"
                  >
                    <div className="truncate mr-2">
                      <span className="text-[10px] font-mono text-[#C67D0A] dark:text-[#E0A844] block font-semibold">
                        {s.course}
                      </span>
                      <span className="text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] truncate block">
                        {s.topic}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#687D72] dark:text-[#6E8578] shrink-0">
                      {s.steps.length} steps
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Board Session */
        <div className="space-y-5">
          {/* Active Derivation Header */}
          <div className="p-5 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono text-[#C67D0A] dark:text-[#E0A844] uppercase font-semibold">
                {currentSession.course} · Derivation Board
              </span>
              <h2 className="font-serif text-xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-0.5">
                {currentSession.topic}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkMastered}
                disabled={isMastered}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isMastered
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-[#F5EFE6] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
              </button>
            </div>
          </div>

          {/* Derivation Steps Flow */}
          <div className="space-y-4">
            {currentSession.steps.map((step) => (
              <div
                key={step.id}
                className={`p-6 rounded-xl border paper-shadow-sm transition-colors ${
                  step.isLostAnalogy
                    ? 'bg-[#FDF4E5] dark:bg-[#1D2B20] border-[#E8D4B0] dark:border-[#325C4B]'
                    : 'bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436]'
                }`}
              >
                <div className="flex items-center justify-between border-b border-[#E8E1D3] dark:border-[#234436] pb-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    {step.isLostAnalogy ? (
                      <Lightbulb className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#1B4332] dark:bg-[#52B788]" />
                    )}
                    <span className="font-serif text-sm font-bold text-[#142E22] dark:text-[#F6F3EE]">
                      {step.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#687D72] dark:text-[#6E8578]">
                    {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <MarkdownView content={step.content} />
              </div>
            ))}

            {isStreaming && (
              <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-3">
                <span className="font-mono text-xs text-[#C67D0A] dark:text-[#E0A844] font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C67D0A] animate-ping" />
                  Deriving next step from first principles...
                </span>
                <Skeleton lines={4} />
              </div>
            )}

            {errorMessage && (
              <div className="p-5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto opacity-70" />
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                  {errorMessage}
                </p>
                <button
                  onClick={handleNextStep}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold"
                >
                  Try Again
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Baby Step Progression Bar */}
          {!isStreaming && currentSession.steps.length > 0 && (
            <div className="p-5 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#405449] dark:text-[#AEC1B6]">
                Understood the physics so far? Continue to the next substitution or ask for an analogy.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleLost}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#F5EFE6] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] text-xs font-medium text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE] transition-colors tap-target-base flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#C67D0A] dark:text-[#E0A844]" />
                  <span>"I'm Lost" (Simpler Analogy)</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold shadow-xs transition-colors tap-target-base flex items-center justify-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DDA15E]" />
                </button>
              </div>
            </div>
          )}

          {/* Ask Specific Clarification in this Derivation */}
          <form onSubmit={handleAskFollowUp} className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask a specific question about this derivation step..."
              disabled={isStreaming}
              className="flex-1 px-4 py-2.5 rounded-lg border bg-white dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-xs text-[#142E22] dark:text-[#F6F3EE] focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#2D6A4F]"
            />
            <button
              type="submit"
              disabled={isStreaming || !customQuestion.trim()}
              className="px-4 py-2.5 rounded-lg bg-[#1B4332] dark:bg-[#2D6A4F] text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
