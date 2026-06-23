import { createTransport } from "nodemailer";
import { env } from "@/env";

export const smtp_transporter = createTransport({
  host: env.BETTER_AUTH_SMTP_TRANSPORTER_HOST,
  port: env.BETTER_AUTH_SMTP_TRANSPORTER_PORT,
  secure: env.BETTER_AUTH_SMTP_TRANSPORTER_SECURE,
  auth: {
    user: env.BETTER_AUTH_SMTP_TRANSPORTER_USER,
    pass: env.BETTER_AUTH_SMTP_TRANSPORTER_PASS,
  },
});
