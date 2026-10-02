import { createRateLimitStorage } from "@/lib/rate-limit-storage";
import type { BetterAuthOptions } from "better-auth";

export const BetterAuthRateLimitServerConfig = {
  enabled: true,
  storage: "memory",
  customStorage: createRateLimitStorage(),
  window: 60,
  max: 50,
  customRules: {
    "/sign-in/*": { window: 60, max: 10 },
    "/sign-up/*": { window: 60, max: 5 },
    "/two-factor/verify-totp": { window: 60, max: 10 },
    "/two-factor/verify-otp": { window: 60, max: 10 },
    "/two-factor/verify-backup-code": { window: 60, max: 10 },
    "/forget-password": { window: 60, max: 5 },
    "/reset-password": { window: 60, max: 5 },
  },
} satisfies BetterAuthOptions["rateLimit"];
