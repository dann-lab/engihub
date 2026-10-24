/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1 }) => {
  if (lines > 1) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-[#1F2228] border border-[#2C3038] rounded-[2px] animate-pulse ${
              i === lines - 1 ? 'w-3/5' : 'w-full'
            } ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`h-4 bg-[#1F2228] border border-[#2C3038] rounded-[2px] animate-pulse ${className}`}
    />
  );
};
