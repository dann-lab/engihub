/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  firestoreService,
  UserProfileData,
  getLocalDateStr,
  getLocalDayDiff
} from '../services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  recordDailyActivity: (topicMastered?: string, skillEarned?: string, incrementSession?: boolean) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  isAdmin: boolean;
}

function calculateStreak(
  lastActiveDate?: string,
  currentStreak: number = 1
): { streak: number; lastActiveDate: string; needsUpdate: boolean; resetTodaySessions: boolean } {
  const today = getLocalDateStr();
  if (!lastActiveDate) {
    return { streak: Math.max(1, currentStreak || 1), lastActiveDate: today, needsUpdate: true, resetTodaySessions: true };
  }
  if (lastActiveDate === today) {
    return { streak: Math.max(1, currentStreak), lastActiveDate: today, needsUpdate: false, resetTodaySessions: false };
  }

  const diffDays = getLocalDayDiff(lastActiveDate, today);

  if (diffDays === 1) {
    // Yesterday was active: increment consecutive daily streak
    return { streak: Math.max(1, currentStreak || 0) + 1, lastActiveDate: today, needsUpdate: true, resetTodaySessions: true };
  } else if (diffDays < 0) {
    // Minor clock offset behind stored date; preserve current streak
    return { streak: Math.max(1, currentStreak), lastActiveDate: today, needsUpdate: false, resetTodaySessions: false };
  } else {
    // Missed at least one full day: reset daily streak to 1
    return { streak: 1, lastActiveDate: today, needsUpdate: true, resetTodaySessions: true };
  }
}

function readCachedProfile(uid: string): UserProfileData | null {
  try {
    const raw = localStorage.getItem(`engihub_profile_${uid}`);
    return raw ? (JSON.parse(raw) as UserProfileData) : null;
  } catch {
    return null;
  }
}

