import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: userData, error } = await supabaseAdmin.auth.admin.listUsers()

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

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, lastname, phone, address } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password requeridos' },
        { status: 400 }
      )
    }

    console.log("SERVICE ROLE KEY (primeros 15 chars):", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 15))

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log("ADMIN CLIENT CREATED WITH KEY LENGTH:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length)

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        lastname,
        phone,
        address,
      },
    })

    if (error) {
      console.log("ERROR SUPABASE:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("USER CREATED IN AUTH:", data.user.id)

    // INSERT CORREGIDO
    const insertUser = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      email,
      password: null,
      name,
      lastname,
      phone,
      address,
      createdat: new Date(),
      updatedat: new Date()
    })

    console.log("INSERT INTO users RESULT:", insertUser)

    const insertRole = await supabaseAdmin.from("user_roles").insert({
      user_id: data.user.id,
      role: "user"
    })

    console.log("INSERT INTO user_roles RESULT:", insertRole)

    return NextResponse.json({ user: data.user }, { status: 201 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}