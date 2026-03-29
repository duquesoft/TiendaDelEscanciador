"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartIcon from "./CartIcon";
import { AuthButton } from "./AuthButton";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileHasUser, setMobileHasUser] = useState<boolean>(false);
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

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
    <header className="w-full bg-white/70 backdrop-blur-md shadow-sm py-3 px-4 flex items-center justify-between sticky top-0 z-50 relative">

      {/* IZQUIERDA: Botón Home o placeholder invisible */}
      {pathname !== "/" ? (
        <Link
          href="/"
          className="text-green-700 hover:text-green-900 font-semibold whitespace-nowrap rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
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
          className="flex items-center gap-1 shrink-0 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          aria-label="Ir al carrito"
        >
          <span className="hidden sm:inline text-black hover:text-green-900 font-semibold text-lg">
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
              className="h-10 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition whitespace-nowrap shrink-0 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              Registrarse
            </Link>
          </div>
        ) : (
          <button
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md text-3xl hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
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
        <nav className="absolute top-full left-0 w-full bg-white shadow-md flex flex-row items-center justify-around p-4 md:hidden z-50 border-t border-gray-100">
          <div onClick={() => setOpen(false)}>
            <AuthButton />
          </div>
        </nav>
      )}
    </header>
  );
}