import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Verificación en dos pasos — OAuth",
  description: "Confirma tu identidad para continuar con la autorización",
};

export default function AuthTwoFactorLayout({ children }: { children: ReactNode }) {
  return children;
}
