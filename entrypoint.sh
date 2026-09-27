#!/bin/sh
# ---------------------------------------------------------------------------
# Entrypoint de producción (Dokploy): aplica migraciones pendientes antes de
# arrancar. Idempotente — drizzle-kit registra las aplicadas en la journal.
#
# ponytail: wait-loop TCP con bun (pg_isready no existe en la imagen oven/bun,
# y añadir postgres-client pesa más que 6 líneas).
# ---------------------------------------------------------------------------
set -e

echo "==> Esperando base de datos en ${BETTER_AUTH_DATABASE_HOST}:${BETTER_AUTH_DATABASE_PORT}..."
i=0
last_error="sin detalle"
# Event-driven + timeout por intento: Bun.connect solo rechaza la promise si el
# puerto rechaza la conexión; si el host no resuelve (DNS) únicamente emite
# 'error' y la promise queda colgada para siempre.
# ponytail: el motivo del fallo se imprime en cada intento — tragarlo deja un
# 502 sin explicación cuando la DB es inalcanzable desde el contenedor.
until last_error=$(bun -e "
const host = process.env.BETTER_AUTH_DATABASE_HOST;
const port = Number(process.env.BETTER_AUTH_DATABASE_PORT);
if (!host) { console.error('BETTER_AUTH_DATABASE_HOST no está definida'); process.exit(1); }
const t = setTimeout(() => { console.error('timeout: ' + host + ':' + port + ' no aceptó en 3s'); process.exit(1); }, 3000);
Bun.connect({
  hostname: host,
  port,
  socket: {
    data() {},
    open(sock) { sock.end(); clearTimeout(t); process.exit(0); },
    close() {},
    error(err) { clearTimeout(t); console.error((err && (err.code || err.message)) || 'error de red'); process.exit(1); },
  },
}).catch((err) => { clearTimeout(t); console.error((err && (err.code || err.message)) || String(err)); process.exit(1); });
" 2>&1); do
  i=$((i + 1))
  echo "==> Intento $i/20: DB inalcanzable ($last_error)" >&2
  if [ "$i" -ge 20 ]; then
    echo "DB no responde tras $i intentos: ${BETTER_AUTH_DATABASE_HOST}:${BETTER_AUTH_DATABASE_PORT} ($last_error)" >&2
    exit 1
  fi
  sleep 5
done

echo "==> DB alcanzable."

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
