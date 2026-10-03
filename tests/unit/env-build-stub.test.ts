import { afterEach, describe, expect, it } from "bun:test";

// Regresión de seguridad: `next build` compila sin secretos, así que t3-env
// salta la validación en esa fase (NEXT_PHASE=phase-production-build). Fuera
// del build no debe saltarla: un contenedor con env incompleto tiene que
// fallar al importar `@/env/server` — es lo que hace abortar a entrypoint.ts.
//
// La validación vive en cada preset de env/server/schemas (env/server sólo los
// combina con `extends`), y cada preset valida al evaluarse: cada caso lo
// importa de nuevo con una query única y el env ya preparado.
describe("presets de @/env/server toleran el build pero no una config rota", () => {
  const original = { ...process.env };
  let n = 0;

  afterEach(() => {
    process.env = { ...original };
  });

  const borrarApp = () => {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("BETTER_AUTH_") || key === "REDIS_URL" || key === "NEXT_PHASE") {
        delete process.env[key];
      }
    }
  };

  const preset = (nombre: string) =>
    import(`@/env/server/schemas/${nombre}.schema?stub=${++n}`);

  it("no lanzan durante next build aunque no haya ninguna variable", async () => {
    borrarApp();
    process.env.NEXT_PHASE = "phase-production-build";
    for (const p of ["captcha", "database", "microsoft", "oauth", "server", "smtp"]) {
      await expect(preset(p)).resolves.toBeDefined();
    }
  });

  it("server lanza fuera del build si faltan URL, nombre y secret", async () => {
    borrarApp();
    await expect(preset("server")).rejects.toThrow();
  });

  it("database lanza fuera del build si falta la conexión", async () => {
    borrarApp();
    await expect(preset("database")).rejects.toThrow();
  });

  it("server lanza con SÓLO vars de DB presentes (el caso parcial de Dokploy)", async () => {
    borrarApp();
    // Configuración parcial real: Dokploy con las cinco de DB pegadas pero sin
    // BETTER_AUTH_URL ni BETTER_AUTH_SERVER_SECRET.
    process.env.BETTER_AUTH_DATABASE_HOST = "db.example.com";
    process.env.BETTER_AUTH_DATABASE_NAME = "app";
    process.env.BETTER_AUTH_DATABASE_PORT = "5432";
    process.env.BETTER_AUTH_DATABASE_USER = "u";
    process.env.BETTER_AUTH_DATABASE_PASS = "p";
    await expect(preset("database")).resolves.toBeDefined();
    await expect(preset("server")).rejects.toThrow();
  });

  it("los opcionales (SMTP, captcha) no exigen nada fuera del build", async () => {
    borrarApp();
    const smtp = await preset("smtp");
    const cap = await preset("captcha");
    expect(smtp.smtpEnviroment.BETTER_AUTH_SMTP_TRANSPORTER_HOST).toBeUndefined();
    expect(cap.captchaEnviroment.BETTER_AUTH_CAPTCHA_ENABLED).toBe(false);
  });

  describe("Microsoft es obligatorio y el tenant debe ser un GUID", () => {
    const microsoft = (tenant: string) => {
      process.env.BETTER_AUTH_MICROSOFT_CLIENT_ID = "client";
      process.env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET = "secret";
      process.env.BETTER_AUTH_MICROSOFT_AUTHORITY = "https://login.microsoftonline.com/";
      process.env.BETTER_AUTH_MICROSOFT_PROFILE_PHOTO_SIZE = "648";
      process.env.BETTER_AUTH_MICROSOFT_TENANT_ID = tenant;
    };

    it("lanza fuera del build sin las variables de Microsoft", async () => {
      borrarApp();
      await expect(preset("microsoft")).rejects.toThrow();
    });

    // microsoftEntraId lanza con un tenant no-GUID al construir el plugin:
    // validarlo en el schema lo convierte en un fallo de arranque legible.
    it("rechaza un tenant no-GUID (common)", async () => {
      borrarApp();
      microsoft("common");
      await expect(preset("microsoft")).rejects.toThrow();
    });

    it("acepta un tenant GUID", async () => {
      borrarApp();
      microsoft("e97247bf-8fbb-4f1e-8610-2efb7a7342ea");
      const ms = await preset("microsoft");
      expect(ms.microsoftProviderEnviroment.BETTER_AUTH_MICROSOFT_TENANT_ID).toBe(
        "e97247bf-8fbb-4f1e-8610-2efb7a7342ea",
      );
    });
  });
});
