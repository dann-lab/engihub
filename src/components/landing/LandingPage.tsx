/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Campus Landing Page
 * Authentic Nigerian engineering study workspace with real engineering photography,
 * interactive course derivation preview, CBT exam preview, and community commons.
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  MessageSquare,
  Wrench,
  Users,
  Cpu,
  Terminal,
  ThumbsUp,
  MessageCircle,
  Zap
} from 'lucide-react';
import { MathRenderer } from '../MathRenderer';
import { REAL_ENGINEERING_PHOTOS } from '../../assets/realPhotos';
import { motion } from 'motion/react';
import { CrazyEngineeringParticles } from '../common/CrazyEngineeringParticles';
import { EngiHubLogo } from '../common/EngiHubLogo';

interface LandingPageProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'derivation' | 'cbt' | 'community'>('derivation');

  return (
    <div className="min-h-screen bg-[#0B1612] text-[#F6F3EE] flex flex-col justify-between selection:bg-[#E0A844]/30 selection:text-[#F6F3EE] overflow-x-hidden relative font-sans">
      {/* Interactive engineering particles and circuit traces */}
      <CrazyEngineeringParticles theme="dark" />

      {/* Subtle warm campus ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] bg-gradient-to-b from-[#2D6A4F]/15 via-[#E0A844]/5 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Campus Top Navigation Bar */}
      <header className="border-b border-[#223A30] bg-[#0B1612]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            {/* EngiHub Signature Campus Emblem */}
            <EngiHubLogo size="md" />
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F6F3EE]">
                Engi<span className="text-[#E0A844]">Hub</span>
              </span>
              <span className="text-[10px] font-mono text-[#AEC1B6] uppercase tracking-wider hidden sm:inline ml-2">
                Campus Study Space
              </span>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('signin')}
              className="text-xs font-semibold text-[#AEC1B6] hover:text-[#F6F3EE] transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenAuth('signup')}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#40916C] text-white shadow-md shadow-black/25 transition-all flex items-center gap-1.5"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E0A844]" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Landing Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 w-full space-y-16">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative">
          {/* Floating Formula Badge 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: [0.75, 1, 0.75],
              y: [0, -10, 0],
              rotate: [-1, 2, -1]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden md:flex absolute -top-5 right-8 lg:right-1/3 items-center gap-2 px-3 py-1.5 rounded-full bg-[#11221B] border border-[#234436] shadow-md text-[11px] font-mono text-[#E0A844] pointer-events-none z-10"
          >
            <span>P = ρgQH</span>
          </motion.div>

          {/* Floating Formula Badge 2 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: [0.75, 1, 0.75],
              y: [0, 10, 0],
              rotate: [1, -2, 1]
            }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="hidden md:flex absolute bottom-2 left-6 lg:left-1/3 items-center gap-2 px-3 py-1.5 rounded-full bg-[#11221B] border border-[#234436] shadow-md text-[11px] font-mono text-[#52B788] pointer-events-none z-10"
          >
            <Zap className="w-3 h-3 text-[#E0A844]" />
            <span>V = I · R</span>
          </motion.div>

          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#11221B] border border-[#234436] text-xs font-medium text-[#E0A844]"
            >
              <span className="w-2 h-2 rounded-full bg-[#E0A844] animate-ping" />
              <span>Built for Nigerian University Engineering Students</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F6F3EE] leading-[1.12]"
            >
              Engineering taught from{' '}
              <span className="text-[#E0A844]">
                first principles,
              </span>{' '}
              step by step.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-base sm:text-lg text-[#AEC1B6] leading-relaxed max-w-2xl"
            >
              A focused campus study workspace for Nigerian engineering undergraduates. Work through complete mathematical derivations, practice on exam-standard CBT sets with instant worked steps, collaborate with peers in the community hub, and document real local engineering projects.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="pt-2 flex flex-wrap items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onOpenAuth('signup')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#40916C] text-white text-sm font-semibold shadow-lg shadow-black/30 transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 text-[#E0A844]" />
              </motion.button>

              <div className="flex items-center gap-2 text-xs text-[#AEC1B6] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
                <span>FUTA · UNILAG · ABU · UNN · OAU · Covenant</span>
              </div>
            </motion.div>
          </div>

          {/* Real Photographic Hero Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl border border-[#234436] bg-[#11221B] overflow-hidden shadow-2xl shadow-black/50">
              <div className="relative group">
                <img
                  src={REAL_ENGINEERING_PHOTOS.studentsLab}
                  alt="University engineering students collaborating on hardware and calculations"
                  className="w-full h-64 sm:h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11221B] via-transparent to-transparent opacity-90" />

                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#0B1612]/90 border border-[#234436] backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1B4332] border border-[#325C4B] flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-[#E0A844]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#F6F3EE]">Campus Study & Hardware Lab</div>
                      <div className="text-[10px] text-[#AEC1B6] font-mono">Peer derivation & practical review</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#52B788] bg-[#1B4332]/70 px-2 py-0.5 rounded border border-[#325C4B]">
                    COREN Ready
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interactive Board Preview: Derivation, CBT Exam, Community */}
        <div className="rounded-xl border border-[#234436] bg-[#11221B] overflow-hidden shadow-xl">
          <div className="border-b border-[#234436] px-4 py-2.5 bg-[#0B1612] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActivePlaygroundTab('derivation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activePlaygroundTab === 'derivation'
                    ? 'bg-[#1D3C2C] text-[#E0A844] border border-[#325C4B]'
                    : 'text-[#AEC1B6] hover:text-[#F6F3EE]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Step-by-Step Derivation</span>
              </button>

              <button
                onClick={() => setActivePlaygroundTab('cbt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activePlaygroundTab === 'cbt'
                    ? 'bg-[#1D3C2C] text-[#E0A844] border border-[#325C4B]'
                    : 'text-[#AEC1B6] hover:text-[#F6F3EE]'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>CBT Exam Prep</span>
              </button>

              <button
                onClick={() => setActivePlaygroundTab('community')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activePlaygroundTab === 'community'
                    ? 'bg-[#1D3C2C] text-[#E0A844] border border-[#325C4B]'
                    : 'text-[#AEC1B6] hover:text-[#F6F3EE]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Community Hub</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#AEC1B6]">
              <span className="hidden sm:inline">Thermodynamics · Air-Standard Diesel Cycle</span>
              <span className="px-2 py-0.5 rounded bg-[#162C23] border border-[#234436] text-[#E0A844]">
                STEP 1 / 4
              </span>
            </div>
          </div>

          {/* Interactive Tab Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {activePlaygroundTab === 'derivation' && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#E0A844]">
                      Governing Law & State Point 1
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F6F3EE] mt-1">
                      Calculate State Properties at End of Isentropic Compression
                    </h3>
                    <p className="text-sm text-[#AEC1B6] mt-1 leading-relaxed max-w-3xl">
                      Consider an air-standard Diesel cycle operating at ambient temperature in Akure. Initial conditions are P₁ = 100 kPa, T₁ = 300 K, with compression ratio r = 16. Working fluid is dry air with ratio of specific heats γ = 1.4.
                    </p>
                  </div>
                </div>

                {/* Formula Block */}
                <div className="space-y-3 p-4 rounded-xl bg-[#0B1612] border border-[#234436]">
                  <span className="text-[11px] font-mono text-[#AEC1B6] uppercase tracking-wider block">
                    Isentropic Temperature Relation (Process 1 &rarr; 2):
                  </span>
                  <MathRenderer
                    math="T_2 = T_1 \cdot \left(\frac{V_1}{V_2}\right)^{\gamma - 1} = T_1 \cdot r^{\gamma - 1}"
                    block={true}
                  />
                  <span className="text-[11px] font-mono text-[#AEC1B6] uppercase tracking-wider block mt-3">
                    Numerical Evaluation:
                  </span>
                  <MathRenderer
                    math="T_2 = 300 \cdot (16)^{1.4 - 1} = 300 \cdot (16)^{0.4} = 300 \cdot 3.0314 = 909.43\text{ K}"
                    block={true}
                  />
                </div>

                {/* Action Controls */}
                <div className="pt-3 border-t border-[#234436] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#AEC1B6]">
                    <span className="text-[#52B788] font-semibold">State point 2 verified (909.43 K).</span> Ready for constant-pressure heat addition?
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAuth('signup')}
                      className="px-3.5 py-2 rounded-lg bg-[#162C23] border border-[#234436] text-xs font-medium text-[#F6F3EE] hover:border-[#325C4B] transition-colors"
                    >
                      "I'm Lost" (Local Analogy)
                    </button>
                    <button
                      onClick={() => onOpenAuth('signup')}
                      className="px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#40916C] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activePlaygroundTab === 'cbt' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0B1612] border border-[#234436] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#AEC1B6]">
                    <span>QUESTION 3 OF 20 · MEE 302 FLUID MECHANICS</span>
                    <span className="text-[#52B788]">EXAM STANDARD</span>
                  </div>
                  <p className="text-sm text-[#F6F3EE] font-medium">
                    Water at 20°C flows through a 50mm diameter pipe at a mean velocity of 2 m/s. Given kinematic viscosity ν = 1.0 × 10⁻⁶ m²/s, what is the flow regime?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <div className="p-3 rounded-lg border border-[#234436] bg-[#11221B] text-xs text-[#AEC1B6]">
                      A. Laminar (Re = 1,000)
                    </div>
                    <div className="p-3 rounded-lg border border-[#52B788]/50 bg-[#1B4332]/40 text-xs text-[#52B788] font-semibold flex items-center justify-between">
                      <span>B. Turbulent (Re = 100,000)</span>
                      <span className="text-[10px]">CORRECT</span>
                    </div>
                    <div className="p-3 rounded-lg border border-[#234436] bg-[#11221B] text-xs text-[#AEC1B6]">
                      C. Transitional (Re = 2,300)
                    </div>
                    <div className="p-3 rounded-lg border border-[#234436] bg-[#11221B] text-xs text-[#AEC1B6]">
                      D. Critical (Re = 4,000)
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#162C23] border border-[#234436] text-xs text-[#AEC1B6] font-mono">
                    <span className="text-[#E0A844] font-bold block mb-1">Instant Step-by-Step Breakdown:</span>
                    Re = (V · D) / ν = (2 × 0.05) / (1.0 × 10⁻⁶) = 100,000. Since Re &gt; 4,000, flow is fully turbulent.
                  </div>
                </div>
              </div>
            )}

            {activePlaygroundTab === 'community' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0B1612] border border-[#234436] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#AEC1B6]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2D6A4F] text-[#E0A844] flex items-center justify-center font-bold text-[10px]">
                        E
                      </div>
                      <span className="font-medium text-[#F6F3EE]">Emeka Obi · FUTA EEE 400L</span>
                    </div>
                    <span className="font-mono text-[10px]">2 hours ago</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#F6F3EE]">
                    Off-grid Solar Inverter MPPT efficiency drop under 38°C Ondo weather
                  </h4>
                  <p className="text-xs text-[#AEC1B6] leading-relaxed">
                    Tested our 5kVA solar inverter with 8x 400W Monocrystalline panels in Akure. Peak voltage drops by ~14% when panel surface temperature crosses 52°C. Here is our thermal coefficient compensation calculation.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#AEC1B6] pt-1">
                    <span className="flex items-center gap-1 text-[#E0A844]">
                      <ThumbsUp className="w-3.5 h-3.5" /> 34 upvotes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> 12 engineering replies
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real Engineering Photography Gallery */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-[#E0A844] uppercase tracking-wider">
                  Ground Truth Engineering
                </span>
                <span className="text-[#325C4B]">·</span>
                <span className="text-xs text-[#AEC1B6]">Authentic Nigerian University Practice</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6F3EE]">
                From Lecture Derivations to Real Hardware Fabrication
              </h3>
              <p className="text-sm text-[#AEC1B6] mt-1 max-w-2xl leading-relaxed">
                Every course connects directly to real mechanical machinery, solar microgrids, civil hydraulics, and laboratory hardware across Nigerian campuses.
              </p>
            </div>

            <button
              onClick={() => onOpenAuth('signup')}
              className="text-xs font-mono text-[#E0A844] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore all courses</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Real Photo 1: Mechanical Lathe & CNC Machining */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-xl border border-[#234436] bg-[#11221B] overflow-hidden flex flex-col justify-between group hover:border-[#E0A844]/60 transition-all shadow-lg"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-[#0B1612]">
                  <img
                    src={REAL_ENGINEERING_PHOTOS.cncMilling}
                    alt="Mechanical workshop precision CNC milling"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#0B1612]/85 border border-[#234436] text-[10px] font-mono text-[#E0A844]">
                    MEE 201
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#E0A844] font-semibold">
                    Mechanical Fabrication
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#F6F3EE]">
                    Lathe Workshop & Precision Metrology
                  </h4>
                  <p className="text-xs text-[#AEC1B6] leading-relaxed">
                    Spindle speeds, cutting force formulas, gear ratios, and MMA welding joint calculations on standard faculty machinery.
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-[#234436] bg-[#0B1612] text-[11px] font-mono text-[#AEC1B6] flex items-center justify-between">
                <span>Workshop Practice</span>
                <span className="text-[#52B788]">Hands-On</span>
              </div>
            </motion.div>

            {/* Real Photo 2: Solar PV Roof Installation */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-xl border border-[#234436] bg-[#11221B] overflow-hidden flex flex-col justify-between group hover:border-[#E0A844]/60 transition-all shadow-lg"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-[#0B1612]">
                  <img
                    src={REAL_ENGINEERING_PHOTOS.solarPower}
                    alt="Solar PV modules for renewable power in Nigeria"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#0B1612]/85 border border-[#234436] text-[10px] font-mono text-[#E0A844]">
                    EEE 301
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#E0A844] font-semibold">
                    Renewable Power
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#F6F3EE]">
                    Solar PV & Campus Microgrid Sizing
                  </h4>
                  <p className="text-xs text-[#AEC1B6] leading-relaxed">
                    Peak sun hours across Nigerian geo-zones, MPPT tracking equations, inverter load sizing, and battery bank autonomy.
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-[#234436] bg-[#0B1612] text-[11px] font-mono text-[#AEC1B6] flex items-center justify-between">
                <span>Power Systems</span>
                <span className="text-[#52B788]">Field Tested</span>
              </div>
            </motion.div>

            {/* Real Photo 3: Hydraulic Piping & Civil Water Supply */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-xl border border-[#234436] bg-[#11221B] overflow-hidden flex flex-col justify-between group hover:border-[#E0A844]/60 transition-all shadow-lg"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-[#0B1612]">
                  <img
                    src={REAL_ENGINEERING_PHOTOS.fluidPiping}
                    alt="Hydraulic fluid piping and valve network"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#0B1612]/85 border border-[#234436] text-[10px] font-mono text-[#E0A844]">
                    CEE 303
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#E0A844] font-semibold">
                    Hydraulic Engineering
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#F6F3EE]">
                    Solar Borehole & Pipe Network Head Loss
                  </h4>
                  <p className="text-xs text-[#AEC1B6] leading-relaxed">
                    Darcy-Weisbach friction calculations, pump total dynamic head (TDH), and overhead tank gravity distribution networks.
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-[#234436] bg-[#0B1612] text-[11px] font-mono text-[#AEC1B6] flex items-center justify-between">
                <span>Fluid Dynamics</span>
                <span className="text-[#52B788]">Akure Tested</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 5 Core EngiHub Workspace Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-xl bg-[#11221B] border border-[#234436] space-y-2.5 hover:border-[#52B788]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332] border border-[#325C4B] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#E0A844]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#F6F3EE]">Step-by-Step Tutor</h4>
            <p className="text-xs text-[#AEC1B6] leading-relaxed">
              Every term defined the first time it appears. Step-gated derivations with real Nigerian analogies when you get stuck.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-xl bg-[#11221B] border border-[#234436] space-y-2.5 hover:border-[#52B788]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332] border border-[#325C4B] flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-[#52B788]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#F6F3EE]">CBT Exam Center</h4>
            <p className="text-xs text-[#AEC1B6] leading-relaxed">
              Full worked steps right after each answer. Spaced repetition for questions you miss, aligned with faculty exams.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-xl bg-[#11221B] border border-[#234436] space-y-2.5 hover:border-[#E0A844]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332] border border-[#325C4B] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#E0A844]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#F6F3EE]">Community Hub</h4>
            <p className="text-xs text-[#AEC1B6] leading-relaxed">
              Interactive campus forum. Post project breakthroughs, share past question derivations, attach photos, and discuss with peers.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-xl bg-[#11221B] border border-[#234436] space-y-2.5 hover:border-[#52B788]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332] border border-[#325C4B] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#52B788]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#F6F3EE]">Ask Study Partner</h4>
            <p className="text-xs text-[#AEC1B6] leading-relaxed">
              Ask any engineering, math, or programming question. Get quick summaries, exam answers, or step-by-step explanations.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-xl bg-[#11221B] border border-[#234436] space-y-2.5 hover:border-[#E0A844]/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1B4332] border border-[#325C4B] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#E0A844]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#F6F3EE]">Problem Lab</h4>
            <p className="text-xs text-[#AEC1B6] leading-relaxed">
              Practical design blueprints and BEME costing in Naira for solar installations, filtration, and local workshop fabrication.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#223A30] py-6 px-4 sm:px-8 bg-[#0B1612]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#AEC1B6]">
          <p>
            EngiHub · Engineering Workspace for Nigerian University Students. Built by Danni,{' '}
            <a href="https://dannistec.netlify.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#F6F3EE]">
              Dannistec
            </a>{' '}
            ·{' '}
            <a href="https://wa.me/2349040110170?text=Hello%20Danni" target="_blank" rel="noopener noreferrer" className="text-[#52B788] hover:underline">
              WA: 09040110170
            </a>
          </p>

          <div className="flex items-center gap-4 font-semibold">
            <a href="mailto:dannistec3@gmail.com" className="hover:text-[#F6F3EE] transition-colors">dannistec3@gmail.com</a>
            <button onClick={() => onOpenAuth('signin')} className="hover:text-[#F6F3EE] transition-colors">Sign In</button>
            <button onClick={() => onOpenAuth('signup')} className="text-[#E0A844] hover:underline">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
