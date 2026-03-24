'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastname: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      // 👉 AHORA SÍ: llamamos a tu API /api/users
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          lastname: formData.lastname,
          phone: formData.phone,
          address: formData.address,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Error al crear la cuenta')
        return
      }

      // Usuario creado correctamente → redirigir
      router.push('/login?message=Account created')
    } catch (err) {
      setError('Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear nueva cuenta
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Correo electrónico"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Nombre"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              id="lastname"
              name="lastname"
              type="text"
              required
              placeholder="Apellido"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.lastname}
              onChange={handleChange}
            />

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Teléfono (opcional)"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.phone}
              onChange={handleChange}
            />

            <input
              id="address"
              name="address"
              type="text"
              placeholder="Dirección (opcional)"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.address}
              onChange={handleChange}
            />

            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Contraseña"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirmar contraseña"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}