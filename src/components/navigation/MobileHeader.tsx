/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mobile Top Bar Header
 * Clean campus identity, flame streak indicator, quick help and theme switch.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavigationModule } from '../../types';
import { Sun, Moon, HelpCircle } from 'lucide-react';
import { getTimeGreeting, FlameIcon } from '../../utils/personality';

interface MobileHeaderProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentTheme,
  onToggleTheme,
  activeModule,
  onSelectModule
}) => {
  const { userProfile, currentUser } = useAuth();
  const isLight = currentTheme === 'light';
  const greeting = getTimeGreeting(userProfile?.displayName || currentUser?.email || 'Student');

  return (
    <header
      className={`md:hidden sticky top-0 z-30 px-4 py-2.5 border-b backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-[#FDFBF7]/95 border-[#E8E1D3] text-[#142E22]'
          : 'bg-[#0B1612]/95 border-[#223A30] text-[#F6F3EE]'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Brand & Greeting */}
        <div
          onClick={() => onSelectModule('me')}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-tight">
              Engi<span className={isLight ? 'text-[#C67D0A]' : 'text-[#E0A844]'}>Hub</span>
            </span>
            <span className={`text-[11px] truncate max-w-[140px] ${
              isLight ? 'text-[#405449]' : 'text-[#AEC1B6]'
            }`}>
              {greeting}
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5">
          {/* Study Streak */}
          <div
            title={`${userProfile?.studyStreakDays || 1} day study streak`}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-semibold ${
              isLight
                ? 'bg-[#FDF4E5] border border-[#E8D4B0] text-[#A86604]'
                : 'bg-[#1D2B20] border border-[#325C4B] text-[#E0A844]'
            }`}
          >
            <FlameIcon className={`w-3.5 h-3.5 ${isLight ? 'text-[#C67D0A]' : 'text-[#E0A844]'}`} />
            <span>{userProfile?.studyStreakDays || 1}d</span>
          </div>

          {/* Quick Help */}
          <button
            onClick={() => onSelectModule('help')}
            aria-label="Help and support"
            className={`p-2 rounded-lg border transition-colors tap-target-base flex items-center justify-center ${
              activeModule === 'help'
                ? isLight ? 'bg-[#1B4332] text-white border-[#1B4332]' : 'bg-[#E0A844] text-[#0B1612] border-[#E0A844]'
                : isLight
                  ? 'bg-[#F5EFE6] border-[#E8E1D3] text-[#405449]'
                  : 'bg-[#11221B] border-[#223A30] text-[#AEC1B6]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme switch */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle light/dark mode"
            className={`p-2 rounded-lg border transition-colors tap-target-base flex items-center justify-center ${
              isLight
                ? 'bg-[#F5EFE6] border-[#E8E1D3] text-[#405449]'
                : 'bg-[#11221B] border-[#223A30] text-[#AEC1B6]'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
