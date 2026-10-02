import type { BetterAuthPlugin } from "better-auth";
import { apiKey } from "@better-auth/api-key";

export const BetterAuthApiKeyServerConfig = apiKey({
  enableSessionForAPIKeys: true,
  enableMetadata: true,
}) satisfies BetterAuthPlugin;