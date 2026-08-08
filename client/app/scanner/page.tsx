"use client";

import { Loader2, Play, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { BackNav } from "@/components/BackNav";
import IssueTable from "@/components/IssueTable";
import ScoreRing from "@/components/ScoreRing";
import ScanSkeleton from "@/components/scanner/ScanSkeleton";
import { demoResult, type ScanResult } from "@/lib/analysis";

function ScannerContent() {
  const searchParams = useSearchParams();
  const [repoUrl, setRepoUrl] = useState(searchParams.get("repo") ?? "");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState(false);

  async function runScan(url = repoUrl) {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setQuotaError(false);
    setResult(null);
    try {
      const response = await fetch("/api/scan-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url.trim() }),
      });
      
      if (response.status === 429) {
        setQuotaError(true);
        return;
      }
      
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Scan failed.");
      setResult(body);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Scan failed.");
      if (url.includes("OWASP/WebGoat")) setResult(demoResult(url));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialRepo = searchParams.get("repo");
    if (initialRepo) runScan(initialRepo);
  }, []);

  return (
    <div className="min-h-screen bg-[#06110b] text-white flex flex-col">
      <BackNav toDashboard={true} />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-[1100px] space-y-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-[28px] font-bold">Repository scanner</h1>
            <p className="mt-1 text-[14px] text-zinc-400">Score a public GitHub repository across five engineering axes.</p>
          </div>
          <button onClick={() => { const demo = "https://github.com/OWASP/WebGoat"; setRepoUrl(demo); runScan(demo); }} className="rounded-md border border-white/20 px-4 py-1.5 text-sm font-medium hover:bg-white/5">Try a demo</button>
        </div>

        <div className="relative flex h-[48px] w-full items-center rounded-lg border border-white/10 bg-[#06110b] p-1.5">
          <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/owner/repo" className="h-full flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-zinc-500" />
          <button onClick={() => runScan()} disabled={loading} className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-md bg-[#00c97a] px-[12px] font-semibold text-black disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />} Scan
          </button>
        </div>

        {quotaError && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-emerald-50">You have used all 3 free scans today.</h3>
              <p className="text-emerald-100/70 text-sm mt-1">Upgrade to Pro for unlimited scans, CLI access, and report exports.</p>
            </div>
            <Link href="/pricing" className="shrink-0 rounded-lg bg-[#00c97a] hover:bg-[#00b06b] px-6 py-2.5 font-bold text-black transition-colors">
              Upgrade to Pro
            </Link>
          </div>
        )}

        {error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">{error}</div>}
        
        {loading && !result && <ScanSkeleton />}
        
        {result && !loading && (
          <div className="space-y-6">
            <ScoreRing scores={result.scores} grade={result.grade} />
            <IssueTable issues={result.issues} />
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
export default function ScannerPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#06110b] px-6 py-10 text-white"><div className="mx-auto max-w-7xl text-zinc-400">Loading scanner...</div></main>}>
      <ScannerContent />
    </Suspense>
  );
}
