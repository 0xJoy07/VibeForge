import { NextResponse } from 'next/server';
import { updateLastSeen } from '@/lib/device';

export async function POST(request: Request) {
  try {
    const { hash } = await request.json();
    if (hash) {
      await updateLastSeen(hash);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update last seen' }, { status: 500 });
  }
}
