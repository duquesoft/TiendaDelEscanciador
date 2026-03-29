import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  emptyShippingDetails,
  formatShippingAddress,
  parseShippingDetails,
  serializeShippingDetails,
  formatShippingRecipient,
  type ShippingDetails,
} from '@/lib/shipping'

interface UserProfileRow {
  id: string
  email: string | null
  name: string | null
  lastname: string | null
  phone: string | null
  address: string | null
  createdat: string | null
  updatedat: string | null
}

function createAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  return user
}

function buildUserResponse(profile: UserProfileRow | null, authUser: Awaited<ReturnType<typeof getAuthenticatedUser>>) {
  const fallbackMetadata = authUser?.user_metadata || {}
  const fallbackName = typeof fallbackMetadata.name === 'string' ? fallbackMetadata.name : null
  const fallbackLastname = typeof fallbackMetadata.lastname === 'string' ? fallbackMetadata.lastname : null
  const fallbackPhone = typeof fallbackMetadata.phone === 'string' ? fallbackMetadata.phone : null
  const fallbackAddress = typeof fallbackMetadata.address === 'string' ? fallbackMetadata.address : null

  const name = profile?.name || fallbackName
  const lastname = profile?.lastname || fallbackLastname
  const phone = profile?.phone || fallbackPhone
  const address = profile?.address || fallbackAddress
  const shipping = parseShippingDetails({ address, phone, name, lastname })
  const resolvedName = name || shipping.name || null
  const resolvedLastname = lastname || shipping.lastname || null

  return {
    id: authUser?.id || '',
    email: profile?.email || authUser?.email || null,
    name: resolvedName,
    lastname: resolvedLastname,
    phone: shipping.phone || phone || null,
    address: formatShippingAddress({ address, phone, name: resolvedName, lastname: resolvedLastname }) || null,
    shipping,
    createdat: profile?.createdat || authUser?.created_at || null,
    updatedat: profile?.updatedat || null,
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabaseAdmin = createAdmin()

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, lastname, phone, address, createdat, updatedat')
      .eq('id', user.id)
      .maybeSingle<UserProfileRow>()

    if (profileError) {
      return NextResponse.json(
        { error: 'Error obteniendo perfil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: buildUserResponse(profile, user),
    })
  } catch (error) {
    console.error('Error en GET /api/users/me:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()

    const shippingBody = typeof body.shipping === 'object' && body.shipping !== null
      ? (body.shipping as Partial<ShippingDetails>)
      : null

    const shipping: ShippingDetails = {
      ...emptyShippingDetails(),
      name:
        typeof shippingBody?.name === 'string'
          ? shippingBody.name.trim()
          : typeof body.name === 'string'
            ? body.name.trim()
            : '',
      lastname:
        typeof shippingBody?.lastname === 'string'
          ? shippingBody.lastname.trim()
          : typeof body.lastname === 'string'
            ? body.lastname.trim()
            : '',
      nif: typeof shippingBody?.nif === 'string' ? shippingBody.nif.trim() : '',
      addressLine1:
        typeof shippingBody?.addressLine1 === 'string'
          ? shippingBody.addressLine1.trim()
          : typeof body.address === 'string'
            ? body.address.trim()
            : '',
      addressLine2: typeof shippingBody?.addressLine2 === 'string' ? shippingBody.addressLine2.trim() : '',
      postalCode: typeof shippingBody?.postalCode === 'string' ? shippingBody.postalCode.trim() : '',
      city: typeof shippingBody?.city === 'string' ? shippingBody.city.trim() : '',
      province: typeof shippingBody?.province === 'string' ? shippingBody.province.trim() : '',
      country: typeof shippingBody?.country === 'string' ? shippingBody.country.trim() : '',
      phone:
        typeof shippingBody?.phone === 'string'
          ? shippingBody.phone.trim()
          : typeof body.phone === 'string'
            ? body.phone.trim()
            : '',
    }

    const name = typeof body.name === 'string' ? body.name.trim() : undefined
    const lastname = typeof body.lastname === 'string' ? body.lastname.trim() : undefined
    const serializedAddress = serializeShippingDetails(shipping)

    if (
      !shipping.name ||
      !shipping.lastname ||
      shipping.name.length > 100 ||
      shipping.lastname.length > 100 ||
      shipping.addressLine1.length > 150 ||
      shipping.addressLine2.length > 150 ||
      shipping.nif.length > 20 ||
      shipping.postalCode.length > 20 ||
      shipping.city.length > 120 ||
      shipping.province.length > 120 ||
      shipping.country.length > 120 ||
      shipping.phone.length > 30 ||
      (typeof name === 'string' && name.length > 100) ||
      (typeof lastname === 'string' && lastname.length > 100)
    ) {
      return NextResponse.json(
        { error: 'Nombre y apellidos del envío son obligatorios' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdmin()

    const { data: updatedRow, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        ...(typeof name === 'string' ? { name: name || null } : {}),
        ...(typeof lastname === 'string' ? { lastname: lastname || null } : {}),
        phone: shipping.phone || null,
        address: serializedAddress,
        updatedat: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, email, name, lastname, phone, address, createdat, updatedat')
      .maybeSingle<UserProfileRow>()

    if (updateError) {
      return NextResponse.json(
        { error: 'Error actualizando datos' },
        { status: 500 }
      )
    }

    if (!updatedRow) {
      const { data: insertedRow, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email || null,
          password: null,
          name: typeof name === 'string' ? name || null : null,
          lastname: typeof lastname === 'string' ? lastname || null : null,
          phone: shipping.phone || null,
          address: serializedAddress,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString(),
        })
        .select('id, email, name, lastname, phone, address, createdat, updatedat')
        .single<UserProfileRow>()

      if (insertError) {
        return NextResponse.json(
          { error: 'Error creando perfil de usuario' },
          { status: 500 }
        )
      }

      return NextResponse.json({ user: buildUserResponse(insertedRow, user) })
    }

    return NextResponse.json({ user: buildUserResponse(updatedRow, user) })
  } catch (error) {
    console.error('Error en PATCH /api/users/me:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
