import Link from "next/link";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Escanciador Barato: Como Elegir Bien sin Perder Calidad",
  description:
    "Buscas un escanciador barato? Te explicamos que mirar para evitar modelos de baja calidad y acertar con la compra.",
  alternates: {
    canonical: "/escanciador-barato",
  },
  keywords: [
    "escanciador barato",
    "escanciador de sidra barato",
    "mejor escanciador calidad precio",
    "escanciador automatico barato",
  ],
  openGraph: {
    title: "Escanciador Barato: Guia Calidad-Precio",
    description:
      "Consejos para comprar un escanciador barato sin renunciar a bateria, estabilidad y servicio uniforme.",
    url: "/escanciador-barato",
    images: [
      {
        url: "/img/escanciador_fondo_blanco_16_9.jpg",
        width: 1280,
        height: 720,
        alt: "Escanciador barato con buena calidad",
      },
    ],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Un escanciador barato merece la pena?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si cumple unos minimos de estabilidad, autonomia y materiales, puede ofrecer muy buena relacion calidad-precio.",
      },
    },
    {
      "@type": "Question",
      name: "Que errores debo evitar al buscar un escanciador barato?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evita modelos sin informacion clara sobre bateria, sin fotos reales, sin soporte y sin politica de devolucion transparente.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: `${siteUrl}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Escanciador barato",
      item: `${siteUrl}/escanciador-barato`,
    },
  ],
};

export default function EscanciadorBaratoPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mb-8 text-center">
        <Link
          href="/producto"
          className="inline-block bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-500 hover:to-green-500 text-slate-950 py-4 px-10 rounded-xl text-xl font-semibold shadow-[0_12px_28px_rgba(34,197,94,0.20)] transition-transform hover:scale-105"
        >
          Comprar escanciador ahora
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
        Escanciador barato: que mirar para comprar bien
      </h1>

      <p className="text-lg text-gray-700 mb-8">
        Buscar un escanciador barato no significa comprar lo peor. Con unos criterios claros puedes encontrar
        un modelo fiable, comodo y con buen acabado sin pagar de mas.
      </p>

      <section className="space-y-5 text-gray-800 leading-relaxed mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Que define una buena compra calidad-precio</h2>
        <p>
          Fijate en que el servicio sea uniforme, que la base sea estable y que la bateria aguante sesiones
          reales de uso. Son los tres puntos que mas se notan en el dia a dia.
        </p>

        <h2 className="text-2xl font-bold text-gray-900">Indicadores de confianza antes de pagar</h2>
        <p>
          Busca fotos reales del producto, informacion de envio clara y atencion al cliente accesible.
          Si faltan estos elementos, el riesgo de una mala compra sube mucho.
        </p>

        <h2 className="text-2xl font-bold text-gray-900">Comparar precio total, no solo precio base</h2>
        <p>
          Ten en cuenta envio, plazos y garantia. A veces una opcion muy barata termina costando mas por
          retrasos o falta de soporte.
        </p>
      </section>

      <div className="rounded-xl border border-sky-200 bg-sky-50 p-6">
        <h3 className="text-xl font-bold text-sky-900 mb-2">Ver una opcion equilibrada</h3>
        <p className="text-sky-800 mb-4">
          Si quieres una opcion con buen equilibrio entre precio, calidad y rapidez de entrega,
          puedes revisar nuestro producto principal.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/producto" className="rounded-lg bg-sky-600 text-white px-5 py-3 font-semibold hover:bg-sky-700">
            Ver producto
          </Link>
          <Link href="/comprar-escanciador" className="rounded-lg border border-sky-400 text-sky-800 px-5 py-3 font-semibold hover:bg-sky-100">
            Leer guia de compra completa
          </Link>
        </div>
      </div>
    </div>
  );
}
