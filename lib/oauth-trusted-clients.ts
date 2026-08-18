// client_ids de primera parte (trusted), inmutables vía CRUD del plugin.
// Espejo client-side de BETTER_AUTH_OAUTH_TRUSTED_CLIENTS (servidor) para
// mostrar el estado en el dashboard sin exponer nada sensible (los client_ids
// no son secretos).
export const isTrustedClient = (clientId: string): boolean => {
  const raw = process.env.NEXT_PUBLIC_BETTER_AUTH_OAUTH_TRUSTED_CLIENTS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(clientId);
};
