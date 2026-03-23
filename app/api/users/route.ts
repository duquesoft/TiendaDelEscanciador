import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/users
 * Obtener todos los usuarios (requiere autenticación admin)
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Obtener usuario autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar si es admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener todos los usuarios
    const { data: userData, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json(
        { error: 'Error obteniendo usuarios' },
        { status: 500 }
      )
    }

    return NextResponse.json({ users: userData?.users || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users
 * Crear un usuario (vía Supabase Auth)
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, lastname, phone, address } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Crear usuario
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          lastname,
          phone,
          address,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: authData.user }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
