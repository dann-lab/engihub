/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mobile Bottom Tab Bar Navigation
 * Bottom tabs: Learn, Practice, Ask, Projects, Me.
 * High touch targets (>= 44px), warm Nigerian campus styling.
 */

import React from 'react';
import { NavigationModule } from '../../types';
import {
  BookOpen,
  CheckSquare,
  MessageSquare,
  Wrench,
  User
} from 'lucide-react';

interface BottomTabBarProps {
  currentTheme: 'light' | 'dark';
  activeModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
}

interface TabDef {
  id: NavigationModule;
  label: string;
  icon: React.ElementType;
  aliases: NavigationModule[];
}

const TABS: TabDef[] = [
  { id: 'learn', label: 'Learn', icon: BookOpen, aliases: ['learn', 'tutor', 'scanner'] },
  { id: 'practice', label: 'Practice', icon: CheckSquare, aliases: ['practice', 'cbt'] },
  { id: 'ask', label: 'Ask', icon: MessageSquare, aliases: ['ask'] },
  { id: 'projects', label: 'Projects', icon: Wrench, aliases: ['projects', 'problem-lab', 'portfolio'] },
  { id: 'me', label: 'Me', icon: User, aliases: ['me', 'dashboard', 'settings', 'admin', 'help'] }
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTheme,
  activeModule,
  onSelectModule
}) => {
  const isLight = currentTheme === 'light';

  return (
    <nav
      aria-label="Mobile Navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md select-none transition-colors ${
        isLight
          ? 'bg-[#FDFBF7]/95 border-[#E8E1D3] text-[#142E22]'
          : 'bg-[#0B1612]/95 border-[#223A30] text-[#F6F3EE]'
      }`}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.aliases.includes(activeModule);

          return (
            <button
              key={tab.id}
              onClick={() => onSelectModule(tab.id)}
              className={`flex flex-col items-center justify-center tap-target-base transition-colors relative ${
                isActive
                  ? isLight
                    ? 'text-[#1B4332] font-semibold'
                    : 'text-[#E0A844] font-semibold'
                  : isLight
                    ? 'text-[#687D72] hover:text-[#142E22]'
                    : 'text-[#6E8578] hover:text-[#F6F3EE]'
              }`}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span
                  className={`absolute top-1.5 w-1 h-1 rounded-full ${
                    isLight ? 'bg-[#C67D0A]' : 'bg-[#E0A844]'
                  }`}
                />
              )}

              <Icon className={`w-5 h-5 ${isActive ? 'scale-105' : ''} transition-transform`} />
              <span className="text-[11px] mt-0.5 leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
