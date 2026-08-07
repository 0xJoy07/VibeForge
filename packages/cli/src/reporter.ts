import chalk from "chalk";
import { writeFile } from "node:fs/promises";

function overall(scores) {
  return Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length);
}

function bar(score) {
  const filled = Math.round(score / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

export function printReport(result) {
  console.log(chalk.bold("\nVibeForge scan summary"));
  for (const [name, score] of Object.entries(result.scores)) {
    const color = score >= 80 ? chalk.teal ?? chalk.green : score >= 65 ? chalk.yellow : chalk.red;
    console.log(`${name.padEnd(12)} ${color(bar(score))} ${score}/100`);
  }
  console.log(`Overall score: ${chalk.bold(overall(result.scores))}/100  Grade: ${chalk.bold(result.grade)}`);
  if (!result.issues.length) return console.log(chalk.green("No issues found."));
  console.log(chalk.bold("\nIssues"));
  for (const issue of result.issues) {
    const color = issue.severity === "critical" ? chalk.red : issue.severity === "warning" ? chalk.yellow : chalk.cyan;
    console.log(color(`[${issue.severity}] ${issue.file}${issue.line ? `:${issue.line}` : ""} ${issue.title}`));
    console.log(`  ${issue.fix}`);
  }
}

export async function writeJsonReport(result) {
  await writeFile("report.json", JSON.stringify(result, null, 2));
  console.log("Saved report.json");
}

export async function writeHtmlReport(result) {
  const rows = result.issues.map((issue) => `<tr><td>${issue.severity}</td><td>${issue.file}</td><td>${issue.line ?? ""}</td><td>${issue.category}</td><td>${issue.title}</td><td>${issue.fix}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>VibeForge report</title><style>body{font-family:Inter,Arial,sans-serif;background:#09090b;color:#fafafa;padding:32px}table{border-collapse:collapse;width:100%;margin-top:24px}td,th{border:1px solid #27272a;padding:10px;text-align:left}th{background:#18181b}.score{font-size:40px;font-weight:800;color:#2dd4bf}</style></head><body><h1>VibeForge report</h1><div class="score">Grade ${result.grade}</div><pre>${JSON.stringify(result.scores, null, 2)}</pre><table><thead><tr><th>Severity</th><th>File</th><th>Line</th><th>Category</th><th>Title</th><th>Fix</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  await writeFile("report.html", html);
  console.log("Saved report.html");
}
