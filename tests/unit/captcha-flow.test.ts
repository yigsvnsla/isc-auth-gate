import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { env } from "@/env";
import { cleanupTestDb } from "@/tests/database";

// CAPTCHA nativo: feature flag + proveedor por env. Por defecto desactivado,
// así sign-up funciona sin token. Se valida el gate y que el sign-up no se
// ve afectado mientras está inerte.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Captcha (native plugin, feature-flag gated)", () => {
  it("is disabled by default (flag off / no secret)", () => {
    expect(env.BETTER_AUTH_CAPTCHA_ENABLED).toBe(false);
  });

  it("allows sign-up while captcha is inert", async () => {
    const email = `cap-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const res = await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "Captcha User" },
    });
    expect((res as { error?: unknown }).error).toBeUndefined();
    expect((res as { user?: { id?: string } }).user?.id).toBeDefined();
  });
});
