export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Aviso Legal</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Identificación del Responsable</h2>
            <p className="mb-2">Nombre: Tienda del Escanciador (www.TiendaDelEscanciador.com)</p>
            <p className="mb-2">Domicilio: [Inserta tu dirección aquí]</p>
            <p className="mb-2">Correo electrónico: contacto@tiendadelescanciador.com</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Objeto y Uso del Sitio Web</h2>
            <p>
              El presente sitio web tiene como finalidad principal la venta en línea de escanciadores de sidra automáticos y productos relacionados. El acceso y uso del sitio web implica la aceptación de este Aviso Legal y de las Condiciones Generales de Uso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contenidos</h2>
            <p className="mb-4">
              Nos reservamos el derecho a modificar los contenidos del sitio web sin previo aviso. Aunque nos esforzamos por mantener la información actualizada y precisa, no garantizamos la exactitud, integridad o utilidad de ningún contenido disponible.
            </p>
            <p>
              El usuario reconoce que los contenidos del sitio web están protegidos por derechos de autor y otras leyes de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitación de Responsabilidad</h2>
            <p>
              En la medida permitida por la ley, Tienda del Escanciador no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del acceso o uso del sitio web, incluso si se ha advertido de la posibilidad de tales daños.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enlaces a Terceros</h2>
            <p>
              El sitio web puede contener enlaces a sitios web de terceros. No somos responsables del contenido, exactitud o prácticas de privacidad de estos sitios web externos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ley Aplicable</h2>
            <p>
              Este Aviso Legal se rige por las leyes de España y los tribunales españoles serán competentes para resolver cualquier controversia.
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
