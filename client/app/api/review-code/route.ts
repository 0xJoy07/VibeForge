import { NextResponse } from "next/server";
import { getUser, getFingerprint, isPro } from "@/lib/auth";
import { checkAndIncrementQuota } from "@/lib/quota";
import { reviewSnippet } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { validateCliToken } from "@/lib/cli-token";

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string; language?: string };
    const { code, language = "text" } = body;

    // Validate input
    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "code is required." }, { status: 400 });
    }
    if (code.length > 50_000) {
      return NextResponse.json(
        { error: "Code exceeds 50,000 character limit. Please submit a smaller snippet." },
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
      const session = await getUser();
      const fingerprint = getFingerprint(request);

      userId = session?.dbUser?.id ?? null;
      const proUser = userId ? await isPro(userId) : false;

      if (!proUser) {
        const quota = await checkAndIncrementQuota(fingerprint);
        if (!quota.allowed) {
          return NextResponse.json(
            {
              error: "Daily review limit reached. Upgrade to Pro for unlimited reviews.",
              upgrade: "/pricing",
              remaining: 0,
            },
            { status: 429 }
          );
        }
      }
    }

    // ── AI Review ─────────────────────────────────────────────────────────────
    let result;
    try {
      result = await reviewSnippet(code, language);
    } catch {
      return NextResponse.json({ error: "AI review failed. Please try again." }, { status: 500 });
    }

    // ── Persist to ScanHistory ────────────────────────────────────────────────
    const grade = scoreToGrade(result.score);
    const scan = await prisma.scanHistory.create({
      data: {
        userId: userId,
        repoUrl: null,
        score: result.score,
        grade,
        issueCount: result.issues.length,
        type: "snippet",
      },
    });

    return NextResponse.json({
      score: result.score,
      grade,
      issues: result.issues,
      summary: result.summary,
      scanId: scan.id,
    });
  } catch (err) {
    console.error("[review-code]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
