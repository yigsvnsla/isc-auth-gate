import { defineConfig } from "drizzle-kit";
import { ApplicationConfigFactory } from "@/env/core/factories";
import { environmentSchema } from "@/env/core/schemas";

const environment = environmentSchema.parse(process.env.NODE_ENV);

const config = ApplicationConfigFactory.create(environment);

export default defineConfig({
  dialect: "postgresql",
  out: "./database/migrations",
  schema: ["./database/schema.ts"],

  dbCredentials: {
    host: config.database.HOST,
    port: config.database.PORT,
    database: config.database.NAME,
    ssl: config.database.SSL,
    user: config.database.USER,
    password: config.database.PASS,
  },
});
