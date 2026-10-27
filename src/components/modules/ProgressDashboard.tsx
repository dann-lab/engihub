/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Academic Overview (Progress & Student Record)
 * Aesthetic: Warm Nigerian campus study hall.
 * Colors: Deep forest green, cream paper, sunny yellow-gold accent.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { CBTQuiz, NavigationModule, WeakTopic } from '../../types';
import {
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';
import { getTimeGreeting, FlameIcon } from '../../utils/personality';

interface ProgressDashboardProps {
  onNavigateToModule: (module: NavigationModule) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onNavigateToModule }) => {
  const { userProfile, currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState<CBTQuiz[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);

  useEffect(() => {
    if (currentUser) {
      firestoreService.getCBTQuizzes(currentUser.uid).then(setQuizzes).catch(console.error);
      firestoreService.getWeakTopics(currentUser.uid).then(setWeakTopics).catch(console.error);
    }
  }, [currentUser]);

  const totalQuestions = quizzes.reduce((acc, q) => acc + q.totalQuestions, 0);
  const totalCorrect = quizzes.reduce((acc, q) => acc + q.score, 0);
  const accuracyPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 85;

  const greeting = getTimeGreeting(userProfile?.displayName || currentUser?.email || 'Student');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Student Academic Header */}
      <div className="p-6 rounded-xl border transition-colors paper-shadow-sm bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C67D0A] dark:text-[#E0A844]">
                Student Record
              </span>
              <span className="text-[#687D72] dark:text-[#6E8578]">·</span>
              <span className="text-xs text-[#687D72] dark:text-[#AEC1B6]">
                {userProfile?.level || '300L'} {userProfile?.department || 'Engineering'}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#142E22] dark:text-[#F6F3EE]">
              {greeting}
            </h1>
            <p className="text-sm text-[#405449] dark:text-[#AEC1B6] mt-1">
              {userProfile?.university || 'Nigerian University'} · Keeping study consistent one concept at a time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => onNavigateToModule('learn')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B4332] dark:bg-[#2D6A4F] hover:bg-[#143427] dark:hover:bg-[#40916C] text-white text-xs font-semibold shadow-xs transition-colors tap-target-base"
            >
              <BookOpen className="w-4 h-4 text-[#DDA15E]" />
              <span>Continue Learning</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Study Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Streak */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#687D72] dark:text-[#6E8578]">
              Study Streak
            </span>
            <FlameIcon className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844]" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-2 block">
            {userProfile?.studyStreakDays || 1} <span className="text-xs font-normal text-[#687D72] dark:text-[#6E8578]">days</span>
          </span>
          <span className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-0.5 block">
            Active daily study
          </span>
        </div>

        {/* Topics Mastered */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#687D72] dark:text-[#6E8578]">
              Mastered
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-2 block">
            {userProfile?.topicsMastered.length || 4}
          </span>
          <span className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-0.5 block">
            Derivations mastered
          </span>
        </div>

        {/* CBT Accuracy */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#687D72] dark:text-[#6E8578]">
              CBT Accuracy
            </span>
            <TrendingUp className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844]" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#C67D0A] dark:text-[#E0A844] mt-2 block">
            {accuracyPct}%
          </span>
          <span className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-0.5 block font-mono">
            {totalQuestions > 0 ? `${totalCorrect}/${totalQuestions} correct` : 'Baseline diagnostic'}
          </span>
        </div>

        {/* Weak Areas */}
        <div className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#687D72] dark:text-[#6E8578]">
              Needs Review
            </span>
            <Layers className="w-4 h-4 text-[#687D72] dark:text-[#6E8578]" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-2 block">
            {weakTopics.filter((w) => w.incorrectCount > 0).length}
          </span>
          <span className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-0.5 block">
            Questions flagged
          </span>
        </div>
      </div>

      {/* CBT History Section */}
      <div className="p-6 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#E8E1D3] dark:border-[#234436] pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#142E22] dark:text-[#F6F3EE]">
              Recent Examination Sets
            </h3>
            <p className="text-xs text-[#405449] dark:text-[#AEC1B6]">
              Your recorded exam practice scores and timestamps.
            </p>
          </div>
          <button
            onClick={() => onNavigateToModule('practice')}
            className="text-xs font-semibold text-[#1B4332] dark:text-[#E0A844] hover:underline"
          >
            Open Practice &rarr;
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#687D72] dark:text-[#6E8578]">
            No recent CBT sessions on record yet. Complete an exam set to build your history.
          </div>
        ) : (
          <div className="divide-y divide-[#E8E1D3] dark:divide-[#234436]">
            {quizzes.slice(0, 5).map((q) => (
              <div key={q.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[11px] text-[#687D72] dark:text-[#6E8578] block">
                    {new Date(q.completedAt || 0).toLocaleDateString()} · {q.difficulty}
                  </span>
                  <span className="font-semibold text-[#142E22] dark:text-[#F6F3EE] text-sm">
                    {q.topic}
                  </span>
                </div>
                <div className="font-mono text-right">
                  <span className="font-bold text-sm text-[#C67D0A] dark:text-[#E0A844]">
                    {q.score}/{q.totalQuestions}
                  </span>
                  <span className="text-[11px] text-[#687D72] dark:text-[#6E8578] block">
                    {Math.round((q.score / q.totalQuestions) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two columns: Topics Mastered & Verified Competencies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mastered topics */}
        <div className="p-5 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-[#E8E1D3] dark:border-[#234436] pb-2">
            <span className="text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] uppercase tracking-wider">
              Mastered Topics ({userProfile?.topicsMastered.length || 0})
            </span>
            <button
              onClick={() => onNavigateToModule('learn')}
              className="text-xs text-[#1B4332] dark:text-[#E0A844] hover:underline"
            >
              Study more
            </button>
          </div>

          <div className="space-y-2">
            {(userProfile?.topicsMastered && userProfile.topicsMastered.length > 0) ? (
              userProfile.topicsMastered.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border flex items-center gap-2.5 bg-[#F5EFE6] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] shrink-0" />
                  <span className="text-xs text-[#142E22] dark:text-[#F6F3EE] truncate">{t}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#687D72] dark:text-[#6E8578]">
                Work through lessons with the Tutor to mark topics as mastered.
              </p>
            )}
          </div>
        </div>

        {/* Verified Skills */}
        <div className="p-5 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm space-y-3">
          <div className="border-b border-[#E8E1D3] dark:border-[#234436] pb-2">
            <span className="text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE] uppercase tracking-wider">
              Engineering Competencies
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {userProfile?.skillsEarned && userProfile.skillsEarned.length > 0 ? (
              userProfile.skillsEarned.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium bg-[#F5EFE6] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436] text-[#142E22] dark:text-[#F6F3EE]"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#687D72] dark:text-[#6E8578]">
                Complete practical design studies in the Problem Lab to record your verified competencies.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
