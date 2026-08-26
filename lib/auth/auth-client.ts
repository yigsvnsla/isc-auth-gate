import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  oauthProviderClient,
  oauthDeviceAuthorizationClient,
} from "@better-auth/oauth-provider/client";
import {
  twoFactorClient,
  usernameClient,
  phoneNumberClient,
  emailOTPClient,
  magicLinkClient,
  multiSessionClient,
  lastLoginMethodClient,
  oneTimeTokenClient,
  oauthPopupClient,
} from "better-auth/client/plugins";
import { apiKeyClient } from "@better-auth/api-key/client";
import { passkeyClient } from "@better-auth/passkey/client";

import { auth } from "./auth";
import {
  accessControl,
  admin,
  moderator,
  user,
  orgRoles,
} from "../permissions";

/**
 * Typed Better Auth client for browser-side calls.
 *
 * Plugins mirror server config: admin, organization, oauthProvider.
 * Roles and AC object shared from permissions.ts for type inference.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
  plugins: [
    adminClient({
      ac: accessControl,
      roles: { admin, user, moderator },
    }),
    organizationClient({
      ac: accessControl,
      dynamicAccessControl: { enabled: true },
      roles: {
        ...orgRoles,
      },
    }),
    oauthProviderClient(),
    oauthDeviceAuthorizationClient(),
    oauthPopupClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== "undefined") {
          const isDashboard = window.location.pathname.startsWith("/dashboard");
          window.location.href = isDashboard ? "/dashboard/2fa" : "/auth/2fa";
        }
      },
    }),
    inferAdditionalFields<typeof auth>(),
    apiKeyClient(),
    usernameClient(),
    phoneNumberClient(),
    emailOTPClient(),
    magicLinkClient(),
    multiSessionClient(),
    lastLoginMethodClient(),
    oneTimeTokenClient(),
    passkeyClient(),
  ],
});
