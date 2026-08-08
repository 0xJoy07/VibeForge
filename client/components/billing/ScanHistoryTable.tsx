import { History } from "lucide-react";
import type { ScanHistory } from "@prisma/client";

interface ScanHistoryTableProps {
  scans: ScanHistory[];
}

export function ScanHistoryTable({ scans }: ScanHistoryTableProps) {
  if (!scans || scans.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
        <History className="w-12 h-12 text-zinc-600 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-2">No scans yet</h3>
        <p className="text-sm text-zinc-400">Run your first scan to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 uppercase bg-black/40 border-b border-white/10">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">Date</th>
              <th scope="col" className="px-6 py-4 font-medium">Type</th>
              <th scope="col" className="px-6 py-4 font-medium">Target</th>
              <th scope="col" className="px-6 py-4 font-medium">Score</th>
              <th scope="col" className="px-6 py-4 font-medium">Grade</th>
              <th scope="col" className="px-6 py-4 font-medium">Issues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-zinc-300 whitespace-nowrap">
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  }).format(new Date(scan.createdAt))}
                </td>
                <td className="px-6 py-4 text-zinc-400 capitalize">
                  {scan.type}
                </td>
                <td className="px-6 py-4 text-zinc-200">
                  {scan.type === 'repo' && scan.repoUrl ? (
                    <span className="truncate max-w-[200px] block" title={scan.repoUrl}>
                      {scan.repoUrl.replace(/^https?:\/\//, '')}
                    </span>
                  ) : (
                    <span className="text-zinc-500 italic">Code snippet</span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-zinc-300">
                  {scan.score}/100
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getGradeColor(scan.grade)}`}>
                    {scan.grade}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {scan.issueCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getGradeColor(grade: string | null) {
  switch (grade) {
    case 'A': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 'B': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'C': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'D':
    case 'F': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30';
  }
}
