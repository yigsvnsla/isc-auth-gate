import { env } from "@/env/server";
import { email } from "@/lib/email";
import type { BetterAuthPlugin } from "better-auth";
import { emailOTP } from "better-auth/plugins";

export const BetterAuthEmailOtpServerConfig = emailOTP({
  sendVerificationOTP: async ({ email: toEmail, otp }) => {
    await email.send({
      from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
      to: toEmail,
      subject: "Tu código de acceso (OTP)",
      text: `Tu código de acceso es: ${otp}`,
    });
  },
}) satisfies BetterAuthPlugin;
