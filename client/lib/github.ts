const SKIP_PARTS = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage", "vendor"]);
const CODE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rs", ".cs", ".rb", ".php"];
const BINARY_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".pdf", ".zip", ".lock"];

export function parseGitHubUrl(repoUrl: string) {
  const parsed = new URL(repoUrl);
  if (!["github.com", "www.github.com"].includes(parsed.hostname)) throw new Error("Only github.com repository URLs are supported.");
  const [owner, repo] = parsed.pathname.replace(/^\/|\/$/g, "").split("/");
  if (!owner || !repo) throw new Error("Expected a GitHub URL shaped like https://github.com/owner/repo.");
  return { owner, repo: repo.replace(/\.git$/, "") };
}

function shouldSkip(path: string) {
  const parts = path.split("/");
  const lower = path.toLowerCase();
  if (parts.some((part) => SKIP_PARTS.has(part))) return true;
  if (lower.includes("package-lock.json") || lower.includes("pnpm-lock.yaml") || lower.includes("yarn.lock")) return true;
  return BINARY_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function priority(path: string) {
  let score = 0;
  if (path.startsWith("src/")) score += 100;
  if (path.startsWith("lib/")) score += 90;
  if (CODE_EXTENSIONS.some((extension) => path.endsWith(extension))) score += 40;
  if (path.includes("test") || path.includes("spec")) score -= 10;
  return score;
}

export async function fetchRepoFiles(repoUrl: string) {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  const treeResponse = await fetch(treeUrl, { headers: { Accept: "application/vnd.github+json", "User-Agent": "VibeForge" } });
  if (!treeResponse.ok) throw new Error(`GitHub tree request failed with ${treeResponse.status}.`);
  const treeBody = (await treeResponse.json()) as { tree?: Array<{ path: string; type: string; size?: number }> };
  const paths = (treeBody.tree ?? [])
    .filter((item) => item.type === "blob" && item.path && !shouldSkip(item.path) && (item.size ?? 0) < 120_000)
    .sort((a, b) => priority(b.path) - priority(a.path))
    .slice(0, 30)
    .map((item) => item.path);

  const files = await Promise.all(paths.map(async (path) => {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`;
    const response = await fetch(rawUrl, { headers: { "User-Agent": "VibeForge" } });
    if (!response.ok) return null;
    return { path, content: await response.text() };
  }));
  return files.filter((file): file is { path: string; content: string } => Boolean(file));
}

export function buildFilesPrompt(files: Array<{ path: string; content: string }>) {
  return files.map((file) => `FILE: ${file.path}\n\`\`\`\n${file.content.slice(0, 18_000)}\n\`\`\``).join("\n\n");
}
