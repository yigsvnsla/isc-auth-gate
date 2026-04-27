"use client";

import { ColumnDef } from "@tanstack/react-table";
import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CircleCheckIcon,
  CircleXIcon,
  MailIcon,
  MoreHorizontalIcon,
  ShieldHalfIcon,
  User2Icon,
  ClockIcon,
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { shortName } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { SearchIcon, BanIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const ActionsCell = ({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) => {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="size-8" />}
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem render={<Link href={`${pathname}/${userId}`} />}>
          <SearchIcon data-icon="inline-start" className="size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger
            render={<DropdownMenuItem onSelect={(e) => e.preventDefault()} />}
          >
            <BanIcon data-icon="inline-start" className="size-4" />
            Ban User
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ban {userName}?</AlertDialogTitle>
              <AlertDialogDescription>
                This user will not be able to sign in until unbanned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => toast.success(`${userName} has been banned`)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ban User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<typeof authClient.$Infer.Session.user>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={Boolean(table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"))}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "User",
    cell({ row }) {
      const image = String(row.original.image);
      const name = String(row.original.name);
      const email = String(row.original.email);
      return (
        <div className="flex gap-3 select-none cursor-default">
          <Avatar className="size-9">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback>{shortName(name)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <span className="text-sm font-medium leading-none">{name}</span>
            <Link
              href={`mailto:${email}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MailIcon className="size-3" />
              {email}
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell({ row }) {
      const role = row.original.role as string;
      const roleConfig = {
        admin: { icon: ShieldHalfIcon, variant: "default" as const },
        moderator: { icon: ShieldHalfIcon, variant: "secondary" as const },
        user: { icon: User2Icon, variant: "outline" as const },
      };
      const config =
        roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
      const Icon = config.icon;

      return (
        <Badge variant={config.variant} className="capitalize gap-1.5 w-fit">
          <Icon className="size-3.5" data-icon="inline-start" />
          {role}
        </Badge>
      );
    },
  },
  {
    id: "StatusVerification",
    accessorKey: "emailVerified",
    header: "Status",
    cell({ row }) {
      const banned = row.original.banned;
      const verified = row.original.emailVerified;

      if (banned) {
        return (
          <Badge className="gap-1.5 bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/10">
            <CircleXIcon data-icon="inline-start" className="size-3.5" />
            Blocked
          </Badge>
        );
      }

      if (verified) {
        return (
          <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
            <CircleCheckIcon data-icon="inline-start" className="size-3.5" />
            Active
          </Badge>
        );
      }

      return (
        <Badge className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
          <CircleXIcon data-icon="inline-start" className="size-3.5" />
          Pending
        </Badge>
      );
    },
  },
  {
    id: "emailVerification",
    accessorKey: "emailVerified",
    header: "Email",
    cell({ row }) {
      const verified = row.original.emailVerified;
      return verified ? (
        <Badge variant="secondary" className="gap-1 text-emerald-600">
          <CircleCheckIcon data-icon="inline-start" className="size-3" />
          Verified
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1 text-amber-600">
          <CircleXIcon data-icon="inline-start" className="size-3" />
          Unverified
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
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
    id: "lastLogin",
    header: "Last Login",
    cell() {
      const mockLastLogin = new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      );
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ClockIcon className="size-3.5" />
          {formatDistanceToNowStrict(mockLastLogin, { addSuffix: true })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => (
      <ActionsCell userId={original.id} userName={original.name} />
    ),
  },
];
