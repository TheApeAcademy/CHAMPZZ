import type { MetadataRoute } from "next";

const base = process.env.APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** Only the public site is indexed. Kid, parent, staff and admin pages never are. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/features", "/pricing", "/safety", "/privacy", "/terms", "/clubs"], disallow: ["/k/", "/o/", "/p/", "/console", "/api/", "/auth/", "/join/", "/approve", "/start", "/onboarding", "/notifications", "/feed", "/media/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
