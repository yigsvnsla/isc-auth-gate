// import { ApplicationConfigFactory } from "@/env/core/factories";
// import { environmentSchema } from "@/env/core/schemas";
import { environmentSchema } from "@/env/core/schemas";
import { $ } from "bun";
import { checkConnection } from "./check-connection";


// TODO: MEJORAR APARIENCIA DEL SCRIPT DE CHECKEO, HACERLO MAS DIANMICO
console.log("Running database check...");
console.log("This script will check the database schema and migrations.");

const environment = environmentSchema.parse(process.env.NODE_ENV);

switch (environment) {
  case "development":
    // await $`NODE_ENV=development bun x drizzle-kit check --config=database/configs/drizzle.config.dev.ts`;

    await checkConnection()
    break;

  case "testing":
    console.info("DATABASE CHECK TESTING");
    await $`NODE_ENV=testing bun x drizzle-kit check --config=database/configs/drizzle.config.ts`;
    break;

  default:
    break;
}
