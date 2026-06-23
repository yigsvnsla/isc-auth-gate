import z from "zod";

export const smtpEnv = z.object({
  BETTER_AUTH_SMTP_TRANSPORTER_HOST: z.string(),
  BETTER_AUTH_SMTP_TRANSPORTER_PORT: z.coerce.number().default(587),
  BETTER_AUTH_SMTP_TRANSPORTER_SECURE: z.coerce.boolean().default(false),
  BETTER_AUTH_SMTP_TRANSPORTER_USER: z.string(),
  BETTER_AUTH_SMTP_TRANSPORTER_PASS: z.string(),
});
