import "./globals.css";
import Providers from "@/components/providers";
import { fontSans } from "@/lib/fonts/sans";
import { fontMono } from "@/lib/fonts/mono";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
