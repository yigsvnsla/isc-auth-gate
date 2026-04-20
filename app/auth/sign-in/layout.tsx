import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión - ISC Auth",
  description: "Inicia sesión en tu cuenta de ISC Auth",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
