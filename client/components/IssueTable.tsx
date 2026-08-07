"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import type { Issue } from "@/lib/analysis";

const severityStyles = {
  critical: "border-l-red-500 bg-red-500/10 text-red-200 border-b-white/10",
  warning: "border-l-amber-500 bg-amber-500/10 text-amber-200 border-b-white/10",
  info: "border-l-green-500 bg-green-500/10 text-green-200 border-b-white/10",
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
          <section key={severity} className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1a11]">
            <div className={`border-b border-l-4 px-4 py-3 text-sm font-bold capitalize ${severityStyles[severity]}`}>{severity} ({grouped.length})</div>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup>
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "5%" }} />
                </colgroup>
                <thead className="text-[13px] font-medium text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 font-medium">File</th>
                    <th className="px-4 py-3 font-medium">Line</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Fix</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((issue, index) => {
                    const id = `${severity}-${index}-${issue.file}`;
                    return (
                      <tr key={id} className="border-t border-white/[0.06] align-top first:border-t-0">
                        <td className="max-w-0 px-4 py-4">
                          <div className="block truncate font-mono text-[12px] text-zinc-300" title={issue.file}>{issue.file}</div>
                        </td>
                        <td className="px-4 py-4 text-zinc-400">{issue.line ?? "-"}</td>
                        <td className="px-4 py-4 text-zinc-300">{issue.category}</td>
                        <td className="px-4 py-4">
                          <button onClick={() => setOpen(open === id ? null : id)} className="text-left font-medium text-white hover:text-green-300">{issue.title}</button>
                          {open === id && <p className="mt-2 max-w-xl text-zinc-400">{issue.description}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <code className="block max-w-full whitespace-normal rounded bg-[#06110b] px-2 py-1 text-[12px] text-zinc-300">{issue.fix}</code>
                        </td>
                        <td className="px-4 py-4">
                          <button title="Copy fix" onClick={() => navigator.clipboard.writeText(issue.fix)} className="ml-auto flex h-7 w-7 items-center justify-center rounded border border-white/10 text-zinc-300 hover:bg-white/10">
                            <Copy className="h-4 w-4" />
                          </button>
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
