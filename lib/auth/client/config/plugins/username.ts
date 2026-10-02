import type { BetterAuthClientPlugin } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";

export const BetterAuthUsernameClientConfig = usernameClient() satisfies BetterAuthClientPlugin;
