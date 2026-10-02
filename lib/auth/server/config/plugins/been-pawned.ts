import type { BetterAuthPlugin } from "better-auth";
import { haveIBeenPwned } from "better-auth/plugins";

// HaveIBeenPwned: bloquea contraseñas filtradas (HIBP Pwned Passwords).
export const BetterAuthHaveIBeenPwnedServerConfig = haveIBeenPwned({
  customPasswordCompromisedMessage:
    "Esta contraseña ha aparecido en filtraciones. Elige otra.",
}) satisfies BetterAuthPlugin;
