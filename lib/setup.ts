import { eq, sql } from "drizzle-orm";

import { db } from "@/database";
import { users } from "@/database/schema";

/**
 * Estado inicial de la instancia.
 *
 * ponytail: un solo checks — existe algún usuario con role "admin".
 * Si no existe, todo el tráfico se redirige a /setup (primer arranque,
 * típicamente tras un deploy a Dokploy con la DB recién migrada).
 */
export async function needsSetup(): Promise<boolean> {
  try {
    const [admin] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);
    return !admin;
  } catch (error) {
    // DB caída: no forzar /setup, dejar que el flujo normal muestre el error.
    // Sin este log el síntoma es invisible: un formulario de login en una
    // instancia que aún no tiene admin.
    // ponytail: DrizzleQueryError.message solo dice "Failed query: …"; el
    // código de Postgres (42P01, 42501, timeout…) vive en .cause.
    const causa =
      error instanceof Error && error.cause instanceof Error
        ? ` | causa: ${error.cause.message}`
        : "";
    console.warn(
      `[setup] needsSetup() no pudo consultar la DB:${causa}`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

/** Ping de conectividad para el panel de status de /setup. */
export async function checkDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch (error) {
    console.warn(
      "[setup] checkDatabase() falló:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
