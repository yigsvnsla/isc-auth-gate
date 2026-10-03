import { betterAuth } from "better-auth";

import {
  BetterAuthAdvancedServerConfig,
  BetterAuthDatabaseHooksServerConfig,
  BetterAuthDatabaseServerConfig,
  BetterAuthEmailAndPasswordServerConfig,
  BetterAuthEmailVerificationServerConfig,
  BetterAuthExperimentalServerConfig,
  BetterAuthRateLimitServerConfig,
  BetterAuthServerConfig,
  BetterAuthServerPlugins,
  BetterAuthSessionServerConfig,
  BetterAuthUserServerConfig,
} from "@/lib/auth/server/config";

/**
 * Instancia única de Better Auth (servidor).
 *
 * Cada pieza vive en `config/` (opciones) y `config/plugins/` (un archivo por
 * plugin), igual que `env/server/schemas/`. Las de primer nivel van
 * esparcidas; el resto es el valor de su clave — esparcir `advanced` o
 * `experimental` en el primer nivel las ignoraría en silencio.
 *
 * @see https://www.better-auth.com/docs
 */

export const betterAuthServer = betterAuth({
  ...BetterAuthServerConfig,
  advanced: BetterAuthAdvancedServerConfig,
  experimental: BetterAuthExperimentalServerConfig,
  user: BetterAuthUserServerConfig,
  session: BetterAuthSessionServerConfig,
  rateLimit: BetterAuthRateLimitServerConfig,
  databaseHooks: BetterAuthDatabaseHooksServerConfig,
  emailAndPassword: BetterAuthEmailAndPasswordServerConfig,
  emailVerification: BetterAuthEmailVerificationServerConfig,
  database: BetterAuthDatabaseServerConfig,
  plugins: BetterAuthServerPlugins,
});

export type BetterAuthServer = typeof betterAuthServer;
