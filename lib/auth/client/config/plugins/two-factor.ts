import type { BetterAuthClientPlugin } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

export const BetterAuthTwoFactorClientConfig = twoFactorClient({}) satisfies BetterAuthClientPlugin;
