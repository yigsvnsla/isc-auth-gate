"use client";

import { ColumnDef } from "@tanstack/react-table";
import { authClient } from "@workspace/auth-config/lib/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  CircleCheckIcon,
  CircleXIcon,
  MailIcon,
  SearchIcon,
  ShieldHalfIcon,
  User2Icon,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { shortName } from "@workspace/ui/lib/utils";
import { usePathname } from "next/navigation";

const ActionsCell = ({ userId }: { userId: string }) => {
  const pathname = usePathname();
  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="icon">
        <Link href={`${pathname}${userId}`}>
          <SearchIcon className="size-4" />
        </Link>
      </Button>
    </div>
  );
};

export const columns: ColumnDef<typeof authClient.$Infer.Session.user>[] = [
  {
    header: "Usuario",

    cell({ row }) {
      const image = String(row.original.image);
      const name = String(row.original.name);
      const email = String(row.original.email);
      return (
        <div className="flex gap-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback className="rounded-lg">
              {shortName(name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold w-fit">{name}</span>
            <Link
              href={`mailto:${email}`}
              className="truncate text-xs text-accent-foreground/80 w-fit flex items-center gap-1"
            >
              <MailIcon className="size-2.5 text-accent-foreground/80" />
              {email}
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    header: "Roles",
    cell({ row }) {
      const roles = {
        admin: ShieldHalfIcon,
        user: User2Icon,
      } as const;

      const roleKey = row.original.role as keyof typeof roles;

      const Icon = roles[roleKey] || User2Icon;

      return (
        <div className="flex items-center font-medium capitalize gap-2 justify-start-safe">
          <Icon className="size-4" />
          {roleKey}
        </div>
      );
    },
  },
  {
    header: "Verified",
    cell({ row }) {
      const verified = row.original.emailVerified;

      return verified ? (
        <Badge variant="secondary" className="capitalize">
          <CircleCheckIcon data-icon="inline-start" />
          verified
        </Badge>
      ) : (
        <Badge variant="secondary" className="capitalize">
          <CircleXIcon data-icon="inline-start" />
          unverified
        </Badge>
      );
    },
  },
  {
    header: "Status",
    cell({ row }) {
      const banned = row.original.banned;

      return banned ? (
        <Badge className="capitalize gap-1.5 rounded-full border-red-600/40 bg-red-600/10 text-red-500 shadow-none hover:bg-red-600/10 dark:bg-red-600/30">
          <CircleXIcon data-icon="inline-start" className=" text-red-500" />
          blocked
        </Badge>
      ) : (
        <Badge className="capitalize gap-1.5 rounded-full border-emerald-600/40 bg-emerald-600/10 text-emerald-500 shadow-none hover:bg-emerald-600/10 dark:bg-emerald-600/20">
          <CircleCheckIcon
            className=" text-emerald-500"
            data-icon="inline-start"
          />
          active
        </Badge>
      );
    },
  },
  {
    header: "Created At",
    cell({ row }) {
      const createdAt = row.original.createdAt;

      return format(createdAt, "dd/mm/yyyy - hh:mm:ss");
    },
  },
  {
    header: "Update At",
    cell({ row }) {
      const updateAt = row.original.updatedAt;

      return format(updateAt, "dd/mm/yyyy - hh:mm:ss");
    },
  },

  {
    accessorKey: "id",
    header: "Actions",
    cell: ({ row: { original } }) => <ActionsCell userId={original.id} />,
  },
];
