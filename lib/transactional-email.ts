import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getOrderShipmentInfo } from '@/lib/order-data'
import { getOrderPaymentInfo, getOrderProducts } from '@/lib/order-data'
import { formatOrderNumber } from '@/lib/order-number'

type TransactionalEmailType = 'order-created' | 'order-paid' | 'order-shipped'

interface OrderRecord {
  id: string
  user_id: string
  total: number
  status: string
  productos: unknown
}

interface UserRecord {
  email: string | null
  name: string | null
  lastname: string | null
}

function createAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function getOrderAndUser(orderId: string): Promise<{ order: OrderRecord; user: UserRecord } | null> {
  const supabaseAdmin = createAdminClient()

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, total, status, productos')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    console.error('No se pudo cargar la orden para email:', orderError)
    return null
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('email, name, lastname')
    .eq('id', order.user_id)
    .maybeSingle()

  if (userError || !user?.email) {
    console.error('No se pudo cargar el email del usuario para la orden:', userError)
    return null
  }

  return {
    order: order as OrderRecord,
    user: user as UserRecord,
  }
}

function buildEmailContent(params: {
  type: TransactionalEmailType
  orderId: string
  total: number
  customerName: string
  paymentLabel: string
  products: Array<{ nombre: string; cantidad: number; precio: number }>
  shipment?: {
    carrier: string
    trackingNumber: string
    trackingUrl: string
  } | null
}) {
  const greeting = params.customerName
    ? `Hola ${params.customerName},`
    : 'Hola,'
  const displayOrderNumber = formatOrderNumber(params.orderId)

  const subject = params.type === 'order-paid'
    ? `Pago confirmado - Pedido ${displayOrderNumber}`
    : params.type === 'order-shipped'
      ? `Tu pedido ${displayOrderNumber} ya ha sido enviado`
    : `Pedido recibido - ${displayOrderNumber}`

  const intro = params.type === 'order-paid'
    ? 'Hemos confirmado tu pago. Gracias por tu compra.'
    : params.type === 'order-shipped'
      ? 'Tu pedido ya ha salido de nuestro almacén.'
    : 'Hemos recibido tu pedido correctamente y lo estamos preparando.'

  const shipmentInfoHtml = params.type === 'order-shipped' && params.shipment
    ? `
      <p><strong>Agencia:</strong> ${escapeHtml(params.shipment.carrier)}</p>
      <p><strong>Numero de seguimiento:</strong> ${escapeHtml(params.shipment.trackingNumber)}</p>
      <p><strong>Seguimiento:</strong> <a href="${escapeHtml(params.shipment.trackingUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(params.shipment.trackingUrl)}</a></p>
    `
    : ''

  const shipmentInfoText = params.type === 'order-shipped' && params.shipment
    ? [
        `Agencia: ${params.shipment.carrier}`,
        `Numero de seguimiento: ${params.shipment.trackingNumber}`,
        `Seguimiento: ${params.shipment.trackingUrl}`,
      ].join('\n')
    : ''

  const productItemsHtml = params.products
    .map((item) => {
      const lineTotal = formatCurrency(item.precio * item.cantidad)
      return `<li>${escapeHtml(item.nombre)} x${item.cantidad} - ${lineTotal}</li>`
    })
    .join('')

  const productItemsText = params.products
    .map((item) => `- ${item.nombre} x${item.cantidad} - ${formatCurrency(item.precio * item.cantidad)}`)
    .join('\n')

  const htmlContent = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;">
      <p>${escapeHtml(greeting)}</p>
      <p>${escapeHtml(intro)}</p>
      <p><strong>Pedido:</strong> ${escapeHtml(displayOrderNumber)}</p>
      <p><strong>Metodo de pago:</strong> ${escapeHtml(params.paymentLabel)}</p>
      ${shipmentInfoHtml}
      <p><strong>Productos:</strong></p>
      <ul>${productItemsHtml}</ul>
      <p><strong>Total:</strong> ${escapeHtml(formatCurrency(params.total))}</p>
      <p>Si tienes cualquier duda, responde a este email.</p>
    </div>
  `

  const textContent = [
    greeting,
    '',
    intro,
    '',
    `Pedido: ${displayOrderNumber}`,
    `Metodo de pago: ${params.paymentLabel}`,
    ...(shipmentInfoText ? [shipmentInfoText] : []),
    'Productos:',
    productItemsText,
    '',
    `Total: ${formatCurrency(params.total)}`,
    '',
    'Si tienes cualquier duda, responde a este email.',
  ].join('\n')

  return {
    subject,
    htmlContent,
    textContent,
  }
}

function getPaymentLabel(method: string | null): string {
  if (method === 'card') return 'Tarjeta'
  if (method === 'paypal') return 'PayPal'
  if (method === 'cod') return 'Contra reembolso'
  return 'No especificado'
}

export async function sendOrderTransactionalEmail(orderId: string, type: TransactionalEmailType) {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim()
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim()
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Tienda del Escanciador'

  if (!brevoApiKey || !senderEmail) {
    console.warn('Email transaccional omitido: faltan BREVO_API_KEY o BREVO_SENDER_EMAIL')
    return { sent: false, skipped: true }
  }

  const data = await getOrderAndUser(orderId)
  if (!data) {
    return { sent: false, skipped: true }
  }

  const products = getOrderProducts(data.order.productos).map((product) => ({
    nombre: product.nombre,
    cantidad: product.cantidad || 1,
    precio: product.precio,
  }))

  if (products.length === 0) {
    return { sent: false, skipped: true }
  }

  const paymentInfo = getOrderPaymentInfo(data.order.productos)
  const shipmentInfo = getOrderShipmentInfo(data.order.productos)
  const paymentLabel = getPaymentLabel(paymentInfo?.method || null)
  const customerName = [data.user.name || '', data.user.lastname || ''].join(' ').trim()

  if (type === 'order-shipped' && !shipmentInfo) {
    return { sent: false, skipped: true }
  }

  const content = buildEmailContent({
    type,
    orderId: data.order.id,
    total: Number(data.order.total) || 0,
    customerName,
    paymentLabel,
    products,
    shipment: shipmentInfo,
  })

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: data.user.email,
            name: customerName || undefined,
          },
        ],
        subject: content.subject,
        htmlContent: content.htmlContent,
        textContent: content.textContent,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error enviando email transaccional con Brevo:', errorText)
      return { sent: false, skipped: false }
    }

    return { sent: true, skipped: false }
  } catch (error) {
    console.error('Error inesperado enviando email transaccional:', error)
    return { sent: false, skipped: false }
  }
}