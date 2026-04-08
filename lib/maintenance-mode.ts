export const DEFAULT_MAINTENANCE_MODE = false

const MAINTENANCE_MODE_CACHE_TTL_MS = 5000

type MaintenanceModeCache = {
  value: boolean
  expiresAt: number
}

let maintenanceModeCache: MaintenanceModeCache | null = null

export function parseMaintenanceModeRecord(data: unknown): boolean {
  if (!data || typeof data !== 'object' || !('value' in data)) {
    return DEFAULT_MAINTENANCE_MODE
  }

  const raw = (data as { value?: unknown }).value

  if (typeof raw === 'boolean') {
    return raw
  }

  if (typeof raw === 'number') {
    return raw === 1
  }

  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase().replace(/^"+|"+$/g, '')
    return ['1', 'true', 'on', 'yes', 'si'].includes(normalized)
  }

  if (raw && typeof raw === 'object') {
    const candidate = (raw as { enabled?: unknown; active?: unknown }).enabled ??
      (raw as { enabled?: unknown; active?: unknown }).active

    if (typeof candidate === 'boolean') {
      return candidate
    }
  }

  return DEFAULT_MAINTENANCE_MODE
}

export function normalizeMaintenanceMode(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (['1', 'true', 'on', 'yes', 'si'].includes(normalized)) {
      return true
    }

    if (['0', 'false', 'off', 'no'].includes(normalized)) {
      return false
    }
  }

  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }

  return null
}

export async function getMaintenanceMode(): Promise<boolean> {
  try {
    const now = Date.now()

    if (maintenanceModeCache && maintenanceModeCache.expiresAt > now) {
      return maintenanceModeCache.value
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return DEFAULT_MAINTENANCE_MODE
    }

    const url = `${supabaseUrl}/rest/v1/store_settings?select=value&key=eq.maintenance_mode&limit=1`

    const response = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Error reading maintenance mode setting:', response.status)
      return DEFAULT_MAINTENANCE_MODE
    }

    const data = (await response.json()) as Array<{ value?: unknown }>
    const row = Array.isArray(data) && data.length > 0 ? data[0] : null
    const maintenanceMode = parseMaintenanceModeRecord(row)

    maintenanceModeCache = {
      value: maintenanceMode,
      expiresAt: now + MAINTENANCE_MODE_CACHE_TTL_MS,
    }

    return maintenanceMode
  } catch (error) {
    console.error('getMaintenanceMode error:', error)
    return DEFAULT_MAINTENANCE_MODE
  }
}

export function clearMaintenanceModeCache() {
  maintenanceModeCache = null
}