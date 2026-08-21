import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb, testDb } from "@/tests/database";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

// Last login method nativo: registra el método de acceso en el usuario.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Last login method (native plugin)", () => {
  const mkEmail = () => `llm-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

  it("records the login method after password sign-in", async () => {
    const email = mkEmail();
    await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "LLM User" },
    });

    // Sign-in real (no test.login) para que el plugin registre el método.
    await testAuth.api.signInEmail({ body: { email, password: "securepassword123" } });

    const [row] = await testDb
      .select({ lastLoginMethod: users.lastLoginMethod })
      .from(users)
      .where(eq(users.email, email));
    expect(row?.lastLoginMethod).toBeDefined();
    expect(typeof row?.lastLoginMethod).toBe("string");
  });
});
