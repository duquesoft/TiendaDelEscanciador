export const DEFAULT_SHIPPING_FEE = 0
export const MAX_SHIPPING_FEE = 10000

export function normalizeShippingFee(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_SHIPPING_FEE
  }

  const rounded = Math.round(parsed * 100) / 100

  if (rounded < 0) {
    return 0
  }

  if (rounded > MAX_SHIPPING_FEE) {
    return MAX_SHIPPING_FEE
  }

  return rounded
}

export function parseShippingFeeRecord(value: unknown): number {
  if (value && typeof value === 'object' && 'value' in value) {
    return normalizeShippingFee((value as { value?: unknown }).value)
  }

  return normalizeShippingFee(value)
}
