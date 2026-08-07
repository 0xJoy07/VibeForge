"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import TerminalMockup from "@/components/TerminalMockup";

const flags = [
  { flag: "--report html", description: "Save a self-contained report.html with scores and the full issue table." },
  { flag: "--report json", description: "Save raw scan output for CI, dashboards, or custom processing." },
  { flag: "--fix", description: "Back up originals and apply line-level AI fix suggestions." },
];

export default function DownloadPage() {
  const [copied, setCopied] = useState(false);
  const command = "npx vibeforge scan ./src";

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main className="min-h-screen bg-[#06110b] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Scan your codebase in 60 seconds</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-400">Run VibeForge locally with direct Anthropic SDK calls, colored terminal output, HTML reports, and optional fixes.</p>
          <button onClick={copy} className="mt-8 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b1a11] px-5 py-4 font-mono text-green-300 hover:bg-[#102418]">
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />} {command}
          </button>
          <div className="mt-8 grid gap-4">
            {flags.map((item) => (
              <div key={item.flag} className="rounded-lg border border-white/10 bg-[#0b1a11] p-4">
                <code className="text-sm text-green-300">{item.flag}</code>
                <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
        <TerminalMockup />
      </div>
    </main>
  );
}
