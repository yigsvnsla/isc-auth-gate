import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
} from "bun:test";
import { testAuth } from "@/lib/auth.test";
import { cleanupTestDb, testDb } from "@/tests/database";
import { oauthClients } from "@/database/schema";
import { createHash } from "crypto";
import { DEVICE_CODE_GRANT_TYPE } from "@better-auth/oauth-provider";

const baseUrl = "http://localhost:3000/api/auth";

const hashClientSecret = (secret: string) =>
  createHash("sha256").update(secret).digest("base64url");

// Warm-up: la DB es remota y la primera conexión del pool tarda ~11s;
// hacerla fuera de hooks evita los timeouts de bun test.
await cleanupTestDb();

describe("OAuth 2.1 Device Authorization (RFC 8628)", () => {
  let testHelpers: Awaited<typeof testAuth.$context>["test"];

  beforeAll(async () => {
    const ctx = await testAuth.$context;
    testHelpers = ctx.test;
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  const call = async (
    path: string,
    init?: RequestInit,
  ): Promise<{
    status: number;
    json: Record<string, unknown>;
    location: string | null;
  }> => {
    const headers = new Headers(init?.headers);
    if (init?.method === "POST" && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    const res = await testAuth.handler(
      new Request(`${baseUrl}${path}`, { ...init, headers }),
    );
    return {
      status: res.status,
      json: await res.json().catch(() => null),
      location: res.headers.get("location"),
    };
  };

  const createDeviceClientInDb = async (
    clientId: string,
    secret: string,
  ) => {
    const now = new Date();
    await testDb.insert(oauthClients).values({
      id: `device-${clientId}`,
      clientId,
      clientSecret: hashClientSecret(secret),
      redirectUris: [],
      grantTypes: [DEVICE_CODE_GRANT_TYPE, "refresh_token"],
      responseTypes: ["code"],
      scopes: ["openid", "profile", "email", "offline_access"],
      tokenEndpointAuthMethod: "client_secret_basic",
      applicationType: "native",
      requirePKCE: false,
      subjectType: "public",
      disabled: false,
      createdAt: now,
      updatedAt: now,
    });
  };

  const loginUser = async (email: string) => {
    const user = testHelpers.createUser({
      email,
      name: "Device User",
      password: "password123456",
    });
    await testHelpers.saveUser(user);
    const { headers } = await testHelpers.login({ userId: user.id });
    return { user, headers };
  };

  it("device code → approve → token (device_code grant)", async () => {
    const { user, headers } = await loginUser("device-user@example.com");

    const clientId = "test-device-client-001";
    const clientSecret = "device-secret-0123456789";
    await createDeviceClientInDb(clientId, clientSecret);

    // 1. Solicitar código de dispositivo (auth según método registrado)
    const device = await call("/device/code", {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64url")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        scope: "openid profile email offline_access",
      }),
    });
    expect(device.status).toBe(200);
    const deviceInfo = device.json as {
      device_code: string;
      user_code: string;
      verification_uri: string;
      expires_in: number;
      interval: number;
    };
    expect(deviceInfo.device_code).toBeDefined();
    expect(deviceInfo.user_code).toBeDefined();
    expect(deviceInfo.verification_uri).toContain("/auth/device");
    expect(deviceInfo.expires_in).toBeGreaterThan(0);

    // 2. Verificar el user_code con sesión
    const verify = await call(
      `/device?user_code=${encodeURIComponent(deviceInfo.user_code)}`,
      { headers },
    );
    expect(verify.status).toBe(200);
    const verifyInfo = verify.json as {
      user_code: string;
      status: string;
      client_id: string;
    };
    expect(verifyInfo.client_id).toBe(clientId);
    expect(verifyInfo.status).toBe("pending");

    // 3. Poll antes de aprobar → authorization_pending
    const pending = await call("/oauth2/token", {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64url")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: DEVICE_CODE_GRANT_TYPE,
        device_code: deviceInfo.device_code,
        client_id: clientId,
      }).toString(),
    });
    expect(pending.status).toBe(400);
    expect(pending.json.error).toBe("authorization_pending");

    // 4. Aprobar en la página /auth/device (sesión ya verificó el user_code)
    const approve = await call("/device/approve", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...Object.fromEntries(headers.entries()),
      },
      body: JSON.stringify({ userCode: deviceInfo.user_code }),
    });
    expect(approve.status).toBe(200);

    // 5. Poll tras aprobar → tokens (respetar el intervalo del device code,
    //    RFC 8628 §3.5: poll más frecuente → slow_down)
    await new Promise((r) => setTimeout(r, deviceInfo.interval * 1000 + 500));
    const token = await call("/oauth2/token", {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64url")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: DEVICE_CODE_GRANT_TYPE,
        device_code: deviceInfo.device_code,
        client_id: clientId,
      }).toString(),
    });
    expect(token.status).toBe(200);
    const tokens = token.json as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    };
    expect(tokens.access_token).toBeDefined();
    expect(tokens.refresh_token).toBeDefined();
    expect(tokens.token_type).toBe("Bearer");

    // 6. userinfo con el access token del device flow
    const userinfo = await call("/oauth2/userinfo", {
      headers: { authorization: `Bearer ${tokens.access_token}` },
    });
    expect(userinfo.status).toBe(200);
    expect((userinfo.json as { sub: string }).sub).toBe(user.id);
  });

  it("deny → access_denied en el poll", async () => {
    const { headers } = await loginUser("device-deny@example.com");

    const clientId = "test-device-client-002";
    const clientSecret = "device-secret-9876543210";
    await createDeviceClientInDb(clientId, clientSecret);

    const device = await call("/device/code", {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64url")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        scope: "openid",
      }),
    });
    const deviceInfo = device.json as {
      device_code: string;
      user_code: string;
    };

    // Verificar el user_code con la sesión antes de rechazar
    const verify = await call(
      `/device?user_code=${encodeURIComponent(deviceInfo.user_code)}`,
      { headers },
    );
    expect(verify.status).toBe(200);

    const deny = await call("/device/deny", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...Object.fromEntries(headers.entries()),
      },
      body: JSON.stringify({ userCode: deviceInfo.user_code }),
    });
    expect(deny.status).toBe(200);

    const token = await call("/oauth2/token", {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64url")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: DEVICE_CODE_GRANT_TYPE,
        device_code: deviceInfo.device_code,
        client_id: clientId,
      }).toString(),
    });
    expect(token.status).toBe(400);
    expect(token.json.error).toBe("access_denied");
  });

  it("rejects an unregistered client", async () => {
    const device = await call("/device/code", {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`unknown-client:whatever`).toString("base64url")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: "unknown-client",
        scope: "openid",
      }),
    });
    // 1.7: Basic auth fallida → 401 invalid_client
    expect(device.status).toBe(401);
    expect(device.json.error).toBe("invalid_client");
  });
});