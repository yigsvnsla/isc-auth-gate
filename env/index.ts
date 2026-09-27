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
 * Valores con los que `next build` sobrevive sin secretos de runtime.
 *
 * Cubren exactamente los campos que EnvSchema exige sin default. Los
 * opcionales (Microsoft, SMTP, CAPTCHA) no van: `lib/providers.ts` los lee
 * para decidir si registra los plugins, y aquí deben salir `undefined` para que
 * el build no monte un provider de mentira.
 *
 * ponytail: son valores falsos a propósito. Si uno llegara a producción, el
 * fallo sería obvio (baseURL `build.invalid`), no silencioso.
 */
const BUILD_PLACEHOLDERS = {
  BETTER_AUTH_URL: "http://build.invalid",
  BETTER_AUTH_SERVER_NAME: "build",
  BETTER_AUTH_SERVER_SECRET: "build-only-not-a-real-secret",
  BETTER_AUTH_SERVER_TRUSTED_ORIGINS: ["http://build.invalid"],
  BETTER_AUTH_DATABASE_HOST: "build",
  BETTER_AUTH_DATABASE_NAME: "build",
  BETTER_AUTH_DATABASE_PORT: 5432,
  BETTER_AUTH_DATABASE_USER: "build",
  BETTER_AUTH_DATABASE_PASS: "build",
} as unknown as Env;

/**
 * Obtiene la configuración validada cuando el proceso realmente la necesita.
 *
 * No validar al importar permite que `next build` compile una imagen sin los
 * secretos de producción.
 *
 * `lib/auth/auth.tsx`, `lib/providers.ts`, `lib/smtp.ts` y `database/index.ts`
 * leen env en el scope del módulo, y Next ejecuta sus módulos al recolectar
 * datos de página: sin placeholders el build muere con
 * `BETTER_AUTH_SERVER_SECRET: expected string, received undefined`. Por eso el
 * fallo de validación devuelve un stub en vez de propagar — sólo durante el
 * build, cuando `process.env` realmente no tiene nada que leer.
 *
 * En runtime este catch es inocuo: si falta una variable, `instrumentation.ts`
 * aborta el arranque antes de que nada use el stub.
 */
export function getEnv(): Env {
  if (resolvedEnv) return resolvedEnv;
  try {
    return (resolvedEnv = EnvSchema.parse(process.env));
  } catch (err) {
    // Distingue "nadie puso variables" (build) de "alguien puso parte de la
    // config" (runtime). El build no está vacío —NODE_ENV y el PATH ya están—
    // así que no sirve mirar `Object.keys(process.env).length`.
    //
    // El criterio es "alguna variable de la app presente", no "env completo":
    // con solo las cinco de DB puestas, BETTER_AUTH_URL y _SECRET faltan, y
    // sin esta guarda el stub se colaría con baseURL build.invalid. Cualquier
    // presencia significa runtime, y ahí un parse fallido es un error real.
    const algunaVarDeLaApp = Object.keys(process.env).some((k) =>
      k.startsWith("BETTER_AUTH_"),
    );
    if (algunaVarDeLaApp) throw err;
    return BUILD_PLACEHOLDERS;
  }
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
