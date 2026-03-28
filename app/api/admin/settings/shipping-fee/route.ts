import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { normalizeShippingFee, parseShippingFeeRecord } from '@/lib/shipping-fee'

export const dynamic = 'force-dynamic'

async function isCurrentUserAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, status: 401 as const }
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || roleData?.role !== 'admin') {
    return { ok: false, status: 403 as const }
  }

  return { ok: true as const }
}

export async function GET() {
  try {
    const auth = await isCurrentUserAdmin()

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'No autenticado' : 'No autorizado' },
        { status: auth.status }
      )
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping_fee')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'No se pudo leer la configuración' }, { status: 500 })
    }

    return NextResponse.json({ shippingFee: parseShippingFeeRecord(data) })
  } catch (error) {
    console.error('GET /api/admin/settings/shipping-fee error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await isCurrentUserAdmin()

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'No autenticado' : 'No autorizado' },
        { status: auth.status }
      )
    }

    const body = await req.json()
    const shippingFee = normalizeShippingFee(body?.shippingFee)

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
      .from('store_settings')
      .upsert(
        {
          key: 'shipping_fee',
          value: shippingFee,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )

    if (error) {
      console.error('Error saving shipping fee setting:', error)
      return NextResponse.json(
        {
          error:
            'No se pudo guardar la configuración. Verifica que exista la tabla public.store_settings.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, shippingFee })
  } catch (error) {
    console.error('PUT /api/admin/settings/shipping-fee error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
