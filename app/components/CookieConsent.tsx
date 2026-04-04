"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_OPEN_EVENT,
  DEFAULT_COOKIE_CONSENT_PREFERENCES,
  createCookieConsentRecord,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent";

function ConsentToggle({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
            checked
              ? "border-emerald-700 bg-emerald-700"
              : "border-slate-300 bg-slate-200"
          } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function CookieConsent() {
  const [isMounted, setIsMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(
    DEFAULT_COOKIE_CONSENT_PREFERENCES
  );

  useEffect(() => {
    const initializationId = window.setTimeout(() => {
      const storedConsent = readCookieConsent();

      if (storedConsent) {
        setPreferences(storedConsent.preferences);
      } else {
        setShowBanner(true);
      }

      setIsMounted(true);
    }, 0);

    const handleOpenPreferences = () => {
      const currentConsent = readCookieConsent();

      if (currentConsent) {
        setPreferences(currentConsent.preferences);
      }

      setShowBanner(true);
      setShowPreferences(true);
    };

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpenPreferences);

    return () => {
      window.clearTimeout(initializationId);
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpenPreferences);
    };
  }, []);

  if (!isMounted || !showBanner) {
    return null;
  }

  const savePreferences = (nextPreferences: CookieConsentPreferences) => {
    writeCookieConsent(
      createCookieConsentRecord({
        analytics: nextPreferences.analytics,
        marketing: nextPreferences.marketing,
      })
    );
    setPreferences(nextPreferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectOptional = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const saveCurrentSelection = () => {
    savePreferences({
      necessary: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    });
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[70] p-2 sm:bottom-4 sm:right-4 sm:left-auto sm:w-full sm:max-w-md sm:p-0">
        <div className="pointer-events-none absolute inset-1 -z-10 rounded-3xl bg-slate-900/18 blur-xl sm:blur-2xl" />
        <section className="relative overflow-hidden rounded-2xl border-2 border-slate-300/72 bg-[#fff6dc]/70 ring-1 ring-slate-900/14 shadow-[0_28px_65px_rgba(15,23,42,0.34)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-slate-500/0 via-slate-500/75 to-slate-500/0" />
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(71,85,105,0.1),_transparent_48%),linear-gradient(135deg,_rgba(255,250,235,0.4),_rgba(255,243,205,0.34))] px-4 py-2.5 sm:px-5 sm:py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                Cookies y privacidad
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-950 sm:text-lg">
                Configura cookies opcionales
              </h2>
            </div>

            <p className="mt-1 text-[11px] leading-4 text-slate-700">
              Usamos cookies técnicas necesarias para seguridad, sesión y compra. Las opcionales están
              desactivadas por defecto y no se activan por seguir navegando.
            </p>

            <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">Necesarias siempre activas</span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-slate-800"
              >
                Aceptar opcionales
              </button>
              <button
                type="button"
                onClick={rejectOptional}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              >
                Rechazar opcionales
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences((currentValue) => !currentValue)}
                className="col-span-2 inline-flex items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-2 py-2 text-[10px] font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                aria-expanded={showPreferences}
              >
                {showPreferences ? "Ocultar preferencias" : "Configurar preferencias"}
              </button>
              <Link
                href="/politica-cookies"
                className="col-span-2 inline-flex items-center justify-center whitespace-nowrap rounded-full border border-transparent px-1.5 py-0.5 text-[10px] font-medium text-slate-600 transition hover:text-slate-950"
              >
                Ver política de cookies
              </Link>
            </div>
          </div>

          {showPreferences ? (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
              <div className="space-y-3">
                <ConsentToggle
                  title="Cookies necesarias"
                  description="Son imprescindibles para el funcionamiento básico del sitio, la autenticación y la tramitación del pedido. No pueden desactivarse desde este panel."
                  checked
                  onChange={() => undefined}
                  disabled
                />
                <ConsentToggle
                  title="Cookies analíticas"
                  description="Nos permitirían medir tráfico y uso de la web. Ahora mismo no están implementadas y seguirán bloqueadas salvo consentimiento expreso si se activan en el futuro."
                  checked={preferences.analytics}
                  onChange={(nextValue) =>
                    setPreferences((currentValue) => ({
                      ...currentValue,
                      analytics: nextValue,
                    }))
                  }
                />
                <ConsentToggle
                  title="Cookies de marketing"
                  description="Se usarían para publicidad personalizada o remarketing. Ahora mismo no están implementadas y seguirán bloqueadas salvo consentimiento expreso si se activan en el futuro."
                  checked={preferences.marketing}
                  onChange={(nextValue) =>
                    setPreferences((currentValue) => ({
                      ...currentValue,
                      marketing: nextValue,
                    }))
                  }
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={saveCurrentSelection}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Guardar configuración
                </button>
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
                >
                  Rechazar no esenciales
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {showPreferences ? (
        <button
          type="button"
          aria-label="Cerrar configuración de cookies"
          className="fixed inset-0 z-[60] bg-slate-950/25 backdrop-blur-[1px]"
          onClick={() => setShowPreferences(false)}
        />
      ) : null}
    </>
  );
}