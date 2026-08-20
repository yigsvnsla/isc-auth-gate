import { Redis } from "ioredis";
import { env } from "@/env";

export interface RateLimitCustomStorage {
  consume: (
    key: string,
    rule: { window: number; max: number },
  ) => Promise<{ allowed: boolean; retryAfter: number | null }>;
}

// Consumo atómico: lee (count, lastRequest), decide y escribe en un solo
// paso Lua. Cierra la ventana de carrera de peticiones concurrentes que sí
// existe con get/set separados. El EXPIRE borra la clave sola al vencer.
const CONSUME_LUA = `
local key = KEYS[1]
local window = tonumber(ARGV[1])
local max = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local windowMs = window * 1000
local data = redis.call('HMGET', key, 'count', 'lastRequest')
local count = tonumber(data[1] or '0')
local lastRequest = tonumber(data[2] or '0')
if lastRequest == 0 or (now - lastRequest) >= windowMs then
  count = 1
  lastRequest = now
elseif count >= max then
  local retry = math.ceil((lastRequest + windowMs - now) / 1000)
  if retry < 0 then retry = 0 end
  return cjson.encode({ allowed = false, retryAfter = retry })
else
  count = count + 1
  lastRequest = now
end
redis.call('HMSET', key, 'count', count, 'lastRequest', lastRequest)
redis.call('EXPIRE', key, window)
return cjson.encode({ allowed = true, retryAfter = 0 })
`;

let client: Redis | null = null;
let warned = false;

function getClient(): Redis | null {
  if (client) return client;
  if (env.BETTER_AUTH_RATE_LIMIT_STORAGE !== "redis") return null;
  const url = env.REDIS_URL;
  if (!url) {
    if (!warned) {
      console.warn(
        "[rate-limit] BETTER_AUTH_RATE_LIMIT_STORAGE=redis pero REDIS_URL no está definido; usando storage en memoria.",
      );
      warned = true;
    }
    return null;
  }
  client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
  client.on("error", (e) =>
    console.error("[rate-limit] redis error:", e.message),
  );
  return client;
}

/**
 * Devuelve un `customStorage` de Redis para el rate-limit de Better Auth, o
 * `undefined` si el flag `BETTER_AUTH_RATE_LIMIT_STORAGE` no es "redis" (en
 * cuyo caso Better Auth usa el storage por defecto, memoria). Fail-open: si
 * Redis falla, se permite la petición para no romper el auth por la caída de
 * Redis.
 */
export function createRateLimitStorage(): RateLimitCustomStorage | undefined {
  const c = getClient();
  if (!c) return undefined;
  return {
    async consume(key, rule) {
      try {
        const res = (await c.eval(
          CONSUME_LUA,
          1,
          key,
          rule.window,
          rule.max,
          Date.now(),
        )) as string;
        const parsed = JSON.parse(res);
        return { allowed: parsed.allowed, retryAfter: parsed.retryAfter ?? 0 };
      } catch (e) {
        console.error(
          "[rate-limit] fallo en consume, permitiendo petición:",
          (e as Error).message,
        );
        return { allowed: true, retryAfter: 0 };
      }
    },
  };
}
