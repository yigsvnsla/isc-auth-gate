import type { BetterAuthClientPlugin } from "better-auth/client";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

export const BetterAuthOAuthProviderClientConfig = oauthProviderClient() satisfies BetterAuthClientPlugin;
