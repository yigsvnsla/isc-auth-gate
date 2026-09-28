import { ApplicationConfigFactory } from "@/env/core/factories";
import { environmentSchema } from "@/env/core/schemas";
import { drizzle } from "drizzle-orm/bun-sql";

const environment = environmentSchema.parse(process.env.NODE_ENV);

const config = ApplicationConfigFactory.create(environment);

export const drizzlePostgreClient = drizzle({
  schema: {},
  //   logger: env.BETTER_AUTH_DATABASE_DEBUG,
  connection: {
    // Una sola conexión: los consumidores (entrypoint, database:check) son
    // procesos de un solo uso, y el advisory lock de migración es por sesión —
    // lock, migrate y unlock tienen que ir por la misma conexión.
    max: 1,
    host: config.database.HOST,
    port: config.database.PORT,
    database: config.database.NAME,
    ssl: config.database.SSL,
    user: config.database.USER,
    password: config.database.PASS,
  },
});
