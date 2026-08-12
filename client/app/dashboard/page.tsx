import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Terminal, Shield, Check, Laptop, Clock, SearchCode, Code2, CreditCard } from "lucide-react";
import Link from "next/link";
import { CopyCommand } from "@/components/CopyCommand";
import { SubscribedToast } from "@/components/SubscribedToast";

export default async function DashboardPage() {
  const session = await requireUser();
  const dbUser = session.dbUser;

  if (!dbUser) {
    redirect("/login");
  }

  let activeSession: any = null;
  let cliToken: any = null;
  let scans: any[] = [];
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${session.session.access_token ?? ""}` }
    });
    if (res.ok) {
      const data = await res.json();
      scans = data.scans ?? [];
      // activeSession and cliToken might need separate endpoints later
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full gap-8">
      <SubscribedToast />
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 truncate max-w-[300px]">Welcome back!</h1>
        <p className="text-zinc-400">Here is an overview of your AI codebase scans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mock Stats Cards */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-green-500/30 hover:bg-white/5 transition-all duration-200 cursor-default flex flex-col relative overflow-hidden group h-full">
          <Terminal className="absolute top-6 right-6 w-16 h-16 text-green-500/10 group-hover:text-green-500/20 transition-colors" />
          <h3 className="text-sm font-medium text-zinc-400 mb-1 z-10">Total Scans</h3>
          <p className="text-3xl font-bold text-white z-10">{scans.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-green-500/30 hover:bg-white/5 transition-all duration-200 cursor-default flex flex-col relative overflow-hidden group h-full">
          <Shield className="absolute top-6 right-6 w-16 h-16 text-amber-500/10 group-hover:text-amber-500/20 transition-colors" />
          <h3 className="text-sm font-medium text-zinc-400 mb-1 z-10">Issues Found</h3>
          <p className="text-3xl font-bold text-white z-10">{scans.reduce((sum: number, s: any) => sum + (s.issueCount || 0), 0)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-green-500/30 hover:bg-white/5 transition-all duration-200 cursor-default flex flex-col relative overflow-hidden group h-full">
          <Check className="absolute top-6 right-6 w-16 h-16 text-teal-500/10 group-hover:text-teal-500/20 transition-colors" />
          <h3 className="text-sm font-medium text-zinc-400 mb-1 z-10">Files Fixed</h3>
          <p className="text-3xl font-bold text-[#00c97a] z-10">8</p>
        </div>
      </div>

      <div className="border-t border-white/5 my-2" />

      <div className="flex flex-col gap-4 mt-2 mb-4">
        <h2 className="text-xl font-bold text-white">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/scanner" className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-green-500/30 hover:bg-white/10 transition-all duration-200 cursor-pointer flex flex-col group">
            <SearchCode className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Scan a repository</h3>
            <p className="text-sm text-zinc-400">Paste a GitHub URL and get a full AI codebase review</p>
          </Link>
          
          <Link href="/editor" className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-200 cursor-pointer flex flex-col group">
            <Code2 className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Review a snippet</h3>
            <p className="text-sm text-zinc-400">Paste any code into the editor for inline AI feedback</p>
          </Link>
          
          <Link href="/download" className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-200 cursor-pointer flex flex-col group">
            <Terminal className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Install CLI</h3>
            <p className="text-sm text-zinc-400">Scan your local codebase directly from the terminal</p>
          </Link>
          
          <Link href="/billing" className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-amber-500/30 hover:bg-white/10 transition-all duration-200 cursor-pointer flex flex-col group">
            <CreditCard className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Billing & Plan</h3>
            <p className="text-sm text-zinc-400">View your subscription, usage, and scan history</p>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Laptop className="w-5 h-5 text-zinc-400" />
          <h3 className="font-medium text-white">Active Devices</h3>
        </div>
        <div className="divide-y divide-white/5">
          {activeSession ? (
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{activeSession.deviceInfo}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last seen: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(activeSession.lastSeenAt)}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#00c97a]/20 text-[#00c97a] border border-[#00c97a]/30">
                This device
              </span>
            </div>
          ) : (
            <div className="px-6 py-4 text-sm text-zinc-500">No active browser session detected.</div>
          )}

          {cliToken && (
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">CLI</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last used: {cliToken.lastUsedAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(cliToken.lastUsedAt) : 'Never'}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
                Terminal
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 mt-4 text-center hover:border-green-500/20 transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium text-white mb-2">No recent scans</h3>
        <p className="text-sm text-zinc-400 mb-6">You haven't run any CLI scans recently. Use the VibeForge CLI to scan your codebase.</p>
        <CopyCommand command="npx vibeforge scan ." />
      </div>
    </div>
  );
}
