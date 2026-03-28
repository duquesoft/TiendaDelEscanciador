'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminToolsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [makingAdmin, setMakingAdmin] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) return

      } catch (error) {
        console.error('Error loading users:', error)
      }
    }

    loadUsers()
  }, [supabase])

  const handleMakeAdmin = async () => {
    if (!selectedUserId) {
      setMessage('Por favor selecciona un usuario')
      return
    }

    setMakingAdmin(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(`Error: ${data.error}`)
        return
      }

      setMessage('✅ Usuario ahora es admin!')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setMessage('Error al hacer admin al usuario')
      console.error(error)
    } finally {
      setMakingAdmin(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Herramientas de Admin</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              placeholder="Pega aquí el UUID del usuario"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Obtén el UUID en: Supabase → Authentication → Users
            </p>
          </div>

          <button
            onClick={handleMakeAdmin}
            disabled={!selectedUserId || makingAdmin}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-md transition"
          >
            {makingAdmin ? 'Procesando...' : 'Hacer Admin'}
          </button>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.startsWith('✅')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <hr className="my-6" />

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Pasos para hacer admin:</p>
          <ol className="text-xs text-gray-600 space-y-2">
            <li>1. Crea un usuario en /signup</li>
            <li>2. Ve a Supabase → Authentication → Users</li>
            <li>3. Copia el UUID del usuario</li>
            <li>4. Pégalo arriba y haz clic en &quot;Hacer Admin&quot;</li>
            <li>5. ¡Accede a /admin!</li>
          </ol>
        </div>

        <hr className="my-6" />

        <Link href="/admin" className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition">
          Ir al Panel Admin
        </Link>
      </div>
    </div>
  )
}
