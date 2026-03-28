'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { emptyShippingDetails, type ShippingDetails } from '@/lib/shipping'
import { getOrderProducts } from '@/lib/order-data'

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

interface OrderProduct {
  nombre: string
  precio: number
  cantidad?: number
}

interface Order {
  id: string
  user_id: string
  productos?: OrderProduct[]
  product?: string
  quantity?: number
  status: string
  total: number
  created_at: string
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pago completado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<AccountUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
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

  const getOrderProductsText = (order: Order) => {
    const products = getOrderProducts(order.productos)

    if (products.length > 0) {
      return products.map((p) => `${p.nombre} x${p.cantidad || 1}`).join(', ')
    }

    return `${order.product || 'Sin producto'} x${order.quantity || 1}`
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi cuenta</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Volver al inicio
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Datos personales</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Nombre</dt>
                <dd className="text-gray-900 font-medium">{fullName || 'No disponible'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900 font-medium">{user.email || 'No disponible'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Teléfono</dt>
                <dd className="text-gray-900 font-medium">{user.phone || 'No disponible'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Alta</dt>
                <dd className="text-gray-900 font-medium">
                  {user.createdat ? new Date(user.createdat).toLocaleDateString('es-ES') : 'No disponible'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Datos de envío</h2>
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
                      Direccion (Linea 1)
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
                      Direccion (Linea 2)
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
              <div className="space-y-3 text-sm text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500">Nombre</p>
                    <p className="font-medium text-gray-900">{user.shipping.name || 'No disponible'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Apellidos</p>
                    <p className="font-medium text-gray-900">{user.shipping.lastname || 'No disponible'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Direccion (Linea 1)</p>
                  <p className="font-medium text-gray-900">{user.shipping.addressLine1 || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Direccion (Linea 2)</p>
                  <p className="font-medium text-gray-900">{user.shipping.addressLine2 || 'No disponible'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500">Localidad / Ciudad</p>
                    <p className="font-medium text-gray-900">{user.shipping.city || 'No disponible'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Provincia</p>
                    <p className="font-medium text-gray-900">{user.shipping.province || 'No disponible'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500">Codigo postal</p>
                    <p className="font-medium text-gray-900">{user.shipping.postalCode || 'No disponible'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pais</p>
                    <p className="font-medium text-gray-900">{user.shipping.country || 'No disponible'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Telefono de contacto</p>
                  <p className="font-medium text-gray-900">{user.shipping.phone || 'No disponible'}</p>
                </div>
                {saveMessage && (
                  <p className="text-sm text-green-700">{saveMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Mis pedidos</h2>
            <span className="text-sm text-gray-500">{orders.length} pedidos</span>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-600 mb-4">Todavía no tienes pedidos</p>
              <Link href="/producto" className="text-blue-600 hover:text-blue-700 font-medium">
                Ir a productos
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Pedido</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Productos</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Fecha</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-gray-700">{getOrderProductsText(order)}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(order.created_at).toLocaleDateString('es-ES')}
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
          )}
        </div>
      </div>
    </div>
  )
}
