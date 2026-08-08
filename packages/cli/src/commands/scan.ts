import fs from "fs";
import path from "path";
import { globSync } from "glob";
import ora from "ora";
import chalk from "chalk";
import { getStoredToken, validateTokenWithServer } from "../auth";
import { generateHtmlReport, printTerminalSummary } from "../reporter";
import { applyFixes } from "../fixer";

const SKIP_DIRS = ["node_modules", ".git", "dist", "build", ".next", "coverage", "vendor", ".turbo", ".cache", "out", "__pycache__"];
const SKIP_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".otf", ".pdf", ".zip", ".tar", ".gz", ".mp4", ".mp3"];
const SKIP_PATS = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", ".lock", ".min.js", ".min.css"];

function shouldSkip(filePath: string): boolean {
  const parts = filePath.split(path.sep);
  const lower = filePath.toLowerCase();
  if (parts.some((p) => SKIP_DIRS.includes(p))) return true;
  if (SKIP_PATS.some((pat) => lower.includes(pat))) return true;
  const ext = lower.includes(".") ? "." + lower.split(".").pop()! : "";
  if (SKIP_EXTS.includes(ext)) return true;
  return false;
}

export async function scanCommand(dir: string, options: any, apiUrl: string): Promise<void> {
  const token = getStoredToken();
  if (!token) {
    console.log(chalk.red("Run 'vibeforge login' first."));
    process.exit(1);
  }

  const user = await validateTokenWithServer(apiUrl, token);
  if (!user) {
    console.log(chalk.red("Session expired or invalid. Run 'vibeforge login' again."));
    process.exit(1);
  }

  const absDir = path.resolve(dir);
  const allFiles = globSync("**/*.{ts,js,py,go,java}", { cwd: absDir, nodir: true });
  const filesToScan = allFiles.filter((f) => !shouldSkip(f));

  if (filesToScan.length === 0) {
    console.log(chalk.yellow("No source files found to scan."));
    process.exit(0);
  }

  const batch = filesToScan.slice(0, 30);
  const filesPayload = batch.map((f) => {
    const content = fs.readFileSync(path.join(absDir, f), "utf-8");
    return { path: f, content };
  });

  const spinner = ora(`Scanning ${batch.length} files...`).start();

  try {
    const res = await fetch(`${apiUrl}/api/scan-repo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        repoUrl: `cli://${absDir}`,
        files: filesPayload,
      }),
    });

    if (!res.ok) {
      spinner.fail("Scan failed.");
      const err = await res.json().catch(() => ({ error: res.statusText }));
      console.log(chalk.red(err.error));
      process.exit(1);
    }

    const data = await res.json();
    spinner.succeed("Scan complete!");

    printTerminalSummary(data);

    if (options.report === "html") {
      generateHtmlReport(data, path.join(absDir, "report.html"));
      console.log(chalk.blue("\nHTML report generated: report.html"));
    } else if (options.report === "json") {
      fs.writeFileSync(path.join(absDir, "report.json"), JSON.stringify(data, null, 2));
      console.log(chalk.blue("\nJSON report generated: report.json"));
    }

    if (options.fix) {
      console.log("\nApplying fixes...");
      applyFixes(data.issues, absDir);
    }

  } catch (err) {
    spinner.fail("Scan failed due to an error.");
    console.error(err);
    process.exit(1);
  }
}
