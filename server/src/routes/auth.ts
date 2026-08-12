import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db.js";

const router = Router();

/**
 * POST /api/auth/sync-user (and /api/auth/sync)
 * Called by the frontend after a successful OAuth sign-in.
 * Upserts a User row in Postgres from the Supabase JWT payload.
 */
router.post(["/api/auth/sync-user", "/api/auth/sync"], requireAuth, async (req, res, next) => {
  try {
    const { supabaseId } = req.user!;

    const { id, email: bodyEmail, name: bodyName, avatar: bodyAvatar } = req.body;

    const email = bodyEmail || "";
    const provider = "email"; // or deduce from body if passed
    const name = bodyName || null;
    const avatar = bodyAvatar || null;

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
