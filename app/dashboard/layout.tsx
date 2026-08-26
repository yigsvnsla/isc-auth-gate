
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { auth } from "@/lib/auth/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cookies, headers } from "next/headers";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const _headers = await headers();
  const pathname = _headers.get("x-pathname") ?? "";

  // rutas públicas del dashboard: no exigir sesión ni permisos
  const isPublicDashboardRoute =
    pathname === "/dashboard/login" ||
    pathname === "/dashboard/2fa" ||
    pathname.startsWith("/dashboard/login/") ||
    pathname.startsWith("/dashboard/2fa/");

  if (isPublicDashboardRoute) {
    return <>{children}</>;
  }

  const session = await auth.api.getSession({ headers: _headers });
  if (!session) redirect("/dashboard/login");

  let hasAccess;
  try {
    hasAccess = await auth.api.userHasPermission({
      headers: _headers,
      body: { permissions: { auth: ["access"] } },
    });
  } catch {
    redirect("/dashboard/login");
  }
  if (hasAccess.error || !hasAccess.success) redirect("/dashboard/login");

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DashboardBreadcrumb />
            <Separator
              orientation="vertical"
              className="ml-auto data-[orientation=vertical]:h-7"
            />
            <ThemeToggle />
          </div>
        </header>
        <section className="flex flex-1 flex-col gap-4 p-4 container mx-auto">
          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
