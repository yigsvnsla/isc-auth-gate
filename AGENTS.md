<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.
<!-- END:nextjs-agent-rules -->

# isc-auth-gate

Next.js 16 app with Better Auth, Drizzle ORM, and shadcn/ui (base-nova preset).

## Tech Stack Facts

- **Runtime**: Bun (not Node) — uses `bun test`, `bun x`, `bun run`
- **Framework**: Next.js 16 with React 19, React Compiler enabled (`next.config.ts`)
- **Auth**: Better Auth with Microsoft OAuth, organization plugin, admin plugin, RBAC
- **Database**: PostgreSQL via Drizzle ORM, migrations in `database/migrations/`
- **Styling**: Tailwind CSS 4 with `@tailwindcss/postcss`, shadcn/ui base-nova preset
- **TypeScript**: Strict mode, `bun-types` as types, path alias `@/*` → `./*`

## Commands

```bash
bun run dev              # Next.js dev server (:3000)
bun test                 # Run all tests (bun test)
bun test --watch         # Watch mode
bun run lint             # ESLint (next/core-web-vitals + typescript config)
bun run build            # Production build

# Database
bun run database:push    # Push schema changes (no migrations)
bun run database:generate  # Generate migration files
bun run database:up      # Apply migrations
bun run database:check   # Validate schema
bun run database:studio  # Drizzle Studio (:4001)

# Auth
bun run auth:generate   # Generate DB schema from auth config (outputs to database/schema.ts)

# Seed
bun run seed:run         # Seed test data
bun run seed:reset       # Reset seeded data

# Single test file
bun test tests/unit/auth-flow.test.ts
```

## Architecture

- `app/` — Next.js App Router (`layout.tsx`, `page.tsx`, `api/auth/[...all]/route.ts`)
- `app/dashboard/` — Protected dashboard routes with admin UI (users, organizations)
- `lib/auth.ts` — Better Auth server config (plugins: admin, organization, openAPI, nextCookies)
- `lib/auth-client.ts` — Client auth instance with admin/organization plugins
- `lib/permissions.ts` — RBAC: `admin`, `moderator`, `user` roles via `createAccessControl`
- `database/schema.ts` — Drizzle schema (users, sessions, accounts, verifications, organizations, members, invitations)
- `database/index.ts` — Production DB connection (reads from `env`)
- `tests/database.ts` — Test DB connection (separate pool, same database)
- `env/` — Zod-validated env vars: `server.schema.ts`, `database.schema.ts`, `microsoft.schema.ts`
- `components/ui/` — shadcn/ui components (base-nova preset, see `components.json`)

## Conventions

- **Env vars**: Validated by Zod in `env/index.ts`, not accessed directly via `process.env`
- **Auth route**: All Better Auth endpoints at `/api/auth/[...all]` via `toNextJsHandler`
- **Tests**: Use `better-auth/plugins` `testUtils` plugin, cleanup via `cleanupTestDb()`
- **Pre-commit**: Runs `bun test` (see `.husky/pre-commit`)
- **Commit messages**: Conventional commits enforced by commitlint (`@commitlint/config-conventional`)
- **Lint-staged**: Runs `prettier --write` on all staged files (see `.lintstagedrc`)
- **shadcn**: Uses `base-nova` style preset, not default. Add components with `shadcn` CLI

## Gotchas

- `database/schema.ts` is **generated** by `bun run auth:generate` — don't edit manually
- Tests connect to the same database as dev (see `tests/database.ts`) — `cleanupTestDb()` truncates tables
- Microsoft OAuth configured in `lib/auth.ts` and `env/microsoft.schema.ts`
- `BETTER_AUTH_SERVER_TRUSTED_ORIGINS` must be a comma-separated string in `.env` (parsed to array by Zod)
- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`) — be aware of rules
