/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  CheckSquare,
  ScanText,
  Lightbulb,
  Briefcase,
  LayoutDashboard
} from 'lucide-react';
import { NavigationModule } from '../types';

interface NavbarProps {
  activeModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
}

interface NavItem {
  id: NavigationModule;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'tutor', label: 'AI Tutor', shortLabel: 'Tutor', icon: GraduationCap },
  { id: 'cbt', label: 'CBT Engine', shortLabel: 'CBT', icon: CheckSquare },
  { id: 'scanner', label: 'Note Scanner', shortLabel: 'Scanner', icon: ScanText },
  { id: 'problem-lab', label: 'Problem Lab', shortLabel: 'Problem Lab', icon: Lightbulb, badge: 'Core' },
  { id: 'portfolio', label: 'Portfolio', shortLabel: 'Portfolio', icon: Briefcase },
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Progress', icon: LayoutDashboard },
];

export const Navbar: React.FC<NavbarProps> = ({ activeModule, onSelectModule }) => {
  return (
    <>
      {/* Desktop & Tablet Top Navigation Tabs */}
      <nav className="hidden md:block bg-slate-950 border-b border-slate-800/80 sticky top-[57px] z-20 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-1 py-1.5 overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Thumb friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-6 gap-0.5 max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-emerald-500/20 text-emerald-400' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
                  {item.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
