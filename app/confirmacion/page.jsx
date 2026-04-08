import Link from 'next/link'
import { getPaymentMethodLabel } from '@/lib/payment-methods'
import ConfirmacionClient from './ConfirmacionClient'

export default function Confirmacion({ searchParams }) {
  const paymentLabel = getPaymentMethodLabel(searchParams?.payment)
  const provider = searchParams?.provider || ''
  const paymentStatus = searchParams?.status === 'paid' ? 'paid' : 'pending'

  const statusMessage = paymentStatus === 'paid'
    ? 'Tu pago se ha confirmado correctamente y el pedido ya esta registrado.'
    : provider === 'paypal'
      ? 'Tu pedido ha sido registrado. En cuanto PayPal confirme el pago recibirás una notificación y el pedido quedará procesado.'
      : 'Tu pedido ha sido registrado correctamente y queda pendiente de gestión.'

  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <ConfirmacionClient />

      <h2 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h2>

      <p className="text-lg text-gray-700 mb-6">
        {statusMessage}
      </p>

      <p className="text-sm text-gray-600 mb-6">
        Metodo de pago seleccionado: <span className="font-semibold text-gray-900">{paymentLabel}</span>
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