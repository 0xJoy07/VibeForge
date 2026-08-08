"use client";

import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useState } from "react";
import type { Issue } from "@/lib/analysis";

const severityColors = {
  critical: "border-l-red-500 bg-red-500/10 text-red-200",
  warning: "border-l-amber-500 bg-amber-500/10 text-amber-200",
  info: "border-l-teal-500 bg-teal-500/10 text-teal-200", // Prompt requested Teal for info
} as const;

function IssueCard({ issue, index }: { issue: Issue; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [applied, setApplied] = useState(false);

  return (
    <div 
      className={`w-full overflow-hidden rounded-xl border border-white/10 bg-[#06110b] p-4 transition-colors hover:border-white/20 border-l-4 animate-[fadeInUp_0.4s_ease_forwards] opacity-0 ${
        issue.severity === 'critical' ? 'border-l-red-500' :
        issue.severity === 'warning' ? 'border-l-amber-500' :
        'border-l-teal-500'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Line 1: Meta info */}
      <div className="flex items-center gap-3 text-xs font-medium">
        <span className={`rounded-full px-2 py-0.5 capitalize border-l-[3px] ${severityColors[issue.severity]}`}>
          {issue.severity}
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-zinc-300">
          {issue.category}
        </span>
        {issue.line && (
          <span className="text-zinc-500">
            Line {issue.line}
          </span>
        )}
      </div>

      {/* Line 2: Title & Description */}
      <div className="mt-3">
        <h4 className="font-bold text-white">{issue.title}</h4>
        <p className="mt-1 text-sm text-zinc-400">{issue.description}</p>
      </div>

      {/* Line 3: Expandable Fix */}
      <div className="mt-4 rounded-lg border border-white/5 bg-[#0b1a11]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white"
        >
          <span>Suggested Fix</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expanded && (
          <div className="border-t border-white/5 p-3">
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12px] text-green-300">
              <code>{issue.fix}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Line 4: Actions */}
      <div className="mt-4 flex items-center justify-end gap-3 border-t border-white/5 pt-4">
        <button className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white">
          Jump to line
        </button>
        <button
          onClick={() => setApplied(true)}
          disabled={applied}
          className="flex items-center gap-1.5 rounded-md bg-[#00c97a] px-3 py-1.5 text-sm font-bold text-black transition-colors hover:bg-[#00b06b] disabled:opacity-70 disabled:hover:bg-[#00c97a]"
        >
          {applied ? (
            <>
              <Check className="h-4 w-4" /> Applied
            </>
          ) : (
            "Apply fix"
          )}
        </button>
      </div>
    </div>
  );
}

export default function EditorIssueList({ issues }: { issues: Issue[] }) {
  const severities: Issue["severity"][] = ["critical", "warning", "info"];

  return (
    <div className="space-y-6">
      {severities.map((severity) => {
        const grouped = issues.filter((issue) => issue.severity === severity);
        if (!grouped.length) return null;
        
        return (
          <section key={severity} className="space-y-3">
            <div className={`flex w-max items-center gap-2 rounded-lg border border-white/10 bg-[#0b1a11] px-4 py-2 font-bold capitalize border-l-4 ${severityColors[severity]}`}>
              {severity}
              <span className="flex h-5 items-center justify-center rounded-full bg-white/10 px-2 text-xs">
                {grouped.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {grouped.map((issue, idx) => (
                <IssueCard key={`${severity}-${idx}`} issue={issue} index={idx} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
