import { redirect } from "next/navigation";
import { needsSetup } from "@/lib/setup";

// Sin esto Next prerenderiza en build: needsSetup() falla contra el placeholder
// de build y el redirect a /setup queda horneado en el HTML estático.
export const dynamic = "force-dynamic";

// ponytail: si la instancia no tiene admin todavía, primer arranque → /setup.
export default async function Page() {
  if (await needsSetup()) redirect("/setup");
  redirect("/dashboard", "replace");
}
