export const PAYMENT_METHODS = ['card', 'paypal', 'cod'] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export type PaymentProvider = 'stripe' | 'paypal' | 'cod'
export type PaymentTransactionStatus = 'pending' | 'paid' | 'failed'

export const COD_SURCHARGE = 3.9

export interface StoredPaymentInfo {
  method: PaymentMethod
  provider: PaymentProvider
  status: PaymentTransactionStatus
  externalPaymentId: string | null
}

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'card'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Tarjeta Visa/Mastercard',
  paypal: 'PayPal',
  cod: 'Contra reembolso',
}

export const PAYMENT_METHOD_DESCRIPTIONS: Record<PaymentMethod, string> = {
  card: 'Pago con tarjeta de credito Visa o Mastercard.',
  paypal: 'Pago seguro con tu cuenta PayPal.',
  cod: 'Pagas al recibir el pedido.',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentTransactionStatus, string> = {
  pending: 'Pendiente de pago',
  paid: 'Pago completado',
  failed: 'Pago fallido',
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && PAYMENT_METHODS.includes(value as PaymentMethod)
}

export function parsePaymentMethod(value: unknown): PaymentMethod {
  return isPaymentMethod(value) ? value : DEFAULT_PAYMENT_METHOD
}

export function defaultPaymentProviderForMethod(method: PaymentMethod): PaymentProvider {
  if (method === 'card') {
    return 'stripe'
  }

  if (method === 'paypal') {
    return 'paypal'
  }

  return 'cod'
}

export function isPaymentProvider(value: unknown): value is PaymentProvider {
  return value === 'stripe' || value === 'paypal' || value === 'cod'
}

export function parsePaymentProvider(value: unknown, method: PaymentMethod): PaymentProvider {
  return isPaymentProvider(value) ? value : defaultPaymentProviderForMethod(method)
}

export function isPaymentTransactionStatus(value: unknown): value is PaymentTransactionStatus {
  return value === 'pending' || value === 'paid' || value === 'failed'
}

export function parsePaymentTransactionStatus(value: unknown): PaymentTransactionStatus {
  return isPaymentTransactionStatus(value) ? value : 'pending'
}

export function normalizePaymentInfo(value: Partial<StoredPaymentInfo> & { method?: unknown } = {}): StoredPaymentInfo {
  const method = parsePaymentMethod(value.method)

  return {
    method,
    provider: parsePaymentProvider(value.provider, method),
    status: parsePaymentTransactionStatus(value.status),
    externalPaymentId: typeof value.externalPaymentId === 'string' && value.externalPaymentId.trim()
      ? value.externalPaymentId.trim()
      : null,
  }
}

export function getPaymentMethodLabel(value: unknown): string {
  const method = typeof value === 'object' && value !== null && 'method' in value
    ? (value as { method?: unknown }).method
    : value

  if (!isPaymentMethod(method)) {
    return 'No especificado'
  }

  return PAYMENT_METHOD_LABELS[method]
}

export function getPaymentStatusLabel(value: unknown): string {
  if (!isPaymentTransactionStatus(value)) {
    return 'No disponible'
  }

  return PAYMENT_STATUS_LABELS[value]
}