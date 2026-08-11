import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

const FREE_DAILY_SCANS = Number(process.env.FREE_DAILY_SCANS ?? 3);

/**
 * checkQuota — reads `x-fingerprint` header and enforces the free daily scan limit.
 * Authenticated Pro subscribers bypass this check entirely.
 */
export async function checkQuota(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Authenticated users with an active Pro subscription bypass quota
  if (req.user?.dbId) {
    try {
      const sub = await prisma.subscription.findUnique({
        where: { userId: req.user.dbId },
        select: { status: true },
      });
      if (sub?.status === "active") {
        next();
        return;
      }
    } catch {
      // If subscription lookup fails, fall through to fingerprint quota
    }
  }

  const fingerprint = (req.headers["x-fingerprint"] as string | undefined)?.trim();
  if (!fingerprint) {
    res.status(400).json({ error: "Missing x-fingerprint header." });
    return;
  }

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  try {
    const quota = await prisma.dailyQuota.upsert({
      where: { fingerprint_date: { fingerprint, date: today } },
      create: { fingerprint, date: today, scanCount: 1 },
      update: { scanCount: { increment: 1 } },
    });

    if (quota.scanCount > FREE_DAILY_SCANS) {
      res.status(429).json({
        error: "Daily scan limit reached.",
        limit: FREE_DAILY_SCANS,
        resetAt: today + "T00:00:00Z",
        upgrade: "/pricing",
      });
      return;
    }

    next();
  } catch (err) {
    console.error("[quota] DB error:", err);
    // On DB failure, allow the request through (fail open)
    next();
  }
}
