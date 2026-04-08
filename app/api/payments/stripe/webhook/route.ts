import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/stripe'
import { updateOrderPaymentState } from '@/lib/order-service'
import { sendOrderTransactionalEmail } from '@/lib/transactional-email'

function getStripeSessionMethod(raw: string | undefined): 'card' | 'paypal' {
  return raw === 'paypal' ? 'paypal' : 'card'
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook de Stripe no configurado' }, { status: 400 })
  }

  try {
    const payload = await request.text()
    const stripe = getStripeClient()
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId
      const method = getStripeSessionMethod(session.metadata?.paymentMethod)

      if (orderId && session.payment_status === 'paid') {
        const paymentUpdate = await updateOrderPaymentState(orderId, {
          method,
          provider: 'stripe',
          status: 'paid',
          externalPaymentId: session.id,
        }, 'paid')

        if (paymentUpdate.transitionedToPaid) {
          await sendOrderTransactionalEmail(orderId, 'order-paid')
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId
      const method = getStripeSessionMethod(session.metadata?.paymentMethod)

      if (orderId) {
        await updateOrderPaymentState(orderId, {
          method,
          provider: 'stripe',
          status: 'failed',
          externalPaymentId: session.id,
        }, 'cancelled')
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Firma de Stripe invalida' }, { status: 400 })
  }
}