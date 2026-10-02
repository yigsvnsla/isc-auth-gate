import type { BetterAuthPlugin } from "better-auth";
import { openAPI } from "better-auth/plugins";

export const BetterAuthOpenApiServerConfig = openAPI() satisfies BetterAuthPlugin;
