

"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Provider as JotaiProvider } from "jotai";
import { SWRConfig } from "swr";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
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
    </ThemeProvider>
  );
}
