'use client'

import { useState, useEffect } from 'react'
import { getAllUsers, getAdminStats } from '@/lib/supabase/admin'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  completedOrders: number
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, statsData] = await Promise.all([
          getAllUsers(),
          getAdminStats(),
        ])

        setUsers(usersData)
        setStats(statsData)
      } catch (err) {
        setError('Error cargando datos del administrador')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Volver al inicio
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total de Usuarios</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total de Pedidos</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Pedidos Completados</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stats.completedOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">€{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Usuarios */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Usuarios Registrados ({users.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Teléfono</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fecha Registro</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.name || user.lastname
                        ? `${user.name ?? ''} ${user.lastname ?? ''}`.trim()
                        : 'Sin nombre'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.phone ?? 'Sin teléfono'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.createdat
                        ? new Date(user.createdat).toLocaleDateString('es-ES')
                        : 'Fecha no disponible'}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/usuarios/${user.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver pedidos
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

        {/* Acceso a pedidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/pedidos"
              className="block p-4 border-2 border-blue-600 rounded-lg text-center hover:bg-blue-50 transition"
            >
              <p className="text-lg font-semibold text-blue-600">Ver todos los pedidos</p>
              <p className="text-sm text-gray-600 mt-1">Gestiona todos los pedidos del sistema</p>
            </Link>

            <Link
              href="/admin/reportes"
              className="block p-4 border-2 border-green-600 rounded-lg text-center hover:bg-green-50 transition"
            >
              <p className="text-lg font-semibold text-green-600">Reportes y Estadísticas</p>
              <p className="text-sm text-gray-600 mt-1">Análisis detallado del negocio</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}