import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Org-owned API keys: misma tabla `apikeys`, pero el plugin nativo las
// etiqueta con el organizationId en `metadata`. Los flujos siguen siendo
// nativos (create/list/verify). Warm-up: DB remota (~11s la 1ra conexión).
await cleanupTestDb();

describe("Org-owned API keys (native plugin + metadata)", () => {
  const orgId = `org_${Date.now()}`;

  async function makeSession() {
    const ctx = await testAuth.$context;
    const email = `oak-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const signup = (await testAuth.api.signUpEmail({
      body: { email, name: "OAK User", password: "securepassword123" },
    })) as { user?: { id: string } };
    const userId = signup.user!.id;
    const login = await ctx.test.login({ userId });
    return { headers: login.headers as Headers, userId };
  }

  it("creates an org-scoped API key with metadata.organizationId", async () => {
    const { userId } = await makeSession();
    const res = await testAuth.api.createApiKey({
      body: {
        userId,
        name: "org-key",
        metadata: { organizationId: orgId },
      },
    });
    expect(res.key).toBeDefined();
    expect((res as { metadata?: { organizationId?: string } }).metadata?.organizationId).toBe(
      orgId,
    );
  });

  it("verifies an org-scoped API key", async () => {
    const { userId } = await makeSession();
    const created = await testAuth.api.createApiKey({
      body: { userId, name: "org-verify", metadata: { organizationId: orgId } },
    });
    const verified = await testAuth.api.verifyApiKey({ body: { key: created.key } });
    expect(verified.valid).toBe(true);
    expect(
      (verified.key as { metadata?: { organizationId?: string } })?.metadata
        ?.organizationId,
    ).toBe(orgId);
  });
});
