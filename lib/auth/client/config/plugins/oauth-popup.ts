import type { BetterAuthClientPlugin } from "better-auth/client";
import { oauthPopupClient } from "better-auth/client/plugins";

export const BetterAuthOauthPopupClientConfig = oauthPopupClient() satisfies BetterAuthClientPlugin;
