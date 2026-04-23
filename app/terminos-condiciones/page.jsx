import React from 'react'

export default function TerminosCondicionesPage() {
  return (
    <main className="flex justify-center items-start min-h-[60vh] py-10 px-2 bg-transparent">
      <section className="bg-white/80 rounded-xl shadow-lg border border-green-200 max-w-2xl w-full p-8 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 border-b border-green-300 pb-2">Términos y Condiciones</h1>

        <div className="space-y-6 text-gray-800 text-base md:text-lg">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar el sitio web www.TiendaDelEscanciador.com, aceptas estar vinculado por estos Términos y Condiciones. Si no aceptas alguno de estos términos, no debes acceder ni utilizar el sitio web.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Uso del Sitio Web</h2>
            <p className="mb-4">El usuario se compromete a:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Usar el sitio web solo para propósitos legales y de manera ética</li>
              <li>No acceder a datos ajenos sin autorización</li>
              <li>No reproducir, distribuir o transmitir contenidos sin permiso</li>
              <li>No interferir con el funcionamiento del sitio web</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Productos y Precios</h2>
            <p className="mb-4">
              Los precios, disponibilidad y descripciones de productos pueden cambiar en cualquier momento sin previo aviso. Nos reservamos el derecho a rechazar o cancelar cualquier pedido.
            </p>
            <p>
              Las imágenes de productos son ilustrativas. El producto recibido puede variar ligeramente en diseño o especificaciones técnicas.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Proceso de Compra</h2>
            <p className="mb-4">
              Al realizar una compra, reconoces que estás haciendo una oferta vinculante de compra. Nos reservamos el derecho de aceptar o rechazar cualquier pedido.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
