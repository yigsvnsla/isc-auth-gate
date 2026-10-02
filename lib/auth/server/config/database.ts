import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/database";

// ponytail: drizzleAdapter devuelve la factory del adapter (una función):
// va como valor de `database`, no esparcida — `{ ...fn }` es `{}` y Better
// Auth se quedaría sin base de datos.
export const BetterAuthDatabaseServerConfig = drizzleAdapter(db, {
  provider: "pg",
  usePlural: true,
});
