import type { BetterAuthPlugin } from "better-auth";
import { jwt } from "better-auth/plugins";

export const BetterAuthJwtServerConfig = jwt() satisfies BetterAuthPlugin;
