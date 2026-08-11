import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { prisma } from "../db.js";

const router = Router();

/**
 * POST /api/auth/sync-user
 * Called by the frontend after a successful OAuth sign-in.
 * Upserts a User row in Postgres from the Supabase JWT payload.
 */
router.post("/api/auth/sync-user", requireAuth, async (req, res, next) => {
  try {
    const { supabaseId } = req.user!;

    // Fetch full profile from Supabase to get provider info, name, avatar
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.admin.getUserById(supabaseId);
    if (error || !supabaseUser) {
      res.status(404).json({ error: "Supabase user not found." });
      return;
    }

    const email = supabaseUser.email ?? "";
    const provider = supabaseUser.app_metadata?.provider ?? "email";
    const name =
      (supabaseUser.user_metadata?.full_name as string | undefined) ??
      (supabaseUser.user_metadata?.name as string | undefined) ??
      null;
    const avatar =
      (supabaseUser.user_metadata?.avatar_url as string | undefined) ??
      (supabaseUser.user_metadata?.picture as string | undefined) ??
      null;

    const user = await prisma.user.upsert({
      where: { supabaseId },
      create: { supabaseId, email, name, avatar, provider },
      update: { email, name, avatar },
      include: { subscription: { select: { status: true, planId: true } } },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
