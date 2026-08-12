import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { checkQuota } from "../middleware/quota.js";
// @ts-ignore
import { reviewPrompt } from "../ai.js";
// @ts-ignore
import { buildFilesPrompt, fetchRepoFiles } from "../github.js";
// @ts-ignore
import { demoResult } from "../analysis.js";
import { prisma } from "../db.js";

const router = Router();

router.post("/api/scan-repo", optionalAuth, checkQuota, async (req, res, next) => {
  try {
    const { repoUrl } = (req.body ?? {}) as { repoUrl?: string };
    if (!repoUrl) {
      res.status(400).json({ error: "repoUrl is required." });
      return;
    }

    let result: any;

    // Return demo result if no API key configured
    if (repoUrl.includes("github.com/OWASP/WebGoat") && !process.env.OPENROUTER_API_KEY) {
      result = demoResult(repoUrl);
    } else {
      const files = await fetchRepoFiles(repoUrl);
      if (!files.length) {
        res.status(422).json({ error: "No supported source files were found." });
        return;
      }
      result = await reviewPrompt(buildFilesPrompt(files), process.env.OPENROUTER_API_KEY);
    }

    // Persist scan history for authenticated users
    if (req.user?.dbId) {
      await prisma.scanHistory.create({
        data: {
          userId: req.user.dbId,
          repoUrl,
          score: Math.round(
            Object.values(result.scores as Record<string, number>).reduce((a, b) => a + b, 0) /
              Object.values(result.scores as Record<string, number>).length
          ),
          grade: result.grade,
          issueCount: result.issues.length,
          type: "repo",
        },
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
