import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createSubscription,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook,
} from "./service.js";

const router = Router();

/**
 * POST /api/payments/create-subscription
 * Creates a Razorpay subscription for the logged-in user.
 */
router.post("/api/payments/create-subscription", requireAuth, async (req, res, next) => {
  try {
    const { dbId, email } = req.user!;
    if (!dbId) {
      res.status(404).json({ error: "User not synced. Call /api/auth/sync-user first." });
      return;
    }

    // Fetch name from DB for better customer record
    const { prisma } = await import("../db.js");
    const dbUser = await prisma.user.findUnique({ where: { id: dbId }, select: { name: true } });

    const result = await createSubscription(dbId, email, dbUser?.name ?? null);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments/status
 * Returns live subscription status by polling Razorpay.
 */
router.get("/api/payments/status", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;
    if (!dbId) {
      res.json({ subscribed: false });
      return;
    }

    const status = await getSubscriptionStatus(dbId);
    if (!status) {
      res.json({ subscribed: false });
      return;
    }

    res.json(status);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/cancel
 * Cancels subscription at end of billing cycle.
 */
router.post("/api/payments/cancel", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;
    if (!dbId) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    await cancelSubscription(dbId);
    res.json({ success: true, message: "Subscription will cancel at end of billing period." });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook — raw body required for HMAC verification.
 * The express.raw() middleware is applied in index.ts before this route.
 */
router.post("/api/payments/webhook", async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    if (!signature) {
      res.status(400).json({ error: "Missing x-razorpay-signature header." });
      return;
    }

    // req.body is a Buffer from express.raw()
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf-8")
      : JSON.stringify(req.body);

    await handleWebhook(rawBody, signature);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/create-order
 * Creates a Razorpay ORDER for a one-time Pro payment (avoids e-mandate).
 */
router.post("/api/payments/create-order", requireAuth, async (req, res, next) => {
  try {
    const { dbId, email } = req.user!;
    if (!dbId) {
      res.status(404).json({ error: "User not synced." });
      return;
    }

    const { prisma } = await import("../db.js");

    // Check if already Pro
    const existing = await prisma.subscription.findUnique({ where: { userId: dbId } });
    if (existing?.status === "active") {
      res.status(400).json({ error: "Already subscribed." });
      return;
    }

    const { razorpay } = await import("./razorpay.js");

    // Create a Razorpay order for ₹499 (amount in paise)
    const order = await razorpay.orders.create({
      amount: 49900,
      currency: "INR",
      receipt: `pro_${Date.now()}`,
      notes: { userId: dbId, email, plan: "pro" },
    }) as any;

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/verify-order
 * Verifies Razorpay payment signature and activates Pro subscription.
 */
router.post("/api/payments/verify-order", requireAuth, async (req, res, next) => {
  try {
    const { dbId } = req.user!;
    if (!dbId) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing payment details." });
      return;
    }

    // Verify signature
    const { createHmac } = await import("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = createHmac("sha256", secret).update(body).digest("hex");

    if (expected !== razorpay_signature) {
      res.status(400).json({ error: "Invalid payment signature." });
      return;
    }

    // Activate subscription in DB
    const { prisma } = await import("../db.js");
    await prisma.subscription.upsert({
      where: { userId: dbId },
      create: {
        userId: dbId,
        razorpaySubId: razorpay_payment_id,
        razorpayCustomerId: null,
        planId: "pro_monthly",
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        razorpaySubId: razorpay_payment_id,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
