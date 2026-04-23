import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingWhatsappButton from "./components/FloatingWhatsappButton";
import CookieConsent from "./components/CookieConsent";
import IgnoreExtensionErrors from "./components/IgnoreExtensionErrors";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DEFAULT_HEADER_THEME, HeaderTheme, parseHeaderThemeRecord } from "@/lib/header-theme";
import { unstable_noStore as noStore } from "next/cache";
import { getSiteUrl } from "@/lib/site-url";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

const DEFAULT_WHATSAPP_NUMBER = "";
const DEFAULT_SOCIAL_IMAGE = "/img/escanciador_fondo_blanco_16_9.jpg";
const IGNORE_EXTENSION_ERRORS_SCRIPT = `
  (() => {
    const metamaskExtensionId = "nkbihfbeogaeaoehlefnkodbefgpgknn";
    const isMetaMaskMessage = (value) => {
      if (typeof value !== "string") return false;
      const normalized = value.toLowerCase();
      return normalized.includes("failed to connect to metamask") || normalized.includes("chrome-extension://" + metamaskExtensionId);
    };
    const isMetaMaskStack = (value) => {
      return typeof value === "string" && value.includes("chrome-extension://" + metamaskExtensionId);
    };
    const swallow = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      event.stopPropagation?.();
    };
    window.addEventListener("error", (event) => {
      const fromExtension = typeof event.filename === "string" && event.filename.includes("chrome-extension://" + metamaskExtensionId);
      if (fromExtension || isMetaMaskMessage(event.message) || isMetaMaskStack(event.error?.stack)) {
        swallow(event);
      }
    }, true);
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      const reasonMessage = typeof reason === "string"
        ? reason
        : typeof reason?.message === "string"
          ? reason.message
          : "";
      const reasonStack = typeof reason?.stack === "string" ? reason.stack : "";
      if (isMetaMaskMessage(reasonMessage) || isMetaMaskStack(reasonStack)) {
        swallow(event);
      }
    }, true);
  })();
`;

async function getWhatsappNumber(): Promise<string> {
  try {
    const supabaseAdmin = createAdminClient(
      getSupabaseUrl(),
      getSupabaseServiceRoleKey()
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
      getSupabaseUrl(),
      getSupabaseServiceRoleKey()
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

const siteUrl = getSiteUrl();

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
    default: "Tienda del Escanciador | Compra Online",
    template: "%s | Tienda del Escanciador",
  },
  description:
    "Escanciador de sidra automático a batería. Compra online con envío rápido y atención personalizada.",
  keywords: [
    "escanciador de sidra",
    "escanciador automático",
    "escanciador sidra eléctrico",
    "comprar escanciador",
    "comprar escanciador de sidra",
    "escanciador barato",
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
    siteName: "Tienda del Escanciador",
    title: "Tienda del Escanciador | Compra Online",
    description:
      "Escanciador de sidra automático a batería. Compra online con envío rápido y atención personalizada.",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1280,
        height: 720,
        alt: "Escanciador de sidra automático",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda del Escanciador | Compra Online",
    description:
      "Escanciador de sidra automático a batería. Compra online con envío rápido y atención personalizada.",
    images: [DEFAULT_SOCIAL_IMAGE],
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
    name: "Tienda del Escanciador",
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
      <body className={`min-h-screen flex flex-col${typeof window !== 'undefined' && (window.location.pathname.startsWith('/carrito') || window.location.pathname.startsWith('/checkout')) ? ' no-leaves-bg' : ''}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: IGNORE_EXTENSION_ERRORS_SCRIPT.replace(/</g, "\\u003c"),
          }}
        />
        <IgnoreExtensionErrors />
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
        <Footer initialWhatsappNumber={whatsappNumber} />
        <CookieConsent />
        <FloatingWhatsappButton initialWhatsappNumber={whatsappNumber} />
      </body>
    </html>
  );
}