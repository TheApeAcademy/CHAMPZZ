import type { NextConfig } from "next";

// cacheComponents is deliberately off. Almost every Champzz page reads the
// signed-in user and tenant data, and caching rendered output across requests
// is the wrong default for a multi-tenant children's platform: one cache-key
// mistake would show one org's data to another. Pages stay dynamic; the
// database (RLS) is the only source of truth for who sees what.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
