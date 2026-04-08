import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { updateOrderPaymentState } from '@/lib/order-service'
import { getSiteUrl } from '@/lib/site-url'
import { sendOrderTransactionalEmail } from '@/lib/transactional-email'

function getStripeSessionMethod(raw: string | undefined): 'card' | 'paypal' {
  return raw === 'paypal' ? 'paypal' : 'card'
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.redirect(`${getSiteUrl(request.url)}/checkout?error=stripe-session`)
  }

  try {
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const orderId = session.metadata?.orderId
    const method = getStripeSessionMethod(session.metadata?.paymentMethod)

    if (!orderId || session.payment_status !== 'paid') {
      return NextResponse.redirect(`${getSiteUrl(request.url)}/checkout?error=stripe-payment`)
    }

    const paymentUpdate = await updateOrderPaymentState(orderId, {
      method,
      provider: 'stripe',
      status: 'paid',
      externalPaymentId: session.id,
    }, 'paid')

    if (paymentUpdate.transitionedToPaid) {
      await sendOrderTransactionalEmail(orderId, 'order-paid')
    }

    return NextResponse.redirect(`${getSiteUrl(request.url)}/confirmacion?payment=${method}&provider=stripe&status=paid`)
  } catch (error) {
    console.error('Error confirmando retorno de Stripe:', error)
    return NextResponse.redirect(`${getSiteUrl(request.url)}/checkout?error=stripe-confirm`)
  }
}