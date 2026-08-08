import { UAParser } from "ua-parser-js";
import { prisma } from "./prisma";

export function getDeviceInfo(request: Request): string {
  const userAgent = request.headers.get("user-agent") || "";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  const browser = result.browser.name || "Unknown Browser";
  const os = result.os.name || "Unknown OS";
  
  return `${browser} on ${os}`;
}

export async function registerSession(userId: string, sessionToken: string, deviceInfo: string) {
  // Enforce single active session by deleting all existing sessions for this user
  await prisma.activeSession.deleteMany({
    where: { userId }
  });

  const session = await prisma.activeSession.create({
    data: {
      userId,
      sessionToken,
      deviceInfo
    }
  });

  return session;
}

export async function updateLastSeen(sessionToken: string) {
  await prisma.activeSession.update({
    where: { sessionToken },
    data: { lastSeenAt: new Date() }
  }).catch(() => {
    // Ignore if session doesn't exist
  });
}

export async function getActiveSession(userId: string) {
  return await prisma.activeSession.findFirst({
    where: { userId }
  });
}
