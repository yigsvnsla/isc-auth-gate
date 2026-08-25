"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from "lucide-react";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const initialStatus = token ? "loading" : "error";
  const initialMessage = token ? "" : "No se proporcionó ningún token en el enlace.";

  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    initialStatus,
  );
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    authClient.oneTimeToken
      .verify({ token })
      .then((res) => {
        if (!isMounted) return;
        if (res.error) {
          setStatus("error");
          setMessage(
            res.error.message ||
              "El token es inválido, ha expirado o ya fue consumido.",
          );
        } else {
          setStatus("ok");
          setMessage("Sesión re-autenticada y verificada exitosamente.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Error al verificar el token de un solo uso.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            {status === "loading" && <Loader2 className="size-5 animate-spin text-primary" />}
            {status === "ok" && <ShieldCheck className="size-5 text-green-600" />}
            {status === "error" && <ShieldAlert className="size-5 text-destructive" />}
            Verificación OTT
          </CardTitle>
          <CardDescription>
            Token de un solo uso (One-Time Token)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          {status === "loading" && (
            <p className="text-sm text-muted-foreground">
              Verificando y consumiendo el token de un solo uso…
            </p>
          )}

          {status === "ok" && (
            <>
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                {message}
              </p>
              <p className="text-xs text-muted-foreground">
                Este token ha sido consumido de forma única y no podrá volver a utilizarse.
              </p>
              <Button onClick={() => router.push("/dashboard")} className="mt-2 w-full">
                Ir al Dashboard <ArrowRight className="ml-2 size-4" />
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-sm text-destructive font-medium">{message}</p>
              <p className="text-xs text-muted-foreground">
                Por seguridad, los tokens OTT son de un solo uso y expiran en 10 minutos.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/settings/sessions")}
                className="mt-2 w-full"
              >
                Volver a Sesiones
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OneTimeTokenVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 text-center">
            <p className="text-sm text-muted-foreground">Cargando verificación…</p>
          </Card>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
