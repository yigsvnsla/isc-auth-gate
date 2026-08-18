# OAuth Test Client

App 3rd party independiente para probar la integración con ISC Auth
(Authorization Code + PKCE). Simula una aplicación externa real:
redirige al authorize endpoint, recibe el `code` en su callback, lo canjea
por tokens y llama a un recurso protegido (`/oauth2/userinfo`).

## Requisitos

- Dev server de ISC Auth corriendo en `http://localhost:3000`
- Un cliente OAuth registrado en el dashboard
  (`/dashboard/administration/oauth` → New Client) con redirect URI:
  `http://localhost:4000/callback`

## Uso

```bash
ISC_CLIENT_ID=<client_id> ISC_CLIENT_SECRET=<client_secret> bun index.ts
```

Abrir `http://localhost:4000` → click **Login with ISC**:

1. El browser va al authorize endpoint de ISC (PKCE S256)
2. Login si hace falta → consent page → **Autorizar**
3. Redirige de vuelta a `http://localhost:4000/callback?code=...`
4. La app canjea el code (`client_secret_basic` + verifier) y muestra:
   tokens emitidos + respuesta de `/oauth2/userinfo`

## Configuración

| Variable | Default | Descripción |
|---|---|---|
| `ISC_CLIENT_ID` | — | Client ID del registro (requerido) |
| `ISC_CLIENT_SECRET` | — | Client secret (confidencial) |
| `ISC_ISSUER` | `http://localhost:3000/api/auth` | Base del issuer |
| `PORT` | `4000` | Puerto del test client |

## Qué validar

- Consent page renderiza branding + scopes → Autorizar/Rechazar
- El code llega al callback con el `state` intacto
- Token exchange con PKCE + secret → access/refresh/id token
- `userinfo` responde los claims del usuario con el Bearer token
- Segundo authorize sin revocar el consent → no pide consentimiento
- Revocar el consent en la tab Consents → el próximo authorize lo vuelve a pedir
