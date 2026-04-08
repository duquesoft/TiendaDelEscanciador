import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export async function GET() {
  const imageEntries = [
    {
      pageUrl: `${siteUrl}/`,
      imageUrl: `${siteUrl}/img/escanciador_fondo_blanco_16_9.jpg`,
      caption: "Escanciador de sidra automático",
    },
    {
      pageUrl: `${siteUrl}/producto`,
      imageUrl: `${siteUrl}/img/escanciador_fondo_blanco_16_9.jpg`,
      caption: "Escanciador de sidra automático",
    },
    {
      pageUrl: `${siteUrl}/producto`,
      imageUrl: `${siteUrl}/img/escanciador_fondo_blanco_1_1.jpg`,
      caption: "Escanciador de sidra automático",
    },
    {
      pageUrl: `${siteUrl}/comprar-escanciador`,
      imageUrl: `${siteUrl}/img/escanciador_fondo_blanco_16_9.jpg`,
      caption: "Guia para comprar escanciador",
    },
    {
      pageUrl: `${siteUrl}/escanciador-barato`,
      imageUrl: `${siteUrl}/img/escanciador_fondo_blanco_16_9.jpg`,
      caption: "Escanciador barato con buena relacion calidad precio",
    },
  ];

  const urls = imageEntries
    .map(
      ({ pageUrl, imageUrl, caption }) => `
  <url>
    <loc>${pageUrl}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
