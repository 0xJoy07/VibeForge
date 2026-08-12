import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db.js";

const router = Router();

/**
 * GET /api/sessions
 * Returns all DeviceSession rows for the logged-in user, ordered by lastActive desc.
 */
router.get("/api/sessions", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;
    if (!dbId) {
      res.status(404).json({ error: "User not synced." });
      return;
    }

    const sessions = await prisma.deviceSession.findMany({
      where: { userId: dbId },
      orderBy: { lastActive: "desc" },
    });

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/sessions/:id
 * Deletes a specific session by id (verifying ownership).
 */
router.delete("/api/sessions/:id", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;
    const id = req.params["id"] as string;

    if (!dbId) {
      res.status(404).json({ error: "User not synced." });
      return;
    }

    const session = await prisma.deviceSession.findUnique({ where: { id } });
    if (!session || session.userId !== dbId) {
      res.status(404).json({ error: "Session not found." });
      return;
    }

    await prisma.deviceSession.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
