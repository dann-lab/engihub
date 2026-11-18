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
  Calendar
} from 'lucide-react';
import { getTimeGreeting, FlameIcon } from '../../utils/personality';
import { motion } from 'motion/react';

interface ProgressDashboardProps {
  onNavigateToModule: (module: NavigationModule) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onNavigateToModule }) => {
  const { userProfile, currentUser, recordDailyActivity } = useAuth();
  const [quizzes, setQuizzes] = useState<CBTQuiz[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [liveStreak, setLiveStreak] = useState<number>(userProfile?.studyStreakDays || 1);
  const [todaySessions, setTodaySessions] = useState<number>(userProfile?.todaySessionsCount || 0);
  const [totalSessions, setTotalSessions] = useState<number>(userProfile?.totalStudySessions || 0);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [checkInLabel, setCheckInLabel] = useState('+1 Session!');

  useEffect(() => {
    if (currentUser) {
      // Sync daily streak check-in on viewing dashboard without inflating completed session count
      recordDailyActivity(undefined, undefined, false).catch(console.error);

      firestoreService.getCBTQuizzes(currentUser.uid).then(setQuizzes).catch(console.error);
      firestoreService.getWeakTopics(currentUser.uid).then(setWeakTopics).catch(console.error);

      // Real-time listener for streak & profile
      const unsub = firestoreService.subscribeToUserProfile(currentUser.uid, (profile) => {
        if (profile?.studyStreakDays) {
          setLiveStreak(profile.studyStreakDays);
        }
        if (typeof profile?.todaySessionsCount === 'number') {
          setTodaySessions(profile.todaySessionsCount);
        }
        if (typeof profile?.totalStudySessions === 'number') {
          setTotalSessions(profile.totalStudySessions);
        }
      });
      return () => unsub();
    }
  }, [currentUser]);

  useEffect(() => {
    if (userProfile?.studyStreakDays) {
      setLiveStreak(userProfile.studyStreakDays);
    }
    if (typeof userProfile?.todaySessionsCount === 'number') {
      setTodaySessions(userProfile.todaySessionsCount);
    }
    if (typeof userProfile?.totalStudySessions === 'number') {
      setTotalSessions(userProfile.totalStudySessions);
    }
  }, [userProfile?.studyStreakDays, userProfile?.todaySessionsCount, userProfile?.totalStudySessions]);

  const handleManualCheckIn = async () => {
    const prevStreak = liveStreak;
    setJustCheckedIn(true);
    await recordDailyActivity(undefined, undefined, true);
    setCheckInLabel((userProfile?.studyStreakDays || liveStreak) > prevStreak ? '+1 Day!' : '+1 Session!');
    setTimeout(() => setJustCheckedIn(false), 3000);
  };

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
        {/* Streak with Flame Animation & Live Session Counter */}
        <motion.div
          whileHover={{ y: -4, scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm hover:border-[#C67D0A] dark:hover:border-[#E0A844] transition-colors relative overflow-hidden group cursor-pointer"
          onClick={handleManualCheckIn}
          title="Click to log a study check-in for today"
        >
          {/* Background flame aura */}
          <motion.div
            animate={{
              opacity: [0.15, 0.35, 0.15],
              scale: [0.95, 1.15, 0.95],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-yellow-500/0 pointer-events-none blur-xl"
          />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#687D72] dark:text-[#6E8578]">
              Study Streak
            </span>
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [-6, 6, -6],
                  y: [0, -2, 0]
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FlameIcon className="w-5 h-5 text-[#C67D0A] dark:text-[#E0A844]" />
              </motion.div>
              {justCheckedIn && (
                <motion.span
                  initial={{ opacity: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: 1, y: -22, scale: 1.05 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 font-mono text-[11px] font-bold text-[#C67D0A] dark:text-[#E0A844] whitespace-nowrap pointer-events-none"
                >
                  {checkInLabel}
                </motion.span>
              )}
            </div>
          </div>

          <div className="relative z-10">
            <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-2 block">
              {liveStreak} <span className="text-xs font-normal text-[#687D72] dark:text-[#6E8578]">days</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-[#405449] dark:text-[#AEC1B6]">
                {justCheckedIn
                  ? 'Study session logged!'
                  : `${todaySessions} today · ${totalSessions} total`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Topics Mastered */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm hover:border-[#1B4332] dark:hover:border-[#52B788] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#687D72] dark:text-[#6E8578]">
              Mastered
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
          </div>
          <span className="font-mono text-2xl font-bold text-[#142E22] dark:text-[#F6F3EE] mt-2 block">
            {userProfile?.topicsMastered.length || 0}
          </span>
          <span className="text-xs text-[#405449] dark:text-[#AEC1B6] mt-0.5 block">
            Derivations mastered
          </span>
        </motion.div>

        {/* CBT Accuracy */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm hover:border-[#C67D0A] dark:hover:border-[#E0A844] transition-colors"
        >
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
        </motion.div>

        {/* Weak Areas */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm hover:border-red-400 transition-colors"
        >
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
        </motion.div>
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
