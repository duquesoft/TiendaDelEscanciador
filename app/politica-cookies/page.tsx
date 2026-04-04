export default function PoliticaCookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Cookies</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">¿Qué son las cookies?</h2>
            <p>
              Las cookies y tecnologías similares son pequeños archivos o espacios de almacenamiento que se guardan en tu dispositivo cuando visitas una página web. Sirven para posibilitar funciones técnicas, recordar determinadas preferencias o, si lo autorizas, medir el uso de la web y personalizar contenidos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Qué utiliza actualmente esta web</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Necesarias</h3>
                <p>
                  Utilizamos cookies técnicas y de sesión estrictamente necesarias para funciones como la autenticación de usuarios, la seguridad de la sesión y el correcto funcionamiento del proceso de compra. Estas cookies no requieren consentimiento previo de acuerdo con la normativa aplicable cuando son imprescindibles para prestar el servicio solicitado.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Almacenamiento local necesario</h3>
                <p>
                  El sitio puede usar almacenamiento local del navegador para conservar el contenido del carrito y recordar tu decisión sobre el panel de cookies. Este almacenamiento se usa con finalidades técnicas y funcionales vinculadas a la compra o al cumplimiento normativo.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cookies analíticas</h3>
                <p>
                  En este momento no instalamos cookies analíticas o de medición no necesarias. Si en el futuro se incorporan, solo se activarán tras obtener tu consentimiento expreso mediante el panel de configuración.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cookies de Marketing</h3>
                <p>
                  En este momento no instalamos cookies publicitarias, de remarketing ni de perfilado. Si esto cambia, volveremos a solicitar tu consentimiento antes de activarlas.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Base legal y gestión del consentimiento</h2>
            <p className="mb-4">
              La base jurídica para el uso de cookies técnicas necesarias es el interés legítimo y la necesidad de prestar el servicio solicitado. Para cualquier cookie no necesaria, la base jurídica será tu consentimiento expreso, libre, informado e inequívoco.
            </p>
            <p>
              Puedes aceptar, rechazar o configurar las categorías opcionales desde el aviso flotante inicial y volver a revisar tu elección en cualquier momento desde el enlace <strong>Configurar Cookies</strong> disponible en el pie de página.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Detalle orientativo de tecnologías</h2>
            <div className="space-y-3 md:hidden">
              <article className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">Cookies de sesión de autenticación</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Mantener la sesión iniciada y proteger áreas privadas cuando el usuario accede a su cuenta.
                </p>
                <p className="mt-2 text-xs font-medium text-gray-600">Tipo: Necesaria</p>
              </article>

              <article className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">LocalStorage carrito</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Conservar temporalmente los productos añadidos al carrito en el navegador.
                </p>
                <p className="mt-2 text-xs font-medium text-gray-600">Tipo: Técnica / funcional vinculada a la compra</p>
              </article>

              <article className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">LocalStorage de consentimiento</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Recordar tu elección sobre cookies para no mostrar el aviso en cada visita.
                </p>
                <p className="mt-2 text-xs font-medium text-gray-600">Tipo: Necesaria para cumplimiento normativo</p>
              </article>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-900">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left">Tecnología</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Finalidad</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Cookies de sesión de autenticación</td>
                    <td className="border border-gray-200 px-4 py-3">Mantener la sesión iniciada y proteger áreas privadas cuando el usuario accede a su cuenta.</td>
                    <td className="border border-gray-200 px-4 py-3">Necesaria</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">LocalStorage carrito</td>
                    <td className="border border-gray-200 px-4 py-3">Conservar temporalmente los productos añadidos al carrito en el navegador.</td>
                    <td className="border border-gray-200 px-4 py-3">Técnica / funcional vinculada a la compra</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">LocalStorage de consentimiento</td>
                    <td className="border border-gray-200 px-4 py-3">Recordar tu elección sobre cookies para no mostrar el aviso en cada visita.</td>
                    <td className="border border-gray-200 px-4 py-3">Necesaria para cumplimiento normativo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cómo desactivar o eliminar cookies</h2>
            <p className="mb-4">
              Además del panel de configuración de esta web, puedes restringir o eliminar cookies desde la configuración de tu navegador. Ten en cuenta que bloquear cookies técnicas necesarias puede afectar al inicio de sesión, al carrito y a otras funciones esenciales.
            </p>
            <p>
              Para más información, consulta la ayuda oficial de tu navegador o dispositivo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies de Terceros</h2>
            <p>
              Actualmente no instalamos cookies opcionales de terceros con fines analíticos o publicitarios. Si en el futuro incorporamos servicios externos que requieran este tipo de tecnologías, se reflejarán en esta política y en el panel de consentimiento antes de su activación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tus derechos</h2>
            <p>
              Puedes retirar o modificar tu consentimiento en cualquier momento con la misma facilidad con la que lo otorgaste. Si deseas ejercer tus derechos de protección de datos o tienes dudas sobre esta política, puedes escribir a <strong>duquesoft@gmail.com</strong>.
            </p>
          </section>

          <div className="bg-gray-100 border-l-4 border-blue-500 p-4 mt-8">
            <p className="text-sm text-gray-600">
              Última actualización: 04/04/2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
