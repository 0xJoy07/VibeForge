# @0xjoy/vibeforge

CLI for [VibeForge](https://vibeforgescanner.vercel.app) - scans local codebases for security issues, AI slop, code smells, and performance problems. Outputs a scored, graded report directly in your terminal.

[![npm version](https://img.shields.io/npm/v/@0xjoy/vibeforge?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@0xjoy/vibeforge)
[![License: MIT](https://img.shields.io/badge/license-MIT-06b6d4?style=flat-square)](../../LICENSE)

---

## Requirements

- Node.js 18+
- A VibeForge account (free or Pro) at [vibeforgescanner.vercel.app](https://vibeforgescanner.vercel.app)
- Pro plan for CLI access

---

## Install

No global install needed:

```bash
npx @0xjoy/vibeforge <command>
```

Or install globally:

```bash
npm install -g @0xjoy/vibeforge
```

---

## Quick Start

```bash
# 1. Authenticate (opens browser, one-time)
npx @0xjoy/vibeforge login

# 2. Scan the current directory
npx @0xjoy/vibeforge scan .

# 3. Scan a specific folder
npx @0xjoy/vibeforge scan ./src
```

---

## Commands

### `login`

Opens your browser to authenticate with your VibeForge account. Saves a token locally for subsequent scans. The auth flow completes in under 30 seconds and the browser tab closes itself.

```bash
npx @0xjoy/vibeforge login
```

---

### `scan [path]`

Scans a local directory. Defaults to `.` if no path is given. Picks up `.ts`, `.js`, `.py`, `.go`, and `.java` files. Skips `node_modules`, `dist`, `.next`, `build`, lock files, and binary assets automatically. Sends up to 30 files per scan to the analysis engine.

```bash
npx @0xjoy/vibeforge scan [path] [options]
```

**Options:**

| Flag | Values | What it does |
|------|--------|-------------|
| `--report <format>` | `html`, `json` | Writes `report.html` or `report.json` to the scanned directory |
| `--fix` | - | Applies AI-suggested fixes directly to your source files |

**Examples:**

```bash
# Scan src/, print results to terminal
npx @0xjoy/vibeforge scan ./src

# Scan and export an HTML report
npx @0xjoy/vibeforge scan ./src --report html

# Scan and export a machine-readable JSON report
npx @0xjoy/vibeforge scan ./src --report json

# Scan and auto-apply fixes
npx @0xjoy/vibeforge scan ./src --fix

# Combine: report + fix in one pass
npx @0xjoy/vibeforge scan ./src --report html --fix
```

---

### `whoami`

Checks your current auth status and Pro subscription state.

```bash
npx @0xjoy/vibeforge whoami
```

Output example:

```
Logged in as you@example.com
Pro status: Active
```

---

### `logout`

Clears the stored auth token from your machine.

```bash
npx @0xjoy/vibeforge logout
```

---

## Terminal Output

A typical scan looks like this:

```
$ npx @0xjoy/vibeforge scan ./src

  Scanning 24 files...
  ✔ Scan complete!

VIBEFORGE SCAN RESULTS
======================

Grade: B  (Score: 74/100)

security       ████████████░░░░░░░░ 61
ai_slop        ████████████████░░░░ 78
code_quality   ████████████████░░░░ 82
performance    ██████████████░░░░░░ 70
structure      ████████████████████ 88

Found 6 issues.

CRIT Hardcoded API key (lib/config.ts:42)
  API key found in plain source. Move to environment variables.

WARN Possible N+1 query (services/users.ts:88)
  Loop calls DB inside iteration. Batch with a single query.
```

---

## Scoring

Scans are graded across five axes. The final grade maps to the composite score:

| Axis | What it checks |
|------|---------------|
| Security | Hardcoded secrets, injection vectors, insecure deps, exposed env vars |
| AI Slop | Copy-paste GPT patterns, dead logic branches, hallucinated variable names |
| Code Quality | Complexity, duplication, naming, error handling consistency |
| Performance | N+1 queries, blocking I/O, unoptimized loops |
| Structure | File organization, circular deps, module coupling |

| Grade | Score range |
|-------|------------|
| A | 90 - 100 |
| B | 75 - 89 |
| C | 60 - 74 |
| D | 45 - 59 |
| F | below 45 |

---

## Reports

### HTML (`--report html`)

Writes `report.html` to the scanned directory. Opens cleanly in any browser - dark-themed, shows score rings, axis bars, and per-issue fix blocks with syntax highlighting.

### JSON (`--report json`)

Writes `report.json` to the scanned directory. Useful for CI pipelines and custom tooling.

```jsonc
{
  "grade": "B",
  "score": 74,
  "scores": {
    "security": 61,
    "ai_slop": 78,
    "code_quality": 82,
    "performance": 70,
    "structure": 88
  },
  "issues": [
    {
      "severity": "critical",
      "title": "Hardcoded API key",
      "file": "lib/config.ts",
      "line": 42,
      "description": "...",
      "fix": "..."
    }
  ]
}
```

---

## Environment Variables

Override the default API and web URLs if you are self-hosting:

```bash
VIBEFORGE_API_URL=https://your-api.example.com
VIBEFORGE_WEB_URL=https://your-web.example.com
```

---

## Token Storage

The auth token is stored locally on your machine after `vibeforge login`. Run `vibeforge logout` to remove it, or `vibeforge whoami` to check it.

---

## Supported File Types

`.ts` · `.js` · `.py` · `.go` · `.java`

Automatically skipped: `node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, lock files, minified files, and all binary/media assets.

---

## License

MIT
