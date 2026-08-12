export const SYSTEM_PROMPT = `You are a senior engineer auditing a codebase. Analyze ALL provided files and return a JSON object (no markdown) with this exact shape:
{
  scores: { security: number, aiSlop: number, codeQuality: number, performance: number, structure: number },
  grade: 'A'|'B'|'C'|'D'|'F',
  issues: [{ file: string, line: number|null, severity: 'critical'|'warning'|'info', category: string, title: string, description: string, fix: string }]
}
Score each axis 0-100 (100 = perfect). Flag: hardcoded secrets, SQL injection risks, unused imports, copy-paste AI patterns (repetitive boilerplate, inconsistent naming), missing error handling, N+1 queries, deeply nested logic, poor project structure.`;

export function extractJson(text) {
  let cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  let end = cleaned.lastIndexOf("}");

  if (start === -1) {
    console.error("Failed to parse AI response. Raw text:", text);
    throw new Error("AI response did not contain a valid JSON object.");
  }

  // If there's no closing brace at all, just take the rest of the string
  if (end === -1 || end <= start) {
    end = cleaned.length - 1;
  }

  const jsonString = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    // It's likely truncated. Because we sliced up to the last '}', 
    // it usually means we have an unclosed 'issues' array and the root object.
    try {
      return JSON.parse(jsonString + "]}");
    } catch (err2) {
      try {
        return JSON.parse(jsonString + "}");
      } catch (err3) {
        console.error("Failed to parse JSON string:", jsonString);
        throw new Error("AI response contained invalid JSON syntax.");
      }
    }
  }
}

export function demoResult(repoUrl = "https://github.com/OWASP/WebGoat") {
  return {
    scores: { security: 54, aiSlop: 82, codeQuality: 71, performance: 68, structure: 75 },
    grade: "C",
    issues: [
      {
        file: repoUrl.includes("WebGoat") ? "src/main/java/org/owasp/webgoat/lessons/sqlinjection/SqlInjectionLesson.java" : "src/app.ts",
        line: 42,
        severity: "critical",
        category: "security",
        title: "SQL input reaches query construction",
        description: "User-controlled values appear to be composed into a database query without parameter binding.",
        fix: "Replace string-concatenated SQL with prepared statements or an ORM parameter binding API."
      },
      {
        file: "src/main/java/org/owasp/webgoat/container/users/UserService.java",
        line: 88,
        severity: "warning",
        category: "error handling",
        title: "Authentication path hides failure context",
        description: "The login flow handles multiple failure modes in a broad branch, making audit logging and diagnostics weaker.",
        fix: "Split validation, credential lookup, and password verification into separate guarded branches with structured logging."
      },
      {
        file: "src/main/resources/application.properties",
        line: null,
        severity: "info",
        category: "structure",
        title: "Security training configuration is mixed with runtime defaults",
        description: "Demo and runtime settings live together, which raises the chance of accidental reuse outside the teaching environment.",
        fix: "Move training-only defaults into a dedicated profile and require explicit profile selection."
      }
    ]
  };
}
