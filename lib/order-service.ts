import { createClient as createServiceClient } from '@supabase/supabase-js'
import {
  attachOrderMetaToProducts,
  getOrderPaymentInfo,
  type StoredOrderProduct,
  withOrderPaymentInfo,
} from '@/lib/order-data'
import { COD_SURCHARGE, normalizePaymentInfo, type StoredPaymentInfo } from '@/lib/payment-methods'
import { emptyShippingDetails, parseShippingDetails, type ShippingDetails } from '@/lib/shipping'
import { DEFAULT_SHIPPING_FEE, parseShippingFeeRecord } from '@/lib/shipping-fee'

interface OrderProductInput {
  id?: number | string
  nombre: string
  precio: number
  cantidad?: number
  imagen?: string
}

interface CreateOrderRecordInput {
  userId: string
  productos: unknown
  shipping?: unknown
  payment?: Partial<StoredPaymentInfo>
  status?: string
}

function createAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getShippingFee() {
  const supabaseAdmin = createAdminClient()

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

export function normalizeOrderProducts(productos: unknown): StoredOrderProduct[] {
  if (!Array.isArray(productos)) {
    return []
  }

  return productos
    .map((p: unknown) => {
      if (!p || typeof p !== 'object') {
        return null
      }

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

      const normalized: OrderProductInput = {
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
    .filter((p: OrderProductInput | null): p is StoredOrderProduct => p !== null)
}

async function resolveShippingDetails(userId: string, shipping: unknown): Promise<ShippingDetails> {
  const shippingInput = typeof shipping === 'object' && shipping !== null
    ? (shipping as Partial<ShippingDetails>)
    : null

  if (shippingInput) {
    return {
      ...emptyShippingDetails(),
      ...shippingInput,
    }
  }

  const supabaseAdmin = createAdminClient()
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('name, lastname, phone, address')
    .eq('id', userId)
    .maybeSingle()

  return parseShippingDetails({
    address: profile?.address || null,
    phone: profile?.phone || null,
    name: profile?.name || null,
    lastname: profile?.lastname || null,
  })
}

export async function createOrderRecord(input: CreateOrderRecordInput) {
  const normalizedProducts = normalizeOrderProducts(input.productos)

  if (normalizedProducts.length === 0) {
    throw new Error('Los productos no son validos')
  }

  const productsTotal = normalizedProducts.reduce(
    (acc, item) => acc + item.precio * (item.cantidad || 1),
    0
  )

  const shippingFee = await getShippingFee()
  const payment = normalizePaymentInfo(input.payment)
  const codSurcharge = payment.method === 'cod' ? COD_SURCHARGE : 0
  const total = Math.round((productsTotal + shippingFee + codSurcharge) * 100) / 100

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('El total calculado es invalido')
  }

  const shipping = await resolveShippingDetails(input.userId, input.shipping)
  const storedProducts = attachOrderMetaToProducts(normalizedProducts, {
    shipping,
    payment,
  })

  const supabaseAdmin = createAdminClient()
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert([
      {
        user_id: input.userId,
        productos: storedProducts,
        total,
        status: input.status || (payment.status === 'paid' ? 'paid' : 'pending'),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating order:', error)
    throw new Error('Error creando la orden')
  }

  return {
    order,
    normalizedProducts,
    shipping,
    shippingFee,
    total,
    payment,
  }
}

export async function updateOrderPaymentState(
  orderId: string,
  paymentUpdate: Partial<StoredPaymentInfo>,
  status?: string
) {
  const supabaseAdmin = createAdminClient()
  const { data: existingOrder, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, productos, status')
    .eq('id', orderId)
    .single()

  if (orderError || !existingOrder) {
    throw new Error('Orden no encontrada')
  }

  const currentPayment = getOrderPaymentInfo(existingOrder.productos) || undefined
  const nextPayment = normalizePaymentInfo({
    ...currentPayment,
    ...paymentUpdate,
  })
  const transitionedToPaid = currentPayment?.status !== 'paid' && nextPayment.status === 'paid'

  const nextStatus = status || (nextPayment.status === 'paid' ? 'paid' : existingOrder.status)
  const productos = withOrderPaymentInfo(existingOrder.productos, nextPayment)

  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      productos,
      status: nextStatus,
    })
    .eq('id', orderId)
    .select()
    .single()

  if (updateError) {
    console.error('Supabase error updating order payment:', updateError)
    throw new Error('No se pudo actualizar el estado del pago')
  }

  return {
    order: updatedOrder,
    transitionedToPaid,
  }
}