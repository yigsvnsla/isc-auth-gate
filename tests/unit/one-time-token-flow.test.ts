import { describe, it, expect } from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

await cleanupTestDb();

describe("One-Time Token (OTT) Session Hardening Flow", () => {
  async function makeSession() {
    const email = `ott-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const password = "securepassword123";
    const signup = (await testAuth.api.signUpEmail({
      body: { email, name: "OTT User", password },
    })) as { user?: { id: string }; data?: { user?: { id: string } } };

    const userId = signup.user?.id ?? signup.data?.user?.id;
    if (!userId) throw new Error("signup failed");

    // Login to get headers/cookies
    const res = await testAuth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });
    const setCookie = res.headers.get("set-cookie");
    const headers = new Headers();
    if (setCookie) headers.set("cookie", setCookie);

    return { userId, email, password, headers };
  }

  it("generates a single-use token and verifies it successfully", async () => {
    const { headers } = await makeSession();

    // Generate OTT server-side
    const genRes = await testAuth.api.generateOneTimeToken({
      headers,
    });

    expect(genRes).toBeDefined();
    expect(genRes.token).toBeString();
    expect(genRes.token.length).toBeGreaterThan(10);

    const token = genRes.token;

    // Verify OTT
    const verifyRes = await testAuth.api.verifyOneTimeToken({
      body: { token },
    });

    expect(verifyRes).toBeDefined();
    expect(verifyRes.session).toBeDefined();
    expect(verifyRes.user).toBeDefined();
  });

  it("prevents re-use of a consumed token (single-use guarantee)", async () => {
    const { headers } = await makeSession();

    const genRes = await testAuth.api.generateOneTimeToken({
      headers,
    });
    const token = genRes.token;

    // First verification - consumes token
    await testAuth.api.verifyOneTimeToken({
      body: { token },
    });

    // Second verification - must fail
    expect(
      testAuth.api.verifyOneTimeToken({
        body: { token },
      }),
    ).rejects.toThrow();
  });

  it("rejects an invalid or fake token", async () => {
    expect(
      testAuth.api.verifyOneTimeToken({
        body: { token: "fake-invalid-ott-token-12345" },
      }),
    ).rejects.toThrow();
  });
});
