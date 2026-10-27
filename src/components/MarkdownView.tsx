/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Markdown, Formula & Technical Diagram View
 * Supports:
 * - KaTeX block and inline mathematics ($...$ and $$...$$)
 * - Clean inline SVG engineering diagrams with DOMPurify sanitization
 * - Mermaid flowchart rendering
 * - Code syntax highlighting with Copy button
 * - Nigerian campus styling: cream background, forest green, warm gold accents.
 */

import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { MathRenderer } from './MathRenderer';
import { MermaidRenderer } from './common/MermaidRenderer';
import { AlertTriangle, CheckCircle2, Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into blocks: code blocks, math blocks, inline SVG blocks, text blocks
  const blocks = React.useMemo(() => {
    const text = content.replace(/\r\n/g, '\n');
    const parts: {
      type: 'text' | 'math-block' | 'code-block' | 'svg-block' | 'mermaid-block';
      content: string;
      lang?: string;
    }[] = [];

    // Match code blocks, math blocks, or inline <svg>...</svg>
    const blockRegex = /(```[a-z]*\n[\s\S]*?```|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|<svg[\s\S]*?<\/svg>)/gi;
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
      if (matchContent.toLowerCase().startsWith('<svg')) {
        parts.push({ type: 'svg-block', content: matchContent });
      } else if (matchContent.startsWith('```')) {
        const firstLineEnd = matchContent.indexOf('\n');
        const lang = matchContent.slice(3, firstLineEnd).trim().toLowerCase();
        const codeBody = matchContent.slice(firstLineEnd + 1, -3).trim();

        if (lang === 'mermaid') {
          parts.push({ type: 'mermaid-block', content: codeBody });
        } else if (lang === 'svg' || lang === 'xml' && codeBody.startsWith('<svg')) {
          parts.push({ type: 'svg-block', content: codeBody });
        } else {
          parts.push({ type: 'code-block', content: codeBody, lang });
        }
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
              <code key={i} className="px-1.5 py-0.5 rounded-md bg-[#F5EFE6] dark:bg-[#11221B] text-[#C67D0A] dark:text-[#E0A844] text-xs font-mono border border-[#E8E1D3] dark:border-[#234436]">
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

        if (block.type === 'svg-block') {
          const cleanSvg = DOMPurify.sanitize(block.content, {
            USE_PROFILES: { svg: true, svgFilters: true }
          });

          return (
            <div key={idx} className="my-4 p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-md">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C67D0A] dark:text-[#E0A844] mb-2 flex items-center justify-between">
                <span>Engineering Concept Diagram</span>
                <span className="font-mono text-[#687D72] dark:text-[#6E8578]">Vector Schematic</span>
              </div>
              <div
                className="overflow-x-auto flex justify-center py-2 [&>svg]:max-w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: cleanSvg }}
              />
            </div>
          );
        }

        if (block.type === 'mermaid-block') {
          return <MermaidRenderer key={idx} code={block.content} />;
        }

        if (block.type === 'code-block') {
          return <CodeSnippet key={idx} code={block.content} lang={block.lang} />;
        }

        const lines = block.content.split('\n');
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              if (/^(CRITICAL SAFETY WARNING|SAFETY ALERT|WARNING|SAFETY NOTE)/i.test(trimmed)) {
                return (
                  <div key={lineIdx} className="my-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{renderInline(trimmed)}</div>
                  </div>
                );
              }

              if (trimmed.includes('Ready for the next step?')) {
                return (
                  <div key={lineIdx} className="my-3 p-3.5 rounded-xl bg-[#F5EFE6] dark:bg-[#11221B] border border-[#C67D0A]/40 dark:border-[#E0A844]/40 flex items-start gap-2.5 text-xs text-[#142E22] dark:text-[#F6F3EE]">
                    <CheckCircle2 className="w-4 h-4 text-[#C67D0A] dark:text-[#E0A844] shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{renderInline(trimmed)}</div>
                  </div>
                );
              }

              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lineIdx} className="font-serif text-lg sm:text-xl font-bold mt-4 mb-2 pb-1 border-b border-[#E8E1D3] dark:border-[#234436] text-[#142E22] dark:text-[#F6F3EE]">
                    {renderInline(trimmed.slice(2))}
                  </h1>
                );
              }

              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lineIdx} className="font-serif text-base font-bold text-[#1B4332] dark:text-[#E0A844] mt-3 mb-1">
                    {renderInline(trimmed.slice(3))}
                  </h2>
                );
              }

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="font-serif text-sm font-semibold text-[#142E22] dark:text-[#F6F3EE] mt-2">
                    {renderInline(trimmed.slice(4))}
                  </h3>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C67D0A] dark:bg-[#E0A844] mt-2 shrink-0" />
                    <span className="flex-1">{renderInline(trimmed.slice(2))}</span>
                  </div>
                );
              }

              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 ml-2">
                    <span className="font-mono text-[11px] font-bold text-[#C67D0A] dark:text-[#E0A844] shrink-0">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">{renderInline(numMatch[2])}</span>
                  </div>
                );
              }

              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lineIdx} className="pl-3 py-1 border-l-2 border-[#C67D0A] dark:border-[#E0A844] italic bg-[#F5EFE6]/50 dark:bg-[#11221B]/50 text-xs rounded-r-md">
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

const CodeSnippet: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border bg-[#0B1612] border-[#223A30] overflow-hidden shadow-xs">
      <div className="px-3.5 py-1.5 bg-[#11221B] border-b border-[#223A30] flex items-center justify-between text-[11px] font-mono text-[#AEC1B6]">
        <span>{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono overflow-x-auto text-[#E0A844] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
