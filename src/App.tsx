/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileHeader } from './components/navigation/MobileHeader';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { LearnHub } from './components/modules/LearnHub';
import { CBTEngine } from './components/modules/CBTEngine';
import { AskAssistant } from './components/modules/AskAssistant';
import { ProjectsHub } from './components/modules/ProjectsHub';
import { MeHub } from './components/modules/MeHub';
import { HelpContact } from './components/modules/HelpContact';
import { AdminView } from './components/modules/AdminView';
import { Skeleton } from './components/common/Skeleton';
import { QuietConfetti } from './utils/personality';
import { CommunityProblemSolution, NavigationModule } from './types';
import { HelpCircle, Shield } from 'lucide-react';

function AppContent() {
  const { currentUser, userProfile, loading, isAdmin, updateProfileData } = useAuth();
  const [activeModule, setActiveModule] = useState<NavigationModule>('learn');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showConfetti, setShowConfetti] = useState(false);

  // Inter-module bridges
  const [cbtNotesContext, setCbtNotesContext] = useState('');
  const [cbtTopicContext, setCbtTopicContext] = useState('');
  const [incomingProblemForPortfolio, setIncomingProblemForPortfolio] = useState<CommunityProblemSolution | null>(null);

  // Sync theme
  useEffect(() => {
    const savedTheme = (localStorage.getItem('engihub_theme') as 'light' | 'dark') || userProfile?.theme || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [userProfile?.theme]);

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('engihub_theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    if (userProfile) {
      await updateProfileData({ theme: next });
    }
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleLaunchCBTWithNotes = (notesText: string, topicName: string) => {
    setCbtNotesContext(notesText);
    setCbtTopicContext(topicName);
    setActiveModule('practice');
  };

  // Initial Auth Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1612] text-[#F6F3EE] flex flex-col justify-center items-center p-6 space-y-4">
        <div className="max-w-md w-full space-y-3">
          <span className="font-mono text-xs text-[#C67D0A] dark:text-[#E0A844] uppercase tracking-wider block">
            EngiHub · Opening Campus Workspace
          </span>
          <Skeleton lines={3} />
        </div>
      </div>
    );
  }

  // Unauthenticated Visitors: Landing page ONLY
  if (!currentUser) {
    return (
      <>
        <LandingPage onOpenAuth={handleOpenAuth} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authModalMode}
        />
      </>
    );
  }

  // Authenticated: Render Campus Workspace
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${
      isLight ? 'bg-[#FDFBF7] text-[#142E22]' : 'bg-[#0B1612] text-[#F6F3EE]'
    } transition-colors`}>
      {/* Short onboarding modal for first-time sign-ins */}
      <OnboardingModal />

      {/* Quiet celebratory confetti on CBT completion or milestones */}
      {showConfetti && (
        <QuietConfetti onComplete={() => setShowConfetti(false)} />
      )}

      {/* Desktop Left Sidebar */}
      <Sidebar
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
      />

      {/* Mobile Top Header */}
      <MobileHeader
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-12 min-h-screen overflow-y-auto">
        {/* Core Tab 1: Learn (Tutor & Note Scanner) */}
        {(activeModule === 'learn' || activeModule === 'tutor' || activeModule === 'scanner') && (
          <LearnHub
            initialSubTab={activeModule === 'scanner' ? 'scanner' : 'tutor'}
            onLaunchCBTWithNotes={handleLaunchCBTWithNotes}
          />
        )}

        {/* Core Tab 2: Practice (CBT Exam Prep) */}
        {(activeModule === 'practice' || activeModule === 'cbt') && (
          <CBTEngine
            initialTopic={cbtTopicContext}
            notesContext={cbtNotesContext}
            onComplete={() => setShowConfetti(true)}
          />
        )}

        {/* Core Tab 3: Ask (AI Study Companion) */}
        {activeModule === 'ask' && (
          <AskAssistant />
        )}

        {/* Core Tab 4: Projects (Problem Lab & Portfolio) */}
        {(activeModule === 'projects' || activeModule === 'problem-lab' || activeModule === 'portfolio') && (
          <ProjectsHub
            initialSubTab={activeModule === 'portfolio' ? 'portfolio' : 'lab'}
            incomingProblemSolution={incomingProblemForPortfolio}
          />
        )}

        {/* Core Tab 5: Me (Academic Overview, Settings, Admin) */}
        {(activeModule === 'me' || activeModule === 'dashboard' || activeModule === 'settings') && (
          <MeHub
            currentTheme={theme}
            onToggleTheme={toggleTheme}
            onNavigateToModule={setActiveModule}
            initialSubTab={activeModule === 'settings' ? 'settings' : 'overview'}
          />
        )}

        {/* Help & Contact Desk */}
        {activeModule === 'help' && (
          <HelpContact />
        )}

        {/* Admin view for faculty administrators */}
        {activeModule === 'admin' && (
          isAdmin ? (
            <AdminView />
          ) : (
            <div className="max-w-md mx-auto p-6 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-center space-y-3 my-8">
              <Shield className="w-8 h-8 text-[#C67D0A] dark:text-[#E0A844] mx-auto" />
              <h2 className="font-serif text-lg font-bold text-[#142E22] dark:text-[#F6F3EE]">Administrator Access Only</h2>
              <p className="text-xs text-[#405449] dark:text-[#AEC1B6]">
                This area is restricted to faculty administrators (<code className="font-mono text-xs">danielolorunlana59@gmail.com</code> and <code className="font-mono text-xs">dannistec3@gmail.com</code>). Currently signed in as: <code className="font-mono text-xs">{currentUser?.email || 'Student'}</code>.
              </p>
            </div>
          )
        )}
      </main>

      {/* Floating "Report a problem" button accessible across all screens */}
      {activeModule !== 'help' && (
        <button
          onClick={() => setActiveModule('help')}
          title="Report a problem or get support"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium paper-shadow-md border transition-all duration-200 bg-[#FDFBF7] dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#223A30] text-[#405449] dark:text-[#AEC1B6] hover:text-[#1B4332] dark:hover:text-[#F6F3EE] hover:border-[#1B4332] dark:hover:border-[#325C4B] group"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#C67D0A] dark:text-[#E0A844] group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Report a problem</span>
          <span className="sm:hidden">Help</span>
        </button>
      )}

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar
        currentTheme={theme}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
