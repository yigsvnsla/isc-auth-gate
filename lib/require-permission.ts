import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requirePermission(permissions: Record<string, string[]>) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/auth/sign-in");
  try {
    const result = await auth.api.userHasPermission({ headers: h, body: { permissions } });
    if (result.error || !result.success) redirect("/auth/sign-in");
  } catch {
    redirect("/auth/sign-in");
  }
  return session;
}
