import { afterEach, describe, expect, it } from "bun:test";

// Regresión: z.coerce.boolean() es Boolean(valor), y Boolean("false") === true.
// Una var de env llega siempre como string, así que poner "false" activaba TLS
// contra un Postgres sin TLS (todas las queries del app fallaban en dev).
// z.stringbool() sí distingue.
//
// Los presets de t3-env validan al importarse, así que cada caso importa el
// módulo de nuevo (query única) con el env ya preparado.
const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});

const base = {
  BETTER_AUTH_URL: "https://auth.example.com",
  BETTER_AUTH_SERVER_NAME: "test",
  BETTER_AUTH_SERVER_SECRET: "secret",
  BETTER_AUTH_DATABASE_HOST: "db",
  BETTER_AUTH_DATABASE_NAME: "app",
  BETTER_AUTH_DATABASE_PORT: "5432",
  BETTER_AUTH_DATABASE_USER: "u",
  BETTER_AUTH_DATABASE_PASS: "p",
};

const campos = [
  ["BETTER_AUTH_DATABASE_SSL", "database.schema", "databaseEnviroment"],
  ["BETTER_AUTH_DATABASE_DEBUG", "database.schema", "databaseEnviroment"],
  ["BETTER_AUTH_SERVER_DEBUG", "server.schema", "serverEnviroment"],
  ["BETTER_AUTH_CAPTCHA_ENABLED", "captcha.schema", "captchaEnviroment"],
] as const;

let n = 0;
const parse = async (
  modulo: string,
  exportName: string,
  nombre: string,
  valor: string,
) => {
  delete process.env.NEXT_PHASE;
  Object.assign(process.env, base, { [nombre]: valor });
  const mod = await import(`@/env/server/schemas/${modulo}?bool=${++n}`);
  return mod[exportName][nombre];
};

describe("boolean env vars parsean 'false' como false", () => {
  for (const [nombre, modulo, exportName] of campos) {
    it(nombre, async () => {
      expect(await parse(modulo, exportName, nombre, "false")).toBe(false);
      expect(await parse(modulo, exportName, nombre, "true")).toBe(true);
      expect(await parse(modulo, exportName, nombre, "0")).toBe(false);
      expect(await parse(modulo, exportName, nombre, "1")).toBe(true);
    });
  }
});
