export async function GET() {
  return Response.json({ status: "ok", version: process.env.APP_VERSION, timestamp: new Date().toISOString() });
}
