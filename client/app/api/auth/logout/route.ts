import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      // Hash the token using Web Crypto API to ensure compatibility
      const encoder = new TextEncoder();
      const data = encoder.encode(session.access_token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Save to BlacklistedToken with 7 days expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.blacklistedToken.create({
        data: {
          tokenHash,
          expiresAt
        }
      });

      // Clear CLI tokens for this user
      if (session.user?.id) {
        // Need to get user from Prisma to delete CLI tokens
        const user = await prisma.user.findUnique({
          where: { supabaseId: session.user.id }
        });

        if (user) {
          await prisma.cliToken.deleteMany({
            where: { userId: user.id }
          });
        }
      }
    }

    // Sign out (this also clears the cookies due to server client setAll)
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout', details: error.message }, { status: 500 });
  }
}
