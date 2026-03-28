'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { emptyShippingDetails } from '@/lib/shipping'

export default function Checkout() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [shipping, setShipping] = useState(emptyShippingDetails())
  const [shippingLoaded, setShippingLoaded] = useState(false)

  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem("carrito")) || []
    setCarrito(datos)

    const loadShipping = async () => {
      try {
        const res = await fetch('/api/users/me')

        if (res.status === 401) {
          router.push('/login')
          return
        }

        if (!res.ok) {
          throw new Error('Error cargando envío')
        }

        const data = await res.json()
        setShipping(data.user?.shipping || emptyShippingDetails())
      } catch (err) {
        console.error(err)
      } finally {
        setShippingLoaded(true)
      }
    }

    loadShipping()
  }, [])

  const total = carrito.reduce((acc, p) => acc + p.precio, 0)

  const hasShippingMinimum = Boolean(
    shipping.name &&
    shipping.lastname &&
    shipping.addressLine1 &&
    shipping.postalCode &&
    shipping.city &&
    shipping.province &&
    shipping.country &&
    shipping.phone
  )

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    if (!hasShippingMinimum) {
      setError('Completa tus datos de envío en Mi cuenta antes de finalizar la compra')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: carrito,
          total: total,
          shipping,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al procesar el pedido')
        return
      }

      // Vaciar carrito
      localStorage.removeItem("carrito")
      window.dispatchEvent(new Event("carrito-actualizado"))

      // Redirigir a confirmación
      router.push('/confirmacion')

    } catch (err) {
      setError('Error al procesar el pedido')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Finalizar compra</h2>

      {carrito.length === 0 ? (
        <p className="text-gray-600">Tu carrito está vacío.</p>
      ) : (
        <div className="bg-white shadow p-6 rounded-lg">

          {/* LISTA DE PRODUCTOS */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Productos:</h3>

            {carrito.map((p, i) => (
              <div key={i} className="flex justify-between py-2 border-b">
                <span>{p.nombre}</span>
                <span>{p.precio.toFixed(2)} €</span>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mb-6 border-t border-b border-gray-300 py-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Datos de envío</h3>
              <Link href="/mi-cuenta" className="text-sm text-blue-600 hover:text-blue-700">
                Editar en Mi cuenta
              </Link>
            </div>

            {!shippingLoaded ? (
              <p className="text-sm text-gray-500">Cargando datos de envío...</p>
            ) : hasShippingMinimum ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">{shipping.name} {shipping.lastname}</p>
                <p>{shipping.addressLine1}</p>
                {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
                <p>{shipping.postalCode} {shipping.city}</p>
                <p>{shipping.province}</p>
                <p>{shipping.country}</p>
                <p>{shipping.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-amber-700">
                Te faltan datos de envío. Complétalos en Mi cuenta antes de continuar.
              </p>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* BOTONES */}
          <div className="flex gap-3">
            <button
              onClick={handleCheckout}
              disabled={loading || !shippingLoaded || !hasShippingMinimum}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow transition"
            >
              {loading ? 'Procesando...' : 'Procesar pago'}
            </button>

            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}