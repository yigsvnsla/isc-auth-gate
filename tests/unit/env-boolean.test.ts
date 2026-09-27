import { describe, expect, it } from "bun:test";

import { databaseEnv } from "@/env/database.schema";
import { serverEnv } from "@/env/server.schema";

// Regresión: z.coerce.boolean() es Boolean(valor), y Boolean("false") === true.
// Una var de env llega siempre como string, así que poner "false" activaba TLS
// contra un Postgres sin TLS (todas las queries del app fallaban en dev) y
// habilitaba el guard de TRUNCATE de los tests. z.stringbool() sí distingue.
const campos = [
  ["BETTER_AUTH_DATABASE_SSL", databaseEnv.shape.BETTER_AUTH_DATABASE_SSL],
  ["BETTER_AUTH_TEST_ALLOW_TRUNCATE", databaseEnv.shape.BETTER_AUTH_TEST_ALLOW_TRUNCATE],
  ["BETTER_AUTH_DATABASE_DEBUG", databaseEnv.shape.BETTER_AUTH_DATABASE_DEBUG],
  ["BETTER_AUTH_SERVER_DEBUG", serverEnv.shape.BETTER_AUTH_SERVER_DEBUG],
  ["BETTER_AUTH_CAPTCHA_ENABLED", serverEnv.shape.BETTER_AUTH_CAPTCHA_ENABLED],
] as const;

describe("boolean env vars parsean 'false' como false", () => {
  for (const [nombre, schema] of campos) {
    it(nombre, () => {
      expect(schema.parse("false")).toBe(false);
      expect(schema.parse("true")).toBe(true);
      expect(schema.parse("0")).toBe(false);
      expect(schema.parse("1")).toBe(true);
    });
  }
});
