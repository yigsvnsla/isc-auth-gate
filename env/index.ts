import z from "zod";
import { databaseEnv } from "./database.schema";
import { microsoftProviderEnv } from "./microsoft.schema";
import { serverEnv } from "./server.schema";
import { smtpEnv } from "./smtp.schema";

export type Env = z.infer<typeof EnvSchema>;

const EnvSchema = z.object({
  ...microsoftProviderEnv.shape,
  ...databaseEnv.shape,
  ...serverEnv.shape,
  ...smtpEnv.shape,
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export const env = EnvSchema.parse(process.env);
