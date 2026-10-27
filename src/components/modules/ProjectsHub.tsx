/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Projects Hub: Unites Community Problem Lab & Portfolio Builder
 */

import React, { useState } from 'react';
import { ProblemLab } from './ProblemLab';
import { PortfolioBuilder } from './PortfolioBuilder';
import { Wrench, Briefcase } from 'lucide-react';
import { CommunityProblemSolution } from '../../types';

interface ProjectsHubProps {
  initialSubTab?: 'lab' | 'portfolio';
  incomingProblemSolution?: CommunityProblemSolution | null;
}

export const ProjectsHub: React.FC<ProjectsHubProps> = ({
  initialSubTab = 'lab',
  incomingProblemSolution
}) => {
  const [subTab, setSubTab] = useState<'lab' | 'portfolio'>(
    incomingProblemSolution ? 'portfolio' : initialSubTab
  );
  const [activeSolution, setActiveSolution] = useState<CommunityProblemSolution | null>(
    incomingProblemSolution || null
  );

  const handleSendToPortfolio = (solution: CommunityProblemSolution) => {
    setActiveSolution(solution);
    setSubTab('portfolio');
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab segmented control */}
      <div className="flex items-center justify-between border-b pb-3 border-[#E8E1D3] dark:border-[#234436]">
        <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-white/60 dark:bg-[#11221B] border-[#E8E1D3] dark:border-[#234436]">
          <button
            onClick={() => setSubTab('lab')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'lab'
                ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-semibold'
                : 'text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Community Problem Lab</span>
          </button>

          <button
            onClick={() => setSubTab('portfolio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'portfolio'
                ? 'bg-[#1B4332] dark:bg-[#2D6A4F] text-white shadow-xs font-semibold'
                : 'text-[#405449] dark:text-[#AEC1B6] hover:text-[#142E22] dark:hover:text-[#F6F3EE]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Technical Portfolio Builder</span>
          </button>
        </div>
      </div>

      {subTab === 'lab' ? (
        <ProblemLab onSendToPortfolio={handleSendToPortfolio} />
      ) : (
        <PortfolioBuilder incomingProblemSolution={activeSolution} />
      )}
    </div>
  );
};
