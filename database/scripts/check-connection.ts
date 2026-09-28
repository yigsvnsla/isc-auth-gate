import { Result } from "@/env/core/result";
import { drizzlePostgreClient } from "../clients/postgre";
import { SQL } from "bun";
import { DrizzleQueryError } from "drizzle-orm";

const postgrePing = async (): Promise<Result<Record<string, unknown>[], Error>> => {
  try {
    console.info("Running database connection check...");

    const result = await drizzlePostgreClient.execute(`
            SELECT
                1 AS connected,
                current_database() AS database,
                current_user AS user,
                inet_server_addr() AS server,
                inet_server_port() AS port,
                version() AS version
        `);

    console.log("✓ Database connection successful");
    console.table(result);

    return Result.success(result);
  } catch (error: unknown) {

    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof SQL.PostgresError) {
        console.error("PostgreSQL error:", error.cause.code);
        console.error("PostgreSQL message:", error.cause.message);
        return Result.failure(error.cause);
      }
      // Sin PostgresError: no hubo respuesta del servidor (ECONNREFUSED, DNS,
      // timeout). La causa real va en `cause`, el mensaje sólo trae la query.
      console.error("✗ Database connection failed:", error.cause ?? error.message);
      return Result.failure(error);
    }

    console.error("✗ Database connection failed:", error);
    return Result.failure(
      error instanceof Error ? error : new Error(String(error)),
    );
  }
};

export const checkConnection = async () => {
  const result = await postgrePing();
  // Cierra el pool: con la conexión abierta el proceso no termina solo.
  await drizzlePostgreClient.$client.close();
  return result;
};
