
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown } from "lucide-react";

export const NavUserSkeleton = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            size="lg"
            className="hover:bg-transparent active:bg-transparent"
          >
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="grid space-y-2 flex-1 text-left text-sm leading-tight">
              <Skeleton className="h-3 w-37.5" />
              <Skeleton className="h-2 w-25" />
            </div>
            <ChevronsUpDown className="ml-auto size-4 hidden" />
          </SidebarMenuButton>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
