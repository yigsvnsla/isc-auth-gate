import type { BetterAuthPlugin } from "better-auth";
import { username } from "better-auth/plugins";

// Username: login por nombre de usuario (además de email). Columna única.
export const BetterAuthUsernameServerConfig = username({
  minUsernameLength: 3,
  maxUsernameLength: 30,
}) satisfies BetterAuthPlugin;
