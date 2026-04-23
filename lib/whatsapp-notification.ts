import { createClient as createServiceClient } from '@supabase/supabase-js'
import { formatOrderNumber } from '@/lib/order-number'

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

async function getAdminWhatsappNumber(): Promise<string | null> {
  const supabaseAdmin = createAdminClient()

  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .select('value')
    .eq('key', 'whatsapp_number')
    .maybeSingle()

  if (error || !data?.value) {
    console.error('Error obteniendo número de WhatsApp del admin:', error)
    return null
  }

  return typeof data.value === 'string' ? data.value.trim() : null
}

async function getOrderDetails(orderId: string): Promise<{ total: number } | null> {
  const supabaseAdmin = createAdminClient()

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('total')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    console.error('Error obteniendo detalles de la orden:', error)
    return null
  }

  return { total: order.total }
}

export async function sendOrderWhatsappNotification(orderId: string) {
  const callmebotApiKey = process.env.CALLMEBOT_API_KEY?.trim()

  if (!callmebotApiKey) {
    console.warn('Notificación WhatsApp omitida: falta CALLMEBOT_API_KEY')
    return { sent: false, skipped: true }
  }

  const adminNumber = await getAdminWhatsappNumber()
  if (!adminNumber) {
    console.warn('Notificación WhatsApp omitida: no hay número de WhatsApp configurado para el admin')
    return { sent: false, skipped: true }
  }

  const orderDetails = await getOrderDetails(orderId)
  if (!orderDetails) {
    return { sent: false, skipped: true }
  }

  const phone = adminNumber.replace(/\D/g, '') // Limpiar el número
  const phoneWithPlus = phone.startsWith('+') ? phone : `+${phone}` // Agregar + si no lo tiene
  const text = encodeURIComponent(`Nuevo pedido recibido: ${formatOrderNumber(orderId)}, Total: ${formatCurrency(orderDetails.total)}`)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneWithPlus}&text=${text}&apikey=${callmebotApiKey}`

  try {
    const response = await fetch(url)
    if (response.ok) {
      console.log('Mensaje WhatsApp enviado via CallMeBot')
      return { sent: true }
    } else {
      console.error('Error enviando mensaje WhatsApp:', response.statusText)
      return { sent: false, error: response.statusText }
    }
  } catch (error) {
    console.error('Error enviando mensaje WhatsApp:', error)
    return { sent: false, error }
  }
}