import z from "zod";

export const serverEnv = z.object({
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
});
