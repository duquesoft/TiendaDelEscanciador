'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getOrderById, updateOrderStatus } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getOrderProducts, getOrderShipping } from '@/lib/order-data'

interface OrderProduct {
  nombre: string
  precio: number
  cantidad?: number
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
  updated_at?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(params.id as string)
        if (!data) {
          setError('Pedido no encontrado')
        } else {
          setOrder(data)
        }
      } catch (err) {
        setError('Error cargando el pedido')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) loadOrder()
  }, [params.id])

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    setSaving(true)
    try {
      const success = await updateOrderStatus(order.id, newStatus)
      if (success) {
        setOrder({ ...order, status: newStatus })
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-red-600">{error || 'Pedido no encontrado'}</p>
        <Link href="/admin/pedidos" className="text-blue-600 hover:underline">
          Volver a pedidos
        </Link>
      </div>
    )
  }

  const productos: OrderProduct[] = getOrderProducts(order.productos).length > 0
    ? getOrderProducts(order.productos)
    : order.product
      ? [{ nombre: order.product, precio: order.total, cantidad: order.quantity || 1 }]
      : []
  const shipping = getOrderShipping(order.productos)

  const formatShippingLine = (parts: Array<string | undefined>) => {
    const values = parts
      .map((part) => (part || '').trim())
      .filter(Boolean)

    return values.length > 0 ? values.join(', ') : 'No disponible'
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalle del Pedido</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {order.id}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Volver
            </button>
            <Link
              href="/admin/pedidos"
              className="px-4 py-2 text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
            >
              Todos los pedidos
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info principal */}
          <div className="md:col-span-2 space-y-6">
            {/* Productos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
              {productos.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-700">Producto</th>
                      <th className="text-center py-2 font-medium text-gray-700">Cantidad</th>
                      <th className="text-right py-2 font-medium text-gray-700">Precio unit.</th>
                      <th className="text-right py-2 font-medium text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{p.nombre}</td>
                        <td className="py-3 text-center text-gray-700">{p.cantidad || 1}</td>
                        <td className="py-3 text-right text-gray-700">€{p.precio.toFixed(2)}</td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          €{(p.precio * (p.cantidad || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="pt-4 text-right font-semibold text-gray-900">
                        Total
                      </td>
                      <td className="pt-4 text-right font-bold text-gray-900 text-base">
                        €{order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-gray-500 text-sm">Sin productos registrados</p>
              )}
            </div>

            {shipping && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Envío congelado del pedido</h2>
                <div className="text-sm text-gray-900 space-y-1">
                  <p className="font-medium">{formatShippingLine([shipping.name, shipping.lastname])}</p>
                  <p className="font-medium">{formatShippingLine([shipping.addressLine1, shipping.addressLine2])}</p>
                  <p className="font-medium">{formatShippingLine([shipping.city, shipping.province])}</p>
                  <p className="font-medium">{formatShippingLine([shipping.postalCode, shipping.country])}</p>
                  <p className="font-medium">{shipping.phone?.trim() || 'No disponible'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: estado + info */}
          <div className="space-y-6">
            {/* Estado */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado</h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusColor[order.status] || 'bg-gray-100 text-gray-800'}`}
              >
                {statusLabel[order.status] || order.status}
              </span>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cambiar estado
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pago completado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                {saving && <p className="text-xs text-gray-500 mt-1">Guardando...</p>}
              </div>
            </div>

            {/* Detalles */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Usuario ID</dt>
                  <dd className="text-gray-900 break-all mt-0.5">{order.user_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Fecha de compra</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {new Date(order.created_at).toLocaleString('es-ES')}
                  </dd>
                </div>
                {order.updated_at && (
                  <div>
                    <dt className="font-medium text-gray-500">Última actualización</dt>
                    <dd className="text-gray-900 mt-0.5">
                      {new Date(order.updated_at).toLocaleString('es-ES')}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-gray-500">Total</dt>
                  <dd className="text-gray-900 font-bold mt-0.5">€{order.total.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
