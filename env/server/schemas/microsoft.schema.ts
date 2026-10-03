import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const microsoftProviderEnviroment = createEnv({
  server: {
    BETTER_AUTH_MICROSOFT_PROMPT: z
      .enum([
        "consent",
        "login",
        "select_account",
        "none",
        "select_account consent",
      ])

      .default("login"),
    // Obligatorios: Microsoft es el login de todos los ambientes.
    BETTER_AUTH_MICROSOFT_CLIENT_ID: z.string().min(1),
    // GUID concreto del tenant. `microsoftEntraId` lanza con "common",
    // "organizations" o cualquier no-GUID; validarlo aquí hace que un tenant
    // malo falle al arrancar (entrypoint) con el nombre de la variable, en
    // vez de tumbar cada página de auth al cargar el plugin.
    BETTER_AUTH_MICROSOFT_TENANT_ID: z.guid(),
    BETTER_AUTH_MICROSOFT_AUTHORITY: z.string(),
    BETTER_AUTH_MICROSOFT_CLIENT_SECRET: z.string().min(1),
    BETTER_AUTH_MICROSOFT_PROFILE_PHOTO_SIZE: z.preprocess(
      // El preprocess convierte el string a un número antes de que Zod valide
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),

      // Aquí validamos que el número convertido sea uno de los permitidos
      z.union([
        z.literal(48),
        z.literal(64),
        z.literal(96),
        z.literal(120),
        z.literal(240),
        z.literal(360),
        z.literal(432),
        z.literal(504),
        z.literal(648),
      ]),
    ),
    BETTER_AUTH_MICROSOFT_OVERRIDE_USER_INFO_ON_SIGN_IN: z.coerce
      .boolean()
      .default(false),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.NEXT_PHASE === "phase-production-build",
  isServer: typeof window === "undefined",
});
