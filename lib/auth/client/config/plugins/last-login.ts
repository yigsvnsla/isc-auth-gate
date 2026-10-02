import type { BetterAuthClientPlugin } from "better-auth/client";
import { lastLoginMethodClient } from "better-auth/client/plugins";

export const BetterAuthLastLoginMethodClientConfig = lastLoginMethodClient() satisfies BetterAuthClientPlugin;
