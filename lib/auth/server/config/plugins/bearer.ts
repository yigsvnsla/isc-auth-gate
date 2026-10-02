import { bearer } from "better-auth/plugins";
import type { BetterAuthPlugin } from "better-auth";

export const BetterAuthBearerServerConfig = bearer() satisfies BetterAuthPlugin;
