import type { BetterAuthPlugin } from "better-auth";
import { lastLoginMethod } from "better-auth/plugins";

export const BetterAuthLastLoginMethodServerConfig =
  lastLoginMethod({ storeInDatabase: true }) satisfies BetterAuthPlugin;
