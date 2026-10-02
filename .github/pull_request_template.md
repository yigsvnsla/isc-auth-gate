<!--
Título del PR = commit que queda en main (squash merge). Conventional Commits:
  feat: …   fix(auth): …   chore: …   refactor: …   docs: …
Rama: <tipo>/<descripcion-en-kebab-case>   p. ej. feat/login-passkey
Ver CONTRIBUTING.md
-->

## Qué cambia y por qué

<!-- Qué problema resuelve. Enlaza el issue si existe: Closes #123 -->

## Cómo se probó

<!-- Comandos, pantallas o flujos verificados. "Pasa CI" no basta. -->

## Checklist

- [ ] `bun run lint`, `bun run test` y `bun run build` pasan en local
- [ ] Sin secretos ni valores reales de `.env` en el diff

**Base de datos** (borra si no aplica)
- [ ] Cambié `database/schema.ts` y generé la migración con `bun run database:generate`
- [ ] La migración es **aditiva** (agrega antes de borrar): la imagen anterior sigue funcionando con el schema nuevo, así el rollback de imagen es seguro
- [ ] Nunca `database:push` contra dev/prod

**Variables de entorno** (borra si no aplica)
- [ ] Agregué/cambié variables en `env/server/schemas/` o `env/client/`
- [ ] Actualicé `.env.example` y el env del job `ci` (`.github/workflows/ci.yaml`)
- [ ] Indico abajo qué hay que crear en Dokploy (dev y prod) **antes** del deploy

<!-- Variables nuevas para Dokploy: NOMBRE=descripción (sin valores reales) -->
