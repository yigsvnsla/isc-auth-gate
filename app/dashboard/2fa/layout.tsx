import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Verificación en dos pasos — Panel",
  description: "Confirma tu identidad para acceder al dashboard",
};

export default function DashboardTwoFactorLayout({ children }: { children: ReactNode }) {
  return children;
}
