/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mermaid & Flowchart Renderer for Engineering Processes
 * Parses flowchart / graph / state syntax into a clean SVG visual diagram.
 */

import React from 'react';

interface MermaidRendererProps {
  code: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  // Parse simple flowchart nodes: e.g. A[Start] --> B(Process) --> C{Decision}
  const lines = code.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('%%'));
  
  // Extract nodes and edges
  const nodesMap = new Map<string, string>();
  const edges: Array<{ from: string; to: string; label?: string }> = [];

  for (const line of lines) {
    if (line.includes('-->') || line.includes('---')) {
      const parts = line.split(/-->|---/);
      if (parts.length >= 2) {
        const fromRaw = parts[0].trim();
        const toRaw = parts[1].trim();

        const parseNode = (str: string) => {
          const match = str.match(/([A-Za-z0-9_]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})?/);
          if (match) {
            const id = match[1];
            const text = match[2] || match[3] || match[4] || id;
            nodesMap.set(id, text);
            return id;
          }
          return str;
        };

        const fromId = parseNode(fromRaw);
        const toId = parseNode(toRaw);
        edges.push({ from: fromId, to: toId });
      }
    } else {
      const singleMatch = line.match(/([A-Za-z0-9_]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})/);
      if (singleMatch) {
        nodesMap.set(singleMatch[1], singleMatch[2] || singleMatch[3] || singleMatch[4] || singleMatch[1]);
      }
    }
  }

  const nodesList = Array.from(nodesMap.entries());

  if (nodesList.length === 0) {
    return (
      <div className="p-3 my-2 rounded-lg bg-[#FAF6EE] dark:bg-[#11221B] border border-[#E8E1D3] dark:border-[#234436] font-mono text-xs">
        <pre>{code}</pre>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 rounded-xl border bg-white dark:bg-[#162C23] border-[#E8E1D3] dark:border-[#234436] paper-shadow-sm overflow-x-auto">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-[#C67D0A] dark:text-[#E0A844] mb-3">
        Engineering Process Flowchart
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 py-2 min-w-[320px]">
        {nodesList.map(([id, label], idx) => (
          <React.Fragment key={id}>
            <div className="px-3.5 py-2 rounded-lg border bg-[#F5EFE6] dark:bg-[#11221B] border-[#1B4332]/30 dark:border-[#52B788]/40 shadow-xs flex items-center justify-center text-xs font-semibold text-[#142E22] dark:text-[#F6F3EE]">
              <span>{label}</span>
            </div>
            {idx < nodesList.length - 1 && (
              <div className="flex items-center text-[#C67D0A] dark:text-[#E0A844] font-bold text-sm">
                &rarr;
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
