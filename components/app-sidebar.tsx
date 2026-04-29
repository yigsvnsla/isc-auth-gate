'use client";';

import * as React from "react";

// import { NavProjects } from "@/components/nav-projects"; // Coming Soon
// import { NavSecondary } from "@/components/nav-secondary"; // Coming Soon
// import { NavUser } from "@/components/nav-user"; // Coming Soon
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavUserSkeleton } from "./nav-user-skeleton";
import { NavUserContainer } from "./nav-user-container";
import { NavMainContainer } from "./nav-main-container";
import { CommandIcon } from "lucide-react";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                 <Link href="#" title="Coming Soon">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <CommandIcon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">ISC Gate</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <React.Suspense fallback={<NavUserSkeleton />}>
          <NavMainContainer />
        </React.Suspense>
        {/* 
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <React.Suspense fallback={<NavUserSkeleton />}>
          <NavUserContainer />
        </React.Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
