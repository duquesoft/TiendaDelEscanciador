'use client'

import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getOrderPaymentMethod, getOrderProducts } from '@/lib/order-data'
import { getPaymentMethodLabel } from '@/lib/payment-methods'
import { formatOrderNumber } from '@/lib/order-number'

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
      let shipmentPayload: {
        carrier: string
        trackingNumber: string
        trackingUrl: string
      } | undefined

      if (newStatus === 'shipped') {
        const carrier = window.prompt('Agencia de transporte (ej. Correos Express):', '')?.trim() || ''
        if (!carrier) return

        const trackingNumber = window.prompt('Numero de seguimiento:', '')?.trim() || ''
        if (!trackingNumber) return

        const trackingUrl = window.prompt('Enlace de seguimiento (https://...):', '')?.trim() || ''
        if (!trackingUrl) return

        shipmentPayload = { carrier, trackingNumber, trackingUrl }
      }

      const success = await updateOrderStatus(orderId, newStatus, shipmentPayload)
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
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700 text-sm md:text-base">
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
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'paid', 'shipped', 'cancelled'].map((status) => (
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
                      : status === 'shipped'
                        ? 'Enviados'
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
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Pago</th>
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
                      <td className="px-6 py-4 text-sm text-gray-900">{formatOrderNumber(order.id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getOrderProductSummary(order)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getOrderQuantity(order)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getPaymentMethodLabel(getOrderPaymentMethod(order.productos))}
                      </td>
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
                                : order.status === 'shipped' || order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="paid">Pago completado</option>
                          <option value="shipped">Enviado</option>
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
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
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
