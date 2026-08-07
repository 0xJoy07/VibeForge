"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import type { Issue } from "@/lib/analysis";

const severityStyles = {
  critical: "border-red-500/30 bg-red-500/10 text-red-200",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  info: "border-green-500/30 bg-green-500/10 text-green-200",
} as const;

export default function IssueTable({ issues }: { issues: Issue[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const severities: Issue["severity"][] = ["critical", "warning", "info"];

  return (
    <div className="space-y-5">
      {severities.map((severity) => {
        const grouped = issues.filter((issue) => issue.severity === severity);
        if (!grouped.length) return null;
        return (
          <section key={severity} className="rounded-lg border border-white/10 bg-[#0b1a11]">
            <div className={`border-b px-4 py-3 text-sm font-bold capitalize ${severityStyles[severity]}`}>{severity} ({grouped.length})</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 font-medium">File</th>
                    <th className="px-4 py-3 font-medium">Line</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Fix</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((issue, index) => {
                    const id = `${severity}-${index}-${issue.file}`;
                    return (
                      <tr key={id} className="border-b border-white/5 align-top last:border-0">
                        <td className="max-w-64 px-4 py-3 font-mono text-xs text-zinc-300">{issue.file}</td>
                        <td className="px-4 py-3 text-zinc-400">{issue.line ?? "-"}</td>
                        <td className="px-4 py-3 text-zinc-300">{issue.category}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setOpen(open === id ? null : id)} className="text-left font-medium text-white hover:text-green-300">{issue.title}</button>
                          {open === id && <p className="mt-2 max-w-xl text-zinc-400">{issue.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <code className="max-w-sm whitespace-normal rounded bg-[#06110b] px-2 py-1 text-xs text-zinc-300">{issue.fix}</code>
                            <button title="Copy fix" onClick={() => navigator.clipboard.writeText(issue.fix)} className="rounded-md border border-white/10 p-2 text-zinc-300 hover:bg-white/10">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
