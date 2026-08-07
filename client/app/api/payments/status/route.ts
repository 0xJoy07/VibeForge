import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";

/**
 * GET /api/payments/status
 * Proxies to the Express server which polls Razorpay and syncs Prisma.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ subscribed: false });
  }

  const res = await fetch(`${SERVER_URL}/api/payments/status`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
