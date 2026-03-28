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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isShippingMeta(value: unknown): value is StoredOrderShippingMeta {
  return isObject(value) && value.__meta === 'shipping' && isObject(value.shipping)
}

export function hasShippingData(shipping: ShippingDetails | null | undefined): boolean {
  if (!shipping) {
    return false
  }

  return Object.values(shipping).some((value) => typeof value === 'string' && value.trim().length > 0)
}

export function attachShippingToProducts(
  products: StoredOrderProduct[],
  shipping: ShippingDetails | null | undefined
): Array<StoredOrderProduct | StoredOrderShippingMeta> {
  if (!hasShippingData(shipping)) {
    return products
  }

  return [
    ...products,
    {
      __meta: 'shipping',
      shipping: {
        ...emptyShippingDetails(),
        ...shipping,
      },
    },
  ]
}

export function getOrderProducts(productos: unknown): StoredOrderProduct[] {
  if (!Array.isArray(productos)) {
    return []
  }

  return productos
    .filter((item) => !isShippingMeta(item))
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
