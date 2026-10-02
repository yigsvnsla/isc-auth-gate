import type { BetterAuthClientPlugin } from "better-auth/client";
import { passkeyClient } from "@better-auth/passkey/client";

export const BetterAuthPasskeyClientConfig = passkeyClient() satisfies BetterAuthClientPlugin;
