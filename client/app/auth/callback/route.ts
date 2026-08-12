import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        }
      }
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token ?? ""}`
      },
      body: JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
        avatar: data.user.user_metadata?.avatar_url,
        deviceInfo: request.headers.get("user-agent") ?? "Unknown Device"
      })
    });
    if (!res.ok) {
      console.error("Failed to sync user to backend", await res.text());
    }
  } catch (e) {
    console.error('syncUserToPrisma or session registration failed:', e);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
