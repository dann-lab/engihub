/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Offline Browser Storage Engine
 * Utilizes IndexedDB with graceful localStorage fallback for offline resilience on slow or intermittent Nigerian networks.
 */

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

const DB_NAME = 'engihub_db';
const DB_VERSION = 1;

// Stores
const STORES = {
  SETTINGS: 'settings',
  TUTOR_SESSIONS: 'tutor_sessions',
  CBT_QUIZZES: 'cbt_quizzes',
  WEAK_TOPICS: 'weak_topics',
  NOTES: 'scanned_notes',
  COMMUNITY_SOLUTIONS: 'community_solutions',
  PORTFOLIO: 'portfolio_case_studies',
  PROGRESS: 'user_progress'
};

const DEFAULT_SETTINGS: AppSettings = {
  lowDataMode: false,
  studentName: 'Engr. Daniel Olorunlana',
  university: 'Federal University of Technology, Akure (FUTA)',
  department: 'Mechanical & Mechatronics Engineering',
  level: '400L (SIWES Candidate)'
};

const DEFAULT_PROGRESS: UserProgress = {
  studyStreakDays: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  topicsMastered: [
    'First Law of Thermodynamics (Closed Systems)',
    'Carnot Cycle Efficiency',
    'Bernoulli Equation & Torricelli Flow',
    'Stress-Strain Constitutive Relations'
  ],
  cbtQuizzesTaken: 8,
  totalCbtQuestionsAnswered: 40,
  totalCbtCorrect: 33,
  projectsCompleted: 2,
  skillsEarned: [
    'Thermodynamic Cycle Optimization',
    'BEME Cost Estimation (Naira)',
    'Solar PV Sizing & Off-Grid Storage',
    'Hydraulic Piping Head Loss Analysis',
    'COREN Technical Reporting'
  ],
  historyScores: [
    { date: '2026-10-18', scorePercent: 75, topic: 'Engineering Materials' },
    { date: '2026-10-20', scorePercent: 80, topic: 'Thermodynamics' },
    { date: '2026-10-22', scorePercent: 90, topic: 'Differential Equations' },
    { date: '2026-10-24', scorePercent: 85, topic: 'Fluid Mechanics' }
  ]
};

