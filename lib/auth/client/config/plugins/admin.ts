import type { BetterAuthClientPlugin } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

import { accessControl, admin, moderator, user } from "@/lib/permissions";

export const BetterAuthAdminClientConfig = adminClient({
  ac: accessControl,
  roles: { admin, user, moderator },
}) satisfies BetterAuthClientPlugin;
