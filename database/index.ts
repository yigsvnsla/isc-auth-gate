import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/env";
import * as schema from "./schema";

export const db = drizzle({
  schema,
  logger: env.BETTER_AUTH_DATABASE_DEBUG,
  connection: {
    ssl: env.BETTER_AUTH_DATABASE_SSL,
    user: env.BETTER_AUTH_DATABASE_USER,
    host: env.BETTER_AUTH_DATABASE_HOST,
    port: env.BETTER_AUTH_DATABASE_PORT,
    database: env.BETTER_AUTH_DATABASE_NAME,
    password: env.BETTER_AUTH_DATABASE_PASS,
  },
});
