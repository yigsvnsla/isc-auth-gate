import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

// ponytail: `runtimeEnv` explícito, no `process.env` — Next sólo inyecta en el
// bundle del navegador las NEXT_PUBLIC_* que aparecen escritas literalmente.
export const env = createEnv({
  client: {
    // Se compila en el bundle (build-arg del Containerfile): baseURL del
    // cliente de Better Auth.
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
    // Espejo de BETTER_AUTH_OAUTH_TRUSTED_CLIENTS para la UI (lista por comas).
    NEXT_PUBLIC_BETTER_AUTH_OAUTH_TRUSTED_CLIENTS: z.preprocess(
      (val) =>
        typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
      z.array(z.string().min(1)).default(["isc-gate-dashboard"]),
    ),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_BETTER_AUTH_OAUTH_TRUSTED_CLIENTS:
      process.env.NEXT_PUBLIC_BETTER_AUTH_OAUTH_TRUSTED_CLIENTS,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.NEXT_PHASE === "phase-production-build",
});
