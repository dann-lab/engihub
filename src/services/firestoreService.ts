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
  limit
} from 'firebase/firestore';
import DOMPurify from 'dompurify';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import {
  AppSettings,
  CBTQuiz,
  CommunityProblemSolution,
  PortfolioCaseStudy,
  ScannedNoteRecord,
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
}

export const firestoreService = new FirestoreService();
