import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_REPORTS } from "@/config/access";
import { decodeSession } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const report = PROTECTED_REPORTS.find(
    (r) => pathname.startsWith(`/${r}/`) || pathname === `/${r}`,
  );

  const isHomepage = pathname === "/";

  if (!report && !isHomepage) return NextResponse.next();

  const sessionCookie = request.cookies.get("pin-session");
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    if (!isHomepage) url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isHomepage) return NextResponse.next();

  if (report && !session.reports.includes(report)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|auth).*)"],
};
