import type { BetterAuthClientPlugin } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";

// ponytail: `import type` — sólo el tipo del servidor. Un import de valor
// metería la instancia de servidor (DB, secretos, plugins) en el bundle del
// navegador. TypeScript lo elimina al compilar.
import type { BetterAuthServer } from "@/lib/auth/server";

export const BetterAuthInferAdditionalFieldsClientConfig =
  inferAdditionalFields<BetterAuthServer>() satisfies BetterAuthClientPlugin;
