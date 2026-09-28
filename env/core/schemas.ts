import { z } from "zod";

export const environmentSchema = z.enum([
  "development",
  "testing",
  "production",
]);

export type Environment = z.infer<typeof environmentSchema>;

export const databaseEnviromentSchema = z.object({
  HOST: z.optional(z.string()).pipe(z.string()),
  NAME:  z.optional(z.string()).pipe(z.string()),
  PORT: z.coerce.number().positive().min(1000).max(65535),
  USER:  z.optional(z.string()).pipe(z.string()),
  PASS:  z.optional(z.string()).pipe(z.string()),
  // Mismos defaults que env/database.schema.ts: sin ellos, un env de Dokploy o
  // CI que no defina SSL/DEBUG tumba la migración del entrypoint.
  SSL: z.stringbool().default(false),
  DEBUG: z.stringbool().default(false),
  // BETTER_AUTH_TEST_ALLOW_TRUNCATE: z.stringbool().default(false),
});

export type DatabaseEnviroment = z.infer<typeof databaseEnviromentSchema>;

export const smtpEnviromentSchema = z.object({
  BETTER_AUTH_SMTP_TRANSPORTER_HOST: z.string().min(1).optional(),
  BETTER_AUTH_SMTP_TRANSPORTER_PORT: z.coerce.number().default(587),
  BETTER_AUTH_SMTP_TRANSPORTER_SECURE: z.stringbool().default(true),
  BETTER_AUTH_SMTP_TRANSPORTER_USER: z.string().optional(),
  BETTER_AUTH_SMTP_TRANSPORTER_PASS: z.string().optional(),
  BETTER_AUTH_SMTP_TRANSPORTER_FROM: z.string().optional(),
});

export type SmtpEnviroment = z.infer<typeof smtpEnviromentSchema>;

export const applicationConfigSchema = z.object({
  enviroment: environmentSchema,
  database: databaseEnviromentSchema,
});

export type ApplicationConfig = z.infer<typeof applicationConfigSchema>;

export type RawApplicationConfig = z.input<typeof applicationConfigSchema>;
