import { defineConfig } from "drizzle-kit";

import { env } from "@/env/server";

export default defineConfig({
  dialect: "postgresql",
  out: "./database/migrations",
  schema: ["./database/schema.ts"],

  dbCredentials: {
    host: env.BETTER_AUTH_DATABASE_HOST,
    port: env.BETTER_AUTH_DATABASE_PORT,
    database: env.BETTER_AUTH_DATABASE_NAME,
    ssl: env.BETTER_AUTH_DATABASE_SSL,
    user: env.BETTER_AUTH_DATABASE_USER,
    password: env.BETTER_AUTH_DATABASE_PASS,
  },
});
