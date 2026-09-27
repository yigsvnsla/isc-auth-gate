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
# Event-driven + timeout por intento: Bun.connect solo rechaza la promise si el
# puerto rechaza la conexión; si el host no resuelve (DNS) únicamente emite
# 'error' y la promise queda colgada para siempre.
until bun -e "
const t = setTimeout(() => process.exit(1), 3000);
Bun.connect({
  hostname: process.env.BETTER_AUTH_DATABASE_HOST,
  port: Number(process.env.BETTER_AUTH_DATABASE_PORT),
  socket: {
    data() {},
    open(sock) { sock.end(); clearTimeout(t); process.exit(0); },
    close() {},
    error() { clearTimeout(t); process.exit(1); },
  },
});
" 2>/dev/null; do
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
# OJO: el subcomando es `migrate`. `up` solo migra el formato de la carpeta out
# (imprime "Everything's fine" y no toca la DB).
if ! bun node_modules/drizzle-kit/bin.cjs migrate; then
  # drizzle-kit falla con exit 1 y sin mensaje útil (solo el spinner) cuando la
  # DB tiene tablas pero ningún journal en el esquema `drizzle`: pasa cuando la
  # base se creó con `database:push`. Remédalo con:
  #   bun run database:generate --custom   (migración vacía = baseline)
  #   bun run database:up
  echo "Migraciones fallaron. Si la DB tiene tablas pero no el esquema 'drizzle', fue creada con database:push y necesita baseline (ver AGENTS.md)." >&2
  exit 1
fi

echo "==> Arrancando aplicación..."
exec bun server.js
