import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const smtpEnviroment = createEnv({
  server: {
    BETTER_AUTH_SMTP_TRANSPORTER_HOST: z.string().min(1).optional(),
    BETTER_AUTH_SMTP_TRANSPORTER_PORT: z.coerce.number().default(587),
    BETTER_AUTH_SMTP_TRANSPORTER_SECURE: z.stringbool().default(true),
    BETTER_AUTH_SMTP_TRANSPORTER_USER: z.string().optional(),
    BETTER_AUTH_SMTP_TRANSPORTER_PASS: z.string().optional(),
    BETTER_AUTH_SMTP_TRANSPORTER_FROM: z
      .string()
      .optional()
      .default("ISC Auth <soporte@integritysolutions.com.ec>"),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.NEXT_PHASE === "phase-production-build",
  isServer: typeof window === "undefined",
});
