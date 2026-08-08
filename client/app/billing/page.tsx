import { requireUser, getFingerprintFromHeaders, isPro } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const proStatus = await isPro(userId);
  
  const headersList = await headers();
  const fingerprint = getFingerprintFromHeaders(headersList);
  
  const today = new Date().toISOString().split('T')[0];

  const quota = await prisma.dailyQuota.findFirst({
    where: {
      fingerprint,
      date: today
    }
  });
  
  const scanCount = quota?.scanCount ?? 0;

  const scans = await prisma.scanHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20
  });

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
