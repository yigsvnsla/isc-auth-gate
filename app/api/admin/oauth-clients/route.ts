import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getOAuthClientsList } from "@/lib/kpi/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await getOAuthClientsList();
  return NextResponse.json({ clients });
}
