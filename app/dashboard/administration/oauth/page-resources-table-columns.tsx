"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OAuthResource } from "@better-auth/oauth-provider";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { DeleteResourceDialog } from "./delete-resource-dialog";
import { UpdateResourceDialog } from "./update-resource-dialog";

const StatusCell = ({ resource }: { resource: OAuthResource }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {resource.disabled ? (
      <Badge variant="destructive" className="text-[10px]">
        Disabled
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-[10px]">
        Active
      </Badge>
    )}
    {resource.dpopBoundAccessTokensRequired && (
      <Badge variant="outline" className="text-[10px]">
        DPoP
      </Badge>
    )}
  </div>
);

const ActionsCell = ({ resource }: { resource: OAuthResource }) => (
  <div className="flex justify-end gap-1">
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="size-8" />}
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <UpdateResourceDialog resource={resource}>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer"
          >
            <PencilIcon data-icon="inline-start" />
            Edit
          </DropdownMenuItem>
        </UpdateResourceDialog>
        <DeleteResourceDialog resource={resource}>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer"
          >
            <Trash2Icon data-icon="inline-start" />
            Delete
          </DropdownMenuItem>
        </DeleteResourceDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export const AuthResourcesTableColumns: ColumnDef<OAuthResource>[] = [
  {
    accessorKey: "identifier",
    header: "Identifier",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.identifier}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name ?? "—",
  },
  {
    accessorKey: "allowedScopes",
    header: "Allowed Scopes",
    cell: ({ row }) =>
      row.original.allowedScopes?.length ? (
        <div className="flex flex-wrap gap-1">
          {row.original.allowedScopes.map((s) => (
            <Badge key={s} variant="outline" className="font-mono text-[10px]">
              {s}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
  },
  {
    accessorKey: "accessTokenTtl",
    header: "Access TTL (s)",
    cell: ({ row }) => row.original.accessTokenTtl ?? "default",
  },
  {
    accessorKey: "refreshTokenTtl",
    header: "Refresh TTL (s)",
    cell: ({ row }) => row.original.refreshTokenTtl ?? "default",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell resource={row.original} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell resource={row.original} />,
  },
];