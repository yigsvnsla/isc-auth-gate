import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";
import * as schema from "@/database/schema";

const testPool = new Pool({
  host: env.BETTER_AUTH_DATABASE_HOST,
  port: env.BETTER_AUTH_DATABASE_PORT,
  user: env.BETTER_AUTH_DATABASE_USER,
  password: env.BETTER_AUTH_DATABASE_PASS,
  database: env.BETTER_AUTH_DATABASE_NAME,
});

export const testDb = drizzle(testPool, { schema });

export async function cleanupTestDb() {
  if (!env.BETTER_AUTH_TEST_ALLOW_TRUNCATE) {
    throw new Error(
      "cleanupTestDb() truncaría la DB de desarrollo. " +
        "Si realmente quieres correr tests destructivos, define " +
        "BETTER_AUTH_TEST_ALLOW_TRUNCATE=true en tu entorno.",
    );
  }
  await testPool.query(`
    TRUNCATE TABLE sessions, accounts, verifications, members, invitations, organizations, users, organization_roles RESTART IDENTITY CASCADE;
  `);
}

export async function closeTestDb() {
  await testPool.end();
}