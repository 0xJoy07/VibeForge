import { Router } from "express";
import { createHash, randomBytes } from "crypto";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db.js";

const router = Router();

const TOKEN_TTL_DAYS = 90;

/**
 * POST /api/cli/token
 * Generate a new CLI token for the authenticated user.
 * Returns the plain token ONCE — only the hash is stored.
 */
router.post("/api/cli/token", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;
    if (!dbId) {
      res.status(404).json({ error: "User not synced. Call /api/auth/sync-user first." });
      return;
    }

    // Limit: max 5 active tokens per user
    const count = await prisma.cliToken.count({ where: { userId: dbId } });
    if (count >= 5) {
      res.status(400).json({ error: "Maximum of 5 CLI tokens allowed. Revoke one first." });
      return;
    }

    const plainToken = `vbf_${randomBytes(32).toString("hex")}`;
    const tokenHash = createHash("sha256").update(plainToken).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const record = await prisma.cliToken.create({
      data: { userId: dbId, tokenHash, expiresAt },
    });

    res.status(201).json({
      id: record.id,
      token: plainToken, // shown once only
      expiresAt: record.expiresAt,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/cli/tokens
 * List all CLI tokens for the authenticated user (no plain tokens, only metadata).
 */
router.get("/api/cli/tokens", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;
    if (!dbId) {
      res.status(404).json({ error: "User not synced." });
      return;
    }

    const tokens = await prisma.cliToken.findMany({
      where: { userId: dbId },
      select: { id: true, expiresAt: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ tokens });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cli/token/:id
 * Revoke a specific CLI token.
 */
router.delete("/api/cli/token/:id", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;
    const id = req.params["id"] as string;

    if (!dbId) {
      res.status(404).json({ error: "User not synced." });
      return;
    }

    const token = await prisma.cliToken.findUnique({ where: { id } });
    if (!token || token.userId !== dbId) {
      res.status(404).json({ error: "Token not found." });
      return;
    }

    await prisma.cliToken.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
