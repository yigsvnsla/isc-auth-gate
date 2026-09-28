import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // SHA del build (ARG APP_VERSION del Containerfile), compilado en el bundle
  // del servidor para /api/health. No es secreto.
  env: { APP_VERSION: process.env.APP_VERSION ?? "local" },
  rewrites: async () => {
    return [
      {
        source: "/healthz",
        destination: "/api/health",
      },
    ];
  },
};

export default nextConfig;
