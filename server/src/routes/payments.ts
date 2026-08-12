import { Router } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db.js";

const router = Router();

function getRazorpay(): Razorpay {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * POST /api/payments/create-subscription
 * Creates a Razorpay subscription for the authenticated user's Pro plan.
 */
router.post("/api/payments/create-subscription", requireAuth, async (req, res, next) => {
  try {
    const { dbId, email } = req.user!;
    if (!dbId) {
      res.status(404).json({ error: "User not synced. Call /api/auth/sync-user first." });
      return;
    }

    const planId = process.env.RAZORPAY_PLAN_ID_PRO;
    if (!planId) {
      res.status(500).json({ error: "RAZORPAY_PLAN_ID_PRO not configured." });
      return;
    }

    // Check for an existing active subscription
    const existing = await prisma.subscription.findUnique({ where: { userId: dbId } });
    if (existing?.status === "active") {
      res.status(400).json({ error: "User already has an active subscription." });
      return;
    }

    const razorpay = getRazorpay();

    // Create or reuse a Razorpay customer
    let customerId = existing?.razorpayCustomerId ?? null;
    if (!customerId) {
      const customer = await razorpay.customers.create({ email, name: email });
      customerId = customer.id;
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 billing cycles (1 year)
      notes: { userId: dbId },
    });

    // Upsert subscription record
    await prisma.subscription.upsert({
      where: { userId: dbId },
      create: {
        userId: dbId,
        razorpaySubId: subscription.id,
        razorpayCustomerId: customerId,
        planId,
        status: "created",
      },
      update: {
        razorpaySubId: subscription.id,
        razorpayCustomerId: customerId,
        status: "created",
      },
    });

    res.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      status: subscription.status,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook — verifies HMAC signature and updates subscription status.
 */
router.post(
  "/api/payments/webhook",
  // Use raw body for HMAC verification — Express raw body is set by the body parser below
  async (req, res, next) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!secret) {
        console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not set");
        res.status(500).json({ error: "Webhook secret not configured." });
        return;
      }

      const signature = req.headers["x-razorpay-signature"] as string | undefined;
      if (!signature) {
        res.status(400).json({ error: "Missing x-razorpay-signature header." });
        return;
      }

      // Verify HMAC
      const rawBody = JSON.stringify(req.body);
      const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
      const sigBuffer = Buffer.from(signature, "hex");
      const expBuffer = Buffer.from(expected, "hex");
      if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
        res.status(400).json({ error: "Invalid webhook signature." });
        return;
      }

      const event = req.body as {
        event: string;
        payload: {
          subscription?: { entity?: { id?: string; status?: string; current_end?: number } };
        };
      };

      const sub = event.payload?.subscription?.entity;
      if (!sub?.id) {
        res.json({ ok: true }); // unknown event shape, ack
        return;
      }

      const status = sub.status ?? "unknown";
      const currentPeriodEnd = sub.current_end
        ? new Date(sub.current_end * 1000)
        : undefined;

      await prisma.subscription.updateMany({
        where: { razorpaySubId: sub.id },
        data: {
          status,
          ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
        },
      });

      console.log(`[webhook] ${event.event} → subscription ${sub.id} now ${status}`);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
