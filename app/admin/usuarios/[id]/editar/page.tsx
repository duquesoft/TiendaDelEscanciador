'use client'

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { emptyShippingDetails, type ShippingDetails } from "@/lib/shipping"

interface EditableUser {
  id: string
  name: string
  lastname: string
  phone?: string
  address?: string
  shipping: ShippingDetails
  role: 'user' | 'admin'
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [user, setUser] = useState<EditableUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch(`/api/admin/users/get?id=${id}`)
      const data = await res.json()
      setUser({
        ...data,
        shipping: data.shipping || emptyShippingDetails(),
      })
      setLoading(false)
    }
    loadUser()
  }, [id])

  const handleSave = async () => {
    if (!user) {
      return
    }

    if (!user.shipping.name.trim() || !user.shipping.lastname.trim()) {
      alert('Nombre y apellidos del envío son obligatorios')
      return
    }

    const res = await fetch("/api/admin/users/update", {
      method: "POST",
      body: JSON.stringify(user)
    })

    if (res.ok) {
      alert("Usuario actualizado")
      router.push("/admin/usuarios")
    } else {
      alert("Error actualizando usuario")
    }
  }

  if (loading) return <p className="p-6">Cargando...</p>

  if (!user) return <p className="p-6">Usuario no encontrado</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Usuario</h1>

      <div className="space-y-4">
        <input
          className="w-full border p-2"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          placeholder="Nombre"
        />

        <input
          className="w-full border p-2"
          value={user.lastname}
          onChange={(e) => setUser({ ...user, lastname: e.target.value })}
          placeholder="Apellidos"
        />

        <input
          className="w-full border p-2"
          value={user.phone || ""}
          onChange={(e) => setUser({
            ...user,
            phone: e.target.value,
            shipping: { ...user.shipping, phone: e.target.value },
          })}
          placeholder="Teléfono base"
        />

        <div className="border rounded p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Datos de envío</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full border p-2"
              required
              value={user.shipping.name}
              onChange={(e) => setUser({
                ...user,
                shipping: { ...user.shipping, name: e.target.value },
              })}
              placeholder="Nombre"
            />

            <input
              className="w-full border p-2"
              required
              value={user.shipping.lastname}
              onChange={(e) => setUser({
                ...user,
                shipping: { ...user.shipping, lastname: e.target.value },
              })}
              placeholder="Apellidos"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full border p-2"
              value={user.shipping.addressLine1}
              onChange={(e) => setUser({
                ...user,
                shipping: { ...user.shipping, addressLine1: e.target.value },
              })}
              placeholder="Dirección (Línea 1)"
            />

            <input
              className="w-full border p-2"
              value={user.shipping.addressLine2}
              onChange={(e) => setUser({
                ...user,
                shipping: { ...user.shipping, addressLine2: e.target.value },
              })}
              placeholder="Dirección (Línea 2)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="w-full border p-2"
              value={user.shipping.postalCode}
              onChange={(e) => setUser({
                ...user,
                shipping: { ...user.shipping, postalCode: e.target.value },
              })}
              placeholder="Código postal"
            />

            <input
              className="w-full border p-2"
              value={user.shipping.city}
              onChange={(e) => setUser({
                ...user,
                shipping: { ...user.shipping, city: e.target.value },
              })}
              placeholder="Localidad / Ciudad"
            />

            <input
              className="w-full border p-2"
              value={user.shipping.province}
              onChange={(e) => setUser({
                ...user,
                shipping: { ...user.shipping, province: e.target.value },
              })}
              placeholder="Provincia"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full border p-2"
              value={user.shipping.country}
              onChange={(e) => setUser({
                ...user,
                shipping: { ...user.shipping, country: e.target.value },
              })}
              placeholder="País"
            />

            <input
              className="w-full border p-2"
              value={user.shipping.phone}
              onChange={(e) => setUser({
                ...user,
                phone: e.target.value,
                shipping: { ...user.shipping, phone: e.target.value },
              })}
              placeholder="Teléfono de contacto"
            />
          </div>
        </div>

        <select
          className="w-full border p-2"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value as 'user' | 'admin' })}
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}