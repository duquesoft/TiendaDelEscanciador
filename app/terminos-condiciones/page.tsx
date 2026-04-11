import React from "react";
export default function TerminosCondicionesPage() {
  return (
    <main className="flex justify-center items-start min-h-[60vh] py-10 px-2 bg-transparent">
      <section className="bg-white/80 rounded-xl shadow-lg border border-green-200 max-w-2xl w-full p-8 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 border-b border-green-300 pb-2">Términos y Condiciones</h1>
        <div className="space-y-6 text-gray-800 text-base md:text-lg">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar el sitio web www.TiendaDelEscanciador.com, aceptas estar vinculado por estos Términos y Condiciones. Si no aceptas alguno de estos términos, no debes acceder ni utilizar el sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Uso del Sitio Web</h2>
            <p className="mb-4">El usuario se compromete a:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Usar el sitio web solo para propósitos legales y de manera ética</li>
              <li>No acceder a datos ajenos sin autorización</li>
              <li>No reproducir, distribuir o transmitir contenidos sin permiso</li>
              <li>No interferir con el funcionamiento del sitio web</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Productos y Precios</h2>
            <p className="mb-4">
              Los precios, disponibilidad y descripciones de productos pueden cambiar en cualquier momento sin previo aviso. Nos reservamos el derecho a rechazar o cancelar cualquier pedido.
            </p>
            <p>
              Las imágenes de productos son ilustrativas. El producto recibido puede variar ligeramente en diseño o especificaciones técnicas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Proceso de Compra</h2>
            <p className="mb-4">
              Al realizar una compra, reconoces que estás haciendo una oferta vinculante de compra. Nos reservamos el derecho de aceptar o rechazar cualquier pedido.
            </p>
            <p>
              El cliente es responsable de la exactitud de los datos proporcionados durante la compra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Devoluciones y Reembolsos</h2>
            <p className="mb-4">
              Los clientes pueden solicitar devoluciones dentro de 30 días desde la recepción del producto, siempre que el artículo esté en condiciones originales no utilizadas.
            </p>
            <p>
              Para más detalles sobre devoluciones, contacta con nuestro equipo de atención al cliente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitación de Responsabilidad</h2>
            <p>
              En ningún caso seremos responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso de nuestros productos o servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modificación de Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación en el sitio web.
            </p>
          </section>

          <div className="bg-gray-100 border-l-4 border-blue-500 p-4 mt-8">
            <p className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
