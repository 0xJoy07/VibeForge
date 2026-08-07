import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";

/**
 * POST /api/payments/cancel
 * Proxies to the Express server which cancels the Razorpay subscription.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const res = await fetch(`${SERVER_URL}/api/payments/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
