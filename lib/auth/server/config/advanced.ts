import type { BetterAuthAdvancedOptions } from "better-auth/types";

export const BetterAuthAdvancedServerConfig = {
  useSecureCookies: true,
  disableCSRFCheck: false,
  disableOriginCheck: false,
  crossSubDomainCookies: {
    enabled: true,
  },
} satisfies BetterAuthAdvancedOptions;
