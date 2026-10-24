/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import {
  User,
  Moon,
  Sun,
  Zap,
  Download,
  Trash2,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

interface SettingsViewProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentTheme, onToggleTheme }) => {
  const { userProfile, updateProfileData, signOut, deleteAccount, currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [university, setUniversity] = useState(userProfile?.university || '');
  const [department, setDepartment] = useState(userProfile?.department || '');
  const [level, setLevel] = useState(userProfile?.level || '300L');
  const [lowDataMode, setLowDataMode] = useState(userProfile?.lowDataMode || false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await updateProfileData({
        displayName,
        university,
        department,
        level,
        lowDataMode,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError('Could not update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;
    setIsExporting(true);
    try {
      const [tutorSessions, cbtQuizzes, weakTopics, notes, portfolio] = await Promise.all([
        firestoreService.getTutorSessions(currentUser.uid),
        firestoreService.getCBTQuizzes(currentUser.uid),
        firestoreService.getWeakTopics(currentUser.uid),
        firestoreService.getScannedNotes(currentUser.uid),
        firestoreService.getPortfolioStudies(currentUser.uid),
      ]);

      const bundle = {
        exportedAt: new Date().toISOString(),
        profile: userProfile,
        tutorSessions,
        cbtQuizzes,
        weakTopics,
        scannedNotes: notes,
        portfolioStudies: portfolio,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `engihub_data_export_${currentUser.uid}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      setError('Error compiling data export. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await deleteAccount();
    } catch (err: any) {
      setError(err.message || 'Could not delete account. Re-authentication may be required.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <span className="font-mono text-xs uppercase tracking-wider text-[#EA580C] font-semibold block mb-1">
          Preferences & Account
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F4]">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#A8A29E] mt-1">
          Manage your academic credentials, rendering theme, data sovereignty, and security.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-[3px] bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile changes saved to Firestore.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-[3px] bg-[#450A0A] border border-[#DC2626]/50 text-[#FCA5A5] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Academic Credentials */}
      <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-5">
        <div className="border-b border-[#2C3038] pb-3">
          <h3 className="font-serif text-base font-bold text-[#F5F5F4] flex items-center gap-2">
            <User className="w-4 h-4 text-[#EA580C]" />
            Student Academic Identity
          </h3>
          <p className="text-xs text-[#A8A29E]">
            Used in portfolio exports and tailored baby-step explanations.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Registered Email</label>
              <input
                type="text"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3 py-2 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs text-[#78716C] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">University / Faculty</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. FUTA, UNILAG, ABU"
                className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
              >
                <option value="100L">100L</option>
                <option value="200L">200L</option>
                <option value="300L">300L</option>
                <option value="400L (SIWES)">400L (SIWES)</option>
                <option value="500L">500L</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#A8A29E] mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Mechanical & Mechatronics Engineering"
              className="w-full px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Visual & Network Modes */}
      <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4">
        <div className="border-b border-[#2C3038] pb-3">
          <h3 className="font-serif text-base font-bold text-[#F5F5F4] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#EA580C]" />
            Environment & Network
          </h3>
          <p className="text-xs text-[#A8A29E]">
            Display theme and bandwidth economy controls.
          </p>
        </div>

        <div className="divide-y divide-[#2C3038]">
          {/* Theme Switcher */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#F5F5F4] block">Drafting Theme</span>
              <span className="text-[11px] text-[#A8A29E]">
                {currentTheme === 'dark' ? 'Deep ink-charcoal drafting surface' : 'Warm off-white paper notebook'}
              </span>
            </div>
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs text-[#F5F5F4] hover:border-[#EA580C] transition-colors"
            >
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Switch to Paper (Light)</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Switch to Ink (Dark)</span>
                </>
              )}
            </button>
          </div>

          {/* Low Data Mode */}
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#F5F5F4] block">Low-Data Mode</span>
              <span className="text-[11px] text-[#A8A29E]">
                Compresses AI token output and skips heavy image data on slow 2G/3G campus connections.
              </span>
            </div>
            <button
              onClick={async () => {
                const next = !lowDataMode;
                setLowDataMode(next);
                await updateProfileData({ lowDataMode: next });
              }}
              className={`px-3 py-1.5 rounded-[3px] text-xs font-mono font-semibold border transition-colors ${
                lowDataMode
                  ? 'bg-[#EA580C] text-white border-[#EA580C]'
                  : 'bg-[#1F2228] text-[#78716C] border-[#2C3038]'
              }`}
            >
              {lowDataMode ? 'ACTIVE [ON]' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Data Sovereignty & Account Termination */}
      <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4">
        <div className="border-b border-[#2C3038] pb-3">
          <h3 className="font-serif text-base font-bold text-[#F5F5F4] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
            Data Sovereignty & Account
          </h3>
          <p className="text-xs text-[#A8A29E]">
            Export all stored coursework or delete your profile permanently.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[3px] bg-[#121316] border border-[#2C3038]">
            <div>
              <span className="text-xs font-semibold text-[#F5F5F4] block">Export All Stored Data</span>
              <span className="text-[11px] text-[#A8A29E]">
                Downloads a clean JSON archive containing your CBT scores, notes, weak topics, and portfolio studies.
              </span>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[3px] bg-[#1F2228] hover:bg-[#282C34] border border-[#2C3038] text-xs font-semibold text-[#F5F5F4] shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>{isExporting ? 'Compiling Archive...' : 'Download JSON Bundle'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[3px] bg-[#121316] border border-[#2C3038]">
            <div>
              <span className="text-xs font-semibold text-[#F5F5F4] block">Sign Out</span>
              <span className="text-[11px] text-[#A8A29E]">
                Ends your active session on this device.
              </span>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[3px] bg-[#1F2228] hover:bg-[#282C34] border border-[#2C3038] text-xs font-semibold text-[#F5F5F4] shrink-0 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="p-3.5 rounded-[3px] bg-[#450A0A]/40 border border-[#DC2626]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-[#FCA5A5] block">Delete Account & Data</span>
              <span className="text-[11px] text-[#FCA5A5]/80">
                Permanently wipes all your coursework, CBT analytics, and private records from Firestore.
              </span>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[3px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shrink-0 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="max-w-md w-full bg-[#181A1F] border border-[#DC2626] rounded-[4px] p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F5F5F4]">
              Confirm Irreversible Deletion
            </h3>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Are you certain you wish to delete your account? This will permanently erase your academic profile, completed CBT tests, and portfolio case studies from our Firestore database. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs text-[#F5F5F4]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-[3px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
