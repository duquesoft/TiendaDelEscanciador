"use client";
import { useEffect, useState } from "react";

function getCartCount() {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    return Array.isArray(carrito) ? carrito.length : 0;
  } catch {
    return 0;
  }
}

export default function CartIcon() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const actualizar = () => {
    setCount(getCartCount());
  };

  useEffect(() => {
    setMounted(true);
    setCount(getCartCount());
    window.addEventListener("carrito-actualizado", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      window.removeEventListener("carrito-actualizado", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, []);

  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 text-gray-100"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25h11.218c.97 0 1.813-.621 2.11-1.545l2.122-6.545a1.125 1.125 0 00-1.073-1.455H5.108M7.5 14.25L5.108 4.272M7.5 14.25l-.97 3.882a1.125 1.125 0 001.09 1.368h10.36m-11.45-5.25h11.218m0 0l-.97 3.882a1.125 1.125 0 01-1.09 1.368H7.62"
        />
      </svg>
      {mounted && (
        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}