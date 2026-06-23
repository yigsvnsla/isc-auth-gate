'use server'

import type { ReactNode } from 'react'
import { SidebarProvider } from "./ui/sidebar";
import { cookies } from "next/headers";

export default async function ServerProviders({ children }: { children: ReactNode }) {

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
            
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {children}
    </SidebarProvider>
  )
}
