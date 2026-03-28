import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/test/create-user
 * Crea un usuario de prueba SIN verificación de email
 * ⚠️ SOLO para desarrollo, eliminar en producción
 */
export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'No disponible' }, { status: 404 })
    }

    // Token solo para entorno local de desarrollo
    const auth = req.headers.get('authorization')
    const devSecret = process.env.DEV_TEST_USER_SECRET

    if (!devSecret || auth !== `Bearer ${devSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = await createClient()
    const { email, password, name, lastname, phone, address } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password requeridos' },
        { status: 400 }
      )
    }

    // Crear usuario
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ✅ Confirmar automáticamente
      user_metadata: {
        name: name || 'Usuario',
        lastname: lastname || 'Test',
        phone: phone || '',
        address: address || '',
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { success: true, user: data.user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
