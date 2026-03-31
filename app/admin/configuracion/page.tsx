'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { HeaderTheme } from '@/lib/header-theme'

export default function AdminConfiguracionPage() {
  const [shippingFeeInput, setShippingFeeInput] = useState('0')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [whatsappInput, setWhatsappInput] = useState('')
  const [whatsappSaved, setWhatsappSaved] = useState('')
  const [whatsappLoading, setWhatsappLoading] = useState(true)
  const [whatsappSaving, setWhatsappSaving] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null)

  const [headerThemeInput, setHeaderThemeInput] = useState<HeaderTheme>('green')
  const [headerThemeSaved, setHeaderThemeSaved] = useState<HeaderTheme>('green')
  const [headerThemeLoading, setHeaderThemeLoading] = useState(true)
  const [headerThemeSaving, setHeaderThemeSaving] = useState(false)
  const [headerThemeMessage, setHeaderThemeMessage] = useState<string | null>(null)

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

    const loadWhatsapp = async () => {
      try {
        const response = await fetch('/api/admin/settings/whatsapp')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'No se pudo cargar el número de WhatsApp')
        }

        const num = data.whatsappNumber ?? ''
        setWhatsappInput(num)
        setWhatsappSaved(num)
      } catch (err) {
        console.error(err)
        setWhatsappMessage('No se pudo cargar el número de WhatsApp')
      } finally {
        setWhatsappLoading(false)
      }
    }

    const loadHeaderTheme = async () => {
      try {
        const response = await fetch('/api/admin/settings/header-theme')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'No se pudo cargar el tema del header')
        }

        const theme = data.headerTheme === 'blue' ? 'blue' : 'green'
        setHeaderThemeInput(theme)
        setHeaderThemeSaved(theme)
      } catch (err) {
        console.error(err)
        setHeaderThemeMessage('No se pudo cargar el tema del header')
      } finally {
        setHeaderThemeLoading(false)
      }
    }

    loadShippingFee()
    loadWhatsapp()
    loadHeaderTheme()
  }, [])

  const saveWhatsapp = async () => {
    setWhatsappSaving(true)
    setWhatsappMessage(null)

    try {
      const trimmed = whatsappInput.trim()

      if (!/^\d{7,15}$/.test(trimmed)) {
        setWhatsappMessage('Introduce un número válido: solo dígitos, entre 7 y 15 caracteres')
        return
      }

      const response = await fetch('/api/admin/settings/whatsapp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: trimmed }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo guardar el número de WhatsApp')
      }

      const saved = data.whatsappNumber ?? trimmed
      setWhatsappInput(saved)
      setWhatsappSaved(saved)
      setWhatsappMessage('Número de WhatsApp actualizado correctamente')
    } catch (err) {
      console.error(err)
      setWhatsappMessage('No se pudo guardar el número de WhatsApp')
    } finally {
      setWhatsappSaving(false)
    }
  }

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

  const saveHeaderTheme = async () => {
    setHeaderThemeSaving(true)
    setHeaderThemeMessage(null)

    try {
      const response = await fetch('/api/admin/settings/header-theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ headerTheme: headerThemeInput }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo guardar el tema del header')
      }

      const savedTheme = data.headerTheme === 'blue' ? 'blue' : 'green'
      setHeaderThemeInput(savedTheme)
      setHeaderThemeSaved(savedTheme)
      setHeaderThemeMessage('Tema del header actualizado correctamente')
    } catch (err) {
      console.error(err)
      setHeaderThemeMessage('No se pudo guardar el tema del header')
    } finally {
      setHeaderThemeSaving(false)
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

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Color del header</h2>
          <p className="text-sm text-gray-600 mb-4">
            Elige entre el estilo actual verde o el azul anterior.
          </p>

          {!headerThemeLoading && (
            <p className="text-sm text-gray-700 mb-4">
              <span className="font-medium">Tema actual:</span>{' '}
              <span className="font-semibold">
                {headerThemeSaved === 'blue' ? 'Azul' : 'Verde'}
              </span>
            </p>
          )}

          {headerThemeLoading ? (
            <p className="text-sm text-gray-500">Cargando configuración...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="headerTheme"
                    value="green"
                    checked={headerThemeInput === 'green'}
                    onChange={() => setHeaderThemeInput('green')}
                  />
                  Verde (actual)
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="headerTheme"
                    value="blue"
                    checked={headerThemeInput === 'blue'}
                    onChange={() => setHeaderThemeInput('blue')}
                  />
                  Azul (anterior)
                </label>
              </div>

              <button
                type="button"
                onClick={saveHeaderTheme}
                disabled={headerThemeSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {headerThemeSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}

          {headerThemeMessage && (
            <p className={`text-sm mt-3 ${headerThemeMessage.includes('correctamente') ? 'text-green-700' : 'text-red-600'}`}>
              {headerThemeMessage}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">WhatsApp de contacto</h2>
          <p className="text-sm text-gray-600 mb-4">
            Número que usa el botón flotante de WhatsApp en la tienda. Incluye el prefijo de país sin
            el símbolo <code className="bg-gray-100 px-1 rounded">+</code> (ej: <code className="bg-gray-100 px-1 rounded">34600000000</code>).
          </p>

          {!whatsappLoading && (
            <p className="text-sm text-gray-700 mb-4">
              <span className="font-medium">Número configurado actualmente:</span>{' '}
              {whatsappSaved ? (
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{whatsappSaved}</span>
              ) : (
                <span className="text-gray-400 italic">Sin configurar</span>
              )}
            </p>
          )}

          {whatsappLoading ? (
            <p className="text-sm text-gray-500">Cargando configuración...</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div>
                <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de WhatsApp
                </label>
                <input
                  id="whatsappNumber"
                  type="text"
                  inputMode="numeric"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  className="w-56 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="34600000000"
                />
              </div>
              <button
                type="button"
                onClick={saveWhatsapp}
                disabled={whatsappSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {whatsappSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}

          {whatsappMessage && (
            <p className={`text-sm mt-3 ${whatsappMessage.includes('correctamente') ? 'text-green-700' : 'text-red-600'}`}>
              {whatsappMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
