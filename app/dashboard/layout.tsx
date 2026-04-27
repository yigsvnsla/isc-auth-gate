"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { headers } from "next/headers";
import { HomeIcon, ChevronRightIcon } from "lucide-react";

const BREADCRUMB_MAP: Record<string, { label: string; href?: string }> = {
  dashboard: { label: "Dashboard", href: "/dashboard" },
  administration: { label: "Administration", href: "/dashboard/administration" },
  users: { label: "Users", href: "/dashboard/administration/users" },
  organizations: { label: "Organizations", href: "/dashboard/administration/organizations" },
};

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string; isCurrent: boolean }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const fullPath = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;

    if (segment === "dashboard") {
      breadcrumbs.push({
        label: "Dashboard",
        href: "/dashboard",
        isCurrent: isLast,
      });
    } else if (BREADCRUMB_MAP[segment]) {
      breadcrumbs.push({
        label: BREADCRUMB_MAP[segment].label,
        href: BREADCRUMB_MAP[segment].href || fullPath,
        isCurrent: isLast,
      });
    } else if (!isNaN(Number(segment))) {
      // Dynamic segment like [id] - don't add to breadcrumb
      continue;
    }
  }

  return breadcrumbs;
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const _headers = await headers();
  const userHasPermission = await auth.api.userHasPermission({
    headers: _headers,
    body: {
      role: "admin",
      permissions: {
        auth: ["access"],
      },
    },
  });

  if (userHasPermission.error || !userHasPermission.success) {
    redirect(`/auth/sign-in`, "replace");
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <BreadcrumbClient />
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
    </>
  );
}

function BreadcrumbClient() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <>
            <BreadcrumbItem key={crumb.href} className={index === 0 ? "hidden md:block" : undefined}>
              {crumb.isCurrent ? (
                <BreadcrumbPage className="font-medium text-foreground">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={crumb.href}
                  className="flex items-center gap-1.5"
                >
                  {index === 0 && <HomeIcon className="size-4" />}
                  <span className={index === 0 ? "hidden" : undefined}>{crumb.label}</span>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isCurrent && (
              <BreadcrumbSeparator key={`sep-${crumb.href}`} className={index === 0 ? "hidden md:block" : undefined}>
                <ChevronRightIcon className="size-3.5" />
              </BreadcrumbSeparator>
            )}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
