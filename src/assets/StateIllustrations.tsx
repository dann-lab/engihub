/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Empty, Error, and Success State Vector Illustrations
 * Warm Nigerian campus aesthetic: deep forest green, warm cream, sunny yellow-gold.
 * Fast, crisp, low data overhead.
 */

import React from 'react';

interface StateIllustrationProps {
  className?: string;
  size?: number;
}

export const EmptyDeskIllustration: React.FC<StateIllustrationProps> = ({ className = 'w-40 h-32', size }) => (
  <svg
    viewBox="0 0 240 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: (size * 3) / 4 } : undefined}
    aria-hidden="true"
  >
    {/* Wooden study table surface */}
    <rect x="20" y="120" width="200" height="12" rx="4" fill="#D1C6B4" />
    <rect x="35" y="132" width="10" height="35" rx="2" fill="#B8AC98" />
    <rect x="195" y="132" width="10" height="35" rx="2" fill="#B8AC98" />
    {/* Clean open notebook on desk */}
    <path d="M70 115 L120 110 L120 70 L70 75 Z" fill="#FDFBF7" stroke="#1B4332" strokeWidth="1.5" />
    <path d="M120 110 L170 115 L170 75 L120 70 Z" fill="#F5EFE6" stroke="#1B4332" strokeWidth="1.5" />
    <line x1="120" y1="70" x2="120" y2="110" stroke="#C67D0A" strokeWidth="2" />
    {/* Technical drawing pencil */}
    <rect x="180" y="112" width="28" height="4" rx="2" fill="#C67D0A" transform="rotate(-15 180 112)" />
    {/* Quiet steam cup */}
    <rect x="45" y="95" width="16" height="22" rx="3" fill="#1B4332" />
    <path d="M51 88 Q 53 82, 51 76" stroke="#C67D0A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const ErrorConnectionIllustration: React.FC<StateIllustrationProps> = ({ className = 'w-40 h-32', size }) => (
  <svg
    viewBox="0 0 240 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: (size * 3) / 4 } : undefined}
    aria-hidden="true"
  >
    {/* Radio mast / campus cellular antenna */}
    <path d="M120 30 L90 140 H150 Z" stroke="#1B4332" strokeWidth="2" fill="none" />
    <line x1="100" y1="100" x2="140" y2="100" stroke="#1B4332" strokeWidth="1.5" />
    <line x1="107" y1="70" x2="133" y2="70" stroke="#1B4332" strokeWidth="1.5" />
    <circle cx="120" cy="30" r="5" fill="#C67D0A" />
    {/* Signal pulse broken */}
    <path d="M135 20 Q 150 30, 135 45" stroke="#C67D0A" strokeWidth="2" strokeDasharray="4 4" fill="none" />
    <path d="M105 20 Q 90 30, 105 45" stroke="#C67D0A" strokeWidth="2" strokeDasharray="4 4" fill="none" />
    <rect x="80" y="145" width="80" height="8" rx="2" fill="#D1C6B4" />
  </svg>
);

export const SuccessMilestoneIllustration: React.FC<StateIllustrationProps> = ({ className = 'w-40 h-32', size }) => (
  <svg
    viewBox="0 0 240 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: (size * 3) / 4 } : undefined}
    aria-hidden="true"
  >
    {/* Certificate / seal */}
    <rect x="65" y="30" width="110" height="110" rx="8" fill="#FDFBF7" stroke="#1B4332" strokeWidth="2" />
    <rect x="75" y="40" width="90" height="90" rx="4" fill="#F5EFE6" />
    {/* Gold victory ribbon */}
    <circle cx="120" cy="80" r="22" fill="#C67D0A" />
    <circle cx="120" cy="80" r="17" fill="#E0A844" />
    <path d="M112 80 L118 86 L128 74" stroke="#142E22" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M110 100 L105 125 L120 118 L135 125 L130 100 Z" fill="#C67D0A" />
  </svg>
);
