"use client";

import { Loader2, ScanText } from "lucide-react";
import { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import IssueTable from "@/components/IssueTable";
import ScoreRing from "@/components/ScoreRing";
import type { ScanResult } from "@/lib/analysis";

const sample = `const apiKey = "sk_live_hardcoded_secret";

export async function getUser(req, db) {
  const id = req.query.id;
  const user = await db.query("select * from users where id = " + id);
  return user;
}`;

export default function EditorPage() {
  const [code, setCode] = useState(sample);
  const [language, setLanguage] = useState("typescript");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function review() {
    setLoading(true);
    try {
      const response = await fetch("/api/review-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language }) });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#06110b] px-6 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div><h1 className="text-4xl font-black tracking-tight">Paste-and-review</h1><p className="mt-2 text-zinc-400">Use Monaco to review a single snippet.</p></div>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-md border border-white/10 bg-[#0b1a11] px-3 py-2 text-sm">
              <option value="typescript">TypeScript</option><option value="javascript">JavaScript</option><option value="python">Python</option><option value="go">Go</option>
            </select>
          </div>
          <CodeEditor code={code} language={language} issues={result?.issues ?? []} onChange={setCode} />
          <button onClick={review} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-green-400 px-5 py-3 font-bold text-black disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanText className="h-4 w-4" />} Review code</button>
        </section>
        <section className="space-y-5">
          {result ? <><div className="rounded-lg border border-white/10 bg-[#0b1a11] p-5"><ScoreRing scores={result.scores} grade={result.grade} /></div><IssueTable issues={result.issues} /></> : <div className="rounded-lg border border-white/10 bg-[#0b1a11] p-8 text-zinc-400">Run a review to see score arcs and issue details.</div>}
        </section>
      </div>
    </main>
  );
}
