FROM oven/bun:1 AS base
WORKDIR /usr/src/app
# Bloqueamos Husky y la telemetría desde la base para todas las etapas
ENV HUSKY=0
ENV TURBO_TELEMETRY_DISABLED=1


# --- Etapa 1: Pruner ---
FROM base AS pruner
COPY . .
# Instalamos turbo para podar
RUN bun install --frozen-lockfile --production --ignore-scripts
RUN bun run turbo prune --scope=client --docker

# --- Etapa 2: Installer ---
FROM base AS installer
WORKDIR /usr/src/app

# Primero COPIAMOS desde pruner, luego podemos hacer LS
COPY --from=pruner /usr/src/app/out/json/ .
COPY --from=pruner /usr/src/app/out/bun.lockb ./bun.lockb

# Ahora sí puedes ver los archivos si quieres
RUN ls -al /usr/src/app

# Instalamos TODAS las dependencias (necesarias para el BUILD)
RUN bun install --frozen-lockfile

# --- Etapa 3: Build ---
FROM base AS builder
WORKDIR /usr/src/app

# Copiamos node_modules de installer y el código completo de pruner
COPY --from=installer /usr/src/app/node_modules ./node_modules
COPY --from=pruner /usr/src/app/out/full/ .
COPY --from=pruner /usr/src/app/out/json/ .

RUN bun run turbo build --filter=client

# --- Etapa 4: Imagen Final (Aquí sí aplicamos lo de producción) ---
FROM base AS runner
WORKDIR /usr/src/app

# Copiamos solo lo que se necesita para correr
COPY --from=builder /usr/src/app/apps/client/.next ./apps/client/.next
COPY --from=builder /usr/src/app/apps/client/package.json ./apps/client/package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Instalación final de solo producción para que la imagen sea ligera
RUN bun install --frozen-lockfile --production

USER bun
EXPOSE 3000
CMD ["bun", "--cwd", "apps/client", "run", "start"]