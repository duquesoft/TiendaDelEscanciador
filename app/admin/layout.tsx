'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Verificar si es admin
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (userRole?.role !== 'admin') {
          router.push('/')
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error('Error checking admin status:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Verificando permisos...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Acceso denegado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="flex">
        <div className="w-64 bg-gray-900 text-white p-6">
          <Link href="/admin/dashboard" className="text-2xl font-bold mb-8 block">
            Admin Panel
          </Link>

          <nav className="space-y-4">
            <Link
              href="/admin/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/usuarios"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Usuarios
            </Link>
            <Link
              href="/admin/pedidos"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Pedidos
            </Link>
            <Link
              href="/admin/reportes"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Reportes
            </Link>
            <Link
              href="/admin/configuracion"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Configuración
            </Link>
            <hr className="my-4 border-gray-700" />
            <Link
              href="/"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
            >
              ← Volver al sitio
            </Link>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
