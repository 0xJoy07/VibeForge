"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <code 
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 bg-black rounded-lg border border-white/10 hover:border-[#00c97a]/50 text-[#00c97a] font-mono text-sm cursor-pointer transition-colors"
      title="Copy to clipboard"
    >
      {command}
      {copied ? <Check className="w-4 h-4 text-[#00c97a]" /> : null}
    </code>
  );
}
