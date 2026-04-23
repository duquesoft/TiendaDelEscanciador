'use client'

import { useState } from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { emptyShippingDetails } from '@/lib/shipping'

export default function SignupPage() {
  const router = useRouter()
  // Leer parámetro redirect de la URL
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const redirect = searchParams?.get('redirect') || null
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

    // Validaciones de campos obligatorios
    const requiredFields = [
      { value: formData.email, label: 'Correo electrónico' },
      { value: formData.password, label: 'Contraseña' },
      { value: formData.confirmPassword, label: 'Confirmar contraseña' },
      { value: formData.name, label: 'Nombre' },
      { value: formData.lastname, label: 'Apellidos' },
      { value: formData.shipping.addressLine1, label: 'Dirección línea 1' },
      { value: formData.shipping.postalCode, label: 'Código Postal' },
      { value: formData.shipping.city, label: 'Ciudad' },
      { value: formData.shipping.province, label: 'Provincia' },
      { value: formData.shipping.country, label: 'País' },
      { value: formData.shipping.nif, label: 'NIF' },
      { value: formData.shipping.phone, label: 'Teléfono' },
    ]
    const missing = requiredFields.find(f => !f.value || f.value.trim() === '')
    if (missing) {
      setError(`El campo "${missing.label}" es obligatorio.`)
      setLoading(false)
      return
    }

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

      // Usuario creado correctamente → login automático con Supabase
      const supabase = createSupabaseClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (loginError) {
        setError('Cuenta creada, pero error al iniciar sesión automáticamente.')
        return
      }
      // Redirigir a página de éxito, pasando redirect si existe
      if (redirect) {
        router.push(`/cuenta-creada?redirect=${encodeURIComponent(redirect)}`)
      } else {
        router.push('/cuenta-creada')
      }
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
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear nueva cuenta
          </h1>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm space-y-4">
            <input
              id="email"
              name="email"
              type="email"
              required
              aria-label="Correo electrónico"
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
              aria-label="Nombre"
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
              aria-label="Apellidos"
              placeholder="Apellidos"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.lastname}
              onChange={handleChange}
            />

            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              aria-label="Dirección línea 1"
              placeholder="Dirección línea 1 - Tipo de vía (calle, avenida, etc)"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.shipping.addressLine1}
              onChange={handleShippingChange}
            />

            <input
              id="addressLine2"
              name="addressLine2"
              type="text"
              aria-label="Dirección línea 2"
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
                aria-label="Código postal"
                placeholder="Código Postal"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
                value={formData.shipping.postalCode}
                onChange={handleShippingChange}
              />

              <input
                id="city"
                name="city"
                type="text"
                aria-label="Localidad o ciudad"
                placeholder="Localidad / Ciudad"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
                value={formData.shipping.city}
                onChange={handleShippingChange}
              />

              <input
                id="province"
                name="province"
                type="text"
                aria-label="Provincia"
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
                aria-label="País"
                placeholder="País"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
                value={formData.shipping.country}
                onChange={handleShippingChange}
              />

              <input
                id="nif"
                name="nif"
                type="text"
                aria-label="NIF"
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
              aria-label="Teléfono de contacto"
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
              aria-label="Contraseña"
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
              aria-label="Confirmar contraseña"
              placeholder="Confirmar contraseña"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>


          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-2">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

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