import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requirePermission(permissions: Record<string, string[]>) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/dashboard/login");
  try {
    const result = await auth.api.userHasPermission({ headers: h, body: { permissions } });
    if (result.error || !result.success) redirect("/dashboard/login");
  } catch {
    redirect("/dashboard/login");
  }
  return session;
}

export async function checkPermission(permissions: Record<string, string[]>): Promise<boolean> {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) return false;
  try {
    const result = await auth.api.userHasPermission({ headers: h, body: { permissions } });
    return result.success ?? false;
  } catch {
    return false;
  }
}
