import type { BetterAuthClientPlugin } from "better-auth/client";
import { oneTimeTokenClient } from "better-auth/client/plugins";

export const BetterAuthOneTimeTokenClientConfig = oneTimeTokenClient() satisfies BetterAuthClientPlugin;
