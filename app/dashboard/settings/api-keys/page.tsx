"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { KeyRound, Copy, Trash2 } from "lucide-react";

type ApiKey = {
  id: string;
  name: string | null;
  prefix: string | null;
  start: string | null;
  enabled: boolean | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  expiresAt: string | Date | null;
  lastRequest: string | Date | null;
  remaining: number | null;
  permissions: string | null;
  metadata: string | null;
};

const fmt = (v: string | Date | null | undefined) =>
  v ? new Date(v).toLocaleString() : "—";

const EXPIRY_OPTIONS = [
  { label: "7 días", value: 60 * 60 * 24 * 7 },
  { label: "30 días", value: 60 * 60 * 24 * 30 },
  { label: "90 días", value: 60 * 60 * 24 * 90 },
  { label: "Nunca", value: 0 },
];

export default function ApiKeysSettingsPage() {
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [expiresIn, setExpiresIn] = useState(EXPIRY_OPTIONS[0].value);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<ApiKey[]>(
    "api-keys",
    async () => {
      const { data, error } = await authClient.apiKey.list();
      if (error) throw error;
      return (data?.apiKeys ?? []) as unknown as ApiKey[];
    },
  );

  const createMut = useSWRMutation(
    "api-keys",
    async (
      _k,
      { arg }: { arg: { name: string; prefix: string; expiresIn: number } },
    ) => {
      const { data, error } = await authClient.apiKey.create({
        name: arg.name,
        prefix: arg.prefix || undefined,
        expiresIn: arg.expiresIn || undefined,
      });
      if (error) throw error;
      return data;
    },
    { onSuccess: () => mutate() },
  );

  const deleteMut = useSWRMutation(
    "api-keys",
    async (_k, { arg }: { arg: string }) => {
      const { error } = await authClient.apiKey.delete({ keyId: arg });
      if (error) throw error;
    },
    { onSuccess: () => mutate() },
  );

  const openCreate = () => {
    setName("");
    setPrefix("");
    setExpiresIn(EXPIRY_OPTIONS[0].value);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!name.trim()) {
      toast.error("Ingresa un nombre para la API key");
      return;
    }
    try {
      const created = await createMut.trigger({
        name: name.trim(),
        prefix: prefix.trim(),
        expiresIn,
      });
      if (created?.key) setPendingKey(created.key);
      toast.success("API key creada");
      setCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la key");
    }
  };

  const copyKey = async () => {
    if (!pendingKey) return;
    await navigator.clipboard.writeText(pendingKey);
    toast.success("API key copiada al portapapeles");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMut.trigger(deleteId);
      toast.success("API key eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <KeyRound className="size-5" /> API Keys
          </h1>
          <p className="text-muted-foreground text-sm">
            Crea y gestiona claves para autenticar requests de API. La clave
            completa solo se muestra una vez al crearla.
          </p>
        </div>
        <Button onClick={openCreate}>Crear API Key</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tus API Keys</CardTitle>
          <CardDescription>
            Usa el header <code>x-api-key</code> para autenticar peticiones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no tienes API keys.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {k.name || "(sin nombre)"}
                      </span>
                      {k.enabled === false ? (
                        <Badge variant="outline">Deshabilitada</Badge>
                      ) : (
                        <Badge variant="secondary">Activa</Badge>
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {k.prefix ? `${k.prefix}_` : ""}
                      {k.start ? `${k.start}…` : "••••"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Creada: {fmt(k.createdAt)} · Expira: {fmt(k.expiresAt)} ·
                      Último uso: {fmt(k.lastRequest)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(k.id)}
                    aria-label="Eliminar API key"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear API Key</DialogTitle>
            <DialogDescription>
              Define un nombre y (opcional) un prefijo y expiración.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ak-name">Nombre</Label>
              <Input
                id="ak-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi integración"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ak-prefix">Prefijo (opcional)</Label>
              <Input
                id="ak-prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="miapp_"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ak-exp">Expiración</Label>
              <select
                id="ak-exp"
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
              >
                {EXPIRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={submitCreate} disabled={createMut.isMutating}>
              {createMut.isMutating ? "Creando…" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!pendingKey}
        onOpenChange={(o) => !o && setPendingKey(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guarda tu API Key</DialogTitle>
            <DialogDescription>
              Esta es la única vez que se mostrará la clave completa.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <code className="bg-muted break-all rounded-md border p-3 font-mono text-xs">
              {pendingKey}
            </code>
            <Button variant="outline" onClick={copyKey}>
              <Copy className="size-4" /> Copiar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los requests que usen esta clave
              dejarán de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
