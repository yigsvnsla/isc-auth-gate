import { Button } from "@/components/ui/button";
import { RefreshCcwIcon, Trash2Icon } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";

import { OAuthClient } from "@better-auth/oauth-provider";
import { Badge } from "@/components/ui/badge";
import { DeleteOauthClientDialog } from "./delete-oauth-client-dialog";
import { RotateSecretOauthClientDialog } from "./rotate-secret-oauth-client-dialog";
import { AuthClientsTable } from "./page-clients-table";
import { AuthClientsPageHeader } from "./page-clients-header";

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ClientRow({
  client,
  onDelete,
  onRotateSecret,
}: {
  client: OAuthClient;
  onDelete: (client: OAuthClient) => void;
  onRotateSecret: (client: OAuthClient) => void;
}) {
  const clientIdShort = `${client.client_id.slice(0, 12)}...`;

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">
            {client.client_name || clientIdShort}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {client.client_id}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {client.redirect_uris.map((uri) => (
            <Badge
              key={uri}
              variant="outline"
              className="text-[10px] font-mono max-w-50 truncate"
            >
              {uri}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
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
      </TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
        {formatDate(
          client.client_id_issued_at
            ? new Date(client.client_id_issued_at * 1000).toISOString()
            : undefined,
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <RotateSecretOauthClientDialog>
            <Button
              size="icon-sm"
              title="Rotate secret"
              variant="ghost"
              aria-label="Rotate secret"
              // onClick={() => onRotateSecret(client)}
            >
              <RefreshCcwIcon />
            </Button>
          </RotateSecretOauthClientDialog>

          <DeleteOauthClientDialog>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Delete client"
              // onClick={() => onDelete(client)}
            >
              <Trash2Icon />
            </Button>
          </DeleteOauthClientDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export const AuthClientsPage = () => {
  // const { data: clients, isLoading, mutate } = useOAuthClients();

  return (
    <div className="flex flex-col gap-4">
      <AuthClientsPageHeader />

      <AuthClientsTable />

      {/* <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : clients && clients.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Redirect URIs</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <ClientRow
                      key={client.client_id}
                      client={client}
                      onDelete={setDeleteTarget}
                      onRotateSecret={setRotateTarget}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <GlobeIcon className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No OAuth clients yet. Create one to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
};
