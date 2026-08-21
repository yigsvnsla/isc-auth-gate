import { describe, it, expect } from "bun:test";
import { testAuth, lastInviteEmail } from "@/lib/auth.test";
import { cleanupTestDb } from "@/tests/database";

// Org invitation email nativo: al invitar, el hook sendInvitationEmail
// dispara con el correo y la organización. Warm-up: DB remota (~11s).
await cleanupTestDb();

describe("Organization invitation email (native plugin)", () => {
  async function ownerSession() {
    const ctx = await testAuth.$context;
    const email = `inv-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const signup = (await testAuth.api.signUpEmail({
      body: { email, password: "securepassword123", name: "Org Owner" },
    })) as { user?: { id: string } };
    const headers = (await ctx.test.login({ userId: signup.user!.id }))
      .headers as Headers;
    return { headers, email };
  }

  it("sends an invitation email on createInvitation", async () => {
    const { headers } = await ownerSession();
    const org = (await testAuth.api.createOrganization({
      body: { name: "Acme", slug: `acme-${Date.now()}` },
      headers,
    })) as { id?: string };
    expect(org.id).toBeDefined();

    const invited = `guest-${Date.now()}@example.com`;
    const res = await testAuth.api.createInvitation({
      body: {
        email: invited,
        role: "member",
        organizationId: org.id!,
      },
      headers,
    });
    expect((res as { error?: unknown }).error).toBeUndefined();
    expect(lastInviteEmail.email).toBe(invited);
    expect(lastInviteEmail.org).toBe("Acme");
  });
});
