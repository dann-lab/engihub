/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Flame,
  Wifi,
  WifiOff,
  User,
  Settings,
  X,
  GraduationCap,
  Sparkles,
  Save,
  Zap
} from 'lucide-react';
import { AppSettings, UserProgress } from '../types';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  progress: UserProgress;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  progress,
  isOnline,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);

  const toggleLowData = () => {
    const updated = { ...settings, lowDataMode: !settings.lowDataMode };
    onUpdateSettings(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(tempSettings);
    setShowProfileModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 md:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
              <GraduationCap className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg md:text-xl tracking-tight text-white font-mono">
                  Engi<span className="text-emerald-400">Hub</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold uppercase tracking-wider hidden sm:inline-block">
                  NG Engineering AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Learning & Community Problem Lab for Nigerian Universities
              </p>
            </div>
          </div>

          {/* Controls: Streak, Low Data, Online/Offline, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Study Streak */}
            <div
              title={`${progress.studyStreakDays} day study streak!`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-inner"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{progress.studyStreakDays}d</span>
            </div>

            {/* Low Data Mode Toggle */}
            <button
              onClick={toggleLowData}
              title={
                settings.lowDataMode
                  ? 'Low-Data Mode active: Shorter responses, saved bandwidth'
                  : 'Click to enable Low-Data mode for 2G/3G slow networks'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                settings.lowDataMode
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${settings.lowDataMode ? 'text-emerald-400 fill-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Low-Data</span>
              <span className={`text-[10px] font-bold px-1 rounded ${settings.lowDataMode ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {settings.lowDataMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Network Status Badge */}
            <div
              title={isOnline ? 'Connected to EngiHub server' : 'Offline - Running from browser IndexedDB'}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300"
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Offline (Cached)</span>
                </>
              )}
            </div>

            {/* Student Profile / Settings Button */}
            <button
              onClick={() => {
                setTempSettings(settings);
                setShowProfileModal(true);
              }}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
              title="Student Profile & Settings"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium hidden md:inline truncate max-w-[120px]">
                {settings.studentName.split(' ')[0] || 'Profile'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Profile & Settings Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base md:text-lg">Student Profile & Settings</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={tempSettings.studentName}
                  onChange={(e) => setTempSettings({ ...tempSettings, studentName: e.target.value })}
                  placeholder="e.g. Engr. Daniel Olorunlana"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  University / Polytechnic
                </label>
                <input
                  type="text"
                  value={tempSettings.university}
                  onChange={(e) => setTempSettings({ ...tempSettings, university: e.target.value })}
                  placeholder="e.g. FUTA, UNILAG, ABU Zaria, UNN"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={tempSettings.department}
                    onChange={(e) => setTempSettings({ ...tempSettings, department: e.target.value })}
                    placeholder="Mechanical, Electrical, Civil..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Level
                  </label>
                  <select
                    value={tempSettings.level}
                    onChange={(e) => setTempSettings({ ...tempSettings, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="100L (Pre-Engineering)">100L (Pre-Eng)</option>
                    <option value="200L (Foundations)">200L (Foundations)</option>
                    <option value="300L (Core Design)">300L (Core Design)</option>
                    <option value="400L (SIWES Candidate)">400L (SIWES)</option>
                    <option value="500L (Final Year Project)">500L (Final Year)</option>
                    <option value="Graduate / NYSC">Graduate / NYSC</option>
                  </select>
                </div>
              </div>

              {/* Low data mode switch in modal */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-semibold text-xs text-white block">Low-Data Saver Mode</span>
                    <span className="text-[11px] text-slate-400 block">
                      Compresses responses and skips heavy images for 2G/3G campus Wi-Fi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, lowDataMode: !tempSettings.lowDataMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tempSettings.lowDataMode ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tempSettings.lowDataMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
