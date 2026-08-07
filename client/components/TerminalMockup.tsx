"use client";

import { useEffect, useState } from "react";

const lines = [
  "$ npx vibeforge scan ./src",
  "Reading 24 source files...",
  "Batching files for Claude Sonnet...",
  "Security       61/100  [3 critical]",
  "AI slop        78/100  [2 warnings]",
  "Code quality   82/100",
  "Performance    70/100  [1 warning]",
  "Structure      88/100",
  "Overall score: 74/100  Grade: B",
];

export default function TerminalMockup() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const timer = window.setInterval(() => setCount((value) => (value >= lines.length ? 1 : value + 1)), 900);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#06110b] font-mono text-sm shadow-2xl">
      <div className="flex gap-2 border-b border-white/10 bg-[#102418] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-amber-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
      </div>
      <div className="min-h-72 p-5 leading-7 text-zinc-300">
        {lines.slice(0, count).map((line) => (
          <p key={line} className={line.includes("Overall") ? "font-bold text-green-300" : line.includes("critical") ? "text-red-300" : ""}>{line}</p>
        ))}
      </div>
    </div>
  );
}
