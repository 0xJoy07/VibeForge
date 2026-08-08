import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ blacklisted: false });
  }

  try {
    const token = await prisma.blacklistedToken.findUnique({
      where: { tokenHash: hash },
      select: { id: true }
    });
    
    return NextResponse.json({ blacklisted: !!token });
  } catch (error) {
    console.error('Check token error:', error);
    return NextResponse.json({ blacklisted: false });
  }
}
