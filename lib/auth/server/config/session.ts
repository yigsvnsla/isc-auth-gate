import type { BetterAuthOptions } from "better-auth";

export const BetterAuthSessionServerConfig = {
  expiresIn: 60 * 60 * 24 * 7,
  updateAge: 60 * 60 * 24,
  freshAge: 60 * 15,
  cookieCache: { enabled: true, maxAge: 60 * 5 },
  preserveSessionInDatabase: true,
  revokeSessionsOnPasswordReset: true,
  additionalFields: {
    securityLevel: { type: "string", required: false },
  },
} satisfies BetterAuthOptions["session"] & { revokeSessionsOnPasswordReset: boolean };
