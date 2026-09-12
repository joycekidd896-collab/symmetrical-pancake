import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/businesses/dashboard", "/admin", "/api"],
    },
    sitemap: "https://couponqueen.online/sitemap.xml",
  };
}
