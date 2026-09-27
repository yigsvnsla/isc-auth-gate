import { createTransport } from "nodemailer";
import { env } from "@/env";
import { smtpConfigured } from "@/lib/providers";

const transport = createTransport({
  host: env.BETTER_AUTH_SMTP_TRANSPORTER_HOST,
  port: env.BETTER_AUTH_SMTP_TRANSPORTER_PORT,
  secure: env.BETTER_AUTH_SMTP_TRANSPORTER_SECURE,
  auth:
    env.BETTER_AUTH_SMTP_TRANSPORTER_USER && env.BETTER_AUTH_SMTP_TRANSPORTER_PASS
      ? {
          user: env.BETTER_AUTH_SMTP_TRANSPORTER_USER,
          pass: env.BETTER_AUTH_SMTP_TRANSPORTER_PASS,
        }
      : undefined,
});

/**
 * Ponytail: se mantiene el nombre `smtp_transporter` y la forma de `sendMail`
 * (los call sites en lib/auth/auth.tsx no cambian), pero sin SMTP configurado
 * nodemailer intentaría conectar a localhost:25 y soltaría un ECONNREFUSED
 * críptico. Acá solo se avisa y se devuelve un messageId ficticio.
 */
export const smtp_transporter = {
  sendMail: async (
    options: Parameters<typeof transport.sendMail>[0],
  ): Promise<{ messageId: string }> => {
    if (!smtpConfigured) {
      console.warn(
        `[smtp] SMTP no configurado — mensaje descartado: "${
          (options as { subject?: string }).subject ?? "(sin asunto)"
        }"`,
      );
      return { messageId: "smtp-not-configured" };
    }
    return transport.sendMail(options);
  },
};
