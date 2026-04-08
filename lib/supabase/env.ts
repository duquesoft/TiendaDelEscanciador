function sanitizeEnvValue(value: string | undefined): string {
  return (value || '').trim().replace(/^['\"]|['\"]$/g, '')
}

export function getSupabaseUrl(): string {
  const value = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)

  if (!value) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL')
  }

  return value
}

export function getSupabaseAnonKey(): string {
  const value = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!value) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return value
}

export function getSupabaseServiceRoleKey(): string {
  const value = sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!value) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY')
  }

  return value
}