import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { User as PrismaUser } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { razorpay } from "@/lib/razorpay";

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
  const supabase = await createSupabaseServerClient();
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
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) return false;
    
    if (sub.status === 'active' && sub.currentPeriodEnd && sub.currentPeriodEnd > new Date()) {
      return true;
    }
    
    if (!razorpay) return false;
    
    const razorSub = await razorpay.subscriptions.fetch(sub.razorpaySubId);
    
    if (razorSub.status === 'active') {
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: 'active',
          currentPeriodEnd: new Date((razorSub as any).current_end * 1000)
        }
      });
      return true;
    }
    
    await prisma.subscription.update({
      where: { userId },
      data: { status: razorSub.status }
    });
    
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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";
  return createHash("sha256").update(`${ip}::${ua}`).digest("hex");
}
