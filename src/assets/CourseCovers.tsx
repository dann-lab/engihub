/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Illustrated Covers for the 10 Core Engineering Courses
 * Flat-editorial vector style in warm campus palette:
 * Warm cream, deep forest green (#1B4332), sunny yellow-gold (#C67D0A / #E0A844).
 * Ultra-lightweight (<3KB each) for fast 2G/3G campus connections.
 */

import React from 'react';

interface CoverProps {
  className?: string;
}

export const ThermodynamicsCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Thermodynamics PV Cycle diagram cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    <path d="M40 200H360" stroke="#1B4332" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 40V210" stroke="#1B4332" strokeWidth="2" strokeLinecap="round" />
    {/* P-V Indicator curve */}
    <path d="M100 80 C 180 80, 280 120, 310 160 C 260 170, 160 170, 100 80 Z" fill="#E8F1EC" stroke="#1B4332" strokeWidth="2.5" />
    {/* Heat In / Heat Out annotations */}
    <path d="M170 50 L170 80" stroke="#C67D0A" strokeWidth="2" markerEnd="url(#goldArrow)" />
    <circle cx="170" cy="50" r="4" fill="#C67D0A" />
    <text x="180" y="55" fill="#C67D0A" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">Q_in (Combustion)</text>
    {/* Labels */}
    <text x="65" y="35" fill="#1B4332" fontSize="11" fontFamily="JetBrains Mono, monospace">P (kPa)</text>
    <text x="330" y="225" fill="#1B4332" fontSize="11" fontFamily="JetBrains Mono, monospace">V (m³)</text>
    <text x="110" y="140" fill="#1B4332" fontSize="13" fontFamily="Fraunces, serif" fontWeight="700">Diesel / Otto Cycle</text>
  </svg>
);

export const MaterialsCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Engineering Materials crystalline phase cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    {/* Fe-C Phase diagram sketch */}
    <path d="M50 200 H350" stroke="#1B4332" strokeWidth="2" />
    <path d="M50 40 V200" stroke="#1B4332" strokeWidth="2" />
    <path d="M50 60 L140 120 L240 120 L350 90" stroke="#1B4332" strokeWidth="2" />
    <path d="M140 120 L140 200" stroke="#1B4332" strokeWidth="1.5" strokeDasharray="4 4" />
    <path d="M50 140 L140 120" stroke="#C67D0A" strokeWidth="2" />
    {/* Crystal lattice atom nodes */}
    <circle cx="280" cy="60" r="8" fill="#1B4332" />
    <circle cx="340" cy="60" r="8" fill="#1B4332" />
    <circle cx="310" cy="90" r="9" fill="#C67D0A" />
    <circle cx="280" cy="120" r="8" fill="#1B4332" />
    <circle cx="340" cy="120" r="8" fill="#1B4332" />
    <line x1="280" y1="60" x2="340" y2="60" stroke="#1B4332" strokeWidth="1.5" />
    <line x1="280" y1="120" x2="340" y2="120" stroke="#1B4332" strokeWidth="1.5" />
    <line x1="280" y1="60" x2="280" y2="120" stroke="#1B4332" strokeWidth="1.5" />
    <line x1="340" y1="60" x2="340" y2="120" stroke="#1B4332" strokeWidth="1.5" />
    <text x="60" y="90" fill="#1B4332" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">Austenite (γ-Fe)</text>
    <text x="150" y="160" fill="#C67D0A" fontSize="12" fontFamily="Fraunces, serif" fontWeight="700">0.76% C Eutectoid</text>
  </svg>
);

export const DifferentialEquationsCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Differential Equations oscillations cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    <path d="M40 120 H360" stroke="#1B4332" strokeWidth="1.5" />
    <path d="M60 30 V210" stroke="#1B4332" strokeWidth="1.5" />
    {/* Damped oscillatory curve */}
    <path d="M60 120 Q 90 20, 120 120 T 180 120 T 240 120 T 300 120 T 350 120" fill="none" stroke="#1B4332" strokeWidth="2.5" />
    {/* Exponential envelope */}
    <path d="M60 20 Q 150 70, 350 115" stroke="#C67D0A" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
    <path d="M60 220 Q 150 170, 350 125" stroke="#C67D0A" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
    <text x="75" y="45" fill="#1B4332" fontSize="12" fontFamily="JetBrains Mono, monospace">x(t) = e^(-ζω_n t) cos(ω_d t)</text>
    <text x="220" y="190" fill="#C67D0A" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">Damped Vibration</text>
  </svg>
);

