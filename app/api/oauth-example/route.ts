import { serverClient } from "@/lib/auth/server-client";
import { env } from "@/env";

const baseUrl = env.BETTER_AUTH_URL.replace(/\/+$/, "");

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? undefined;
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.replace("Bearer ", "")
    : authorization;

  try {
    const payload = await serverClient.verifyAccessToken(accessToken, {
      verifyOptions: {
        issuer: `${baseUrl}/api/auth`,
        audience: baseUrl,
      },
      scopes: ["profile"],
    });

    return Response.json({ sub: payload.sub, scopes: payload.scope });
  } catch (error) {
    return Response.json(
      { error: "unauthorized", message: (error as Error).message },
      { status: 401 },
    );
  }
}
