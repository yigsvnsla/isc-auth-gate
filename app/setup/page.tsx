import { redirect } from "next/navigation";
import { CommandIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { env } from "@/env";
import { checkDatabase, needsSetup } from "@/lib/setup";
import { SetupForm } from "./setup-form";

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

  // ponytail: el panel de status muestra hechos, no diagnóstico — las env
  // vars MS/SMTP son requeridas por los schemas Zod (la app no arranca sin
  // ellas), así que si llegamos aquí están parseadas. Doble confirmación
  // barata y callback URL para copiar al portal de Azure.
  const microsoftCallbackUrl = `${env.BETTER_AUTH_URL.replace(/\/+$/, "")}/api/auth/callback/microsoft`;

  const status = [
    { label: "Base de datos", ok: dbOk },
    { label: "Microsoft OAuth", ok: Boolean(env.BETTER_AUTH_MICROSOFT_CLIENT_ID && env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET) },
    { label: "SMTP (correo)", ok: Boolean(env.BETTER_AUTH_SMTP_TRANSPORTER_HOST) },
  ];

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
          <section aria-label="Estado del sistema" className="border rounded-lg p-4 text-sm flex flex-col gap-2">
            {status.map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{label}</span>
                <span className={ok ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                  {ok ? "✓ Conectado" : "✗ Sin conexión"}
                </span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground break-all pt-2 border-t">
              Callback de Microsoft (regístralo en Azure Portal → Redirect URIs):{" "}
              <code className="font-mono">{microsoftCallbackUrl}</code>
            </p>
          </section>

          <SetupForm dbOk={dbOk} />
        </div>
      </div>
    </main>
  );
}
