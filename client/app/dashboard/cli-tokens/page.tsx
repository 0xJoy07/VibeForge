import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import CliTokenManager from "./cli-token-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI Tokens | VibeForge",
  description: "Manage your VibeForge CLI authentication tokens",
};

export default async function CliTokensPage() {
  const session = await requireUser();
  const dbUser = session.dbUser;

  if (!dbUser) {
    redirect("/login");
  }

  let tokens = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cli/tokens`, {
      headers: { Authorization: `Bearer ${session.session.access_token ?? ""}` }
    });
    if (res.ok) {
      tokens = await res.json();
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">CLI Tokens</h1>
        <p className="text-zinc-400">
          Manage authentication tokens for the VibeForge CLI. Keep these secure as they grant full access to your account via the command line.
        </p>
      </div>

      <CliTokenManager tokens={tokens} />
    </div>
  );
}
