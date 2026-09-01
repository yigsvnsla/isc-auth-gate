"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlertIcon, LogOutIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth/auth-client";

/**
 * Pantalla de acceso denegado (403 visual).
 * Renderizada directamente por el layout del dashboard cuando la sesión
 * existe pero el usuario no posee los permisos requeridos (RBAC).
 */
export function DashboardAccessDenied() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      router.push("/dashboard/login");
      router.refresh();
    }
  };

  return (
    <main className="relative flex min-h-svh flex-col p-6 md:p-10">
      <header className="absolute top-0 right-0 flex items-center p-6 md:p-10">
        <ThemeToggle />
      </header>
      <div className="flex flex-1">
        <Empty className="m-auto border-none">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
              <ShieldAlertIcon />
            </EmptyMedia>
            <EmptyTitle>Acceso denegado</EmptyTitle>
            <EmptyDescription>
              Tu cuenta no cuenta con los permisos requeridos para acceder al
              panel de administración. Contacta a un administrador del sistema
              si consideras que se trata de un error.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="w-full gap-2"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOutIcon />
              {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => router.push("/")}
            >
              <HomeIcon />
              Volver al inicio
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </main>
  );
}
