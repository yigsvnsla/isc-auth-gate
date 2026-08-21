import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Bearer auth nativo: `Authorization: Bearer <token>` autentica la sesión.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Bearer token auth (native plugin)", () => {
  async function sessionTokenFor() {
    const ctx = await testAuth.$context;
    const email = `br-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const signup = (await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "Bearer User" },
    })) as { user?: { id: string } };
    const login = await ctx.test.login({ userId: signup.user!.id });
    const token = (login as { token?: string }).token ?? "";
    return token;
  }

  it("authenticates a request via Authorization: Bearer <token>", async () => {
    const token = await sessionTokenFor();
    const session = (await testAuth.api.getSession({
      headers: new Headers({ authorization: `Bearer ${token}` }),
    })) as { user?: { id?: string } } | null;
    expect(session?.user?.id).toBeDefined();
  });

  it("rejects an invalid bearer token (no session)", async () => {
    const session = await testAuth.api.getSession({
      headers: new Headers({ authorization: "Bearer not-a-real-token" }),
    });
    expect(session).toBeNull();
  });
});
