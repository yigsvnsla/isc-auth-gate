import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const serverEnviroment = createEnv({
  server: {
    // URL pública (con o sin "/" final). baseURL de Better Auth, links de
    // email y issuer OAuth. Ya existe en Dokploy y CI.
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SERVER_PATH: z.string().default("/api/auth"),
    BETTER_AUTH_SERVER_NAME: z.string().min(1),
    BETTER_AUTH_SERVER_HOST: z.string().default("localhost"),
    BETTER_AUTH_SERVER_PORT: z.coerce.number().default(4000),
    BETTER_AUTH_SERVER_DEBUG: z.stringbool().default(false),
    BETTER_AUTH_SERVER_SECRET: z.string().min(1),
    BETTER_AUTH_SERVER_TRUSTED_ORIGINS: z.preprocess(
      // Si viene como string, lo dividimos por coma y quitamos espacios en blanco
      (val) =>
        typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
      // Validamos que sea un array de strings que sean URLs válidas
      z.array(z.url()).min(1).default([]),
    ),
    // Rate-limit storage backend. "memory" = por instancia de app (default).
    // "redis" = compartido entre instancias vía Redis (requiere REDIS_URL).
    BETTER_AUTH_RATE_LIMIT_STORAGE: z.enum(["memory", "redis"]).default("memory"),
    REDIS_URL: z.string().optional(),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.NEXT_PHASE === "phase-production-build",
  isServer: typeof window === "undefined",
});
