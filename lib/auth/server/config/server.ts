import type { BetterAuthOptions } from "better-auth";

import { env } from "@/env/server";

const isBuilding = process.env.NEXT_PHASE === "phase-production-build";

/**
 * Placeholders sólo para `next build`: ahí t3-env no valida (skipValidation) y
 * el env llega vacío, pero Better Auth exige baseURL (crossSubDomainCookies) y
 * secret (NODE_ENV=production). Valores falsos a propósito: si uno llegara a
 * runtime el fallo sería obvio (`build.invalid`). En runtime env está
 * validado y ambos son obligatorios (env/server/schemas/server.schema.ts).
 */
const BUILD = {
  url: "http://build.invalid",
  secret: "build-only-not-a-real-secret",
};

const url = isBuilding ? (env.BETTER_AUTH_URL ?? BUILD.url) : env.BETTER_AUTH_URL;

export const BetterAuthServerConfig = {
  // Sin "/" final: con basePath "/api/auth" quedaría "…//api/auth".
  baseURL: url.replace(/\/+$/, ""),
  basePath: env.BETTER_AUTH_SERVER_PATH,
  appName: env.BETTER_AUTH_SERVER_NAME,
  secret: isBuilding
    ? (env.BETTER_AUTH_SERVER_SECRET ?? BUILD.secret)
    : env.BETTER_AUTH_SERVER_SECRET,
  trustedOrigins: env.BETTER_AUTH_SERVER_TRUSTED_ORIGINS,
} satisfies Pick<
  BetterAuthOptions,
  "baseURL" | "basePath" | "appName" | "secret" | "trustedOrigins"
>;
