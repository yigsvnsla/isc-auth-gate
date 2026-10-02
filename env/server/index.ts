import { createEnv } from "@t3-oss/env-nextjs";
import {
  serverEnviroment,
  smtpEnviroment,
  databaseEnviroment,
  oAuthEnviroment,
  captchaEnviroment,
  microsoftProviderEnviroment,
} from "./schemas";

// ponytail: import relativo, no "@/env/server/schemas" — next.config.ts
// importa este módulo y Next lo carga sin resolver los alias de tsconfig.

const isServer: boolean = typeof window === "undefined";
const isBuilding: boolean = process.env.NEXT_PHASE === "phase-production-build";

export const env = createEnv({
  isServer: isServer,
  skipValidation: isBuilding,
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
  extends: [
    serverEnviroment,
    smtpEnviroment,
    databaseEnviroment,
    oAuthEnviroment,
    captchaEnviroment,
    microsoftProviderEnviroment,
  ],
});
