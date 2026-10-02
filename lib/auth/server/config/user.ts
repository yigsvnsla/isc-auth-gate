import type { BetterAuthOptions } from "better-auth";

export const BetterAuthUserServerConfig = {
  additionalFields: {
    mfaEnforcedAt: { type: "date", required: false },
    securityLevel: {
      type: "string",
      defaultValue: "standard",
      required: false,
    },
  },
} satisfies BetterAuthOptions["user"];
