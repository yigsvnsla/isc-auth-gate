"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ShieldCheckIcon, Trash2Icon } from "lucide-react";

import { DeleteGlobalConsentDialog } from "./delete-oauth-consent-global-dialog";
import { GlobalConsentRow } from "./list-oauth-consents-global-query";

const ScopesCell = ({ scopes }: { scopes: string[] }) => (
  <div className="flex flex-wrap gap-1">
    {scopes.map((scope) => (
      <Badge key={scope} variant="secondary" className="font-mono text-[10px]">
        {scope}
      </Badge>
    ))}
  </div>
);

const ActionsCell = ({ consent }: { consent: GlobalConsentRow }) => (
  <div className="flex justify-end">
    <DeleteGlobalConsentDialog consent={consent}>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="Revocar consent"
        title="Revocar consent"
      >
        <Trash2Icon />
      </Button>
    </DeleteGlobalConsentDialog>
  </div>
);

export const GlobalConsentsTableColumns: ColumnDef<GlobalConsentRow>[] = [
  {
    accessorKey: "clientId",
    header: "Cliente",
    cell({ row }) {
      const { clientId, clientName } = row.original;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-sm font-medium leading-none">
            <ShieldCheckIcon className="size-3.5 text-muted-foreground" />
            {clientName || clientId}
          </span>
          {clientName && (
            <span className="font-mono text-xs text-muted-foreground">
              {clientId}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "userEmail",
    header: "Usuario",
    cell({ row }) {
      const { userEmail, userName, userId } = row.original;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium leading-none">
            {userName || userEmail || userId || "—"}
          </span>
          {userEmail && userName && (
            <span className="text-xs text-muted-foreground">{userEmail}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "scopes",
    header: "Scopes",
    cell: ({ row }) => <ScopesCell scopes={row.original.scopes} />,
  },
  {
    accessorKey: "createdAt",
    header: "Otorgado",
    cell({ row }) {
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell consent={row.original} />,
  },
];
