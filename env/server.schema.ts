import z from "zod";

export const serverEnv = z.object({
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SERVER_NAME: z.string(),
  BETTER_AUTH_SERVER_HOST: z.string().default("localhost"),
  BETTER_AUTH_SERVER_PORT: z.coerce.number().default(4000),
  BETTER_AUTH_SERVER_DEBUG: z.coerce.boolean().default(false),
  BETTER_AUTH_SERVER_SECRET: z.string(),
  BETTER_AUTH_SERVER_TRUSTED_ORIGINS: z.preprocess(
    // Si viene como string, lo dividimos por coma y quitamos espacios en blanco
    (val) =>
      typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,

    // Validamos que sea un array de strings que sean URLs válidas
    z.array(z.url()).min(1).default([]),
  ),
  // client_ids de primera parte (trusted) — inmutables vía CRUD del plugin.
  // Lista separada por comas; espejo en NEXT_PUBLIC_BETTER_AUTH_OAUTH_TRUSTED_CLIENTS.
  BETTER_AUTH_OAUTH_TRUSTED_CLIENTS: z.preprocess(
    (val) =>
      typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
    z.array(z.string().min(1)).default(["isc-gate-dashboard"]),
  ),
  BETTER_AUTH_OAUTH_DYNAMIC_CLIENT_REGISTRATION: z.coerce
    .boolean()
    .default(false),
  // Recursos protegidos (RFC 8707) del OAuth provider. Seed inicial de
  // bootstrap: el plugin los inserta en la tabla oauth_resources con modo
  // insertOnly (nunca pisa filas editadas por CRUD admin). La fuente de
  // verdad en runtime es la tabla, gestionada desde el dashboard admin
  // (/admin/oauth2/resources). Vacío por defecto — crear resources por UI.
  BETTER_AUTH_OAUTH_RESOURCES: z.preprocess(
    (val) => {
      if (typeof val !== "string") return val;
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    },
    z
      .array(
        z.object({
          identifier: z.string(),
          name: z.string().optional(),
          allowedScopes: z.array(z.string()).optional(),
        }),
      )
      .default([]),
  ),
});
