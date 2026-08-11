import { SidebarNav } from "@/components/ui/dashboard-sidebar";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const dbUser = session.dbUser;

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <div className="shrink-0 h-full hidden md:block">
        <SidebarNav user={{ name: dbUser?.name || 'User', email: dbUser?.email || '', avatarUrl: dbUser?.avatar || '' }} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top,_#0d2818_0%,_#000000_70%)] overflow-hidden overflow-x-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
