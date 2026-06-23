"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  GlobeIcon,
  PlusIcon,
  Trash2Icon,
  RefreshCcwIcon,
  KeyRoundIcon,
  CopyIcon,
} from "lucide-react";
interface OAuthClient {
  clientId: string;
  clientSecret?: string;
  name?: string;
  redirectUris: string[];
  disabled?: boolean;
  skipConsent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface OAuthConsent {
  id: string;
  clientId: string;
  scopes?: string[];
  createdAt?: string;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function useOAuthClients() {
  return useSWR("/oauth2/clients", async () => {
    const { data, error } = await authClient.oauth2.getClients();
    if (error) throw new Error(error.message ?? "Failed to fetch clients");
    return data as unknown as OAuthClient[];
  });
}

function useOAuthConsents() {
  return useSWR("/oauth2/consents", async () => {
    const { data, error } = await authClient.oauth2.getConsents();
    if (error) throw new Error(error.message ?? "Failed to fetch consents");
    return data as unknown as OAuthConsent[];
  });
}

function useDeleteOAuthClient() {
  return useSWRMutation(
    "/oauth2/delete-client",
    async (_key: string, { arg }: { arg: { client_id: string } }) => {
      const { error } = await authClient.oauth2.deleteClient(arg);
      if (error) throw new Error(error.message ?? "Failed to delete client");
    },
  );
}

function useRotateClientSecret() {
  return useSWRMutation(
    "/oauth2/rotate-secret",
    async (
      _key: string,
      { arg }: { arg: { client_id: string } },
    ): Promise<OAuthClient> => {
      const { data, error } = await authClient.oauth2.client.rotateSecret(arg);
      if (error) throw new Error(error.message ?? "Failed to rotate secret");
      return data as unknown as OAuthClient;
    },
  );
}

function CreateClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [redirectUris, setRedirectUris] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const createMutation = useSWRMutation(
    "/oauth2/create-client",
    async (
      _key: string,
      {
        arg,
      }: {
        arg: { client_name: string; redirect_uris: string[] };
      },
    ) => {
      const { data, error } = await authClient.oauth2.createClient(arg);
      if (error) throw new Error(error.message ?? "Failed to create client");
      return data as unknown as OAuthClient & { clientSecret: string };
    },
  );

  const handleSubmit = async () => {
    const uris = redirectUris
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (uris.length === 0) {
      toast.error("At least one redirect URI is required");
      return;
    }
    try {
      const result = await createMutation.trigger({
        client_name: name || "Unnamed Client",
        redirect_uris: uris,
      });
      setCreatedSecret(result.clientSecret);
      toast.success(`Client "${name || result.clientId}" created`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    }
  };

  const handleClose = () => {
    if (!createdSecret) {
      setCreatedSecret(null);
      setName("");
      setRedirectUris("");
      onOpenChange(false);
    }
  };

  if (createdSecret) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Client created</DialogTitle>
            <DialogDescription>
              Save the client secret now. It won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Field>
              <FieldLabel>Client ID</FieldLabel>
              <Input value={createdSecret ? name || "—" : ""} readOnly />
            </Field>
            <Field>
              <FieldLabel>Client Secret</FieldLabel>
              <div className="flex gap-2">
                <Input value={createdSecret} readOnly className="font-mono text-xs" />
                <CopyButton value={createdSecret} />
              </div>
            </Field>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setCreatedSecret(null);
                setName("");
                setRedirectUris("");
                onOpenChange(false);
                onCreated();
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create OAuth Client</DialogTitle>
          <DialogDescription>
            Register a new OAuth 2.1 client application.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="client-name">Client Name</FieldLabel>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My App"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="redirect-uris">
              Redirect URIs <span className="text-destructive">*</span>
            </FieldLabel>
            <textarea
              id="redirect-uris"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={redirectUris}
              onChange={(e) => setRedirectUris(e.target.value)}
              placeholder="https://app.example.com/callback"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              One URI per line
            </p>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isMutating}>
            {createMutation.isMutating ? "Creating..." : "Create Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copy] = useCopyToClipboard();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        copy(value);
        toast.success("Copied");
      }}
      aria-label="Copy"
    >
      <CopyIcon />
    </Button>
  );
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
  const clientIdShort = `${client.clientId.slice(0, 12)}...`;

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">
            {client.name || clientIdShort}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {client.clientId}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {client.redirectUris.map((uri) => (
            <Badge key={uri} variant="outline" className="text-[10px] font-mono max-w-[200px] truncate">
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
          {client.skipConsent && (
            <Badge variant="outline" className="text-[10px]">
              Trusted
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
        {formatDate(client.createdAt)}
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(client)}
            aria-label="Delete client"
          >
            <Trash2Icon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ConsentRow({
  consent,
  onDelete,
}: {
  consent: OAuthConsent;
  onDelete: (consent: OAuthConsent) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{consent.clientId}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {consent.scopes?.map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px]">
              {s}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(consent.createdAt)}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon-sm" onClick={() => onDelete(consent)} aria-label="Revoke consent">
          <Trash2Icon />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ClientsTab() {
  const { data: clients, isLoading, mutate } = useOAuthClients();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OAuthClient | null>(null);
  const [rotateTarget, setRotateTarget] = useState<OAuthClient | null>(null);
  const deleteMutation = useDeleteOAuthClient();
  const rotateMutation = useRotateClientSecret();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.trigger({ client_id: deleteTarget.clientId });
      toast.success(`Client deleted`);
      setDeleteTarget(null);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleRotate = async () => {
    if (!rotateTarget) return;
    try {
      await rotateMutation.trigger({ client_id: rotateTarget.clientId });
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
          OAuth 2.1 clients registered in this authorization server.
          Third-party apps use these credentials to authenticate users.
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          New Client
        </Button>
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
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <ClientRow
                      key={client.clientId}
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

      <CreateClientDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => mutate()}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete client &ldquo;{deleteTarget?.name || deleteTarget?.clientId}&rdquo;?
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
              Applications using this client will need to update their configuration.
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
}

function ConsentsTab() {
  const { data: consents, isLoading, mutate } = useOAuthConsents();
  const [deleteTarget, setDeleteTarget] = useState<OAuthConsent | null>(null);

  const deleteConsentMutation = useSWRMutation(
    "/oauth2/delete-consent",
    async (_key: string, { arg }: { arg: { id: string } }) => {
      const { error } = await authClient.oauth2.deleteConsent({ id: arg.id });
      if (error) throw new Error(error.message ?? "Failed to revoke consent");
    },
  );

  const handleDeleteConsent = async () => {
    if (!deleteTarget) return;
    try {
      await deleteConsentMutation.trigger({ id: deleteTarget.id });
      toast.success("Consent revoked");
      setDeleteTarget(null);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke");
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : consents && consents.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((consent) => (
                  <ConsentRow
                    key={consent.id}
                    consent={consent}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <KeyRoundIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No consents granted yet. Consents appear after a user authorizes a third-party app.
            </p>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke consent?</AlertDialogTitle>
            <AlertDialogDescription>
              The third-party app will lose access to the authorized scopes.
              The user may need to re-authorize on next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConsent}>
              {deleteConsentMutation.isMutating ? "Revoking..." : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default function OAuthAdminPage() {
  const [tab, setTab] = useState<"clients" | "consents">("clients");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          OAuth Apps
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage third-party OAuth 2.1 clients and user consents
        </p>
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button
          variant={tab === "clients" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("clients")}
        >
          <GlobeIcon data-icon="inline-start" />
          Clients
        </Button>
        <Button
          variant={tab === "consents" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("consents")}
        >
          <KeyRoundIcon data-icon="inline-start" />
          Consents
        </Button>
      </div>

      {tab === "clients" ? <ClientsTab /> : <ConsentsTab />}
    </div>
  );
}
