'use client'

import { useEffect } from 'react'

export default function ConfirmacionClient({ orderId }) {
  useEffect(() => {
    // Vaciar carrito local
    try {
      localStorage.removeItem('carrito')
      window.dispatchEvent(new Event('carrito-actualizado'))
    } catch (err) {
      // noop
    }
  }, [])
  return null
}