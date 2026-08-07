import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";

/**
 * POST /api/payments/create-subscription
 * Proxies to the Express server which owns all Razorpay logic (server/src/payments/).
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const res = await fetch(`${SERVER_URL}/api/payments/create-subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
