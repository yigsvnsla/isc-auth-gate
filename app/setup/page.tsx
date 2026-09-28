import { redirect } from "next/navigation";
import { CommandIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { env } from "@/env";
import { microsoftConfigured, smtpConfigured } from "@/lib/providers";
import { checkDatabase, needsSetup } from "@/lib/setup";
import { SetupForm } from "./setup-form";

// export const dynamic = "force-dynamic";

/**
 * Pantalla de setup inicial (primer arranque tras deploy).
 *
 * Solo accesible mientras NO exista ningún admin: después redirige a
 * /auth/sign-in. El formulario crea el primer admin + organización vía
 * server action (`actions.ts`), sin pasar por el flujo de email/SMTP.
 */
export default async function SetupPage() {
  if (!(await needsSetup())) redirect("/auth/sign-in");

  const dbOk = await checkDatabase();

  // Microsoft y SMTP son opcionales (lib/providers.ts): "no configurado" no es
  // un fallo de salud, así que el panel muestra tres estados, no dos.
  const status = [
    {
      label: "Base de datos",
      state: dbOk ? ("ok" as const) : ("error" as const),
      detail: dbOk ? "Conectada" : "Sin respuesta",
    },
    {
      label: "Microsoft OAuth",
      state: microsoftConfigured ? ("ok" as const) : ("off" as const),
      detail: microsoftConfigured ? "Configurado" : "No configurado",
    },
    {
      label: "SMTP (correo)",
      state: smtpConfigured ? ("ok" as const) : ("off" as const),
      detail: smtpConfigured ? "Configurado" : "No configurado",
    },
  ];

  // Callback de Azure: solo tiene sentido si el provider está habilitado.
  const microsoftCallbackUrl = `${env.BETTER_AUTH_URL.replace(/\/+$/, "")}/api/auth/callback/microsoft`;

  return (
    <main className="flex min-h-svh flex-col gap-6 p-6 md:p-10">
      <header className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <CommandIcon className="size-4" />
          </div>
          ISC Gate — Configuración inicial
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500 motion-reduce:animate-none flex flex-col gap-6">
          <section
            aria-label="Estado del sistema"
            className="border rounded-lg p-4 text-sm flex flex-col gap-2"
          >
            {status.map(({ label, state, detail }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-muted-foreground">{label}</span>
                <span
                  className={
                    state === "ok"
                      ? "text-green-600 dark:text-green-400"
                      : state === "off"
                        ? "text-muted-foreground"
                        : "text-destructive"
                  }
                >
                  {state === "ok" ? "✓" : state === "off" ? "○" : "✗"} {detail}
                </span>
              </div>
            ))}
            {microsoftConfigured ? (
              <p className="text-xs text-muted-foreground break-all pt-2 border-t">
                Callback de Microsoft (regístralo en Azure Portal → Redirect
                URIs): <code className="font-mono">{microsoftCallbackUrl}</code>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Microsoft OAuth y SMTP son opcionales por ahora. El admin puede
                entrar con correo y contraseña; habilítalos después en las
                variables de entorno del deploy.
              </p>
            )}
          </section>

          <SetupForm dbOk={dbOk} />
        </div>
      </div>
    </main>
  );
}
