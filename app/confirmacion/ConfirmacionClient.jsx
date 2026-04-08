'use client'

import { useEffect } from 'react'

export default function ConfirmacionClient() {
  useEffect(() => {
    localStorage.removeItem('carrito')
    window.dispatchEvent(new Event('carrito-actualizado'))
  }, [])

  return null
}