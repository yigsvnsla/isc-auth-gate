import { env } from "@/env";
import { createEmailClient } from "@opencoredev/email-sdk";
import { smtp } from "@opencoredev/email-sdk/smtp";

export const email = createEmailClient({
  adapters: [
    smtp({
      host: env.BETTER_AUTH_SMTP_TRANSPORTER_HOST,
      port: env.BETTER_AUTH_SMTP_TRANSPORTER_PORT,
      secure: env.BETTER_AUTH_SMTP_TRANSPORTER_SECURE,
      auth: {
        user: env.BETTER_AUTH_SMTP_TRANSPORTER_USER,
        pass: env.BETTER_AUTH_SMTP_TRANSPORTER_PASS,
      },

      //   from: "Acme <hello@acme.com>",
      //   to: "user@example.com",
      //   subject: "Welcome to Acme",
      //   text: "Your account is ready.",
    }),
  ],
  telemetry: false,
});
