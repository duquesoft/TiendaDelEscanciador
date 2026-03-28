export interface ShippingDetails {
  name: string
  lastname: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  province: string
  country: string
  phone: string
}

const SHIPPING_PREFIX = 'shipping:v1:'

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function emptyShippingDetails(): ShippingDetails {
  return {
    name: '',
    lastname: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: '',
    province: '',
    country: '',
    phone: '',
  }
}

export function parseShippingDetails(input: {
  address?: string | null
  phone?: string | null
  name?: string | null
  lastname?: string | null
}): ShippingDetails {
  const fallbackName = [input.name || '', input.lastname || ''].join(' ').trim()
  const fallbackPhone = input.phone || ''
  const address = input.address || ''

  if (address.startsWith(SHIPPING_PREFIX)) {
    try {
      const parsed = JSON.parse(address.slice(SHIPPING_PREFIX.length)) as Record<string, unknown>
      const fullName = asString(parsed.fullName)
      const parsedName = asString(parsed.name)
      const parsedLastname = asString(parsed.lastname)
      const fallbackParts = fullName ? fullName.split(/\s+/).filter(Boolean) : []

      return {
        name: parsedName || fallbackParts[0] || input.name || '',
        lastname: parsedLastname || fallbackParts.slice(1).join(' ') || input.lastname || '',
        addressLine1: asString(parsed.addressLine1),
        addressLine2: asString(parsed.addressLine2),
        postalCode: asString(parsed.postalCode),
        city: asString(parsed.city),
        province: asString(parsed.province),
        country: asString(parsed.country),
        phone: asString(parsed.phone) || fallbackPhone,
      }
    } catch {
      return {
        ...emptyShippingDetails(),
        name: input.name || '',
        lastname: input.lastname || '',
        addressLine1: address,
        phone: fallbackPhone,
      }
    }
  }

  return {
    ...emptyShippingDetails(),
    name: input.name || '',
    lastname: input.lastname || '',
    addressLine1: address,
    phone: fallbackPhone,
  }
}

export function serializeShippingDetails(details: ShippingDetails): string | null {
  const normalized: ShippingDetails = {
    name: asString(details.name),
    lastname: asString(details.lastname),
    addressLine1: asString(details.addressLine1),
    addressLine2: asString(details.addressLine2),
    postalCode: asString(details.postalCode),
    city: asString(details.city),
    province: asString(details.province),
    country: asString(details.country),
    phone: asString(details.phone),
  }

  const hasAnyValue = Object.values(normalized).some(Boolean)

  if (!hasAnyValue) {
    return null
  }

  return `${SHIPPING_PREFIX}${JSON.stringify(normalized)}`
}

export function formatShippingRecipient(details: ShippingDetails): string {
  return [details.name, details.lastname].filter(Boolean).join(' ')
}

export function formatShippingAddress(input: {
  address?: string | null
  phone?: string | null
  name?: string | null
  lastname?: string | null
}): string {
  const details = parseShippingDetails(input)
  const locality = [details.postalCode, details.city].filter(Boolean).join(' ')

  return [
    details.addressLine1,
    details.addressLine2,
    locality,
    details.province,
    details.country,
  ]
    .filter(Boolean)
    .join(', ')
}
