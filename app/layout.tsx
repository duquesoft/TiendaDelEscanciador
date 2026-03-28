import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://escanciadorsidra.com";

// GEIST (variable font)
const geist = localFont({
  src: [
    { path: "../public/fonts/geist/Geist-wght.woff2", style: "normal" },
    { path: "../public/fonts/geist/Geist-Italic-wght.woff2", style: "italic" },
  ],
  variable: "--font-geist",
});

// GEIST MONO (variable font)
const geistMono = localFont({
  src: [
    { path: "../public/fonts/geist-mono/GeistMono-wght.woff2", style: "normal" },
    { path: "../public/fonts/geist-mono/GeistMono-Italic-wght.woff2", style: "italic" },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Escanciador de Sidra Automático | Compra Online",
    template: "%s | Escanciador de Sidra",
  },
  description:
    "Escanciador de sidra automático a batería. Compra online con envío rápido y atención personalizada.",
  keywords: [
    "escanciador de sidra",
    "escanciador automático",
    "escanciador sidra eléctrico",
    "comprar escanciador de sidra",
    "escanciador de sidra online",
    "accesorios para sidra",
    "escanciador profesional",
    "escanciador recargable",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Escanciador de Sidra",
    title: "Escanciador de Sidra Automático | Compra Online",
    description:
      "Escanciador de sidra automático a batería. Compra online con envío rápido y atención personalizada.",
    images: [
      {
        url: "/img/i1862459534.webp",
        width: 1200,
        height: 630,
        alt: "Escanciador de sidra automático",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Escanciador de Sidra Automático | Compra Online",
    description:
      "Escanciador de sidra automático a batería. Compra online con envío rápido y atención personalizada.",
    images: ["/img/i1862459534.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Escanciador de Sidra",
    url: siteUrl,
    inLanguage: "es-ES",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/producto`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="es"
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Header />
        {children}
      </body>
    </html>
  );
}