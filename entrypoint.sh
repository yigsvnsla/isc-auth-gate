#!/bin/sh
# ---------------------------------------------------------------------------
# Entrypoint de producción (Dokploy): aplica migraciones pendientes antes de
# arrancar. Idempotente — drizzle-kit registra las aplicadas en la journal.
#
# ponytail: wait-loop TCP con bun (pg_isready no existe en la imagen oven/bun,
# y añadir postgres-client pesa más que 6 líneas).
# ---------------------------------------------------------------------------
set -e

echo "==> Esperando base de datos..."
i=0
until bun -e "Bun.connect({hostname:'$BETTER_AUTH_DATABASE_HOST',port:$BETTER_AUTH_DATABASE_PORT}).then(c=>{c.end();process.exit(0)}).catch(()=>process.exit(1))"; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "DB no responde tras 300s" >&2
    exit 1
  fi
  sleep 10
done

echo "==> Aplicando migraciones..."
# ponytail: bin.cjs directo en vez de `bun run database:up` — el runner stage
# copia node_modules/drizzle-kit sin .bin/, y `bun x` iría a la red a buscarlo.
bun node_modules/drizzle-kit/bin.cjs up

echo "==> Arrancando aplicación..."
exec bun server.js
