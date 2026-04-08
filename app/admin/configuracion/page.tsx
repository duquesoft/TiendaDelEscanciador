'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { HeaderTheme } from '@/lib/header-theme'
import { dispatchWhatsappContactUpdated } from '@/lib/whatsapp-contact'

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

  const [maintenanceModeInput, setMaintenanceModeInput] = useState(false)
  const [maintenanceModeSaved, setMaintenanceModeSaved] = useState(false)
  const [maintenanceLoading, setMaintenanceLoading] = useState(true)
  const [maintenanceSaving, setMaintenanceSaving] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null)

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

    const loadMaintenanceMode = async () => {
      try {
        const response = await fetch('/api/admin/settings/maintenance')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'No se pudo cargar el modo mantenimiento')
        }

        const mode = Boolean(data.maintenanceMode)
        setMaintenanceModeInput(mode)
        setMaintenanceModeSaved(mode)
      } catch (err) {
        console.error(err)
        setMaintenanceMessage('No se pudo cargar el modo mantenimiento')
      } finally {
        setMaintenanceLoading(false)
      }
    }

    loadShippingFee()
    loadWhatsapp()
    loadHeaderTheme()
    loadMaintenanceMode()
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
      dispatchWhatsappContactUpdated(saved)
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

  const saveMaintenanceMode = async () => {
    setMaintenanceSaving(true)
    setMaintenanceMessage(null)

    try {
      const response = await fetch('/api/admin/settings/maintenance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maintenanceMode: maintenanceModeInput }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo guardar el modo mantenimiento')
      }

      const savedMode = Boolean(data.maintenanceMode)
      setMaintenanceModeInput(savedMode)
      setMaintenanceModeSaved(savedMode)
      setMaintenanceMessage('Modo mantenimiento actualizado correctamente')
    } catch (err) {
      console.error(err)
      setMaintenanceMessage('No se pudo guardar el modo mantenimiento')
    } finally {
      setMaintenanceSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Configuración de tienda</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700 text-sm md:text-base">
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Modo mantenimiento</h2>
          <p className="text-sm text-gray-600 mb-4">
            Cuando está activado, los usuarios verán una pantalla de mantenimiento y no podrán crear
            pedidos nuevos. Podrán seguir iniciando sesión y consultar <code className="bg-gray-100 px-1 rounded">Mi cuenta</code>.
          </p>

          {!maintenanceLoading && (
            <p className="text-sm text-gray-700 mb-4">
              <span className="font-medium">Estado actual:</span>{' '}
              <span className={`font-semibold ${maintenanceModeSaved ? 'text-amber-700' : 'text-green-700'}`}>
                {maintenanceModeSaved ? 'Activado' : 'Desactivado'}
              </span>
            </p>
          )}

          {maintenanceLoading ? (
            <p className="text-sm text-gray-500">Cargando configuración...</p>
          ) : (
            <div className="space-y-4">
              <label className="inline-flex items-center gap-3 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={maintenanceModeInput}
                  onChange={(e) => setMaintenanceModeInput(e.target.checked)}
                />
                Activar modo mantenimiento
              </label>

              <button
                type="button"
                onClick={saveMaintenanceMode}
                disabled={maintenanceSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {maintenanceSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}

          {maintenanceMessage && (
            <p className={`text-sm mt-3 ${maintenanceMessage.includes('correctamente') ? 'text-green-700' : 'text-red-600'}`}>
              {maintenanceMessage}
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
