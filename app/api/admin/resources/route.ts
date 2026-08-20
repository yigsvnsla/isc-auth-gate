import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const authorize = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { status: 401 as const, error: "Unauthorized" };
  }
  if (session.user.role !== "admin") {
    return { status: 403 as const, error: "Forbidden" };
  }
  return { status: 200 as const, error: null };
};

export async function GET() {
  const authz = await authorize();
  if (authz.status !== 200) {
    return Response.json({ error: authz.error }, { status: authz.status });
  }
  try {
    const resources = await auth.api.adminListOAuthResources({
      headers: await headers(),
    });
    return Response.json(resources);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to list resources" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const authz = await authorize();
  if (authz.status !== 200) {
    return Response.json({ error: authz.error }, { status: authz.status });
  }
  const body = await request.json().catch(() => null);
  if (!body || !body.identifier) {
    return Response.json({ error: "identifier is required" }, { status: 400 });
  }
  try {
    const created = await auth.api.adminCreateOAuthResource({
      headers: await headers(),
      body,
    });
    return Response.json(created, { status: 201 });
  } catch (error) {
    const status =
      typeof (error as { statusCode?: number }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 400;
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create resource" },
      { status },
    );
  }
}