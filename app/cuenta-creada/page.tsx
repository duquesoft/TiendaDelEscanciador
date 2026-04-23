"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CuentaCreadaPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">¡Cuenta creada exitosamente!</h1>
        <p className="mb-8 text-gray-700">Tu cuenta ha sido creada y ya has iniciado sesión.</p>
        {redirect ? (
          <Link href={redirect}>
            <button className="w-full py-4 px-6 text-lg font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all">
              Continuar con la compra
            </button>
          </Link>
        ) : (
          <Link href="/mi-cuenta">
            <button className="w-full py-4 px-6 text-lg font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all">
              Ir a mi área personal
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
