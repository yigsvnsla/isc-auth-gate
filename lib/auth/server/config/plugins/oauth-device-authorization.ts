import type { BetterAuthPlugin } from "better-auth";
import { oauthDeviceAuthorization } from "@better-auth/oauth-provider";

export const BetterAuthOauthDeviceAuthorizationServerConfig =
  oauthDeviceAuthorization({
    verificationUri: "/auth/device",
  }) satisfies BetterAuthPlugin;
