import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, User, Bell, Shield } from "lucide-react";

export default async function SettingsPage() {
  const session = await requireUser();
  if (!session.dbUser) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-zinc-400">Manage your account preferences and settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm cursor-not-allowed opacity-70">
          <User className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Profile</h3>
          <p className="text-sm text-zinc-400">Update your name, email, and avatar.</p>
          <span className="inline-block mt-4 text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-zinc-300">Coming Soon</span>
        </div>
        
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm cursor-not-allowed opacity-70">
          <Bell className="w-8 h-8 text-amber-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Notifications</h3>
          <p className="text-sm text-zinc-400">Configure email alerts for completed scans.</p>
          <span className="inline-block mt-4 text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-zinc-300">Coming Soon</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm cursor-not-allowed opacity-70">
          <Shield className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Security</h3>
          <p className="text-sm text-zinc-400">Manage sessions and two-factor authentication.</p>
          <span className="inline-block mt-4 text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-zinc-300">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
