# Deployment guide

Ambientes desplegados en **Dokploy** (Docker + Traefik). La imagen se construye
en GitHub Actions, se publíca en GHCR y Dokploy solo despliega (provider
**Image**). Cada ambiente es una aplicación Dokploy propia con su Postgres.

## CI/CD (GitHub Actions)

| Workflow | Trigger | Acción |
|---|---|---|
| `.github/workflows/ci-deploy-dev.yaml` | push a `main` | lint + tests (postgres efímero) → build & push `ghcr.io/yigsvnsla/isc-auth-gate:dev` (+ `:sha`) → deploy app dev → health check |
| `.github/workflows/deploy-preprod.yaml` | manual (`workflow_dispatch`, input `image_tag`, default `pre`) | idem, con build args pre, tags `pre`/`sha`; para rollback pasar un SHA como `image_tag` |

Contract con Dokploy:

```bash
bun x dokploy application save-docker-provider \
  --applicationId <id> --dockerImage ghcr.io/yigsvnsla/isc-auth-gate:<tag>
bun x dokploy application deploy --applicationId <id>
```

CLI autenticada con env `DOKPLOY_URL` + `DOKPLOY_API_KEY` (`@dokploy/cli`,
devDependency). Útil también manual:

```bash
bun x dokploy project all          # descubrir applicationId / environmentId
bun x dokploy application one --applicationId <id>
```

### Secrets GitHub (Settings → Secrets and variables → Actions)

| Secret | Origen |
|---|---|
| `DOKPLOY_URL` | `https://dokploy.integritysolutions.com.ec` |
| `DOKPLOY_API_KEY` | Dokploy → Profile → Generate API Key |
| `DOKPLOY_APP_ID_DEV` / `DOKPLOY_APP_ID_PRE` | applicationId de cada app |
| `BETTER_AUTH_URL_DEV` / `BETTER_AUTH_URL_PRE` | dominio con `/` final |
| `NEXT_PUBLIC_BETTER_AUTH_URL_DEV` / `NEXT_PUBLIC_BETTER_AUTH_URL_PRE` | dominio sin `/` |
| `DOMAIN_DEV` / `DOMAIN_PRE` | dominio público, usado por el health check |

Tests en CI corren contra un postgres efímero (service container) con
`BETTER_AUTH_TEST_ALLOW_TRUNCATE=true` — nunca contra la db dev.

## Imagen Docker

`Dockerfile` en la raíz del repo, multi-stage:

1. **deps** — `bun install --frozen-lockfile` (oven/bun:1).
2. **builder** — `bun run build` con Next.js `output: "standalone"`. Copia
   `public` y `.next/static` dentro de `.next/standalone/`.
3. **runner** — `oven/bun:1-slim`, copia solo `.next/standalone` + lo necesario
   para migraciones de Drizzle (`drizzle.config.ts`, `database/`, `env/`,
   `tsconfig.json`, `drizzle-kit`, `drizzle-orm`, `pg`, `zod`).
   Arranca con `bun server.js`.

## Build args (obligatorio por ambiente)

`next build` compila las variables `NEXT_PUBLIC_*` dentro del bundle. Deben
pasarse como **build args** en Dokploy, no solo como env runtime:

```env
NEXT_PUBLIC_BETTER_AUTH_URL=https://<dominio-ambiente>
BETTER_AUTH_URL=https://<dominio-ambiente>
```

Las demás env del build son placeholders (el Dockerfile usa
`build-placeholder` automáticamente) porque `env/index.ts` valida con Zod al
importar durante el build. Las env reales van en runtime.

## Environment (runtime) — Dokploy UI

Mismas variables que `.env.example`. Por ambiente:

| Var | Dev | Preprod |
|---|---|---|
| `BETTER_AUTH_URL` | `https://<dev>/` | `https://<pre>/` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://<dev>` | `https://<pre>` |
| `BETTER_AUTH_SERVER_TRUSTED_ORIGINS` | dominios dev, comma-separated | dominios pre, comma-separated |
| `BETTER_AUTH_SERVER_SECRET` | secreto dev | secreto pre |
| `BETTER_AUTH_DATABASE_HOST` | host db dev | host db pre |
| `BETTER_AUTH_DATABASE_NAME` | `isc-auth-dev` | `isc-auth-pre` |
| `BETTER_AUTH_DATABASE_SSL` | `false` | `true` si requiere SSL |
| `BETTER_AUTH_SERVER_DEBUG` | opcional `true` | `false` |

Rate-limit compartido entre instancias (opcional): `REDIS_URL` +
`BETTER_AUTH_RATE_LIMIT_STORAGE=redis`. En single-instancia deja `memory`.

## Postgres

Crear un servicio Postgres en Dokploy **por ambiente** (Docker Service o
Compose con volumen persistente). Nunca compartir DB entre ambientes —
`cleanupTestDb()` y seed no deben correr contra preprod.

## Proceso de despliegue (Dokploy)

1. Project nuevo → Application apuntando a `yigsvnsla/isc-auth-gate`
   (branch `main`), provider **Dockerfile**.
2. Configurar **Build Args** y **Environment** (tablas anteriores).
3. Primera vez + cambios de schema: correr migración dentro del container
   (Dokploy → Terminal):

   ```bash
   bun run database:up    # aplica migraciones de database/migrations
   ```

   Alternativa dev rápido sin archivo de migración:

   ```bash
   bun run database:push
   ```

4. Deploy. Dominio en Traefik (Let's Encrypt) → container :3000.
5. Healthcheck: `GET /api/health` → `{"status":"ok"}` (usar como healthcheck
   path en Dokploy).

## Microsoft Entra ID (por ambiente)

App registration separada:

- nombre `isc-auth-gate-dev` / `isc-auth-gate-pre`
- redirect URI: `https://<dominio-ambiente>/api/auth/callback/microsoft`
- copiar client ID y secret a las env del ambiente.

## Verificación post-deploy

1. `curl https://<dominio>/api/health` → 200.
2. Login Microsoft → callback OK, sesión persiste.
3. Dashboard admin carga usuarios / organizaciones.
4. Flujo email (verify/reset) entrega por SMTP del ambiente.
