'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { emptyShippingDetails } from '@/lib/shipping'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastname: '',
    shipping: emptyShippingDetails(),
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

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [name]: value,
      },
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
          shipping: {
            ...formData.shipping,
            name: formData.name,
            lastname: formData.lastname,
          },
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Error al crear la cuenta')
        return
      }

      // Usuario creado correctamente → redirigir
      router.push('/login?message=Account created')
    } catch {
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
              placeholder="Apellidos"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.lastname}
              onChange={handleChange}
            />

            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              placeholder="Dirección línea 1 - Tipo de vía (calle, avenida, etc)"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.shipping.addressLine1}
              onChange={handleShippingChange}
            />

            <input
              id="addressLine2"
              name="addressLine2"
              type="text"
              placeholder="Dirección línea 2 - Piso, puerta, escalera, bloque o datos adicionales"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.shipping.addressLine2}
              onChange={handleShippingChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                placeholder="Código Postal"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
                value={formData.shipping.postalCode}
                onChange={handleShippingChange}
              />

              <input
                id="city"
                name="city"
                type="text"
                placeholder="Localidad / Ciudad"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
                value={formData.shipping.city}
                onChange={handleShippingChange}
              />

              <input
                id="province"
                name="province"
                type="text"
                placeholder="Provincia"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
                value={formData.shipping.province}
                onChange={handleShippingChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                id="country"
                name="country"
                type="text"
                placeholder="País"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
                value={formData.shipping.country}
                onChange={handleShippingChange}
              />

              <input
                id="nif"
                name="nif"
                type="text"
                placeholder="N.I.F."
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
                value={formData.shipping.nif}
                onChange={handleShippingChange}
              />
            </div>

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Teléfono de contacto"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.shipping.phone}
              onChange={handleShippingChange}
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