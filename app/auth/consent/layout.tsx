import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autorización - ISC Auth",
  description: "Autoriza una aplicación de terceros",
};

export default function ConsentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
