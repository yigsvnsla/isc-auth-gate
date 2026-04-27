"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
      continue;
    }
  }

  return breadcrumbs;
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center">
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : undefined}>
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
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : undefined}>
                <ChevronRightIcon className="size-3.5" />
              </BreadcrumbSeparator>
            )}
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}