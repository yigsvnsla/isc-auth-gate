#!/usr/bin/env bun
export {};
/**
 * Device Flow (RFC 8628) CLI test — app 3rd party en un dispositivo sin
 * navegador (CLI, TV, IoT).
 *
 *   1. Solicita un device code al servidor
 *   2. Muestra el user_code + URL de verificación para que el usuario
 *      apruebe/niegue el acceso en /auth/device con su sesión
 *   3. Hace polling del token endpoint hasta que el usuario aprueba
 *
 * Uso:
 *   ISC_CLIENT_ID=<client_id> ISC_CLIENT_SECRET=<client_secret> bun index.ts
 *
 * Requiere un cliente registrado en el dashboard con grant types:
 *   urn:ietf:params:oauth:grant-type:device_code
 */
const ISSUER = process.env.ISC_ISSUER ?? "http://localhost:3000/api/auth";
const CLIENT_ID = process.env.ISC_CLIENT_ID;
const CLIENT_SECRET = process.env.ISC_CLIENT_SECRET;
const SCOPE = "openid profile email offline_access";

if (!CLIENT_ID) {
  console.error(
    "Falta ISC_CLIENT_ID. Crea un cliente device en el dashboard " +
      "(grant: urn:ietf:params:oauth:grant-type:device_code).",
  );
  process.exit(1);
}

const basicAuth = `Basic ${Buffer.from(
  `${CLIENT_ID}:${CLIENT_SECRET ?? ""}`,
).toString("base64")}`;

async function requestDeviceCode() {
  const res = await fetch(`${ISSUER}/device/code`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: basicAuth,
    },
    body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPE }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("device/code falló:", res.status, JSON.stringify(json));
    process.exit(1);
  }
  return json as {
    device_code: string;
    user_code: string;
    verification_uri: string;
    verification_uri_complete?: string;
    expires_in: number;
    interval: number;
  };
}

async function pollToken(deviceCode: string, interval: number) {
  for (;;) {
    const res = await fetch(`${ISSUER}/oauth2/token`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: basicAuth,
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
        client_id: CLIENT_ID!,
      }).toString(),
    });
    const json = await res.json();

    if (res.ok) {
      return json as {
        access_token: string;
        refresh_token?: string;
        id_token?: string;
        expires_in: number;
        token_type: string;
      };
    }
    if (json.error === "authorization_pending") {
      console.log(`  ⏳ ${"esperando aprobación…".padEnd(26)} (poll en ${interval}s)`);
    } else if (json.error === "slow_down") {
      interval += 5;
      console.log("  🐢 polling más lento");
    } else {
      console.error("Poll falló:", res.status, JSON.stringify(json));
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, interval * 1000));
  }
}

const info = await requestDeviceCode();

console.log(`
╔══════════════════════════════════════════════╗
║  ISC Auth — Device Authorization (RFC 8628)  ║
╚══════════════════════════════════════════════╝

  1. En tu navegador ve a:
     ${info.verification_uri}

  2. Ingresa el código:

     ┌─────────────────────────┐
     │   ${info.user_code}   │
     └─────────────────────────┘

  3. Acepta el acceso con tu sesión de ISC Gate.

  Expira en ${Math.round(info.expires_in / 60)} min · interval ${info.interval}s
`);

const tokens = await pollToken(info.device_code, info.interval);

console.log("✅ Aprobado. Tokens recibidos:");
console.log(JSON.stringify(
  {
    access_token: tokens.access_token?.slice(0, 40) + "...",
    refresh_token: tokens.refresh_token ? tokens.refresh_token.slice(0, 40) + "..." : null,
    id_token: tokens.id_token ? tokens.id_token.slice(0, 40) + "..." : null,
    expires_in: tokens.expires_in,
    token_type: tokens.token_type,
  },
  null,
  2,
));