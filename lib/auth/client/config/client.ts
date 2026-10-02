import type { BetterAuthClientOptions } from "better-auth/client";

import { env } from "@/env/client";

export const BetterAuthClientConfig = {
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
} satisfies Pick<BetterAuthClientOptions, "baseURL">;
