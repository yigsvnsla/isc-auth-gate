import type { BetterAuthPlugin } from "better-auth";
import { genericOAuth, microsoftEntraId } from "better-auth/plugins";

import { env } from "@/env/server";

const isBuilding = process.env.NEXT_PHASE === "phase-production-build";

// ponytail: providerId "microsoft" fuerza callback /api/auth/callback/microsoft (ya registrado en Azure).
// accountIssuer + requireIdTokenVerification: false aseguran init robusto sin depender de discovery.
//
// Microsoft es obligatorio (env/server/schemas/microsoft.schema.ts valida el
// tenant como GUID), salvo en `next build`: ahí el env no se valida y llega
// vacío, y `microsoftEntraId` lanza al construirse sin un tenant GUID. Por eso
// es una lista — vacía sólo en build — que se esparce en plugins/index.
export const BetterAuthGenericOAuthServerConfig = (
  isBuilding
    ? []
    : [
        genericOAuth({
          config: [
            {
              ...microsoftEntraId({
                clientId: env.BETTER_AUTH_MICROSOFT_CLIENT_ID,
                clientSecret: env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET,
                tenantId: env.BETTER_AUTH_MICROSOFT_TENANT_ID,
              }),
              providerId: "microsoft",
              accountIssuer: `https://login.microsoftonline.com/${env.BETTER_AUTH_MICROSOFT_TENANT_ID}/v2.0`,
              requireIdTokenVerification: false,
            },
          ],
        }),
      ]
) satisfies BetterAuthPlugin[];
