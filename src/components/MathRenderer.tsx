/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (e) {
      console.warn('KaTeX render error:', e);
      return `<code class="text-[#EA580C] bg-[#121316] px-1 py-0.5 rounded-[2px] text-xs font-mono">${math}</code>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`my-3 p-3 overflow-x-auto bg-[#121316] rounded-[3px] border border-[#2C3038] text-center font-mono ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block px-1 font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
