import "dotenv/config";
import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/errorHandler.js";

import healthRouter from "./routes/health.js";
import scanRouter from "./routes/scan.js";
import reviewRouter from "./routes/review.js";
import authRouter from "./routes/auth.js";
import dashboardRouter from "./routes/dashboard.js";
import cliRouter from "./routes/cli.js";
import { paymentsRouter } from "./payments/index.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

// ── Global Middleware ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.CLIENT_URL ?? "http://localhost:3000",
    ].filter(Boolean),
    credentials: true,
  })
);

// Raw body for Razorpay webhook HMAC verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// JSON body for everything else
app.use(express.json({ limit: "1mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(healthRouter);
app.use(scanRouter);
app.use(reviewRouter);
app.use(authRouter);
app.use(dashboardRouter);
app.use(cliRouter);
app.use(paymentsRouter);

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n  ✅  VibeForge server running on http://localhost:${port}`);
  console.log(`  📊  Health: http://localhost:${port}/health\n`);
});
