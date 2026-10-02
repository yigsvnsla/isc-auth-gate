import type { BetterAuthPlugin } from "better-auth";
import { admin } from "better-auth/plugins";

import {
  accessControl,
  admin as adminRole,
  user as userRole,
  moderator as moderatorRole,
} from "@/lib/permissions";

export const BetterAuthAdminServerConfig = admin({
  adminUserIds: [],
  ac: accessControl,
  roles: { admin: adminRole, user: userRole, moderator: moderatorRole },
}) satisfies BetterAuthPlugin;
