import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:4000";

/**
 * POST /api/payments/verify
 * Proxies verification to the Express server which handles signature
 * verification and activates the Pro subscription.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${SERVER_URL}/api/payments/verify-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
