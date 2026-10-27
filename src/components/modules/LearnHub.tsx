/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Learn Hub: Combines Course Lessons (AITutor) and Note Scanner
 */

import React, { useState } from 'react';
import { AITutor } from './AITutor';
import { NoteScanner } from './NoteScanner';
import { BookOpen, ScanText } from 'lucide-react';

interface LearnHubProps {
  initialSubTab?: 'tutor' | 'scanner';
  onLaunchCBTWithNotes: (notesText: string, topicName: string) => void;
}

export const LearnHub: React.FC<LearnHubProps> = ({
  initialSubTab = 'tutor',
  onLaunchCBTWithNotes
}) => {
  const [subTab, setSubTab] = useState<'tutor' | 'scanner'>(initialSubTab);

  return (
    <div className="space-y-4">
      {/* Sub-tab segmented control */}
      <div className="flex items-center justify-between border-b pb-3 border-[#E8E1D3] dark:border-[#234436]">
        <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-white/60 dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436]">
          <button
            onClick={() => setSubTab('tutor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'tutor'
                ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-semibold'
                : 'text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Lessons & Tutor</span>
          </button>

          <button
            onClick={() => setSubTab('scanner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'scanner'
                ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-semibold'
                : 'text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
            }`}
          >
            <ScanText className="w-3.5 h-3.5" />
            <span>Note & Assignment Scanner</span>
          </button>
        </div>
      </div>

      {/* Active sub-view */}
      {subTab === 'tutor' ? (
        <AITutor />
      ) : (
        <NoteScanner onLaunchCBTWithNotes={onLaunchCBTWithNotes} />
      )}
    </div>
  );
};
