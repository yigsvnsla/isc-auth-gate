import { redirect } from "next/navigation";
import { needsSetup } from "@/lib/setup";

// ponytail: si la instancia no tiene admin todavía, primer arranque → /setup.
export default async function Page() {
  if (await needsSetup()) redirect("/setup");
  redirect("/dashboard", "replace");
}
