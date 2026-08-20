import { describe, it, expect, beforeEach, afterEach, beforeAll } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Los endpoints de resources son SERVER_ONLY: no se exponen vía HTTP handler,
// se invocan server-side con `auth.api.*` (igual que hacen los route handlers
// de producción en app/api/admin/resources).
// Warm-up: la DB es remota y la primera conexión del pool tarda ~11s.
await cleanupTestDb();

describe("OAuth Resources (RFC 8707)", () => {
  let testHelpers: Awaited<typeof testAuth.$context>["test"];
  let adminHeaders: Headers;
  let userHeaders: Headers;

  const create = (headers: Headers, identifier: string, extra: Record<string, unknown> = {}) =>
    testAuth.api.adminCreateOAuthResource({
      headers,
      body: { identifier, ...extra },
    });
  const list = (headers: Headers) => testAuth.api.adminListOAuthResources({ headers });
  const update = (headers: Headers, identifier: string, body: Record<string, unknown>) =>
    testAuth.api.adminUpdateOAuthResource({ headers, params: { identifier }, body });
  const remove = (headers: Headers, identifier: string) =>
    testAuth.api.adminDeleteOAuthResource({ headers, params: { identifier } });

  beforeAll(async () => {
    testHelpers = (await testAuth.$context).test;
  });

  beforeEach(async () => {
    await cleanupTestDb();
    const admin = testHelpers.createUser({
      email: "resource-admin@example.com",
      name: "Resource Admin",
      role: "admin",
    });
    await testHelpers.saveUser(admin);
    adminHeaders = (await testHelpers.login({ userId: admin.id })).headers as Headers;

    const user = testHelpers.createUser({
      email: "resource-user@example.com",
      name: "Resource User",
      role: "user",
    });
    await testHelpers.saveUser(user);
    userHeaders = (await testHelpers.login({ userId: user.id })).headers as Headers;
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  it("creates a resource via admin API", async () => {
    const resource = await create(adminHeaders, "https://api.example.com", {
      name: "Example API",
      allowedScopes: ["user:read", "user:write"],
    });
    expect(resource.identifier).toBe("https://api.example.com");
    expect(resource.allowedScopes).toContain("user:read");
  });

  it("lists created resources", async () => {
    await create(adminHeaders, "https://api.example.com");
    const resources = await list(adminHeaders);
    expect(Array.isArray(resources)).toBe(true);
    expect(resources.some((r) => r.identifier === "https://api.example.com")).toBe(
      true,
    );
  });

  it("updates a resource via PATCH", async () => {
    await create(adminHeaders, "https://api.example.com");
    const updated = await update(adminHeaders, "https://api.example.com", {
      name: "Renamed API",
      disabled: true,
    });
    expect(updated.name).toBe("Renamed API");
    expect(updated.disabled).toBe(true);
  });

  it("deletes a resource via DELETE", async () => {
    await create(adminHeaders, "https://api.example.com");
    await remove(adminHeaders, "https://api.example.com");
    const resources = await list(adminHeaders);
    expect(
      resources.some((r) => r.identifier === "https://api.example.com"),
    ).toBe(false);
  });

  it("rejects non-admin create with 401", async () => {
    let caught: unknown;
    try {
      await create(userHeaders, "https://evil.example.com");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeDefined();
    const err = caught as { status?: number | string; statusCode?: number; message?: string };
    expect(
      err.statusCode === 401 ||
        err.status === 401 ||
        /unauthoriz/i.test(String(err.status ?? err.message)),
    ).toBe(true);
  });

  it("rejects unauthenticated create with 401", async () => {
    let caught: unknown;
    try {
      await create(new Headers(), "https://anon.example.com");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeDefined();
    const err = caught as { status?: number | string; statusCode?: number; message?: string };
    expect(
      err.statusCode === 401 ||
        err.status === 401 ||
        /unauthoriz/i.test(String(err.status ?? err.message)),
    ).toBe(true);
  });
});