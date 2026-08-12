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
import { createHash, randomBytes } from "crypto";

const baseUrl = "http://localhost:3000/api/auth";

// Nota sobre el alcance:
// - El cliente se inserta directo en la DB (el endpoint /oauth2/create-client
//   devuelve 401 bajo el handler de tests, quirk del pipeline de better-call)
//   replicando el hash del secret (SHA-256 base64url, igual que el
//   storeClientSecret "hashed" del plugin).
// - El consentimiento se simula con skipConsent: true en el cliente; la
//   decisión interactiva de /oauth2/consent responde 401 bajo el handler
//   (quirk del sessionMiddleware en POST con oauth_query) y se cubre
//   manualmente en el browser.
const hashClientSecret = (secret: string) =>
  createHash("sha256").update(secret).digest("base64url");

// Warm-up: la DB es remota y la primera conexión del pool tarda ~11s;
// hacerla fuera de hooks evita los timeouts de bun test.
await cleanupTestDb();

const pkcePair = () => {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
};

const basicAuth = (clientId: string, clientSecret: string) =>
  `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;

describe("OAuth 2.1 Authorization Code + PKCE flow", () => {
  let testHelpers: Awaited<typeof testAuth.$context>["test"];

  beforeAll(async () => {
    testHelpers = (await testAuth.$context).test;
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

  const createClientInDb = async (
    clientId: string,
    secret: string,
    opts: { skipConsent?: boolean } = {},
  ) => {
    const now = new Date();
    await testDb.insert(oauthClients).values({
      id: `client-${clientId}`,
      clientId,
      clientSecret: hashClientSecret(secret),
      redirectUris: ["https://miapp.example.com/callback"],
      postLogoutRedirectUris: ["https://miapp.example.com/logout"],
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      scopes: ["openid", "profile", "email", "offline_access"],
      tokenEndpointAuthMethod: "client_secret_basic",
      type: "web",
      requirePKCE: true,
      subjectType: "public",
      public: false,
      disabled: false,
      skipConsent: opts.skipConsent ?? false,
      createdAt: now,
      updatedAt: now,
    });
  };

  const loginUser = async (email: string) => {
    const user = testHelpers.createUser({
      email,
      name: "OAuth User",
      password: "password123456",
    });
    await testHelpers.saveUser(user);
    const { headers } = await testHelpers.login({ userId: user.id });
    return { user, headers };
  };

  it("authorize → token → userinfo → refresh → revoke (PKCE, skip_consent)", async () => {
    const { user, headers } = await loginUser("oauth-user@example.com");

    const clientId = "test-client-001";
    const clientSecret = "super-secret-0123456789";
    await createClientInDb(clientId, clientSecret, { skipConsent: true });

    const { verifier, challenge } = pkcePair();

    // 1. Authorize — skip_consent → code directo
    const authorizeQuery = new URLSearchParams({
      client_id: clientId,
      redirect_uri: "https://miapp.example.com/callback",
      response_type: "code",
      scope: "openid profile email offline_access",
      state: "test-state-123",
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    const authorize = await call(`/oauth2/authorize?${authorizeQuery}`, {
      headers,
    });
    expect(authorize.status).toBe(302);

    const callbackUrl = new URL(authorize.location!);
    expect(callbackUrl.origin + callbackUrl.pathname).toBe(
      "https://miapp.example.com/callback",
    );
    const code = callbackUrl.searchParams.get("code");
    expect(code).toBeDefined();
    expect(callbackUrl.searchParams.get("state")).toBe("test-state-123");

    // 2. Token exchange (client_secret_basic + PKCE verifier)
    const token = await call("/oauth2/token", {
      method: "POST",
      headers: {
        authorization: basicAuth(clientId, clientSecret),
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code!,
        redirect_uri: "https://miapp.example.com/callback",
        code_verifier: verifier,
      }).toString(),
    });
    expect(token.status).toBe(200);

    const tokens = token.json as {
      access_token: string;
      refresh_token: string;
      id_token: string;
      expires_in: number;
      token_type: string;
    };
    expect(tokens.access_token).toBeDefined();
    expect(tokens.refresh_token).toBeDefined();
    expect(tokens.id_token).toBeDefined();
    expect(tokens.expires_in).toBe(3600);
    expect(tokens.token_type).toBe("Bearer");

    // 3. Userinfo with the access token
    const userinfo = await call("/oauth2/userinfo", {
      headers: { authorization: `Bearer ${tokens.access_token}` },
    });
    expect(userinfo.status).toBe(200);
    expect(userinfo.json.sub).toBe(user.id);

    // 4. Refresh token
    const refreshed = await call("/oauth2/token", {
      method: "POST",
      headers: {
        authorization: basicAuth(clientId, clientSecret),
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
      }).toString(),
    });
    expect(refreshed.status).toBe(200);
    expect(refreshed.json.access_token).toBeDefined();

    // 5. Revoke the refreshed token
    const revoked = await call("/oauth2/revoke", {
      method: "POST",
      headers: {
        authorization: basicAuth(clientId, clientSecret),
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: (refreshed.json as { access_token: string }).access_token,
      }).toString(),
    });
    expect(revoked.status).toBe(200);
  });

  it("rejects a wrong PKCE verifier", async () => {
    const { headers } = await loginUser("oauth-pkce-fail@example.com");

    const clientId = "test-client-pkce";
    await createClientInDb(clientId, "secret-pkce-123", { skipConsent: true });

    const { challenge } = pkcePair();
    const wrongVerifier = randomBytes(32).toString("base64url");

    const authorizeQuery = new URLSearchParams({
      client_id: clientId,
      redirect_uri: "https://miapp.example.com/callback",
      response_type: "code",
      scope: "openid",
      state: "s-pkce",
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    const authorize = await call(`/oauth2/authorize?${authorizeQuery}`, {
      headers,
    });
    const code = new URL(authorize.location!).searchParams.get("code")!;

    const token = await call("/oauth2/token", {
      method: "POST",
      headers: {
        authorization: basicAuth(clientId, "secret-pkce-123"),
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://miapp.example.com/callback",
        code_verifier: wrongVerifier,
      }).toString(),
    });
    expect(token.status).toBe(401);
    expect(token.json.error).toBe("invalid_request");
  });

  it("rejects a second use of the same code", async () => {
    const { headers } = await loginUser("oauth-reuse@example.com");

    const clientId = "test-client-reuse";
    await createClientInDb(clientId, "secret-reuse-123", { skipConsent: true });

    const { verifier, challenge } = pkcePair();
    const authorizeQuery = new URLSearchParams({
      client_id: clientId,
      redirect_uri: "https://miapp.example.com/callback",
      response_type: "code",
      scope: "openid",
      state: "s-reuse",
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    const authorize = await call(`/oauth2/authorize?${authorizeQuery}`, {
      headers,
    });
    const code = new URL(authorize.location!).searchParams.get("code")!;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: "https://miapp.example.com/callback",
      code_verifier: verifier,
    }).toString();
    const tokenHeaders = {
      authorization: basicAuth(clientId, "secret-reuse-123"),
      "content-type": "application/x-www-form-urlencoded",
    };

    const first = await call("/oauth2/token", {
      method: "POST",
      headers: tokenHeaders,
      body,
    });
    expect(first.status).toBe(200);

    const second = await call("/oauth2/token", {
      method: "POST",
      headers: tokenHeaders,
      body,
    });
    expect(second.status).toBe(401);
  });
});
