/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MathRenderer } from './MathRenderer';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const blocks = React.useMemo(() => {
    const text = content.replace(/\r\n/g, '\n');
    const parts: { type: 'text' | 'math-block' | 'code-block'; content: string }[] = [];
    
    const blockRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textChunk = text.slice(lastIndex, match.index);
        if (textChunk.trim()) {
          parts.push({ type: 'text', content: textChunk });
        }
      }

      const matchContent = match[0];
      if (matchContent.startsWith('```')) {
        parts.push({ type: 'code-block', content: matchContent });
      } else if (matchContent.startsWith('$$') || matchContent.startsWith('\\[')) {
        parts.push({ type: 'math-block', content: matchContent.slice(2, -2) });
      }

      lastIndex = match.index + matchContent.length;
    }

    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
      if (remaining.trim()) {
        parts.push({ type: 'text', content: remaining });
      }
    }

    return parts;
  }, [content]);

  const renderInline = (inlineText: string) => {
    const inlineMathRegex = /(\$[^\$\n]+\$|\\\([^\n\\]+\\\))/g;
    const segments: React.ReactNode[] = [];
    let lastIdx = 0;
    let m: RegExpExecArray | null;

    while ((m = inlineMathRegex.exec(inlineText)) !== null) {
      if (m.index > lastIdx) {
        segments.push(renderFormattedText(inlineText.slice(lastIdx, m.index), `txt-${lastIdx}`));
      }
      const rawMath = m[0];
      const formula = rawMath.startsWith('$') ? rawMath.slice(1, -1) : rawMath.slice(2, -2);
      segments.push(<MathRenderer key={`m-${m.index}`} math={formula} block={false} />);
      lastIdx = m.index + rawMath.length;
    }

    if (lastIdx < inlineText.length) {
      segments.push(renderFormattedText(inlineText.slice(lastIdx), `txt-${lastIdx}`));
    }

    return segments;
  };

  const renderFormattedText = (raw: string, keyPrefix: string): React.ReactNode => {
    const tokens = raw.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return (
      <span key={keyPrefix}>
        {tokens.map((token, i) => {
          if (token.startsWith('**') && token.endsWith('**')) {
            return (
              <strong key={i} className="font-semibold text-inherit">
                {token.slice(2, -2)}
              </strong>
            );
          }
          if (token.startsWith('`') && token.endsWith('`')) {
            return (
              <code key={i} className="px-1 py-0.5 rounded-[2px] bg-[#1F2228] text-[#EA580C] text-xs font-mono border border-[#2C3038]">
                {token.slice(1, -1)}
              </code>
            );
          }
          if (token.startsWith('*') && token.endsWith('*')) {
            return (
              <em key={i} className="italic text-inherit">
                {token.slice(1, -1)}
              </em>
            );
          }
          return token;
        })}
      </span>
    );
  };

  return (
    <div className={`space-y-3 leading-relaxed text-inherit text-xs sm:text-sm ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'math-block') {
          return <MathRenderer key={idx} math={block.content} block={true} />;
        }

        if (block.type === 'code-block') {
          const rawCode = block.content.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
          return (
            <pre key={idx} className="my-3 p-3.5 rounded-[3px] bg-[#121316] border border-[#2C3038] text-xs font-mono overflow-x-auto text-[#EA580C]">
              <code>{rawCode}</code>
            </pre>
          );
        }

        const lines = block.content.split('\n');
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              if (/^(CRITICAL SAFETY WARNING|SAFETY ALERT|WARNING|SAFETY NOTE)/i.test(trimmed)) {
                return (
                  <div key={lineIdx} className="my-3 p-3.5 rounded-[3px] bg-[#450A0A]/40 border border-[#DC2626]/50 flex items-start gap-2.5 text-xs text-[#FCA5A5]">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{renderInline(trimmed)}</div>
                  </div>
                );
              }

              if (trimmed.includes('Ready for the next step?')) {
                return (
                  <div key={lineIdx} className="my-3 p-3 rounded-[3px] bg-[#1F2228] border border-[#EA580C]/50 flex items-start gap-2.5 text-xs text-[#F5F5F4]">
                    <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                    <div className="flex-1 font-mono">{renderInline(trimmed)}</div>
                  </div>
                );
              }

              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lineIdx} className="font-serif text-lg sm:text-xl font-bold mt-4 mb-2 pb-1 border-b border-[#2C3038] text-[#F5F5F4]">
                    {renderInline(trimmed.slice(2))}
                  </h1>
                );
              }

              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lineIdx} className="font-serif text-base font-bold text-[#EA580C] mt-3 mb-1">
                    {renderInline(trimmed.slice(3))}
                  </h2>
                );
              }

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="font-mono text-xs font-bold text-[#F5F5F4] mt-2 uppercase">
                    {renderInline(trimmed.slice(4))}
                  </h3>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 ml-2">
                    <span className="w-1 h-1 rounded-full bg-[#EA580C] mt-2 shrink-0" />
                    <span className="flex-1">{renderInline(trimmed.slice(2))}</span>
                  </div>
                );
              }

              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 ml-2">
                    <span className="font-mono text-[11px] font-bold text-[#EA580C] shrink-0">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">{renderInline(numMatch[2])}</span>
                  </div>
                );
              }

              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lineIdx} className="pl-3 py-1 border-l-2 border-[#EA580C] italic bg-[#1F2228]/40 text-xs">
                    {renderInline(trimmed.slice(2))}
                  </blockquote>
                );
              }

              return (
                <p key={lineIdx} className="leading-relaxed">
                  {renderInline(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
