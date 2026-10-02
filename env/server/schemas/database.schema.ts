import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const databaseEnviroment = createEnv({
  server: {
    BETTER_AUTH_DATABASE_SSL: z.stringbool().default(false),
    BETTER_AUTH_DATABASE_HOST: z.string().min(1),
    BETTER_AUTH_DATABASE_NAME: z.string().min(1),
    BETTER_AUTH_DATABASE_PORT: z.coerce.number().int().min(1).max(65535),
    BETTER_AUTH_DATABASE_USER: z.string().min(1),
    BETTER_AUTH_DATABASE_PASS: z.string().min(1),
    BETTER_AUTH_DATABASE_DEBUG: z.stringbool().default(false),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.NEXT_PHASE === "phase-production-build",
  isServer: typeof window === "undefined",
});
