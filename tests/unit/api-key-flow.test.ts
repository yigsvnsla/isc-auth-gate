import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// API Key es un plugin nativo de Better Auth (@better-auth/api-key).
// Los flujos create/verify/list/delete se ejercitan contra el server API.
// Warm-up: la DB es remota y la primera conexión del pool tarda ~11s.
await cleanupTestDb();

describe("API Key management (@better-auth/api-key)", () => {
  async function makeSession() {
    const ctx = await testAuth.$context;
    const email = `ak-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const signup = (await testAuth.api.signUpEmail({
      body: { email, name: "AK User", password: "securepassword123" },
    })) as { user?: { id: string }; data?: { user?: { id: string } } };
    const userId = signup.user?.id ?? signup.data?.user?.id;
    if (!userId) throw new Error("No userId from signup");
    const login = await ctx.test.login({ userId });
    return { headers: login.headers as Headers, userId };
  }

  it("creates an API key and returns the secret once", async () => {
    const { userId } = await makeSession();
    const res = await testAuth.api.createApiKey({
      body: { userId, name: "integration-key" },
    });
    expect(res.key).toBeDefined();
    expect(res.id).toBeDefined();
    expect(res.name).toBe("integration-key");
  });

  it("verifies a valid API key", async () => {
    const { userId } = await makeSession();
    const created = await testAuth.api.createApiKey({
      body: { userId, name: "verify-key" },
    });
    const verified = await testAuth.api.verifyApiKey({
      body: { key: created.key },
    });
    expect(verified.valid).toBe(true);
    expect(verified.key?.id).toBe(created.id);
  });

  it("lists the user's API keys", async () => {
    const { headers, userId } = await makeSession();
    const created = await testAuth.api.createApiKey({
      body: { userId, name: "list-key" },
    });
    const list = await testAuth.api.listApiKeys({ headers });
    const ids = (list as { apiKeys: { id: string }[] }).apiKeys.map(
      (k) => k.id,
    );
    expect(ids).toContain(created.id);
  });

  it("deletes an API key", async () => {
    const { headers, userId } = await makeSession();
    const created = await testAuth.api.createApiKey({
      body: { userId, name: "delete-key" },
    });
    const del = await testAuth.api.deleteApiKey({
      body: { keyId: created.id },
      headers,
    });
    expect((del as { success?: boolean }).success).toBe(true);

    const list = await testAuth.api.listApiKeys({ headers });
    const ids = (list as { apiKeys: { id: string }[] }).apiKeys.map(
      (k) => k.id,
    );
    expect(ids).not.toContain(created.id);
  });

  it("rejects an invalid API key on verify", async () => {
    const verified = await testAuth.api.verifyApiKey({
      body: { key: "not-a-real-key" },
    });
    expect(verified.valid).toBe(false);
  });
});
