import type { RepoFile } from "./github";
import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReviewIssue {
  file: string;
  line: number | null;
  lineEnd: number | null;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  fix: string;
}

export interface RepoReviewResult {
  scores: {
    security: number;
    aiSlop: number;
    codeQuality: number;
    performance: number;
    structure: number;
  };
  grade: "A" | "B" | "C" | "D" | "F";
  issues: ReviewIssue[];
  summary: string;
}

export interface SnippetReviewResult {
  score: number;
  issues: Omit<ReviewIssue, "file">[];
  summary: string;
}

// ── Prompts ────────────────────────────────────────────────────────────────────

const REPO_SYSTEM_PROMPT = `You are a senior engineer auditing a codebase. Analyze ALL provided files.
Scores 0-100. Grade A/B/C/D/F based on weighted average. Flag: hardcoded secrets, SQL injection, XSS, eval usage, missing awaits, copy-paste AI boilerplate, inconsistent naming, unused imports, dead code, N+1 queries, missing error handling, deeply nested logic, poor folder structure.
Please respond ONLY with valid JSON matching this exact structure:
{
  "scores": { "security": number, "aiSlop": number, "codeQuality": number, "performance": number, "structure": number },
  "grade": "A" | "B" | "C" | "D" | "F",
  "issues": [{ "file": string, "line": number | null, "lineEnd": number | null, "severity": "critical" | "warning" | "info", "category": string, "title": string, "description": string, "fix": string }],
  "summary": string
}`;

const SNIPPET_SYSTEM_PROMPT = `You are a senior engineer reviewing a code snippet.
Flag: security risks (eval, SQL injection, XSS, hardcoded secrets), missing awaits, null dereferences, AI slop patterns, dead code, performance anti-patterns. Be precise with line numbers.
Please respond ONLY with valid JSON matching this exact structure:
{
  "score": number,
  "issues": [{ "line": number | null, "lineEnd": number | null, "severity": "critical" | "warning" | "info", "category": string, "title": string, "description": string, "fix": string }],
  "summary": string
}`;

// ── Exports ───────────────────────────────────────────────────────────────────

/**
 * reviewRepo — Full codebase review using OpenRouter
 */
export async function reviewRepo(files: RepoFile[]): Promise<RepoReviewResult> {

  const userContent = files
    .map((f) => `FILE: ${f.path}\n\`\`\`\n${f.content.slice(0, 18_000)}\n\`\`\``)
    .join("\n\n");

  const completion = await openrouter.chat.completions.create({
    model: "openrouter/auto",
    messages: [
      { role: "system", content: REPO_SYSTEM_PROMPT },
      { role: "user", content: userContent }
    ],
    response_format: {
      type: "json_object",
    },
  });
  
  const text = completion.choices[0].message.content ?? "";

  if (!text) {
    throw new Error("Empty response from AI.");
  }
  
  // Clean up any markdown json wrapping if the model outputs it
  const cleanText = text.replace(/^```json\n/, "").replace(/\n```$/, "").trim();
  
  return JSON.parse(cleanText) as RepoReviewResult;
}

/**
 * reviewSnippet — Single snippet review using OpenRouter
 */
export async function reviewSnippet(
  code: string,
  language: string
): Promise<SnippetReviewResult> {
  const userContent = `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``;

  const completion = await openrouter.chat.completions.create({
    model: "openrouter/auto",
    messages: [
      { role: "system", content: SNIPPET_SYSTEM_PROMPT },
      { role: "user", content: userContent }
    ],
    response_format: {
      type: "json_object",
    },
  });
  
  const text = completion.choices[0].message.content ?? "";

  if (!text) {
    throw new Error("Empty response from AI.");
  }

  const cleanText = text.replace(/^```json\n/, "").replace(/\n```$/, "").trim();

  return JSON.parse(cleanText) as SnippetReviewResult;
}
