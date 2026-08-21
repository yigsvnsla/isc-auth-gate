import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Phone number es plugin nativo. Registro del campo + envío/verificación OTP.
// Warm-up: DB remota, primera conexión del pool ~11s.
await cleanupTestDb();

describe("Phone number (native plugin)", () => {
  const mkEmail = () => `ph-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const mkPhone = () => `+57300${Math.floor(1000000 + Math.random() * 8999999)}`;

  it("stores phone number on sign-up", async () => {
    const phone = mkPhone();
    const res = await testAuth.api.signUpEmail({
      body: {
        email: mkEmail(),
        password: "securepassword123",
        name: "Phone User",
        phoneNumber: phone,
      },
    });
    expect((res as { error?: unknown }).error).toBeUndefined();
    expect((res as { user?: { phoneNumber?: string } }).user?.phoneNumber).toBe(
      phone,
    );
  });

  it("sends OTP to a phone number", async () => {
    const phone = mkPhone();
    const email = mkEmail();
    await testAuth.api.signUpEmail({
      body: {
        email,
        password: "securepassword123",
        name: "OTP User",
        phoneNumber: phone,
      },
    });
    const otp = await testAuth.api.sendPhoneNumberOTP({
      body: { phoneNumber: phone },
    });
    expect((otp as { error?: unknown }).error).toBeUndefined();
  });

  it("rejects verification with wrong OTP", async () => {
    const phone = mkPhone();
    const email = mkEmail();
    await testAuth.api.signUpEmail({
      body: {
        email,
        password: "securepassword123",
        name: "Verify User",
        phoneNumber: phone,
      },
    });
    await testAuth.api.sendPhoneNumberOTP({ body: { phoneNumber: phone } });
    let err: unknown;
    try {
      await testAuth.api.verifyPhoneNumber({
        body: { phoneNumber: phone, code: "000000" },
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });
});
