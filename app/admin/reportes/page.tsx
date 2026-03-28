'use client'

import { useState, useEffect } from 'react'
import { getAllOrders } from '@/lib/supabase/admin'
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

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const ordersData = await getAllOrders()
        setOrders(ordersData)
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Cargando reportes...</p>
      </div>
    )
  }

  // Cálculos (solo pedidos con ingreso consolidado)
  const revenueOrders = orders.filter((o) => o.status === 'paid' || o.status === 'completed')
  const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.total, 0)
  const avgOrderValue = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0
  const completedCount = orders.filter((o) => o.status === 'completed').length
  const paidCount = orders.filter((o) => o.status === 'paid').length
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length

  // Productos más vendidos (solo pedidos con ingreso consolidado)
  const productSales = revenueOrders.reduce((acc, order) => {
    const products = getOrderProducts(order.productos)
    const normalizedProducts = products.length > 0
      ? products
      : [{ nombre: order.product || 'Sin producto', precio: order.total, cantidad: order.quantity || 1 }]

    normalizedProducts.forEach((product) => {
      const quantity = product.cantidad || 1
      const subtotal = product.precio * quantity

      const existing = acc.find((p) => p.product === product.nombre)
      if (existing) {
        existing.quantity += quantity
        existing.total += subtotal
      } else {
        acc.push({
          product: product.nombre,
          quantity,
          total: subtotal,
        })
      }
    })

    return acc
  }, [] as { product: string; quantity: number; total: number }[])

  productSales.sort((a, b) => b.total - a.total)

  // Ingresos por mes (solo pedidos con ingreso consolidado)
  const revenueByMonth = revenueOrders.reduce(
    (acc, order) => {
      const date = new Date(order.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = acc.find((m) => m.month === monthKey)
      if (existing) {
        existing.revenue += order.total
        existing.orders += 1
      } else {
        acc.push({
          month: monthKey,
          revenue: order.total,
          orders: 1,
        })
      }
      return acc
    },
    [] as { month: string; revenue: number; orders: number }[]
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
            Volver al dashboard
          </Link>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">€{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Ticket Promedio</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">€{avgOrderValue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Completados</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Pago completado</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{paidCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Cancelados</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{cancelledCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Productos más vendidos */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Top Productos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Producto</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Cantidad</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {productSales.slice(0, 5).map((product, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="px-6 py-3">{product.product}</td>
                      <td className="px-6 py-3">{product.quantity}</td>
                      <td className="px-6 py-3 font-semibold">€{product.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ingresos por mes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Ingresos por Mes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Mes</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Pedidos</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByMonth.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="px-6 py-3">{item.month}</td>
                      <td className="px-6 py-3">{item.orders}</td>
                      <td className="px-6 py-3 font-semibold">€{item.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* todos los productos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Todos los Productos Vendidos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Producto</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Cantidad Vendida</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Ingresos Totales</th>
                </tr>
              </thead>
              <tbody>
                {productSales.map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3">{product.product}</td>
                    <td className="px-6 py-3">{product.quantity}</td>
                    <td className="px-6 py-3 font-semibold">€{product.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
