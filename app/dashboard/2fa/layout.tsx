import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandIcon } from "lucide-react";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Verificación en dos pasos — Panel",
  description: "Confirma tu identidad para acceder al dashboard",
};

export default function DashboardTwoFactorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col ">
      {/* Identificador de marca / Logo */}
      <header className="flex w-full items-center justify-between p-6 absolute top-0 left-0 z-10 md:p-10">
        <div className="flex items-center gap-2 font-semibold">
          <div className="bg-accent flex aspect-square size-8 items-center justify-center rounded-lg">
            <CommandIcon className="size-4" />
          </div>
          ISC Gate — Panel
        </div>
        <ThemeToggle />
      </header>
      {children}
    </main>
  );
}
