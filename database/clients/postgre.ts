import { env } from "@/env/server";
import { drizzle } from "drizzle-orm/bun-sql";

export const drizzlePostgreClient = drizzle({
  schema: {},
  logger: env.BETTER_AUTH_DATABASE_DEBUG,
  connection: {
    max: 1,
    ssl: env.BETTER_AUTH_DATABASE_SSL,
    host: env.BETTER_AUTH_DATABASE_HOST,
    port: env.BETTER_AUTH_DATABASE_PORT,
    database: env.BETTER_AUTH_DATABASE_NAME,
    user: env.BETTER_AUTH_DATABASE_USER,
    password: env.BETTER_AUTH_DATABASE_PASS,
  },
});
