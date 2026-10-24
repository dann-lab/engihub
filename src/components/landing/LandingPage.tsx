/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, BookOpen, CheckSquare, ScanText, Wrench } from 'lucide-react';
import { MathRenderer } from '../MathRenderer';

interface LandingPageProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-[#121316] text-[#F5F5F4] drafting-grid flex flex-col justify-between selection:bg-orange-500/30 selection:text-orange-200">
      {/* Minimal Top Header */}
      <header className="border-b border-[#2C3038] bg-[#121316]/90 backdrop-blur-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F4]">
              Engi<span className="text-[#EA580C]">Hub</span>
            </span>
            <span className="font-mono text-[10px] text-[#A8A29E] tracking-wider uppercase hidden sm:inline">
              // Nigerian Engineering Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('signin')}
              className="text-xs font-mono text-[#A8A29E] hover:text-[#F5F5F4] transition-colors px-2 py-1"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="text-xs font-semibold px-3 py-1.5 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-16 w-full space-y-16">
        {/* Strong first line & short paragraph */}
        <div className="max-w-2xl space-y-4">
          <span className="font-mono text-xs uppercase tracking-wider text-[#EA580C] font-semibold">
            Faculty of Engineering & Technology
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F4] leading-[1.15]">
            Engineering taught from first principles, step by step.
          </h1>
          <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed">
            EngiHub is a workspace built for engineering students in Nigerian universities. Pick a course, work through unabbreviated math derivations, test your understanding on exam-standard CBT sets, and turn local infrastructure challenges into solved case studies.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenAuth('signup')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold tracking-wide transition-colors"
            >
              <span>Open Student Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-[#78716C] font-mono">
              FUTA • UNILAG • ABU • UNN • UNILORIN
            </span>
          </div>
        </div>

        {/* Real Product Preview: Worked Thermodynamics Board Notebook (No stock illustrations!) */}
        <div className="border border-[#2C3038] rounded-[4px] bg-[#181A1F] overflow-hidden shadow-2xl">
          <div className="border-b border-[#2C3038] px-4 py-2.5 bg-[#1F2228] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
              <span className="font-mono text-xs font-semibold text-[#F5F5F4]">
                MEE 301 // Thermodynamics // Air-Standard Diesel Cycle
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#A8A29E] uppercase">
              Step 1 of 4 • Worked Derivation
            </span>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            <div>
              <span className="font-mono text-[11px] text-[#EA580C] uppercase font-semibold">
                Problem Statement & State Point 1
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F5F5F4] mt-0.5">
                Calculate State Properties at End of Isentropic Compression
              </h3>
              <p className="text-xs sm:text-sm text-[#A8A29E] mt-1 leading-relaxed">
                Consider an air-standard Diesel cycle operating in an engine running at ambient temperature in Akure. Initial inlet conditions are P₁ = 100 kPa, T₁ = 300 K, with a compression ratio r = 16. Working fluid is dry air with ratio of specific heats γ = 1.4.
              </p>
            </div>

            {/* Formula Block set apart on its own lines */}
            <div className="space-y-3 p-4 rounded-[3px] bg-[#121316] border border-[#2C3038]">
              <span className="font-mono text-[10px] text-[#78716C] uppercase block">
                Governing Isentropic Relation (Process 1 &rarr; 2):
              </span>
              <MathRenderer
                math="T_2 = T_1 \cdot \left(\frac{V_1}{V_2}\right)^{\gamma - 1} = T_1 \cdot r^{\gamma - 1}"
                block={true}
              />
              <span className="font-mono text-[10px] text-[#78716C] uppercase block mt-2">
                Numerical Substitution:
              </span>
              <MathRenderer
                math="T_2 = 300 \cdot (16)^{1.4 - 1} = 300 \cdot (16)^{0.4} = 300 \cdot 3.0314 = 909.43\text{ K}"
                block={true}
              />
              <span className="font-mono text-[10px] text-[#78716C] uppercase block mt-2">
                Pressure Sizing at Top Dead Centre:
              </span>
              <MathRenderer
                math="P_2 = P_1 \cdot r^{\gamma} = 100\text{ kPa} \cdot (16)^{1.4} = 100 \cdot 48.50 = 4,850\text{ kPa} \quad (4.85\text{ MPa})"
                block={true}
              />
            </div>

            {/* Step Control as described in spec */}
            <div className="pt-3 border-t border-[#2C3038] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs text-[#F5F5F4] block font-semibold">
                  State point 2 verified.
                </span>
                <span className="text-xs text-[#78716C]">
                  Ready to calculate constant-pressure heat addition ($2 \to 3$)?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 py-1.5 rounded-[3px] bg-[#1F2228] border border-[#2C3038] text-xs font-mono text-[#A8A29E] hover:text-[#F5F5F4]"
                >
                  "I'm Lost" (Simpler Analogy)
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-1.5 rounded-[3px] bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold"
                >
                  Next Step &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Four functional pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-[3px] bg-[#181A1F] border border-[#2C3038] space-y-2">
            <BookOpen className="w-4 h-4 text-[#EA580C]" />
            <h4 className="font-serif text-sm font-bold text-[#F5F5F4]">Baby-Step Tutor</h4>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Every term defined the first time it appears. Step-gated derivations with real-life analogies when you get stuck.
            </p>
          </div>

          <div className="p-4 rounded-[3px] bg-[#181A1F] border border-[#2C3038] space-y-2">
            <CheckSquare className="w-4 h-4 text-[#EA580C]" />
            <h4 className="font-serif text-sm font-bold text-[#F5F5F4]">Immediate CBT</h4>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Full worked steps right after each answer, not dumped at the end. Automated weak topics revision tracker.
            </p>
          </div>

          <div className="p-4 rounded-[3px] bg-[#181A1F] border border-[#2C3038] space-y-2">
            <ScanText className="w-4 h-4 text-[#EA580C]" />
            <h4 className="font-serif text-sm font-bold text-[#F5F5F4]">Note Scanner</h4>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Transcribe handwritten notes into clean LaTeX and generate step-by-step solutions to textbook assignment problems.
            </p>
          </div>

          <div className="p-4 rounded-[3px] bg-[#181A1F] border border-[#2C3038] space-y-2">
            <Wrench className="w-4 h-4 text-[#EA580C]" />
            <h4 className="font-serif text-sm font-bold text-[#F5F5F4]">Community Problem Lab</h4>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Senior engineer designs for local blackouts, water filtration, and crop storage with Naira BEME pricing.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C3038] py-6 px-4 sm:px-8 text-center sm:text-left">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#78716C] font-mono">
            EngiHub // Engineering Education & Social Impact Initiative for Nigeria.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#A8A29E]">
            <button onClick={() => onOpenAuth('signin')} className="hover:text-[#F5F5F4]">Sign In</button>
            <button onClick={() => onOpenAuth('signup')} className="hover:text-[#F5F5F4]">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
