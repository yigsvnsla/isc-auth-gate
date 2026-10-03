import { render } from "@react-email/render";
import type { BetterAuthOptions } from "better-auth";
import { ResetPasswordEmail } from "@/lib/email/templates/reset-password-email";
import { client as email } from "@/lib/email";
import { env } from "@/env/server";
import { ExistingSignupEmail } from "@/lib/email/templates/existing-signup-email";

export const BetterAuthEmailAndPasswordServerConfig = {
    enabled: true,
    autoSignIn: false,
    disableSignUp: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      try {

        const template = ResetPasswordEmail({ user, url });
        email.send({
            to: user.email,
            from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
            subject: "Reset your password",
            html: await render(template, { pretty: true }),
        });

      } catch (err) {
        console.error("Failed to send reset password email:", err);
      }
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
    onExistingUserSignUp: async ({ user }) => {
      try {
        const template = ExistingSignupEmail({ user });
        email.send({
            to: user.email,
            from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
            subject: "Sign-up attempt detected",  
            html: await render(template, { pretty: true }),
        });
      } catch (err) {
        console.error("Failed to send existing signup email:", err);
      }
    },
  } satisfies BetterAuthOptions["emailAndPassword"];
