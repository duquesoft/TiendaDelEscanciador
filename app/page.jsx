"use client";
import { useEffect, useState } from "react";
// trigger redeploy

export default function Home() {
  const imagenesIzquierda = [
    "/img/i1862459534.webp",
    "/img/i1862459545.webp",
    "/img/i1862467445.webp",
  ];

  const imagenesDerecha = [
    "/img/i1862486538.webp",
    "/img/i1862488481.webp",
    "/img/i1862459534.webp",
  ];

  // Índices independientes
  const [indexIzquierda, setIndexIzquierda] = useState(0);
  const [indexDerecha, setIndexDerecha] = useState(0);

  // Fades independientes
  const [fadeIzquierda, setFadeIzquierda] = useState(true);
  const [fadeDerecha, setFadeDerecha] = useState(true);

  // Pausas independientes
  const [pausadoIzquierda, setPausadoIzquierda] = useState(false);
  const [pausadoDerecha, setPausadoDerecha] = useState(false);

  // Intervalo izquierda
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!pausadoIzquierda) {
        setFadeIzquierda(false);
        setTimeout(() => {
          setIndexIzquierda((prev) => (prev + 1) % imagenesIzquierda.length);
          setFadeIzquierda(true);
        }, 300);
      }
    }, 3000);

    return () => clearInterval(intervalo);
  }, [pausadoIzquierda]);

  // Intervalo derecha
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!pausadoDerecha) {
        setFadeDerecha(false);
        setTimeout(() => {
          setIndexDerecha((prev) => (prev + 1) % imagenesDerecha.length);
          setFadeDerecha(true);
        }, 300);
      }
    }, 3000);

    return () => clearInterval(intervalo);
  }, [pausadoDerecha]);

  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* HERO */}
      <section className="text-center py-16 animate-fade-in">
        <h2 className="text-4xl font-bold mb-4">Escanciador de Sidra Automático</h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          La forma más elegante, limpia y moderna de disfrutar la sidra natural.
          Diseño minimalista, funcionamiento automático y acabado premium.
        </p>

        <a
          href="/producto"
          className="inline-block bg-green-600 hover:bg-green-700 text-white py-4 px-10 rounded-xl text-xl font-semibold shadow-lg transition-transform hover:scale-105"
        >
          Comprar ahora
        </a>
      </section>

      {/* VIDEO + IMÁGENES */}
      <section className="mt-1 animate-fade-in-up flex flex-col items-center">

        {/* Escritorio */}
        <div className="hidden md:flex w-full items-center justify-center gap-16">

          {/* Imagen izquierda con fondo difuminado */}
          <div className="w-1/3 h-[520px] rounded-xl overflow-hidden relative">
            <img
              src={imagenesIzquierda[indexIzquierda]}
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg opacity-70"
            />

            <img
              src={imagenesIzquierda[indexIzquierda]}
              onMouseEnter={() => setPausadoIzquierda(true)}
              onMouseLeave={() => setPausadoIzquierda(false)}
              onTouchStart={() => setPausadoIzquierda(true)}
              onTouchEnd={() => setPausadoIzquierda(false)}
              className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-opacity duration-700 ${
                fadeIzquierda ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {/* VIDEO */}
          <div className="w-1/3 h-[520px] rounded-xl overflow-hidden">
            <video
              src="/video/video1.webm"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-top rounded-xl"
            />
          </div>

          {/* Imagen derecha con fondo difuminado */}
          <div className="w-1/3 h-[520px] rounded-xl overflow-hidden relative">
            <img
              src={imagenesDerecha[indexDerecha]}
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg opacity-70"
            />

            <img
              src={imagenesDerecha[indexDerecha]}
              onMouseEnter={() => setPausadoDerecha(true)}
              onMouseLeave={() => setPausadoDerecha(false)}
              onTouchStart={() => setPausadoDerecha(true)}
              onTouchEnd={() => setPausadoDerecha(false)}
              className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-opacity duration-700 ${
                fadeDerecha ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

        </div>

        {/* Móvil */}
        <div className="md:hidden w-full flex flex-col items-center gap-0.5">

          {/* VIDEO */}
          <div className="w-full rounded-xl overflow-hidden h-[560px] flex items-center justify-center mb-6">
            <video
              src="/video/video1.webm"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-top rounded-xl"
            />
          </div>

          {/* BLOQUE AUTOMÁTICO (MÓVIL) */}
          <div className="w-full p-6 bg-white shadow rounded-lg text-center my-6">
            <h3 className="text-xl font-semibold mb-2">Automático</h3>
            <p>Sirve la sidra con solo pulsar un botón.</p>
          </div>

          <div className="flex w-full gap-0.5 mt-6">

            {/* Imagen izquierda móvil */}
            <div className="w-1/2 rounded-xl overflow-hidden h-[270px] relative">

              <img
                src={imagenesIzquierda[indexIzquierda]}
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg opacity-70"
              />

              <img
                src={imagenesIzquierda[indexIzquierda]}
                onMouseEnter={() => setPausadoIzquierda(true)}
                onMouseLeave={() => setPausadoIzquierda(false)}
                onTouchStart={() => setPausadoIzquierda(true)}
                onTouchEnd={() => setPausadoIzquierda(false)}
                className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-opacity duration-700 ${
                  fadeIzquierda ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

            {/* Imagen derecha móvil */}
            <div className="w-1/2 rounded-xl overflow-hidden h-[270px] relative">

              <img
                src={imagenesDerecha[indexDerecha]}
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg opacity-70"
              />

              <img
                src={imagenesDerecha[indexDerecha]}
                onMouseEnter={() => setPausadoDerecha(true)}
                onMouseLeave={() => setPausadoDerecha(false)}
                onTouchStart={() => setPausadoDerecha(true)}
                onTouchEnd={() => setPausadoDerecha(false)}
                className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-opacity duration-700 ${
                  fadeDerecha ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>

          </div>

        </div>

      </section>

{/* CARACTERÍSTICAS (restaurado para PC) */}
<section className="grid md:grid-cols-3 gap-8 py-16 animate-fade-in-up">

  {/* Automático — SOLO PC */}
  <div className="p-6 bg-white shadow rounded-lg text-center hidden md:block">
    <h3 className="text-xl font-semibold mb-2">Automático</h3>
    <p>Sirve la sidra con solo pulsar un botón.</p>
  </div>

  {/* A batería */}
  <div className="p-6 bg-white shadow rounded-lg text-center">
    <h3 className="text-xl font-semibold mb-2">A batería</h3>
    <p>Autonomía perfecta para reuniones y eventos.</p>
  </div>

  {/* Diseño elegante */}
  <div className="p-6 bg-white shadow rounded-lg text-center">
    <h3 className="text-xl font-semibold mb-2">Diseño elegante</h3>
    <p>Acabado moderno en acero y madera.</p>
  </div>

</section>
    </div>
  );
}