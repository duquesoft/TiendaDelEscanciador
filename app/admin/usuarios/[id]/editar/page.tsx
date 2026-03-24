'use client'

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch(`/api/admin/users/get?id=${id}`)
      const data = await res.json()
      setUser(data)
      setLoading(false)
    }
    loadUser()
  }, [id])

  const handleSave = async () => {
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

  return (
    <div className="p-6 max-w-xl mx-auto">
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
          placeholder="Apellido"
        />

        <input
          className="w-full border p-2"
          value={user.phone || ""}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          placeholder="Teléfono"
        />

        <input
          className="w-full border p-2"
          value={user.address || ""}
          onChange={(e) => setUser({ ...user, address: e.target.value })}
          placeholder="Dirección"
        />

        <select
          className="w-full border p-2"
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
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