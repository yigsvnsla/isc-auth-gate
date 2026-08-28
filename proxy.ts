import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPublicDashboardRoute } from "@/lib/dashboard-routes";

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

  // rutas públicas dentro de /dashboard (no requieren sesión)
  const isPublicRoute = isPublicDashboardRoute(pathname);

  const requiresSession =
    (pathname === "/" || pathname.startsWith("/dashboard")) && !isPublicRoute;

  if (requiresSession && !hasSession) {
    const url = new URL("/dashboard/login", request.url);
    if (pathname !== "/") url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // expone pathname a layouts/server components vía header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|css|js|ico)$).*)",
  ],
};
