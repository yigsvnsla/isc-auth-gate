"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlertIcon, LogOutIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth/auth-client";

export default function DashboardUnauthorizedPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/dashboard/login");
          },
        },
      });
    } catch {
      router.push("/dashboard/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="relative flex min-h-svh flex-col p-6 md:p-10">
      <header className="absolute top-0 left-0 flex w-full items-center justify-between p-6 md:p-10">
        <ThemeToggle />
      </header>

      <div className="flex flex-1">
        <div className="m-auto w-full max-w-md">
          <Card className="border-destructive/20 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlertIcon className="size-6" />
              </div>
              <CardTitle className="text-xl">Acceso Denegado</CardTitle>
              <CardDescription className="text-balance">
                Tu cuenta no cuenta con los permisos requeridos para acceder al panel de administración.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Contacta a un administrador del sistema si consideras que se trata de un error.
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                variant="default"
                className="w-full gap-2"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOutIcon className="size-4" />
                {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión e iniciar con otra cuenta"}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => router.push("/")}
              >
                <ArrowLeftIcon className="size-4" />
                Volver al inicio
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
