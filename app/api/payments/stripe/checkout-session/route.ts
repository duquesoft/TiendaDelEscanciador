import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrderRecord, updateOrderPaymentState } from '@/lib/order-service'
import { getMaintenanceMode } from '@/lib/maintenance-mode'
import { getSiteUrl } from '@/lib/site-url'
import { getStripeClient } from '@/lib/stripe'
import { parsePaymentMethod } from '@/lib/payment-methods'

export async function POST(request: NextRequest) {
  try {
    if (await getMaintenanceMode()) {
      return NextResponse.json(
        { error: 'La tienda esta en mantenimiento. No se aceptan pedidos nuevos temporalmente.' },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { productos, shipping, paymentMethod } = await request.json()
    const selectedMethod = parsePaymentMethod(paymentMethod)

    if (selectedMethod !== 'card' && selectedMethod !== 'paypal') {
      return NextResponse.json({ error: 'Metodo de pago no soportado en Stripe Checkout' }, { status: 400 })
    }

    const { order, normalizedProducts, shippingFee } = await createOrderRecord({
      userId: user.id,
      productos,
      shipping,
      payment: {
        method: selectedMethod,
        provider: 'stripe',
        status: 'pending',
      },
      status: 'pending',
    })

    const siteUrl = getSiteUrl(request.url)
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      payment_method_types: selectedMethod === 'paypal' ? ['paypal'] : ['card'],
      customer_email: user.email || undefined,
      line_items: [
        ...normalizedProducts.map((product) => ({
          quantity: product.cantidad || 1,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(product.precio * 100),
            product_data: {
              name: product.nombre,
              images: product.imagen ? [`${siteUrl}${product.imagen}`] : undefined,
            },
          },
        })),
        ...(shippingFee > 0
          ? [{
              quantity: 1,
              price_data: {
                currency: 'eur',
                unit_amount: Math.round(shippingFee * 100),
                product_data: {
                  name: 'Gastos de envio',
                },
              },
            }]
          : []),
      ],
      metadata: {
        orderId: order.id,
        userId: user.id,
        paymentMethod: selectedMethod,
      },
      success_url: `${siteUrl}/api/payments/stripe/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?cancelled=1`,
    })

    await updateOrderPaymentState(order.id, {
      method: selectedMethod,
      provider: 'stripe',
      status: 'pending',
      externalPaymentId: session.id,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creando sesion de Stripe:', error)
    return NextResponse.json({ error: 'No se pudo iniciar el pago con Stripe' }, { status: 500 })
  }
}