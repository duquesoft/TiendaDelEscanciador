export const metadata = {
  title: "Escanciador de Sidra Automático",
  description: "Tienda oficial del escanciador automático a batería",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white text-gray-900">

        {/* CABECERA */}
        <header className="w-full bg-white shadow-sm py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
            <h1 className="text-xl font-bold">Escanciador Automático</h1>
            <nav className="flex gap-6">
              <a href="/" className="hover:text-green-600">Inicio</a>
              <a href="/producto" className="hover:text-green-600">Producto</a>
              <a href="/carrito" className="hover:text-green-600">Carrito</a>
            </nav>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="pt-6 pb-20">
          {children}
        </main>

        {/* PIE DE PÁGINA */}
        <footer className="w-full bg-gray-100 py-6 mt-10">
          <div className="max-w-6xl mx-auto text-center text-gray-600">
            © {new Date().getFullYear()} Escanciador Automático — Todos los derechos reservados
          </div>
        </footer>

      </body>
    </html>
  );
}