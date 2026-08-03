import { createAuthClient } from "better-auth/client";
import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client";
import { auth } from "./auth";

/**
 * Server-only OAuth resource client.
 *
 * Verifies access tokens issued by the OAuth provider (JWKS local
 * verification by default, remote introspection via `remoteVerify`).
 *
 * @see https://better-auth.com/docs/plugins/oauth-provider#resource-client
 */
export const serverClient = createAuthClient({
  plugins: [oauthProviderResourceClient(auth)],
});
