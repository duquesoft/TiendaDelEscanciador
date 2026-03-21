"use client";
import { useEffect, useState } from "react";

export default function Carrito() {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(datos);
  }, []);

  const eliminarProducto = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const total = carrito.reduce((acc, p) => acc + p.precio, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* VOLVER */}
      <a
        href="/"
        className="inline-block mb-6 text-green-700 hover:text-green-900 font-semibold"
      >
        ← Volver a la página principal
      </a>

      <h1 className="text-3xl font-bold mb-6">Carrito</h1>

      {carrito.length === 0 ? (
        <p className="text-gray-600">Tu carrito está vacío.</p>
      ) : (
        <div className="space-y-6">
          {carrito.map((producto, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={producto.imagen}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                  <p className="text-green-700 font-bold">{producto.precio} €</p>
                </div>
              </div>

              <button
                onClick={() => eliminarProducto(index)}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                Eliminar
              </button>
            </div>
          ))}

          <div className="text-right mt-6">
            <p className="text-2xl font-bold">Total: {total.toFixed(2)} €</p>
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md">
              Finalizar compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}