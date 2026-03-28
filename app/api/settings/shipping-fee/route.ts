import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { DEFAULT_SHIPPING_FEE, parseShippingFeeRecord } from '@/lib/shipping-fee'

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
      .eq('key', 'shipping_fee')
      .maybeSingle()

    if (error) {
      console.error('Error reading shipping fee setting:', error)
      return NextResponse.json({ shippingFee: DEFAULT_SHIPPING_FEE })
    }

    return NextResponse.json({ shippingFee: parseShippingFeeRecord(data) })
  } catch (error) {
    console.error('GET /api/settings/shipping-fee error:', error)
    return NextResponse.json({ shippingFee: DEFAULT_SHIPPING_FEE })
  }
}
