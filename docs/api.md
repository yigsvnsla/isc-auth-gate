# API endpoints

All auth endpoints served by a single catch-all route:

```ts
// app/api/auth/[...all]/route.ts
export const { GET, POST } = toNextJsHandler(auth);
```

Swagger UI at `/api/auth/reference` (dev only).

## Core auth

| Method | Path | Plugin | Purpose |
|--------|------|--------|---------|
| POST | `/api/auth/signin/email` | email-password | Login with email + password |
| POST | `/api/auth/signup/email` | email-password | Register new user |
| POST | `/api/auth/forget-password` | email-password | Send password reset email |
| POST | `/api/auth/reset-password` | email-password | Reset password with token |
| GET | `/api/auth/signin/microsoft` | social-providers | Microsoft OAuth redirect |
| POST | `/api/auth/callback/microsoft` | social-providers | Microsoft OAuth callback |
| GET | `/api/auth/session` | core | Get current session |
| POST | `/api/auth/sign-out` | core | Sign out (clear session) |
| POST | `/api/auth/verify-email` | email-verification | Verify email with token |
| POST | `/api/auth/send-verification-email` | email-verification | Resend verification email |

## Admin API

Requires `admin` role. Full reference: Better Auth [Admin API docs](https://www.better-auth.com/docs/admin).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/admin/create-user` | Create user |
| POST | `/api/auth/admin/update-user` | Update user |
| POST | `/api/auth/admin/ban-user` | Ban user |
| POST | `/api/auth/admin/unban-user` | Unban user |
| POST | `/api/auth/admin/remove-user` | Delete user |
| POST | `/api/auth/admin/set-role` | Set user role |
| GET | `/api/auth/admin/list-users` | List users (paginated, filterable) |
| GET | `/api/auth/admin/get-user` | Get user by ID |

Consumed client-side via SWR hooks in `hooks/use-admin-list-users.ts`, `hooks/use-admin-ban-user.ts`, etc.

## Organization API

Requires organization membership. Full reference: Better Auth [Organization docs](https://www.better-auth.com/docs/organization).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/organization/create` | Create org |
| POST | `/api/auth/organization/update` | Update org |
| POST | `/api/auth/organization/delete` | Delete org |
| GET | `/api/auth/organization/list` | List user's orgs |
| GET | `/api/auth/organization/get-full-organization` | Get org with members |
| POST | `/api/auth/organization/invite-member` | Invite member |
| POST | `/api/auth/organization/cancel-invitation` | Cancel invitation |
| POST | `/api/auth/organization/accept-invitation` | Accept invitation |
| POST | `/api/auth/organization/reject-invitation` | Reject invitation |
| POST | `/api/auth/organization/remove-member` | Remove member |
| POST | `/api/auth/organization/update-member-role` | Update member role |
| POST | `/api/auth/organization/change-role` | Change active org role |
| POST | `/api/auth/organization/set-active-organization` | Set active org |

### Dynamic roles (custom server actions)

Defined in `lib/actions/admin-roles.ts`:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/organization/list-organizations` | List all orgs (admin) |
| POST | `/api/auth/organization/list-org-roles` | List roles for org |
| POST | `/api/auth/organization/create-org-role` | Create dynamic role |
| POST | `/api/auth/organization/update-org-role` | Update role permissions |
| POST | `/api/auth/organization/delete-org-role` | Delete role |

Helper `withOrgAdminAccess()` in `lib/admin-org-access.ts` ensures caller is org member before CRUD.

## OAuth 2.1 Provider (inbound)

Better Auth OAuth Provider plugin endpoints. Full reference: [OAuth Provider docs](https://www.better-auth.com/docs/plugins/oauth-provider).

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/.well-known/openid-configuration` | OIDC discovery |
| GET | `/.well-known/oauth-authorization-server` | OAuth metadata |
| GET | `/api/auth/oauth2/authorize` | Authorization endpoint |
| POST | `/api/auth/oauth2/token` | Token endpoint |
| GET | `/api/auth/oauth2/userinfo` | Userinfo endpoint |
| POST | `/api/auth/oauth2/register` | Dynamic client registration |
| GET | `/api/auth/oauth2/jwks` | JWKS endpoint |
| GET | `/api/auth/oauth2/consent` | Get user's consents |
| POST | `/api/auth/oauth2/consent` | Record consent |
| DELETE | `/api/auth/oauth2/consent` | Revoke consent |

### OAuth client management

Via `authClient.oauth2.*` (client-side, no server actions):

| Method | Client call | Purpose |
|--------|-------------|---------|
| POST | `authClient.oauth2.listClients()` | List all clients |
| POST | `authClient.oauth2.createClient()` | Register new client |
| POST | `authClient.oauth2.updateClient()` | Update client metadata |
| POST | `authClient.oauth2.deleteClient()` | Delete client |
| POST | `authClient.oauth2.rotateClientSecret()` | Rotate client secret |
| POST | `authClient.oauth2.listConsents()` | List user consents |
| POST | `authClient.oauth2.revokeConsent()` | Revoke consent |

Admin UI at `/dashboard/administration/oauth`.

## Error responses

Standard Better Auth error format:

```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "status": 401
}
```

Common error codes:
- `INVALID_CREDENTIALS` — wrong email/password
- `EMAIL_NOT_VERIFIED` — email verification pending
- `USER_NOT_FOUND` — account not found
- `RATE_LIMIT_EXCEEDED` — too many requests (10/60s)
- `UNAUTHORIZED` — insufficient role/permissions
- `INVALID_TOKEN` — expired or forged token
