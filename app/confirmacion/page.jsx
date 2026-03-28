import Link from 'next/link'

export default function Confirmacion() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-center">

      <h2 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h2>

      <p className="text-lg text-gray-700 mb-6">
        Tu pedido ha sido procesado correctamente.
      </p>

      <Link
        href="/"
        className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow"
      >
        Volver al inicio
      </Link>

    </div>
  );
}