import type { BetterAuthClientPlugin } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";

export const BetterAuthEmailOtpClientConfig = emailOTPClient() satisfies BetterAuthClientPlugin;
