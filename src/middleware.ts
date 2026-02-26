import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Client slugs that require PIN authentication
const PROTECTED_CLIENTS: string[] = [];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path matches a protected client
  const client = PROTECTED_CLIENTS.find(
    (c) => pathname.startsWith(`/${c}/`) || pathname === `/${c}`,
  );

  if (!client) return NextResponse.next();

  // Skip auth page and API routes
  if (pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for valid auth cookie
  const authCookie = request.cookies.get(`pin-${client}`);
  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  // Redirect to PIN entry page
  const url = request.nextUrl.clone();
  url.pathname = `/auth/${client}`;
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match all client pages, but not static files, api, auth, _next
    "/((?!_next/static|_next/image|favicon.ico|api|auth).*)",
  ],
};
