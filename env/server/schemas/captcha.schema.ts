import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const captchaEnviroment = createEnv({
  server: {
    // Feature flag: desactivado por defecto. Sin ENABLED + SECRET_KEY el
    // plugin no se registra (lib/auth/server/config/plugins/captcha.ts).
    BETTER_AUTH_CAPTCHA_ENABLED: z.stringbool().default(false),
    BETTER_AUTH_CAPTCHA_PROVIDER: z
      .enum(["google-recaptcha", "cloudflare-turnstile", "hcaptcha", "captchafox"])
      .default("cloudflare-turnstile"),
    BETTER_AUTH_CAPTCHA_SECRET_KEY: z.string().min(1).optional(),
    BETTER_AUTH_CAPTCHA_SITE_KEY: z.string().min(1).optional(),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.NEXT_PHASE === "phase-production-build",
  isServer: typeof window === "undefined",
});
