import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { attachShippingToProducts } from '@/lib/order-data'
import { emptyShippingDetails, parseShippingDetails, type ShippingDetails } from '@/lib/shipping'
import { DEFAULT_SHIPPING_FEE, parseShippingFeeRecord } from '@/lib/shipping-fee'

interface OrderProduct {
  id?: number | string
  nombre: string
  precio: number
  cantidad?: number
  imagen?: string
}

async function getShippingFee() {
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
    console.error('Error reading shipping fee setting:', error)
    return DEFAULT_SHIPPING_FEE
  }

  return parseShippingFeeRecord(data)
}

/**
 * POST /api/orders
 * Crear una nueva orden con múltiples productos
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { productos, shipping } = await req.json()

    // Validación
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: 'La lista de productos es inválida' },
        { status: 400 }
      )
    }

    const normalizedProducts = productos
      .map((p: unknown) => {
        if (!p || typeof p !== 'object') return null

        const item = p as Record<string, unknown>
        const nombre = typeof item.nombre === 'string' ? item.nombre.trim() : ''
        const precio = Number(item.precio)
        const cantidadRaw = item.cantidad
        const cantidad =
          typeof cantidadRaw === 'number' && Number.isFinite(cantidadRaw) && cantidadRaw > 0
            ? Math.floor(cantidadRaw)
            : 1

        if (!nombre || !Number.isFinite(precio) || precio <= 0) {
          return null
        }

        const normalized: OrderProduct = {
          nombre,
          precio,
          cantidad,
        }

        if (typeof item.id === 'string' || typeof item.id === 'number') {
          normalized.id = item.id
        }

        if (typeof item.imagen === 'string') {
          normalized.imagen = item.imagen
        }

        return normalized
      })
      .filter((p: OrderProduct | null): p is OrderProduct => p !== null)

    if (normalizedProducts.length === 0) {
      return NextResponse.json(
        { error: 'Los productos no son válidos' },
        { status: 400 }
      )
    }

    const productsTotal = normalizedProducts.reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0)

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const shippingFee = await getShippingFee()
    const total = Math.round((productsTotal + shippingFee) * 100) / 100

    const shippingInput = typeof shipping === 'object' && shipping !== null
      ? (shipping as Partial<ShippingDetails>)
      : null

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('name, lastname, phone, address')
      .eq('id', user.id)
      .maybeSingle()

    const orderShipping = shippingInput
      ? {
          ...emptyShippingDetails(),
          ...shippingInput,
        }
      : parseShippingDetails({
          address: profile?.address || null,
          phone: profile?.phone || null,
          name: profile?.name || null,
          lastname: profile?.lastname || null,
        })

    const storedProducts = attachShippingToProducts(normalizedProducts, orderShipping)

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { error: 'El total calculado es inválido' },
        { status: 400 }
      )
    }

    // Crear orden
    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          productos: storedProducts,
          total,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error creando la orden' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, order },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error en POST /api/orders:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders
 * Obtener órdenes del usuario autenticado
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error obteniendo órdenes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Error en GET /api/orders:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}