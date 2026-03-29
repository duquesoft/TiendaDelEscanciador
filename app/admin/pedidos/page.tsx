'use client'

import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getOrderProducts } from '@/lib/order-data'

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const getOrderProductSummary = (order: Order) => {
    const products = getOrderProducts(order.productos)

    if (products.length > 0) {
      const unique = [...new Set(products.map((p) => p.nombre))]
      return unique.join(', ')
    }

    return order.product || 'Sin producto'
  }

  const getOrderQuantity = (order: Order) => {
    const products = getOrderProducts(order.productos)

    if (products.length > 0) {
      return products.reduce((sum, p) => sum + (p.cantidad || 1), 0)
    }

    return order.quantity || 1
  }

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getAllOrders()
        setOrders(data)
      } catch (err) {
        setError('Error cargando pedidos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const success = await updateOrderStatus(orderId, newStatus)
      if (success) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      }
    } catch (err) {
      console.error('Error updating order status:', err)
    }
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
            Volver al dashboard
          </Link>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            {['all', 'pending', 'paid', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {status === 'all'
                  ? 'Todos'
                  : status === 'pending'
                    ? 'Pendientes'
                    : status === 'paid'
                      ? 'Pago completado'
                      : status === 'completed'
                        ? 'Completados'
                        : 'Cancelados'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de pedidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cantidad</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{order.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getOrderProductSummary(order)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getOrderQuantity(order)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">€{order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'paid'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="paid">Pago completado</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Detalles
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No hay pedidos con ese estado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
