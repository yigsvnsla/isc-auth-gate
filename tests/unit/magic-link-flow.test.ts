import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Magic link (passwordless) nativo: genera enlace, lo capturamos, verificamos.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Magic link (native plugin)", () => {
  const mkEmail = () => `ml-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

  async function sessionHeadersFor(email: string) {
    const ctx = await testAuth.$context;
    const signup = (await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "Magic User" },
    })) as { user?: { id: string } };
    return (await ctx.test.login({ userId: signup.user!.id })).headers as Headers;
  }

  it("signs in via a valid magic link token", async () => {
    const email = mkEmail();
    const headers = await sessionHeadersFor(email);
    const sent = await testAuth.api.signInMagicLink({ body: { email }, headers });
    expect((sent as { error?: unknown }).error).toBeUndefined();
    const verified = await testAuth.api.magicLinkVerify({
      query: { token: (await import("@/lib/auth.test")).lastMagicLink.token! },
      headers,
    });
    expect((verified as { error?: unknown }).error).toBeUndefined();
  });

  it("rejects an invalid magic link token", async () => {
    const email = mkEmail();
    const headers = await sessionHeadersFor(email);
    await testAuth.api.signInMagicLink({ body: { email }, headers });
    let err: unknown;
    try {
      await testAuth.api.magicLinkVerify({
        query: { token: "invalid-token" },
        headers,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });
});
