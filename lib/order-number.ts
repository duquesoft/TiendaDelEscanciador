export function formatOrderNumber(orderId: string): string {
  const normalized = String(orderId || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()

  if (!normalized) {
    return 'PEDIDO'
  }

  return `PED-${normalized.slice(0, 8)}`
}
