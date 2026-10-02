import type { BetterAuthClientPlugin } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";

import { accessControl, orgRoles } from "@/lib/permissions";

export const BetterAuthOrganizationClientConfig = organizationClient({
  ac: accessControl,
  dynamicAccessControl: { enabled: true },
  roles: { ...orgRoles },
}) satisfies BetterAuthClientPlugin;
