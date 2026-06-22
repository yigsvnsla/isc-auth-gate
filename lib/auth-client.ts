import { adminClient, inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "./auth";
import { accessControl, admin, moderator, user, orgSystemAdmin } from "./permissions";

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
    inferAdditionalFields<typeof auth>(),
  ],
});
