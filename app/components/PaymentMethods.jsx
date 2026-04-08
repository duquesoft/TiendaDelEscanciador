import Image from "next/image";

export default function PaymentMethods({
  className = "",
  title = "Metodos de pago aceptados",
}) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white/80 p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{title}</p>

      <div className="mt-3 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <div className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-lg border border-blue-200 bg-white px-2 shadow-sm md:h-11 md:px-3">
          <Image
            src="/img/payments/visa-logo.svg"
            alt="Visa"
            width={88}
            height={20}
            className="h-4 w-auto max-w-[76px] object-contain md:h-5 md:max-w-[88px]"
          />
        </div>

        <div className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 shadow-sm md:h-11 md:px-3">
          <Image
            src="/img/payments/mastercard-logo.webp"
            alt="Mastercard"
            width={148}
            height={32}
            className="h-7 w-auto max-w-[132px] object-contain md:h-8 md:max-w-[148px]"
          />
        </div>

        <div className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-lg border border-sky-200 bg-white px-2 shadow-sm md:h-11 md:px-3">
          <Image
            src="/img/payments/paypal-logo.svg"
            alt="PayPal"
            width={112}
            height={24}
            className="h-5 w-auto max-w-[96px] object-contain md:h-6 md:max-w-[112px]"
          />
        </div>

        <div className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-lg border border-emerald-200 bg-white px-2 shadow-sm md:h-11 md:px-3">
          <span className="text-[10px] font-black tracking-[0.02em] text-emerald-700 md:text-[11px]">CONTRA REEMBOLSO</span>
        </div>
      </div>
    </div>
  );
}
