import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Web en mantenimiento',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function MantenimientoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 md:p-10 text-center">
        <p className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-4">
          Modo mantenimiento
        </p>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Estamos realizando mejoras en la tienda
        </h1>

        <p className="text-gray-600 text-base md:text-lg mb-8">
          En este momento no se pueden realizar pedidos nuevos. Vuelve a intentarlo en un rato.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!user && (
            <Link
              href="/login"
              className="px-5 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Iniciar sesión
            </Link>
          )}
          <Link
            href="/mi-cuenta"
            className="px-5 py-3 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Ver mi cuenta y pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}