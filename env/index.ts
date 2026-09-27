import z from "zod";
import { databaseEnv } from "./database.schema";
import { microsoftProviderEnv } from "./microsoft.schema";
import { serverEnv } from "./server.schema";
import { smtpEnv } from "./smtp.schema";

const EnvSchema = z.object({
  ...microsoftProviderEnv.shape,
  ...databaseEnv.shape,
  ...serverEnv.shape,
  ...smtpEnv.shape,
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof EnvSchema>;

let resolvedEnv: Env | undefined;

/**
 * Obtiene la configuración validada cuando el proceso realmente la necesita.
 *
 * No validar al importar permite que `next build` compile una imagen sin los
 * secretos de producción. La primera lectura en runtime conserva el fallo
 * temprano si falta una variable obligatoria.
 */
export function getEnv(): Env {
  return (resolvedEnv ??= EnvSchema.parse(process.env));
}

/**
 * Compatibilidad temporal para los consumidores existentes.
 *
 * El proxy difiere la validación hasta leer una propiedad. Los módulos nuevos
 * deben preferir `getEnv()` para que su punto de evaluación sea explícito.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, property, receiver) {
    return Reflect.get(getEnv(), property, receiver);
  },
});
