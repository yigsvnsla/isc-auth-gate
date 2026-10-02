import { env } from "@/env/server";

/**
 * Qué proveedores opcionales están realmente configurados.
 *
 * ponytail: un solo lugar decide "habilitado/no". `lib/auth/server/config/plugins/` registra
 * plugins con estos flags y `app/setup/page.tsx` los muestra en el panel de
 * estado, así que la UI y el runtime nunca discrepan.
 *
 * - Microsoft exige tenantId CONCRETO: `microsoftEntraId({ tenantId: "common" })`
 *   lanza "requires a concrete Microsoft Entra tenant GUID" y tumba cada página
 *   de auth. Por eso el GUID es parte del flag, no un default.
 * - Para añadir GitHub/Google: añade sus vars a env/server/schemas/, un flag aquí y
 *   su archivo condicional en lib/auth/server/config/plugins/.
 */
export const microsoftConfigured = Boolean(
  env.BETTER_AUTH_MICROSOFT_CLIENT_ID &&
    env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET &&
    env.BETTER_AUTH_MICROSOFT_TENANT_ID,
);

export const smtpConfigured = Boolean(
  env.BETTER_AUTH_SMTP_TRANSPORTER_HOST &&
    env.BETTER_AUTH_SMTP_TRANSPORTER_USER &&
    env.BETTER_AUTH_SMTP_TRANSPORTER_PASS,
);

/** Aviso único al arrancar: config a medias es el error más común en Dokploy. */
export function logProviderWarnings(): void {
  const missing = (
    required: [name: string, value: string | undefined][],
  ): string[] =>
    required.filter(([, value]) => !value).map(([name]) => name);

  const msMissing = missing([
    ["BETTER_AUTH_MICROSOFT_CLIENT_ID", env.BETTER_AUTH_MICROSOFT_CLIENT_ID],
    [
      "BETTER_AUTH_MICROSOFT_CLIENT_SECRET",
      env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET,
    ],
    ["BETTER_AUTH_MICROSOFT_TENANT_ID", env.BETTER_AUTH_MICROSOFT_TENANT_ID],
  ]);
  if (msMissing.length > 0 && msMissing.length < 3) {
    console.warn(
      `[providers] Microsoft OAuth DESHABILITADO — falta: ${msMissing.join(", ")}`,
    );
  }

  const smtpMissing = missing([
    [
      "BETTER_AUTH_SMTP_TRANSPORTER_HOST",
      env.BETTER_AUTH_SMTP_TRANSPORTER_HOST,
    ],
    [
      "BETTER_AUTH_SMTP_TRANSPORTER_USER",
      env.BETTER_AUTH_SMTP_TRANSPORTER_USER,
    ],
    [
      "BETTER_AUTH_SMTP_TRANSPORTER_PASS",
      env.BETTER_AUTH_SMTP_TRANSPORTER_PASS,
    ],
  ]);
  if (smtpMissing.length > 0 && smtpMissing.length < 3) {
    console.warn(
      `[providers] SMTP DESHABILITADO — falta: ${smtpMissing.join(", ")}`,
    );
  }
}
