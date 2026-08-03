import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

// OAuth 2.1 discovery metadata (RFC 8414).
// oauthProvider serves this at `/.well-known/oauth-authorization-server/<issuerPath>`
// (e.g. /api/auth) via its onRequest hook, but that path falls OUTSIDE the
// `/api/auth/[...all]` catch-all, so Next.js would 404 it. Forward it here.
// Dynamic [...issuerPath] keeps this working if the issuer/basePath ever changes.
export const { GET } = toNextJsHandler(auth);
