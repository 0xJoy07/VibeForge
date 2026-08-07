import { NextResponse } from "next/server";
import { validateCliToken } from "@/lib/cli-token";

/**
 * GET /api/cli/validate
 * Called by the CLI on every command to validate the stored token.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Invalid or missing Authorization header. Run 'vibeforge login'." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 401 });
    }

    const validation = await validateCliToken(token);
    if (!validation) {
      return NextResponse.json(
        { error: "Invalid or expired token. Run 'vibeforge login'." },
        { status: 401 }
      );
    }

    const { user } = validation;

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: user.name,
      isPro: true, // validateCliToken already enforces this
    });
  } catch (err) {
    console.error("[cli/validate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
