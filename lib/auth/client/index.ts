import { createAuthClient } from "better-auth/react";

import {
  BetterAuthClientConfig,
  BetterAuthClientPlugins,
} from "@/lib/auth/client/config";

/**
 * Cliente de Better Auth para el navegador.
 *
 * Misma distribución que `lib/auth/server`: opciones en `config/` y un archivo
 * por plugin en `config/plugins/`, con el mismo nombre que su par de servidor.
 * La verificación de access tokens (resource client) es sólo de servidor:
 * `lib/auth/server/resource-client.ts`.
 */
export const authClient = createAuthClient({
  ...BetterAuthClientConfig,
  plugins: BetterAuthClientPlugins,
});
