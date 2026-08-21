import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// HaveIBeenPwned nativo: en tests queda inerte (enabled:false) para no
// depender de red ni bloquear otros sign-ups. Se valida que el plugin está
// cableado y el sign-up no se ve afectado.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("HaveIBeenPwned (native plugin, wired)", () => {
  const mkEmail = () => `hibp-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

  it("allows sign-up with the plugin registered (inert in tests)", async () => {
    const res = await testAuth.api.signUpEmail({
      body: {
        email: mkEmail(),
        password: "a-strong-uniqu3-pass!",
        name: "HIBP User",
      },
    });
    expect((res as { error?: unknown }).error).toBeUndefined();
    expect((res as { user?: { id?: string } }).user?.id).toBeDefined();
  });

  it("does not block a commonly-breached password while inert", async () => {
    const res = await testAuth.api.signUpEmail({
      body: {
        email: mkEmail(),
        password: "password123",
        name: "HIBP Weak",
      },
    });
    expect((res as { error?: unknown }).error).toBeUndefined();
    expect((res as { user?: { id?: string } }).user?.id).toBeDefined();
  });
});
