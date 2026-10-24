/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavigationModule } from '../../types';
import {
  GraduationCap,
  CheckSquare,
  ScanText,
  Wrench,
  Briefcase,
  BarChart2,
  Settings,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ModuleTabsProps {
  activeModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
}

interface TabDef {
  id: NavigationModule;
  label: string;
  code: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: 'dashboard', label: 'Overview', code: '00', icon: BarChart2 },
  { id: 'tutor', label: 'AI Tutor', code: '01', icon: GraduationCap },
  { id: 'cbt', label: 'CBT Engine', code: '02', icon: CheckSquare },
  { id: 'scanner', label: 'Note Scanner', code: '03', icon: ScanText },
  { id: 'problem-lab', label: 'Problem Lab', code: '04', icon: Wrench },
  { id: 'portfolio', label: 'Portfolio', code: '05', icon: Briefcase },
];

export const ModuleTabs: React.FC<ModuleTabsProps> = ({ activeModule, onSelectModule }) => {
  const { isAdmin } = useAuth();

  return (
    <nav className="border-b border-[#2C3038] bg-[#121316] overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectModule(tab.id)}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-mono font-medium border-b-2 transition-colors shrink-0 ${
                isActive
                  ? 'border-[#EA580C] text-[#F5F5F4] bg-[#181A1F]'
                  : 'border-transparent text-[#78716C] hover:text-[#A8A29E]'
              }`}
            >
              <span className={`text-[10px] ${isActive ? 'text-[#EA580C]' : 'text-[#78716C]'}`}>
                {tab.code}
              </span>
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#EA580C]' : 'text-[#78716C]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {isAdmin && (
          <button
            onClick={() => onSelectModule('admin')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-mono font-medium border-b-2 transition-colors shrink-0 ${
              activeModule === 'admin'
                ? 'border-[#EA580C] text-[#F5F5F4] bg-[#181A1F]'
                : 'border-transparent text-[#EA580C]/70 hover:text-[#EA580C]'
            }`}
          >
            <span className="text-[10px]">06</span>
            <Shield className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </nav>
  );
};
