import { normalizePaymentInfo, type PaymentMethod, type StoredPaymentInfo } from '@/lib/payment-methods'
import { emptyShippingDetails, type ShippingDetails } from '@/lib/shipping'

export interface StoredOrderProduct {
  id?: string | number
  nombre: string
  precio: number
  cantidad?: number
  imagen?: string
}

interface StoredOrderShippingMeta {
  __meta: 'shipping'
  shipping: ShippingDetails
}

interface StoredOrderPaymentMeta {
  __meta: 'payment'
  payment: StoredPaymentInfo
}

export interface StoredOrderShipmentInfo {
  carrier: string
  trackingNumber: string
  trackingUrl: string
  updatedAt: string
}

interface StoredOrderShipmentMeta {
  __meta: 'shipment'
  shipment: StoredOrderShipmentInfo
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isShippingMeta(value: unknown): value is StoredOrderShippingMeta {
  return isObject(value) && value.__meta === 'shipping' && isObject(value.shipping)
}

function isPaymentMeta(value: unknown): value is StoredOrderPaymentMeta {
  return isObject(value) && value.__meta === 'payment' && isObject(value.payment)
}

function isShipmentMeta(value: unknown): value is StoredOrderShipmentMeta {
  return isObject(value) && value.__meta === 'shipment' && isObject(value.shipment)
}

export function hasShippingData(shipping: ShippingDetails | null | undefined): boolean {
  if (!shipping) {
    return false
  }

  return Object.values(shipping).some((value) => typeof value === 'string' && value.trim().length > 0)
}

export function attachOrderMetaToProducts(
  products: StoredOrderProduct[],
  options?: {
    shipping?: ShippingDetails | null
    payment?: Partial<StoredPaymentInfo> | null
  }
): Array<StoredOrderProduct | StoredOrderShippingMeta | StoredOrderPaymentMeta> {
  const metadata: Array<StoredOrderShippingMeta | StoredOrderPaymentMeta> = []

  if (hasShippingData(options?.shipping)) {
    metadata.push({
      __meta: 'shipping',
      shipping: {
        ...emptyShippingDetails(),
        ...options?.shipping,
      },
    })
  }

  if (options?.payment) {
    metadata.push({
      __meta: 'payment',
      payment: normalizePaymentInfo(options.payment),
    })
  }

  if (metadata.length === 0) {
    return products
  }

  return [...products, ...metadata]
}

export function getOrderProducts(productos: unknown): StoredOrderProduct[] {
  if (!Array.isArray(productos)) {
    return []
  }

  return productos
    .filter((item) => !isShippingMeta(item) && !isPaymentMeta(item) && !isShipmentMeta(item))
    .map((item) => {
      if (!isObject(item)) {
        return null
      }

      const nombre = typeof item.nombre === 'string' ? item.nombre.trim() : ''
      const precio = Number(item.precio)
      const cantidad = Number(item.cantidad)

      if (!nombre || !Number.isFinite(precio)) {
        return null
      }

      const normalized: StoredOrderProduct = {
        nombre,
        precio,
      }

      if (typeof item.id === 'string' || typeof item.id === 'number') {
        normalized.id = item.id
      }

      if (typeof item.imagen === 'string') {
        normalized.imagen = item.imagen
      }

      if (Number.isFinite(cantidad) && cantidad > 0) {
        normalized.cantidad = Math.floor(cantidad)
      }

      return normalized
    })
    .filter((item): item is StoredOrderProduct => item !== null)
}

export function getOrderShipping(productos: unknown): ShippingDetails | null {
  if (!Array.isArray(productos)) {
    return null
  }

  const metaItem = productos.find((item) => isShippingMeta(item))

  if (!metaItem) {
    return null
  }

  return {
    ...emptyShippingDetails(),
    ...metaItem.shipping,
  }
}

export function getOrderPaymentMethod(productos: unknown): PaymentMethod | null {
  const paymentInfo = getOrderPaymentInfo(productos)

  return paymentInfo?.method || null
}

export function getOrderPaymentInfo(productos: unknown): StoredPaymentInfo | null {
  if (!Array.isArray(productos)) {
    return null
  }

  const metaItem = productos.find((item) => isPaymentMeta(item))

  if (!metaItem) {
    return null
  }

  return normalizePaymentInfo(metaItem.payment)
}

export function withOrderPaymentInfo(
  productos: unknown,
  payment: Partial<StoredPaymentInfo> | null | undefined
): Array<StoredOrderProduct | StoredOrderShippingMeta | StoredOrderPaymentMeta> {
  const normalizedProducts = Array.isArray(productos) ? productos.filter((item) => !isPaymentMeta(item)) : []

  if (!payment) {
    return normalizedProducts.filter(
      (item): item is StoredOrderProduct | StoredOrderShippingMeta => isObject(item)
    )
  }

  return [
    ...normalizedProducts.filter(
      (item): item is StoredOrderProduct | StoredOrderShippingMeta => isObject(item)
    ),
    {
      __meta: 'payment',
      payment: normalizePaymentInfo(payment),
    },
  ]
}

export function getOrderShipmentInfo(productos: unknown): StoredOrderShipmentInfo | null {
  if (!Array.isArray(productos)) {
    return null
  }

  const metaItem = productos.find((item) => isShipmentMeta(item))

  if (!metaItem) {
    return null
  }

  return {
    carrier: String(metaItem.shipment.carrier || '').trim(),
    trackingNumber: String(metaItem.shipment.trackingNumber || '').trim(),
    trackingUrl: String(metaItem.shipment.trackingUrl || '').trim(),
    updatedAt: String(metaItem.shipment.updatedAt || ''),
  }
}

export function withOrderShipmentInfo(
  productos: unknown,
  shipment: Omit<StoredOrderShipmentInfo, 'updatedAt'>
): Array<StoredOrderProduct | StoredOrderShippingMeta | StoredOrderPaymentMeta | StoredOrderShipmentMeta> {
  const normalizedProducts = Array.isArray(productos) ? productos.filter((item) => !isShipmentMeta(item)) : []

  return [
    ...normalizedProducts.filter(
      (item): item is StoredOrderProduct | StoredOrderShippingMeta | StoredOrderPaymentMeta => isObject(item)
    ),
    {
      __meta: 'shipment',
      shipment: {
        carrier: shipment.carrier.trim(),
        trackingNumber: shipment.trackingNumber.trim(),
        trackingUrl: shipment.trackingUrl.trim(),
        updatedAt: new Date().toISOString(),
      },
    },
  ]
}
