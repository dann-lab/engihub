/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EngiHub Signature Engineering Emblem
 * Clean geometric hexagon + precision drafting mark (no AI sparkles).
 */

import React from 'react';

interface EngiHubLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'forest' | 'gold';
  className?: string;
}

export const EngiHubLogo: React.FC<EngiHubLogoProps> = ({
  size = 'md',
  variant = 'forest',
  className = '',
}) => {
  const dimensions =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';

  const bgClasses =
    variant === 'gold'
      ? 'bg-[#E0A844] border-[#C67D0A] text-[#0B1612]'
      : 'bg-[#1B4332] border-[#325C4B] text-[#E0A844]';

  return (
    <div
      className={`${dimensions} rounded-lg border ${bgClasses} flex items-center justify-center shadow-xs shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        className="w-5 h-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Precision Hexagon Nut / Structural Blueprint Frame */}
        <path
          d="M16 3L27.2583 9.5V22.5L16 29L4.74167 22.5V9.5L16 3Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Clean Geometric Engineering 'E' Bars */}
        <path
          d="M11.5 11H21M11.5 16H19M11.5 21H21M11.5 11V21"
          stroke={variant === 'gold' ? '#0B1612' : '#FDFBF7'}
          strokeWidth="2.2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        {/* Drafting Datum Node */}
        <circle
          cx="21.5"
          cy="16"
          r="1.35"
          fill={variant === 'gold' ? '#1B4332' : '#E0A844'}
        />
      </svg>
    </div>
  );
};
