import { env } from "@/env";
import { smtpConfigured } from "@/lib/providers";
import { createEmailClient } from "@opencoredev/email-sdk";
import { smtp } from "@opencoredev/email-sdk/smtp";

const client = createEmailClient({
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
  // retry: {
  //   maxAttempts: 3,

  //   delay: (attempt) => 250 * attempt + Math.random() * 100, // linear + jitter
  // },
});

const NOT_CONFIGURED = {
  messageId: "smtp-not-configured",
  accepted: [],
  rejected: [],
} as const;

/**
 * SMTP es opcional (ver `lib/providers.ts`). Sin host+user+pass, `send` no
 * lanza: avisa por asunto y devuelve un resultado vacío para no reventar los
 * hooks (verificación, magic link, invitaciones, OTP...) que ya tratan el
 * error como no-fatal. Con SMTP configurado es el cliente tal cual.
 */
export const email = {
  send: async (
    message: Parameters<typeof client.send>[0],
  ): Promise<Awaited<ReturnType<typeof client.send>>> => {
    if (!smtpConfigured) {
      console.warn(
        `[email] SMTP no configurado — mensaje descartado: "${
          (message as { subject?: string }).subject ?? "(sin asunto)"
        }"`,
      );
      return NOT_CONFIGURED as unknown as Awaited<
        ReturnType<typeof client.send>
      >;
    }
    return client.send(message);
  },
};
