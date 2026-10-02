import type { BetterAuthPlugin } from "better-auth";
import { testUtils } from "better-auth/plugins";

// Solo en `bun test` (NODE_ENV=test): helpers de test de Better Auth. Lista
// vacía fuera de tests — un `undefined` en `plugins` tumba betterAuth().
export const BetterAuthTestUtilsServerConfig = (
  process.env.NODE_ENV === "test" ? [testUtils()] : []
) satisfies BetterAuthPlugin[];
