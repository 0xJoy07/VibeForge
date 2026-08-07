import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { User as PrismaUser } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AuthSession {
  supabaseUser: SupabaseUser;
  dbUser: PrismaUser | null;
}

/**
 * getUser — Server-side only.
 * Reads the active Supabase session from cookies, then looks up the Prisma User row.
 * Returns null if there is no active session.
 */
export async function getUser(): Promise<AuthSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  return { supabaseUser: user, dbUser };
}

/**
 * requireUser — Server-side only.
 * Like getUser but throws a redirect to /login if there is no active session.
 * Use in Server Components and Route Handlers that need auth.
 */
export async function requireUser(): Promise<AuthSession> {
  const session = await getUser();
  if (!session) redirect("/login");
  return session;
}

/**
 * isPro — Checks whether a Prisma User (by dbId) has an active Pro subscription.
 * An active subscription must have status === "active" and currentPeriodEnd in the future.
 */
export async function isPro(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true, currentPeriodEnd: true },
  });

  if (!subscription) return false;

  const isActive = subscription.status === "active";
  const notExpired =
    subscription.currentPeriodEnd === null ||
    subscription.currentPeriodEnd > new Date();

  return isActive && notExpired;
}

/**
 * getFingerprint — Deterministic, privacy-preserving request fingerprint.
 * SHA-256 hash of IP + User-Agent. Used for anonymous quota tracking.
 * Accepts a Next.js Request object (from Route Handlers or middleware).
 */
export function getFingerprint(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";
  return createHash("sha256").update(`${ip}::${ua}`).digest("hex");
}
