import { Button } from "@/components/ui/button";
import { CreateClientDialog } from "./create-oauth-client-dialog";
import { GlobeIcon, PlusIcon, RefreshCcwIcon, Trash2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialog,
} from "@/components/ui/alert-dialog";
import { OAuthClient } from "@better-auth/oauth-provider";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DeleteOauthClientDialog } from "./delete-oauth-client-dialog";

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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onRotateSecret(client)}
            aria-label="Rotate secret"
            title="Rotate secret"
          >
            <RefreshCcwIcon />
          </Button>

          <DeleteOauthClientDialog>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete client"
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
  const { data: clients, isLoading, mutate } = useOAuthClients();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OAuthClient | null>(null);
  const [rotateTarget, setRotateTarget] = useState<OAuthClient | null>(null);
  const deleteMutation = useDeleteOAuthClient();
  const rotateMutation = useRotateClientSecret();
  w;

  const handleRotate = async () => {
    if (!rotateTarget) return;
    try {
      await rotateMutation.trigger({ client_id: rotateTarget.client_id });
      toast.success("Client secret rotated");
      setRotateTarget(null);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rotate");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          OAuth 2.1 clients registered in this authorization server. Third-party
          apps use these credentials to authenticate users.
        </p>

        {/* CREATE CLIENT DIALOG */}
        <CreateClientDialog>
          <Button size="sm">
            <PlusIcon data-icon="inline-start" />
            New Client
          </Button>
        </CreateClientDialog>
      </div>

      <Card>
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
      </Card>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete client &ldquo;
              {deleteTarget?.client_name || deleteTarget?.client_id}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All tokens issued for this client
              will become invalid immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {deleteMutation.isMutating ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={rotateTarget !== null}
        onOpenChange={(o) => !o && setRotateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate secret?</AlertDialogTitle>
            <AlertDialogDescription>
              The current client secret will be invalidated immediately.
              Applications using this client will need to update their
              configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRotate}>
              {rotateMutation.isMutating ? "Rotating..." : "Rotate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
