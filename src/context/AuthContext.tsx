/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { firestoreService, UserProfileData } from '../services/firestoreService';

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
  recordDailyActivity: (topicMastered?: string, skillEarned?: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  isAdmin: boolean;
}

function calculateStreak(
  lastActiveDate?: string,
  currentStreak: number = 1
): { streak: number; lastActiveDate: string; needsUpdate: boolean } {
  const today = new Date().toISOString().split('T')[0];
  if (!lastActiveDate) {
    return { streak: 1, lastActiveDate: today, needsUpdate: true };
  }
  if (lastActiveDate === today) {
    return { streak: Math.max(1, currentStreak), lastActiveDate: today, needsUpdate: false };
  }

  const last = new Date(`${lastActiveDate}T00:00:00Z`);
  const now = new Date(`${today}T00:00:00Z`);
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Yesterday was active: increment
    return { streak: (currentStreak || 0) + 1, lastActiveDate: today, needsUpdate: true };
  } else if (diffDays > 1) {
    // Missed at least one full day: reset streak to 1
    return { streak: 1, lastActiveDate: today, needsUpdate: true };
  }
  return { streak: Math.max(1, currentStreak), lastActiveDate: today, needsUpdate: false };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes and attach real-time profile listener
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (user) {
        try {
          let profile = await firestoreService.getUserProfile(user.uid);
          const today = new Date().toISOString().split('T')[0];

          if (!profile) {
            // New user initial profile skeleton
            profile = {
              id: user.uid,
              email: user.email || '',
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
              topicsMastered: [],
              skillsEarned: [],
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            await firestoreService.saveUserProfile(profile);
          } else {
            // Check & calculate daily study streak
            const streakInfo = calculateStreak(profile.lastActiveDate, profile.studyStreakDays);
            if (streakInfo.needsUpdate) {
              profile = {
                ...profile,
                studyStreakDays: streakInfo.streak,
                lastActiveDate: streakInfo.lastActiveDate
              };
              await firestoreService.saveUserProfile(profile);
            }
          }

          setUserProfile(profile);

          // Subscribe in real-time to profile doc so streak & records update instantaneously
          unsubProfile = firestoreService.subscribeToUserProfile(user.uid, (latest) => {
            setUserProfile(latest);
          });
        } catch (e) {
          console.error('Error fetching/subscribing user profile:', e);
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
    await signInWithPopup(auth, provider);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await sendEmailVerification(cred.user);
      const newProfile: UserProfileData = {
        id: cred.user.uid,
        email,
        displayName: name,
        university: '',
        department: '',
        level: '300L',
        courses: [],
        onboardingCompleted: false,
        lowDataMode: false,
        theme: 'dark',
        studyStreakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        topicsMastered: [],
        skillsEarned: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await firestoreService.saveUserProfile(newProfile);
      setUserProfile(newProfile);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    // 1. Delete Firestore user document
    await firestoreService.deleteUserAccountData(uid);
    // 2. Delete auth user
    await firebaseDeleteUser(currentUser);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const updateProfileData = async (data: Partial<UserProfileData>) => {
    if (!userProfile || !currentUser) return;
    const updated = { ...userProfile, ...data, updatedAt: Date.now() };
    setUserProfile(updated);
    await firestoreService.saveUserProfile(updated);
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const p = await firestoreService.getUserProfile(currentUser.uid);
    if (p) setUserProfile(p);
  };

  const recordDailyActivity = async (topicMastered?: string, skillEarned?: string) => {
    if (!currentUser) return;
    try {
      await firestoreService.recordStudyStreak(currentUser.uid, topicMastered, skillEarned);
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
