import type { BetterAuthClientPlugin } from "better-auth/client";
import { multiSessionClient } from "better-auth/client/plugins";

export const BetterAuthMultiSessionClientConfig = multiSessionClient() satisfies BetterAuthClientPlugin;
