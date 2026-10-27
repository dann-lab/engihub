/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NavigationModule = 
  | 'learn' 
  | 'practice' 
  | 'ask' 
  | 'projects' 
  | 'me' 
  | 'help'
  | 'tutor' 
  | 'cbt' 
  | 'scanner' 
  | 'problem-lab' 
  | 'portfolio' 
  | 'dashboard' 
  | 'settings' 
  | 'admin';

export type EngineeringField = 'mechanical' | 'electrical' | 'civil' | 'chemical' | 'agricultural' | 'general';

export type DifficultyLevel = 'easy' | 'exam-level' | 'hard';

export interface TutorStep {
  id: string;
  stepNumber: number;
  title: string;
  content: string;
  isLostAnalogy?: boolean;
  timestamp: number;
}

export interface TutorSession {
  id: string;
  topic: string;
  course: string;
  steps: TutorStep[];
  currentStepIndex: number;
  isCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'numeric_calc' | 'multi_select';

export type CBTMode = 'practice' | 'exam_simulation' | 'quick_10' | 'weak_spot' | 'daily_challenge';

export type CBTSource = 'course_topic' | 'free_text' | 'uploaded_note' | 'past_question';

export interface CBTQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerIndices?: number[];
  correctAnswerText?: string;
  numericAnswer?: number;
  numericTolerance?: number;
  unit?: string;
  explanation: string;
  conceptTested: string;
  whyOtherOptionsWrong?: string;
  topic: string;
  subtopic: string;
  difficulty: DifficultyLevel;
  userSelectedIndex?: number;
  userSelectedIndices?: number[];
  userTextAnswer?: string;
  userNumericAnswer?: number;
  isCorrect?: boolean;
  isAnswered?: boolean;
  isBookmarked?: boolean;
  isFlagged?: boolean;
  simplerExplanation?: string;
}

export interface CBTQuiz {
  id: string;
  topic: string;
  course?: string;
  mode: CBTMode;
  difficulty: DifficultyLevel;
  questions: CBTQuestion[];
  score: number;
  totalQuestions: number;
  completedAt?: number;
  durationSeconds: number;
}

export interface SpacedRepetitionItem {
  id: string;
  question: CBTQuestion;
  reviewStage: 1 | 2 | 3 | 4; // 1 day, 3 days, 7 days, 14 days
  nextReviewAt: number;
  intervalDays: number;
  consecutiveCorrect: number;
  lastMissedAt: number;
}

export type AnswerStyle = 'quick' | 'step_by_step' | 'exam_answer' | 'deep_dive';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Array<{ title: string; url: string }>;
  attachment?: {
    name: string;
    type: string;
    dataUrl?: string;
  };
  styleUsed?: AnswerStyle;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  defaultStyle?: AnswerStyle;
}

export interface WeakTopic {
  topic: string;
  subtopic: string;
  incorrectCount: number;
  totalEncountered: number;
  lastMissedAt: number;
  suggestedRevision: string;
}

export type NoteAnalysisMode = 'transcribe' | 'summary' | 'explain' | 'solve_assignment';

export interface ScannedNoteRecord {
  id: string;
  title: string;
  imageDataUrl?: string; // Stored locally only if not in lowDataMode
  extractedText: string;
  mode: NoteAnalysisMode;
  analysisResult: string;
  timestamp: number;
}

export interface BEMELineItem {
  item: string;
  quantity: string;
  unitRateNaira: number;
  totalNaira: number;
  localSource: string; // e.g. "Ladipo Market", "Alaba Intl", "Local Timber Shed"
}

export interface FeasibilityMetrics {
  costScore: number;       // 1 - 100 (100 = very affordable)
  difficultyScore: number; // 1 - 100 (100 = easiest to construct)
  impactScore: number;     // 1 - 100 (100 = immense community benefit)
  sustainability: number;  // 1 - 100 (100 = easy to maintain with local parts)
  overallScore: number;    // Average
}

export interface EngineeringSolutionOption {
  title: string;
  type: string; // "Mechanical / Gravity", "Hybrid Solar", "Micro-IoT", etc.
  description: string;
  pros: string[];
  cons: string[];
}

export interface CommunityProblemSolution {
  id: string;
  problemTitle: string;
  localContext: string;
  stateOrRegion: string; // e.g. "Lagos", "Kano", "Ogun", "Enugu", "Niger Delta"
  breakdown: string;
  rootCauses: string[];
  solutionOptions: EngineeringSolutionOption[];
  selectedSolutionTitle: string;
  governingFormulas: string;
  sampleCalculations: string;
  materialsList: string[];
  bemeEstimate: BEMELineItem[];
  totalEstimatedCostNaira: number;
  safetyAlerts: string[];
  feasibility: FeasibilityMetrics;
  buildPlanSteps: string[];
  createdAt: number;
  upvotes: number;
  hasUpvoted?: boolean;
  authorId?: string;
  authorName: string;
  authorUniversity: string;
  field?: EngineeringField;
  isPublishedToLibrary: boolean;
  upvoters?: string[];
  reportCount?: number;
  isFlagged?: boolean;
  updatedAt?: number;
}

export interface PortfolioCaseStudy {
  id: string;
  problemLabId?: string;
  title: string;
  authorName: string;
  university: string;
  department: string;
  level: string; // "200L", "300L", "400L (SIWES)", "500L (Final Year)"
  executiveSummary: string;
  problemStatement: string;
  technicalMethodology: string;
  mathematicalValidation: string;
  bemeCostSummaryNaira: number;
  safetyAndEthics: string;
  resultsAndImpact: string;
  lessonsLearned: string[];
  skillsDemonstrated: string[];
  createdAt: number;
}

export interface UserProgress {
  studyStreakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  topicsMastered: string[];
  cbtQuizzesTaken: number;
  totalCbtQuestionsAnswered: number;
  totalCbtCorrect: number;
  projectsCompleted: number;
  skillsEarned: string[];
  historyScores: { date: string; scorePercent: number; topic: string }[];
}

export interface AppSettings {
  lowDataMode: boolean; // Shortens prompts, avoids saving heavy image blobs
  studentName: string;
  university: string;
  department: string;
  level: string;
}

export type MessageCategory = 'Bug' | 'Account problem' | 'Question' | 'Suggestion' | 'Other';
export type MessageStatus = 'New' | 'In progress' | 'Resolved';

export interface SupportMessage {
  id: string;
  userId: string;
  name: string;
  email: string;
  category: MessageCategory;
  message: string;
  screenshotUrl?: string;
  screenshotBase64?: string;
  device?: string;
  browser?: string;
  page?: string;
  metadata?: {
    device?: string;
    browser?: string;
    page?: string;
  };
  status: MessageStatus;
  createdAt: number;
  updatedAt: number;
  adminReply?: string;
  repliedAt?: number;
}
