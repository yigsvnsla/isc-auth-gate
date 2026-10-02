import "server-only";
import { connection } from "next/server";
import { env } from "@/env/server";

/**
 * Fachada de configuración pública leída por Server Components.
 *
 * `connection()` aplaza la lectura de las variables hasta que exista una
 * solicitud, evitando que Next las evalúe durante el prerender del build.
 */
export async function getPublicAuthConfig() {
  await connection();

  return {
    baseUrl: env.BETTER_AUTH_URL.replace(/\/+$/, ""),
  };
}
