'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getOrdersByUser } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getOrderProducts } from '@/lib/order-data'
import type { ShippingDetails } from '@/lib/shipping'

interface Order {
  id: string
  user_id: string
  productos?: Array<{
    nombre: string
    precio: number
    cantidad?: number
  }>
  product?: string
  quantity?: number
  status: string
  total: number
  created_at: string
}

interface UserData {
  id: string
  email: string
  name?: string
  lastname?: string
  phone?: string
  address?: string
  shipping?: ShippingDetails
  createdat?: string
  role?: string
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

export default function UserDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [user, setUser] = useState<UserData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, ordersData] = await Promise.all([
          fetch(`/api/admin/users/get?id=${id}`),
          getOrdersByUser(id),
        ])

        if (!userRes.ok) throw new Error('Error cargando usuario')
        const userData = await userRes.json()
        setUser(userData)
        setOrders(ordersData)
      } catch (err) {
        console.error(err)
        setError('Error cargando los datos del usuario')
      } finally {
        setLoading(false)
      }
    }

    if (id) loadData()
  }, [id])

  const getProductSummary = (order: Order) => {
    const products = getOrderProducts(order.productos)

    if (products.length > 0) {
      return products.map((p) => p.nombre).join(', ')
    }
    return order.product || 'Sin producto'
  }

  const getQuantity = (order: Order) => {
    const products = getOrderProducts(order.productos)

    if (products.length > 0) {
      return products.reduce((sum, p) => sum + (p.cantidad || 1), 0)
    }
    return order.quantity || 1
  }

  const formatShippingLine = (parts: Array<string | undefined>) => {
    const values = parts
      .map((part) => (part || '').trim())
      .filter(Boolean)

    return values.length > 0 ? values.join(', ') : 'No disponible'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-red-600">{error || 'Usuario no encontrado'}</p>
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
          Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalle del Usuario</h1>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Volver al dashboard
            </Link>
            <Link
              href={`/admin/usuarios/${id}/editar`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Editar usuario
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info del usuario */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Email</dt>
                <dd className="text-gray-900 mt-0.5">{user.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Nombre</dt>
                <dd className="text-gray-900 mt-0.5">
                  {user.name || user.lastname
                    ? `${user.name ?? ''} ${user.lastname ?? ''}`.trim()
                    : 'Sin nombre'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Teléfono</dt>
                <dd className="text-gray-900 mt-0.5">{user.phone || 'No disponible'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Datos de envío</dt>
                {user.shipping ? (
                  <dd className="text-gray-900 mt-0.5 space-y-1">
                    <div>{formatShippingLine([user.shipping.name, user.shipping.lastname])}</div>
                    <div>{formatShippingLine([user.shipping.addressLine1, user.shipping.addressLine2])}</div>
                    <div>{formatShippingLine([user.shipping.city, user.shipping.province])}</div>
                    <div>{formatShippingLine([user.shipping.postalCode, user.shipping.country])}</div>
                    <div>{user.shipping.phone?.trim() || 'No disponible'}</div>
                  </dd>
                ) : (
                  <dd className="text-gray-900 mt-0.5">{user.address || 'No disponible'}</dd>
                )}
              </div>
              <div>
                <dt className="font-medium text-gray-500">Rol</dt>
                <dd className="mt-0.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role || 'user'}
                  </span>
                </dd>
              </div>
              {user.createdat && (
                <div>
                  <dt className="font-medium text-gray-500">Registro</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {new Date(user.createdat).toLocaleDateString('es-ES')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Pedidos */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pedidos ({orders.length})
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Este usuario no tiene pedidos
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Producto</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-700">Cant.</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Fecha</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{getProductSummary(order)}</td>
                          <td className="px-4 py-3 text-center text-gray-700">{getQuantity(order)}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            €{order.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                statusColor[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {statusLabel[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {new Date(order.created_at).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/pedidos/${order.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                            >
                              Detalles
                            </Link>
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
      </div>
    </div>
  )
}
