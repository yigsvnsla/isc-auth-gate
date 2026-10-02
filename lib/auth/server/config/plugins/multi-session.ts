import type { BetterAuthPlugin } from "better-auth";
import { multiSession } from "better-auth/plugins";

export const BetterAuthMultiSessionServerConfig = multiSession({ maximumSessions: 5 }) satisfies BetterAuthPlugin;
