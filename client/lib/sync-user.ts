import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * syncUserToPrisma
 * Upserts a Supabase User into the Prisma `User` table.
 * Safe to call on every login — idempotent via `supabaseId` unique key.
 *
 * Field mapping:
 *   supabaseUser.id                        → supabaseId
 *   supabaseUser.email                     → email
 *   supabaseUser.user_metadata.full_name   → name
 *   supabaseUser.user_metadata.avatar_url  → avatar
 *   supabaseUser.app_metadata.provider     → provider
 */
export async function syncUserToPrisma(supabaseUser: SupabaseUser): Promise<PrismaUser> {
  const supabaseId = supabaseUser.id;
  const email = supabaseUser.email ?? "";
  const name =
    (supabaseUser.user_metadata?.["full_name"] as string | undefined) ??
    (supabaseUser.user_metadata?.["name"] as string | undefined) ??
    null;
  const avatar =
    (supabaseUser.user_metadata?.["avatar_url"] as string | undefined) ??
    (supabaseUser.user_metadata?.["picture"] as string | undefined) ??
    null;
  const provider =
    (supabaseUser.app_metadata?.["provider"] as string | undefined) ?? "email";

  const user = await prisma.user.upsert({
    where: { supabaseId },
    create: { supabaseId, email, name, avatar, provider },
    update: { email, name, avatar },
  });

  return user;
}
