/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";   // ← IMPORTANTE

export default function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();                  // ← IMPORTANTE
  const [shippingFee, setShippingFee] = useState(0)

  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("carrito")) || []
      setCarrito(Array.isArray(storedCart) ? storedCart : [])
    } catch {
      setCarrito([])
    }

    setIsHydrated(true)

    const loadShippingFee = async () => {
      try {
        const response = await fetch('/api/settings/shipping-fee')
        const data = await response.json()

        if (response.ok && Number.isFinite(Number(data?.shippingFee))) {
          setShippingFee(Number(data.shippingFee))
        }
      } catch (err) {
        console.error('No se pudo cargar gastos de envío:', err)
      }
    }

    loadShippingFee()
  }, [])

  if (!isHydrated) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Carrito</h1>
        <p className="text-gray-600">Cargando carrito...</p>
      </div>
    )
  }

  const eliminarProducto = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));

    window.dispatchEvent(new Event("carrito-actualizado"));
  };

  const total = carrito.reduce((acc, p) => acc + p.precio, 0);
  const finalTotal = total + shippingFee

  const finalizarCompra = () => {
    router.push("/checkout");   // ← AQUÍ ES DONDE OCURRE LA MAGIA
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

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
                  alt={producto.nombre || "Producto en carrito"}
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

          <div className="mt-6 flex flex-col items-end gap-4">
            <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between text-base text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">{total.toFixed(2)} €</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base text-gray-600">
                <span>Gastos de envío</span>
                <span className="font-medium text-gray-800">{shippingFee.toFixed(2)} €</span>
              </div>
              <div className="my-3 border-t border-gray-200" />
              <div className="flex items-center justify-between text-2xl font-bold text-gray-900">
                <span>Total</span>
                <span>{finalTotal.toFixed(2)} €</span>
              </div>
            </div>

            <button
              onClick={finalizarCompra}   // ← AHORA SÍ FUNCIONA
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-md"
            >
              Finalizar compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}