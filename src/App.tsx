/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { TopBar } from './components/navigation/TopBar';
import { ModuleTabs } from './components/navigation/ModuleTabs';
import { AITutor } from './components/modules/AITutor';
import { CBTEngine } from './components/modules/CBTEngine';
import { NoteScanner } from './components/modules/NoteScanner';
import { ProblemLab } from './components/modules/ProblemLab';
import { PortfolioBuilder } from './components/modules/PortfolioBuilder';
import { ProgressDashboard } from './components/modules/ProgressDashboard';
import { SettingsView } from './components/modules/SettingsView';
import { AdminView } from './components/modules/AdminView';
import { Skeleton } from './components/common/Skeleton';
import { CommunityProblemSolution, NavigationModule } from './types';

function AppContent() {
  const { currentUser, userProfile, loading, isAdmin, updateProfileData } = useAuth();
  const [activeModule, setActiveModule] = useState<NavigationModule>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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
    setActiveModule('cbt');
  };

  const handleSendToPortfolio = (solution: CommunityProblemSolution) => {
    setIncomingProblemForPortfolio(solution);
    setActiveModule('portfolio');
  };

  // Initial Auth Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121316] text-[#F5F5F4] flex flex-col justify-center items-center p-6 space-y-4">
        <div className="max-w-md w-full space-y-3">
          <span className="font-mono text-xs text-[#EA580C] uppercase tracking-wider block">
            EngiHub // Verifying Workspace Session
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

  // Authenticated: Render Workspace
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col ${isLight ? 'bg-[#FBF9F5] text-[#1C1917]' : 'bg-[#121316] text-[#F5F5F4]'} drafting-grid transition-colors`}>
      {/* Short onboarding modal for first-time sign-ins */}
      <OnboardingModal />

      {/* Top Header */}
      <TopBar
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
      />

      {/* Module Navigation Tabs */}
      <ModuleTabs
        activeModule={activeModule}
        onSelectModule={(mod) => {
          if (mod !== 'cbt') setCbtNotesContext('');
          setActiveModule(mod);
        }}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeModule === 'dashboard' && (
          <ProgressDashboard onNavigateToModule={setActiveModule} />
        )}

        {activeModule === 'tutor' && (
          <AITutor />
        )}

        {activeModule === 'cbt' && (
          <CBTEngine
            initialTopic={cbtTopicContext}
            notesContext={cbtNotesContext}
          />
        )}

        {activeModule === 'scanner' && (
          <NoteScanner onLaunchCBTWithNotes={handleLaunchCBTWithNotes} />
        )}

        {activeModule === 'problem-lab' && (
          <ProblemLab onSendToPortfolio={handleSendToPortfolio} />
        )}

        {activeModule === 'portfolio' && (
          <PortfolioBuilder incomingProblemSolution={incomingProblemForPortfolio} />
        )}

        {activeModule === 'settings' && (
          <SettingsView currentTheme={theme} onToggleTheme={toggleTheme} />
        )}

        {activeModule === 'admin' && isAdmin && (
          <AdminView />
        )}
      </main>
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
