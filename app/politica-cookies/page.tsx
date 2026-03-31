export default function PoliticaCookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Cookies</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Se utilizan para recordar información sobre tu visita y mejorar la experiencia del usuario.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tipos de Cookies que Utilizamos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Necesarias</h3>
                <p>
                  Esenciales para el funcionamiento del sitio web. Permiten la navegación básica y el acceso a áreas seguras del sitio.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cookies de Rendimiento</h3>
                <p>
                  Recopilan información sobre cómo interactúas con el sitio web para mejorar su funcionamiento.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cookies de Funcionalidad</h3>
                <p>
                  Recuerdan tus preferencias y opciones para personalizar tu experiencia.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cookies de Marketing</h3>
                <p>
                  Utilizadas para contextualizar y mostrar publicidad relevante según tus intereses.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Control de Cookies</h2>
            <p className="mb-4">
              Puedes controlar y eliminar cookies a través de la configuración de tu navegador. Consulta la ayuda de tu navegador para obtener más información.
            </p>
            <p>
              Ten en cuenta que desactivar las cookies puede afectar la funcionalidad de nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies de Terceros</h2>
            <p>
              Algunos contenidos y servicios del sitio web (como análisis, publicidad) pueden utilizar cookies de terceros. No controlamos estas cookies y te recomendamos consultar las políticas de privacidad de estos terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Consentimiento</h2>
            <p>
              Al continuar navegando en nuestro sitio web después de recibir esta notificación de cookies, consientes el uso de cookies tal como se describe en esta política.
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
