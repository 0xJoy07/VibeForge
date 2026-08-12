import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity, Clock } from "lucide-react";
import Link from "next/link";
import { CopyCommand } from "@/components/CopyCommand";

export default async function HistoryPage() {
  const session = await requireUser();
  if (!session.dbUser) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Scan History</h1>
        <p className="text-zinc-400">View logs of all previous codebase scans.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-12 text-center hover:border-green-500/20 transition-all duration-200 min-h-[300px] flex flex-col items-center justify-center">
        <Activity className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No recent scans</h3>
        <p className="text-sm text-zinc-400 mb-8 max-w-md">
          You haven't run any CLI scans recently. Once you run a scan, the history, fixed files, and full JSON reports will appear here.
        </p>
        
        <div className="flex flex-col gap-2 w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 text-left">Run a scan now</p>
          <CopyCommand command="npx vibeforge scan ." />
        </div>
      </div>
    </div>
  );
}
