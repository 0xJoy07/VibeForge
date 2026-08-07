import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function applyFixes(root, issues) {
  for (const issue of issues) {
    if (!issue.file || !issue.line || !issue.fix) continue;
    const target = path.resolve(root, issue.file);
    const backup = `${target}.vibeforge.bak`;
    const content = await readFile(target, "utf8").catch(() => null);
    if (!content) continue;
    await copyFile(target, backup).catch(() => undefined);
    const lines = content.split(/\r?\n/);
    lines[issue.line - 1] = issue.fix;
    await writeFile(target, lines.join("\n"));
    console.log(`Fixed: ${issue.file} line ${issue.line}`);
  }
}
