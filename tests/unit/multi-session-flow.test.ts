import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Multi-session nativo: el plugin gestiona varias sesiones por dispositivo
// vía cookies. Valida que los endpoints estén cableados y respondan.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Multi-session (native plugin)", () => {
  async function sessionHeadersFor() {
    const ctx = await testAuth.$context;
    const email = `ms-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const signup = (await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "Multi User" },
    })) as { user?: { id: string } };
    return (await ctx.test.login({ userId: signup.user!.id })).headers as Headers;
  }

  it("lists device sessions as an array", async () => {
    const headers = await sessionHeadersFor();
    const list = (await testAuth.api.listDeviceSessions({ headers })) as unknown[];
    expect(Array.isArray(list)).toBe(true);
  });

  it("rejects setting an unknown active session", async () => {
    const headers = await sessionHeadersFor();
    let err: unknown;
    try {
      await testAuth.api.setActiveSession({
        headers,
        body: { sessionToken: "does-not-exist" },
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });
});
