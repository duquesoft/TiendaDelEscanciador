"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartIcon from "./CartIcon";
import { AuthButton } from "./AuthButton";
import { createClient } from "@/lib/supabase/client";
import type { HeaderTheme } from "@/lib/header-theme";

export default function Header({ theme = "green" }: { theme?: HeaderTheme }) {
  const [open, setOpen] = useState(false);
  const [mobileHasUser, setMobileHasUser] = useState<boolean>(false);
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const isBlueTheme = theme === "blue";

  const headerThemeClass = isBlueTheme
    ? "bg-gradient-to-r from-[#0f2238]/92 via-[#173552]/88 to-[#1f4c6e]/84 border-cyan-300/25"
    : "bg-gradient-to-r from-[#0f2e24]/94 via-[#166534]/90 to-[#1f8a56]/86 border-emerald-300/30";

  const accentTextClass = isBlueTheme ? "text-cyan-300" : "text-emerald-200";
  const accentHoverTextClass = isBlueTheme ? "hover:text-cyan-300" : "hover:text-emerald-200";
  const accentRingClass = isBlueTheme ? "focus-visible:ring-cyan-300" : "focus-visible:ring-emerald-300";

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setMobileHasUser(!!session?.user);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasUser = !!session?.user;
      setMobileHasUser(hasUser);

      if (!hasUser) {
        setOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <header className={`w-full ${headerThemeClass} backdrop-blur-md border-b shadow-[0_14px_28px_rgba(2,8,23,0.28),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-2px_0_rgba(0,0,0,0.18)] py-3 px-4 flex items-center justify-between sticky top-0 z-50 relative`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-black/25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/8 to-transparent" />

      {/* IZQUIERDA: Botón Home o placeholder invisible */}
      {pathname !== "/" ? (
        <Link
          href="/"
          className={`${accentTextClass} hover:text-white font-semibold whitespace-nowrap rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 ${accentRingClass}`}
        >
          <span className="sm:hidden text-base">← Inicio</span>
          <span className="hidden sm:inline text-lg sm:text-xl">← Página principal</span>
        </Link>
      ) : (
        // Placeholder invisible (NO ocultar en PC)
        <span className="hidden sm:inline text-lg sm:text-xl opacity-0 select-none">
          ← Pagina principal
        </span>
      )}

      {/* DERECHA */}
      <div className="ml-auto flex items-center gap-3 sm:gap-4">

        {/* Carrito + Icono */}
        <Link
          href="/carrito"
          className={`flex items-center gap-1 shrink-0 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 ${accentRingClass}`}
          aria-label="Ir al carrito"
        >
          <span className={`hidden sm:inline text-white ${accentHoverTextClass} font-semibold text-lg transition-colors`}>
            Carrito
          </span>
          <CartIcon />
        </Link>

        {/* Móvil: invitado -> botones directos / logueado -> hamburguesa */}
        {!mobileHasUser ? (
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="h-10 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition whitespace-nowrap shrink-0 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className={`h-10 px-3 py-2 bg-gradient-to-r from-emerald-400 to-green-400 text-slate-900 text-sm font-semibold rounded-md hover:from-emerald-500 hover:to-green-500 transition whitespace-nowrap shrink-0 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 ${accentRingClass}`}
            >
              Registrarse
            </Link>
          </div>
        ) : (
          <button
            className={`md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md text-3xl text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 ${accentRingClass}`}
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            ☰
          </button>
        )}

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center gap-4">
          <AuthButton />
        </nav>
      </div>

      {/* Menú móvil */}
      {open && mobileHasUser && (
        <nav className="absolute top-full left-0 w-full bg-slate-100 shadow-xl flex flex-row items-center justify-around p-4 md:hidden z-50 border-t border-slate-300">
          <div onClick={() => setOpen(false)}>
            <AuthButton darkText />
          </div>
        </nav>
      )}
    </header>
  );
}