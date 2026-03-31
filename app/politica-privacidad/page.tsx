export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Información que Recopilamos</h2>
            <p className="mb-4">Recopilamos la siguiente información:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Datos de identificación (nombre, correo electrónico, teléfono)</li>
              <li>Información de envío y facturación</li>
              <li>Datos de navegación y uso del sitio web</li>
              <li>Información de dispositivo e IP</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cómo Usamos Tu Información</h2>
            <p className="mb-4">Utilizamos tu información para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Procesar y entregar tus pedidos</li>
              <li>Enviar confirmaciones de compra</li>
              <li>Mejorar nuestros servicios</li>
              <li>Enviar información sobre promociones (con tu consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizacionales para proteger tu información personal contra acceso, alteración o destrucción no autorizados. Tu información se almacena de forma segura en servidores protegidos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartir Información</h2>
            <p className="mb-4">
              No compartimos tu información personal con terceros sin tu consentimiento, excepto en los siguientes casos:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Proveedores de servicios necesarios para procesar tus pedidos</li>
              <li>Requerimientos legales o orden judicial</li>
              <li>Protección de derechos, seguridad y propiedad</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Tus Derechos</h2>
            <p className="mb-4">Tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Acceder a tu información personal</li>
              <li>Rectificar información incorrecta</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Optar por recibir comunicaciones de marketing</li>
              <li>Portabilidad de datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contacto</h2>
            <p className="mb-2">
              Si tienes preguntas sobre esta Política de Privacidad o tus datos personales, puedes contactarnos en:
            </p>
            <p className="mb-2">
              <strong>Correo:</strong> duquesoft@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cambios en esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación en el sitio web.
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
