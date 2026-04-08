import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getMaintenanceMode } from '@/lib/maintenance-mode'

function isPathAllowed(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true
  if (pathname.startsWith('/api')) return true
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/mantenimiento')) return true
  if (pathname.startsWith('/mi-cuenta')) return true
  if (pathname.startsWith('/login')) return true
  if (pathname.startsWith('/signup')) return true
  if (pathname.startsWith('/test-user')) return true
  if (pathname.startsWith('/google')) return true

  return (
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPathAllowed(pathname)) {
    return NextResponse.next()
  }

  try {
    if (!(await getMaintenanceMode())) {
      return NextResponse.next()
    }

    const target = new URL('/mantenimiento', request.url)
    return NextResponse.redirect(target, 307)
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
