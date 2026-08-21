import { describe, it, expect } from "bun:test";
import { testAuth, lastEmailOtp } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Email OTP (passwordless) nativo: envía OTP por email, luego sign-in con el OTP.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Email OTP (native plugin)", () => {
  const mkEmail = () => `otp-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

  it("signs in with a valid emailed OTP", async () => {
    const email = mkEmail();
    await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "OTP Signin" },
    });
    const sent = await testAuth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
    expect((sent as { error?: unknown }).error).toBeUndefined();
    expect(lastEmailOtp.code).toBeDefined();
    const signed = await testAuth.api.signInEmailOTP({
      body: { email, otp: lastEmailOtp.code! },
    });
    expect((signed as { error?: unknown }).error).toBeUndefined();
    expect((signed as { token?: string }).token).toBeDefined();
  });

  it("rejects an invalid OTP", async () => {
    const email = mkEmail();
    await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "OTP Bad" },
    });
    await testAuth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
    let err: unknown;
    try {
      await testAuth.api.signInEmailOTP({ body: { email, otp: "000000" } });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });
});
