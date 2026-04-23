
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Provider as JotaiProvider } from "jotai";
import { SWRConfig } from "swr";
import { SidebarProvider } from "./ui/sidebar";
import { cookies } from "next/headers";

export default async function Providers({ children }: { children: React.ReactNode }) {

  const cookieStore = await cookies();
  const defaultOpen = Boolean(cookieStore.get("sidebar_state")?.value);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
    >
      <SWRConfig>
        <JotaiProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            {children}
          </SidebarProvider>
          <Toaster />
        </JotaiProvider>
      </SWRConfig>
    </NextThemesProvider>
  );
}
