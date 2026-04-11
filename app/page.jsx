/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const IMAGENES_IZQUIERDA = [
  "/img/i1862459534.webp",
  "/img/i1862459545.webp",
  "/img/i1862467445.webp",
];

const IMAGENES_DERECHA = [
  "/img/i1862486538.webp",
  "/img/i1862488481.webp",
  "/img/i1862459534.webp",
];

const GALERIA_IMAGENES = [...new Set([...IMAGENES_IZQUIERDA, ...IMAGENES_DERECHA])];

export default function Home() {
  const [indexIzquierda, setIndexIzquierda] = useState(0);
  const [indexDerecha, setIndexDerecha] = useState(0);

  const [fadeIzquierda, setFadeIzquierda] = useState(true);
  const [fadeDerecha, setFadeDerecha] = useState(true);
  const [indiceImagenAmpliada, setIndiceImagenAmpliada] = useState(null);
  const [inicioToqueX, setInicioToqueX] = useState(null);

  const [pausadoIzquierda, setPausadoIzquierda] = useState(false);
  const [pausadoDerecha, setPausadoDerecha] = useState(false);
  const [debeCargarVideo, setDebeCargarVideo] = useState(false);
  const [esMovil, setEsMovil] = useState(null);
  const videoSectionRef = useRef(null);
  const totalImagenesIzquierda = IMAGENES_IZQUIERDA.length;
  const totalImagenesDerecha = IMAGENES_DERECHA.length;

  const setPremiumPlaybackRate = (event) => {
    event.currentTarget.playbackRate = 0.95;
  };

  const abrirImagenAmpliada = (src) => {
    const indice = GALERIA_IMAGENES.indexOf(src);
    if (indice !== -1) {
      setIndiceImagenAmpliada(indice);
    }
  };

  const cerrarImagenAmpliada = useCallback(() => {
    setIndiceImagenAmpliada(null);
  }, []);

  const mostrarAnteriorImagen = useCallback(() => {
    setIndiceImagenAmpliada((prev) => {
      if (prev === null) return prev;
      return (prev - 1 + GALERIA_IMAGENES.length) % GALERIA_IMAGENES.length;
    });
  }, []);

  const mostrarSiguienteImagen = useCallback(() => {
    setIndiceImagenAmpliada((prev) => {
      if (prev === null) return prev;
      return (prev + 1) % GALERIA_IMAGENES.length;
    });
  }, []);

  const manejarInicioToque = (event) => {
    setInicioToqueX(event.touches[0].clientX);
  };

  const manejarFinToque = (event) => {
    if (inicioToqueX === null) return;

    const finToqueX = event.changedTouches[0].clientX;
    const deltaX = finToqueX - inicioToqueX;

    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        mostrarAnteriorImagen();
      } else {
        mostrarSiguienteImagen();
      }
    }

    setInicioToqueX(null);
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!pausadoIzquierda) {
        setFadeIzquierda(false);
        setTimeout(() => {
          setIndexIzquierda((prev) => (prev + 1) % totalImagenesIzquierda);
          setFadeIzquierda(true);
        }, 240);
      }
    }, 4500);

    return () => clearInterval(intervalo);
  }, [pausadoIzquierda, totalImagenesIzquierda]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!pausadoDerecha) {
        setFadeDerecha(false);
        setTimeout(() => {
          setIndexDerecha((prev) => (prev + 1) % totalImagenesDerecha);
          setFadeDerecha(true);
        }, 240);
      }
    }, 4500);

    return () => clearInterval(intervalo);
  }, [pausadoDerecha, totalImagenesDerecha]);

  useEffect(() => {
    if (indiceImagenAmpliada === null) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        cerrarImagenAmpliada();
      }
      if (event.key === "ArrowLeft") {
        mostrarAnteriorImagen();
      }
      if (event.key === "ArrowRight") {
        mostrarSiguienteImagen();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [cerrarImagenAmpliada, indiceImagenAmpliada, mostrarAnteriorImagen, mostrarSiguienteImagen]);

  useEffect(() => {
    const target = videoSectionRef.current;
    if (!target || debeCargarVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDebeCargarVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [debeCargarVideo]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const actualizarViewport = () => {
      setEsMovil(mediaQuery.matches);
    };

    actualizarViewport();
    mediaQuery.addEventListener("change", actualizarViewport);

    return () => {
      mediaQuery.removeEventListener("change", actualizarViewport);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* HERO */}
      <section className="text-center py-16 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4">Escanciador de Sidra Automático</h1>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Compra tu escanciador de sidra automático con diseño elegante y batería recargable.
          Servicio rápido, pago seguro y atención personalizada.
        </p>

        <Link
          href="/producto"
          className="inline-block bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-500 hover:to-green-500 text-slate-950 py-4 px-10 rounded-xl text-xl font-semibold shadow-[0_12px_28px_rgba(34,197,94,0.20)] transition-transform hover:scale-105"
        >
          Comprar ahora
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/85 border border-gray-200 px-4 py-2 text-gray-700 shadow-sm">
            <span aria-hidden="true">🔒</span>
            Pago seguro
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/85 border border-gray-200 px-4 py-2 text-gray-700 shadow-sm">
            <span aria-hidden="true">🚚</span>
            Envío rápido 24/72h
          </span>
        </div>
      </section>

      <section className="max-w-3xl mx-auto text-center mb-10 px-2">
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
          Disfruta la sidra como se merece con nuestro escanciador de sidra automático.
          Un producto pensado para servir con comodidad, precisión y un acabado profesional,
          ideal para casa, reuniones y hostelería.
        </p>
      </section>

      {/* VIDEO + IMÁGENES */}
      <section ref={videoSectionRef} className="mt-1 animate-fade-in-up flex flex-col items-center">

        {/* Escritorio */}
        <div className="hidden md:flex w-full items-center justify-center gap-16">

          {/* Imagen izquierda */}
          <div className="w-1/3 h-[520px] rounded-xl overflow-hidden relative border border-slate-300/60 bg-white/40 shadow-2xl shadow-black/40">
            <Image
              src={IMAGENES_IZQUIERDA[indexIzquierda]}
              alt="Fondo desenfocado del producto"
              fill
              sizes="(max-width: 767px) 50vw, 33vw"
              quality={45}
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg opacity-70"
              aria-hidden="true"
            />

            <img
              src={IMAGENES_IZQUIERDA[indexIzquierda]}
              onMouseEnter={() => setPausadoIzquierda(true)}
              onMouseLeave={() => setPausadoIzquierda(false)}
              onTouchStart={() => setPausadoIzquierda(true)}
              onTouchEnd={() => setPausadoIzquierda(false)}
              onClick={() => abrirImagenAmpliada(IMAGENES_IZQUIERDA[indexIzquierda])}
              className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                fadeIzquierda ? "opacity-100 scale-100 translate-y-0" : "opacity-20 scale-[1.025] translate-y-[2px]"
              }`}
              style={{ cursor: "zoom-in" }}
              alt="Imagen del escanciador"
            />
            <div className="absolute inset-[1px] pointer-events-none rounded-[11px] border border-white/70" />
          </div>

          {/* VIDEO */}
          <div className="w-1/3 h-[520px] rounded-xl overflow-hidden relative border border-slate-300/60 bg-white/40 shadow-2xl shadow-black/40">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              poster="/img/i1862459534.webp"
              onLoadedMetadata={setPremiumPlaybackRate}
              className="w-full h-full object-cover object-top rounded-xl brightness-[1.03] contrast-[1.05] saturate-[1.02]"
            >
              {debeCargarVideo && esMovil === false ? (
                <>
                  <source src="/video/video1-optimized.webm" type="video/webm" />
                  <source src="/video/video1-optimized.mp4" type="video/mp4" />
                </>
              ) : null}
            </video>
            <div className="absolute inset-[1px] pointer-events-none rounded-[11px] border border-white/70" />
          </div>

          {/* Imagen derecha */}
          <div className="w-1/3 h-[520px] rounded-xl overflow-hidden relative border border-slate-300/60 bg-white/40 shadow-2xl shadow-black/40">
            <Image
              src={IMAGENES_DERECHA[indexDerecha]}
              alt="Fondo desenfocado del producto"
              fill
              sizes="(max-width: 767px) 50vw, 33vw"
              quality={45}
              className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg opacity-70"
              aria-hidden="true"
            />

            <img
              src={IMAGENES_DERECHA[indexDerecha]}
              onMouseEnter={() => setPausadoDerecha(true)}
              onMouseLeave={() => setPausadoDerecha(false)}
              onTouchStart={() => setPausadoDerecha(true)}
              onTouchEnd={() => setPausadoDerecha(false)}
              onClick={() => abrirImagenAmpliada(IMAGENES_DERECHA[indexDerecha])}
              className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                fadeDerecha ? "opacity-100 scale-100 translate-y-0" : "opacity-20 scale-[1.025] translate-y-[2px]"
              }`}
              style={{ cursor: "zoom-in" }}
              alt="Imagen del escanciador"
            />
            <div className="absolute inset-[1px] pointer-events-none rounded-[11px] border border-white/70" />
          </div>

        </div>

        {/* Móvil */}
        <div className="md:hidden w-full flex flex-col items-center gap-0.5">

          {/* VIDEO */}
          <div className="w-full rounded-xl overflow-hidden h-[560px] flex items-center justify-center mb-6 relative border border-slate-300/60 bg-white/40 shadow-2xl shadow-black/40">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              poster="/img/i1862459534.webp"
              onLoadedMetadata={setPremiumPlaybackRate}
              className="w-full h-full object-cover object-top rounded-xl brightness-[1.03] contrast-[1.05] saturate-[1.02]"
            >
              {debeCargarVideo && esMovil === true ? (
                <>
                  <source src="/video/video1-optimized.webm" type="video/webm" />
                  <source src="/video/video1-optimized.mp4" type="video/mp4" />
                </>
              ) : null}
            </video>
            <div className="absolute inset-[1px] pointer-events-none rounded-[11px] border border-white/70" />
          </div>

          {/* BLOQUE AUTOMÁTICO (MÓVIL) */}
          <div className="w-full p-6 rounded-xl text-center 
                          bg-gradient-to-b from-white/60 via-gray-100/60 to-gray-200/60
                          backdrop-blur-md border border-white/60
                          shadow-2xl shadow-black/30">
            <div className="text-3xl mb-3" aria-hidden="true">⚡</div>
          <h2 className="text-xl font-semibold mb-2">Automático</h2>
            <p>Sirve la sidra con solo pulsar un botón.</p>
          </div>

          <div className="flex w-full gap-0.5 mt-6">

            {/* Imagen izquierda móvil */}
            <div className="w-1/2 rounded-xl overflow-hidden h-[270px] relative border border-slate-300/60 bg-white/40 shadow-2xl shadow-black/40">

              <Image
                src={IMAGENES_IZQUIERDA[indexIzquierda]}
                alt="Fondo desenfocado del producto"
                fill
                sizes="(max-width: 767px) 50vw, 33vw"
                quality={45}
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg opacity-70"
                aria-hidden="true"
              />

              <img
                src={IMAGENES_IZQUIERDA[indexIzquierda]}
                onMouseEnter={() => setPausadoIzquierda(true)}
                onMouseLeave={() => setPausadoIzquierda(false)}
                onTouchStart={() => setPausadoIzquierda(true)}
                onTouchEnd={() => setPausadoIzquierda(false)}
                onClick={() => abrirImagenAmpliada(IMAGENES_IZQUIERDA[indexIzquierda])}
                className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  fadeIzquierda ? "opacity-100 scale-100 translate-y-0" : "opacity-20 scale-[1.025] translate-y-[2px]"
                }`}
                style={{ cursor: "zoom-in" }}
                alt="Imagen del escanciador"
              />
              <div className="absolute inset-[1px] pointer-events-none rounded-[11px] border border-white/70" />
            </div>

            {/* Imagen derecha móvil */}
            <div className="w-1/2 rounded-xl overflow-hidden h-[270px] relative border border-slate-300/60 bg-white/40 shadow-2xl shadow-black/40">

              <Image
                src={IMAGENES_DERECHA[indexDerecha]}
                alt="Fondo desenfocado del producto"
                fill
                sizes="(max-width: 767px) 50vw, 33vw"
                quality={45}
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg opacity-70"
                aria-hidden="true"
              />

              <img
                src={IMAGENES_DERECHA[indexDerecha]}
                onMouseEnter={() => setPausadoDerecha(true)}
                onMouseLeave={() => setPausadoDerecha(false)}
                onTouchStart={() => setPausadoDerecha(true)}
                onTouchEnd={() => setPausadoDerecha(false)}
                onClick={() => abrirImagenAmpliada(IMAGENES_DERECHA[indexDerecha])}
                className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  fadeDerecha ? "opacity-100 scale-100 translate-y-0" : "opacity-20 scale-[1.025] translate-y-[2px]"
                }`}
                style={{ cursor: "zoom-in" }}
                alt="Imagen del escanciador"
              />
              <div className="absolute inset-[1px] pointer-events-none rounded-[11px] border border-white/70" />
            </div>

          </div>

        </div>

      </section>

      {/* CARACTERÍSTICAS (PC + móvil) */}
      <section className="grid md:grid-cols-3 gap-8 py-16 animate-fade-in-up">

        {/* Automático — SOLO PC */}
        <div className="p-6 rounded-xl text-center hidden md:block
            bg-gradient-to-b from-white/60 via-gray-100/60 to-gray-200/60
            backdrop-blur-md border border-white/60
            shadow-2xl shadow-black/30">
          <div className="text-3xl mb-3" aria-hidden="true">⚡</div>
          <h2 className="text-xl font-semibold mb-2">Automático</h2>
          <p>Sirve la sidra con solo pulsar un botón.</p>
        </div>

        {/* A batería */}
        <div className="p-6 rounded-xl text-center 
            bg-gradient-to-b from-white/60 via-gray-100/60 to-gray-200/60
            backdrop-blur-md border border-white/60
            shadow-2xl shadow-black/30">
          <div className="text-3xl mb-3" aria-hidden="true">🔋</div>
          <h2 className="text-xl font-semibold mb-2">A batería</h2>
          <p>Autonomía perfecta para reuniones y eventos.</p>
        </div>

        {/* Diseño elegante */}
        <div className="p-6 rounded-xl text-center 
            bg-gradient-to-b from-white/60 via-gray-100/60 to-gray-200/60
            backdrop-blur-md border border-white/60
            shadow-2xl shadow-black/30">
          <div className="text-3xl mb-3" aria-hidden="true">✨</div>
          <h2 className="text-xl font-semibold mb-2">Diseño elegante</h2>
          <p>Acabado moderno en acero y madera.</p>
        </div>

      </section>

      {indiceImagenAmpliada !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={cerrarImagenAmpliada}
        >
          <button
            type="button"
            aria-label="Cerrar imagen ampliada"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 text-slate-900 text-xl leading-none shadow-md"
            onClick={cerrarImagenAmpliada}
          >
            ×
          </button>

          <button
            type="button"
            aria-label="Imagen anterior"
            className="hidden md:flex items-center justify-center absolute z-20 left-8 h-11 w-11 rounded-full bg-white/95 text-slate-900 text-2xl leading-none shadow-md"
            onClick={(event) => {
              event.stopPropagation();
              mostrarAnteriorImagen();
            }}
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Imagen siguiente"
            className="hidden md:flex items-center justify-center absolute z-20 right-8 h-11 w-11 rounded-full bg-white/95 text-slate-900 text-2xl leading-none shadow-md"
            onClick={(event) => {
              event.stopPropagation();
              mostrarSiguienteImagen();
            }}
          >
            ›
          </button>

          <div
            className="relative max-w-5xl w-full max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={manejarInicioToque}
            onTouchEnd={manejarFinToque}
          >
            <img
                src={GALERIA_IMAGENES[indiceImagenAmpliada]}
              alt="Imagen ampliada del escanciador"
              className="w-full h-full max-h-[90vh] object-contain rounded-2xl bg-white/5"
            />
          </div>

          <div
            className="md:hidden absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Imagen anterior"
              className="h-11 w-11 rounded-lg bg-white/95 text-slate-900 text-2xl leading-none shadow-md"
              onClick={mostrarAnteriorImagen}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              className="h-11 w-11 rounded-lg bg-white/95 text-slate-900 text-2xl leading-none shadow-md"
              onClick={mostrarSiguienteImagen}
            >
              ›
            </button>
          </div>
        </div>
      )}

    </div>
  );
}