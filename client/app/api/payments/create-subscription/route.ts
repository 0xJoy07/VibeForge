import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";

/**
 * POST /api/payments/create-subscription
 *
 * Creates a Razorpay ORDER (one-time payment) instead of a subscription.
 * This avoids the e-mandate requirement which needs business verification.
 * After successful payment + verification, the user gets Pro status.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const res = await fetch(`${SERVER_URL}/api/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error("CREATE ORDER ERROR:", e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
