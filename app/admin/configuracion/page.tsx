'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminConfiguracionPage() {
  const [shippingFeeInput, setShippingFeeInput] = useState('0')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadShippingFee = async () => {
      try {
        const response = await fetch('/api/admin/settings/shipping-fee')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'No se pudo cargar gastos de envío')
        }

        setShippingFeeInput(String(data.shippingFee ?? 0))
      } catch (err) {
        console.error(err)
        setMessage('No se pudo cargar la configuración de envío')
      } finally {
        setLoading(false)
      }
    }

    loadShippingFee()
  }, [])

  const saveShippingFee = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const parsed = Number(shippingFeeInput)

      if (!Number.isFinite(parsed) || parsed < 0) {
        setMessage('Introduce un valor válido (0 o mayor)')
        return
      }

      const response = await fetch('/api/admin/settings/shipping-fee', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shippingFee: parsed }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo guardar gastos de envío')
      }

      setShippingFeeInput(String(data.shippingFee ?? parsed))
      setMessage('Gastos de envío actualizados correctamente')
    } catch (err) {
      console.error(err)
      setMessage('No se pudo guardar la configuración de envío')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de tienda</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
            Volver al dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Gastos de envío</h2>
          <p className="text-sm text-gray-600 mb-4">
            Define el coste fijo que se suma en carrito y checkout.
          </p>

          {loading ? (
            <p className="text-sm text-gray-500">Cargando configuración...</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div>
                <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Gastos de envío (EUR)
                </label>
                <input
                  id="shippingFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingFeeInput}
                  onChange={(e) => setShippingFeeInput(e.target.value)}
                  className="w-56 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={saveShippingFee}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}

          {message && (
            <p className={`text-sm mt-3 ${message.includes('correctamente') ? 'text-green-700' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
