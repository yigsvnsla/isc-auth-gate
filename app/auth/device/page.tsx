"use client";

import { authClient } from "@/lib/auth/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GridPattern } from "@/components/ui/grid-pattern";
import {
  CommandIcon,
  ExternalLinkIcon,
  LaptopIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const scopeDescriptions: Record<string, string> = {
  openid: "Verificar tu identidad",
  profile: "Leer la información de tu perfil",
  email: "Leer tu dirección de correo electrónico",
  offline_access: "Acceso en segundo plano (cuando no estás conectado)",
};

type DeviceInfo = {
  user_code: string;
  status: string;
  client_id?: string;
  scope?: string;
  resource?: string | string[];
};

function DeviceContent() {
  const router = useRouter();
  const [userCode, setUserCode] = useState("");
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [client, setClient] = useState<{
    client_name?: string;
    client_uri?: string;
    logo_uri?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  const scopes = useMemo(
    () => (device?.scope ? device.scope.split(" ").filter(Boolean) : []),
    [device],
  );

  const resources = useMemo(() => {
    const r = device?.resource;
    if (!r) return [];
    return Array.isArray(r) ? r : [r];
  }, [device]);

  const handleVerify = async () => {
    const code = userCode.trim();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/device?user_code=${encodeURIComponent(code)}`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 401) {
          router.replace(
            `/auth/sign-in?redirectTo=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }
        setError(
          data?.error_description ?? "Código inválido o expirado.",
        );
        return;
      }
      setDevice(data);
      if (data?.client_id) {
        const clientRes = await authClient.oauth2.publicClient({
          query: { client_id: data.client_id },
        });
        if (!clientRes.error && clientRes.data) {
          setClient(clientRes.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!device) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await authClient.device.approve({
        userCode: device.user_code,
      });
      if (error) {
        if (error.status === 401) {
          router.replace(
            `/auth/sign-in?redirectTo=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }
        setError(
          error.error_description ?? "No se pudo aprobar el acceso.",
        );
        return;
      }
      setApproved(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!device) return;
    setLoading(true);
    setError(null);
    try {
      await authClient.device.deny({ userCode: device.user_code });
      setDevice(null);
      setClient(null);
      setUserCode("");
    } catch {
      setError("No se pudo rechazar el acceso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      <GridPattern
        className={cn(
          "mask-[radial-gradient(300px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-70%] h-[200%] skew-y-12 scale-150 opacity-40 dark:opacity-80",
        )}
      />

      <div className="grid min-h-svh w-full grid-cols-1 absolute">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex w-full justify-between">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <CommandIcon className="size-4" />
              </div>
              ISC Gate
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <Avatar className="mx-auto size-14">
                  <AvatarFallback>
                    <LaptopIcon className="size-6" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-3 text-xl">
                  {approved
                    ? "Acceso autorizado"
                    : device
                      ? client
                        ? `${client.client_name || device.client_id} quiere acceder a tu cuenta`
                        : "Verifica el código antes de continuar"
                      : "Acceso de dispositivo"}
                </CardTitle>
                <CardDescription>
                  {approved
                    ? "Ya puedes volver a tu dispositivo y continuar."
                    : error ??
                      (device
                        ? "Revisa los permisos solicitados antes de continuar."
                        : "Ingresa el código que muestra tu dispositivo.")}
                </CardDescription>
              </CardHeader>

              {!approved && (
                <CardContent className="space-y-4">
                  {!device ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                        placeholder="Código de 8 caracteres"
                        className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-center font-mono text-lg tracking-[0.3em]"
                        autoFocus
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                      <Button
                        className="w-full"
                        disabled={loading || !userCode.trim()}
                        onClick={handleVerify}
                      >
                        {loading ? "Verificando..." : "Continuar"}
                      </Button>
                    </div>
                  ) : (
                    <>
                      {device?.client_id && (
                        <div className="rounded-md border p-3">
                          <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                            Permisos solicitados
                          </p>
                          <div className="flex flex-col gap-2">
                            {scopes.length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                Sin permisos adicionales.
                              </p>
                            )}
                            {scopes.map((scope) => (
                              <div
                                key={scope}
                                className="flex items-start gap-2 text-sm"
                              >
                                <ShieldCheckIcon className="text-primary mt-0.5 size-4 shrink-0" />
                                <div>
                                  <p className="font-mono text-xs font-medium">
                                    {scope}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {scopeDescriptions[scope] ??
                                      `Acceso al scope "${scope}".`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {resources.length > 0 && (
                            <div className="mt-3 border-t pt-3">
                              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                                Recurso protegido
                              </p>
                              {resources.map((resource) => (
                                <p
                                  key={resource}
                                  className="font-mono text-xs text-muted-foreground"
                                >
                                  {resource}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {client?.client_uri && (
                        <div className="flex justify-center">
                          <Link
                            href={client.client_uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
                          >
                            Sitio de la app
                            <ExternalLinkIcon className="size-3" />
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              )}

              {!approved && (
                <CardFooter className="flex flex-col gap-2">
                  {device ? (
                    <>
                      <Button
                        className="w-full"
                        disabled={loading}
                        onClick={handleApprove}
                      >
                        {loading ? "Procesando..." : "Autorizar"}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                        onClick={handleDeny}
                      >
                        Rechazar
                      </Button>
                      <Badge
                        variant="outline"
                        className="font-mono mt-1 text-[10px] text-muted-foreground"
                      >
                        {device.user_code}
                      </Badge>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      El código vence en unos minutos. Vuelve a solicitarlo si
                      expira.
                    </p>
                  )}
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DevicePage() {
  return <DeviceContent />;
}