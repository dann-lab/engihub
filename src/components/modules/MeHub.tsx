/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Me Hub: Student Profile, Progress Dashboard, Settings & Admin View
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProgressDashboard } from './ProgressDashboard';
import { SettingsView } from './SettingsView';
import { AdminView } from './AdminView';
import { NavigationModule } from '../../types';
import { BarChart2, Settings, Shield } from 'lucide-react';

interface MeHubProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigateToModule: (module: NavigationModule) => void;
  initialSubTab?: 'overview' | 'settings' | 'admin';
}

export const MeHub: React.FC<MeHubProps> = ({
  currentTheme,
  onToggleTheme,
  onNavigateToModule,
  initialSubTab = 'overview'
}) => {
  const { isAdmin } = useAuth();
  const [subTab, setSubTab] = useState<'overview' | 'settings' | 'admin'>(initialSubTab);

  return (
    <div className="space-y-4">
      {/* Sub-tab segmented control */}
      <div className="flex items-center justify-between border-b pb-3 border-[#E8E1D3] dark:border-[#234436]">
        <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-white/60 dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436]">
          <button
            onClick={() => setSubTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'overview'
                ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-semibold'
                : 'text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Academic Overview</span>
          </button>

          <button
            onClick={() => setSubTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'settings'
                ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-semibold'
                : 'text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences & Account</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setSubTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                subTab === 'admin'
                  ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-semibold'
                  : 'text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#C67D0A] dark:text-[#E0A844]" />
              <span>Admin Management</span>
            </button>
          )}
        </div>
      </div>

      {subTab === 'overview' && (
        <ProgressDashboard onNavigateToModule={onNavigateToModule} />
      )}

      {subTab === 'settings' && (
        <SettingsView currentTheme={currentTheme} onToggleTheme={onToggleTheme} />
      )}

      {subTab === 'admin' && isAdmin && (
        <AdminView />
      )}
    </div>
  );
};
