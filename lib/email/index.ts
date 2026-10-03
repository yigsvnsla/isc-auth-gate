import { env } from "@/env/server";
import { createEmailClient } from "@opencoredev/email-sdk";
import { smtp } from "@opencoredev/email-sdk/smtp";

export const client = createEmailClient({
  defaultAdapter: "smtp",
  adapters: [
    smtp({
      requireTLS: false,
      // El adapter se construye siempre (lo exige el SDK), pero sin SMTP
      // configurado nunca se usa: `email.send` corta antes. "localhost" es un
      // placeholder para satisfacer el tipo, no un destino real.
      host: env.BETTER_AUTH_SMTP_TRANSPORTER_HOST ?? "localhost",
      port: env.BETTER_AUTH_SMTP_TRANSPORTER_PORT,
      secure: env.BETTER_AUTH_SMTP_TRANSPORTER_SECURE,
      // Solo definir auth si hay credenciales reales: un objeto auth vacío es
      // truthy y el SDK fuerza STARTTLS ("auth requires TLS"), que revienta
      // contra hosts IP (Mailpit local) en upgradeToTls.
      auth:
        env.BETTER_AUTH_SMTP_TRANSPORTER_SECURE &&
        env.BETTER_AUTH_SMTP_TRANSPORTER_USER &&
        env.BETTER_AUTH_SMTP_TRANSPORTER_PASS
          ? {
              user: env.BETTER_AUTH_SMTP_TRANSPORTER_USER,
              pass: env.BETTER_AUTH_SMTP_TRANSPORTER_PASS,
            }
          : undefined,
    }),
  ],
  retry: {
    maxAttempts: 3,

    delay: (attempt) => 250 * attempt + Math.random() * 100, // linear + jitter
  },
});
