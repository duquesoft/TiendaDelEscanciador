import Link from "next/link";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Comprar Escanciador de Sidra | Guia Rapida y Oferta",
  description:
    "Todo lo que debes mirar para comprar un escanciador de sidra automatico: bateria, materiales, limpieza, envio y garantia.",
  alternates: {
    canonical: "/comprar-escanciador",
  },
  keywords: [
    "comprar escanciador",
    "comprar escanciador de sidra",
    "escanciador de sidra online",
    "escanciador automatico",
  ],
  openGraph: {
    title: "Comprar Escanciador de Sidra | Guia Rapida",
    description:
      "Guia clara para elegir el mejor escanciador de sidra automatico segun uso, bateria y precio.",
    url: "/comprar-escanciador",
    images: [
      {
        url: "/img/escanciador_fondo_blanco_16_9.jpg",
        width: 1280,
        height: 720,
        alt: "Comprar escanciador de sidra",
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
      name: "Que debo mirar antes de comprar un escanciador?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Revisa autonomia de bateria, estabilidad de la base, facilidad de limpieza, disponibilidad de recambios y tiempos de envio reales.",
      },
    },
    {
      "@type": "Question",
      name: "Es mejor un escanciador automatico o manual?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para uso diario y servicio uniforme, un escanciador automatico suele ser mas comodo y consistente que una alternativa manual.",
      },
    },
    {
      "@type": "Question",
      name: "Cuanto tarda el envio de un escanciador?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depende de la tienda. En Tienda del Escanciador trabajamos con entrega estimada de 24 a 72 horas en peninsula.",
      },
    },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Como comprar un escanciador de sidra sin equivocarte",
  description:
    "Consejos practicos para comprar un escanciador de sidra automatico con buena relacion calidad-precio.",
  image: [`${siteUrl}/img/escanciador_fondo_blanco_16_9.jpg`],
  dateModified: new Date().toISOString(),
  mainEntityOfPage: `${siteUrl}/comprar-escanciador`,
  author: {
    "@type": "Organization",
    name: "Tienda del Escanciador",
  },
  publisher: {
    "@type": "Organization",
    name: "Tienda del Escanciador",
  },
};

export default function ComprarEscanciadorPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
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
        Comprar escanciador de sidra: guia rapida para acertar
      </h1>

      <p className="text-lg text-gray-700 mb-8">
        Si estas buscando comprar un escanciador, esta guia te ayuda a elegir un modelo automatico
        con buen rendimiento, facil mantenimiento y un precio razonable.
      </p>

      <section className="space-y-5 text-gray-800 leading-relaxed mb-10">
        <h2 className="text-2xl font-bold text-gray-900">1. Bateria y autonomia real</h2>
        <p>
          Prioriza modelos recargables con autonomia estable para reuniones largas. Es importante que la
          carga sea sencilla y el puerto sea compatible con cargadores habituales.
        </p>

        <h2 className="text-2xl font-bold text-gray-900">2. Estabilidad y calidad de materiales</h2>
        <p>
          Un buen escanciador debe mantenerse firme, con base estable y acabados que aguanten uso
          frecuente. Esto mejora la precision al servir y evita vibraciones.
        </p>

        <h2 className="text-2xl font-bold text-gray-900">3. Limpieza y uso diario</h2>
        <p>
          Si lo vas a usar mucho, mira que sea facil de limpiar y de montar. Cuanto mas sencillo sea el
          mantenimiento, mejor experiencia tendras a largo plazo.
        </p>

        <h2 className="text-2xl font-bold text-gray-900">4. Envio, soporte y garantia</h2>
        <p>
          Antes de comprar, comprueba tiempos de envio, canales de soporte y condiciones de devolucion.
          Estos detalles suelen marcar la diferencia entre una buena y una mala compra online.
        </p>
      </section>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Listo para comprar?</h3>
        <p className="text-emerald-800 mb-4">
          Puedes ver el modelo disponible y hacer tu pedido directamente en nuestra pagina de producto.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/producto" className="rounded-lg bg-emerald-600 text-white px-5 py-3 font-semibold hover:bg-emerald-700">
            Ver escanciador disponible
          </Link>
          <Link href="/escanciador-barato" className="rounded-lg border border-emerald-400 text-emerald-800 px-5 py-3 font-semibold hover:bg-emerald-100">
            Ver guia de escanciador barato
          </Link>
        </div>
      </div>
    </div>
  );
}
