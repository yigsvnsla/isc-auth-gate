import ServerProviders from "./server-providers";
import ClientProviders from "./client-providers";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ServerProviders>
      <ClientProviders>
        {children}
      </ClientProviders>
    </ServerProviders>
  );
}
