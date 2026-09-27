#!/usr/bin/env bun
// ---------------------------------------------------------------------------
// Entrypoint de producción (Dokploy): valida el env, espera la DB, aplica las
// migraciones pendientes y arranca el servidor. Idempotente — drizzle-kit
// registra las aplicadas en la journal.
//
// ponytail: espera TCP con Bun.connect en vez de pg_isready (no existe en la
// imagen oven/bun y postgres-client pesa más que unas líneas).
// ---------------------------------------------------------------------------

import { getEnv } from "@/env";

type ProbeOptions = {
  host: string;
  port: number;
  attempts: number;
  delayMs: number;
  timeoutMs: number;
};

function reason(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  return (e && (e.code || e.message)) || String(err);
}

/**
 * Un intento de conexión con timeout propio.
 *
 * Bun.connect sólo rechaza la promise si el puerto rechaza; si el host no
 * resuelve (DNS) únicamente emite 'error' y la promise queda colgada para
 * siempre. De ahí el timer: sin él, un DNS roto cuelga el arranque entero.
 */
function probe(host: string, port: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout: ${host}:${port} no aceptó en ${timeoutMs}ms`)),
      timeoutMs,
    );
    const done = (err?: unknown) => {
      clearTimeout(timer);
      if (err) reject(err);
      else resolve();
    };
    Bun.connect({
      hostname: host,
      port,
      socket: {
        data() {},
        open(sock) {
          sock.end();
          done();
        },
        close() {},
        error: done,
      },
    }).catch(done);
  });
}

export async function waitForDatabase({
  host,
  port,
  attempts,
  delayMs,
  timeoutMs,
}: ProbeOptions): Promise<void> {
  let last: unknown = "sin detalle";
  for (let i = 1; i <= attempts; i++) {
    try {
      await probe(host, port, timeoutMs);
      return;
    } catch (err) {
      last = err;
      console.error(`==> Intento ${i}/${attempts}: DB inalcanzable (${reason(err)})`);
      if (i < attempts) await Bun.sleep(delayMs);
    }
  }
  throw new Error(`DB no responde tras ${attempts} intentos: ${host}:${port} (${reason(last)})`);
}

async function main() {
  const host = process.env.BETTER_AUTH_DATABASE_HOST;
  const port = Number(process.env.BETTER_AUTH_DATABASE_PORT);
  if (!host || !port) {
    console.error("Faltan BETTER_AUTH_DATABASE_HOST o BETTER_AUTH_DATABASE_PORT");
    process.exit(1);
  }

  // Valida el env completo ANTES de esperar la DB o migrar. `env/index.ts`
  // devuelve un stub de build cuando no hay ninguna variable presente, así que
  // sin esto un contenedor arrancado sin env serviría con baseURL
  // `build.invalid` en vez de fallar. Este es el sitio correcto para esa
  // guarda: corre en el runtime y antes de que nada use el stub.
  //
  // ponytail: aquí, no en instrumentation.ts. El server.js de Next standalone
  // no invoca el hook `register()` — verificado: 0 referencias a
  // "instrumentation" en el server.js embebido en la imagen.
  try {
    getEnv();
  } catch (err) {
    console.error(
      `[entrypoint] Variables de entorno inválidas o incompletas.\n${
        err instanceof Error ? err.message : String(err)
      }\nRevisa el env en Dokploy: BETTER_AUTH_URL, BETTER_AUTH_SERVER_SECRET y las cinco BETTER_AUTH_DATABASE_* son obligatorias.`,
    );
    process.exit(1);
  }

  console.log(`==> Esperando base de datos en ${host}:${port}...`);
  await waitForDatabase({ host, port, attempts: 20, delayMs: 5000, timeoutMs: 3000 });
  console.log("==> DB alcanzable.");

  console.log("==> Aplicando migraciones...");
  // ponytail: bin.cjs directo en vez de `bun run database:up` — el runner copia
  // node_modules sin .bin/, y `bun x` iría a la red a buscarlo. El subcomando
  // es `migrate`; `up` sólo migra el formato de la carpeta out (imprime
  // "Everything's fine" y no toca la DB).
  const migrate = Bun.spawn(["bun", "node_modules/drizzle-kit/bin.cjs", "migrate"], {
    stdio: ["inherit", "inherit", "inherit"],
  });
  if ((await migrate.exited) !== 0) {
    // drizzle-kit falla con exit 1 y sin mensaje útil (sólo el spinner) cuando la
    // DB tiene tablas pero ningún journal en el esquema `drizzle`: pasa cuando
    // la base se creó con `database:push`. Remédalo con:
    //   bun run database:generate --custom   (migración vacía = baseline)
    //   bun run database:up
    console.error(
      "Migraciones fallaron. Si la DB tiene tablas pero no el esquema 'drizzle', fue creada con database:push y necesita baseline (ver AGENTS.md).",
    );
    process.exit(1);
  }

  console.log("==> Arrancando aplicación...");
  const server = Bun.spawn(["bun", "server.js"], { stdio: ["inherit", "inherit", "inherit"] });
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.on(signal, () => server.kill(signal));
  }
  process.exit(await server.exited);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
