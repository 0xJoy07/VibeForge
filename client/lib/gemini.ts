import { GoogleGenAI, Type, Schema } from "@google/genai";
import type { RepoFile } from "./github";

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

// ── Schemas ────────────────────────────────────────────────────────────────────

const RepoReviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        security: { type: Type.INTEGER },
        aiSlop: { type: Type.INTEGER },
        codeQuality: { type: Type.INTEGER },
        performance: { type: Type.INTEGER },
        structure: { type: Type.INTEGER },
      },
      required: ["security", "aiSlop", "codeQuality", "performance", "structure"],
    },
    grade: { type: Type.STRING, enum: ["A", "B", "C", "D", "F"] },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          file: { type: Type.STRING },
          line: { type: Type.INTEGER, nullable: true },
          lineEnd: { type: Type.INTEGER, nullable: true },
          severity: { type: Type.STRING, enum: ["critical", "warning", "info"] },
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          fix: { type: Type.STRING },
        },
        required: ["file", "line", "lineEnd", "severity", "category", "title", "description", "fix"],
      },
    },
    summary: { type: Type.STRING },
  },
  required: ["scores", "grade", "issues", "summary"],
};

const SnippetReviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          line: { type: Type.INTEGER, nullable: true },
          lineEnd: { type: Type.INTEGER, nullable: true },
          severity: { type: Type.STRING, enum: ["critical", "warning", "info"] },
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          fix: { type: Type.STRING },
        },
        required: ["line", "lineEnd", "severity", "category", "title", "description", "fix"],
      },
    },
    summary: { type: Type.STRING },
  },
  required: ["score", "issues", "summary"],
};

// ── Prompts ────────────────────────────────────────────────────────────────────

const REPO_SYSTEM_PROMPT = `You are a senior engineer auditing a codebase. Analyze ALL provided files.
Scores 0-100. Grade A/B/C/D/F based on weighted average. Flag: hardcoded secrets, SQL injection, XSS, eval usage, missing awaits, copy-paste AI boilerplate, inconsistent naming, unused imports, dead code, N+1 queries, missing error handling, deeply nested logic, poor folder structure.`;

const SNIPPET_SYSTEM_PROMPT = `You are a senior engineer reviewing a code snippet.
Flag: security risks (eval, SQL injection, XSS, hardcoded secrets), missing awaits, null dereferences, AI slop patterns, dead code, performance anti-patterns. Be precise with line numbers.`;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  return new GoogleGenAI({ apiKey });
}

// ── Exports ───────────────────────────────────────────────────────────────────

/**
 * reviewRepo — Full codebase review using Gemini 1.5 Flash
 */
export async function reviewRepo(files: RepoFile[]): Promise<RepoReviewResult> {
  const ai = getGeminiClient();

  const userContent = files
    .map((f) => `FILE: ${f.path}\n\`\`\`\n${f.content.slice(0, 18_000)}\n\`\`\``)
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    config: {
      systemInstruction: REPO_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RepoReviewSchema,
      temperature: 0.1,
    }
  });

  if (!response.text) {
    throw new Error("Empty response from Gemini.");
  }
  
  return JSON.parse(response.text) as RepoReviewResult;
}

/**
 * reviewSnippet — Single snippet review using Gemini 1.5 Flash
 */
export async function reviewSnippet(
  code: string,
  language: string
): Promise<SnippetReviewResult> {
  const ai = getGeminiClient();

  const userContent = `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    config: {
      systemInstruction: SNIPPET_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: SnippetReviewSchema,
      temperature: 0.1,
    }
  });

  if (!response.text) {
    throw new Error("Empty response from Gemini.");
  }

  return JSON.parse(response.text) as SnippetReviewResult;
}
