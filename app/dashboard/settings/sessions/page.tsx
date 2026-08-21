"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";

type Session = {
  id: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  expiresAt: string | Date;
};

const fmt = (v: string | Date | null | undefined) =>
  v ? new Date(v).toLocaleString() : "—";

function uaLabel(ua?: string | null) {
  if (!ua) return "Desconocido";
  if (/Postman|curl|http/i.test(ua)) return "API / Script";
  if (/Mobile/i.test(ua)) return "Móvil";
  if (/Win/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Navegador";
}

export default function SessionsSettingsPage() {
  const { data: sessionData } = authClient.useSession();
  const currentToken = sessionData?.session?.token;
  const lastMethod = (sessionData?.user as { lastLoginMethod?: string } | undefined)?.lastLoginMethod;

  const { data, isLoading, mutate } = useSWR<{ sessions: Session[] }>(
    "sessions",
    async () => {
      const { data, error } = await authClient.listSessions();
      if (error) throw error;
      return { sessions: data };
    },
  );

  const revokeMut = useSWRMutation(
    "sessions",
    async (_k, { arg }: { arg: string }) => {
      const { error } = await authClient.revokeSession({ token: arg });
      if (error) throw error;
    },
    { onSuccess: () => mutate() },
  );

  const revokeOthersMut = useSWRMutation(
    "sessions",
    async () => {
      const { error } = await authClient.revokeOtherSessions();
      if (error) throw error;
    },
    { onSuccess: () => mutate() },
  );

  const sessions = data?.sessions ?? [];
  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Monitor className="size-5" /> Sesiones
          </h1>
          <p className="text-muted-foreground text-sm">
            Dispositivos con acceso activo a tu cuenta. Último método de acceso:{" "}
            {lastMethod ? (
              <Badge variant="secondary">{lastMethod}</Badge>
            ) : (
              "—"
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => revokeOthersMut.trigger()}
          disabled={revokeOthersMut.isMutating}
        >
          <LogOut className="size-4" /> Cerrar otras sesiones
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones activas</CardTitle>
          <CardDescription>
            Multi-session permite varias sesiones a la vez. Revoca las que no
            reconozcas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando…</p>
          ) : sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin sesiones.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((s) => {
                const current = s.token === currentToken;
                const expired = new Date(s.expiresAt).getTime() < now;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{uaLabel(s.userAgent)}</span>
                        {current && <Badge>Esta sesión</Badge>}
                        {expired && <Badge variant="outline">Expirada</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        IP: {s.ipAddress ?? "—"} · Creada: {fmt(s.createdAt)} ·
                        Expira: {fmt(s.expiresAt)}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s.userAgent ?? ""}
                      </span>
                    </div>
                    {!current && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => revokeMut.trigger(s.token)}
                        disabled={revokeMut.isMutating}
                        aria-label="Revocar sesión"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
