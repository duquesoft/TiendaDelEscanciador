'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

function formatWhatsappDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  if (!digits) return ''

  const inferredPrefixLength = digits.length > 10 ? digits.length - 9 : 2
  const prefixLength = Math.min(Math.max(inferredPrefixLength, 1), 3)
  const prefix = digits.slice(0, prefixLength)
  const rest = digits.slice(prefixLength)

  return rest ? `+${prefix} ${rest}` : `+${prefix}`
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const whatsappDisplay = formatWhatsappDisplay(whatsappNumber)

  useEffect(() => {
    const loadWhatsappNumber = async () => {
      try {
        const response = await fetch('/api/settings/whatsapp')
        const data = await response.json()
        setWhatsappNumber(data.whatsappNumber || '')
      } catch (error) {
        console.error('Error loading WhatsApp number:', error)
      }
    }

    loadWhatsappNumber()
  }, [])

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">www.escanciadorbarato.com</h3>
            <p className="text-sm text-gray-400">Venta online de escanciadores de sidra automáticos de calidad.</p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal" className="text-gray-400 hover:text-white transition">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link href="/terminos-condiciones" className="text-gray-400 hover:text-white transition">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica-cookies" className="text-gray-400 hover:text-white transition">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidad" className="text-gray-400 hover:text-white transition">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/producto" className="text-gray-400 hover:text-white transition">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-gray-400 hover:text-white transition">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/mi-cuenta" className="text-gray-400 hover:text-white transition">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">📧</span>
                <a href="mailto:duquesoft@gmail.com" className="text-gray-400 hover:text-white transition">
                  duquesoft@gmail.com
                </a>
              </li>
              {whatsappNumber && (
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M13.601 2.326A10.153 10.153 0 0 0 3.03 16.077L1.72 22l6.072-1.292a10.153 10.153 0 0 0 5.809 1.807h.004c5.627 0 10.205-4.577 10.205-10.205 0-2.724-1.06-5.28-2.986-7.205A10.132 10.132 0 0 0 13.6 2.326zm0 18.34h-.003a8.49 8.49 0 0 1-4.325-1.183l-.31-.185-3.604.767.77-3.516-.202-.321a8.48 8.48 0 0 1-1.296-4.514c0-4.688 3.814-8.502 8.503-8.502 2.267 0 4.397.882 6 2.485a8.44 8.44 0 0 1 2.488 6.017c0 4.688-3.814 8.502-8.502 8.502zm4.663-6.39c-.255-.127-1.507-.744-1.74-.829-.232-.085-.401-.127-.57.127-.169.255-.655.829-.803 1-.148.169-.296.19-.55.064-.255-.127-1.074-.396-2.046-1.263-.756-.673-1.266-1.503-1.414-1.757-.148-.254-.016-.392.111-.519.114-.113.254-.296.381-.444.127-.148.169-.254.254-.423.085-.169.042-.317-.021-.444-.064-.127-.57-1.376-.782-1.887-.208-.5-.42-.432-.57-.44l-.486-.01c-.169 0-.444.063-.677.317-.232.255-.888.868-.888 2.115s.91 2.45 1.036 2.62c.127.169 1.79 2.734 4.336 3.833.605.261 1.078.417 1.446.533.607.193 1.159.166 1.596.101.487-.073 1.507-.617 1.719-1.212.212-.596.212-1.106.148-1.212-.064-.106-.233-.17-.487-.297z" />
                    </svg>
                  </span>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                    {whatsappDisplay}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-800 mb-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {currentYear} www.escanciadorbarato.com. Todos los derechos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5c-.563-.074-1.396-.146-2.568-.146-2.728 0-4.427 1.663-4.427 4.714v1.432z" />
              </svg>
            </a>
            <a href="#" className="hover:text-white transition" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
