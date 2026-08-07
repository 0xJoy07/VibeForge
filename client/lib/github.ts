const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "coverage",
  "vendor", ".turbo", ".cache", "out", "__pycache__",
]);

const SKIP_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".pdf", ".zip", ".tar", ".gz", ".mp4", ".mp3",
]);

const SKIP_PATTERNS = [
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  ".lock", ".min.js", ".min.css",
];

const HIGH_PRIORITY_DIRS = ["src/", "lib/", "app/", "pages/", "components/", "server/", "api/"];
const CONFIG_PATTERNS = [".config.", ".env.example", "tsconfig", "vite.", "next.", "tailwind."];

export interface RepoFile {
  path: string;
  content: string;
}

function parseGitHubUrl(repoUrl: string): { owner: string; repo: string } {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) throw new Error("Invalid GitHub URL. Expected: https://github.com/owner/repo");
  const owner = match[1]!;
  const repo = match[2]!.replace(/\.git$/, "");
  return { owner, repo };
}

function shouldSkip(path: string): boolean {
  const lower = path.toLowerCase();
  const parts = path.split("/");
  if (parts.some((p) => SKIP_DIRS.has(p))) return true;
  if (SKIP_PATTERNS.some((pat) => lower.includes(pat))) return true;
  const ext = lower.includes(".") ? "." + lower.split(".").pop()! : "";
  return SKIP_EXTENSIONS.has(ext);
}

function filePriority(path: string): number {
  const lower = path.toLowerCase();
  let score = 0;
  if (HIGH_PRIORITY_DIRS.some((d) => lower.startsWith(d))) score += 60;
  if (CONFIG_PATTERNS.some((p) => lower.includes(p))) score += 30;
  if (path.includes("test") || path.includes("spec") || path.includes("__test")) score -= 20;
  score -= Math.min(path.split("/").length * 2, 20);
  return score;
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "VibeForge",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchRepoFiles(repoUrl: string): Promise<RepoFile[]> {
  const { owner, repo } = parseGitHubUrl(repoUrl);

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers: githubHeaders() }
  );

  if (treeRes.status === 404) {
    throw Object.assign(new Error("Repository not found or is private."), { status: 404 });
  }
  if (treeRes.status === 403 || treeRes.status === 429) {
    throw Object.assign(new Error("GitHub API rate limit exceeded. Add a GITHUB_TOKEN to increase the limit."), { status: 403 });
  }
  if (!treeRes.ok) {
    throw new Error(`GitHub API error: ${treeRes.status}`);
  }

  const treeBody = (await treeRes.json()) as { tree?: Array<{ type: string; path?: string; size?: number }> };

  const paths = (treeBody.tree ?? [])
    .filter((item) => item.type === "blob" && item.path && !shouldSkip(item.path) && (item.size ?? 0) < 100_000)
    .sort((a, b) => filePriority(b.path!) - filePriority(a.path!))
    .slice(0, 5)
    .map((item) => item.path!);

  const results = await Promise.allSettled(
    paths.map(async (path) => {
      const res = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`,
        { headers: { "User-Agent": "VibeForge" } }
      );
      if (!res.ok) return null;
      return { path, content: await res.text() } satisfies RepoFile;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<RepoFile> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);
}

export function buildFilesPrompt(files: RepoFile[]): string {
  return files
    .map((f) => `FILE: ${f.path}\n\`\`\`\n${f.content.slice(0, 2000)}\n\`\`\``)
    .join("\n\n");
}

