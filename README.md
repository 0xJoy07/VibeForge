<div align="center">

<picture>
  <img width="200" height="200" alt="Vibe-Forge" align="center" src="https://github.com/user-attachments/assets/f696b002-222f-4641-b15b-08c464aafdb1" />
</picture>

### Your codebase has opinions. VibeForge reads them.

[![npm version](https://img.shields.io/npm/v/@0xjoy/vibeforge?style=flat-square&color=7c3aed)](https://www.npmjs.com/package/@0xjoy/vibeforge)
[![GitHub Stars](https://img.shields.io/github/stars/0xJoy07/VibeForge?style=flat-square&color=f59e0b)](https://github.com/0xJoy07/VibeForge)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000?style=flat-square&logo=vercel)](https://vibeforgescanner.vercel.app)

</div>

---

## What it does

- Scans a codebase for security vulnerabilities, AI-generated slop, code smells, and performance issues - locally via CLI or in-browser via Monaco editor
- Grades output across five axes (A-F) and produces a single composite score you can drop into CI
- Generates HTML or JSON reports with `--report`, and optionally auto-fixes flagged patterns with `--fix`
- Accepts a GitHub URL or raw code paste in the web UI and annotates it with inline decorations and fix suggestions

---

## Demo
<img width="1898" height="936" alt="Recording 2026-08-12 170913 - Trim" src="https://github.com/user-attachments/assets/a2a8ae34-dc1b-4d1f-a102-5fc479623f59" />

---

## Quick Start

```bash
# No install required
npx vibeforge scan ./src

# With a full HTML report
npx vibeforge scan ./src --report html

# Auto-fix what can be fixed
npx vibeforge scan ./src --fix
```

---

## Scoring Breakdown

| Axis | What it checks | Weight |
|------|---------------|--------|
| Security | Hardcoded secrets, injection vectors, insecure deps, exposed env vars | 30% |
| AI Slop | Copy-paste GPT patterns, dead logic branches, hallucinated variable names | 25% |
| Code Quality | Complexity, duplication, naming, error handling consistency | 20% |
| Performance | N+1 queries, blocking I/O, unoptimized loops, large bundle contributors | 15% |
| Structure | File organization, circular deps, module coupling, naming conventions | 10% |

Grades: **A** (90-100) · **B** (75-89) · **C** (60-74) · **D** (45-59) · **F** (<45)

---

## Pricing

| | Free | Pro |
|---|---|---|
| Web scans | 3 / day | Unlimited |
| CLI access (`npx vibeforge`) | - | Included |
| HTML / JSON reports | - | Included |
| `--fix` flag | - | Included |
| Auth | Google / GitHub via Supabase | Google / GitHub via Supabase |
| Price | Free | ₹499 / month |

---

## Tech Stack

<div align="left">

[![Next.js](https://img.shields.io/badge/Next.js%2014-000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-000?style=flat-square&logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06b6d4?style=flat-square&logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000?style=flat-square&logo=shadcnui)](https://ui.shadcn.com)
[![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-0078d4?style=flat-square&logo=visualstudiocode&logoColor=fff)](https://microsoft.github.io/monaco-editor)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=flat-square&logo=supabase&logoColor=000)](https://supabase.com)
[![Claude API](https://img.shields.io/badge/Claude%20API-d97706?style=flat-square&logo=anthropic&logoColor=fff)](https://www.anthropic.com)
[![Recharts](https://img.shields.io/badge/Recharts-22c55e?style=flat-square)](https://recharts.org)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042b?style=flat-square&logo=razorpay&logoColor=3395ff)](https://razorpay.com)
[![Vercel](https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)
[![npm](https://img.shields.io/badge/npm-cb3837?style=flat-square&logo=npm&logoColor=fff)](https://www.npmjs.com/package/vibeforge)

</div>

---

## Project Structure

```
NeuroNexus/
├── client/                  # Next.js 14 App Router (web UI)
│   ├── app/
│   │   ├── dashboard/       # Authenticated user dashboard
│   │   ├── editor/          # Monaco editor + inline review
│   │   ├── scanner/         # GitHub URL scanner
│   │   ├── billing/         # Plan management + Razorpay
│   │   └── login/           # Supabase OAuth flow
│   ├── components/          # Shared UI components
│   └── lib/                 # Auth helpers, Supabase clients
│
├── packages/
│   └── cli/                 # npx vibeforge CLI (Node.js)
│       └── src/
│           └── index.ts     # Entry point
│
└── apps/                    # Additional services (expand as needed)
```

---

## Contributing

Issues and PRs are welcome.
Please run `npx vibeforge scan ./src` on your changes before submitting.

