import type { BetterAuthPlugin } from "better-auth";
import { captcha } from "better-auth/plugins";

import { env } from "@/env/server";

// CAPTCHA (feature flag): protege sign-up / sign-in. Solo se registra si está
// habilitado Y hay secret; registrarlo sin secret rechaza todo login. Por eso
// se exporta como lista (vacía o con el plugin) y se esparce en plugins/index.
export const BetterAuthCaptchaServerConfig = (
  env.BETTER_AUTH_CAPTCHA_ENABLED && env.BETTER_AUTH_CAPTCHA_SECRET_KEY
    ? [
        captcha({
          // Valores literales del enum Providers del plugin captcha.
          provider: env.BETTER_AUTH_CAPTCHA_PROVIDER,
          secretKey: env.BETTER_AUTH_CAPTCHA_SECRET_KEY,
          siteKey: env.BETTER_AUTH_CAPTCHA_SITE_KEY,
        }),
      ]
    : []
) satisfies BetterAuthPlugin[];
