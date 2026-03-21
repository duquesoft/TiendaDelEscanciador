"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const imagenes = [
    "/img/i1862459534.webp",
    "/img/i1862459545.webp",
    "/img/i1862467445.webp",
    "/img/i1862486538.webp",
    "/img/i1862488481.webp",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagenes.length);
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(intervalo);
  }, []);

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

      {/* CARRUSEL */}
      <section className="flex justify-center py-10 animate-fade-in-up">
        <img
          src={imagenes[index]}
          className="rounded-xl shadow-xl w-full max-w-lg transition-opacity duration-700"
          alt="Escanciador de sidra"
        />
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="grid md:grid-cols-3 gap-8 py-16 animate-fade-in-up">
        <div className="p-6 bg-white shadow rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Automático</h3>
          <p>Sirve la sidra con solo pulsar un botón.</p>
        </div>

        <div className="p-6 bg-white shadow rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">A batería</h3>
          <p>Autonomía perfecta para reuniones y eventos.</p>
        </div>

        <div className="p-6 bg-white shadow rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Diseño elegante</h3>
          <p>Acabado moderno en acero y madera.</p>
        </div>
      </section>

    </div>
  );
}