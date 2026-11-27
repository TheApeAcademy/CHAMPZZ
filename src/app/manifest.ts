import type { MetadataRoute } from "next";

/** Lets families and teachers add Champzz to their phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Champzz",
    short_name: "Champzz",
    description: "Learning, games and community for kids' clubs and children's ministries.",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF8EC",
    theme_color: "#FFF8EC",
    categories: ["education", "kids", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
