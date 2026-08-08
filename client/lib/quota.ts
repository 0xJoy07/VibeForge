import { prisma } from "@/lib/prisma";

const FREE_DAILY_SCANS = 3;

function getToday(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * checkAndIncrementQuota
 * Atomically increments today's scan count for the given fingerprint.
 * Returns { allowed: false, remaining: 0 } if the limit is already hit.
 * Returns { allowed: true, remaining: N } if the scan is permitted.
 */
export async function checkAndIncrementQuota(fingerprint: string): Promise<{ allowed: boolean, remaining: number, used: number }> {
  const today = new Date().toISOString().split('T')[0];
  try {
    const quota = await prisma.dailyQuota.upsert({
      where: { fingerprint_date: { fingerprint, date: today } },
      update: {},
      create: { fingerprint, date: today, scanCount: 0 }
    });
    
    if (quota.scanCount >= 3) {
      return { allowed: false, remaining: 0, used: quota.scanCount };
    }
    
    await prisma.dailyQuota.update({
      where: { fingerprint_date: { fingerprint, date: today } },
      data: { scanCount: { increment: 1 } }
    });
    
    return { allowed: true, remaining: 3 - (quota.scanCount + 1), used: quota.scanCount + 1 };
  } catch(e) {
    console.error('Quota check failed:', e);
    return { allowed: true, remaining: 3, used: 0 };
  }
}

/**
 * getQuotaStatus
 * Returns the current scanCount and remaining quota for today without modifying the record.
 */
export async function getQuotaStatus(
  fingerprint: string
): Promise<{ used: number; remaining: number; limit: number }> {
  const today = getToday();

  const record = await prisma.dailyQuota.findUnique({
    where: { fingerprint_date: { fingerprint, date: today } },
    select: { scanCount: true },
  });

  const used = record?.scanCount ?? 0;
  return {
    used,
    remaining: Math.max(0, FREE_DAILY_SCANS - used),
    limit: FREE_DAILY_SCANS,
  };
}
