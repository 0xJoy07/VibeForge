import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user },
    data: { session }
  } = await supabase.auth.getUser();

  // If a session exists, check if its token is blacklisted
  let isBlacklisted = false;
  if (session?.access_token) {
    // Hash the token using Web Crypto API (Edge compatible)
    const encoder = new TextEncoder();
    const data = encoder.encode(session.access_token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    try {
      const origin = request.nextUrl.origin;
      const res = await fetch(`${origin}/api/auth/check-token?hash=${tokenHash}`);
      if (res.ok) {
        const json = await res.json();
        isBlacklisted = json.blacklisted;
      }
      
      // Update last seen asynchronously (don't await to block the request)
      if (!isBlacklisted) {
        fetch(`${origin}/api/auth/update-seen`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash: tokenHash })
        }).catch(e => console.error('Failed to update last seen:', e));
      }
    } catch (e) {
      console.error('Error checking blacklisted token:', e);
    }
  }

  const protectedPaths = ['/scanner', '/editor', '/dashboard', '/billing', '/cli-auth'];
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));

  if (isProtected && (!user || isBlacklisted)) {
    // If blacklisted, we should also clear the auth cookies
    if (isBlacklisted) {
      supabaseResponse = NextResponse.redirect(new URL('/login', request.url));
      const allCookies = request.cookies.getAll();
      allCookies.forEach(cookie => {
        if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
          supabaseResponse.cookies.set(cookie.name, '', { maxAge: 0 });
        }
      });
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}
