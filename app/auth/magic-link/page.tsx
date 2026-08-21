"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { CommandIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function MagicLinkPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!email) return toast.error("Ingresa tu correo");
    setLoading(true);
    const { error } = await authClient.signIn.magicLink({ email });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Enlace enviado. Revisa tu correo para acceder.");
    router.push("/dashboard");
  }

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
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <CommandIcon className="size-4" />
              </div>
              ISC Gate
            </a>
            <ThemeToggle />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs space-y-4">
              <div className="space-y-1">
                <h1 className="text-xl font-semibold">Enlace mágico</h1>
                <p className="text-sm text-muted-foreground">
                  Te enviaremos un enlace para iniciar sesión sin contraseña.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={send} disabled={loading}>
                Enviar enlace
              </Button>
              <a href="/auth/sign-in" className="block text-center text-sm text-muted-foreground hover:underline">
                Volver al inicio de sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
