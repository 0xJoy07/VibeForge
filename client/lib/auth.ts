import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AuthSession {
  session: any;
  supabaseUser: SupabaseUser;
  dbUser: { id: string; name?: string; email?: string; avatar?: string } | null;
}

/**
 * getUser — Server-side only.
 * Reads the active Supabase session from cookies.
 * Returns null if there is no active session.
 */
export async function getUser(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return { 
    session, 
    supabaseUser: user, 
    dbUser: { 
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      email: user.email,
      avatar: user.user_metadata?.avatar_url
    } 
  };
}

/**
 * requireUser — Server-side only.
 * Like getUser but throws a redirect to /login if there is no active session.
 */
export async function requireUser(): Promise<AuthSession> {
  const session = await getUser();
  if (!session) redirect("/login");
  return session;
}

/**
 * isPro — Checks whether a User has an active Pro subscription.
 */
export async function isPro(userId: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/status`, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ""}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.subscribed === true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * getFingerprint — Deterministic, privacy-preserving request fingerprint.
 * SHA-256 hash of IP + User-Agent. Used for anonymous quota tracking.
 * Accepts a Next.js Request object (from Route Handlers or middleware).
 */
export function getFingerprint(request: Request): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
  return createHash("sha256").update(ip).digest("hex");
}

export function getFingerprintFromHeaders(headers: Headers): string {
  const ip = headers.get('x-forwarded-for')?.split(',')[0].trim() ?? headers.get('x-real-ip') ?? '127.0.0.1';
  return createHash("sha256").update(ip).digest("hex");
}
