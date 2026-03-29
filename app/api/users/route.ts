import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { emptyShippingDetails, serializeShippingDetails, type ShippingDetails } from '@/lib/shipping'
import { translateSupabaseAuthError } from '@/lib/supabase/auth-errors'

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
    const { email, password, name, lastname, phone, address, shipping } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password requeridos' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password inválido' },
        { status: 400 }
      )
    }

    const shippingInput = typeof shipping === 'object' && shipping !== null
      ? (shipping as Partial<ShippingDetails>)
      : null

    const normalizedShipping: ShippingDetails = {
      ...emptyShippingDetails(),
      name:
        typeof shippingInput?.name === 'string'
          ? shippingInput.name.trim()
          : typeof name === 'string'
            ? name.trim()
            : '',
      lastname:
        typeof shippingInput?.lastname === 'string'
          ? shippingInput.lastname.trim()
          : typeof lastname === 'string'
            ? lastname.trim()
            : '',
      nif: typeof shippingInput?.nif === 'string' ? shippingInput.nif.trim() : '',
      addressLine1:
        typeof shippingInput?.addressLine1 === 'string'
          ? shippingInput.addressLine1.trim()
          : typeof address === 'string'
            ? address.trim()
            : '',
      addressLine2: typeof shippingInput?.addressLine2 === 'string' ? shippingInput.addressLine2.trim() : '',
      postalCode: typeof shippingInput?.postalCode === 'string' ? shippingInput.postalCode.trim() : '',
      city: typeof shippingInput?.city === 'string' ? shippingInput.city.trim() : '',
      province: typeof shippingInput?.province === 'string' ? shippingInput.province.trim() : '',
      country: typeof shippingInput?.country === 'string' ? shippingInput.country.trim() : '',
      phone:
        typeof shippingInput?.phone === 'string'
          ? shippingInput.phone.trim()
          : typeof phone === 'string'
            ? phone.trim()
            : '',
    }

    if (
      !normalizedShipping.name ||
      !normalizedShipping.lastname ||
      normalizedShipping.name.length > 100 ||
      normalizedShipping.lastname.length > 100 ||
      normalizedShipping.addressLine1.length > 150 ||
      normalizedShipping.addressLine2.length > 150 ||
      normalizedShipping.nif.length > 20 ||
      normalizedShipping.postalCode.length > 20 ||
      normalizedShipping.city.length > 120 ||
      normalizedShipping.province.length > 120 ||
      normalizedShipping.country.length > 120 ||
      normalizedShipping.phone.length > 30
    ) {
      return NextResponse.json(
        { error: 'Nombre y apellidos del envío son obligatorios' },
        { status: 400 }
      )
    }

    const serializedAddress = serializeShippingDetails(normalizedShipping)

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        lastname,
        phone: normalizedShipping.phone || null,
        address: serializedAddress,
        shipping: normalizedShipping,
      },
    })

    if (error) {
      return NextResponse.json({ error: translateSupabaseAuthError(error.message, 'signup') }, { status: 400 })
    }

    const { error: userInsertError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      email,
      password: null,
      name,
      lastname,
      phone: normalizedShipping.phone || null,
      address: serializedAddress,
      createdat: new Date(),
      updatedat: new Date()
    })

    if (userInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      return NextResponse.json(
        { error: 'Error creando perfil de usuario' },
        { status: 500 }
      )
    }

    const { error: roleInsertError } = await supabaseAdmin.from("user_roles").insert({
      user_id: data.user.id,
      role: "user"
    })

    if (roleInsertError) {
      await supabaseAdmin.from("users").delete().eq("id", data.user.id)
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      return NextResponse.json(
        { error: 'Error asignando rol de usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data.user }, { status: 201 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}