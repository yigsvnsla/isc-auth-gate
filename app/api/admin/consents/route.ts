import { auth } from "@/lib/auth/auth";
import { db } from "@/database";
import { oauthConsents, oauthClients, users } from "@/database/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({
      id: oauthConsents.id,
      clientId: oauthConsents.clientId,
      clientName: oauthClients.name,
      userId: oauthConsents.userId,
      userEmail: users.email,
      userName: users.name,
      scopes: oauthConsents.scopes,
      createdAt: oauthConsents.createdAt,
      updatedAt: oauthConsents.updatedAt,
    })
    .from(oauthConsents)
    .leftJoin(oauthClients, eq(oauthConsents.clientId, oauthClients.clientId))
    .leftJoin(users, eq(oauthConsents.userId, users.id))
    .orderBy(desc(oauthConsents.createdAt));

  return Response.json(rows);
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = (await request.json()) as { id?: string };
  if (!id) {
    return Response.json({ error: "missing id" }, { status: 400 });
  }

  await db.delete(oauthConsents).where(eq(oauthConsents.id, id));
  return Response.json({ success: true });
}
