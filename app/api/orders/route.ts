import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createOrderRecord } from '@/lib/order-service'
import { parsePaymentMethod } from '@/lib/payment-methods'
import { getMaintenanceMode } from '@/lib/maintenance-mode'
import { sendOrderTransactionalEmail } from '@/lib/transactional-email'
import { sendOrderWhatsappNotification } from '@/lib/whatsapp-notification'

/**
 * POST /api/orders
 * Crear una nueva orden con múltiples productos
 */
export async function POST(req: NextRequest) {
  try {
    const maintenanceMode = await getMaintenanceMode()

    if (maintenanceMode) {
      return NextResponse.json(
        { error: 'La tienda está en mantenimiento. No se aceptan pedidos nuevos temporalmente.' },
        { status: 503 }
      )
    }

    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { productos, shipping, paymentMethod } = await req.json()
    const normalizedPaymentMethod = parsePaymentMethod(paymentMethod)

    if (normalizedPaymentMethod !== 'cod') {
      return NextResponse.json(
        { error: 'Los pagos con tarjeta y PayPal deben pasar por su pasarela correspondiente.' },
        { status: 400 }
      )
    }

    // Validación
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: 'La lista de productos es inválida' },
        { status: 400 }
      )
    }

    const { order } = await createOrderRecord({
      userId: user.id,
      productos,
      shipping,
      payment: {
        method: normalizedPaymentMethod,
        provider: 'cod',
        status: 'pending',
      },
      status: 'pending',
    })

    await sendOrderTransactionalEmail(order.id, 'order-created')
    await sendOrderWhatsappNotification(order.id)

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