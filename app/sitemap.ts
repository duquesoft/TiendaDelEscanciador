import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://escanciadorsidra.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/producto`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/carrito`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/checkout`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/mi-cuenta`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
