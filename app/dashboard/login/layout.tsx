import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import {
  CommandIcon,
  ShieldCheckIcon,
  LayoutDashboardIcon,
  UsersIcon,
  SettingsIcon,
} from "lucide-react";
import { ReactNode } from "react";

interface DashboardLoginLayoutProps {
  children: ReactNode;
}

/**
 * Lista de características destacadas que se renderizan
 * en el panel lateral decorativo de la pantalla de inicio de sesión.
 */
const DASHBOARD_FEATURES = [
  { icon: LayoutDashboardIcon, label: "Panel de administración central" },
  { icon: UsersIcon, label: "Gestión de usuarios y organizaciones" },
  { icon: ShieldCheckIcon, label: "Control de acceso y auditoría" },
  { icon: SettingsIcon, label: "Configuración de OAuth y recursos" },
];

/**
 * Metadata predeterminada para el módulo de inicio de sesión.
 */
export const metadata: Metadata = {
  title: "Panel — Iniciar sesión",
  description: "Accede al panel de administración de ISC Auth Gate",
};

/**
 * Layout contenedor para las pantallas de autenticación del panel de administración.
 *
 * Muestra una vista dividida en pantallas grandes: un panel promocional e informativo a la izquierda
 * y el contenido principal (ej. `DashboardLoginPage`) en la columna derecha.
 *
 * @param children Contenido dinámico a renderizar en la columna derecha.
 */
export default function DashboardLoginLayout({ children }: DashboardLoginLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Columna Izquierda: Panel lateral decorativo (Oculto en dispositivos móviles) */}
      <aside className="relative hidden overflow-hidden bg-invert text-invert-foreground lg:flex lg:flex-col lg:justify-between p-10 xl:p-14 rounded-r-2xl">
        {/* Patrón de cuadrícula decorativo con degradado radial */}
        <GridPattern
          className={cn(
            "mask-[radial-gradient(400px_circle_at_center,white,transparent)]",
            "absolute inset-0 h-full w-full opacity-20",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent" />

        {/* Identificador de marca / Logo */}
        <div className="relative flex items-center gap-2 font-semibold tracking-tight">
          <div className="bg-invert-foreground text-invert flex aspect-square size-8 items-center justify-center rounded-lg">
            <CommandIcon className="size-4" />
          </div>
          ISC Gate — Panel
        </div>

        {/* Sección informativa y lista de funcionalidades */}
        <div className="relative space-y-6">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Administración
            <br />
            centralizada.
          </h2>
          <p className="max-w-md text-balance text-invert-foreground/70">
            Gestiona usuarios, organizaciones, clientes OAuth y recursos desde un único panel seguro.
          </p>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DASHBOARD_FEATURES.map(({ icon: Icon, label }) => (
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

        {/* Pie de página con aviso de derechos y seguridad */}
        <p className="relative text-xs text-invert-foreground/50">
          © 2026 ISC. Acceso restringido a administradores.
        </p>
      </aside>

      {/* Columna Derecha: Renderizado del formulario u otro contenido de autenticación */}
      {children}
    </div>
  );
}