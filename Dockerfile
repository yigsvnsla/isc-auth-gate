# ---------------------------------------------------------------------------
# isc-auth-gate — imagen de producción (Next.js standalone + Bun migrations)
#
# Build requiere env vars dummy porque env/index.ts valida con Zod al
# importar durante `next build`. Las env reales se inyectan en runtime
# (Dokploy UI). NEXT_PUBLIC_BETTER_AUTH_URL se compila dentro del bundle:
# pasarlo como build-arg correcto por ambiente.
# ---------------------------------------------------------------------------

FROM oven/bun:1 AS deps
WORKDIR /app
ENV HUSKY=0
ENV TURBO_TELEMETRY_DISABLED=1
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
ENV HUSKY=0
ENV NODE_ENV=production

# Placeholders para validación Zod en build (nunca se usan en runtime)
ARG BETTER_AUTH_URL=http://placeholder.local
ARG NEXT_PUBLIC_BETTER_AUTH_URL=http://placeholder.local
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL}
ENV BETTER_AUTH_SERVER_NAME=build-placeholder
ENV BETTER_AUTH_SERVER_SECRET=build-placeholder
ENV BETTER_AUTH_SERVER_TRUSTED_ORIGINS=http://placeholder.local
ARG BETTER_AUTH_MICROSOFT_TENANT_ID=e97247bf-8fbb-4f1e-8610-2efb7a7342ea
ENV BETTER_AUTH_MICROSOFT_TENANT_ID=${BETTER_AUTH_MICROSOFT_TENANT_ID}
ENV BETTER_AUTH_DATABASE_HOST=build-placeholder
ENV BETTER_AUTH_DATABASE_NAME=build-placeholder
ENV BETTER_AUTH_DATABASE_PORT=5432
ENV BETTER_AUTH_DATABASE_USER=build-placeholder
ENV BETTER_AUTH_DATABASE_PASS=build-placeholder
ENV BETTER_AUTH_SMTP_TRANSPORTER_HOST=build-placeholder
ENV BETTER_AUTH_SMTP_TRANSPORTER_PORT=587
ENV BETTER_AUTH_SMTP_TRANSPORTER_USER=build-placeholder
ENV BETTER_AUTH_SMTP_TRANSPORTER_PASS=build-placeholder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build && \
    cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV BETTER_AUTH_DATABASE_DEBUG=false

RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --ingroup app app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/drizzle.config.ts /app/tsconfig.json ./
COPY --from=builder /app/database ./database
COPY --from=builder /app/env ./env
COPY --from=builder /app/package.json ./package.json

# drizzle-kit para migraciones (bun run database:up en deploy)
COPY --from=deps /app/node_modules/drizzle-kit ./node_modules/drizzle-kit
COPY --from=deps /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps /app/node_modules/pg ./node_modules/pg
COPY --from=deps /app/node_modules/zod ./node_modules/zod

USER app
EXPOSE 3000
CMD ["bun", "server.js"]
