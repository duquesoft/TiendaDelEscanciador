'use client'

import { useState, useEffect, useRef } from 'react'
import { getOrdersByUser, getAllUsers } from '@/lib/supabase/admin'
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

interface AdminUser {
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)

  const getOrderProductSummary = (order: Order) => {
    const products = getOrderProducts(order.productos)

    if (products.length > 0) {
      return products.map((p) => p.nombre).join(', ')
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

  const formatShippingLine = (parts: Array<string | undefined>) => {
    const values = parts
      .map((part) => (part || '').trim())
      .filter(Boolean)

    return values.length > 0 ? values.join(', ') : 'No disponible'
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers()
        setUsers(data)
      } catch (err) {
        console.error('Error loading users:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleSelectUser = async (userId: string) => {
    setSelectedUser(userId)
    setOrdersLoading(true)
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    try {
      const orders = await getOrdersByUser(userId)
      setUserOrders(orders)
    } catch (err) {
      console.error('Error loading user orders:', err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return

    const res = await fetch("/api/admin/users/delete", {
      method: "POST",
      body: JSON.stringify({ id })
    })

    if (res.ok) {
      setUsers(users.filter(u => u.id !== id))
      setSelectedUser(null)
      alert("Usuario eliminado")
    } else {
      alert("Error eliminando usuario")
    }
  }

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700 text-sm md:text-base">
            Volver al dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de usuarios */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Usuarios ({users.length})</h2>
            </div>
            <div className="overflow-y-auto max-h-96">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className={`w-full text-left px-6 py-3 border-b border-gray-100 hover:bg-blue-50 transition ${
                    selectedUser === user.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-600">
                    {user.name} {user.lastname}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detalles del usuario y sus pedidos */}
          <div className="lg:col-span-2" ref={detailRef}>
            {selectedUser ? (
              <>
                {/* Detalles del usuario */}
                {users.find((u) => u.id === selectedUser) && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Detalles del Usuario</h3>
                    {(() => {
                      const user = users.find((u) => u.id === selectedUser)

                      if (!user) {
                        return null
                      }

                      return (
                        <div className="space-y-2 text-gray-600">
                          <p><span className="font-medium">Email:</span> {user.email}</p>
                          <p><span className="font-medium">Nombre:</span> {user.name}</p>
                          <p><span className="font-medium">Apellidos:</span> {user.lastname}</p>
                          <p><span className="font-medium">Teléfono:</span> {user.phone || 'No disponible'}</p>
                          <div className="pt-2">
                            <p className="font-medium text-gray-800">Datos de envío:</p>
                            {user.shipping ? (
                              <div className="mt-1 space-y-1 text-sm">
                                <p className="font-medium text-gray-900">
                                  {formatShippingLine([user.shipping.name, user.shipping.lastname])}
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatShippingLine([user.shipping.addressLine1, user.shipping.addressLine2])}
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatShippingLine([user.shipping.city, user.shipping.province])}
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatShippingLine([user.shipping.postalCode, user.shipping.country])}
                                </p>
                                <p className="font-medium text-gray-900">N.I.F.: {user.shipping.nif?.trim() || 'No disponible'}</p>
                                <p className="font-medium text-gray-900">Tel.: {user.shipping.phone?.trim() || 'No disponible'}</p>
                              </div>
                            ) : (
                              <p className="text-sm">{user.address || 'No disponible'}</p>
                            )}
                          </div>
                          <p><span className="font-medium">Fecha registro:</span> {user.createdat ? new Date(user.createdat).toLocaleString() : 'No disponible'}</p>
                          <p><span className="font-medium">Rol:</span> {user.role || 'user'}</p>

                          <div className="flex gap-3 mt-4">
                            <Link
                              href={`/admin/usuarios/${user.id}/editar`}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Editar
                            </Link>

                            <button
                              onClick={() => deleteUser(user.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Pedidos del usuario */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Pedidos del Usuario</h3>
                  </div>
                  {ordersLoading ? (
                    <div className="p-6 text-center text-gray-500">Cargando pedidos...</div>
                  ) : userOrders.length > 0 ? (
                    <>
                      {/* Móvil: tarjetas */}
                      <div className="md:hidden divide-y divide-gray-200">
                        {userOrders.map((order) => (
                          <div key={order.id} className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium leading-5 text-gray-900">
                                {getOrderProductSummary(order)}
                              </p>
                              <span
                                className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  order.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.status === 'paid'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'shipped' || order.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {order.status === 'pending' ? 'Pendiente'
                                  : order.status === 'paid' ? 'Pago completado'
                                  : order.status === 'shipped' || order.status === 'completed' ? 'Enviado'
                                  : 'Cancelado'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-gray-400">Cantidad</p>
                                <p className="font-medium text-gray-800">{getOrderQuantity(order)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400">Total</p>
                                <p className="font-semibold text-gray-900">€{order.total.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Escritorio: tabla */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Producto</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Cantidad</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Total</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userOrders.map((order) => (
                              <tr key={order.id} className="border-b border-gray-200">
                                <td className="px-4 py-2">{getOrderProductSummary(order)}</td>
                                <td className="px-4 py-2">{getOrderQuantity(order)}</td>
                                <td className="px-4 py-2">€{order.total.toFixed(2)}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      order.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : order.status === 'paid'
                                        ? 'bg-blue-100 text-blue-800'
                                        : order.status === 'shipped' || order.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {order.status === 'pending'
                                      ? 'Pendiente'
                                      : order.status === 'paid'
                                      ? 'Pago completado'
                                      : order.status === 'shipped' || order.status === 'completed'
                                      ? 'Enviado'
                                      : 'Cancelado'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-gray-500">Este usuario no tiene pedidos</div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Selecciona un usuario para ver sus detalles y pedidos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}