// Seed community engineering solutions for initial load
export const SEED_COMMUNITY_SOLUTIONS: CommunityProblemSolution[] = [
  {
    id: 'sol-seed-1',
    problemTitle: 'Unstable Grid Electricity in University Student Hostels',
    localContext: 'Off-campus student hostels along FUTA South Gate experiencing 18-hour daily blackouts, hindering overnight study and project coding.',
    stateOrRegion: 'Ondo State (Akure)',
    breakdown: 'Overloaded 33kV distribution feeder with erratic load shedding. Generators introduce severe noise, toxic CO fumes, and skyrocketing fuel costs (₦1,200/litre).',
    rootCauses: [
      'Transmission grid instability & transformer overloading',
      'High fuel expense makes petrol generators economically unsustainable for students',
      'Voltage surges when grid returns damaging laptops and phone chargers'
    ],
    solutionOptions: [
      {
        title: 'Central DC-Bus Solar Nano-Grid with LiFePO4 Chemistry',
        type: 'Renewable Solar DC Micro-Distribution',
        description: 'Direct 12V/24V DC lighting and USB-C laptop power eliminating expensive inverter conversion losses.',
        pros: ['Highest round-trip efficiency (92%)', 'Safe low DC voltage', 'Zero fuel noise'],
        cons: ['Requires dedicated DC wiring in rooms']
      },
      {
        title: 'Shared Portable Solar Charging Hub with Smart Slot Metering',
        type: 'Hybrid AC/DC Hub',
        description: 'A 1.5kVA hybrid solar station deployed at hostel lobby with coin/token timer for laptops.',
        pros: ['Shared capital expenditure among 20 students', 'High utilization factor'],
        cons: ['Requires strict scheduling among occupants']
      },
      {
        title: 'Solid-State Battery Bank with Automatic Grid Sense Bypass',
        type: 'Energy Storage with Surge Protection',
        description: 'Rapid 2-hour fast-charging battery bank during brief grid availability with automatic surge cut-off.',
        pros: ['Capitalizes on grid when active', 'Compact footprint'],
        cons: ['Batteries degrade if charged with dirty generator wave']
      }
    ],
    selectedSolutionTitle: 'Central DC-Bus Solar Nano-Grid with LiFePO4 Chemistry',
    governingFormulas: `Daily Energy Requirement:
$$E_{daily} = \\sum (P_i \\times t_i) = 1.25 \\times E_{load}$$
Solar Array Sizing:
$$P_{pv} = \\frac{E_{daily}}{PSH \\times \\eta_{sys}} = \\frac{1500\\text{ Wh}}{4.8\\text{ hrs} \\times 0.82} \\approx 380\\text{ Wp}$$
Battery Capacity ($C_{Ah}$):
$$C_{Ah} = \\frac{E_{load} \\times D_{autonomy}}{V_{nominal} \\times DOD} = \\frac{1200\\text{ Wh} \\times 1}{12.8\\text{ V} \\times 0.85} \\approx 110\\text{ Ah}$$`,
    sampleCalculations: 'For 10 student study pods: LED light (5W x 6h = 30Wh) + Laptop USB-PD (45W x 2h = 90Wh) = 120Wh per student. Total daily load = 1,200Wh. Sized with 2x 200W Monocrystalline panels in Ladipo/Alaba market and 1x 12.8V 100Ah LiFePO4 battery.',
    materialsList: [
      '2x 200W Monocrystalline PV Panels (Class A)',
      '1x 12.8V 100Ah LiFePO4 Battery with built-in BMS',
      '1x 30A MPPT Solar Charge Controller',
      '50m 2.5mm² pure copper flex wire',
      '10x 12V to USB-C PD 65W step-down buck modules',
      'Surge arrester & 2P 32A DC Breaker'
    ],
    bemeEstimate: [
      { item: '200W Mono Solar Panels (Pair)', quantity: '2 pcs', unitRateNaira: 55000, totalNaira: 110000, localSource: 'Alaba International Market, Lagos' },
      { item: '12.8V 100Ah LiFePO4 Battery Pack', quantity: '1 unit', unitRateNaira: 195000, totalNaira: 195000, localSource: 'Ladipo Electrical Market' },
      { item: '30A MPPT Solar Charge Controller', quantity: '1 unit', unitRateNaira: 32000, totalNaira: 32000, localSource: 'Local Electronic Vendor' },
      { item: 'DC Breakers, Enclosure & Cabling', quantity: '1 set', unitRateNaira: 28000, totalNaira: 28000, localSource: 'Local Electrical Stores' },
      { item: 'USB-C PD Buck Regulators & Jacks', quantity: '10 units', unitRateNaira: 3500, totalNaira: 35000, localSource: 'Component Importers' }
    ],
    totalEstimatedCostNaira: 400000,
    safetyAlerts: [
      'CRITICAL SAFETY WARNING: High short-circuit current capacity of LiFePO4 batteries can weld tools and ignite fires. Always use rated DC Class-T or fast blow fuses directly at the positive battery terminal.',
      'Ensure proper earth grounding of the solar panel aluminum framing to protect against lightning surges common during rainy seasons in Nigeria.',
      'Never connect 12V DC lines to 220V AC wall sockets to prevent catastrophic fire or equipment damage.'
    ],
    feasibility: {
      costScore: 78,
      difficultyScore: 85,
      impactScore: 96,
      sustainability: 92,
      overallScore: 88
    },
    buildPlanSteps: [
      'Mount solar panel angle brackets facing true South at 15° tilt on roof truss.',
      'Route UV-resistant solar cables via conduit to battery control station.',
      'Assemble battery protection board with 40A DC breaker and shunt voltmeter.',
      'Calibrate MPPT parameters for LiFePO4 absorption (14.4V) and float (13.6V).',
      'Run 12V trunk cable along hostel corridor and wire DC step-down stations.',
      'Conduct load stress test with 5 laptops simultaneously; log voltage drops.'
    ],
    createdAt: Date.now() - 86400000 * 3,
    upvotes: 42,
    authorName: 'Engr. Daniel Olorunlana',
    authorUniversity: 'FUTA, Akure',
    isPublishedToLibrary: true
  },
  {
    id: 'sol-seed-2',
    problemTitle: 'Post-Harvest Cassava & Yam Mash Dewatering Inefficiency',
    localContext: 'Smallholder women cassava processors in rural Oyo/Ogun manual screw presses take 3 days to ferment and press water, losing yield to enzymatic browning.',
    stateOrRegion: 'Oyo State (Ibarapa / Oyo)',
    breakdown: 'Traditional hydraulic jack screw systems leak hydraulic oil into food mash, cause ergonomic back injuries, and produce uneven moisture content affecting Garri crispiness.',
    rootCauses: [
      'Manual hydraulic bottle jacks fail under continuous static pressure',
      'Corrosive hydrocyanic acid in cassava water attacks mild steel parts',
      'Absence of food-grade stainless contact surfaces'
    ],
    solutionOptions: [
      {
        title: 'Compound Lever Toggle Press with SS304 Perforated Cage',
        type: 'Pure Mechanical High-Advantage Press',
        description: 'Multi-pivot mechanical advantage toggle producing 4-tonne uniform compression without hydraulic oil.',
        pros: ['Zero oil contamination risk', 'Zero electricity requirement', 'Locally welded with angle iron'],
        cons: ['Requires manual effort to cock the lever']
      },
      {
        title: 'Pneumatic Air-Bag Press Using Reclaimed Truck Bellows',
        type: 'Pneumatic Low-Maintenance System',
        description: 'Uses a small foot/motor air compressor and heavy-duty truck suspension air-spring bellows.',
        pros: ['Extremely rapid dewatering (35 mins)', 'Even radial pressure'],
        cons: ['Needs compressed air source']
      },
      {
        title: 'Counterweight Gravity Squeeze Rig',
        type: 'Passive Gravity Creep Press',
        description: 'Self-adjusting weighted beam that follows cassava volume reduction overnight.',
        pros: ['Operates unattended overnight', 'Ultra low cost'],
        cons: ['Larger footprint']
      }
    ],
    selectedSolutionTitle: 'Compound Lever Toggle Press with SS304 Perforated Cage',
    governingFormulas: `Mechanical Advantage of Toggle Mechanism:
$$MA = \\frac{F_{press}}{F_{input}} = \\frac{1}{2\\tan(\\theta)}$$
As $\\theta \\to 0$, $MA \\to \\infty$, allowing enormous dewatering pressure at the end of the stroke.
Dewatering Moisture Mass Balance:
$$m_{water} = m_{initial} \\times \\left(\\frac{w_i - w_f}{100 - w_f}\\right)$$`,
    sampleCalculations: 'With 50kg grated cassava mash at 68% moisture, target 42% moisture for roasting. Water to extract = 22.4kg. Input lever force of 200N applied at $\\theta = 4^\\circ$ yields over 14.3kN (approx 1.45 tonnes) of pressing force.',
    materialsList: [
      'SS304 perforated food-grade sheet (1.5mm thickness)',
      '100x50mm channel iron frame (panteka/local steel stockyard)',
      'High-tensile Grade 8.8 bolts & hardened pivot bushings',
      'Grease nipple fittings & food-grade silicone seals',
      'PVC runoff gutter for cyanide-rich effluent containment'
    ],
    bemeEstimate: [
      { item: 'Channel Iron Frame (100x50mm, 2 lengths)', quantity: '2 lengths', unitRateNaira: 38000, totalNaira: 76000, localSource: 'Oshodi / Kokori Steel Market' },
      { item: 'SS304 Perforated Sheet (1.2m x 2.4m)', quantity: '1 sheet', unitRateNaira: 95000, totalNaira: 95000, localSource: 'Alaba Suru Stainless Importers' },
      { item: 'Machining, Turning & Bronze Bushings', quantity: '1 lot', unitRateNaira: 35000, totalNaira: 35000, localSource: 'Local Lathe Machinist Workshop' },
      { item: 'Hardware, Fasteners & Anti-Corrosion Primer', quantity: '1 set', unitRateNaira: 18000, totalNaira: 18000, localSource: 'Local Hardware Shop' }
    ],
    totalEstimatedCostNaira: 224000,
    safetyAlerts: [
      'CRITICAL SAFETY WARNING: High compressive toggle mechanisms pose severe pinch hazards. Never reach inside the perforated basket while lever is loaded.',
      'Cassava effluent contains volatile hydrocyanic acid (HCN). Work in a well-ventilated open-air shed and never discharge acidic wastewater directly into fish ponds or drinking wells.'
    ],
    feasibility: {
      costScore: 90,
      difficultyScore: 82,
      impactScore: 94,
      sustainability: 95,
      overallScore: 90
    },
    buildPlanSteps: [
      'Cut and bevel channel iron frame uprights using angle grinder.',
      'Fabricate rigid base platen with reinforced cross-bracing.',
      'Roll and TIG weld SS304 perforated basket with drain ports.',
      'Machine toggle linkage pins from 20mm round bar on lathe.',
      'Assemble lever arm, fit grease points, and check alignment.',
      'Perform wet test with 50kg batch of freshly grated cassava.'
    ],
    createdAt: Date.now() - 86400000 * 6,
    upvotes: 38,
    authorName: 'Engr. Daniel Olorunlana',
    authorUniversity: 'FUTA, Akure',
    isPublishedToLibrary: true
  }
];

