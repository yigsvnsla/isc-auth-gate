"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Provider as JotaiProvider } from "jotai";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
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
          {children}
          <Toaster />
        </JotaiProvider>
      </SWRConfig>
    </NextThemesProvider>
  );
}
