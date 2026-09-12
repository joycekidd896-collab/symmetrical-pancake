import type { MetadataRoute } from "next";

const baseUrl = "https://couponqueen.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/coupons`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/businesses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/businesses/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/account/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${baseUrl}/businesses/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
  ];
}
