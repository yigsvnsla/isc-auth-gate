import { adminClient, inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { oauthProviderClient, oauthDeviceAuthorizationClient } from "@better-auth/oauth-provider/client";
import { twoFactorClient } from "better-auth/client/plugins";
import { apiKeyClient } from "@better-auth/api-key/client";

import { auth } from "./auth";
import { accessControl, admin, moderator, user, orgRoles } from "../permissions";

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
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== "undefined") {
          window.location.href = "/2fa";
        }
      },
    }),
    inferAdditionalFields<typeof auth>(),
    apiKeyClient(),
  ],
});






