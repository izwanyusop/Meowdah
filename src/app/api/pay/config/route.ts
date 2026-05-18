import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create an admin/service client that bypasses client RLS to fetch settings
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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
