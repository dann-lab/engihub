/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot
} from 'firebase/firestore';
import DOMPurify from 'dompurify';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import {
  AppSettings,
  CBTQuiz,
  ChatSession,
  CommunityProblemSolution,
  PortfolioCaseStudy,
  ScannedNoteRecord,
  SpacedRepetitionItem,
  SupportMessage,
  TutorSession,
  UserProgress,
  WeakTopic
} from '../types';

export interface UserProfileData {
  id: string;
  email: string;
  displayName: string;
  university: string;
  department: string;
  level: string;
  courses: string[];
  onboardingCompleted: boolean;
  lowDataMode: boolean;
  theme: 'light' | 'dark';
  studyStreakDays: number;
  lastActiveDate: string;
  topicsMastered: string[];
  skillsEarned: string[];
  createdAt: number;
  updatedAt: number;
}

// Seed solutions for the community library if empty
const SEED_LIBRARY_SOLUTIONS: Omit<CommunityProblemSolution, 'id'>[] = [
  {
    authorName: 'Engr. D. Olorunlana',
    authorUniversity: 'FUTA, Akure',
    problemTitle: 'DC-Bus Solar Micro-Distribution for Student Study Pods',
    localContext: 'Hostels along FUTA South Gate experience 16-hour daily load shedding, forcing generator usage costing ₦1,200/litre.',
    stateOrRegion: 'Ondo State (Akure)',
    breakdown: 'Overloaded 33kV distribution feeder with high generator emissions and voltage fluctuations destroying laptops.',
    rootCauses: ['Feeder overloading', 'High petrol tariff', 'Inverter DC-AC conversion losses (15-20%)'],
    solutionOptions: [
      {
        title: 'Central 12V/24V DC-Bus Solar Array with LiFePO4 Chemistry',
        type: 'DC Microgrid',
        description: 'Direct DC-to-DC distribution for LED lighting and USB-C laptop charging eliminating inverter losses.',
        pros: ['92% roundtrip efficiency', 'Zero inverter failure points', 'Safe low voltage'],
        cons: ['Dedicated DC conduit runs']
      },
      {
        title: 'Split AC 1.5kVA Hybrid Station with Token Metering',
        type: 'AC Sub-distribution',
        description: 'Shared AC inverter station with mechanical timer sockets.',
        pros: ['Standard plugs'],
        cons: ['High idle consumption']
      },
      {
        title: 'Solid-State Battery Cart with Fast Grid Ingestion',
        type: 'Mobile Storage',
        description: '2-hour fast-charge battery cart utilizing brief grid supply.',
        pros: ['Portable'],
        cons: ['High battery thermal stress']
      }
    ],
    selectedSolutionTitle: 'Central 12V/24V DC-Bus Solar Array with LiFePO4 Chemistry',
    governingFormulas: '$$E_{daily} = \\sum (P_i \\times t_i) = 1.25 \\times E_{load}$$\n$$P_{pv} = \\frac{E_{daily}}{PSH \\times \\eta_{sys}} = \\frac{1500\\text{ Wh}}{4.8\\text{ hrs} \\times 0.82} \\approx 380\\text{ Wp}$$',
    sampleCalculations: 'For 10 student study pods: 5W LED + 45W USB-PD laptop = 50W per desk. Sized with 2x 200W Monocrystalline PV panels and 1x 12.8V 100Ah LiFePO4 battery pack.',
    materialsList: [
      '2x 200W Mono PV Panels',
      '1x 12.8V 100Ah LiFePO4 Battery with BMS',
      '1x 30A MPPT Solar Charge Controller',
      '10x 65W USB-C PD DC Buck Regulators',
      '32A 2P DC Breaker & Surge Arrester'
    ],
    bemeEstimate: [
      { item: '200W Mono Panels (Pair)', quantity: '2 pcs', unitRateNaira: 58000, totalNaira: 116000, localSource: 'Alaba Intl Market, Lagos' },
      { item: '12.8V 100Ah LiFePO4 Battery Pack', quantity: '1 unit', unitRateNaira: 195000, totalNaira: 195000, localSource: 'Ladipo Electrical' },
      { item: '30A MPPT Charge Controller', quantity: '1 unit', unitRateNaira: 32000, totalNaira: 32000, localSource: 'Electronic Dealer' },
      { item: 'DC Breakers, Conduit & 2.5mm² wire', quantity: '1 lot', unitRateNaira: 28000, totalNaira: 28000, localSource: 'Local Hardware' },
      { item: 'USB-C Step-down modules', quantity: '10 units', unitRateNaira: 3500, totalNaira: 35000, localSource: 'Component Importer' }
    ],
    totalEstimatedCostNaira: 406000,
    safetyAlerts: [
      'CRITICAL SAFETY WARNING: High short-circuit current of lithium batteries can melt metal tools instantly. Install Class-T DC fuses directly on the positive terminal.',
      'Earth ground the solar panel frames with 16mm² copper rod for lightning protection during tropical rainfall.'
    ],
    feasibility: { costScore: 82, difficultyScore: 85, impactScore: 95, sustainability: 92, overallScore: 88 },
    buildPlanSteps: [
      'Fabricate galvanized angle-iron roof mounts tilted at 15° true South.',
      'Run double-insulated 4mm² solar cable through conduit into battery control box.',
      'Wire MPPT controller, DC breaker, and fuse block.',
      'Distribute 12V trunk line and calibrate buck regulators to 20V/3.25A for USB-PD.',
      'Execute continuous 6-hour thermal load test with 5 connected laptops.'
    ],
    createdAt: Date.now() - 86400000 * 2,
    upvotes: 24,
    upvoters: [],
    authorId: 'system_seed_1',
    isPublishedToLibrary: true
  }
];

