import z from "zod";

export const smtpEnv = z.object({
  BETTER_AUTH_SMTP_TRANSPORTER_HOST: z.string(),
  BETTER_AUTH_SMTP_TRANSPORTER_PORT: z.coerce.number().default(587),
  BETTER_AUTH_SMTP_TRANSPORTER_SECURE: z.stringbool().default(true),
  BETTER_AUTH_SMTP_TRANSPORTER_USER: z.string(),
  BETTER_AUTH_SMTP_TRANSPORTER_PASS: z.string(),
  BETTER_AUTH_SMTP_TRANSPORTER_FROM: z.string()
});
