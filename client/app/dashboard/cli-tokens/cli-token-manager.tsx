"use client";

import { useState } from "react";
import { Terminal, Copy, Check, Trash2, ShieldAlert, Key } from "lucide-react";
import { generateTokenAction, revokeTokenAction, revokeAllTokensAction } from "./actions";

type CliToken = {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date | null;
};

export default function CliTokenManager({ tokens }: { tokens: CliToken[] }) {
  const [newToken, setNewToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setNewToken(null);
      const { token } = await generateTokenAction();
      setNewToken(token);
    } catch (error) {
      console.error("Failed to generate token:", error);
      alert("Failed to generate token");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this token?")) return;
    
    try {
      setRevokingId(id);
      await revokeTokenAction(id);
      if (newToken) setNewToken(null);
    } catch (error) {
      console.error("Failed to revoke token:", error);
      alert("Failed to revoke token");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm("Are you sure you want to revoke ALL tokens? This will log out all your CLI instances.")) return;
    
    try {
      setRevokingAll(true);
      await revokeAllTokensAction();
      setNewToken(null);
    } catch (error) {
      console.error("Failed to revoke tokens:", error);
      alert("Failed to revoke tokens");
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Generate Token Section */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Key className="w-32 h-32 text-[#00c97a]" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#00c97a]" />
            Generate New Token
          </h2>
          <p className="text-zinc-400 mb-6 text-sm">
            Generate a new CLI token to authenticate with the VibeForge CLI. You will only be able to see this token once.
          </p>

          {newToken ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400 font-medium mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Token generated successfully
                </p>
                <p className="text-xs text-zinc-400 mb-3">
                  Please copy this token now. You won't be able to see it again!
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black/50 p-3 rounded-lg text-green-400 font-mono text-sm border border-white/10 break-all">
                    {newToken}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                    title="Copy token"
                  >
                    {copied ? <Check className="w-5 h-5 text-[#00c97a]" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setNewToken(null)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Clear token from screen
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#00c97a] hover:bg-[#00b06b] text-black font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? "Generating..." : "Generate Token"}
            </button>
          )}
        </div>
      </div>

      {/* Active Tokens List */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Active Tokens
            </h3>
            <p className="text-sm text-zinc-400 mt-1">Manage your active CLI authentication tokens.</p>
          </div>
          
          {tokens.length > 0 && (
            <button
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="text-sm px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {revokingAll ? "Revoking..." : "Revoke All"}
            </button>
          )}
        </div>
        
        <div className="divide-y divide-white/5">
          {tokens.length > 0 ? (
            tokens.map((token) => (
              <div key={token.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white font-mono">
                      Token ending in ...{token.id.slice(-4)}
                    </span>
                    {new Date() > new Date(token.expiresAt) && (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500/20 text-red-400 border border-red-500/20">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-zinc-500">
                    <span>Created: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(token.createdAt))}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      Last used: {token.lastUsedAt 
                        ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(token.lastUsedAt)) 
                        : 'Never'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRevoke(token.id)}
                  disabled={revokingId === token.id}
                  className="text-sm px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5 w-fit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {revokingId === token.id ? "Revoking..." : "Revoke"}
                </button>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-zinc-500 flex flex-col items-center gap-2">
              <Terminal className="w-8 h-8 text-zinc-700 mb-2" />
              <p>No active CLI tokens found.</p>
              <p className="text-xs">Generate a token above to get started with the CLI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