class StorageService {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        Object.values(STORES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        console.warn('IndexedDB failed to open, falling back to localStorage');
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Generic DB get
  async getItem<T>(storeName: string, id: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(this.getLocalStorage<T>(`${storeName}_${id}`));
      });
    } catch {
      return this.getLocalStorage<T>(`${storeName}_${id}`);
    }
  }

  // Generic DB getAll
  async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this.getAllLocalStorage<T>(storeName));
      });
    } catch {
      return this.getAllLocalStorage<T>(storeName);
    }
  }

  // Generic DB set
  async setItem<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
      this.setLocalStorage(`${storeName}_${item.id}`, item);
      this.updateLocalStorageIndex(storeName, item.id);
    }
  }

  // Generic DB delete
  async deleteItem(storeName: string, id: string): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.removeItem(`${storeName}_${id}`);
      this.removeFromLocalStorageIndex(storeName, id);
    }
  }

  // LocalStorage Helpers
  private getLocalStorage<T>(key: string): T | null {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }

  private setLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  private getAllLocalStorage<T>(storeName: string): T[] {
    try {
      const indexStr = localStorage.getItem(`${storeName}_index`);
      if (!indexStr) return [];
      const ids: string[] = JSON.parse(indexStr);
      const items: T[] = [];
      ids.forEach((id) => {
        const item = this.getLocalStorage<T>(`${storeName}_${id}`);
        if (item) items.push(item);
      });
      return items;
    } catch {
      return [];
    }
  }

  private updateLocalStorageIndex(storeName: string, id: string) {
    try {
      const indexKey = `${storeName}_index`;
      const cur = localStorage.getItem(indexKey);
      const ids: string[] = cur ? JSON.parse(cur) : [];
      if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(indexKey, JSON.stringify(ids));
      }
    } catch (e) {
      console.warn(e);
    }
  }

  private removeFromLocalStorageIndex(storeName: string, id: string) {
    try {
      const indexKey = `${storeName}_index`;
      const cur = localStorage.getItem(indexKey);
      if (!cur) return;
      const ids: string[] = JSON.parse(cur);
      const filtered = ids.filter((i) => i !== id);
      localStorage.setItem(indexKey, JSON.stringify(filtered));
    } catch (e) {
      console.warn(e);
    }
  }

  // === App Specific APIs ===

  async getSettings(): Promise<AppSettings> {
    const res = await this.getItem<AppSettings & { id: string }>(STORES.SETTINGS, 'app_settings');
    return res || DEFAULT_SETTINGS;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.setItem(STORES.SETTINGS, { id: 'app_settings', ...settings });
  }

  async getProgress(): Promise<UserProgress> {
    const res = await this.getItem<UserProgress & { id: string }>(STORES.PROGRESS, 'user_progress');
    return res || DEFAULT_PROGRESS;
  }

  async saveProgress(progress: UserProgress): Promise<void> {
    await this.setItem(STORES.PROGRESS, { id: 'user_progress', ...progress });
  }

  async updateStudyStreak(): Promise<UserProgress> {
    const progress = await this.getProgress();
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (progress.lastActiveDate === yesterday) {
        progress.studyStreakDays += 1;
      } else {
        // Streak reset if skipped days
        progress.studyStreakDays = 1;
      }
      progress.lastActiveDate = today;
      await this.saveProgress(progress);
    }
    return progress;
  }

  // Tutor Sessions
  async getAllTutorSessions(): Promise<TutorSession[]> {
    return this.getAll<TutorSession>(STORES.TUTOR_SESSIONS);
  }

  async saveTutorSession(session: TutorSession): Promise<void> {
    await this.setItem(STORES.TUTOR_SESSIONS, session);
  }

  // CBT Quizzes & Weak Topics
  async getAllCBTQuizzes(): Promise<CBTQuiz[]> {
    return this.getAll<CBTQuiz>(STORES.CBT_QUIZZES);
  }

  async saveCBTQuiz(quiz: CBTQuiz): Promise<void> {
    await this.setItem(STORES.CBT_QUIZZES, quiz);
  }

  async getAllWeakTopics(): Promise<WeakTopic[]> {
    const records = await this.getAll<WeakTopic & { id: string }>(STORES.WEAK_TOPICS);
    return records.sort((a, b) => b.incorrectCount - a.incorrectCount);
  }

  async recordWeakTopic(topic: string, subtopic: string, suggestedRevision: string): Promise<void> {
    const id = `${topic}_${subtopic}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const existing = await this.getItem<WeakTopic & { id: string }>(STORES.WEAK_TOPICS, id);
    if (existing) {
      existing.incorrectCount += 1;
      existing.totalEncountered += 1;
      existing.lastMissedAt = Date.now();
      existing.suggestedRevision = suggestedRevision || existing.suggestedRevision;
      await this.setItem(STORES.WEAK_TOPICS, existing);
    } else {
      await this.setItem(STORES.WEAK_TOPICS, {
        id,
        topic,
        subtopic,
        incorrectCount: 1,
        totalEncountered: 1,
        lastMissedAt: Date.now(),
        suggestedRevision
      });
    }
  }

  async markTopicRevised(topic: string, subtopic: string): Promise<void> {
    const id = `${topic}_${subtopic}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const existing = await this.getItem<WeakTopic & { id: string }>(STORES.WEAK_TOPICS, id);
    if (existing && existing.incorrectCount > 0) {
      existing.incorrectCount = Math.max(0, existing.incorrectCount - 1);
      await this.setItem(STORES.WEAK_TOPICS, existing);
    }
  }

  // Scanned Notes
  async getAllScannedNotes(): Promise<ScannedNoteRecord[]> {
    const notes = await this.getAll<ScannedNoteRecord>(STORES.NOTES);
    return notes.sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveScannedNote(note: ScannedNoteRecord): Promise<void> {
    await this.setItem(STORES.NOTES, note);
  }

  async deleteScannedNote(id: string): Promise<void> {
    await this.deleteItem(STORES.NOTES, id);
  }

  // Community Problem Lab & Library
  async getAllCommunitySolutions(): Promise<CommunityProblemSolution[]> {
    let solutions = await this.getAll<CommunityProblemSolution>(STORES.COMMUNITY_SOLUTIONS);
    if (solutions.length === 0) {
      // Seed with initial solutions
      for (const item of SEED_COMMUNITY_SOLUTIONS) {
        await this.setItem(STORES.COMMUNITY_SOLUTIONS, item);
      }
      solutions = [...SEED_COMMUNITY_SOLUTIONS];
    }
    return solutions.sort((a, b) => b.upvotes - a.upvotes);
  }

  async saveCommunitySolution(solution: CommunityProblemSolution): Promise<void> {
    await this.setItem(STORES.COMMUNITY_SOLUTIONS, solution);
  }

  async upvoteCommunitySolution(id: string): Promise<CommunityProblemSolution | null> {
    const solution = await this.getItem<CommunityProblemSolution>(STORES.COMMUNITY_SOLUTIONS, id);
    if (solution) {
      if (!solution.hasUpvoted) {
        solution.upvotes += 1;
        solution.hasUpvoted = true;
      } else {
        solution.upvotes = Math.max(0, solution.upvotes - 1);
        solution.hasUpvoted = false;
      }
      await this.saveCommunitySolution(solution);
      return solution;
    }
    return null;
  }

  // Portfolio Case Studies
  async getAllPortfolioStudies(): Promise<PortfolioCaseStudy[]> {
    const studies = await this.getAll<PortfolioCaseStudy>(STORES.PORTFOLIO);
    return studies.sort((a, b) => b.createdAt - a.createdAt);
  }

  async savePortfolioStudy(study: PortfolioCaseStudy): Promise<void> {
    await this.setItem(STORES.PORTFOLIO, study);
  }

  async deletePortfolioStudy(id: string): Promise<void> {
    await this.deleteItem(STORES.PORTFOLIO, id);
  }
}

export const storageService = new StorageService();
