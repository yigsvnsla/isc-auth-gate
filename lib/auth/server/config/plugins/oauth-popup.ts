import type { BetterAuthPlugin } from "better-auth";
import { oauthPopup } from "better-auth/plugins";

export const BetterAuthOauthPopupServerConfig = oauthPopup() satisfies BetterAuthPlugin;
