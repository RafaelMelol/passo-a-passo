import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Pacotes do servidor que usam recursos nativos do Node (banco e leitura de PDF).
  serverExternalPackages: ["@electric-sql/pglite", "pg", "unpdf"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
