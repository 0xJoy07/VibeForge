import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackNav({ toDashboard }: { toDashboard?: boolean }) {
  const target = toDashboard ? "/dashboard" : "/";
  const label = toDashboard ? "Back to Dashboard" : "Back to Home";

  return (
    <div className="flex h-10 w-full items-center justify-between border-b border-white/10 px-4 text-sm text-zinc-400">
      <Link href={target} className="inline-flex items-center hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> {label}
      </Link>
      
      <Link href="/" className="flex items-center gap-1.5 group">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-white transition-transform group-hover:scale-105">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-xs font-bold text-white tracking-tight">VibeForge</span>
      </Link>
    </div>
  );
}