function writeCachedProfile(profile: UserProfileData) {
  try {
    localStorage.setItem(`engihub_profile_${profile.id}`, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    // Handle redirect fallback result if signInWithRedirect was triggered on mobile/popup-blocked browsers
    getRedirectResult(auth).catch((err) => {
      if (err?.code && err.code !== 'auth/no-auth-event') {
        console.warn('Redirect sign-in notice:', err.code, err.message);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (user) {
        const today = getLocalDateStr();
        const cached = readCachedProfile(user.uid);
        if (cached) {
          setUserProfile(cached);
        }

        try {
          let profile = await firestoreService.getUserProfile(user.uid).catch(() => null);

          if (!profile) {
            // Merge any cached onboarding progress if Firestore doc is being initialized
            profile = {
              id: user.uid,
              email: (user.email || cached?.email || '').toLowerCase(),
              displayName: user.displayName || cached?.displayName || 'Engineering Student',
              university: cached?.university || '',
              department: cached?.department || '',
              level: cached?.level || '300L',
              courses: cached?.courses || [],
              onboardingCompleted: cached?.onboardingCompleted ?? false,
              lowDataMode: cached?.lowDataMode ?? false,
              theme: cached?.theme || 'dark',
              studyStreakDays: cached?.studyStreakDays || 1,
              lastActiveDate: today,
              todaySessionsCount: cached?.lastActiveDate === today ? (cached?.todaySessionsCount || 0) : 0,
              totalStudySessions: cached?.totalStudySessions || 0,
              activeStudyDates: cached?.activeStudyDates || [today],
              topicsMastered: cached?.topicsMastered || [],
              skillsEarned: cached?.skillsEarned || [],
              createdAt: cached?.createdAt || Date.now(),
              updatedAt: Date.now()
            };
            await firestoreService.saveUserProfile(profile).catch((e) => {
              console.warn('Initial profile sync notice:', e);
            });
          } else {
            // Preserve higher local streak if offline progress hadn't synced yet
            const baseStreak = Math.max(
              Number(profile.studyStreakDays) || 1,
              cached?.lastActiveDate === profile.lastActiveDate ? (Number(cached?.studyStreakDays) || 1) : 1
            );
            const streakInfo = calculateStreak(profile.lastActiveDate, baseStreak);
            if (streakInfo.needsUpdate || !Array.isArray(profile.activeStudyDates)) {
              const existingDates = Array.isArray(profile.activeStudyDates) ? profile.activeStudyDates : [];
              const nextDates = existingDates.includes(today)
                ? existingDates.slice(-30)
                : [...existingDates, today].slice(-30);

              profile = {
                ...profile,
                studyStreakDays: streakInfo.streak,
                lastActiveDate: streakInfo.lastActiveDate,
                todaySessionsCount: streakInfo.resetTodaySessions ? 0 : (profile.todaySessionsCount || 0),
                totalStudySessions: profile.totalStudySessions || 0,
                activeStudyDates: nextDates,
                topicsMastered: Array.isArray(profile.topicsMastered) ? profile.topicsMastered : [],
                skillsEarned: Array.isArray(profile.skillsEarned) ? profile.skillsEarned : []
              };
              await firestoreService.saveUserProfile(profile).catch((e) => {
                console.warn('Streak sync update notice:', e);
              });
            }
          }

          writeCachedProfile(profile);
          setUserProfile(profile);

          // Real-time listener so streak & mastered topics update instantaneously across tabs
          unsubProfile = firestoreService.subscribeToUserProfile(user.uid, (latest) => {
            const normalized: UserProfileData = {
              ...latest,
              topicsMastered: Array.isArray(latest.topicsMastered) ? latest.topicsMastered : [],
              skillsEarned: Array.isArray(latest.skillsEarned) ? latest.skillsEarned : [],
              studyStreakDays: Math.max(1, Number(latest.studyStreakDays) || 1),
              todaySessionsCount: Number(latest.todaySessionsCount) || 0,
              totalStudySessions: Number(latest.totalStudySessions) || 0,
            };
            writeCachedProfile(normalized);
            setUserProfile(normalized);
          });
        } catch (e) {
          console.error('Error initializing user profile:', e);
          if (!cached) {
            const fallbackProfile: UserProfileData = {
              id: user.uid,
              email: (user.email || '').toLowerCase(),
              displayName: user.displayName || 'Engineering Student',
              university: '',
              department: '',
              level: '300L',
              courses: [],
              onboardingCompleted: false,
              lowDataMode: false,
              theme: 'dark',
              studyStreakDays: 1,
              lastActiveDate: today,
              todaySessionsCount: 0,
              totalStudySessions: 0,
              activeStudyDates: [today],
              topicsMastered: [],
              skillsEarned: [],
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            writeCachedProfile(fallbackProfile);
            setUserProfile(fallbackProfile);
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user) {
      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (e) {
        console.warn('Display name update notice:', e);
      }

      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Email verification send notice (non-blocking):', e);
      }

      const today = getLocalDateStr();
      const newProfile: UserProfileData = {
        id: cred.user.uid,
        email: (cred.user.email || cleanEmail).toLowerCase(),
        displayName: cleanName,
        university: '',
        department: '',
        level: '300L',
        courses: [],
        onboardingCompleted: false,
        lowDataMode: false,
        theme: 'dark',
        studyStreakDays: 1,
        lastActiveDate: today,
        todaySessionsCount: 0,
        totalStudySessions: 0,
        activeStudyDates: [today],
        topicsMastered: [],
        skillsEarned: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      writeCachedProfile(newProfile);
      setUserProfile(newProfile);
      await firestoreService.saveUserProfile(newProfile).catch((e) => {
        console.warn('Profile save notice after signup:', e);
      });
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    await firestoreService.deleteUserAccountData(uid);
    try {
      localStorage.removeItem(`engihub_profile_${uid}`);
    } catch {
      // Ignore
    }
    await firebaseDeleteUser(currentUser);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const updateProfileData = async (data: Partial<UserProfileData>) => {
    if (!userProfile || !currentUser) return;
    const updated = { ...userProfile, ...data, updatedAt: Date.now() };
    writeCachedProfile(updated);
    setUserProfile(updated);
    await firestoreService.saveUserProfile(updated);
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const p = await firestoreService.getUserProfile(currentUser.uid);
    if (p) {
      writeCachedProfile(p);
      setUserProfile(p);
    }
  };

  const recordDailyActivity = async (
    topicMastered?: string,
    skillEarned?: string,
    incrementSession: boolean = true
  ) => {
    if (!currentUser) return;
    try {
      const todayStr = getLocalDateStr();
      setUserProfile((prev) => {
        if (!prev) return prev;
        const streakInfo = calculateStreak(prev.lastActiveDate, prev.studyStreakDays);
        const topics = Array.isArray(prev.topicsMastered) ? prev.topicsMastered : [];
        const skills = Array.isArray(prev.skillsEarned) ? prev.skillsEarned : [];
        const dates = Array.isArray(prev.activeStudyDates) ? prev.activeStudyDates : [];
        const prevToday = prev.lastActiveDate === todayStr ? (Number(prev.todaySessionsCount) || 0) : 0;
        const nextTodaySessions = incrementSession ? prevToday + 1 : prevToday;
        const nextTotalSessions = incrementSession
          ? (Number(prev.totalStudySessions) || 0) + 1
          : (Number(prev.totalStudySessions) || 0);

        const nextProfile: UserProfileData = {
          ...prev,
          studyStreakDays: streakInfo.streak,
          lastActiveDate: todayStr,
          todaySessionsCount: nextTodaySessions,
          totalStudySessions: nextTotalSessions,
          activeStudyDates: dates.includes(todayStr) ? dates.slice(-30) : [...dates, todayStr].slice(-30),
          topicsMastered: topicMastered && !topics.includes(topicMastered) ? [...topics, topicMastered] : topics,
          skillsEarned: skillEarned && !skills.includes(skillEarned) ? [...skills, skillEarned] : skills,
          updatedAt: Date.now()
        };
        writeCachedProfile(nextProfile);
        return nextProfile;
      });

      const synced = await firestoreService.recordStudyStreak(currentUser.uid, topicMastered, skillEarned, incrementSession);
      if (synced) {
        writeCachedProfile(synced);
        setUserProfile(synced);
      }
    } catch (err) {
      console.warn('Failed recording daily activity:', err);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  const ADMIN_EMAILS = ['dannistec3@gmail.com', 'danielolorunlana59@gmail.com'];
  const isAdmin = !!currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase().trim());

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        signOut,
        deleteAccount,
        updateProfileData,
        refreshProfile,
        recordDailyActivity,
        getIdToken,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
