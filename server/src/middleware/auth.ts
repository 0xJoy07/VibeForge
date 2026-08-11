import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { prisma } from "../db.js";

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
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: "Missing Authorization header." });
    return;
  }

  const user = await verifyToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid or expired token." });
    return;
  }

  req.user = user;
  next();
}

/**
 * optionalAuth — soft gate. Attaches req.user if a valid JWT is present, otherwise continues as anon.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractBearer(req);
  if (token) {
    const user = await verifyToken(token);
    if (user) req.user = user;
  }
  next();
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return null;

    const supabaseUser = data.user;

    // Try to find the matching DB user (may not exist if sync hasn't happened yet)
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });

    return {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email ?? "",
      dbId: dbUser?.id ?? null,
    };
  } catch {
    return null;
  }
}
