"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontalIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { shortName } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchIcon } from "lucide-react";

const ActionsCell = ({ orgId, orgName }: { orgId: string; orgName: string }) => {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem render={<Link href={`${pathname}/${orgId}`} />}>
          <SearchIcon data-icon="inline-start" className="size-4" />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  role: "owner" | "admin" | "member";
};

export const columns: ColumnDef<OrganizationRow>[] = [
  {
    accessorKey: "name",
    header: "Organization",
    cell({ row }) {
      const image = row.original.logo;
      const name = row.original.name;
      const slug = row.original.slug;
      return (
        <div className="flex gap-3">
          <Avatar className="size-9">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback>{shortName(name)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <span className="text-sm font-medium leading-none">{name}</span>
            <span className="text-xs text-muted-foreground">
              /{slug}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Your Role",
    cell({ row }) {
      const role = row.original.role;
      const roleConfig = {
        owner: { icon: ShieldIcon, variant: "default" as const, className: "bg-primary/10 text-primary border-primary/20" },
        admin: { icon: ShieldIcon, variant: "secondary" as const, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
        member: { icon: UsersIcon, variant: "outline" as const, className: "text-muted-foreground" },
      };
      const config = roleConfig[role] || roleConfig.member;
      const Icon = config.icon;

      return (
        <Badge className={`capitalize gap-1.5 w-fit ${config.className}`}>
          <Icon className="size-3.5" data-icon="inline-start" />
          {role}
        </Badge>
      );
    },
  },
  {
    id: "members",
    header: "Members",
    cell() {
      // TODO: Implement member count per organization
      // To get this: authClient.organization.listMembers({ organizationId })
      // Consider fetching in parallel after main list loads
      return (
        <Badge variant="outline" className="gap-1.5 text-muted-foreground">
          <UsersIcon className="size-3.5" data-icon="inline-start" />
          N/A
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell({ row }) {
      const createdAt = row.original.createdAt;
      return (
        <div className="text-sm text-muted-foreground">
          {format(createdAt, "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => (
      <ActionsCell orgId={original.id} orgName={original.name} />
    ),
  },
];