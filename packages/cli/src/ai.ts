export const SYSTEM_PROMPT = `You are a senior engineer auditing a codebase. Analyze ALL provided files and return a JSON object (no markdown) with this exact shape:
{
  scores: { security: number, aiSlop: number, codeQuality: number, performance: number, structure: number },
  grade: 'A'|'B'|'C'|'D'|'F',
  issues: [{ file: string, line: number|null, severity: 'critical'|'warning'|'info', category: string, title: string, description: string, fix: string }]
}
Score each axis 0-100 (100 = perfect). Flag: hardcoded secrets, SQL injection risks, unused imports, copy-paste AI patterns (repetitive boilerplate, inconsistent naming), missing error handling, N+1 queries, deeply nested logic, poor project structure.`;

export function extractJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("Claude response did not contain JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function mergeResults(results) {
  const keys = ["security", "aiSlop", "codeQuality", "performance", "structure"];
  const scores = Object.fromEntries(keys.map((key) => [key, Math.round(results.reduce((sum, result) => sum + result.scores[key], 0) / results.length)]));
  const overall = Math.round(keys.reduce((sum, key) => sum + scores[key], 0) / keys.length);
  return { scores, grade: gradeFromScore(overall), issues: results.flatMap((result) => result.issues ?? []) };
}

export function heuristicReview(files) {
  const issues = [];
  for (const file of files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (/(api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}/i.test(line)) issues.push({ file: file.path, line: index + 1, severity: "critical", category: "security", title: "Potential hardcoded secret", description: "A credential-like value appears inline in source code.", fix: "Move this value to an environment variable or secret manager." });
      if (/select .+ \+|query\(.+\+/.test(line)) issues.push({ file: file.path, line: index + 1, severity: "critical", category: "security", title: "Possible SQL injection", description: "A query appears to concatenate values directly into SQL.", fix: "Use parameterized queries instead of string concatenation." });
      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) issues.push({ file: file.path, line: index + 1, severity: "warning", category: "error handling", title: "Empty catch block", description: "Errors are swallowed without logging or recovery.", fix: "Log the error or return a typed failure path." });
    });
  }
  const penalty = Math.min(35, issues.length * 4);
  return { scores: { security: 90 - penalty, aiSlop: 82, codeQuality: 86 - Math.min(20, issues.length * 2), performance: 84, structure: 80 }, grade: gradeFromScore(84 - penalty), issues };
}
