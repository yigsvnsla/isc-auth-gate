import z from "zod";

// SMTP opcional: sin host/user/pass la app arranca igual, pero los flujos que
// dependen de correo (verificación, magic link, email OTP, invitaciones, reset
// de password) no pueden entregar mensajes. Ver `lib/providers.ts`.
export const smtpEnv = z.object({
  BETTER_AUTH_SMTP_TRANSPORTER_HOST: z.string().min(1).optional(),
  BETTER_AUTH_SMTP_TRANSPORTER_PORT: z.coerce.number().default(587),
  BETTER_AUTH_SMTP_TRANSPORTER_SECURE: z.stringbool().default(true),
  BETTER_AUTH_SMTP_TRANSPORTER_USER: z.string().optional(),
  BETTER_AUTH_SMTP_TRANSPORTER_PASS: z.string().optional(),
  BETTER_AUTH_SMTP_TRANSPORTER_FROM: z
    .string()
    .optional()
    .default("ISC Auth <soporte@integritysolutions.com.ec>"),
});
