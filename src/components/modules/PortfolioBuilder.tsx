/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Project Portfolio Builder
 * Professional publication-grade engineering case study compiler.
 * Formatted for SIWES technical submissions, COREN evaluations, and scholarship applications.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { callNetlifyAI, FALLBACK_AI_ERROR } from '../../services/apiClient';
import { CommunityProblemSolution, PortfolioCaseStudy } from '../../types';
import { MarkdownView } from '../MarkdownView';
import { Skeleton } from '../common/Skeleton';
import {
  Briefcase,
  Printer,
  FileCheck,
  Award,
  BookOpen,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface PortfolioBuilderProps {
  incomingProblemSolution?: CommunityProblemSolution | null;
}

export const PortfolioBuilder: React.FC<PortfolioBuilderProps> = ({ incomingProblemSolution }) => {
  const { currentUser, userProfile, updateProfileData, recordDailyActivity } = useAuth();
  const [studies, setStudies] = useState<PortfolioCaseStudy[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<PortfolioCaseStudy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [availableSolutions, setAvailableSolutions] = useState<CommunityProblemSolution[]>([]);
  const [chosenSolutionId, setChosenSolutionId] = useState('');

  useEffect(() => {
    if (currentUser) {
      firestoreService.getPortfolioStudies(currentUser.uid).then((list) => {
        setStudies(list);
        if (list.length > 0 && !selectedStudy) setSelectedStudy(list[0]);
      }).catch(console.error);

      firestoreService.getCommunitySolutions().then((sols) => {
        setAvailableSolutions(sols);
        if (sols.length > 0 && !chosenSolutionId) setChosenSolutionId(sols[0].id);
      }).catch(console.error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (incomingProblemSolution && currentUser) {
      handleGenerateStudy(incomingProblemSolution);
    }
  }, [incomingProblemSolution]);

  const handleGenerateStudy = async (solution: CommunityProblemSolution) => {
    if (!currentUser || !userProfile) return;
    setIsGenerating(true);
    setError('');

    try {
      const data = await callNetlifyAI<any>({
        module: 'portfolio',
        problemSolution: solution,
        studentName: userProfile.displayName,
        university: userProfile.university,
        department: userProfile.department,
        level: userProfile.level,
        lowDataMode: userProfile.lowDataMode
      });

      const newStudy: PortfolioCaseStudy = {
        ...data,
        id: `study_${Date.now()}`,
        problemLabId: solution.id,
        authorName: userProfile.displayName,
        university: userProfile.university,
        department: userProfile.department,
        level: userProfile.level,
        bemeCostSummaryNaira: solution.totalEstimatedCostNaira || data.bemeCostSummaryNaira || 0,
        createdAt: Date.now()
      };

      await firestoreService.savePortfolioStudy(currentUser.uid, newStudy);
      const refreshed = await firestoreService.getPortfolioStudies(currentUser.uid);
      setStudies(refreshed);
      setSelectedStudy(newStudy);

      if (newStudy.skillsDemonstrated && newStudy.skillsDemonstrated.length > 0) {
        const nextSkills = Array.from(new Set([...userProfile.skillsEarned, ...newStudy.skillsDemonstrated]));
        await updateProfileData({ skillsEarned: nextSkills });
      }
      recordDailyActivity(undefined, newStudy.skillsDemonstrated?.[0] || 'SIWES Technical Documentation');
    } catch (err: any) {
      console.error('Portfolio generation error:', err);
      setError(FALLBACK_AI_ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    if (!window.confirm('Delete this case study document?')) return;
    await firestoreService.deletePortfolioStudy(currentUser.uid, id);
    const refreshed = await firestoreService.getPortfolioStudies(currentUser.uid);
    setStudies(refreshed);
    if (selectedStudy?.id === id) {
      setSelectedStudy(refreshed[0] || null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="border-b border-[#2C3038] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#EA580C] font-semibold block mb-1">
            Module 05 // Professional Dossier
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F4]">
            Project Portfolio Builder
          </h1>
          <p className="text-xs text-[#A8A29E] mt-0.5">
            Publication-grade case studies formatted for SIWES submissions, COREN evaluations, and postgraduate scholarships.
          </p>
        </div>

        {selectedStudy && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Print Case Study</span>
          </button>
        )}
      </div>

      {/* Generator card */}
      <div className="p-5 sm:p-6 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-[#F5F5F4]">
              Compile New Technical Case Study
            </h3>
            <p className="text-xs text-[#A8A29E]">
              Select a solved community design to generate a formal engineering dossier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={chosenSolutionId}
              onChange={(e) => setChosenSolutionId(e.target.value)}
              className="px-3 py-2 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#EA580C] max-w-xs"
            >
              {availableSolutions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.problemTitle}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const chosen = availableSolutions.find((s) => s.id === chosenSolutionId);
                if (chosen) handleGenerateStudy(chosen);
              }}
              disabled={isGenerating || !chosenSolutionId}
              className="px-3.5 py-2 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold tracking-wide disabled:opacity-50 transition-colors"
            >
              {isGenerating ? 'Compiling...' : 'Generate Case Study'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-[3px] bg-[#450A0A] border border-[#DC2626]/50 text-xs text-[#FCA5A5] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tabs of existing studies */}
      {studies.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 no-print">
          {studies.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudy(s)}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-mono border transition-colors shrink-0 ${
                selectedStudy?.id === s.id
                  ? 'bg-[#1F2228] border-[#EA580C] text-[#F5F5F4]'
                  : 'bg-[#181A1F] border-[#2C3038] text-[#78716C] hover:text-[#A8A29E]'
              }`}
            >
              {s.title.slice(0, 30)}...
            </button>
          ))}
        </div>
      )}

      {/* Document View */}
      {selectedStudy ? (
        <div className="p-6 sm:p-10 rounded-[4px] bg-[#181A1F] border border-[#2C3038] space-y-8 print-page">
          {/* Header */}
          <div className="border-b border-[#2C3038] pb-6 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-[#78716C]">
              <span>COREN / SIWES Technical Dossier</span>
              <span>{new Date(selectedStudy.createdAt).toLocaleDateString()}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5F4] leading-snug">
              {selectedStudy.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs font-mono">
              <div>
                <span className="text-[#78716C] block text-[10px]">LEAD CANDIDATE:</span>
                <span className="text-[#F5F5F4] font-semibold">{selectedStudy.authorName}</span>
              </div>
              <div>
                <span className="text-[#78716C] block text-[10px]">FACULTY / UNIV:</span>
                <span className="text-[#F5F5F4] font-semibold">{selectedStudy.university}</span>
              </div>
              <div>
                <span className="text-[#78716C] block text-[10px]">DISCIPLINE & LEVEL:</span>
                <span className="text-[#F5F5F4] font-semibold">{selectedStudy.department} ({selectedStudy.level})</span>
              </div>
              <div>
                <span className="text-[#78716C] block text-[10px]">ESTIMATED BEME:</span>
                <span className="text-[#EA580C] font-semibold">₦{Number(selectedStudy.bemeCostSummaryNaira || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sections */}
          {(() => {
            const anyStudy = selectedStudy as any;
            const execSummary = selectedStudy.executiveSummary || anyStudy.abstract || '';
            const probStatement = selectedStudy.problemStatement || '';
            const techMethodology = selectedStudy.technicalMethodology || anyStudy.engineeringMethodology || '';
            const mathValidation = selectedStudy.mathematicalValidation || 
              (Array.isArray(anyStudy.equationsAndCalculations) 
                ? anyStudy.equationsAndCalculations.map((eq: any) => `**${eq.name || 'Formula'}**\n$$${eq.latex || ''}$$\n${eq.description || ''}`).join('\n\n') 
                : anyStudy.equationsAndCalculations || '');
            const safety = selectedStudy.safetyAndEthics || anyStudy.safetyAndStandardsCompliance || '';
            const impact = selectedStudy.resultsAndImpact || anyStudy.outcomesAndImpact || '';
            const lessons = (selectedStudy.lessonsLearned && selectedStudy.lessonsLearned.length > 0)
              ? selectedStudy.lessonsLearned
              : anyStudy.lessons || [
                  'Rigorous thermal dissipation sizing is essential in Nigerian high-ambient operating conditions.',
                  'Procurability of standard replacement parts from local markets (Ladipo/Alaba/Panteka) reduces downtime from weeks to hours.',
                  'Safety interlocks and earthing safeguards prevent electrocution and expensive component burnout.'
                ];
            const skills = (selectedStudy.skillsDemonstrated && selectedStudy.skillsDemonstrated.length > 0)
              ? selectedStudy.skillsDemonstrated
              : anyStudy.skills || ['Engineering Analysis', 'BEME Budgeting', 'System Sizing', 'Safety Compliance'];

            return (
              <div className="space-y-6 text-sm">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                    1.0 Executive Summary
                  </h3>
                  <div className="text-[#A8A29E] leading-relaxed">
                    <MarkdownView content={execSummary} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                    2.0 Problem Statement & Local Context
                  </h3>
                  <div className="text-[#A8A29E] leading-relaxed">
                    <MarkdownView content={probStatement} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                    3.0 Technical Methodology & Specifications
                  </h3>
                  <div className="text-[#A8A29E] leading-relaxed">
                    <MarkdownView content={techMethodology} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                    4.0 Mathematical Validation & Governing Relations
                  </h3>
                  <div className="p-4 rounded-[3px] bg-[#121316] border border-[#2C3038]">
                    <MarkdownView content={mathValidation} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider">
                    5.0 Risk Analysis, Safety & Ethics
                  </h3>
                  <div className="text-[#A8A29E] leading-relaxed">
                    <MarkdownView content={safety} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-mono text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                    6.0 Results & Impact Evaluation
                  </h3>
                  <div className="text-[#A8A29E] leading-relaxed">
                    <MarkdownView content={impact} />
                  </div>
                </div>

                {/* Skills & Lessons Learned */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#2C3038]">
                  <div className="p-4 rounded-[3px] bg-[#121316] border border-[#2C3038] space-y-2">
                    <h4 className="font-mono text-xs font-bold text-[#F5F5F4] uppercase">
                      Key Lessons Learned
                    </h4>
                    <ul className="text-xs text-[#A8A29E] space-y-1.5 list-disc list-inside">
                      {lessons.map((l: string, i: number) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-[3px] bg-[#121316] border border-[#2C3038] space-y-2">
                    <h4 className="font-mono text-xs font-bold text-[#EA580C] uppercase">
                      Verified Engineering Competencies
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-[2px] bg-[#1F2228] border border-[#2C3038] text-[#F5F5F4]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="pt-6 border-t border-[#2C3038] flex justify-between items-center text-xs font-mono text-[#78716C] no-print">
            <span>Dossier ID: {selectedStudy.id}</span>
            <button
              onClick={() => handleDelete(selectedStudy.id)}
              className="text-red-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Case Study</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs font-mono text-[#78716C] bg-[#181A1F] rounded-[4px] border border-[#2C3038]">
          No technical case studies compiled yet. Select a solved problem above to generate.
        </div>
      )}
    </div>
  );
};
