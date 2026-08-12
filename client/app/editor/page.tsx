"use client";

import { Loader2, Terminal, CheckCircle2, Code2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { BackNav } from "@/components/BackNav";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import ScoreRingEditor from "@/components/ScoreRingEditor";
import EditorIssueList from "@/components/EditorIssueList";
import SkeletonReview from "@/components/SkeletonReview";
import type { ScanResult } from "@/lib/analysis";
import { createClient } from "@/lib/supabase/client";

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
  const [reviewState, setReviewState] = useState<"idle" | "loading" | "done">("idle");
  const [quotaError, setQuotaError] = useState(false);

  async function review() {
    setReviewState("loading");
    setResult(null);
    setQuotaError(false);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/review-code`, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`
        }, 
        body: JSON.stringify({ code, language }) 
      });
      
      if (response.status === 429) {
        setQuotaError(true);
        setReviewState("idle");
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || "An error occurred");
        setReviewState("idle");
        return;
      }
      
      setResult(data);
      setReviewState("done");
    } catch {
      setReviewState("idle");
    }
  }

  function onEditorChange(val: string | undefined) {
    setCode(val ?? "");
    if (reviewState === "done") {
      setReviewState("idle");
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#06110b] text-white">
      <BackNav toDashboard={true} />

      <main className="flex h-[calc(100vh-40px)] flex-col md:flex-row">
        {/* Left Panel: Editor */}
        <section className="flex h-[400px] w-full shrink-0 flex-col border-white/10 md:h-full md:w-1/2 md:border-r">
          {/* Header Bar */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4 text-sm bg-[#0b1a11]">
            <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-zinc-300">
              snippet.{language || "txt"}
            </span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              className="rounded-md border border-white/10 bg-zinc-900 px-3 py-1 text-white text-xs outline-none focus:border-green-400"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
            </select>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language || "typescript"}
              value={code}
              onChange={onEditorChange}
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 14, 
                wordWrap: "on", 
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>

          {/* Bottom Bar / Action */}
          <div className="flex h-12 shrink-0 items-center justify-center border-t border-white/10 bg-[#0b1a11] p-1">
            <button 
              onClick={review} 
              disabled={reviewState === "loading"} 
              className="flex h-full w-full items-center justify-center gap-2 rounded-md bg-[#00c97a] font-bold text-black transition-colors hover:bg-[#00b06b] disabled:opacity-70 disabled:hover:bg-[#00c97a]"
            >
              {reviewState === "loading" && (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
              )}
              {reviewState === "done" && (
                <><CheckCircle2 className="h-4 w-4" /> Re-review</>
              )}
              {reviewState === "idle" && (
                <><Terminal className="h-4 w-4" /> Review code</>
              )}
            </button>
          </div>
        </section>

        {/* Right Panel: Results & Empty State */}
        <section className="flex h-[calc(100vh-400px)] w-full flex-col overflow-y-auto bg-zinc-950/50 p-6 md:h-full md:w-1/2">
          
          {quotaError && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg text-emerald-50">You have used all 3 free scans today.</h3>
                <p className="text-emerald-100/70 text-sm mt-1">Upgrade to Pro for unlimited scans, CLI access, and report exports.</p>
              </div>
              <Link href="/pricing" className="shrink-0 rounded-lg bg-[#00c97a] hover:bg-[#00b06b] px-6 py-2.5 font-bold text-black transition-colors">
                Upgrade to Pro
              </Link>
            </div>
          )}

          {reviewState === "idle" && !result && !quotaError && (
            <div className="flex h-full items-center justify-center flex-col text-center text-zinc-500">
              <Code2 className="mb-4 h-12 w-12 opacity-50" />
              <h3 className="text-lg font-medium text-zinc-300">Paste code and hit Review</h3>
              <p className="mt-2 max-w-sm text-sm">AI will flag security issues, AI slop, dead code and more.</p>
            </div>
          )}

          {reviewState === "loading" && (
            <SkeletonReview />
          )}

          {reviewState === "done" && result && (
            <div className="space-y-6">
              <ScoreRingEditor 
                scores={result.scores ?? {
                  security: (result as any).score || 0,
                  aiSlop: (result as any).score || 0,
                  codeQuality: (result as any).score || 0,
                  performance: (result as any).score || 0,
                  structure: (result as any).score || 0,
                }} 
                grade={result.grade} 
              />
              <EditorIssueList issues={result.issues} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