export const ComplexAnalysisCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Complex Analysis Argand contour cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    {/* Argand axes */}
    <path d="M50 120 H350" stroke="#1B4332" strokeWidth="1.5" />
    <path d="M200 30 V210" stroke="#1B4332" strokeWidth="1.5" />
    {/* Closed Contour C */}
    <ellipse cx="200" cy="120" rx="90" ry="60" stroke="#1B4332" strokeWidth="2.5" fill="#E8F1EC" fillOpacity="0.6" />
    {/* Residue Pole */}
    <circle cx="180" cy="110" r="5" fill="#C67D0A" />
    <text x="190" y="105" fill="#C67D0A" fontSize="11" fontFamily="JetBrains Mono, monospace">z_0 (pole)</text>
    {/* Contour arrow */}
    <polygon points="200,55 208,60 208,50" fill="#1B4332" />
    <text x="325" y="115" fill="#1B4332" fontSize="11" fontFamily="JetBrains Mono, monospace">Re(z)</text>
    <text x="205" y="45" fill="#1B4332" fontSize="11" fontFamily="JetBrains Mono, monospace">Im(z)</text>
    <text x="70" y="60" fill="#1B4332" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">∮_C f(z) dz = 2πi · Res</text>
  </svg>
);

export const WorkshopPracticeCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Workshop Practice lathe tool cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    {/* Workpiece cylinder on lathe */}
    <rect x="60" y="80" width="160" height="80" rx="4" fill="#D1C6B4" stroke="#1B4332" strokeWidth="2" />
    <ellipse cx="60" cy="120" rx="15" ry="40" fill="#C5BAA8" stroke="#1B4332" strokeWidth="2" />
    <ellipse cx="220" cy="120" rx="15" ry="40" fill="#E8E1D3" stroke="#1B4332" strokeWidth="2" />
    {/* Cutting Tool */}
    <path d="M220 115 L280 100 L300 135 L240 135 Z" fill="#C67D0A" stroke="#1B4332" strokeWidth="2" />
    {/* Machining chips curl */}
    <path d="M225 110 Q 235 90, 245 105" stroke="#C67D0A" strokeWidth="2" fill="none" />
    <text x="260" y="85" fill="#1B4332" fontSize="11" fontFamily="JetBrains Mono, monospace">V = π·D·N / 1000</text>
    <text x="60" y="200" fill="#1B4332" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">Turning & Tool Geometry</text>
  </svg>
);

export const FluidMechanicsCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Fluid Mechanics venturi flow cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    {/* Venturi Tube constriction */}
    <path d="M40 70 H 130 Q 180 100, 200 100 Q 220 100, 270 70 H 360" stroke="#1B4332" strokeWidth="2.5" fill="none" />
    <path d="M40 170 H 130 Q 180 140, 200 140 Q 220 140, 270 170 H 360" stroke="#1B4332" strokeWidth="2.5" fill="none" />
    {/* Flow Streamlines */}
    <path d="M50 120 H 350" stroke="#1B4332" strokeWidth="1.5" strokeDasharray="6 4" />
    <path d="M50 95 Q 180 110, 350 95" stroke="#C67D0A" strokeWidth="1.5" fill="none" />
    <path d="M50 145 Q 180 130, 350 145" stroke="#C67D0A" strokeWidth="1.5" fill="none" />
    <text x="160" y="60" fill="#C67D0A" fontSize="11" fontFamily="JetBrains Mono, monospace">Throat: High V, Low P</text>
    <text x="50" y="210" fill="#1B4332" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">Bernoulli Conservation Law</text>
  </svg>
);

export const CircuitTheoryCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Circuit Theory schematic cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    {/* Circuit loop */}
    <rect x="80" y="70" width="240" height="110" rx="4" stroke="#1B4332" strokeWidth="2" fill="none" />
    {/* AC source on left */}
    <circle cx="80" cy="125" r="16" fill="#F5EFE6" stroke="#1B4332" strokeWidth="2" />
    <path d="M72 125 Q 76 119, 80 125 T 88 125" stroke="#1B4332" strokeWidth="1.5" fill="none" />
    {/* Resistor top */}
    <rect x="160" y="60" width="60" height="20" fill="#F5EFE6" stroke="#1B4332" strokeWidth="1.5" />
    {/* Inductor bottom */}
    <path d="M165 180 Q 175 165, 185 180 Q 195 165, 205 180 Q 215 165, 225 180" stroke="#C67D0A" strokeWidth="2" fill="none" />
    {/* Capacitor right */}
    <line x1="312" y1="110" x2="312" y2="140" stroke="#1B4332" strokeWidth="2.5" />
    <line x1="328" y1="110" x2="328" y2="140" stroke="#1B4332" strokeWidth="2.5" />
    <text x="175" y="50" fill="#1B4332" fontSize="11" fontFamily="JetBrains Mono, monospace">R = 50 Ω</text>
    <text x="180" y="210" fill="#C67D0A" fontSize="11" fontFamily="JetBrains Mono, monospace">L = 120 mH</text>
    <text x="80" y="35" fill="#1B4332" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">AC RLC Resonance</text>
  </svg>
);

