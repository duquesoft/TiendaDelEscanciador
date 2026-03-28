'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CreateTestUserPage() {
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: '123456',
    name: 'Juan',
    lastname: 'Pérez',
    phone: '123456789',
    address: 'Calle Test 123',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [secret, setSecret] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateUser = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/test/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al crear usuario')
        return
      }

      setMessage(`✅ Usuario creado: ${data.user.email}`)
      setTimeout(() => window.location.href = '/login', 1500)
    } catch (err) {
      setError('Error al crear usuario')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Crear Usuario de Prueba</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token de desarrollo
            </label>
            <input
              type="password"
              name="dev-token"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 mb-4 bg-green-100 text-green-800 rounded-md text-sm">
            {message}
          </div>
        )}

        <button
          onClick={handleCreateUser}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-md transition mb-3"
        >
          {loading ? 'Creando...' : 'Crear Usuario de Prueba'}
        </button>

        <Link
          href="/"
          className="block w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
