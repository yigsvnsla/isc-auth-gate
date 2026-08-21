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
import { toast } from "sonner";
import { Building2, Trash2 } from "lucide-react";

type ApiKey = {
  id: string;
  name: string | null;
  start: string | null;
  metadata?: { organizationId?: string } | null;
};

const fmt = (v: string | Date | null | undefined) =>
  v ? new Date(v).toLocaleString() : "—";

export default function OrgApiKeysSettingsPage() {
  const { data: session } = authClient.useSession();
  const activeOrgId = session?.session?.activeOrganizationId;
  const [name, setName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<ApiKey[]>(
    activeOrgId ? `org-api-keys-${activeOrgId}` : null,
    async () => {
      const { data, error } = await authClient.apiKey.list();
      if (error) throw error;
      const keys = ((data as { apiKeys?: ApiKey[] }).apiKeys ?? []) as ApiKey[];
      return keys.filter(
        (k) => k.metadata?.organizationId === activeOrgId,
      );
    },
  );

  const createMut = useSWRMutation(
    "org-api-keys",
    async (_k, { arg }: { arg: { name: string } }) => {
      const { data, error } = await authClient.apiKey.create({
        name: arg.name,
        metadata: { organizationId: activeOrgId! },
      });
      if (error) throw error;
      return data as { key: string };
    },
    { onSuccess: () => mutate() },
  );

  if (!activeOrgId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" /> API Keys de la organización
          </CardTitle>
          <CardDescription>
            Selecciona una organización activa para gestionar sus API keys.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const submitCreate = async () => {
    if (!name.trim()) return toast.error("Ingresa un nombre");
    try {
      const created = await createMut.trigger({ name: name.trim() });
      if (created?.key) setPendingKey(created.key);
      toast.success("API key de organización creada");
      setCreateOpen(false);
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await authClient.apiKey.delete({ keyId: deleteId });
      toast.success("API key eliminada");
      mutate();
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
            <Building2 className="size-5" /> API Keys de la organización
          </h1>
          <p className="text-muted-foreground text-sm">
            Claves vinculadas a la organización activa ({activeOrgId}).
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Crear API Key</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Keys de la organización</CardTitle>
          <CardDescription>
            Usa el header <code>x-api-key</code> para autenticar peticiones de
            la organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no hay API keys para esta organización.
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
                      <span className="font-medium">{k.name || "(sin nombre)"}</span>
                      <Badge variant="secondary">Org</Badge>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {k.start ? `${k.start}…` : "••••"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(k.id)}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Crear API Key de organización</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="oak-name">Nombre</Label>
              <Input
                id="oak-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Integración org"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitCreate} disabled={createMut.isMutating}>
                {createMut.isMutating ? "Creando…" : "Crear"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingKey && (
        <Card>
          <CardHeader>
            <CardTitle>Guarda tu API Key</CardTitle>
            <CardDescription>
              Esta es la única vez que se mostrará la clave completa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="bg-muted break-all rounded-md border p-3 font-mono text-xs">
              {pendingKey}
            </code>
          </CardContent>
        </Card>
      )}

      {deleteId && (
        <Card>
          <CardHeader>
            <CardTitle>¿Eliminar API Key?</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
