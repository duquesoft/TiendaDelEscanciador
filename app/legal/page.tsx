import React from "react";
export default function AvisoLegalPage() {
  return (
    <main className="flex justify-center items-start min-h-[60vh] py-10 px-2 bg-transparent">
      <section className="bg-white/80 rounded-xl shadow-lg border border-green-200 max-w-2xl w-full p-8 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 border-b border-green-300 pb-2">Aviso Legal</h1>
        <div className="space-y-6 text-gray-800 text-base md:text-lg">
          <section>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Identificación del Responsable</h2>
            <p className="mb-2">Nombre: Tienda del Escanciador (www.TiendaDelEscanciador.com)</p>
            <p className="mb-2">Domicilio: [Inserta tu dirección aquí]</p>
            <p className="mb-2">Correo electrónico: contacto@tiendadelescanciador.com</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Objeto y Uso del Sitio Web</h2>
            <p>
              El presente sitio web tiene como finalidad principal la venta en línea de escanciadores de sidra automáticos y productos relacionados. El acceso y uso del sitio web implica la aceptación de este Aviso Legal y de las Condiciones Generales de Uso.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Contenidos</h2>
            <p className="mb-2">
              Nos reservamos el derecho a modificar los contenidos del sitio web sin previo aviso. Aunque nos esforzamos por mantener la información actualizada y precisa, no garantizamos la exactitud, integridad o utilidad de ningún contenido disponible.
            </p>
            <p>
              El usuario reconoce que los contenidos del sitio web están protegidos por derechos de autor y otras leyes de propiedad intelectual.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Limitación de Responsabilidad</h2>
            <p>
              En la medida permitida por la ley, Tienda del Escanciador no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del acceso o uso del sitio web, incluso si se ha advertido de la posibilidad de tales daños.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Enlaces a Terceros</h2>
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
