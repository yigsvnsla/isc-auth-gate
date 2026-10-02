import type { BetterAuthClientPlugin } from "better-auth/client";
import { phoneNumberClient } from "better-auth/client/plugins";

export const BetterAuthPhoneNumberClientConfig = phoneNumberClient() satisfies BetterAuthClientPlugin;
