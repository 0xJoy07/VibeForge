import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back!</h1>
        <p className="text-zinc-400">Here is an overview of your AI codebase scans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mock Stats Cards */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Total Scans</h3>
          <p className="text-3xl font-bold text-white">12</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Issues Found</h3>
          <p className="text-3xl font-bold text-white">45</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Files Fixed</h3>
          <p className="text-3xl font-bold text-[#00c97a]">8</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 mt-4 text-center">
        <h3 className="text-lg font-medium text-white mb-2">No recent scans</h3>
        <p className="text-sm text-zinc-400 mb-6">You haven't run any CLI scans recently. Use the VibeForge CLI to scan your codebase.</p>
        <code className="px-4 py-2 bg-black rounded-lg border border-white/10 text-[#00c97a] font-mono text-sm">
          npx vibeforge scan .
        </code>
      </div>
    </div>
  );
}
