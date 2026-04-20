"use server";

import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/auth-client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  // const _headers = await headers();

  // const { data: session, error: errorSession } = await authClient.getSession({
  //   fetchOptions: {
  //     headers: _headers,
  //   },
  // });

  // if (!session || errorSession) redirect("/auth/sign-in");

  // const { data: permission, error: errorPermission } =
  //   await authClient.admin.hasPermission({
  //     role: "admin",
  //     userId: session.user.id,
  //     permissions: {
  //       auth: ["access"],
  //     },
  //     fetchOptions: {
  //       headers: _headers,
  //       credentials: "same-origin",
  //     },
  //   });

  // console.log({
  //   data: permission,
  //   error: errorPermission,
  //   //headers: JSON.stringify(_headers),
  // });

  // if (!permission || errorPermission) {
  //   // no es lo mejor que se me ocurra, pero es para mostrar el error en la pantalla de login

  //   const params = new URLSearchParams({
  //     message: errorPermission?.message ?? "",
  //     code: String(errorPermission?.code ?? ""),
  //     status: String(errorPermission?.status ?? ""),
  //     statusText: errorPermission?.statusText ?? "",
  //   });

  //   redirect(`/auth/sign-in?${params.toString()}`);
  // }

  const cookieStore = await cookies();
  const defaultOpen = Boolean(cookieStore.get("sidebar_state")?.value);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <section className="flex flex-1 flex-col gap-4 p-4 container mx-auto">
          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
