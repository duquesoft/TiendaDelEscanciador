# Panel de Administrador - Guía de Configuración

## 🚀 Instalación y Configuración

### 1. Ejecutar SQL en Supabase

Ve a **Project Settings → SQL Editor** en tu proyecto Supabase y ejecuta el contenido de `scripts/setup-admin.sql`:

Este script creará:
- Tabla `user_roles` para gestionar permisos
- Tabla `orders` para almacenar pedidos
- Función `is_admin()` para verificar admins
- Políticas RLS para seguridad

### 2. Hacer Admin a tu Usuario

Después de ejecutar el SQL, ejecuta esta query en Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('TU_USER_ID', 'admin')
ON CONFLICT(user_id) DO UPDATE SET role = 'admin';
```

**Obtener tu USER_ID:**
1. Ve a **Authentication → Users** en Supabase
2. Copia el UUID del usuario que deseas hacer admin

### 3. Acceder al Panel Admin

- URL: `http://localhost:3001/admin`
- Solo usuarios con rol `admin` pueden acceder
- Serás redirigido a `/admin/dashboard` automáticamente

### 4. Configurar subida de imágenes (importante para Vercel)

La subida de imágenes de productos usa **Supabase Storage** (persistente en producción).

- Variable opcional: `SUPABASE_PRODUCTS_BUCKET` (por defecto: `product-images`)
- Requisitos: mantener `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` configuradas en Vercel
- El API crea el bucket automáticamente si no existe
- Las imágenes se optimizan automáticamente al subirlas (máximo 1920x1920 y compresión por formato)

Si prefieres crearlo manualmente en Supabase Storage:
1. Crear bucket público con nombre `product-images` (o el valor de `SUPABASE_PRODUCTS_BUCKET`)
2. Permitir tipos de archivo de imagen (jpg/png/webp/gif/avif)

---

## 📊 Funcionalidades del Panel Admin

### Dashboard (`/admin/dashboard`)
- Estadísticas principales: usuarios, pedidos, ingresos
- Acceso rápido a otras secciones

### Usuarios (`/admin/usuarios`)
- Lista de todos los usuarios registrados
- Ver pedidos de cada usuario
- Información de contacto

### Pedidos (`/admin/pedidos`)
- Lista de todos los pedidos
- Filtrar por estado (pendiente, completado, cancelado)
- Cambiar estado de pedidos
- Detalles de cada pedido

### Reportes (`/admin/reportes`)
- Estadísticas detalladas de ingresos
- Productos más vendidos
- Ingresos por mes
- Análisis de conversión

---

## 🛒 Crear Órdenes (Desde el Cliente)

### Ejemplo JavaScript

```javascript
// Crear una orden
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    product: 'Nombre del Producto',
    price: 79.90,
    quantity: 1,
    total: 79.90,
  }),
})

const data = await response.json()
console.log('Orden creada:', data.order)
```

### Desde la página de Checkout

Actualiza `app/checkout/page.jsx` con:

```jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Checkout() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'Escanciador automático',
          price: 79.90,
          quantity: 1,
          total: 79.90,
        }),
      })

      if (response.ok) {
        router.push('/confirmacion')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Finalizar compra</h2>
      <div className="bg-white shadow p-6 rounded-lg">
        <p className="mb-4">Producto: <strong>Escanciador automático</strong></p>
        <p className="mb-4">Precio: <strong>79,90 €</strong></p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow disabled:bg-gray-400"
        >
          {loading ? 'Procesando...' : 'Procesar pago'}
        </button>
      </div>
    </div>
  )
}
```

---

## 🔒 Seguridad

### Row Level Security (RLS)

Las tablas usan RLS para proteger los datos:

- ✅ Usuarios solo ven sus propios pedidos
- ✅ Solo admins ven todos los pedidos y usuarios
- ✅ Solo admins pueden cambiar estados

### Estrategia recomendada: sesión normal vs service role

Usa esta regla para evitar bugs de visibilidad en panel admin:

- Sesión normal (cliente de usuario autenticado): operaciones del propio usuario.
- Service role (solo servidor, nunca cliente): listados globales de administración.

Matriz aplicada en este proyecto:

- Sesión normal:
  - `GET /api/orders` (mis pedidos)
  - `POST /api/orders` (crear pedido propio)
  - `GET /api/users/me` y `PATCH /api/users/me` (mi perfil/envío)

- Service role (después de validar `checkAdminAccess()`):
  - `getAllOrders()`
  - `getOrderById()`
  - `getOrdersByUser()`
  - `getAdminStats()`
  - `updateOrderStatus()`

Importante:

- Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en cliente.
- Todas las operaciones con service role deben ejecutarse en servidor.
- Si cambias políticas RLS, revisa primero los listados del panel admin.

### Protección de Rutas

- `/admin/*` - Solo accesible para admins
- `/api/admin/*` - Solo admins pueden llamar

---

## 📌 Notas Importantes

1. **Primer admin**: Debes hacer admin al primer usuario manualmente vía Supabase SQL
2. **Nuevos admins**: Los admins pueden hacer admin a otros usuarios (próxima feature)
3. **Datos de test**: Crea usuarios y hace órdenes para probar el panel
4. **RLS**: Verifica que esté habilitado en Supabase para máxima seguridad

---

## 🐛 Troubleshooting

### No puedo acceder a /admin
- ✅ ¿Estás logueado? (ve a `/login`)
- ✅ ¿Tu usuario es admin? (ejecuta el UPDATE sql)
- ✅ ¿Existe la tabla `user_roles`? (ejecuta `setup-admin.sql`)

### No veo usuarios/pedidos
- ✅ Verifica que tengas datos en las tablas
- ✅ Comprueba que la RLS esté configurada correctamente
- ✅ Revisa la consola del navegador para errores

### Error "Access Denied"
- ✅ Probablemente RLS deniegue el acceso
- ✅ Verifica que el usuario sea admin
- ✅ Revisa las políticas RLS en Supabase

---

## 📞 Funciones Disponibles

### Server Actions (`lib/supabase/admin.ts`)
- `checkAdminAccess()` - Verifica que sea admin
- `getAllUsers()` - Obtiene todos los usuarios
- `getAllOrders()` - Obtiene todos los pedidos
- `getOrdersByUser(userId)` - Pedidos de un usuario
- `updateOrderStatus(orderId, status)` - Cambia estado
- `getAdminStats()` - Estadísticas principales

### API Routes
- `POST /api/orders` - Crear orden
- `GET /api/orders` - Obtener mis órdenes
- `POST /api/admin/make-admin` - Hacer admin (solo admins)

---

¡Tu panel admin está listo! 🎉
