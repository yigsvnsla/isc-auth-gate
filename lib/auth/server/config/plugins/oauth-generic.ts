import type { BetterAuthPlugin } from "better-auth";
import { genericOAuth, microsoftEntraId } from "better-auth/plugins";

import { env } from "@/env/server";
import { microsoftConfigured } from "@/lib/providers";

// ponytail: providerId "microsoft" fuerza callback /api/auth/callback/microsoft (ya registrado en Azure).
// accountIssuer + requireIdTokenVerification: false aseguran init robusto sin depender de discovery.
// Opcional: sin clientId+clientSecret+tenantId el plugin NO se registra (ver
// lib/providers.ts) — registrarlo sin tenant concreto tumba toda página de
// auth con "requires a concrete Microsoft Entra tenant GUID". Por eso es una
// lista (vacía o con el plugin) que se esparce en plugins/index.
export const BetterAuthGenericOAuthServerConfig = (
  microsoftConfigured
    ? [
        genericOAuth({
          config: [
            {
              ...microsoftEntraId({
                clientId: env.BETTER_AUTH_MICROSOFT_CLIENT_ID!,
                clientSecret: env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET!,
                tenantId: env.BETTER_AUTH_MICROSOFT_TENANT_ID!,
              }),
              providerId: "microsoft",
              accountIssuer: `https://login.microsoftonline.com/${env.BETTER_AUTH_MICROSOFT_TENANT_ID}/v2.0`,
              requireIdTokenVerification: false,
            },
          ],
        }),
      ]
    : []
) satisfies BetterAuthPlugin[];
