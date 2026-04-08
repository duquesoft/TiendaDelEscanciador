'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getOrderById, updateOrderStatus } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getOrderPaymentMethod, getOrderProducts, getOrderShipping, getOrderShipmentInfo } from '@/lib/order-data'
import { getPaymentMethodLabel } from '@/lib/payment-methods'
import type { ShippingDetails } from '@/lib/shipping'
import { formatOrderNumber } from '@/lib/order-number'

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

interface ShipmentForm {
  carrier: string
  trackingNumber: string
  trackingUrl: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [userShipping, setUserShipping] = useState<ShippingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [shipmentForm, setShipmentForm] = useState<ShipmentForm>({
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
  })

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(params.id as string)
        if (!data) {
          setError('Pedido no encontrado')
          return
        }
        setOrder(data)

        // Si el pedido no tiene envío embebido, cargar datos actuales del usuario
        const embeddedShipping = getOrderShipping(data.productos)
        if (!embeddedShipping && data.user_id) {
          const res = await fetch(`/api/admin/users/get?id=${data.user_id}`)
          if (res.ok) {
            const userData = await res.json()
            setUserShipping(userData.shipping ?? null)
          }
        }

        const shipmentInfo = getOrderShipmentInfo(data.productos)
        if (shipmentInfo) {
          setShipmentForm({
            carrier: shipmentInfo.carrier,
            trackingNumber: shipmentInfo.trackingNumber,
            trackingUrl: shipmentInfo.trackingUrl,
          })
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
      if (newStatus === 'shipped') {
        const carrier = shipmentForm.carrier.trim()
        const trackingNumber = shipmentForm.trackingNumber.trim()
        const trackingUrl = shipmentForm.trackingUrl.trim()

        if (!carrier || !trackingNumber || !trackingUrl) {
          setError('Para marcar como enviado debes indicar agencia, numero de seguimiento y enlace')
          return
        }
      }

      setError(null)
      const success = await updateOrderStatus(order.id, newStatus, shipmentForm)
      if (success) {
        setOrder({ ...order, status: newStatus })
      } else {
        setError('No se pudo actualizar el estado del pedido')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setError('No se pudo actualizar el estado del pedido')
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
  const embeddedShipping = getOrderShipping(order.productos)
  const shipping = embeddedShipping || userShipping
    ? {
        name: embeddedShipping?.name?.trim() || userShipping?.name?.trim() || '',
        lastname: embeddedShipping?.lastname?.trim() || userShipping?.lastname?.trim() || '',
        nif: embeddedShipping?.nif?.trim() || userShipping?.nif?.trim() || '',
        addressLine1: embeddedShipping?.addressLine1?.trim() || userShipping?.addressLine1?.trim() || '',
        addressLine2: embeddedShipping?.addressLine2?.trim() || userShipping?.addressLine2?.trim() || '',
        postalCode: embeddedShipping?.postalCode?.trim() || userShipping?.postalCode?.trim() || '',
        city: embeddedShipping?.city?.trim() || userShipping?.city?.trim() || '',
        province: embeddedShipping?.province?.trim() || userShipping?.province?.trim() || '',
        country: embeddedShipping?.country?.trim() || userShipping?.country?.trim() || '',
        phone: embeddedShipping?.phone?.trim() || userShipping?.phone?.trim() || '',
      }
    : null
  const shippingIsFromProfile = !embeddedShipping && !!userShipping
  const paymentMethod = getOrderPaymentMethod(order.productos)
  const storedShipment = getOrderShipmentInfo(order.productos)

  const formatShippingLine = (parts: Array<string | undefined>) => {
    const values = parts
      .map((part) => (part || '').trim())
      .filter(Boolean)

    return values.length > 0 ? values.join(', ') : 'No disponible'
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Detalle del Pedido</h1>
            <p className="text-sm text-gray-500 mt-1">Pedido: {formatOrderNumber(order.id)}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => router.back()}
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Volver
            </button>
            <Link
              href={`/admin/usuarios/${order.user_id}`}
              className="px-3 py-2 text-sm text-emerald-700 bg-white border border-emerald-300 rounded-md hover:bg-emerald-50"
            >
              Ver usuario
            </Link>
            <Link
              href="/admin/pedidos"
              className="px-3 py-2 text-sm text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
            >
              Todos los pedidos
            </Link>
          </div>
        </div>

        <div className="space-y-6">

          {/* Fila superior: Estado + Dirección de envío */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="shipped">Enviado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                {saving && <p className="text-xs text-gray-500 mt-1">Guardando...</p>}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Datos de envío para cliente</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Agencia de transporte</label>
                  <input
                    type="text"
                    value={shipmentForm.carrier}
                    onChange={(e) => setShipmentForm((prev) => ({ ...prev, carrier: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Ej. Correos Express"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Numero de seguimiento</label>
                  <input
                    type="text"
                    value={shipmentForm.trackingNumber}
                    onChange={(e) => setShipmentForm((prev) => ({ ...prev, trackingNumber: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Ej. 123456789ES"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Enlace de seguimiento</label>
                  <input
                    type="url"
                    value={shipmentForm.trackingUrl}
                    onChange={(e) => setShipmentForm((prev) => ({ ...prev, trackingUrl: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="https://..."
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Al cambiar el estado a Enviado se enviará un email transaccional al cliente con estos datos.
                </p>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-500">Metodo de pago</p>
                <p className="mt-1 text-sm text-gray-900">{getPaymentMethodLabel(paymentMethod)}</p>
              </div>
            </div>

            {/* Dirección de envío */}
            {shipping ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección de envío</h2>
                {shippingIsFromProfile && (
                  <p className="text-xs text-amber-600 mb-3">Datos actuales del perfil del usuario</p>
                )}
                <div className="text-sm text-gray-900 space-y-1">
                  <p>{formatShippingLine([shipping.name, shipping.lastname])}</p>
                  <p>{formatShippingLine([shipping.addressLine1, shipping.addressLine2])}</p>
                  <p>{formatShippingLine([shipping.city, shipping.province])}</p>
                  <p>{formatShippingLine([shipping.postalCode, shipping.country])}</p>
                  <p>N.I.F.: {shipping.nif?.trim() || 'No disponible'}</p>
                  <p>Tel.: {shipping.phone?.trim() || 'Sin teléfono'}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección de envío</h2>
                <p className="text-sm text-gray-500">No disponible</p>
              </div>
            )}
          </div>

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

          {/* Información */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
            <dl className="flex flex-wrap gap-x-12 gap-y-3 text-sm">
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
              <div>
                <dt className="font-medium text-gray-500">Metodo de pago</dt>
                <dd className="text-gray-900 mt-0.5">{getPaymentMethodLabel(paymentMethod)}</dd>
              </div>
              {storedShipment && (
                <>
                  <div>
                    <dt className="font-medium text-gray-500">Agencia de transporte</dt>
                    <dd className="text-gray-900 mt-0.5">{storedShipment.carrier}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Numero de seguimiento</dt>
                    <dd className="text-gray-900 mt-0.5">{storedShipment.trackingNumber}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Seguimiento</dt>
                    <dd className="text-gray-900 mt-0.5 break-all">
                      <a href={storedShipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {storedShipment.trackingUrl}
                      </a>
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

        </div>
      </div>
    </div>
  )
}
