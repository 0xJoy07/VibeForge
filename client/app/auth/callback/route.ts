import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUserToPrisma } from "@/lib/sync-user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error("[auth/callback] exchange error:", error?.message);
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }

    // Sync Supabase user → Prisma User table
    await syncUserToPrisma(data.session.user);

    // Redirect to the 'next' param (used by CLI auth flow) or default to /dashboard
    const redirectTo = next && next.startsWith("/") ? next : "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (err) {
    console.error("[auth/callback] unexpected error:", err);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
