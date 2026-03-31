export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar el sitio web www.escancidorbarato.com, aceptas estar vinculado por estos Términos y Condiciones. Si no aceptas alguno de estos términos, no debes acceder ni utilizar el sitio web.
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
