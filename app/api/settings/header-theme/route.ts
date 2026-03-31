import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { DEFAULT_HEADER_THEME, parseHeaderThemeRecord } from '@/lib/header-theme'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('value')
      .eq('key', 'header_theme')
      .maybeSingle()

    if (error) {
      console.error('Error reading header theme setting:', error)
      return NextResponse.json({ headerTheme: DEFAULT_HEADER_THEME })
    }

    return NextResponse.json({ headerTheme: parseHeaderThemeRecord(data) })
  } catch (error) {
    console.error('GET /api/settings/header-theme error:', error)
    return NextResponse.json({ headerTheme: DEFAULT_HEADER_THEME })
  }
}