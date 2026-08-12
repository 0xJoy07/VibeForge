"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BackNav } from "@/components/BackNav";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  async function signIn(provider: "google" | "github") {
    setLoadingProvider(provider);
    const supabase = createClient();
    const origin = window.location.origin;

    const next = searchParams.get("next") ?? "/dashboard";

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // Provider redirects the browser — no need to reset loading state
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-black">
      <div className="w-full relative z-50">
        <BackNav toDashboard={false} />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 relative">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Glow orb */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-[#00c97a]/10 blur-[120px]" />

      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Image src="/logo.png" alt="VibeForge" width={48} height={48} className="rounded-[10px]" />
          <span className="font-semibold text-[16px] tracking-[-0.01em] text-white">VibeForge</span>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in to access unlimited scans and the CLI tool
            </p>
          </div>

          {/* Error banner */}
          {error === "auth_failed" && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Authentication failed. Please try again.
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => signIn("google")}
              disabled={loadingProvider !== null}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingProvider === "google" ? (
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            <button
              onClick={() => signIn("github")}
              disabled={loadingProvider !== null}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingProvider === "github" ? (
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <GitHubIcon />
              )}
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs text-zinc-600">OR</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-zinc-600">
            By signing in you agree to our{" "}
            <Link href="/terms" className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
