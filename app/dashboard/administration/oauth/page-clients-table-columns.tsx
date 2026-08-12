"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OAuthClient } from "@better-auth/oauth-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontalIcon, RefreshCcwIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DeleteOauthClientDialog } from "./delete-oauth-client-dialog";
import { RotateSecretOauthClientDialog } from "./rotate-secret-oauth-client-dialog";

const StatusCell = ({ client }: { client: OAuthClient }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {client.disabled ? (
      <Badge variant="destructive" className="text-[10px]">
        Disabled
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-[10px]">
        Active
      </Badge>
    )}
    {client.skip_consent && (
      <Badge variant="outline" className="text-[10px]">
        Trusted
      </Badge>
    )}
  </div>
);

const ActionsCell = ({ client }: { client: OAuthClient }) => {
  const pathname = usePathname();

  return (
    <div className="flex justify-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="size-8" />}
        >
          <MoreHorizontalIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem render={<Link href={`${pathname}/${client.client_id}`} />}>
            <SearchIcon data-icon="inline-start" className="size-4" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RotateSecretOauthClientDialog client={client}>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Rotate secret"
          title="Rotate secret"
        >
          <RefreshCcwIcon />
        </Button>
      </RotateSecretOauthClientDialog>

      <DeleteOauthClientDialog client={client}>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Delete client"
          title="Delete client"
        >
          <Trash2Icon />
        </Button>
      </DeleteOauthClientDialog>
    </div>
  );
};

export const AuthClientsTableColumns: ColumnDef<OAuthClient>[] = [
  {
    accessorKey: "client_name",
    header: "Client",
    cell({ row }) {
      const client = row.original;
      const clientIdShort = `${client.client_id.slice(0, 12)}...`;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium leading-none">
            {client.client_name || clientIdShort}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {client.client_id}
          </span>
        </div>
      );
    },
  },
  {
    id: "redirect_uris",
    header: "Redirect URIs",
    cell({ row }) {
      const uris = row.original.redirect_uris;

      return (
        <div className="flex flex-wrap gap-1">
          {uris.map((uri) => (
            <Badge
              key={uri}
              variant="outline"
              className="max-w-50 truncate font-mono text-[10px]"
            >
              {uri}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "disabled",
    header: "Status",
    cell: ({ row }) => <StatusCell client={row.original} />,
  },
  {
    accessorKey: "client_id_issued_at",
    header: "Created",
    cell({ row }) {
      const issuedAt = row.original.client_id_issued_at;

      return (
        <div className="text-sm text-muted-foreground">
          {issuedAt
            ? format(new Date(issuedAt * 1000), "MMM d, yyyy")
            : "—"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell client={row.original} />,
  },
];
