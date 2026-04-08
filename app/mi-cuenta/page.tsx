'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPaymentMethodLabel } from '@/lib/payment-methods'
import { emptyShippingDetails, type ShippingDetails } from '@/lib/shipping'
import { getOrderPaymentMethod, getOrderProducts } from '@/lib/order-data'
import { formatOrderNumber } from '@/lib/order-number'

interface AccountUser {
  id: string
  email: string | null
  name: string | null
  lastname: string | null
  phone: string | null
  address: string | null
  shipping: ShippingDetails
  createdat: string | null
  updatedat: string | null
}

interface Order {
  id: string
  user_id: string
  productos?: unknown[]
  product?: string
  quantity?: number
  status: string
  total: number
  created_at: string
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pago completado',
  shipped: 'Enviado',
  completed: 'Enviado',
  cancelled: 'Cancelado',
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusAccent: Record<string, string> = {
  pending: 'bg-yellow-400',
  paid: 'bg-blue-500',
  shipped: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<AccountUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [expandedMobileOrders, setExpandedMobileOrders] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState<ShippingDetails>(emptyShippingDetails())
  const [isEditingShipping, setIsEditingShipping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, ordersRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/orders'),
        ])

        if (userRes.status === 401 || ordersRes.status === 401) {
          router.push('/login')
          return
        }

        if (!userRes.ok || !ordersRes.ok) {
          throw new Error('Error cargando datos')
        }

        const userJson = await userRes.json()
        const ordersJson = await ordersRes.json()

        setUser(userJson.user)
        setForm(userJson.user?.shipping || emptyShippingDetails())
        setOrders(Array.isArray(ordersJson.orders) ? ordersJson.orders : [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar tus datos')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  useEffect(() => {
    setExpandedMobileOrders((prev) => {
      const next: Record<string, boolean> = {}

      orders.forEach((order, index) => {
        next[order.id] = prev[order.id] ?? index < 2
      })

      return next
    })
  }, [orders])

  const getOrderProductsText = (order: Order) => {
    const products = getOrderProducts(order.productos)

    if (products.length > 0) {
      const unique = [...new Set(products.map((p) => p.nombre))]
      return unique.join(', ')
    }

    return `${order.product || 'Sin producto'}`
  }

  const getOrderItemsCount = (order: Order) => {
    const products = getOrderProducts(order.productos)

    if (products.length > 0) {
      return products.reduce((sum, p) => sum + (p.cantidad || 1), 0)
    }

    return order.quantity || 1
  }

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveMessage(null)

