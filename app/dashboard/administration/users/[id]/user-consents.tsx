"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { KeyRoundIcon, PlusIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";

import {
  AdminUserConsent,
  useAdminUserConsentsActions,
  useAdminUserConsentsQuery,
} from "@/hooks/use-admin-user-consents";
import { useListOAuthClientsQuery } from "../../oauth/list-oauth-clients-query";

const availableScopes = ["openid", "profile", "email", "offline_access"] as const;

const ScopesCell = ({ scopes }: { scopes: string[] }) => (
  <div className="flex flex-wrap gap-1">
    {scopes.map((scope) => (
      <Badge key={scope} variant="secondary" className="font-mono text-[10px]">
        {scope}
      </Badge>
    ))}
  </div>
);

function ScopesSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {availableScopes.map((scope) => (
        <label key={scope} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={value.includes(scope)}
            onChange={(e) => {
              onChange(
                e.target.checked
                  ? [...value, scope]
                  : value.filter((s) => s !== scope),
              );
            }}
          />
          <span className="font-mono text-xs">{scope}</span>
        </label>
      ))}
    </div>
  );
}

export function UserConsentsTab({ userId }: { userId: string }) {
  const { data, isLoading, mutate } = useAdminUserConsentsQuery(userId);
  const actions = useAdminUserConsentsActions(userId);
  const clientsQuery = useListOAuthClientsQuery();

  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const [editing, setEditing] = useState<AdminUserConsent | null>(null);
  const [editScopes, setEditScopes] = useState<string[]>([]);
  const [revoking, setRevoking] = useState<AdminUserConsent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newClientId, setNewClientId] = useState("");
  const [newScopes, setNewScopes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const rawData = useMemo(() => data ?? [], [data]);

  const filteredData = useMemo(() => {
    if (!search) return rawData;
    const lower = search.toLowerCase();
    return rawData.filter(
      (c) =>
        c.clientId.toLowerCase().includes(lower) ||
        (c.clientName ?? "").toLowerCase().includes(lower),
    );
  }, [rawData, search]);

  const paginatedData = filteredData.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const openEdit = (consent: AdminUserConsent) => {
    setEditing(consent);
    setEditScopes(consent.scopes);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      await actions.updateConsent({ consentId: editing.id, scopes: editScopes });
      toast.success("Scopes actualizados");
      setEditing(null);
      await mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar");
    } finally {
      setBusy(false);
    }
  };

  const confirmRevoke = async () => {
    if (!revoking) return;
    setBusy(true);
    try {
      await actions.deleteConsent(revoking.id);
      toast.success("Consent revocado");
      setRevoking(null);
      await mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al revocar");
    } finally {
      setBusy(false);
    }
  };

  const createConsent = async () => {
    if (!newClientId || newScopes.length === 0) {
      toast.error("Selecciona un cliente y al menos un scope");
      return;
    }
    setBusy(true);
    try {
      await actions.createConsent({ clientId: newClientId, scopes: newScopes });
      toast.success("Consent otorgado");
      setCreateOpen(false);
      setNewClientId("");
      setNewScopes([]);
      await mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al otorgar");
    } finally {
      setBusy(false);
    }
  };

  const clients = clientsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">User Consents</CardTitle>
              <CardDescription>
                Aplicaciones de terceros autorizadas por este usuario.
              </CardDescription>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger
                render={
                  <Button size="sm">
                    <PlusIcon data-icon="inline-start" />
                    Otorgar consent
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Otorgar consent</DialogTitle>
                  <DialogDescription>
                    Autoriza manualmente una app para este usuario (sin pasar
                    por el flujo de consentimiento).
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <Select value={newClientId} onValueChange={(value) => setNewClientId(value ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.client_id} value={c.client_id}>
                          {c.client_name || c.client_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ScopesSelector value={newScopes} onChange={setNewScopes} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createConsent} disabled={busy}>
                    {busy ? "Otorgando..." : "Otorgar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="relative">
            <Input
              placeholder="Buscar por cliente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              className="pl-8"
            />
            <svg
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              height="1em"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Otorgado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoading && rawData.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4}>
                      <Empty className="h-[calc(6*52px)]">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <KeyRoundIcon />
                          </EmptyMedia>
                          <EmptyTitle className="capitalize">
                            no consents yet
                          </EmptyTitle>
                          <EmptyDescription>
                            Este usuario no ha autorizado ninguna app.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4}>
                      <Empty className="h-[calc(6*52px)]">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <KeyRoundIcon />
                          </EmptyMedia>
                          <EmptyTitle className="capitalize">
                            no results found
                          </EmptyTitle>
                          <EmptyDescription>
                            Ningún consent coincide con la búsqueda.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((consent) => (
                    <TableRow key={consent.id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <ShieldCheckIcon className="size-3.5 text-muted-foreground" />
                            {consent.clientName || consent.clientId}
                          </span>
                          {consent.clientName && (
                            <span className="font-mono text-xs text-muted-foreground">
                              {consent.clientId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ScopesCell scopes={consent.scopes} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(consent.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Editar scopes"
                            aria-label="Editar scopes"
                            onClick={() => openEdit(consent)}
                          >
                            <ShieldCheckIcon />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Revocar"
                            aria-label="Revocar"
                            onClick={() => setRevoking(consent)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredData.length} consent(s)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageIndex === 0}
                  onClick={() => setPageIndex((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span>
                  Página {pageIndex + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDIT SCOPES */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar scopes</DialogTitle>
            <DialogDescription>
              {editing?.clientName || editing?.clientId}
            </DialogDescription>
          </DialogHeader>
          <ScopesSelector value={editScopes} onChange={setEditScopes} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={busy || editScopes.length === 0}>
              {busy ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REVOKE */}
      <AlertDialog open={revoking !== null} onOpenChange={(o) => !o && setRevoking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocar consent?</AlertDialogTitle>
            <AlertDialogDescription>
              La app {revoking?.clientName || revoking?.clientId} deberá
              solicitar autorización nuevamente en el próximo acceso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevoke}>
              {busy ? "Revocando..." : "Revocar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
