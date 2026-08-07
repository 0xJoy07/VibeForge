import { createHash, randomBytes } from "crypto";
import { prisma } from "./prisma";
import { isPro } from "./auth";
import type { User as PrismaUser } from "@prisma/client";

export async function generateCliToken(userId: string): Promise<string> {
  const plainToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(plainToken).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.cliToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return plainToken;
}

export async function validateCliToken(plainToken: string): Promise<{ user: PrismaUser } | null> {
  const tokenHash = createHash("sha256").update(plainToken).digest("hex");

  const cliToken = await prisma.cliToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!cliToken) return null;
  if (cliToken.expiresAt < new Date()) return null;

  const pro = await isPro(cliToken.userId);
  if (!pro) return null;

  await prisma.cliToken.update({
    where: { id: cliToken.id },
    data: { lastUsedAt: new Date() },
  });

  return { user: cliToken.user };
}

export async function revokeCliToken(userId: string): Promise<void> {
  await prisma.cliToken.deleteMany({
    where: { userId },
  });
}
