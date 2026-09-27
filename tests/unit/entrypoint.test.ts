import { describe, expect, it } from "bun:test";

import { waitForDatabase } from "@/entrypoint";

// El arranque de producción depende de que este loop neither cuelgue ni se
// rinda. El modo de falla caro: Bun.connect sólo rechaza la promise si el
// puerto rechaza; un host que no resuelve DNS únicamente emite 'error' y
// deja la promise colgada para siempre, así que el contenedor se queda
// arrancando sin error visible hasta que Dokploy lo mata.
describe("waitForDatabase", () => {
  it("resuelve en el primer intento si algo escucha", async () => {
    const server = Bun.serve({ port: 0, fetch: () => new Response("ok") });
    try {
      await waitForDatabase({
        host: "127.0.0.1",
        port: server.port,
        attempts: 3,
        delayMs: 10,
        timeoutMs: 2000,
      });
    } finally {
      server.stop(true);
    }
  });

  it("falla nombrando host:puerto tras agotar los intentos", async () => {
    // Puerto cerrado: ECONNREFUSED inmediato, sin esperar el timeout.
    const cerrado = Bun.serve({ port: 0, fetch: () => new Response("ok") });
    const puerto = cerrado.port;
    cerrado.stop(true);

    const promise = waitForDatabase({
      host: "127.0.0.1",
      port: puerto,
      attempts: 2,
      delayMs: 10,
      timeoutMs: 2000,
    });
    await expect(promise).rejects.toThrow(
      `DB no responde tras 2 intentos: 127.0.0.1:${puerto}`,
    );
  });

  it("corta el intento por timeout en vez de colgarse", async () => {
    // 203.0.113.0/24 es TEST-NET-3 (RFC 5737): nunca rutea, el paquete se
    // pierde. Sin el timer por intento el loop no terminaría nunca.
    const inicio = Date.now();
    await expect(
      waitForDatabase({
        host: "203.0.113.1",
        port: 5432,
        attempts: 1,
        delayMs: 0,
        timeoutMs: 300,
      }),
    ).rejects.toThrow(/timeout/);
    expect(Date.now() - inicio).toBeLessThan(3000);
  });
});
