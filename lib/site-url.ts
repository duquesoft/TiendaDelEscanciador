const DEFAULT_SITE_URL = 'https://www.tiendadelescanciador.com'

function sanitizeSiteUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return value.trim().replace(/^['\"]|['\"]$/g, '')
}

export function getSiteUrl(requestUrl?: string): string {
  if (requestUrl) {
    return new URL(requestUrl).origin
  }

  const siteUrl =
    sanitizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    sanitizeSiteUrl(process.env.SITE_URL) ||
    DEFAULT_SITE_URL

  return siteUrl.replace(/\/$/, '')
}