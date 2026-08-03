import { env } from "@/env";
import { createEmailClient } from "@opencoredev/email-sdk";
import { smtp } from "@opencoredev/email-sdk/smtp";

export const email = createEmailClient({
  defaultAdapter: "smtp",
  adapters: [
    smtp({
      requireTLS: false,
      host: env.BETTER_AUTH_SMTP_TRANSPORTER_HOST,
      port: env.BETTER_AUTH_SMTP_TRANSPORTER_PORT,
      secure: env.BETTER_AUTH_SMTP_TRANSPORTER_SECURE,
      // Solo definir auth si hay credenciales reales: un objeto auth vacío es
      // truthy y el SDK fuerza STARTTLS ("auth requires TLS"), que revienta
      // contra hosts IP (Mailpit local) en upgradeToTls.
      auth: env.BETTER_AUTH_SMTP_TRANSPORTER_SECURE
        ? {
            user: env.BETTER_AUTH_SMTP_TRANSPORTER_USER,
            pass: env.BETTER_AUTH_SMTP_TRANSPORTER_PASS,
          }
        : undefined,
    }),
  ],
  // retry: {
  //   maxAttempts: 3,

  //   delay: (attempt) => 250 * attempt + Math.random() * 100, // linear + jitter
  // },
});
