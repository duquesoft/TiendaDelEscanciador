'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  COD_SURCHARGE,
  PAYMENT_METHOD_DESCRIPTIONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
} from '@/lib/payment-methods'
import { emptyShippingDetails } from '@/lib/shipping'



export default function Checkout() {
  useEffect(() => {
    document.body.classList.add("no-leaves-bg");
    return () => {
      document.body.classList.remove("no-leaves-bg");
    };
  }, []);
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [shipping, setShipping] = useState(emptyShippingDetails())
  const [shippingLoaded, setShippingLoaded] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [shippingFee, setShippingFee] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState(null)

  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem("carrito")) || []
    setCarrito(datos)

    const loadShipping = async () => {
      try {
        const res = await fetch('/api/users/me')

        if (res.status === 401) {
          setIsAuthenticated(false)
          return
        }

        if (!res.ok) {
          throw new Error('Error cargando envío')
        }

        const data = await res.json()
        setIsAuthenticated(true)
        setShipping(data.user?.shipping || emptyShippingDetails())
      } catch (err) {
        console.error(err)
      } finally {
        setShippingLoaded(true)
      }
    }

    loadShipping()

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
  }, [router])

  const subtotal = carrito.reduce((acc, p) => acc + p.precio, 0)
  const codSurcharge = paymentMethod === 'cod' ? COD_SURCHARGE : 0
  const total = subtotal + shippingFee + codSurcharge
  const paymentButtonLabel = loading
    ? 'Procesando...'
    : isAuthenticated === false
      ? 'Inicia sesión para finalizar compra'
    : !paymentMethod
      ? 'Selecciona un método de pago'
      : paymentMethod === 'paypal'
      ? 'Confirmar pedido con PayPal'
      : paymentMethod === 'cod'
        ? 'Confirmar pedido contra reembolso'
        : 'Confirmar pedido con tarjeta'

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

    if (!paymentMethod) {
      setError('Selecciona un método de pago para continuar')
      setLoading(false)
      return
    }

    if (isAuthenticated === false) {
      setError('Para finalizar la compra tienes que iniciar sesión')
      setLoading(false)
      return
    }

    if (!hasShippingMinimum) {
      setError('Completa tus datos de envío en Mi cuenta antes de finalizar la compra')
      setLoading(false)
      return
    }

    try {
      const endpoint = paymentMethod === 'card'
        ? '/api/payments/stripe/checkout-session'
        : paymentMethod === 'paypal'
          ? '/api/payments/stripe/checkout-session'
          : '/api/orders'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: carrito,
          total: subtotal,
          shipping,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al procesar el pedido')
        return
      }

      if (typeof data.url === 'string' && data.url) {
        window.location.href = data.url
        return
      }

      // Vaciar carrito
      localStorage.removeItem("carrito")
      window.dispatchEvent(new Event("carrito-actualizado"))

      // Redirigir a confirmación, incluir order_id si la API devolvió la orden
      const orderId = data?.order?.id
      if (orderId) {
        router.push(`/confirmacion?order_id=${orderId}&payment=${paymentMethod}`)
      } else {
        router.push(`/confirmacion?payment=${paymentMethod}`)
      }

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

          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Datos de envío</h3>
              {isAuthenticated === true && (
                <Link href="/mi-cuenta" className="text-sm text-blue-600 hover:text-blue-700">
                  Editar en Mi cuenta
                </Link>
              )}
            </div>

            {isAuthenticated === false && (
              <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Para finalizar la compra tienes que iniciar sesión.
                <Link href="/login?redirect=/checkout" className="ml-1 font-semibold underline underline-offset-2 hover:text-amber-900">
                  Iniciar sesión
                </Link>
                {' '}o
                <Link href="/signup?redirect=/checkout" className="ml-1 font-semibold underline underline-offset-2 hover:text-amber-900">
                  Registrarse
                </Link>
              </div>
            )}

            {!shippingLoaded ? (
              <p className="text-sm text-gray-500">Cargando datos de envío...</p>
            ) : hasShippingMinimum ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">{shipping.name} {shipping.lastname}</p>
                <p>{shipping.addressLine1}{shipping.addressLine2 ? `, ${shipping.addressLine2}` : ''}</p>
                <p>{shipping.city}, {shipping.province}</p>
                <p>{shipping.postalCode}, {shipping.country}</p>
                <p>N.I.F.: {shipping.nif || 'No disponible'}</p>
                <p>Tel.: {shipping.phone || 'No disponible'}</p>
              </div>
            ) : (
              <p className="text-sm text-amber-700">
                Te faltan datos de envío. Complétalos en Mi cuenta antes de continuar.
              </p>
            )}
          </div>

          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-gray-900">Metodo de pago</h3>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona como quieres pagar este pedido.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method

                return (
                  <label
                    key={method}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={isSelected}
                      onChange={() => setPaymentMethod(method)}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 flex min-h-8 items-center gap-2">
                          {method === 'card' ? (
                            <>
                              <Image
                                src="/img/payments/visa-logo.svg"
                                alt="Visa"
                                width={88}
                                height={20}
                                className="h-4 w-auto"
                              />
                              <Image
                                src="/img/payments/mastercard-logo.webp"
                                alt="Mastercard"
                                width={148}
                                height={32}
                                className="h-7 w-auto"
                              />
                            </>
                          ) : method === 'paypal' ? (
                            <Image
                              src="/img/payments/paypal-logo.svg"
                              alt="PayPal"
                              width={112}
                              height={24}
                              className="h-5 w-auto"
                            />
                          ) : (
                            <span className="text-[10px] font-black tracking-[0.02em] text-emerald-700">CONTRA REEMBOLSO</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {PAYMENT_METHOD_LABELS[method]}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {PAYMENT_METHOD_DESCRIPTIONS[method]}
                          {method === 'cod' && (
                            <span className="mt-1 block font-semibold text-amber-700">
                              +3,90 EUR por contra reembolso.
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`mt-1 inline-flex h-4 w-4 shrink-0 rounded-full border ${
                          isSelected ? 'border-green-600 bg-green-600' : 'border-gray-400 bg-white'
                        }`}
                      />
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

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
            <div className="flex justify-between text-base text-gray-700 mb-2">
              <span>Subtotal:</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base text-gray-700 mb-2">
              <span>Gastos de envío:</span>
              <span>€{shippingFee.toFixed(2)}</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-base text-gray-700 mb-2">
                <span>Contra reembolso:</span>
                <span>€{COD_SURCHARGE.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
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
              disabled={loading || !shippingLoaded || isAuthenticated === false || !hasShippingMinimum || !paymentMethod}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow transition"
            >
              {paymentButtonLabel}
            </button>

            <Link
              href="/"
              className="px-6 py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition"
            >
              Cancelar
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}