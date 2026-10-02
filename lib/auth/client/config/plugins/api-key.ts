import type { BetterAuthClientPlugin } from "better-auth/client";
import { apiKeyClient } from "@better-auth/api-key/client";

export const BetterAuthApiKeyClientConfig = apiKeyClient() satisfies BetterAuthClientPlugin;
