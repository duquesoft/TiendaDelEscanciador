import React from 'react'

export default function PoliticaCookiesPage() {
  return (
    <main className="flex justify-center items-start min-h-[60vh] py-10 px-2 bg-transparent">
      <section className="bg-white/80 rounded-xl shadow-lg border border-green-200 max-w-2xl w-full p-8 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 border-b border-green-300 pb-2">Política de Cookies</h1>

        <div className="space-y-6 text-gray-800 text-base md:text-lg">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">¿Qué son las cookies?</h2>
            <p>
              Las cookies y tecnologías similares son pequeños archivos o espacios de almacenamiento que se guardan en tu dispositivo cuando visitas una página web. Sirven para posibilitar funciones técnicas, recordar determinadas preferencias o, si lo autorizas, medir el uso de la web y personalizar contenidos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Qué utiliza actualmente esta web</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Necesarias</h3>
                <p>
                  Utilizamos cookies técnicas y de sesión estrictamente necesarias para funciones como la autenticación de usuarios, la seguridad de la sesión y el correcto funcionamiento del proceso de compra. Estas cookies no requieren consentimiento previo de acuerdo con la normativa aplicable cuando son imprescindibles para prestar el servicio solicitado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
