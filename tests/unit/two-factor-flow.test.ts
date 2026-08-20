import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";
import { base32 } from "@better-auth/utils/base32";

const decodeTotpSecret = (totpURI: string) =>
  new TextDecoder().decode(base32.decode(new URL(totpURI).searchParams.get("secret")!));

// Los endpoints twoFactor son nativos de Better Auth. getTOTPURI + generateTOTP
// (server-only) se usan para derivar un código TOTP válido en el test sin
// implementar TOTP a mano.
// Warm-up: la DB es remota y la primera conexión del pool tarda ~11s.
await cleanupTestDb();

describe("Two-Factor Authentication (RFC 6238 + OTP + backup)", () => {
  const enable = (h: Headers, password: string) =>
    testAuth.api.enableTwoFactor({ headers: h, body: { password } });
  const verifyTotp = (h: Headers, code: string) =>
    testAuth.api.verifyTOTP({ headers: h, body: { code, trustDevice: true } });
  const disable = (h: Headers, password: string) =>
    testAuth.api.disableTwoFactor({ headers: h, body: { password } });

  async function makeSession() {
    const ctx = await testAuth.$context;
    const email = `2fa-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const signup = (await testAuth.api.signUpEmail({
      body: { email, name: "2FA User", password: "securepassword123" },
    })) as { user?: { id: string }; data?: { user?: { id: string } } };
    const userId = signup.user?.id ?? signup.data?.user?.id;
    const login = await ctx.test.login({ userId });
    return { headers: login.headers as Headers, userId };
  }

  it("enables 2FA and returns TOTP URI + backup codes", async () => {
    const { headers } = await makeSession();
    const en = await enable(headers, "securepassword123");
    expect(en.error).toBeUndefined();
    expect(en.totpURI).toContain("otpauth://totp/");
    expect(en.backupCodes).toHaveLength(10);
  });

  it("verifies a TOTP code and marks the user as 2FA-enabled", async () => {
    const { headers, userId } = await makeSession();
    const en = await enable(headers, "securepassword123");
    const totp = await testAuth.api.generateTOTP({
      body: { secret: decodeTotpSecret(en.totpURI) },
    });
    expect(totp.code).toBeDefined();

    await verifyTotp(headers, totp.code);
    const freshHeaders = (await (await testAuth.$context).test.login({ userId }))
      .headers as Headers;
    const session = await testAuth.api.getSession({ headers: freshHeaders });
    expect(session?.user.twoFactorEnabled).toBe(true);
  });

  it("verifies a backup code", async () => {
    const { headers } = await makeSession();
    const en = await enable(headers, "securepassword123");
    const { error } = await testAuth.api.verifyBackupCode({
      headers,
      body: { code: en.backupCodes[0], trustDevice: true },
    });
    expect(error).toBeUndefined();
  });

  it("rejects a wrong TOTP code", async () => {
    const { headers } = await makeSession();
    await enable(headers, "securepassword123");
    let err: unknown;
    try {
      await verifyTotp(headers, "000000");
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });

  it("disables 2FA with the password", async () => {
    const { headers, userId } = await makeSession();
    const en = await enable(headers, "securepassword123");
    const totp = await testAuth.api.generateTOTP({
      body: { secret: decodeTotpSecret(en.totpURI) },
    });
    await verifyTotp(headers, totp.code);

    const freshHeaders = (await (await testAuth.$context).test.login({ userId }))
      .headers as Headers;
    const dis = await disable(freshHeaders, "securepassword123");
    expect(dis.error).toBeUndefined();
    const afterHeaders = (await (await testAuth.$context).test.login({ userId }))
      .headers as Headers;
    const session = await testAuth.api.getSession({ headers: afterHeaders });
    expect(session?.user.twoFactorEnabled).toBe(false);
  });
});
