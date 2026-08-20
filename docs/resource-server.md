# Resource servers (RFC 8707)

A **resource server** is a protected API that validates the access tokens
issued by this authorization server. In the OAuth 2.0 Authorization Server
Metadata spec (RFC 8707, "Resource Indicators"), a client requests tokens for
one or more specific resources via the `resource` authorization parameter; the
issued access token then carries that resource's URI in its `aud` (audience)
claim.

This project uses Better Auth's `@better-auth/oauth-provider` v1.7 native
resource support — **no custom tables or schema changes** are needed. Resources
are stored in the plugin's own `oauth_resources` table and read at runtime
(with an in-memory cache).

## How it works

- Each resource has an `identifier` (its URI, e.g. `https://api.miapp.com`).
  That identifier is what clients pass as the `resource` parameter and what
  ends up in the token `aud` claim.
- Resources have their own `allowedScopes`, token TTLs, DPoP requirement, and
  optional `metadata`.
- The source of truth is the `oauth_resources` table. The UI and DB are the
  managers; env config is only a one-time seed.

## Seeding vs. management

`BETTER_AUTH_OAUTH_RESOURCES` (in `env/server.schema.ts`) is a JSON array used
**only as an insert-only seed**. On startup the plugin lazily inserts any
listed resources that don't already exist. It never overwrites resources that
were created or edited through the admin UI/DB.

```bash
# .env — opcional. Por defecto [] (sin seed, todo vía UI/DB)
BETTER_AUTH_OAUTH_RESOURCES='[{"identifier":"https://api.miapp.com","name":"API de producción","allowedScopes":["user:read","user:write"]}]'
```

To manage resources entirely through the admin UI, leave it as `[]` (the
default).

## Admin API (server-only)

The resource endpoints are `SERVER_ONLY`: they are **not** available on the
client SDK (`authClient.oauth2.*` has no resource methods). They are invoked
server-side — either directly via `auth.api.admin*OAuthResource`, or through
the Next.js admin route handlers.

| Method | Route handler | `auth.api` call |
|--------|---------------|-----------------|
| GET | `/api/admin/resources` | `adminListOAuthResources` |
| POST | `/api/admin/resources` | `adminCreateOAuthResource` |
| PATCH | `/api/admin/resources/:identifier` | `adminUpdateOAuthResource` |
| DELETE | `/api/admin/resources/:identifier` | `adminDeleteOAuthResource` |

### Authorization

Both `resourcePrivileges` and `clientPrivileges` in `lib/auth/auth.tsx` are set
to:

```ts
async ({ user }) => user?.role === "admin"
```

So only `admin`-role sessions may manage resources. The route handlers add an
explicit check:

- No session → `401 Unauthorized`
- Session but role ≠ `admin` → `403 Forbidden`
- Admin → forwarded to `auth.api.admin*OAuthResource`

## Resource fields

| Field | Type | Notes |
|-------|------|-------|
| `identifier` | string | URI of the API. Required on create; immutable afterwards. |
| `name` | string? | Human-readable label. |
| `allowedScopes` | string[]? | Custom scopes for this resource (OIDC scopes like `openid`, `profile` apply to all). |
| `accessTokenTtl` | number? | Access token lifetime in seconds. |
| `refreshTokenTtl` | number? | Refresh token lifetime in seconds. |
| `dpopBoundAccessTokensRequired` | boolean? | Require DPoP-bound tokens (RFC 9449). |
| `disabled` | boolean? | Block token issuance for this resource. |
| `metadata` | record? | Arbitrary JSON metadata. |

## Admin UI

`/dashboard/administration/oauth` → **Resources** tab:

- Lists all resources with status badges (Active/Disabled, DPoP).
- **New Resource** dialog creates a resource.
- Row actions (⋯) let you edit or delete a resource.

Data flows through SWR hooks (`useListResourcesQuery`,
`useCreateResourceMutation`, `useUpdateResourceMutation`,
`useDeleteResourceMutation`) that call the `/api/admin/resources` route
handlers.

## Testing

`tests/unit/resources-flow.test.ts` covers create/list/update/delete via
`auth.api.admin*OAuthResource`, plus the privilege gate (non-admin → `401`,
unauthenticated → `401`). The route-layer `403` for non-admin sessions is
enforced by the admin route handlers.
