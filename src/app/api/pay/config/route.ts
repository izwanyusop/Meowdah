import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  try {
    // Create an admin/service client that bypasses client RLS to fetch settings
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'active_gateway')
      .single()

    const activeGateway = data?.value || 'none'

    return NextResponse.json({ activeGateway })
  } catch (err: any) {
    console.error('Ralat API pay config:', err)
    return NextResponse.json({ activeGateway: 'none' })
  }
}
