import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DEFAULT_HEADER_THEME, HeaderTheme, parseHeaderThemeRecord } from "@/lib/header-theme";
import { unstable_noStore as noStore } from "next/cache";

const DEFAULT_WHATSAPP_NUMBER = "";

async function getWhatsappNumber(): Promise<string> {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle();

    if (error || !data) return DEFAULT_WHATSAPP_NUMBER;

    return typeof data.value === "string" ? data.value.trim() : DEFAULT_WHATSAPP_NUMBER;
  } catch {
    return DEFAULT_WHATSAPP_NUMBER;
  }
}

async function getHeaderTheme(): Promise<HeaderTheme> {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .select("value")
      .eq("key", "header_theme")
      .maybeSingle();

    if (error) return DEFAULT_HEADER_THEME;

    return parseHeaderThemeRecord(data);
  } catch {
    return DEFAULT_HEADER_THEME;
  }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.escancidorbarato.com";

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
    default: "Escancidor Barato | Compra Online",
    template: "%s | Escancidor Barato",
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
    siteName: "Escancidor Barato",
    title: "Escancidor Barato | Compra Online",
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
    title: "Escancidor Barato | Compra Online",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();
  const whatsappNumber = await getWhatsappNumber();
  const headerTheme = await getHeaderTheme();
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Escancidor Barato",
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
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Header theme={headerTheme} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {whatsappNumber ? (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="white"
            width="32"
            height="32"
            aria-hidden="true"
          >
            <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.736 5.47 2.027 7.77L0 32l8.437-2.01A15.934 15.934 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.77-1.848l-.486-.289-5.01 1.195 1.23-4.88-.317-.502A13.24 13.24 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.878c-.398-.199-2.355-1.162-2.72-1.295-.366-.132-.632-.199-.898.2-.265.398-1.03 1.294-1.263 1.56-.232.265-.465.298-.863.1-.399-.2-1.683-.62-3.204-1.977-1.184-1.057-1.984-2.362-2.217-2.76-.233-.399-.025-.614.175-.812.18-.179.399-.465.598-.698.2-.232.266-.398.399-.664.132-.265.066-.498-.033-.697-.1-.2-.898-2.163-1.23-2.96-.324-.778-.653-.673-.898-.686l-.765-.013c-.266 0-.698.1-1.063.498-.366.399-1.396 1.363-1.396 3.326s1.43 3.857 1.629 4.123c.2.265 2.815 4.298 6.822 6.027.953.412 1.697.657 2.277.841.956.304 1.827.261 2.515.158.767-.114 2.355-.963 2.688-1.893.332-.93.332-1.728.232-1.893-.1-.166-.365-.265-.763-.464z" />
          </svg>
        </a>
        ) : null}
      </body>
    </html>
  );
}