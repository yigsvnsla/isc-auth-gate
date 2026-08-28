"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/kpi/kpi-card";
import {
  LoginMethodChart,
  VerificationChart,
  TopClientsChart,
} from "@/components/kpi/kpi-charts";
import type { SerializedKpiSummary, OAuthClientRef } from "@/lib/kpi/types";
import {
  UsersIcon,
  ShieldCheckIcon,
  BanIcon,
  MailWarningIcon,
  KeyRoundIcon,
  AppWindowIcon,
  ClockIcon,
  MoreHorizontalIcon,
  KeySquareIcon,
  CircleUserIcon,
} from "lucide-react";

const CLIENT_PROVIDER_LABELS: Record<string, string> = {
  microsoft: "Microsoft 365",
  "microsoft-entra-id": "Microsoft 365",
  credential: "Correo y Contraseña",
  email: "Correo Electrónico",
  username: "Usuario y Clave",
  passkey: "Passkey / Biometría",
  "phone-number": "SMS / Teléfono",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDeviceName(userAgent: string | null) {
  const ua = (userAgent || "").toLowerCase();
  if (ua.includes("iphone") || ua.includes("android") || ua.includes("mobile"))
    return "Móvil";
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari")) return "Safari";
  if (ua.includes("mac")) return "Mac";
  if (!ua) return "API / Desconocido";
  return "Otro";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardPage() {
  const [clients, setClients] = useState<OAuthClientRef[]>([]);
  const [selectedClientId, setSelectedClientId] =
    useState<string>("__global__");
  const [summary, setSummary] = useState<SerializedKpiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/oauth-clients")
      .then((r) => r.json())
      .then((d) => setClients(d.clients ?? []))
      .catch(() => setClients([]));
  }, []);

  useEffect(() => {
    const qs =
      selectedClientId && selectedClientId !== "__global__"
        ? `?clientId=${encodeURIComponent(selectedClientId)}`
        : "";
    fetch(`/api/admin/kpi${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSummary(d))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [selectedClientId]);

  const verifiedPercentage = useMemo(() => {
    if (!summary || summary.users.total === 0) return 0;
    return Math.round((summary.users.verified / summary.users.total) * 100);
  }, [summary]);

  const scopeLabel = useMemo(() => {
    if (selectedClientId === "__global__" || !summary?.clientName)
      return "Todas las aplicaciones";
    return summary.clientName;
  }, [selectedClientId, summary]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Auth BFF Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Métricas de autenticación empresarial
              {scopeLabel ? ` · ${scopeLabel}` : ""}
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={selectedClientId}
              onValueChange={(v) => {
                setSelectedClientId(v ?? "__global__");
                setLoading(true);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar aplicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__global__">
                  Global (todas las apps)
                </SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.clientId} value={c.clientId}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
      </div>

      {loading || !summary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Usuarios"
              value={summary.users.total}
              description={
                summary.users.new30d > 0
                  ? `+${summary.users.new30d} en 30 días`
                  : "Sin altas recientes"
              }
              icon={UsersIcon}
            />
            <KpiCard
              title="Sesiones Activas"
              value={summary.sessions.active}
              description="Actualmente autenticadas"
              icon={CircleUserIcon}
              variant="success"
            />
            <KpiCard
              title="Correos Verificados"
              value={`${summary.users.verified} (${verifiedPercentage}%)`}
              description="Email confirmado"
              icon={ShieldCheckIcon}
              variant="success"
            />
            <KpiCard
              title="Pendientes Verificación"
              value={summary.users.total - summary.users.verified}
              description="Awaiting confirmation"
              icon={MailWarningIcon}
              variant="warning"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Usuarios Baneados"
              value={summary.users.banned}
              description="Cuentas suspendidas"
              icon={BanIcon}
              variant="danger"
            />
            <KpiCard
              title="Con 2FA"
              value={summary.users.twoFactorEnabled}
              description="Doble factor activo"
              icon={KeyRoundIcon}
            />
            <KpiCard
              title="Tokens Activos OAuth"
              value={summary.oauth.activeTokens}
              description="Access tokens vigentes"
              icon={KeySquareIcon}
            />
            <KpiCard
              title="Consentimientos"
              value={summary.oauth.totalConsents}
              description="Otorgados a apps"
              icon={AppWindowIcon}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <LoginMethodChart data={summary.loginMethods} />
            <VerificationChart data={summary.verificationBreakdown} />
            <TopClientsChart data={summary.oauth.topClients} />
          </div>

          <Tabs defaultValue="overview" className="flex flex-col gap-4">
            <TabsList>
              <TabsTrigger value="overview">Usuarios</TabsTrigger>
              <TabsTrigger value="sessions">Sesiones</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Usuarios Recientes
                  </CardTitle>
                  <CardDescription>
                    Últimos registros en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>2FA</TableHead>
                        <TableHead>Creado</TableHead>
                        <TableHead className="w-12.5"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="grid gap-0.5">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.banned ? (
                              <Badge variant="destructive">Baneado</Badge>
                            ) : user.emailVerified ? (
                              <Badge variant="secondary">Verificado</Badge>
                            ) : (
                              <Badge variant="outline">Pendiente</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.role ?? "user"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.twoFactorEnabled ? (
                              <Badge variant="secondary">Sí</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sesiones Activas</CardTitle>
                  <CardDescription>
                    Sesiones actualmente autenticadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Dispositivo</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Expira</TableHead>
                        <TableHead className="w-12.5"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.recentSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback>
                                  {session.userName
                                    ? getInitials(session.userName)
                                    : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {session.userName ?? session.userEmail ?? "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getDeviceName(session.userAgent)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {session.ipAddress ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <ClockIcon
                                className="h-3 w-3"
                                data-icon="inline-start"
                              />
                              {formatDateTime(session.expiresAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Seguridad de Cuentas
                  </CardTitle>
                  <CardDescription>
                    Métodos de autenticación y estado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-12.5"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.securityAccounts.map((account, index) => (
                        <TableRow key={`${account.userId}-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback>
                                  {account.userName
                                    ? getInitials(account.userName)
                                    : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {account.userName ?? account.userEmail ?? "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                account.category === "oauth"
                                  ? "secondary"
                                  : account.category === "passkey"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {account.category === "oauth"
                                ? "OAuth"
                                : account.category === "passkey"
                                  ? "Passkey"
                                  : "Contraseña"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {CLIENT_PROVIDER_LABELS[account.providerId] ??
                              account.providerId}
                          </TableCell>
                          <TableCell>
                            {account.banned ? (
                              <Badge variant="destructive">Bloqueado</Badge>
                            ) : account.emailVerified ? (
                              <Badge variant="secondary">Activo</Badge>
                            ) : (
                              <Badge variant="outline">Pendiente</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
