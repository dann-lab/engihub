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
  getIdToken: () => Promise<string | null>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          let profile = await firestoreService.getUserProfile(user.uid);
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
              lastActiveDate: new Date().toISOString().split('T')[0],
              topicsMastered: [],
              skillsEarned: [],
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            await firestoreService.saveUserProfile(profile);
          }
          setUserProfile(profile);
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
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
