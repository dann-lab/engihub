/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Progress Dashboard
 * Workspace summary: streaks, CBT mastery rate, solved community designs, and competencies.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { CBTQuiz, NavigationModule, WeakTopic } from '../../types';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="border-b border-[#2C3038] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#EA580C] font-semibold block mb-1">
            Faculty Metrics // Academic Record
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F4]">
            Engineering Workspace Overview
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            {userProfile?.displayName} • {userProfile?.university || 'Nigerian University'} ({userProfile?.level || '300L'})
          </p>
        </div>

        <button
          onClick={() => onNavigateToModule('tutor')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <span>Continue Lesson</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#78716C]">Study Streak</span>
            <Flame className="w-3.5 h-3.5 text-[#F97316] fill-[#F97316]" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#F5F5F4] mt-1.5 block">
            {userProfile?.studyStreakDays || 1} <span className="text-xs text-[#78716C]">days</span>
          </span>
          <span className="text-[10px] text-[#A8A29E]">Active daily study</span>
        </div>

        <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#78716C]">Topics Mastered</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#F5F5F4] mt-1.5 block">
            {userProfile?.topicsMastered.length || 4}
          </span>
          <span className="text-[10px] text-[#A8A29E]">Derivations completed</span>
        </div>

        <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#78716C]">CBT Accuracy</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#EA580C]" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#EA580C] mt-1.5 block">
            {accuracyPct}%
          </span>
          <span className="text-[10px] text-[#A8A29E] font-mono">
            {totalQuestions > 0 ? `${totalCorrect}/${totalQuestions} correct` : 'Baseline diagnostic'}
          </span>
        </div>

        <div className="p-4 rounded-[4px] bg-[#181A1F] border border-[#2C3038]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#78716C]">Weak Areas</span>
            <Layers className="w-3.5 h-3.5 text-[#78716C]" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#F5F5F4] mt-1.5 block">
            {weakTopics.filter((w) => w.incorrectCount > 0).length}
          </span>
          <span className="text-[10px] text-[#A8A29E]">Identified for revision</span>
        </div>
      </div>

      {/* CBT History Section */}
      <div className="p-5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4">
        <div className="flex justify-between items-center border-b border-[#2C3038] pb-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-[#F5F5F4]">
              Recent CBT Examination Sets
            </h3>
            <p className="text-xs text-[#A8A29E]">
              Recorded exam practice scores and timestamps.
            </p>
          </div>
          <button
            onClick={() => onNavigateToModule('cbt')}
            className="text-xs font-mono text-[#EA580C] hover:underline"
          >
            Launch CBT &rarr;
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-[#78716C]">
            No recent CBT sessions on record. Complete an assessment to track your scores.
          </div>
        ) : (
          <div className="divide-y divide-[#2C3038]">
            {quizzes.slice(0, 5).map((q) => (
              <div key={q.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[10px] text-[#78716C] block">
                    {new Date(q.completedAt || 0).toLocaleDateString()} // {q.difficulty}
                  </span>
                  <span className="font-semibold text-[#F5F5F4]">{q.topic}</span>
                </div>
                <div className="font-mono text-right">
                  <span className="font-bold text-[#EA580C]">
                    {q.score}/{q.totalQuestions}
                  </span>
                  <span className="text-[10px] text-[#78716C] block">
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
        <div className="p-5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-3">
          <div className="flex justify-between items-center border-b border-[#2C3038] pb-2">
            <span className="font-mono text-xs font-semibold text-[#EA580C] uppercase">
              Mastered Topics ({userProfile?.topicsMastered.length || 0})
            </span>
            <button
              onClick={() => onNavigateToModule('tutor')}
              className="text-[10px] font-mono text-[#78716C] hover:text-[#F5F5F4]"
            >
              Learn More
            </button>
          </div>

          <div className="space-y-1.5">
            {userProfile?.topicsMastered.map((t, idx) => (
              <div key={idx} className="p-2.5 rounded-[3px] bg-[#121316] border border-[#2C3038] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs text-[#F5F5F4] truncate">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Skills */}
        <div className="p-5 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-3">
          <div className="border-b border-[#2C3038] pb-2">
            <span className="font-mono text-xs font-semibold text-[#EA580C] uppercase">
              Verified Engineering Competencies
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {userProfile?.skillsEarned && userProfile.skillsEarned.length > 0 ? (
              userProfile.skillsEarned.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-[2px] bg-[#121316] border border-[#2C3038] text-[11px] font-mono text-[#F5F5F4]"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#78716C] font-mono">
                Solve problems in the Community Problem Lab to verify practical engineering skills.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
