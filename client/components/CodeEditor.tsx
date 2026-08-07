"use client";

import Editor from "@monaco-editor/react";
import type { Issue } from "@/lib/analysis";

export default function CodeEditor({ code, language, issues, onChange }: { code: string; language: string; issues: Issue[]; onChange: (value: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0b1a11]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-zinc-400">
        <span>snippet.{language || "txt"}</span>
        <span>{issues.length} issues</span>
      </div>
      <Editor
        height="520px"
        theme="vs-dark"
        language={language || "typescript"}
        value={code}
        onChange={(value: string | undefined) => onChange(value ?? "")}
        options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on", scrollBeyondLastLine: false }}
      />
    </div>
  );
}
