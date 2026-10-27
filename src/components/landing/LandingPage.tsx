/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Campus Landing Page
 * Aesthetic: Warm, lively Nigerian campus study space made by a student who cares.
 * Palette: Warm cream background, deep forest green main, sunny yellow-gold accent.
 */

import React from 'react';
import { ArrowRight, BookOpen, CheckSquare, MessageSquare, Wrench } from 'lucide-react';
import { MathRenderer } from '../MathRenderer';

interface LandingPageProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#142E22] flex flex-col justify-between selection:bg-[#E0A844]/30 selection:text-[#142E22]">
      {/* Campus Top Bar */}
      <header className="border-b border-[#E8E1D3] bg-[#FDFBF7]/90 backdrop-blur-xs px-4 sm:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              E
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#142E22]">
                Engi<span className="text-[#C67D0A]">Hub</span>
              </span>
              <span className="text-[10px] text-[#687D72] uppercase tracking-wider hidden sm:inline ml-2">
                Campus Study Space
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('signin')}
              className="text-xs font-semibold text-[#405449] hover:text-[#142E22] transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#143427] text-white shadow-xs transition-colors tap-target-base"
            >
              Open Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-16 w-full space-y-16">
        {/* Hero Section */}
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F5EFE6] border border-[#E8E1D3] text-xs font-medium text-[#1B4332]">
            <span className="w-2 h-2 rounded-full bg-[#C67D0A]" />
            <span>Built for Nigerian University Engineering Students</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#142E22] leading-[1.15]">
            Engineering taught from first principles, step by step.
          </h1>

          <p className="text-base sm:text-lg text-[#405449] leading-relaxed">
            A warm, focused study space built to help you master university coursework. Work through complete mathematical derivations, practice on exam-standard CBT sets with instant worked steps, ask questions when you get stuck, and document real community engineering projects.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#143427] text-white text-sm font-semibold shadow-xs transition-colors tap-target-base"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-[#DDA15E]" />
            </button>

            <span className="text-xs text-[#687D72]">
              FUTA · UNILAG · ABU · UNN · UNILORIN · OAU
            </span>
          </div>
        </div>

        {/* Real Board Note Preview: Worked Thermodynamics Derivation */}
        <div className="border border-[#E8E1D3] rounded-xl bg-white overflow-hidden paper-shadow-md">
          <div className="border-b border-[#E8E1D3] px-5 py-3 bg-[#F5EFE6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C67D0A]" />
              <span className="text-xs font-semibold text-[#142E22]">
                Thermodynamics · Air-Standard Diesel Cycle
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#687D72]">
              Step 1 of 4 · Worked Derivation
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C67D0A]">
                Problem Statement & State Point 1
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#142E22] mt-1">
                Calculate State Properties at End of Isentropic Compression
              </h3>
              <p className="text-sm text-[#405449] mt-1 leading-relaxed">
                Consider an air-standard Diesel cycle operating at ambient temperature in Akure. Initial inlet conditions are P₁ = 100 kPa, T₁ = 300 K, with a compression ratio r = 16. Working fluid is dry air with ratio of specific heats γ = 1.4.
              </p>
            </div>

            {/* Formula Block */}
            <div className="space-y-3 p-4 rounded-lg bg-[#FAF6EE] border border-[#E8E1D3]">
              <span className="text-[11px] font-mono text-[#687D72] uppercase block">
                Governing Isentropic Relation (Process 1 &rarr; 2):
              </span>
              <MathRenderer
                math="T_2 = T_1 \cdot \left(\frac{V_1}{V_2}\right)^{\gamma - 1} = T_1 \cdot r^{\gamma - 1}"
                block={true}
              />
              <span className="text-[11px] font-mono text-[#687D72] uppercase block mt-2">
                Numerical Substitution:
              </span>
              <MathRenderer
                math="T_2 = 300 \cdot (16)^{1.4 - 1} = 300 \cdot (16)^{0.4} = 300 \cdot 3.0314 = 909.43\text{ K}"
                block={true}
              />
            </div>

            {/* Step Controls */}
            <div className="pt-3 border-t border-[#E8E1D3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#142E22] block">
                  State point 2 verified.
                </span>
                <span className="text-xs text-[#687D72]">
                  Ready to calculate constant-pressure heat addition ($2 \to 3$)?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 py-2 rounded-lg bg-[#F5EFE6] border border-[#E8E1D3] text-xs font-medium text-[#405449] hover:text-[#142E22]"
                >
                  "I'm Lost" (Simpler Analogy)
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold"
                >
                  Next Step &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Study Hall Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#E8E1D3] paper-shadow-sm space-y-2">
            <BookOpen className="w-5 h-5 text-[#1B4332]" />
            <h4 className="font-serif text-base font-bold text-[#142E22]">Step-by-Step Tutor</h4>
            <p className="text-xs text-[#405449] leading-relaxed">
              Every term defined the first time it appears. Step-gated derivations with real-life analogies when you get stuck.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E8E1D3] paper-shadow-sm space-y-2">
            <CheckSquare className="w-5 h-5 text-[#1B4332]" />
            <h4 className="font-serif text-base font-bold text-[#142E22]">CBT Exam Center</h4>
            <p className="text-xs text-[#405449] leading-relaxed">
              Full worked steps right after each answer, not dumped at the end. Spaced repetition for questions you miss.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E8E1D3] paper-shadow-sm space-y-2">
            <MessageSquare className="w-5 h-5 text-[#1B4332]" />
            <h4 className="font-serif text-base font-bold text-[#142E22]">Ask Study Partner</h4>
            <p className="text-xs text-[#405449] leading-relaxed">
              Ask anything across engineering, mathematics, coding, and coursework. Choose quick answers or baby-step explanations.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E8E1D3] paper-shadow-sm space-y-2">
            <Wrench className="w-5 h-5 text-[#1B4332]" />
            <h4 className="font-serif text-base font-bold text-[#142E22]">Problem Lab</h4>
            <p className="text-xs text-[#405449] leading-relaxed">
              Practical designs for local challenges—solar installations, water filtration, and workshop fabrication with local parts.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E1D3] py-6 px-4 sm:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#687D72]">
            EngiHub · Engineering Workspace for Nigerian University Students. Built by Danni, <a href="https://dannistec.netlify.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#142E22]">Dannistec</a> · <a href="https://wa.me/2349040110170?text=Hello%20Danni" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366]">WA: 09040110170</a>
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#405449]">
            <a href="mailto:dannistec3@gmail.com" className="hover:text-[#142E22]">dannistec3@gmail.com</a>
            <button onClick={() => onOpenAuth('signin')} className="hover:text-[#142E22]">Sign In</button>
            <button onClick={() => onOpenAuth('signup')} className="hover:text-[#142E22]">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