class FirestoreService {
  // 1. User Profile Management
  async getUserProfile(userId: string): Promise<UserProfileData | null> {
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (!snap.exists()) return null;
      return snap.data() as UserProfileData;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  subscribeToUserProfile(userId: string, onUpdate: (profile: UserProfileData) => void): () => void {
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as UserProfileData);
        }
      },
      (error) => {
        console.warn('Realtime user profile subscription warning:', error?.message || error);
      }
    );
  }

  async saveUserProfile(profile: UserProfileData): Promise<void> {
    const path = `users/${profile.id}`;
    try {
      const sanitized: UserProfileData = {
        ...profile,
        displayName: DOMPurify.sanitize(profile.displayName || ''),
        university: DOMPurify.sanitize(profile.university || ''),
        department: DOMPurify.sanitize(profile.department || ''),
        level: DOMPurify.sanitize(profile.level || ''),
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'users', profile.id), sanitized, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async recordStudyStreak(userId: string, topicMastered?: string, skillEarned?: string): Promise<UserProfileData | null> {
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (!snap.exists()) return null;
      const current = snap.data() as UserProfileData;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const lastActive = current.lastActiveDate || '';

      let newStreak = current.studyStreakDays || 1;

      if (lastActive === todayStr) {
        // Already logged activity today, maintain current streak
      } else if (lastActive) {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
          newStreak = (current.studyStreakDays || 0) + 1;
        } else {
          // Break in daily streak
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const topics = current.topicsMastered || [];
      const updatedTopics = topicMastered && !topics.includes(topicMastered)
        ? [...topics, topicMastered]
        : topics;

      const skills = current.skillsEarned || [];
      const updatedSkills = skillEarned && !skills.includes(skillEarned)
        ? [...skills, skillEarned]
        : skills;

      const updated: Partial<UserProfileData> = {
        studyStreakDays: newStreak,
        lastActiveDate: todayStr,
        topicsMastered: updatedTopics,
        skillsEarned: updatedSkills,
        updatedAt: Date.now()
      };

      await updateDoc(doc(db, 'users', userId), updated);
      return { ...current, ...updated } as UserProfileData;
    } catch (err) {
      console.warn('Error recording study streak in Firestore:', err);
      return null;
    }
  }

  async deleteUserAccountData(userId: string): Promise<void> {
    const path = `users/${userId}`;
    try {
      // Delete user document
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  // 2. Tutor Sessions (Private Subcollection: /users/{uid}/tutor_sessions)
  async getTutorSessions(userId: string): Promise<TutorSession[]> {
    const path = `users/${userId}/tutor_sessions`;
    try {
      const q = query(collection(db, 'users', userId, 'tutor_sessions'), orderBy('updatedAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as TutorSession);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async saveTutorSession(userId: string, session: TutorSession): Promise<void> {
    const path = `users/${userId}/tutor_sessions/${session.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'tutor_sessions', session.id), session, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // 3. CBT Quizzes (Private Subcollection: /users/{uid}/cbt_quizzes)
  async getCBTQuizzes(userId: string): Promise<CBTQuiz[]> {
    const path = `users/${userId}/cbt_quizzes`;
    try {
      const q = query(collection(db, 'users', userId, 'cbt_quizzes'), orderBy('completedAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as CBTQuiz);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async saveCBTQuiz(userId: string, quiz: CBTQuiz): Promise<void> {
    const path = `users/${userId}/cbt_quizzes/${quiz.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'cbt_quizzes', quiz.id), quiz);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // 4. Weak Topics (Private Subcollection: /users/{uid}/weak_topics)
  async getWeakTopics(userId: string): Promise<WeakTopic[]> {
    const path = `users/${userId}/weak_topics`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'weak_topics'));
      const list = snap.docs.map((d) => d.data() as WeakTopic);
      return list.sort((a, b) => b.incorrectCount - a.incorrectCount);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async recordWeakTopic(userId: string, topic: string, subtopic: string, suggestedRevision: string): Promise<void> {
    const id = `${topic}_${subtopic}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const path = `users/${userId}/weak_topics/${id}`;
    try {
      const ref = doc(db, 'users', userId, 'weak_topics', id);
      const existingSnap = await getDoc(ref);
      if (existingSnap.exists()) {
        const cur = existingSnap.data() as WeakTopic;
        await setDoc(ref, {
          ...cur,
          incorrectCount: cur.incorrectCount + 1,
          totalEncountered: cur.totalEncountered + 1,
          lastMissedAt: Date.now()
        }, { merge: true });
      } else {
        await setDoc(ref, {
          topic,
          subtopic,
          incorrectCount: 1,
          totalEncountered: 1,
          suggestedRevision: DOMPurify.sanitize(suggestedRevision),
          lastMissedAt: Date.now()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async markWeakTopicRevised(userId: string, topic: string, subtopic: string): Promise<void> {
    const id = `${topic}_${subtopic}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const path = `users/${userId}/weak_topics/${id}`;
    try {
      const ref = doc(db, 'users', userId, 'weak_topics', id);
      const existingSnap = await getDoc(ref);
      if (existingSnap.exists()) {
        const cur = existingSnap.data() as WeakTopic;
        await setDoc(ref, {
          ...cur,
          incorrectCount: Math.max(0, cur.incorrectCount - 1)
        }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // 5. Scanned Notes (Private Subcollection: /users/{uid}/scanned_notes)
  async getScannedNotes(userId: string): Promise<ScannedNoteRecord[]> {
    const path = `users/${userId}/scanned_notes`;
    try {
      const q = query(collection(db, 'users', userId, 'scanned_notes'), orderBy('timestamp', 'desc'), limit(25));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as ScannedNoteRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async saveScannedNote(userId: string, note: ScannedNoteRecord): Promise<void> {
    const path = `users/${userId}/scanned_notes/${note.id}`;
    try {
      const sanitized: ScannedNoteRecord = {
        ...note,
        title: DOMPurify.sanitize(note.title),
        extractedText: note.extractedText,
        analysisResult: note.analysisResult
      };
      await setDoc(doc(db, 'users', userId, 'scanned_notes', note.id), sanitized);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async deleteScannedNote(userId: string, noteId: string): Promise<void> {
    const path = `users/${userId}/scanned_notes/${noteId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'scanned_notes', noteId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  // 6. Portfolio Studies (Private Subcollection: /users/{uid}/portfolio)
  async getPortfolioStudies(userId: string): Promise<PortfolioCaseStudy[]> {
    const path = `users/${userId}/portfolio`;
    try {
      const q = query(collection(db, 'users', userId, 'portfolio'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as PortfolioCaseStudy);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async savePortfolioStudy(userId: string, study: PortfolioCaseStudy): Promise<void> {
    const path = `users/${userId}/portfolio/${study.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'portfolio', study.id), study);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async deletePortfolioStudy(userId: string, studyId: string): Promise<void> {
    const path = `users/${userId}/portfolio/${studyId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'portfolio', studyId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  // 7. Community Solutions Library (Public Collection: /solutions_library)
  async getCommunitySolutions(): Promise<CommunityProblemSolution[]> {
    const path = 'solutions_library';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        // Seed initial items
        for (let i = 0; i < SEED_LIBRARY_SOLUTIONS.length; i++) {
          const item = { ...SEED_LIBRARY_SOLUTIONS[i], id: `sol_seed_${i + 1}` };
          try {
            await setDoc(doc(db, path, item.id), item);
          } catch {
            // Ignore if rules restrict seeding before auth
          }
        }
        return SEED_LIBRARY_SOLUTIONS.map((s, idx) => ({ ...s, id: `sol_seed_${idx + 1}` }));
      }
      const docs = snap.docs.map((d) => d.data() as CommunityProblemSolution);
      return docs.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  async saveCommunitySolution(solution: CommunityProblemSolution): Promise<void> {
    const path = `solutions_library/${solution.id}`;
    try {
      const sanitized: CommunityProblemSolution = {
        ...solution,
        problemTitle: DOMPurify.sanitize(solution.problemTitle),
        localContext: DOMPurify.sanitize(solution.localContext),
        stateOrRegion: DOMPurify.sanitize(solution.stateOrRegion),
        selectedSolutionTitle: DOMPurify.sanitize(solution.selectedSolutionTitle),
        upvotes: solution.upvotes || 0,
        upvoters: solution.upvoters || [],
        reportCount: solution.reportCount || 0,
        isFlagged: solution.isFlagged || false,
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'solutions_library', solution.id), sanitized, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async upvoteCommunitySolution(solutionId: string, userId: string): Promise<void> {
    const path = `solutions_library/${solutionId}`;
    try {
      const ref = doc(db, 'solutions_library', solutionId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data() as CommunityProblemSolution;
      const upvoters = data.upvoters || [];
      const hasUpvoted = upvoters.includes(userId);
      const nextUpvoters = hasUpvoted
        ? upvoters.filter((id) => id !== userId)
        : [...upvoters, userId];
      const nextCount = Math.max(0, (data.upvotes || 0) + (hasUpvoted ? -1 : 1));

      await updateDoc(ref, {
        upvotes: nextCount,
        upvoters: nextUpvoters
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  async reportCommunitySolution(solutionId: string): Promise<void> {
    const path = `solutions_library/${solutionId}`;
    try {
      const ref = doc(db, 'solutions_library', solutionId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data() as CommunityProblemSolution;
      const nextReport = (data.reportCount || 0) + 1;
      await updateDoc(ref, {
        reportCount: nextReport,
        isFlagged: nextReport >= 3 // Auto-hide after 3 reports as specified
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  async deleteCommunitySolution(solutionId: string): Promise<void> {
    const path = `solutions_library/${solutionId}`;
    try {
      await deleteDoc(doc(db, 'solutions_library', solutionId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  // 8. Spaced Repetition (Schedule: 1, 3, 7, 14 days)
  async getSpacedRepetitionDue(userId: string): Promise<SpacedRepetitionItem[]> {
    const path = `users/${userId}/spaced_repetition`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'spaced_repetition'));
      const items = snap.docs.map(d => d.data() as SpacedRepetitionItem);
      const now = Date.now();
      // Return items where nextReviewAt <= now, sorted by urgency
      return items
        .filter(item => item.nextReviewAt <= now + (2 * 60 * 60 * 1000)) // within 2 hours or overdue
        .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async getAllSpacedRepetitionItems(userId: string): Promise<SpacedRepetitionItem[]> {
    const path = `users/${userId}/spaced_repetition`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'spaced_repetition'));
      return snap.docs.map(d => d.data() as SpacedRepetitionItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async recordSpacedRepetitionQuestion(userId: string, question: any, wasCorrect: boolean): Promise<void> {
    const qId = question.id || `${question.topic}_${question.question.slice(0, 20)}`.replace(/[^a-zA-Z0-9]/g, '_');
    const path = `users/${userId}/spaced_repetition/${qId}`;
    const SCHEDULE_DAYS = [1, 3, 7, 14];

    try {
      const itemRef = doc(db, 'users', userId, 'spaced_repetition', qId);
      const snap = await getDoc(itemRef);

      if (snap.exists()) {
        const cur = snap.data() as SpacedRepetitionItem;
        if (wasCorrect) {
          const nextStage = Math.min(4, cur.reviewStage + 1) as 1 | 2 | 3 | 4;
          const intervalDays = SCHEDULE_DAYS[nextStage - 1];
          await setDoc(itemRef, {
            ...cur,
            reviewStage: nextStage,
            intervalDays,
            consecutiveCorrect: cur.consecutiveCorrect + 1,
            nextReviewAt: Date.now() + intervalDays * 24 * 60 * 60 * 1000,
          }, { merge: true });
        } else {
          // Missed again, reset to stage 1 (1 day)
          await setDoc(itemRef, {
            ...cur,
            reviewStage: 1,
            intervalDays: 1,
            consecutiveCorrect: 0,
            lastMissedAt: Date.now(),
            nextReviewAt: Date.now() + 1 * 24 * 60 * 60 * 1000,
          }, { merge: true });
        }
      } else if (!wasCorrect) {
        // First time missed, create stage 1 (1 day)
        const newItem: SpacedRepetitionItem = {
          id: qId,
          question,
          reviewStage: 1,
          intervalDays: 1,
          consecutiveCorrect: 0,
          lastMissedAt: Date.now(),
          nextReviewAt: Date.now() + 1 * 24 * 60 * 60 * 1000,
        };
        await setDoc(itemRef, newItem);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // 9. Question Bookmarks
  async getBookmarkedQuestions(userId: string): Promise<any[]> {
    const path = `users/${userId}/bookmarks`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'bookmarks'));
      return snap.docs.map(d => d.data());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async toggleBookmarkQuestion(userId: string, question: any): Promise<boolean> {
    const qId = question.id || `${question.topic}_${question.question.slice(0, 20)}`.replace(/[^a-zA-Z0-9]/g, '_');
    const path = `users/${userId}/bookmarks/${qId}`;
    try {
      const bRef = doc(db, 'users', userId, 'bookmarks', qId);
      const snap = await getDoc(bRef);
      if (snap.exists()) {
        await deleteDoc(bRef);
        return false;
      } else {
        await setDoc(bRef, {
          ...question,
          bookmarkedAt: Date.now()
        });
        return true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      return false;
    }
  }

  // 10. Persistent Ask Chats (Private Subcollection: /users/{uid}/chats)
  async getChats(userId: string): Promise<ChatSession[]> {
    const path = `users/${userId}/chats`;
    try {
      const q = query(collection(db, 'users', userId, 'chats'), orderBy('updatedAt', 'desc'), limit(30));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as ChatSession);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async saveChat(userId: string, chat: ChatSession): Promise<void> {
    const path = `users/${userId}/chats/${chat.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'chats', chat.id), chat, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async deleteChat(userId: string, chatId: string): Promise<void> {
    const path = `users/${userId}/chats/${chatId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'chats', chatId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  async renameChat(userId: string, chatId: string, newTitle: string): Promise<void> {
    const path = `users/${userId}/chats/${chatId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'chats', chatId), {
        title: DOMPurify.sanitize(newTitle),
        updatedAt: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  // 11. Support & Contact Messages (Collection: /messages)
  async submitSupportMessage(msg: SupportMessage): Promise<void> {
    const path = `messages/${msg.id}`;
    try {
      const payload: Record<string, any> = {
        id: msg.id,
        userId: msg.userId,
        name: DOMPurify.sanitize(msg.name || 'Engineering Student'),
        email: msg.email || '',
        category: msg.category || 'Question',
        message: DOMPurify.sanitize(msg.message || ''),
        device: msg.device || 'Unknown',
        browser: msg.browser || 'Unknown',
        page: msg.page || 'Help Desk',
        status: msg.status || 'New',
        createdAt: msg.createdAt || Date.now(),
        updatedAt: msg.updatedAt || Date.now(),
      };
      if (msg.screenshotUrl) {
        payload.screenshotUrl = msg.screenshotUrl;
      }
      await setDoc(doc(db, 'messages', msg.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async getUserMessages(userId: string): Promise<SupportMessage[]> {
    const path = 'messages';
    try {
      const q = query(collection(db, 'messages'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data() as SupportMessage);
      return list.sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async getAllMessages(): Promise<SupportMessage[]> {
    const path = 'messages';
    try {
      const snap = await getDocs(collection(db, 'messages'));
      const list = snap.docs.map(d => d.data() as SupportMessage);
      return list.sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  async replyToMessage(messageId: string, replyText: string, status: 'New' | 'In progress' | 'Resolved'): Promise<void> {
    const path = `messages/${messageId}`;
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        adminReply: DOMPurify.sanitize(replyText),
        repliedAt: Date.now(),
        status,
        updatedAt: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  subscribeToAllMessages(
    onSuccess: (msgs: SupportMessage[]) => void,
    onError?: (err: any) => void
  ): () => void {
    const path = 'messages';
    try {
      const unsubscribe = onSnapshot(
        collection(db, 'messages'),
        (snapshot) => {
          const list = snapshot.docs.map((d) => d.data() as SupportMessage);
          list.sort((a, b) => b.createdAt - a.createdAt);
          onSuccess(list);
        },
        (error) => {
          console.warn('Realtime messages listener error:', error);
          if (onError) {
            onError(error);
          }
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('subscribeToAllMessages init failed:', err);
      if (onError) {
        onError(err);
      }
      return () => {};
    }
  }

  async seedSampleInquiry(): Promise<SupportMessage> {
    const sampleMsg: SupportMessage = {
      id: `msg_sample_${Date.now()}`,
      userId: auth.currentUser?.uid || 'sample_student_1',
      name: 'Chinedu Okafor',
      email: 'chinedu.okafor@student.unilag.edu.ng',
      category: 'Question',
      message: 'Good day Faculty Admin, in Thermodynamics MEE 301, could you verify if the Diesel cycle cut-off ratio formula on the CBT practice evaluates rc = V3/V2 or heat input ratio directly? Thank you!',
      device: 'Mobile Device (Android 14)',
      browser: 'Chrome 122',
      page: 'CBT Exam Prep Center',
      status: 'New',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await this.submitSupportMessage(sampleMsg);
    return sampleMsg;
  }
}

export const firestoreService = new FirestoreService();
