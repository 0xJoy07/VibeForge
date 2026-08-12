import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { prisma } from "../db.js";

const FREE_DAILY_SCANS = Number(process.env.FREE_DAILY_SCANS ?? 3);

export const checkQuota = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: FREE_DAILY_SCANS,
  keyGenerator: (req) => {
    // Group by dbId if available, else fallback to fingerprint
    return req.user?.dbId || (req.headers["x-fingerprint"] as string) || req.ip || "unknown";
  },
  skip: async (req) => {
    // Authenticated users with an active Pro subscription bypass quota
    if (req.user?.dbId) {
      try {
        const sub = await prisma.subscription.findUnique({
          where: { userId: req.user.dbId },
          select: { status: true },
        });
        if (sub?.status === "active") {
          return true;
        }
      } catch {
        // Fall through on error
      }
    }
    return false;
  },
  handler: (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    res.status(429).json({
      error: "Daily scan limit reached.",
      limit: FREE_DAILY_SCANS,
      resetAt: today + "T00:00:00Z",
      upgrade: "/pricing",
    });
  },
  store: {
    // Custom store using Prisma DailyQuota
    async increment(key: string) {
      const today = new Date().toISOString().slice(0, 10);
      try {
        const quota = await prisma.dailyQuota.upsert({
          where: { fingerprint_date: { fingerprint: key, date: today } },
          create: { fingerprint: key, date: today, scanCount: 1 },
          update: { scanCount: { increment: 1 } },
        });
        return {
          totalHits: quota.scanCount,
          resetTime: new Date(new Date().setHours(24, 0, 0, 0)),
        };
      } catch (err) {
        console.error("[quota] DB error:", err);
        // Fail open
        return {
          totalHits: 1,
          resetTime: new Date(new Date().setHours(24, 0, 0, 0)),
        };
      }
    },
    async decrement(key: string) {
      const today = new Date().toISOString().slice(0, 10);
      try {
        await prisma.dailyQuota.update({
          where: { fingerprint_date: { fingerprint: key, date: today } },
          data: { scanCount: { decrement: 1 } },
        });
      } catch (err) {
        // Ignore
      }
    },
    async resetKey(key: string) {
      const today = new Date().toISOString().slice(0, 10);
      try {
        await prisma.dailyQuota.delete({
          where: { fingerprint_date: { fingerprint: key, date: today } },
        });
      } catch (err) {
        // Ignore
      }
    },
  },
});
