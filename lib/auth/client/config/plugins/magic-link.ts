import type { BetterAuthClientPlugin } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";

export const BetterAuthMagicLinkClientConfig = magicLinkClient() satisfies BetterAuthClientPlugin;
