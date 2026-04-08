import ProductoClient from "./ProductoClient";
import { getPublicProducts } from "@/lib/products-public";
import { getSiteUrl } from "@/lib/site-url";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { DEFAULT_SHIPPING_FEE, parseShippingFeeRecord } from "@/lib/shipping-fee";

const PREFERRED_PRODUCT_IMAGE = "/img/escanciador_fondo_blanco_16_9.jpg";
const SQUARE_PRODUCT_IMAGE = "/img/escanciador_fondo_blanco_1_1.jpg";
const siteUrl = getSiteUrl();
const PRODUCT_BRAND_NAME = "Tienda del Escanciador";

async function getShippingFeeForStructuredData() {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin
      .from("store_settings")
      .select("value")
      .eq("key", "shipping_fee")
      .maybeSingle();

    if (error) {
      console.error("Structured data shipping fee read error:", error);
      return DEFAULT_SHIPPING_FEE;
    }

    return parseShippingFeeRecord(data);
  } catch (error) {
    console.error("Structured data shipping fee exception:", error);
    return DEFAULT_SHIPPING_FEE;
  }
}

export const metadata = {
  title: "Escanciador de Sidra Automático",
  description:
    "Compra el escanciador de sidra automático: diseño elegante, batería recargable y envío rápido.",
  keywords: [
    "escanciador de sidra automático",
    "comprar escanciador de sidra",
    "escanciador eléctrico",
    "escanciador recargable",
  ],
  alternates: {
    canonical: "/producto",
  },
  openGraph: {
    title: "Escanciador de Sidra Automático",
    description:
      "Compra el escanciador de sidra automático: diseño elegante, batería recargable y envío rápido.",
    url: "/producto",
    images: [
      {
        url: PREFERRED_PRODUCT_IMAGE,
        width: 1280,
        height: 720,
        alt: "Escanciador de sidra automático",
      },
    ],
  },
};

export const revalidate = 60;

export default async function ProductoPage() {
  const products = await getPublicProducts();
  const shippingFee = await getShippingFeeForStructuredData();
  const product = products?.[0] || null;

  const productImages = product
    ? (Array.isArray(product.gallery) && product.gallery.length > 0
        ? product.gallery
        : product.imageUrl
          ? [product.imageUrl]
          : [])
    : [];

  const productJsonLdImages = [
    PREFERRED_PRODUCT_IMAGE,
    SQUARE_PRODUCT_IMAGE,
    ...productImages.filter(
      (img) => img && img !== PREFERRED_PRODUCT_IMAGE && img !== SQUARE_PRODUCT_IMAGE
    ),
  ];

  const productAggregateRating =
    product?.aggregateRating &&
    Number.isFinite(Number(product.aggregateRating.ratingValue)) &&
    Number.isInteger(Number(product.aggregateRating.reviewCount)) &&
    Number(product.aggregateRating.ratingValue) >= 1 &&
    Number(product.aggregateRating.ratingValue) <= 5 &&
    Number(product.aggregateRating.reviewCount) > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(product.aggregateRating.ratingValue).toFixed(1),
          reviewCount: Number(product.aggregateRating.reviewCount),
        }
      : null;

  const productReviews = Array.isArray(product?.reviews)
    ? product.reviews
        .filter(
          (review) =>
            review &&
            typeof review.author === "string" &&
            review.author.trim().length > 0 &&
            typeof review.body === "string" &&
            review.body.trim().length > 0 &&
            Number.isFinite(Number(review.rating)) &&
            Number(review.rating) >= 1 &&
            Number(review.rating) <= 5
        )
        .map((review) => {
          const normalized = {
            "@type": "Review",
            author: {
              "@type": "Person",
              name: review.author.trim(),
            },
            reviewBody: review.body.trim(),
            reviewRating: {
              "@type": "Rating",
              ratingValue: Number(review.rating).toFixed(1),
              bestRating: "5",
              worstRating: "1",
            },
          };

          if (typeof review.datePublished === "string" && review.datePublished.trim()) {
            return {
              ...normalized,
              datePublished: review.datePublished.trim(),
            };
          }

          return normalized;
        })
    : [];

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description:
          product.description ||
          "Escanciador de sidra automatico recargable con diseno elegante y servicio uniforme.",
        image: productJsonLdImages,
        sku: String(product.id),
        brand: {
          "@type": "Brand",
          name: PRODUCT_BRAND_NAME,
        },
        offers: {
          "@type": "Offer",
          url: `${siteUrl}/producto`,
          priceCurrency: "EUR",
          price: Number(product.price || 0).toFixed(2),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: Number(shippingFee).toFixed(2),
              currency: "EUR",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "ES",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 1,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 3,
                unitCode: "DAY",
              },
            },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "ES",
            returnPolicyCategory:
              "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
          },
        },
        ...(productAggregateRating ? { aggregateRating: productAggregateRating } : {}),
        ...(productReviews.length > 0 ? { review: productReviews } : {}),
      }
    : null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo funciona el escanciador de sidra automático?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Funciona con un botón de activación que impulsa la sidra de forma constante para facilitar un servicio cómodo, limpio y uniforme.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánto tarda en cargar la batería?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "La carga completa recomendada es de aproximadamente 2 horas con un cargador compatible.",
        },
      },
      {
        "@type": "Question",
        name: "¿Sirve para uso diario?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, está diseñado para uso frecuente tanto en casa como en reuniones y hostelería.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué incluye la compra?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Incluye el escanciador y sus componentes principales. El contenido exacto puede variar según la configuración actual del producto.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hacéis envíos rápidos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, trabajamos para que recibas tu pedido lo antes posible con seguimiento del envío.",
        },
      },
    ],
  };

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductoClient initialProducts={products} />
    </>
  );
}
