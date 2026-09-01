/**
 * Dashboard routes that are publicly accessible and must bypass the session
 * and permission guards in both the middleware (`proxy.ts`) and the dashboard
 * layout (`app/dashboard/layout.tsx`).
 *
 * Keep this list as the single source of truth — both layers import from here
 * so a new public route only needs to be added once.
 */
export const PUBLIC_DASHBOARD_ROUTES = [
  "/dashboard/login",
  "/dashboard/2fa",
  "/dashboard/unauthorized",
] as const;

export function isPublicDashboardRoute(pathname: string = ""): boolean {
  return PUBLIC_DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
