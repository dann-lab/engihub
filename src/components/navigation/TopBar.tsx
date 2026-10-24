/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavigationModule } from '../../types';
import {
  Sun,
  Moon,
  Zap,
  Flame,
  Settings,
  Shield,
  LogOut
} from 'lucide-react';

interface TopBarProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTheme,
  onToggleTheme,
  activeModule,
  onSelectModule,
}) => {
  const { userProfile, updateProfileData, signOut, isAdmin, currentUser } = useAuth();

  const toggleLowData = async () => {
    if (!userProfile) return;
    const next = !userProfile.lowDataMode;
    await updateProfileData({ lowDataMode: next });
  };

  return (
    <header className="border-b border-[#2C3038] bg-[#121316] text-[#F5F5F4] px-4 sm:px-6 py-2.5 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => onSelectModule('dashboard')}
          className="flex items-baseline gap-2 cursor-pointer select-none"
        >
          <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#F5F5F4]">
            Engi<span className="text-[#EA580C]">Hub</span>
          </span>
          <span className="font-mono text-[10px] text-[#78716C] uppercase tracking-wider hidden sm:inline">
            // NG Workspace
          </span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Study streak */}
          <div
            title={`${userProfile?.studyStreakDays || 1} day study streak`}
            className="flex items-center gap-1 px-2 py-1 rounded-[3px] bg-[#181A1F] border border-[#2C3038] text-[11px] font-mono text-[#F97316]"
          >
            <Flame className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
            <span>{userProfile?.studyStreakDays || 1}d</span>
          </div>

          {/* Low-Data Mode Toggle */}
          <button
            onClick={toggleLowData}
            title={
              userProfile?.lowDataMode
                ? 'Low-Data Mode active: shorter responses, saved bandwidth'
                : 'Click to enable Low-Data mode for 2G/3G campus networks'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-mono border transition-colors ${
              userProfile?.lowDataMode
                ? 'bg-[#EA580C] text-white border-[#EA580C]'
                : 'bg-[#181A1F] text-[#78716C] border-[#2C3038] hover:text-[#A8A29E]'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span className="hidden md:inline">Low-Data</span>
            <span className="text-[10px] font-bold">
              {userProfile?.lowDataMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-[3px] bg-[#181A1F] border border-[#2C3038] text-[#A8A29E] hover:text-[#F5F5F4] transition-colors"
            title={`Switch to ${currentTheme === 'dark' ? 'Light Paper' : 'Dark Ink'} mode`}
            aria-label="Toggle theme"
          >
            {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Admin link if danielolorunlana59@gmail.com */}
          {isAdmin && (
            <button
              onClick={() => onSelectModule('admin')}
              className={`flex items-center gap-1 px-2 py-1 rounded-[3px] text-[11px] font-mono font-bold border transition-colors ${
                activeModule === 'admin'
                  ? 'bg-[#431407] text-[#EA580C] border-[#EA580C]'
                  : 'bg-[#181A1F] text-[#EA580C] border-[#2C3038] hover:border-[#EA580C]'
              }`}
              title="Admin Moderation Console"
            >
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Settings / Profile */}
          <button
            onClick={() => onSelectModule('settings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-mono border transition-colors ${
              activeModule === 'settings'
                ? 'bg-[#1F2228] text-[#F5F5F4] border-[#EA580C]'
                : 'bg-[#181A1F] text-[#A8A29E] border-[#2C3038] hover:text-[#F5F5F4]'
            }`}
            title="Workspace Settings & Profile"
          >
            <Settings className="w-3.5 h-3.5 text-[#EA580C]" />
            <span className="hidden lg:inline truncate max-w-[100px]">
              {userProfile?.displayName?.split(' ')[0] || 'Settings'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
