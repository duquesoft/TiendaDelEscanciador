"use client";
import { useState } from "react";

export default function Producto() {

  const imagenes = [
    "/img/i1862459534.webp",
    "/img/i1862459545.webp",
    "/img/i1862467445.webp",
    "/img/i1862486538.webp",
    "/img/i1862488481.webp",
  ];

  const [imagenPrincipal, setImagenPrincipal] = useState(imagenes[0]);

  const añadirAlCarrito = () => {
    const producto = {
      id: 1,
      nombre: "Escanciador Automático",
      precio: 79.90,
      imagen: imagenPrincipal,
    };

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // 🔥 ESTA LÍNEA ES LA QUE ACTUALIZA EL ICONO DEL CARRITO
    window.dispatchEvent(new Event("carrito-actualizado"));

    alert("Producto añadido al carrito");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-300 via-gray-100 to-white text-gray-900">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* BOTÓN VOLVER */}
        <a
          href="/"
          className="inline-block mb-4 sm:mb-6 text-green-700 hover:text-green-900 font-semibold text-sm sm:text-base"
        >
          ← Volver a la página principal
        </a>

        {/* TÍTULO */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center px-2">
          ESCANCIADOR DE SIDRA, automático a batería
        </h1>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* IMAGEN PRINCIPAL */}
          <div>
            <img
              src={imagenPrincipal}
              className="rounded-lg shadow w-full max-h-80 lg:max-h-[550px] object-contain bg-white"
              alt="Escanciador de sidra"
            />

            {/* MINIATURAS DESLIZABLES EN MÓVIL */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {imagenes.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  onClick={() => setImagenPrincipal(img)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer border-2 transition
                    ${imagenPrincipal === img ? "border-green-600" : "border-gray-300"}
                  `}
                />
              ))}
            </div>
          </div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="flex flex-col justify-between">

            <div>
              <p className="text-3xl sm:text-4xl font-semibold text-green-700 mb-4">
                79,90 €
              </p>

              <p className="mb-4 leading-relaxed text-sm sm:text-base">
                Disfruta de la sidra natural como se merece con este escanciador automático a batería,
                diseñado con un estilo <strong>minimalista, moderno y elegante</strong>.
                Su funcionamiento es muy sencillo: basta con pulsar el botón superior para servir la cantidad de bebida deseada.
              </p>

              <p className="mb-4 leading-relaxed text-sm sm:text-base">
                El pulsador incorpora un <strong>indicador luminoso</strong> que se activa cuando el cable de carga está conectado.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">🔋 Carga de la batería</h3>
              <ul className="list-disc ml-6 mb-4 text-sm sm:text-base">
                <li>Puerto <strong>USB‑C</strong> situado en la parte inferior del mástil</li>
                <li>Compatible con cualquier cargador de móvil (no incluido)</li>
                <li>Tiempo de carga recomendado: <strong>aprox. 3 horas</strong></li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">🍏 Ideal para</h3>
              <ul className="list-disc ml-6 text-sm sm:text-base">
                <li>Reuniones familiares</li>
                <li>Encuentros con amigos</li>
                <li>Celebraciones</li>
                <li>Locales de hostelería</li>
              </ul>
            </div>

            {/* BOTÓN AÑADIR AL CARRITO */}
            <button
              onClick={añadirAlCarrito}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-base sm:text-lg font-semibold shadow-md transition-transform hover:scale-105 mt-6"
            >
              Añadir al carrito
            </button>

            {/* VER CARRITO */}
            <a
              href="/carrito"
              className="inline-block mt-4 text-green-700 hover:text-green-900 font-semibold text-sm sm:text-base"
            >
              Ver carrito →
            </a>

          </div>

        </div>
      </div>
    </div>
  );
}