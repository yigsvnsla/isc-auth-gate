import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Username es plugin nativo de Better Auth. Login por nombre de usuario
// además de email. Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Username login (native plugin)", () => {
  const mkEmail = () => `user-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

  it("signs up with a username", async () => {
    const email = mkEmail();
    const res = await testAuth.api.signUpEmail({
      body: {
        email,
        password: "securepassword123",
        name: "Jane",
        username: "jane_doe",
      },
    });
    expect((res as { error?: unknown }).error).toBeUndefined();
    expect((res as { user?: { username?: string } }).user?.username).toBe(
      "jane_doe",
    );
  });

  it("signs in with username + password", async () => {
    const email = mkEmail();
    await testAuth.api.signUpEmail({
      body: {
        email,
        password: "securepassword123",
        name: "Bob",
        username: "bob_smith",
      },
    });
    const login = await testAuth.api.signInUsername({
      body: { username: "bob_smith", password: "securepassword123" },
    });
    expect((login as { error?: unknown }).error).toBeUndefined();
    expect((login as { token?: string }).token).toBeDefined();
  });

  it("rejects duplicate username", async () => {
    const email = mkEmail();
    await testAuth.api.signUpEmail({
      body: {
        email,
        password: "securepassword123",
        name: "Dup",
        username: "dup_user",
      },
    });
    let err: unknown;
    try {
      await testAuth.api.signUpEmail({
        body: {
          email: mkEmail(),
          password: "securepassword123",
          name: "Dup2",
          username: "dup_user",
        },
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });

  it("rejects wrong password on username login", async () => {
    const email = mkEmail();
    await testAuth.api.signUpEmail({
      body: {
        email,
        password: "securepassword123",
        name: "NoPass",
        username: "nopass_user",
      },
    });
    let err: unknown;
    try {
      await testAuth.api.signInUsername({
        body: { username: "nopass_user", password: "wrongpass" },
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });
});
