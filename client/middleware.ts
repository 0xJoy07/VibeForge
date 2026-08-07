import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/scanner",
  "/editor",
  "/dashboard",
  "/billing",
  "/cli-auth",
];

// Routes that are always public (no auth check needed)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/pricing",
  "/download",
  "/api/payments/webhook",
  "/api/scan-repo",
  "/api/review-code",
  "/auth/callback",
];

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh the Supabase session on every request
  const { supabaseResponse, user } = await updateSession(request);

  // Redirect unauthenticated users away from protected routes
  if (isProtected(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
