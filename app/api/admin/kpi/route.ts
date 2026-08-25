import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getKpiSummary } from "@/lib/kpi/queries";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { ts: number; data: unknown }>();

export async function GET(req: NextRequest) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get("clientId") || null;
  const cacheKey = clientId ?? "__global__";
  const now = Date.now();

  const hit = cache.get(cacheKey);
  if (hit && now - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json({ ...(hit.data as object), cached: true });
  }

  const data = await getKpiSummary(clientId ?? undefined);
  cache.set(cacheKey, { ts: now, data });
  return NextResponse.json(data);
}
