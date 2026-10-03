import { env } from "@/env/server";
import { client as emailClient } from "@/lib/email";
import type { BetterAuthPlugin } from "better-auth";
import { twoFactor } from "better-auth/plugins";

export const BetterAuthTwoFactorServerConfig = twoFactor({
  allowPasswordless: false,
  accountLockout: {
    enabled: false,
  },
  issuer: env.BETTER_AUTH_SERVER_NAME,
  totpOptions: {
    digits: 6,
    period: 30,
    allowPasswordless: false,
  },
  otpOptions: {
    digits: 6,
    period: 5,
    allowedAttempts: 5,
    storeOTP: "encrypted",
    sendOTP: async ({ user, otp }) => {
      await emailClient.send({
        from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
        to: user.email,
        subject: "Tu código de verificación (2FA)",
        text: `Tu código de verificación es: ${otp}`,
      });
    },
  },
  backupCodeOptions: {
    amount: 10,
    length: 10,
    storeBackupCodes: "encrypted",
  },

  trustDeviceMaxAge: 30 * 24 * 60 * 60,
}) satisfies BetterAuthPlugin;
