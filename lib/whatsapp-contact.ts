export const WHATSAPP_CONTACT_UPDATED_EVENT = 'whatsapp-contact-updated'

export type WhatsappContactUpdatedDetail = {
  whatsappNumber: string
}

export function formatWhatsappDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  if (!digits) return ''

  const inferredPrefixLength = digits.length > 10 ? digits.length - 9 : 2
  const prefixLength = Math.min(Math.max(inferredPrefixLength, 1), 3)
  const prefix = digits.slice(0, prefixLength)
  const rest = digits.slice(prefixLength)

  return rest ? `+${prefix} ${rest}` : `+${prefix}`
}

export function dispatchWhatsappContactUpdated(whatsappNumber: string) {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent<WhatsappContactUpdatedDetail>(WHATSAPP_CONTACT_UPDATED_EVENT, {
      detail: { whatsappNumber },
    })
  )
}

export function subscribeWhatsappContactUpdated(listener: (whatsappNumber: string) => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleUpdate = (event: Event) => {
    const customEvent = event as CustomEvent<WhatsappContactUpdatedDetail>
    listener(customEvent.detail?.whatsappNumber ?? '')
  }

  window.addEventListener(WHATSAPP_CONTACT_UPDATED_EVENT, handleUpdate)

  return () => {
    window.removeEventListener(WHATSAPP_CONTACT_UPDATED_EVENT, handleUpdate)
  }
}