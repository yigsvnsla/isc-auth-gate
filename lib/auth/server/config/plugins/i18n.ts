import type { BetterAuthPlugin } from "better-auth";
import { i18n, locales } from "@better-auth/i18n";

export const BetterAuthI18nServerConfig = i18n({
  translations: locales,
}) satisfies BetterAuthPlugin;
