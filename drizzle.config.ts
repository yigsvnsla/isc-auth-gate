import { defineConfig } from "drizzle-kit";

import { env } from "@/env";

export default defineConfig({
  dialect: "postgresql",
  out: "./database/migrations",
  schema: ["./database/schema.ts"],
  dbCredentials: {
    host: env.BETTER_AUTH_DATABASE_HOST,
    port: env.BETTER_AUTH_DATABASE_PORT,
    user: env.BETTER_AUTH_DATABASE_USER,
    password: env.BETTER_AUTH_DATABASE_PASS,
    database: env.BETTER_AUTH_DATABASE_NAME,
    ssl: false,
  },
});