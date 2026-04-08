/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";   // ← IMPORTANTE

const CART_SQUARE_IMAGE = "/img/escanciador_fondo_blanco_1_1_cart.webp";

function getStoredCartSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  try {
    return localStorage.getItem("carrito") || "[]";
  } catch {
    return "[]";
  }
}

function subscribeToCart(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("carrito-actualizado", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("carrito-actualizado", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export default function Carrito() {
  const cartSnapshot = useSyncExternalStore(subscribeToCart, getStoredCartSnapshot, () => "[]");
  const carrito = useMemo(() => {
    try {
      const parsedCart = JSON.parse(cartSnapshot);
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
      return [];
    }
  }, [cartSnapshot]);
  const router = useRouter();                  // ← IMPORTANTE
  const [shippingFee, setShippingFee] = useState(0)

  useEffect(() => {
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

  const eliminarProducto = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));

    window.dispatchEvent(new Event("carrito-actualizado"));
  };

  const total = carrito.reduce((acc, p) => acc + p.precio, 0);
  const finalTotal = total + shippingFee

  const finalizarCompra = () => {
    router.push("/checkout");   // ← AQUÍ ES DONDE OCURRE LA MAGIA
  };

  const getCartProductImage = (producto) => {
    if (typeof producto?.imagenCarrito === "string" && producto.imagenCarrito.trim()) {
      return producto.imagenCarrito;
    }

    return CART_SQUARE_IMAGE;
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
                  src={getCartProductImage(producto)}
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