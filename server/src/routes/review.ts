import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { checkQuota } from "../middleware/quota.js";
import { reviewPrompt } from "../ai.js";
import { demoResult } from "../analysis.js";
import { prisma } from "../db.js";

const router = Router();

router.post("/api/review-code", optionalAuth, checkQuota, async (req, res, next) => {
  try {
    const { code, language } = (req.body ?? {}) as { code?: string; language?: string };
    if (!code) {
      res.status(400).json({ error: "code is required." });
      return;
    }

    let result;

    if (!process.env.GROQ_API_KEY) {
      result = demoResult("snippet");
    } else {
      const lang = language ?? "text";
      const content = `Review this ${lang} snippet as a single file named snippet.${lang}:\n\`\`\`\n${code}\n\`\`\``;
      result = await reviewPrompt(content, process.env.GROQ_API_KEY!);
    }

    // Persist snippet review for authenticated users
    if (req.user?.dbId) {
      await prisma.scanHistory.create({
        data: {
          userId: req.user.dbId,
          repoUrl: null,
          score: Math.round(
            Object.values(result.scores).reduce((a, b) => a + b, 0) /
              Object.values(result.scores).length
          ),
          grade: result.grade,
          issueCount: result.issues.length,
          type: "snippet",
        },
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
