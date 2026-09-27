import { afterEach, describe, expect, it } from "bun:test";

// Regresión de seguridad: `getEnv()` devuelve un stub cuando NO hay ninguna
// variable de la app, para que `next build` compile sin secretos. Ese stub no
// debe poder llegar a producción: si hay una sola variable presente, el parse
// falla y el error se relanza, y `entrypoint.ts` aborta el arranque.
describe("getEnv tolera el build pero no una config rota", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  const borrarApp = () => {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("BETTER_AUTH_") || key === "REDIS_URL") {
        delete process.env[key];
      }
    }
  };

  it("devuelve el stub cuando no hay ninguna variable de la app", async () => {
    borrarApp();
    const { getEnv } = await import(`@/env?caso=stub-${Date.now()}`);
    const env = getEnv();
    // Valores de relleno: si alguno se cuela a runtime, el síntoma es obvio
    // (baseURL build.invalid) en vez de silencioso.
    expect(env.BETTER_AUTH_URL).toBe("http://build.invalid");
    expect(env.BETTER_AUTH_SERVER_SECRET).toBe("build-only-not-a-real-secret");
    expect(env.BETTER_AUTH_DATABASE_PORT).toBe(5432);
  });

  it("relanza el error si hay una variable de la app pero está incompleta", async () => {
    borrarApp();
    // Una sola variable presente = alguien configuró algo = runtime. El stub
    // escondería el resto de las faltantes.
    process.env.BETTER_AUTH_URL = "https://auth.example.com";
    const { getEnv } = await import(`@/env?caso=rota-${Date.now()}`);
    expect(() => getEnv()).toThrow();
  });

  it("relanza con SÓLO vars de DB presentes (el caso que filtraba el stub)", async () => {
    borrarApp();
    // Configuración parcial real: Dokploy con las cinco de DB pegadas pero sin
    // BETTER_AUTH_URL. El criterio "alguna variable de la app" debe disparar
    // el throw, no devolver un stub con baseURL build.invalid.
    process.env.BETTER_AUTH_DATABASE_HOST = "db.example.com";
    process.env.BETTER_AUTH_DATABASE_NAME = "app";
    process.env.BETTER_AUTH_DATABASE_PORT = "5432";
    process.env.BETTER_AUTH_DATABASE_USER = "u";
    process.env.BETTER_AUTH_DATABASE_PASS = "p";
    const { getEnv } = await import(`@/env?caso=solodb-${Date.now()}`);
    expect(() => getEnv()).toThrow();
  });

  it("no monta providers de mentira en el stub", async () => {
    borrarApp();
    const { getEnv } = await import(`@/env?caso=providers-${Date.now()}`);
    const env = getEnv();
    // Sin esto, `lib/providers.ts` leería truthy durante el build y
    // auth.tsx registraría un plugin de Microsoft con credenciales falsas.
    expect(env.BETTER_AUTH_MICROSOFT_CLIENT_ID).toBeUndefined();
    expect(env.BETTER_AUTH_SMTP_TRANSPORTER_HOST).toBeUndefined();
  });
});
