/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Campus Landing Page
 * Aesthetic: Warm, lively Nigerian campus study space made by a student who cares.
 * Palette: Warm cream background, deep forest green main, sunny yellow-gold accent.
 */

import React from 'react';
import { ArrowRight, BookOpen, CheckSquare, MessageSquare, Wrench, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { MathRenderer } from '../MathRenderer';
import { ILLUSTRATIONS } from '../../assets/illustrations';
import { motion } from 'motion/react';

interface LandingPageProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#142E22] flex flex-col justify-between selection:bg-[#E0A844]/30 selection:text-[#142E22] overflow-x-hidden relative">
      {/* Subtle animated ambient gradient glow in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#1B4332]/5 via-[#C67D0A]/5 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Campus Top Bar */}
      <header className="border-b border-[#E8E1D3] bg-[#FDFBF7]/90 backdrop-blur-xs px-4 sm:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
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
          </motion.div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('signin')}
              className="text-xs font-semibold text-[#405449] hover:text-[#142E22] transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenAuth('signup')}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#143427] text-white shadow-xs transition-colors tap-target-base relative overflow-hidden group"
            >
              <span className="relative z-10">Open Workspace</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Landing Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-16 w-full space-y-16">
        {/* Hero Section with Floating Engineering Formula Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">
          {/* Floating Formula Badge 1 (Thermodynamics) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              y: [0, -12, 0],
              rotate: [-1, 2, -1]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden md:flex absolute -top-6 right-8 lg:right-1/3 items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E1D3] shadow-md shadow-[#1B4332]/5 text-[11px] font-mono text-[#1B4332] pointer-events-none z-10"
          >
            <Sparkles className="w-3 h-3 text-[#C67D0A]" />
            <span>{"P_{hyd} = \\rho g Q H"}</span>
          </motion.div>

          {/* Floating Formula Badge 2 (Circuit Theory) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              y: [0, 10, 0],
              rotate: [1, -2, 1]
            }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="hidden md:flex absolute bottom-2 left-6 lg:left-1/3 items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E1D3] shadow-md shadow-[#1B4332]/5 text-[11px] font-mono text-[#C67D0A] pointer-events-none z-10"
          >
            <Zap className="w-3 h-3 text-[#1B4332]" />
            <span>V = I \cdot R</span>
          </motion.div>

          <div className="lg:col-span-7 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F5EFE6] border border-[#E8E1D3] text-xs font-medium text-[#1B4332]"
            >
              <span className="w-2 h-2 rounded-full bg-[#C67D0A] animate-ping" />
              <span>Built for Nigerian University Engineering Students</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#142E22] leading-[1.15]"
            >
              Engineering taught from first principles, step by step.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-base sm:text-lg text-[#405449] leading-relaxed"
            >
              A warm, focused study space built to help you master university coursework. Work through complete mathematical derivations, practice on exam-standard CBT sets with instant worked steps, ask questions when you get stuck, and document real community engineering projects.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="pt-2 flex flex-wrap items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenAuth('signup')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#143427] text-white text-sm font-semibold shadow-md shadow-[#1B4332]/25 transition-all tap-target-base relative overflow-hidden group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 text-[#DDA15E] group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <span className="text-xs text-[#687D72] font-mono">
                FUTA · UNILAG · ABU · UNN · UNILORIN · OAU
              </span>
            </motion.div>
          </div>

          {/* Hero Campus Illustration Frame with Physics Hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-2xl overflow-hidden border border-[#E8E1D3] bg-white p-2 paper-shadow-md hover:shadow-xl hover:shadow-[#1B4332]/10 transition-shadow"
            >
              <img
                src={ILLUSTRATIONS.heroStudents.src}
                alt={ILLUSTRATIONS.heroStudents.alt}
                width={ILLUSTRATIONS.heroStudents.width}
                height={ILLUSTRATIONS.heroStudents.height}
                className="w-full h-64 sm:h-72 object-cover rounded-xl"
              />
              <div className="px-3 py-2.5 flex items-center justify-between text-xs text-[#687D72]">
                <span className="font-medium text-[#142E22]">Campus Study Hall</span>
                <span className="text-[11px]">Peer derivation & collaborative review</span>
              </div>
            </motion.div>
          </motion.div>
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

        {/* Applied Engineering Visual Gallery: Workshop, Solar, Community Borehole */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C67D0A]">
                Ground Truth Engineering
              </span>
              <span className="text-[#687D72]">·</span>
              <span className="text-xs text-[#687D72]">Nigerian Context</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#142E22]">
              From Lecture Derivations to Community Fabrication
            </h3>
            <p className="text-xs sm:text-sm text-[#405449] mt-1 max-w-2xl leading-relaxed">
              Every course connects to practical engineering challenges solved with local Nigerian parts, university workshops, and real field conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Workshop card */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-xl border border-[#E8E1D3] bg-white overflow-hidden paper-shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-[#1B4332]/10 transition-shadow group"
            >
              <div>
                <img
                  src={ILLUSTRATIONS.workshop.src}
                  alt={ILLUSTRATIONS.workshop.alt}
                  width={ILLUSTRATIONS.workshop.width}
                  height={ILLUSTRATIONS.workshop.height}
                  loading="lazy"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#C67D0A] font-bold">
                    Mechanical Fabrication
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#142E22]">
                    Workshop Practice & Lathe Work
                  </h4>
                  <p className="text-xs text-[#405449] leading-relaxed">
                    Lathe cutting speed formulas, cutting tool angles, MMA welding joints, and precision metrology on standard faculty machinery.
                  </p>
                </div>
              </div>
              <div className="px-4 py-2.5 border-t border-[#E8E1D3] bg-[#FAF6EE] text-[11px] text-[#687D72]">
                MEE 101/201 · Hands-On Production
              </div>
            </motion.div>

            {/* Solar Roof card */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-xl border border-[#E8E1D3] bg-white overflow-hidden paper-shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-[#1B4332]/10 transition-shadow group"
            >
              <div>
                <img
                  src={ILLUSTRATIONS.solarRoof.src}
                  alt={ILLUSTRATIONS.solarRoof.alt}
                  width={ILLUSTRATIONS.solarRoof.width}
                  height={ILLUSTRATIONS.solarRoof.height}
                  loading="lazy"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#C67D0A] font-bold">
                    Renewable Power
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#142E22]">
                    Rooftop Solar & Microgrid Sizing
                  </h4>
                  <p className="text-xs text-[#405449] leading-relaxed">
                    Peak sun hour sizing, inverter load factor calculations, MPPT charge controllers, and battery bank autonomy for campus labs.
                  </p>
                </div>
              </div>
              <div className="px-4 py-2.5 border-t border-[#E8E1D3] bg-[#FAF6EE] text-[11px] text-[#687D72]">
                EEE 301 · Off-Grid Solar Sizing
              </div>
            </motion.div>

            {/* Borehole card */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-xl border border-[#E8E1D3] bg-white overflow-hidden paper-shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-[#1B4332]/10 transition-shadow group"
            >
              <div>
                <img
                  src={ILLUSTRATIONS.borehole.src}
                  alt={ILLUSTRATIONS.borehole.alt}
                  width={ILLUSTRATIONS.borehole.width}
                  height={ILLUSTRATIONS.borehole.height}
                  loading="lazy"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#C67D0A] font-bold">
                    Water Resources
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#142E22]">
                    Solar Borehole & Network Flow
                  </h4>
                  <p className="text-xs text-[#405449] leading-relaxed">
                    Darcy-Weisbach head loss equations, submersible pump wattage, and overhead tank gravity distribution networks.
                  </p>
                </div>
              </div>
              <div className="px-4 py-2.5 border-t border-[#E8E1D3] bg-[#FAF6EE] text-[11px] text-[#687D72]">
                CEE 303 · Community Hydraulic Design
              </div>
            </motion.div>
          </div>
        </div>

        {/* 4 Study Hall Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-xl bg-white border border-[#E8E1D3] paper-shadow-sm space-y-2 hover:border-[#1B4332] hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#1B4332]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#142E22]">Step-by-Step Tutor</h4>
            <p className="text-xs text-[#405449] leading-relaxed">
              Every term defined the first time it appears. Step-gated derivations with real-life analogies when you get stuck.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-xl bg-white border border-[#E8E1D3] paper-shadow-sm space-y-2 hover:border-[#1B4332] hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332]/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-[#1B4332]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#142E22]">CBT Exam Center</h4>
            <p className="text-xs text-[#405449] leading-relaxed">
              Full worked steps right after each answer, not dumped at the end. Spaced repetition for questions you miss.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-xl bg-white border border-[#E8E1D3] paper-shadow-sm space-y-2 hover:border-[#1B4332] hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#1B4332]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#142E22]">Ask Study Partner</h4>
            <p className="text-xs text-[#405449] leading-relaxed">
              Ask anything across engineering, mathematics, coding, and coursework. Choose quick answers or baby-step explanations.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-5 rounded-xl bg-white border border-[#E8E1D3] paper-shadow-sm space-y-2 hover:border-[#1B4332] hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332]/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#1B4332]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#142E22]">Problem Lab</h4>
            <p className="text-xs text-[#405449] leading-relaxed">
              Practical designs for local challenges—solar installations, water filtration, and workshop fabrication with local parts.
            </p>
          </motion.div>
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
