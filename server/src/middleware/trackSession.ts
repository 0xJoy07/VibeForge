import { Request } from "express";
import { UAParser } from "ua-parser-js";
import { prisma } from "../db.js";

/**
 * Parses user agent and IP, then upserts a DeviceSession for the authenticated user.
 * Expected to run AFTER requireAuth has set req.user.
 */
export async function trackSessionImpl(req: Request) {
  if (!req.user || !req.user.dbId) {
    return;
  }
  console.log('trackSession fired for user:', req.user.dbId);
  
  try {
    const userAgent = req.headers["user-agent"] || "";
    const parser = new UAParser(userAgent);
    
    // UAParser may return undefined if it can't parse
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";
    const deviceName = `${os} - ${browser}`;
    
    // Determine if CLI or Browser based on token
    const authHeader = req.headers.authorization || "";
    const isCli = authHeader.includes("Bearer vbf_");
    const type = isCli ? "cli" : "browser";
    
    // IP extraction
    const forwardedFor = req.headers["x-forwarded-for"] as string;
    const ip = forwardedFor?.split(',')[0].trim() ?? req.ip ?? 'unknown';

    // Upsert logic. Find existing session for this exact device configuration
    const existing = await prisma.deviceSession.findFirst({
      where: { 
        userId: req.user.dbId, 
        ip, 
        browser, 
        type 
      }
    });

    if (existing) {
      await prisma.deviceSession.update({
        where: { id: existing.id },
        data: { 
          lastActive: new Date(), 
          os, 
          deviceName 
        }
      });
    } else {
      await prisma.deviceSession.create({
        data: {
          userId: req.user.dbId,
          ip,
          browser,
          os,
          deviceName,
          type,
          lastActive: new Date()
        }
      });
    }
  } catch (err) {
    console.error("[trackSession] error:", err);
  }
}
