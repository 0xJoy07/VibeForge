import { glob } from "glob";
import { readFile } from "node:fs/promises";
import path from "node:path";

const SKIP_SEGMENTS = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rs", ".cs", ".rb", ".php"]);

function isSkipped(relativePath) {
  return relativePath.split(/[\\/]+/).some((segment) => SKIP_SEGMENTS.has(segment));
}

export async function scanFiles(root) {
  const cwd = path.resolve(root);
  const matches = await glob("**/*", { cwd, nodir: true, absolute: true });
  const files = [];
  for (const file of matches) {
    const relativePath = path.relative(cwd, file).replaceAll("\\", "/");
    if (isSkipped(relativePath)) continue;
    if (!EXTENSIONS.has(path.extname(file))) continue;
    const content = await readFile(file, "utf8").catch(() => null);
    if (!content || content.length > 120000) continue;
    files.push({ path: relativePath, absolutePath: file, content });
  }
  return files.slice(0, 300);
}

export function batchFiles(files, size = 30) {
  const batches = [];
  for (let index = 0; index < files.length; index += size) batches.push(files.slice(index, index + size));
  return batches;
}

export function buildPrompt(files) {
  return files.map((file) => `FILE: ${file.path}\n\`\`\`\n${file.content.slice(0, 18000)}\n\`\`\``).join("\n\n");
}
