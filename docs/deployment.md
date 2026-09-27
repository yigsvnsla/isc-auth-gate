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

## Imagen

`.containers/Containerfile` en el repo, multi-stage. Es el único archivo de
build: ambos workflows lo referencian con `file: .containers/Containerfile`.

1. **install** — `bun install --frozen-lockfile` completo, y aparte
   `--production` en `/temp/prod`.
2. **prerelease** — `bun run build` con Next.js `output: "standalone"`, y copia
   `public` y `.next/static` dentro de `.next/standalone/`.
3. **runner** — copia solo `.next/standalone` + `node_modules` de producción +
   lo necesario para migrar (`drizzle.config.ts`, `database/`, `env/`,
   `tsconfig.json`, `entrypoint.ts`). Arranca con `bun entrypoint.ts`, que
   valida el env, espera la DB, migra y recién entonces levanta el server.

## Build args

Sólo una, y es obligatoria:

```env
NEXT_PUBLIC_BETTER_AUTH_URL=https://<dominio-ambiente>
```

`next build` la compila dentro del bundle del **cliente**
(`lib/auth/auth-client.ts` la usa como `baseURL`), así que no hay forma de
moverla a runtime. Sin ella el bundle compila con `baseURL: undefined` y el
login desde el navegador falla aunque el servidor esté sano.

**No se pasan más build args.** Las vars de servidor no las necesita el build:
`env/index.ts` devuelve un stub cuando no hay ninguna variable de la app
presente, porque `lib/auth/auth.tsx` y compañía leen env en el scope del módulo
y Next ejecuta esos módulos al recolectar datos de página. Un contenedor
arrancado sin env completo lo detecta `entrypoint.ts` y aborta.

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
   (branch `main`), provider **Dockerfile** (ruta
   `.containers/Containerfile`, que es lo que declaran los workflows).
2. Configurar **Build Args** y **Environment** (tablas anteriores).
3. Deploy. Las migraciones las aplica solo el `entrypoint.ts` en cada arranque
   (idempotente, usa la journal de drizzle) — no hace falta correrlas a mano.
   Correrlas a mano sólo para un baseline:
4. Dominio en Traefik (Let's Encrypt) → container :3000.
5. Healthcheck: `GET /healthz` (rewrite de `next.config.ts` hacia
   `/api/health`) → `{"status":"ok"}`. Es la ruta que usa el `HEALTHCHECK` del
   Containerfile; en Dokploy se puede usar la misma.

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
