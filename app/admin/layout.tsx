'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/reportes', label: 'Reportes' },
  { href: '/admin/configuracion', label: 'Configuración' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

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
      {/* Top bar móvil */}
      <div className="lg:hidden flex items-center justify-between bg-gray-900 text-white px-4 py-3">
        <Link href="/admin/dashboard" className="text-lg font-bold">
          Admin Panel
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-700 transition"
          aria-label="Abrir menú"
        >
          {sidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Overlay en móvil */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`
            fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 text-white p-6 transform transition-transform duration-300
            lg:static lg:translate-x-0 lg:z-auto lg:min-h-screen
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Link href="/admin/dashboard" className="text-2xl font-bold mb-8 block">
            Admin Panel
          </Link>

          <nav className="space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-lg hover:bg-gray-800 transition ${
                  pathname === link.href ? 'bg-gray-700' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
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
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
