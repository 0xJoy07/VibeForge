import { getUser, isPro } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import CliAuthClient from "./client-page";

export default async function CliAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ port?: string; state?: string }>;
}) {
  const { port, state } = await searchParams;

  if (!port || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="max-w-md w-full border border-white/10 bg-white/5 p-8 rounded-2xl text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid Request</h2>
          <p className="text-zinc-400">Missing port or state parameters. Please initiate login from the CLI.</p>
        </div>
      </div>
    );
  }

  const session = await getUser();
  if (!session) {
    const nextUrl = encodeURIComponent(`/cli-auth?port=${port}&state=${state}`);
    redirect(`/login?next=${nextUrl}`);
  }

  const pro = session.dbUser ? await isPro(session.dbUser.id) : false;

  if (!pro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="max-w-md w-full border border-white/10 bg-white/5 p-8 rounded-2xl text-center">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">CLI requires Pro</h2>
          <p className="text-zinc-400 mb-6">You need an active Pro subscription to use the VibeForge CLI.</p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-[#00c97a] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00b06b]"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  // Generate plain token and hand it off to the client component to POST
  let plainToken = "";
  let errorMessage = "";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cli/token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.session.access_token ?? ""}` }
    });
    if (res.ok) {
      const data = await res.json();
      plainToken = data.token;
    } else {
      const errorData = await res.json();
      errorMessage = errorData.error || "Failed to generate token.";
    }
  } catch (err) {
    console.error("Failed to generate token", err);
    errorMessage = "Internal server error while generating token.";
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="max-w-md w-full border border-white/10 bg-white/5 p-8 rounded-2xl text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Token Generation Failed</h2>
          <p className="text-zinc-400 mb-6">{errorMessage}</p>
          <Link
            href="/dashboard/cli-tokens"
            className="inline-flex items-center justify-center rounded-xl bg-[#00c97a] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00b06b]"
          >
            Manage Tokens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#00c97a]/10 blur-[100px]" />
      
      <div className="max-w-md w-full border border-white/10 bg-white/5 rounded-2xl relative z-10">
        <CliAuthClient token={plainToken} port={port} stateParam={state} />
      </div>
    </div>
  );
}
