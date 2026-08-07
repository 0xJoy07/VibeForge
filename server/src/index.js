import express from "express";
import cors from "cors";
import { demoResult } from "./analysis.js";
import { reviewPrompt } from "./ai.js";
import { buildFilesPrompt, fetchRepoFiles } from "./github.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/scan-repo", async (req, res) => {
  try {
    const { repoUrl } = req.body ?? {};
    if (!repoUrl) return res.status(400).json({ error: "repoUrl is required." });
    if (repoUrl.includes("github.com/OWASP/WebGoat") && !process.env.ANTHROPIC_API_KEY) {
      return res.json(demoResult(repoUrl));
    }
    const files = await fetchRepoFiles(repoUrl);
    if (!files.length) return res.status(422).json({ error: "No supported source files were found." });
    const result = await reviewPrompt(buildFilesPrompt(files), process.env.ANTHROPIC_API_KEY);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown scan error." });
  }
});

app.post("/api/review-code", async (req, res) => {
  try {
    const { code, language } = req.body ?? {};
    if (!code) return res.status(400).json({ error: "code is required." });
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json(demoResult("snippet"));
    }
    const content = `Review this ${language ?? "text"} snippet as a single file named snippet.${language ?? "txt"}:\n\`\`\`\n${code}\n\`\`\``;
    const result = await reviewPrompt(content, process.env.ANTHROPIC_API_KEY);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown review error." });
  }
});

app.listen(port, () => {
  console.log(`VibeForge server listening on http://localhost:${port}`);
});