    if (!form.name.trim() || !form.lastname.trim()) {
      setSaveMessage('Nombre y apellidos del envío son obligatorios')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping: form }),
      })

      const result = await res.json()

      if (!res.ok) {
        setSaveMessage(result.error || 'No se pudieron guardar los datos')
        return
      }

      setUser(result.user)
      setForm(result.user?.shipping || emptyShippingDetails())
      setIsEditingShipping(false)
      setSaveMessage('Datos de envío actualizados correctamente')
    } catch (err) {
      console.error(err)
      setSaveMessage('No se pudieron guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Cargando tu cuenta...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-4">
        <p className="text-red-600 font-medium">{error || 'No se encontraron datos de usuario'}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-700">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const fullName = `${user.name || ''} ${user.lastname || ''}`.trim()
  const joinShippingParts = (parts: Array<string | null | undefined>) => {
    const cleanedParts = parts
      .map((part) => (part || '').trim())
      .filter(Boolean)

    return cleanedParts.length > 0 ? cleanedParts.join(', ') : 'No disponible'
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi cuenta</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Volver al inicio
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white via-sky-100/50 to-white shadow-sm p-4 md:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.7"/>
                  <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              </span>
              <h2 className="text-base font-bold text-gray-900">Datos personales</h2>
            </div>

            <dl className="overflow-hidden rounded-xl border border-sky-200 bg-white text-sm">
              <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-sky-200">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Nombre</dt>
                <dd className="text-right text-gray-900 font-semibold">{fullName || 'No disponible'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-sky-200">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Email</dt>
                <dd className="text-right text-gray-900 font-semibold break-all">{user.email || 'No disponible'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-sky-200">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Teléfono</dt>
                <dd className="text-right text-gray-900 font-semibold">{user.phone || 'No disponible'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Alta</dt>
                <dd className="text-right text-gray-900 font-semibold">
                  {user.createdat ? new Date(user.createdat).toLocaleDateString('es-ES') : 'No disponible'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-100/45 to-white shadow-sm p-4 md:p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5v-9Z" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M7 10.5h10M7 13.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </span>
                <h2 className="text-base font-bold text-gray-900">Datos de envío</h2>
              </div>
              {!isEditingShipping && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(user.shipping || emptyShippingDetails())
                    setSaveMessage(null)
                    setIsEditingShipping(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Editar
                </button>
              )}
            </div>

            {isEditingShipping ? (
              <form onSubmit={handleSaveShipping} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="shippingName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      id="shippingName"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label htmlFor="shippingLastname" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos
                    </label>
                    <input
                      id="shippingLastname"
                      type="text"
                      required
                      value={form.lastname}
                      onChange={(e) => setForm((prev) => ({ ...prev, lastname: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección línea 1 - Tipo de vía (calle, avenida, etc)
                    </label>
                    <input
                      id="addressLine1"
                      type="text"
                      value={form.addressLine1}
                      onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={150}
                    />
                  </div>
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección línea 2 - Piso, puerta, escalera, bloque o datos adicionales
                    </label>
                    <input
                      id="addressLine2"
                      type="text"
                      value={form.addressLine2}
                      onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={150}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Localidad / Ciudad
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={120}
                    />
                  </div>
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia
                    </label>
                    <input
                      id="province"
                      type="text"
                      value={form.province}
                      onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={120}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Codigo postal
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Pais
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={120}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nif" className="block text-sm font-medium text-gray-700 mb-1">
                      N.I.F.
                    </label>
                    <input
                      id="nif"
                      type="text"
                      value={form.nif}
                      onChange={(e) => setForm((prev) => ({ ...prev, nif: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefono de contacto
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Guardando...' : 'Guardar datos'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(user.shipping || emptyShippingDetails())
                      setSaveMessage(null)
                      setIsEditingShipping(false)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  {saveMessage && (
                    <p
                      className={`text-sm ${
                        saveMessage.includes('correctamente') ? 'text-green-700' : 'text-red-600'
                      }`}
                    >
                      {saveMessage}
                    </p>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="md:hidden overflow-hidden rounded-xl border border-emerald-200 bg-white text-sm">
                  <div className="px-3 py-2 border-b border-emerald-200">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Destinatario</p>
                    <p className="font-semibold text-gray-900">{joinShippingParts([user.shipping.name, user.shipping.lastname])}</p>
                  </div>
                  <div className="px-3 py-2 border-b border-emerald-200">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Dirección</p>
                    <p className="font-semibold text-gray-900">{joinShippingParts([user.shipping.addressLine1, user.shipping.addressLine2])}</p>
                  </div>
                  <div className="px-3 py-2 border-b border-emerald-200">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Ciudad y provincia</p>
                    <p className="font-semibold text-gray-900">{joinShippingParts([user.shipping.city, user.shipping.province])}</p>
                  </div>
                  <div className="px-3 py-2 border-b border-emerald-200">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Código postal y país</p>
                    <p className="font-semibold text-gray-900">{joinShippingParts([user.shipping.postalCode, user.shipping.country])}</p>
                  </div>
                  <div className="px-3 py-2 border-b border-emerald-200">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">N.I.F.</p>
                    <p className="font-semibold text-gray-900">{user.shipping.nif?.trim() || 'No disponible'}</p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Teléfono</p>
                    <p className="font-semibold text-gray-900">{user.shipping.phone?.trim() || 'No disponible'}</p>
                  </div>
                </div>

                <div className="hidden md:grid md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Destinatario</p>
                    <p className="mt-1 font-semibold text-gray-900">{joinShippingParts([user.shipping.name, user.shipping.lastname])}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600">Teléfono</p>
                    <p className="mt-1 font-semibold text-gray-900">{user.shipping.phone?.trim() || 'No disponible'}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600">N.I.F.</p>
                    <p className="mt-1 font-semibold text-gray-900">{user.shipping.nif?.trim() || 'No disponible'}</p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Dirección</p>
                    <p className="mt-1 font-semibold text-gray-900">{joinShippingParts([user.shipping.addressLine1, user.shipping.addressLine2])}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600">Ciudad y provincia</p>
                    <p className="mt-1 font-semibold text-gray-900">{joinShippingParts([user.shipping.city, user.shipping.province])}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600">Código postal y país</p>
                    <p className="mt-1 font-semibold text-gray-900">{joinShippingParts([user.shipping.postalCode, user.shipping.country])}</p>
                  </div>
                </div>

                {saveMessage && (
                  <p className="text-sm text-green-700">{saveMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Mis pedidos</h2>
            <span className="text-sm text-gray-600">{orders.length} pedidos</span>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-600 mb-4">Todavía no tienes pedidos</p>
              <Link href="/producto" className="text-blue-600 hover:text-blue-700 font-medium">
                Ir a productos
              </Link>
            </div>
          ) : (
            <>
              <div className="md:hidden bg-gray-100 p-3 space-y-3">
                {orders.map((order, index) => {
                  const isExpanded = expandedMobileOrders[order.id] ?? index < 2

                  return (
                  <article key={order.id} className="relative overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
                    <div className={`h-1 w-full ${statusAccent[order.status] || 'bg-gray-300'}`} />
                    <div className="p-4">
                      {isExpanded ? (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {new Date(order.created_at).toLocaleDateString('es-ES')}
                              </p>
                              <p className="mt-1 text-sm font-semibold tracking-[0.04em] text-gray-600">{formatOrderNumber(order.id)}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  statusColor[order.status] || 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {statusLabel[order.status] || order.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => setExpandedMobileOrders((prev) => ({ ...prev, [order.id]: false }))}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                              >
                                Contraer
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-base leading-6 font-medium text-gray-800">{getOrderProductsText(order)}</p>
                            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-semibold leading-5 text-gray-700">
                              x {getOrderItemsCount(order)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path d="M3 7.5h18v9A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5v-9Z" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M3 10.5h18" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M7 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <p>
                              <span className="text-gray-500">Forma de pago: </span>
                              <span className="font-medium text-gray-800">{getPaymentMethodLabel(getOrderPaymentMethod(order.productos))}</span>
                            </p>
                          </div>

                          <div className="mt-3 border-t border-gray-100 pt-3 flex items-end justify-end">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Total</p>
                              <p className="text-base font-bold text-gray-900">€{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {new Date(order.created_at).toLocaleDateString('es-ES')}
                              </p>
                              <p className="text-sm font-semibold tracking-[0.04em] leading-tight text-gray-600">{formatOrderNumber(order.id)}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                statusColor[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {statusLabel[order.status] || order.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2">
                            <p className="text-sm text-gray-600">
                              Total <span className="ml-1 text-base font-bold text-gray-900">€{order.total.toFixed(2)}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => setExpandedMobileOrders((prev) => ({ ...prev, [order.id]: true }))}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              Desplegar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                  )
                })}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Pedido</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Productos</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Fecha</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Pago</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-base font-semibold text-gray-900">{formatOrderNumber(order.id)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        <p>{getOrderProductsText(order)}</p>
                        <p className="mt-1 text-xs font-medium text-gray-500">Cantidad: {getOrderItemsCount(order)}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {getPaymentMethodLabel(getOrderPaymentMethod(order.productos))}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColor[order.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabel[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-semibold">
                        €{order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
