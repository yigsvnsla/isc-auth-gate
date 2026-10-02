import type { BetterAuthClientPlugin } from "better-auth/client";
import { oauthDeviceAuthorizationClient } from "@better-auth/oauth-provider/client";

export const BetterAuthOauthDeviceAuthorizationClientConfig = oauthDeviceAuthorizationClient() satisfies BetterAuthClientPlugin;
