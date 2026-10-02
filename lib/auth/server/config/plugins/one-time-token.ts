import type { BetterAuthPlugin } from "better-auth";
import { oneTimeToken } from "better-auth/plugins";

export const BetterAuthOneTimeTokenServerConfig =
  oneTimeToken({
    expiresIn: 10,
    storeToken: "hashed",
    disableClientRequest: true,
  }) satisfies BetterAuthPlugin;
