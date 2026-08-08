import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getFingerprint, isPro } from "@/lib/auth";
import { checkAndIncrementQuota } from "@/lib/quota";
import { fetchRepoFiles } from "@/lib/github";
import { reviewRepo } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { validateCliToken } from "@/lib/cli-token";

// ── Helpers ───────────────────────────────────────────────────────────────────

const GITHUB_URL_RE = /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/;

function weightedScore(scores: {
  security: number;
  aiSlop: number;
  codeQuality: number;
  performance: number;
  structure: number;
}): number {
  // Weights: security matters most, aiSlop is informational
  const weighted =
    scores.security * 0.35 +
    scores.codeQuality * 0.25 +
    scores.performance * 0.2 +
    scores.structure * 0.12 +
    scores.aiSlop * 0.08;
  return Math.round(weighted);
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { 
      repoUrl?: string; 
      files?: { path: string, content: string }[] 
    };
    const { repoUrl, files: bodyFiles } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { error: "A repository URL is required." },
        { status: 400 }
      );
    }

    const isGithub = repoUrl.startsWith("https://github.com");
    const isCli = repoUrl.startsWith("cli://");

    if (!isGithub && !isCli) {
      return NextResponse.json(
        { error: "Only GitHub URLs or CLI local scans are supported." },
        { status: 400 }
      );
    }

    // ── Auth & Quota ──────────────────────────────────────────────────────────
    let userId: string | null = null;
    let isCliReq = false;

    // 1. Check for CLI Token first
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const validation = await validateCliToken(token);
      
      if (!validation) {
        return NextResponse.json(
          { error: "Invalid or expired CLI token. Run 'vibeforge login'." },
          { status: 401 }
        );
      }
      
      userId = validation.user.id;
      isCliReq = true;
      // Pro check is already enforced inside validateCliToken, so quota is bypassed
    } else {
      // 2. Fall back to Web Session
      let session = null;
      try {
        session = await getUser();
      } catch (err) {
        console.error("[scan-repo] getUser error:", err);
      }
      
      const fingerprint = getFingerprint(request);
      userId = session?.dbUser?.id ?? null;
      
      let proUser = false;
      if (userId) {
        try {
          proUser = await isPro(userId);
        } catch (err) {
          console.error("[scan-repo] isPro error:", err);
        }
      }

      if (!proUser) {
        const quota = await checkAndIncrementQuota(fingerprint);
        if (!quota.allowed) {
          return NextResponse.json(
            { 
              error: 'Daily scan limit reached', 
              message: 'Free users get 3 scans per day. Upgrade to Pro for unlimited scans.', 
              upgrade: '/pricing', 
              used: 3, 
              remaining: 0 
            },
            { status: 429 }
          );
        }
      }
    }

    // ── Fetch repo files ──────────────────────────────────────────────────────
    let files = bodyFiles && bodyFiles.length > 0 ? bodyFiles : [];
    
    if (files.length === 0 && isGithub) {
      try {
        files = await fetchRepoFiles(repoUrl);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        if (e.status === 404) {
          return NextResponse.json(
            { error: "Repository not found or is private." },
            { status: 422 }
          );
        }
        if (e.status === 403) {
          return NextResponse.json(
            { error: "GitHub rate limit exceeded. Try again later or add a GITHUB_TOKEN." },
            { status: 422 }
          );
        }
        throw err;
      }
    }

    if (!files.length) {
      return NextResponse.json(
        { error: "No supported source files found in this repository." },
        { status: 422 }
      );
    }

    // ── AI Review ─────────────────────────────────────────────────────────────
    let result;
    try {
      result = await reviewRepo(files);
    } catch (e) {
      console.error("[Gemini Error in reviewRepo]:", e);
      return NextResponse.json({ error: "AI review failed. Please try again." }, { status: 500 });
    }

    // ── Persist to ScanHistory ────────────────────────────────────────────────
    const score = weightedScore(result.scores);
    const scan = await prisma.scanHistory.create({
      data: {
        userId: userId,
        repoUrl,
        score,
        grade: result.grade,
        issueCount: result.issues.length,
        type: "repo",
      },
    });

    return NextResponse.json({
      scores: result.scores,
      grade: result.grade,
      issues: result.issues,
      summary: result.summary,
      scanId: scan.id,
    });
  } catch (err) {
    console.error("[scan-repo]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
