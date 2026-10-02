import { env } from "@/env/server";
import { email } from "@/lib/email";
import { VerificationEmail } from "@/lib/email/templates/verification-email";
import { render } from "@react-email/render";
import type { BetterAuthOptions } from "better-auth";

export const BetterAuthEmailVerificationServerConfig = {
    expiresIn: 1200,
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,

    beforeEmailVerification: async (user, _request) => {
      console.log(
        `User ${user.email} is about to verify their email address.`,
        _request,
      );

      return;
    },

    afterEmailVerification: async (user, _request) => {
      console.log(
        `User ${user.email} has verified their email address.`,
        _request,
      );

      return;
    },

    sendVerificationEmail: async ({ user, url }) => {
      try {
        const template = VerificationEmail({ user, url });
        email.send({
          to: user.email,
          from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
          subject: "Verify your email address",
          html: await render(template, { pretty: true }),
        });
        console.log("Verification email sent: %s", url);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    },
  } satisfies BetterAuthOptions["emailVerification"];
