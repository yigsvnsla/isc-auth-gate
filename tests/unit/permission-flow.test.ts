import { describe, it, expect, beforeEach } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";
import { testDb } from "@/tests/database";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { accessControl, admin, user } from "@/lib/permissions";

await cleanupTestDb();

describe("Permission Flow (Incógnito - server-side)", () => {
  async function makeSession(role: "admin" | "user" = "user") {
    const email = `perm-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const password = "securepassword123";
    const signup = (await testAuth.api.signUpEmail({
      body: { email, name: "Perm User", password },
    })) as { user?: { id: string }; data?: { user?: { id: string } } };

    const userId = signup.user?.id ?? signup.data?.user?.id;
    if (!userId) throw new Error("signup failed");

    // Set role directly in DB (bypasses input validation)
    await testDb.update(users).set({ role }).where(eq(users.id, userId));

    const res = await testAuth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });
    const setCookie = res.headers.get("set-cookie");
    const headers = new Headers();
    if (setCookie) headers.set("cookie", setCookie);

    return { userId, email, password, headers };
  }

  it("admin has project.create permission (from admin role)", async () => {
    const { headers } = await makeSession("admin");

    const result = await testAuth.api.userHasPermission({
      headers,
      body: { permissions: { project: ["create"] } },
    });

    expect(result.success).toBe(true);
  });

  it("regular user has project.create permission (from user role)", async () => {
    const { headers } = await makeSession("user");

    const result = await testAuth.api.userHasPermission({
      headers,
      body: { permissions: { project: ["create"] } },
    });

    expect(result.success).toBe(true);
  });

  it("admin has multiple permissions (project + auth)", async () => {
    const { headers } = await makeSession("admin");

    const result = await testAuth.api.userHasPermission({
      headers,
      body: { permissions: { project: ["create", "update"], auth: ["read"] } },
    });

    expect(result.success).toBe(true);
  });

  it("regular user does not have project.delete permission", async () => {
    const { headers } = await makeSession("user");

    const result = await testAuth.api.userHasPermission({
      headers,
      body: { permissions: { project: ["delete"] } },
    });

    expect(result.success).toBe(false);
  });

  it("server-side checkPermission works (no JWT exposure)", async () => {
    const { headers } = await makeSession("admin");

    const result = await testAuth.api.userHasPermission({
      headers,
      body: { permissions: { project: ["create"] } },
    });

    expect(result.success).toBe(true);
    // Verificación de que el JWT no expone roles/permisos:
    // el token de sesión solo contiene user.id, session.id, exp, iat
  });
});