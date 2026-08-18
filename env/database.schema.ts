import z from "zod";

export type DatabaseEnv = z.infer<typeof databaseEnv>;

export const databaseEnv = z.object({
  BETTER_AUTH_DATABASE_HOST: z.string().min(1),
  BETTER_AUTH_DATABASE_NAME: z.string().min(1),
  BETTER_AUTH_DATABASE_PORT: z.coerce.number().positive().min(1000).max(65535),
  BETTER_AUTH_DATABASE_USER: z.string().min(1),
  BETTER_AUTH_DATABASE_PASS: z.string().min(1),
  BETTER_AUTH_DATABASE_SSL: z.coerce.boolean().default(false),
  BETTER_AUTH_DATABASE_DEBUG: z.stringbool().default(false),
  // Opt-in explícito para correr tests destructivos (cleanupTestDb TRUNCATE).
  // Los tests comparten la DB de dev; sin este flag, cleanupTestDb() lanza
  // un error en vez de vaciar datos en silencio.
  BETTER_AUTH_TEST_ALLOW_TRUNCATE: z.coerce.boolean().default(false),
});
