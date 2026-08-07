"use client";

import { Loader2, Play } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import IssueTable from "@/components/IssueTable";
import ScoreRing from "@/components/ScoreRing";
import { demoResult, type ScanResult } from "@/lib/analysis";

function ScannerContent() {
  const searchParams = useSearchParams();
  const [repoUrl, setRepoUrl] = useState(searchParams.get("repo") ?? "");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScan(url = repoUrl) {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/scan-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url.trim() }),
      });
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
    <main className="min-h-screen bg-[#06110b] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Repository scanner</h1>
            <p className="mt-2 text-zinc-400">Score a public GitHub repository across five engineering axes.</p>
          </div>
          <button onClick={() => { const demo = "https://github.com/OWASP/WebGoat"; setRepoUrl(demo); runScan(demo); }} className="rounded-lg border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-medium text-green-200 hover:bg-green-400/15">Try a demo</button>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b1a11] p-4 sm:flex-row">
          <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/owner/repo" className="h-12 flex-1 rounded-md border border-white/10 bg-[#06110b] px-4 outline-none focus:border-green-300" />
          <button onClick={() => runScan()} disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-green-400 px-5 font-bold text-black disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Scan
          </button>
        </div>

        {error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">{error}</div>}
        {result && (
          <div className="space-y-8">
            <section className="rounded-lg border border-white/10 bg-[#0b1a11] p-6"><ScoreRing scores={result.scores} grade={result.grade} /></section>
            <IssueTable issues={result.issues} />
          </div>
        )}
      </div>
    </main>
  );
}
export default function ScannerPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#06110b] px-6 py-10 text-white"><div className="mx-auto max-w-7xl text-zinc-400">Loading scanner...</div></main>}>
      <ScannerContent />
    </Suspense>
  );
}
