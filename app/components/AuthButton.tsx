'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const checkAdminStatus = async (currentUser: User) => {
      try {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id)
          .single()

        setIsAdmin(userRole?.role === 'admin')
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setAuthChecked(true)

        // No bloquear el render por la consulta de admin.
        if (currentUser) {
          void checkAdminStatus(currentUser)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
        setIsAdmin(false)
        setAuthChecked(true)
      }
    }

    checkUser()

    // Escuchar cambios en autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setAuthChecked(true)

      if (currentUser) {
        void checkAdminStatus(currentUser)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!authChecked) {
    return (
      <div className="flex gap-2 opacity-80" aria-busy="true" aria-live="polite">
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Registrarse
        </Link>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user.email}</span>
        <Link
          href="/mi-cuenta"
          className="px-3 py-2 bg-slate-700 text-white text-sm rounded-md hover:bg-slate-800 transition"
        >
          Mi cuenta
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition"
          >
            Admin
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Registrarse
      </Link>
    </div>
  )
}
