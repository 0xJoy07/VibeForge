import { requireUser, getFingerprintFromHeaders } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { BackNav } from "@/components/BackNav";
import { PlanCard } from "@/components/billing/PlanCard";
import { UsageCard } from "@/components/billing/UsageCard";
import { ScanHistoryTable } from "@/components/billing/ScanHistoryTable";

export const metadata = {
  title: "Billing & Plan | VibeForge",
};

export default async function BillingPage() {
  const session = await requireUser();
  const userId = session.dbUser?.id;

  if (!userId) {
    return <div>User not found in database.</div>;
  }

  let proStatus = false;
  let scanCount = 0;
  let scans = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${session.session.access_token ?? ""}` }
    });
    if (res.ok) {
      const data = await res.json();
      proStatus = data.quota?.isPro ?? false;
      scans = data.scans ?? [];
      // To properly get scanCount, would need another endpoint, mocking for now:
      scanCount = 0;
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#06110b] text-white">
      <BackNav toDashboard={true} />
      <div className="container max-w-5xl py-10 px-6 mx-auto flex-1">
        <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Plan</h1>
        <p className="text-zinc-400">Manage your subscription, usage limits, and view scan history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <PlanCard initialIsPro={proStatus} />
        <UsageCard scanCount={scanCount} isPro={proStatus} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6">Recent Scans</h2>
        <ScanHistoryTable scans={scans} />
      </div>
      </div>
    </div>
  );
}
