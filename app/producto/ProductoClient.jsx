/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import ProductDescription from "@/app/components/ProductDescription";
import PaymentMethods from "@/app/components/PaymentMethods";

export default function ProductoClient({ initialProducts }) {
  useEffect(() => {
    document.body.classList.remove("no-leaves-bg");
  }, []);
  const products = useMemo(() => (Array.isArray(initialProducts) ? initialProducts : []), [initialProducts]);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [selectedImage, setSelectedImage] = useState(products[0]?.imageUrl || "");

  const productoSeleccionado = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  const imagenes = useMemo(() => {
    if (!productoSeleccionado) {
      return [];
    }

    const gallery = Array.isArray(productoSeleccionado.gallery) ? productoSeleccionado.gallery : [];
    if (gallery.length > 0) {
      return gallery;
    }

    return [productoSeleccionado.imageUrl];
  }, [productoSeleccionado]);

  const imagenPrincipal = useMemo(() => {
    if (!productoSeleccionado) {
      return "";
    }

    if (selectedImage && imagenes.includes(selectedImage)) {
      return selectedImage;
    }

    return productoSeleccionado.imageUrl || imagenes[0] || "";
  }, [imagenes, productoSeleccionado, selectedImage]);

  const añadirAlCarrito = () => {
    if (!productoSeleccionado) {
      return;
    }

    const producto = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.name,
      precio: Number(productoSeleccionado.price) || 0,
      imagen: imagenPrincipal,
    };

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    window.dispatchEvent(new Event("carrito-actualizado"));
    alert("Producto añadido al carrito");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-gray-900 py-8 px-3 sm:px-6">
      <div className="w-full max-w-6xl mx-auto bg-white/40 bg-gradient-to-b from-white/60 via-gray-50/40 to-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-center px-2">Escanciador de Sidra Automático Recargable</h1>
        <p className="text-sm sm:text-base text-gray-700 text-center max-w-3xl mx-auto mb-8">
          El escanciador de sidra automático que combina diseño, comodidad y precisión.
          Pulsa el botón y sirve sidra de forma limpia, uniforme y sin esfuerzo.
        </p>

        {products.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProductId(product.id)}
                className={`text-left rounded-lg border p-3 bg-white shadow-sm hover:shadow transition ${
                  selectedProductId === product.id ? "border-green-600" : "border-gray-200"
                }`}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
                <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                <p className="text-green-700 font-bold">{(Number(product.price) || 0).toFixed(2)} €</p>
              </button>
            ))}
          </div>
        )}

        {productoSeleccionado ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-[0_8px_40px_rgba(15,23,42,0.18)]">
                <div className="relative h-[320px] overflow-hidden rounded-lg bg-slate-100 lg:h-[550px]">
                  <img
                    src={imagenPrincipal}
                    className="h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(15,23,42,0.16)] transition-opacity duration-200 ease-out opacity-100"
                    alt={productoSeleccionado.name}
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                {imagenes.map((img, index) => (
                  <img
                    key={`${productoSeleccionado.id}-${index}`}
                    src={img}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer border-2 transition
                      ${imagenPrincipal === img ? "border-green-600" : "border-gray-300"}
                    `}
                    alt={`Miniatura ${index + 1} de ${productoSeleccionado.name}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">{productoSeleccionado.name}</h2>

                <p className="text-3xl sm:text-4xl font-black sm:font-extrabold lg:font-bold text-green-700 mb-4">
                  {(Number(productoSeleccionado.price) || 0).toFixed(2)} €
                </p>

                <ProductDescription
                  text={productoSeleccionado.description}
                  fallbackText="Producto sin descripción. Puedes editar este texto desde el panel de administrador."
                />

                <div className="mt-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Beneficios principales</h3>
                  <ul className="list-disc ml-6 text-sm sm:text-base text-gray-900 leading-relaxed space-y-1">
                    <li>Servicio automático con un solo botón.</li>
                    <li>Batería recargable para uso diario.</li>
                    <li>Diseño moderno y acabado premium.</li>
                    <li>Ideal para reuniones, celebraciones y uso profesional.</li>
                    <li>Fácil limpieza y manejo intuitivo.</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={añadirAlCarrito}
                className="bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-500 hover:to-green-500 text-slate-950 py-4 px-10 rounded-xl text-xl font-semibold shadow-[0_12px_28px_rgba(34,197,94,0.20)] transition-transform hover:scale-105 mt-6"
              >
                Añadir al carrito
              </button>

              <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-gray-500 bg-white/70 border border-gray-100 rounded-xl px-4 py-2.5">
                <span className="flex items-center gap-1">🔒 Pago 100% seguro</span>
                <span className="flex items-center gap-1">🚚 Envío 24/72h</span>
                <span className="flex items-center gap-1">💬 Atención personalizada</span>
              </div>

              <PaymentMethods className="mt-3" />

              <Link
                href="/carrito"
                className="inline-block mt-4 text-green-700 hover:text-green-900 font-semibold text-sm sm:text-base"
              >
                Ver carrito →
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
            No hay productos disponibles ahora mismo.
          </div>
        )}

        <section className="mt-12 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
          <div className="space-y-4 text-sm sm:text-base text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900">¿Cómo funciona el escanciador de sidra automático?</h3>
              <p>
                Funciona con un botón de activación que impulsa la sidra de forma constante para facilitar
                un servicio cómodo, limpio y uniforme.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">¿Cuánto tarda en cargar la batería?</h3>
              <p>La carga completa recomendada es de aproximadamente 2 horas con un cargador compatible.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">¿Sirve para uso diario?</h3>
              <p>Sí, está diseñado para uso frecuente tanto en casa como en reuniones y hostelería.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">¿Qué incluye la compra?</h3>
              <p>
                Incluye el escanciador y sus componentes principales. El contenido exacto puede variar según
                la configuración actual del producto.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">¿Hacéis envíos rápidos?</h3>
              <p>Sí, trabajamos para que recibas tu pedido lo antes posible con seguimiento del envío.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
