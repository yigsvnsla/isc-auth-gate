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

const errorStatus = (error: unknown) =>
  typeof (error as { statusCode?: number }).statusCode === "number"
    ? (error as { statusCode: number }).statusCode
    : 400;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ identifier: string }> },
) {
  const authz = await authorize();
  if (authz.status !== 200) {
    return Response.json({ error: authz.error }, { status: authz.status });
  }
  const { identifier } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }
  try {
    const updated = await auth.api.adminUpdateOAuthResource({
      headers: await headers(),
      params: { identifier },
      body,
    });
    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update resource" },
      { status: errorStatus(error) },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ identifier: string }> },
) {
  const authz = await authorize();
  if (authz.status !== 200) {
    return Response.json({ error: authz.error }, { status: authz.status });
  }
  const { identifier } = await params;
  try {
    const deleted = await auth.api.adminDeleteOAuthResource({
      headers: await headers(),
      params: { identifier },
    });
    return Response.json(deleted);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete resource" },
      { status: errorStatus(error) },
    );
  }
}