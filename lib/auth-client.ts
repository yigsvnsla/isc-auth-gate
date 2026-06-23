import { adminClient, inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

import type { auth } from "./auth";
import { accessControl, admin, moderator, user, orgSystemAdmin } from "./permissions";

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
        systemAdmin: orgSystemAdmin,
      },
    }),
    oauthProviderClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