export const StrengthOfMaterialsCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Strength of Materials Mohr Circle cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    {/* Axes */}
    <path d="M60 120 H340" stroke="#1B4332" strokeWidth="1.5" />
    <path d="M150 40 V200" stroke="#1B4332" strokeWidth="1.5" />
    {/* Mohr Circle */}
    <circle cx="230" cy="120" r="60" stroke="#1B4332" strokeWidth="2.5" fill="#E8F1EC" fillOpacity="0.5" />
    {/* Principal stress points */}
    <circle cx="290" cy="120" r="4" fill="#C67D0A" />
    <circle cx="170" cy="120" r="4" fill="#C67D0A" />
    <text x="295" y="115" fill="#C67D0A" fontSize="11" fontFamily="JetBrains Mono, monospace">σ_1</text>
    <text x="160" y="115" fill="#C67D0A" fontSize="11" fontFamily="JetBrains Mono, monospace">σ_2</text>
    <text x="325" y="135" fill="#1B4332" fontSize="11" fontFamily="JetBrains Mono, monospace">σ</text>
    <text x="155" y="35" fill="#1B4332" fontSize="11" fontFamily="JetBrains Mono, monospace">τ</text>
    <text x="60" y="220" fill="#1B4332" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">Mohr's Stress Circle & Principal Planes</text>
  </svg>
);

export const EngineeringDrawingCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Engineering Drawing isometric projection cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    {/* Isometric Cube with drilled hole */}
    <path d="M200 40 L280 80 L200 120 L120 80 Z" fill="#E8E1D3" stroke="#1B4332" strokeWidth="2" />
    <path d="M120 80 L120 160 L200 200 L200 120 Z" fill="#D1C6B4" stroke="#1B4332" strokeWidth="2" />
    <path d="M280 80 L280 160 L200 200 L200 120 Z" fill="#C5BAA8" stroke="#1B4332" strokeWidth="2" />
    {/* Center hole isometric ellipse */}
    <ellipse cx="200" cy="80" rx="30" ry="15" fill="#F5EFE6" stroke="#C67D0A" strokeWidth="2" />
    {/* Dimension lines */}
    <line x1="120" y1="165" x2="200" y2="205" stroke="#C67D0A" strokeWidth="1" strokeDasharray="3 3" />
    <text x="50" y="45" fill="#1B4332" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">Orthographic & Isometric Projection</text>
    <text x="240" y="220" fill="#C67D0A" fontSize="11" fontFamily="JetBrains Mono, monospace">Scale 1:1 · First Angle</text>
  </svg>
);

export const ProgrammingCover: React.FC<CoverProps> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Engineering Programming logic flowchart cover">
    <rect width="400" height="240" fill="#F5EFE6" />
    {/* Terminal block */}
    <rect x="50" y="40" width="90" height="32" rx="16" fill="#1B4332" stroke="#1B4332" strokeWidth="2" />
    <text x="75" y="60" fill="#FFFFFF" fontSize="11" fontFamily="JetBrains Mono, monospace">START</text>
    {/* Flow line */}
    <path d="M140 56 H 180" stroke="#1B4332" strokeWidth="2" />
    {/* Process block */}
    <rect x="180" y="40" width="100" height="32" rx="4" fill="#E8F1EC" stroke="#1B4332" strokeWidth="2" />
    <text x="190" y="60" fill="#1B4332" fontSize="10" fontFamily="JetBrains Mono, monospace">sum = 0; i = 0</text>
    {/* Decision diamond */}
    <polygon points="230,110 270,140 230,170 190,140" fill="#FDF4E5" stroke="#C67D0A" strokeWidth="2" />
    <text x="210" y="144" fill="#C67D0A" fontSize="10" fontFamily="JetBrains Mono, monospace">i &lt; N ?</text>
    <path d="M230 72 V 110" stroke="#1B4332" strokeWidth="2" />
    <path d="M270 140 H 320 V 60 H 280" stroke="#C67D0A" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
    <text x="50" y="210" fill="#1B4332" fontSize="12" fontFamily="Fraunces, serif" fontWeight="600">Numerical Algorithms & Data Structures</text>
  </svg>
);

export const COURSE_COVERS: Record<string, React.FC<CoverProps>> = {
  'Thermodynamics': ThermodynamicsCover,
  'Engineering Materials': MaterialsCover,
  'Differential Equations': DifferentialEquationsCover,
  'Complex Analysis': ComplexAnalysisCover,
  'Workshop Practice': WorkshopPracticeCover,
  'Fluid Mechanics': FluidMechanicsCover,
  'Circuit Theory': CircuitTheoryCover,
  'Strength of Materials': StrengthOfMaterialsCover,
  'Engineering Drawing': EngineeringDrawingCover,
  'Programming': ProgrammingCover,
};
