import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { prisma } from "../db.js";
import { createHash } from "crypto";
import { trackSessionImpl } from "./trackSession.js";

export interface AuthUser {
  supabaseId: string;
  email: string;
  dbId: string | null; // null if user hasn't synced yet
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * requireAuth — hard gate. Returns 401 if no valid JWT.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  console.log("[auth] path:", req.path, "| authorization:", req.headers.authorization?.slice(0, 30) ?? "(none)");
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: "Missing Authorization header." });
    return;
  }

  const result = await verifyToken(token);
  if (!result.user) {
    res.status(401).json({ error: result.error || "Invalid or expired token." });
    return;
  }

  req.user = result.user;

  // Track session asynchronously to avoid blocking the request
  trackSessionImpl(req).catch(console.error);

  next();
}

/**
 * optionalAuth — soft gate. Attaches req.user if a valid JWT is present, otherwise continues as anon.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractBearer(req);
  if (token) {
    const result = await verifyToken(token);
    if (result.user) req.user = result.user;
  }
  next();
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

/**
 * requirePro — gating for premium features.
 * Validates that the user has an active Pro subscription in Prisma.
 */
export async function requirePro(req: Request, res: Response, next: NextFunction): Promise<void> {
  const dbId = req.user?.dbId;
  if (!dbId) {
    res.status(403).json({ error: "Pro subscription required. User not synced." });
    return;
  }

  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: dbId },
      select: { status: true },
    });
    if (sub?.status !== "active") {
      res.status(403).json({ error: "Pro subscription required." });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function verifyToken(token: string): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    if (token.startsWith("vbf_")) {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const cliToken = await prisma.cliToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });
      if (!cliToken) return { user: null, error: "Invalid CLI token." };
      if (cliToken.expiresAt < new Date()) return { user: null, error: "CLI token expired." };

      // Fire and forget updating lastUsedAt
      prisma.cliToken.update({ where: { id: cliToken.id }, data: { lastUsedAt: new Date() } }).catch(console.error);

      return {
        user: {
          supabaseId: cliToken.user.supabaseId,
          email: cliToken.user.email,
          dbId: cliToken.user.id,
        },
      };
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      console.error("[auth] verifyToken Supabase error:", error.message);
      return { user: null, error: `Supabase Auth Error: ${error.message}` };
    }
    if (!data.user) {
      return { user: null, error: "No user found for token." };
    }

    const supabaseUser = data.user;

    // Try to find the matching DB user (may not exist if sync hasn't happened yet)
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });

    return {
      user: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email ?? "",
        dbId: dbUser?.id ?? null,
      }
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[auth] verifyToken error:", msg);
    return { user: null, error: `Server exception: ${msg}` };
  }
}
