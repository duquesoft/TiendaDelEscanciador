import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export const DEFAULT_WHATSAPP_NUMBER = ''

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .maybeSingle()

    if (error) {
      console.error('Error reading whatsapp setting:', error)
      return NextResponse.json({ whatsappNumber: DEFAULT_WHATSAPP_NUMBER })
    }

    const value =
      data && typeof data === 'object' && 'value' in data && typeof data.value === 'string'
        ? data.value
        : DEFAULT_WHATSAPP_NUMBER

    return NextResponse.json({ whatsappNumber: value })
  } catch (error) {
    console.error('GET /api/settings/whatsapp error:', error)
    return NextResponse.json({ whatsappNumber: DEFAULT_WHATSAPP_NUMBER })
  }
}
