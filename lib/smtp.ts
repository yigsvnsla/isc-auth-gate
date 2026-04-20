import { createTransport } from "nodemailer";

export const smtp_transporter = createTransport({
  host: String(process.env.SMTP_TRANSPORTER_HOST),
  port: Number(process.env.SMTP_TRANSPORTER_PORT),
  secure: Boolean(process.env.SMTP_TRANSPORTER_SECURE),
  auth: {
    user: String(process.env.SMTP_TRANSPORTER_USER),
    pass: String(process.env.SMTP_TRANSPORTER_PASS)
  },
});
