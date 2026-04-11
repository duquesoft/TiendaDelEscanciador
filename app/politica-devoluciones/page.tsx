import React from "react";

export default function PoliticaDevolucionesPage() {
  return (
    <main className="flex justify-center items-start min-h-[60vh] py-10 px-2 bg-transparent">
      <section className="bg-white/80 rounded-xl shadow-lg border border-green-200 max-w-2xl w-full p-8 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 border-b border-green-300 pb-2">Política de Devoluciones</h1>
        <ul className="list-disc pl-6 space-y-3 text-gray-800 text-base md:text-lg">
          <li>
            Solo se aceptarán devoluciones de productos que presenten defectos de fabricación o funcionamiento, siempre que no sean consecuencia de un mal uso, manipulación indebida o daños ocasionados por el cliente.
          </li>
          <li>
            El cliente deberá asumir los gastos de envío derivados de la devolución.
          </li>
          <li>
            El plazo máximo para solicitar la devolución es de <span className="font-semibold">10 días naturales</span> desde la recepción del producto. Pasado este periodo, no se aceptarán devoluciones.
          </li>
          <li>
            Para tramitar una devolución, por favor contacte con nuestro servicio de atención al cliente indicando el motivo y adjuntando fotografías del defecto.
          </li>
        </ul>
      </section>
    </main>
  );
}
