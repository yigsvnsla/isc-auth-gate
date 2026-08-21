import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Session management (core): listar y revocar sesiones.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Session management (list + revoke)", () => {
  async function sessionHeadersFor() {
    const ctx = await testAuth.$context;
    const email = `ss-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const signup = (await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "Session User" },
    })) as { user?: { id: string } };
    return (await ctx.test.login({ userId: signup.user!.id })).headers as Headers;
  }

  it("lists sessions and revokes others", async () => {
    const headers = await sessionHeadersFor();
    const list = (await testAuth.api.listSessions({ headers })) as {
      token: string;
    }[];
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);

    const revoked = await testAuth.api.revokeOtherSessions({ headers });
    expect((revoked as { error?: unknown }).error).toBeUndefined();
  });
});
