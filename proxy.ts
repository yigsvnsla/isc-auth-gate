import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
];

function hasSessionCookie(request: NextRequest): boolean {
  const all = request.cookies.getAll();
  return all.some((c) =>
    SESSION_COOKIE_NAMES.some(
      (name) => c.name === name || c.name.startsWith(`${name}.`),
    ),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = hasSessionCookie(request);

  const requiresSession = pathname === "/" || pathname.startsWith("/dashboard");
  if (requiresSession && !hasSession) {
    const url = new URL("/auth/sign-in", request.url);
    if (pathname !== "/") url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|css|js|ico)$).*)",
  ],
};