import { env } from "@/env/server";
import { email } from "@/lib/email";
import type { BetterAuthPlugin } from "better-auth";
import { magicLink } from "better-auth/plugins";

export const BetterAuthMagicLinkServerConfig = magicLink({
      sendMagicLink: async ({ email: toEmail, url }) => {
        await email.send({
          from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
          to: toEmail,
          subject: "Tu enlace de acceso",
          text: `Haz clic para iniciar sesión: ${url}`,
        });
      },
    }) satisfies BetterAuthPlugin;
