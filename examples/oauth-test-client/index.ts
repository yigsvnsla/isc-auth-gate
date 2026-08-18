#!/usr/bin/env bun
/**
 * OAuth 2.1 test client — app 3rd party independiente.
 *
 * Simula una aplicación externa que integra con ISC Auth:
 *   1. / → genera PKCE y redirige al authorize endpoint
 *   2. /callback → recibe el code, lo canjea por tokens (client_secret_basic)
 *   3. Llama a /oauth2/userinfo con el access token y muestra el resultado
 *
 * Uso:
 *   ISC_CLIENT_ID=<client_id> ISC_CLIENT_SECRET=<client_secret> bun index.ts
 *
 * Requiere un cliente registrado en el dashboard con redirect URI:
 *   http://localhost:4000/callback
 */
import { createHash, randomBytes } from "crypto";

const PORT = Number(process.env.PORT ?? 4000);
const ISSUER = process.env.ISC_ISSUER ?? "http://localhost:3000/api/auth";
const CLIENT_ID = process.env.ISC_CLIENT_ID;
const CLIENT_SECRET = process.env.ISC_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPE = "openid profile email offline_access";

if (!CLIENT_ID) {
  console.error(
    "Falta ISC_CLIENT_ID. Crea un cliente en el dashboard con redirect URI:",
    REDIRECT_URI,
  );
  process.exit(1);
}

const basicAuth = `Basic ${Buffer.from(
  `${CLIENT_ID}:${CLIENT_SECRET ?? ""}`,
).toString("base64")}`;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Página de inicio — link para iniciar el flujo
    if (url.pathname === "/") {
      const verifier = randomBytes(32).toString("base64url");
      const challenge = createHash("sha256")
        .update(verifier)
        .digest("base64url");
      const state = `state-${randomBytes(4).toString("hex")}`;

      // Guardamos verifier/state en una cookie para el callback
      const cookie = `oauth_verifier=${verifier}; Path=/; HttpOnly`;
      const authorizeUrl =
        `${ISSUER}/oauth2/authorize?` +
        new URLSearchParams({
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          response_type: "code",
          scope: SCOPE,
          state,
          code_challenge: challenge,
          code_challenge_method: "S256",
        });

      return new Response(
        `<html><body style="font-family:system-ui;padding:3rem">
          <h1>OAuth Test Client</h1>
          <p>App 3rd party independiente probando ISC Auth (${ISSUER})</p>
          <a href="${authorizeUrl}" style="display:inline-block;padding:.8rem 1.5rem;background:#2563eb;color:#fff;border-radius:.5rem;text-decoration:none">
            Login with ISC
          </a>
          <pre style="margin-top:2rem;background:#f3f4f6;padding:1rem;border-radius:.5rem;overflow:auto">${authorizeUrl}</pre>
        </body></html>`,
        { headers: { "content-type": "text/html; charset=utf-8", "set-cookie": cookie } },
      );
    }

    // Callback — ISC redirige aquí con ?code=...&state=...
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");
      const verifier = getCookie(req.headers.get("cookie"), "oauth_verifier");

      if (error) {
        return html(`<h1>Acceso denegado</h1><pre>${JSON.stringify({ error, description: url.searchParams.get("error_description") })}</pre>`);
      }

      if (!code || !verifier) {
        return html("<h1>Falta code o verifier</h1>");
      }

      // 1. Canjear code por tokens
      const tokenRes = await fetch(`${ISSUER}/oauth2/token`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          authorization: basicAuth,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        }).toString(),
      });
      const tokens = await tokenRes.json();

      if (!tokenRes.ok) {
        return html(`<h1>Token exchange falló (${tokenRes.status})</h1><pre>${JSON.stringify(tokens, null, 2)}</pre>`);
      }

      // 2. Llamar al recurso protegido (userinfo) con el access token
      const userinfoRes = await fetch(`${ISSUER}/oauth2/userinfo`, {
        headers: { authorization: `Bearer ${tokens.access_token}` },
      });
      const userinfo = await userinfoRes.json();

      return html(`
        <h1>¡Autenticado!</h1>
        <p><strong>state:</strong> ${state ?? "—"}</p>
        <h2>Tokens</h2>
        <pre>${JSON.stringify(
          {
            access_token: tokens.access_token?.slice(0, 40) + "...",
            refresh_token: tokens.refresh_token ? tokens.refresh_token.slice(0, 40) + "..." : null,
            id_token: tokens.id_token ? tokens.id_token.slice(0, 40) + "..." : null,
            expires_in: tokens.expires_in,
            token_type: tokens.token_type,
          },
          null,
          2,
        )}</pre>
        <h2>userinfo (${userinfoRes.status})</h2>
        <pre>${JSON.stringify(userinfo, null, 2)}</pre>
        <p><a href="/">Probar de nuevo</a></p>
      `);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`OAuth test client en http://localhost:${PORT}`);
console.log(`Issuer: ${ISSUER} | client_id: ${CLIENT_ID}`);

function getCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function html(body: string): Response {
  return new Response(
    `<html><head><meta charset="utf-8"></head><body style="font-family:system-ui;padding:3rem;max-width:720px">${body}</body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
