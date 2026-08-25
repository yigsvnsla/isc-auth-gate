import { GridPattern } from "@/components/ui/grid-pattern";
import { LoginForm } from "@/components/login-form";
import { cn } from "@/lib/utils";
import {
  CommandIcon,
  ShieldCheckIcon,
  KeyRoundIcon,
  BadgeCheckIcon,
  LockKeyholeIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { auth } from "@/lib/auth/auth";
import { headers as NextHeaders } from "next/headers";
import { redirect } from "next/navigation";

const TRUST_FEATURES = [
  { icon: BadgeCheckIcon, label: "Integrado con Microsoft 365" },
  { icon: KeyRoundIcon, label: "Inicio de sesión único (SSO)" },
  { icon: ShieldCheckIcon, label: "Protección con doble factor (2FA)" },
  { icon: LockKeyholeIcon, label: "Estándares abiertos (OpenID Connect)" },
];

export default async function LoginPage() {
  try {
    const headers = await NextHeaders();
    const session = await auth.api.getSession({ headers });
    if (session) redirect("/dashboard");
  } catch {
    // DB unreachable — show login page anyway
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-invert text-invert-foreground lg:flex lg:flex-col lg:justify-between p-10 xl:p-14">
        <GridPattern
          className={cn(
            "mask-[radial-gradient(400px_circle_at_center,white,transparent)]",
            "absolute inset-0 h-full w-full opacity-20",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent" />

        <div className="relative flex items-center gap-2 font-semibold tracking-tight">
          <div className="bg-invert-foreground text-invert flex aspect-square size-8 items-center justify-center rounded-lg">
            <CommandIcon className="size-4" />
          </div>
          ISC Gate
        </div>

        <div className="relative space-y-6">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Tu identidad,
            <br />
            un solo punto de acceso.
          </h2>
          <p className="max-w-md text-balance text-invert-foreground/70">
            ISC Auth Gate centraliza y protege el acceso a tus aplicaciones
            internas y de terceros mediante Microsoft 365.
          </p>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TRUST_FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm text-invert-foreground/80"
              >
                <span className="flex size-7 items-center justify-center rounded-md bg-white/10">
                  <Icon className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-invert-foreground/50">
          © 2026 ISC. Acceso gestionado, auditado y conforme a estándares
          abiertos.
        </p>
      </aside>

      <main className="flex flex-col gap-4 p-6 md:p-10">
        <header className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 font-semibold lg:hidden">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <CommandIcon className="size-4" />
            </div>
            ISC Gate
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-500 motion-reduce:animate-none">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
