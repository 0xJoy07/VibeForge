import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db.js";

const router = Router();

const FREE_DAILY_SCANS = Number(process.env.FREE_DAILY_SCANS ?? 3);

/**
 * GET /api/dashboard
 * Returns the authenticated user's scan history, subscription status, and current quota usage.
 */
router.get("/api/dashboard", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;

    if (!dbId) {
      res.status(404).json({ error: "User not found in database. Call /api/auth/sync-user first." });
      return;
    }

    const [user, scans, subscription] = await Promise.all([
      prisma.user.findUnique({
        where: { id: dbId },
        select: { id: true, email: true, name: true, avatar: true, createdAt: true },
      }),
      prisma.scanHistory.findMany({
        where: { userId: dbId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.subscription.findUnique({
        where: { userId: dbId },
        select: { status: true, planId: true, currentPeriodEnd: true },
      }),
    ]);

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    res.json({
      user,
      subscription: subscription ?? null,
      scans,
      quota: {
        limit: FREE_DAILY_SCANS,
        isPro: subscription?.status === "active",
        resetAt: today + "T00:00:00Z",
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
