import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "../db.js";
import { razorpay } from "./razorpay.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateSubscriptionResult {
  subscriptionId: string;
  keyId: string;
  status: string;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  status: string;
  currentPeriodEnd: Date | null;
  razorpaySubId: string;
}

export interface WebhookEvent {
  event: string;
  payload: {
    subscription?: {
      entity?: {
        id?: string;
        status?: string;
        current_end?: number;
      };
    };
  };
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * createSubscription
 * Gets or creates a Razorpay customer for the user, then creates a subscription.
 * Upserts the Prisma Subscription row and returns checkout identifiers.
 */
export async function createSubscription(
  dbId: string,
  email: string,
  name: string | null
): Promise<CreateSubscriptionResult> {
  const planId = process.env.RAZORPAY_PLAN_ID_PRO;
  if (!planId) throw new Error("RAZORPAY_PLAN_ID_PRO is not configured.");

  // Guard: existing active subscription
  const existing = await prisma.subscription.findUnique({ where: { userId: dbId } });
  if (existing?.status === "active") {
    throw Object.assign(new Error("User already has an active subscription."), { status: 400 });
  }

  // Get or create Razorpay customer
  let customerId = existing?.razorpayCustomerId ?? null;
  if (!customerId) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customer = await razorpay.customers.create({
        name: name ?? email,
        email,
        fail_existing: 0,
      }) as any;
      customerId = customer.id as string;
    } catch (err: any) {
      // If customer already exists, fetch them by email
      if (err?.statusCode === 400) {
        const customers = await razorpay.customers.all({ count: 100 }) as any;
        const found = customers.items?.find((c: any) => c.email === email);
        if (found) {
          customerId = found.id as string;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  // Create Razorpay subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 12,
    quantity: 1,
    customer_notify: 1,
    addons: [],
    notes: { userId: dbId, email: email },
  } as Parameters<typeof razorpay.subscriptions.create>[0]) as any;

  // Persist to DB
  await prisma.subscription.upsert({
    where: { userId: dbId },
    create: {
      userId: dbId,
      razorpaySubId: sub.id,
      razorpayCustomerId: customerId,
      planId,
      status: "created",
    },
    update: {
      razorpaySubId: sub.id,
      razorpayCustomerId: customerId,
      status: "created",
    },
  });

  return {
    subscriptionId: sub.id,
    keyId: process.env.RAZORPAY_KEY_ID!,
    status: sub.status as string,
  };
}

/**
 * getSubscriptionStatus
 * Polls Razorpay for the live subscription status and syncs it to Prisma.
 */
export async function getSubscriptionStatus(dbId: string): Promise<SubscriptionStatus | null> {
  const sub = await prisma.subscription.findUnique({ where: { userId: dbId } });
  if (!sub) return null;

  // If the subscription ID is a test placeholder, return DB status directly
  if (sub.razorpaySubId.startsWith("sub_test_")) {
    return {
      subscribed: sub.status === "active",
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      razorpaySubId: sub.razorpaySubId,
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const razorSub = await razorpay.subscriptions.fetch(sub.razorpaySubId) as any;
    const status = (razorSub.status ?? "unknown") as string;
    const currentPeriodEnd = razorSub.current_end
      ? new Date((razorSub.current_end as number) * 1000)
      : null;

    await prisma.subscription.update({
      where: { userId: dbId },
      data: {
        status,
        ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      },
    });

    return {
      subscribed: status === "active",
      status,
      currentPeriodEnd,
      razorpaySubId: sub.razorpaySubId,
    };
  } catch {
    // If Razorpay fetch fails (invalid ID, network error, etc.), return DB status
    return {
      subscribed: sub.status === "active",
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      razorpaySubId: sub.razorpaySubId,
    };
  }
}

/**
 * cancelSubscription
 * Cancels at the end of the billing cycle (not immediately).
 */
export async function cancelSubscription(dbId: string): Promise<void> {
  const sub = await prisma.subscription.findUnique({ where: { userId: dbId } });
  if (!sub) throw Object.assign(new Error("No subscription found."), { status: 404 });

  // cancel_at_cycle_end = true means cancel at period end, not immediately
  await razorpay.subscriptions.cancel(sub.razorpaySubId, true);

  await prisma.subscription.update({
    where: { userId: dbId },
    data: { status: "cancelled" },
  });
}

/**
 * handleWebhook
 * Verifies Razorpay HMAC signature and updates the Subscription row in Prisma.
 * Returns true on success, throws on bad signature.
 */
export async function handleWebhook(
  rawBody: string,
  signature: string
): Promise<void> {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");

  // Constant-time HMAC comparison
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw Object.assign(new Error("Invalid webhook signature."), { status: 400 });
  }

  const event: WebhookEvent = JSON.parse(rawBody);
  const entity = event.payload?.subscription?.entity;
  if (!entity?.id) return; // unknown shape — ack and ignore

  const status = entity.status ?? "unknown";
  const currentPeriodEnd = entity.current_end
    ? new Date(entity.current_end * 1000)
    : undefined;

  await prisma.subscription.updateMany({
    where: { razorpaySubId: entity.id },
    data: {
      status,
      ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
    },
  });

  console.log(`[webhook] ${event.event} → subscription ${entity.id} → ${status}`);
}
