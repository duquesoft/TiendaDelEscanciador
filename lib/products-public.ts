import 'server-only'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { mapProductRecord, type ProductRecord } from '@/lib/products'

export async function getPublicProducts(): Promise<ProductRecord[]> {
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getPublicProducts error:', error)
      return []
    }

    return Array.isArray(data) ? data.map((row) => mapProductRecord(row)) : []
  } catch (error) {
    console.error('getPublicProducts exception:', error)
    return []
  }
}
