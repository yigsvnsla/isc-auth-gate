"use server";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { headers } from "next/headers";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";

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
    </>
  );
}
