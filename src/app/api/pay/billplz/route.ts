import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { adId, boostType } = await request.json()
    if (!adId || !boostType) {
      return NextResponse.json({ error: 'adId dan boostType diperlukan.' }, { status: 400 })
    }

    // Determine price
    let amount = 0
    let billDesc = ''
    if (boostType === 'featured') {
      amount = 10.00
      billDesc = 'Featured Ad Promotion Boost'
    } else if (boostType === 'urgent') {
      amount = 5.00
      billDesc = 'Urgent Ad Promotion Boost'
    } else if (boostType === 'combo') {
      amount = 12.00
      billDesc = 'Combo Featured + Urgent Ad Promotion Boost'
    } else {
      return NextResponse.json({ error: 'boostType tidak sah.' }, { status: 400 })
    }

    // Initialize Supabase admin client
    const supabase = createAdminClient()

    // Fetch ad
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('title')
      .eq('id', adId)
      .single()

    if (adError || !ad) {
      return NextResponse.json({ error: 'Iklan tidak dijumpai.' }, { status: 404 })
    }

    // Fetch Billplz credentials
    const { data: apiKeyData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'billplz_api_key')
      .single()

    const { data: collectionIdData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'billplz_collection_id')
      .single()

    const apiKey = apiKeyData?.value || process.env.BILLPLZ_API_KEY || 'mock-api-key'
    const collectionId = collectionIdData?.value || process.env.BILLPLZ_COLLECTION_ID || 'mock-collection-id'

    // Dynamic Host header
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    const redirectUrl = `${baseUrl}/dashboard/my-ads?payment=success&adId=${adId}`
    const callbackUrl = `${baseUrl}/api/pay/webhook/billplz`

    const billplzAmount = amount * 100 // in cents

    const isSandbox = apiKey.startsWith('mock') || apiKey.includes('sandbox') || !process.env.SUPABASE_SERVICE_ROLE_KEY
    const billplzUrl = isSandbox
      ? 'https://www.billplz-sandbox.com/api/v3/bills'
      : 'https://www.billplz.com/api/v3/bills'

    const payload = {
      collection_id: collectionId,
      email: 'seller@meowdah.my',
      name: 'Penjual Meowdah',
      amount: billplzAmount,
      callback_url: callbackUrl,
      redirect_url: redirectUrl,
      description: `${billDesc}: ${ad.title}`,
      reference_1_label: 'ad_id_boost_type',
      reference_1: `${adId}:${boostType}`
    }

    console.log(`Menjana bil Billplz [Sandbox: ${isSandbox}]: ${billplzUrl}`)

    const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64')

    const response = await fetch(billplzUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    console.log('Billplz API Response:', result)

    if (result && result.url) {
      return NextResponse.json({ checkoutUrl: result.url })
    }

    // Sandbox Mock Success redirect fallback
    if (isSandbox) {
      console.log('Sandbox/Mock checkout generated locally for Billplz.')
      const mockCheckoutUrl = `${baseUrl}/api/pay/webhook/billplz?id=${Math.random().toString(36).substring(7)}&paid=true&state=paid&amount=${billplzAmount}&x_signature=mock&mock=true&adId=${adId}&boostType=${boostType}`
      return NextResponse.json({ checkoutUrl: mockCheckoutUrl })
    }

    return NextResponse.json({ error: 'Gagal menjana pautan pembayaran Billplz.' }, { status: 500 })
  } catch (err: any) {
    console.error('Ralat Billplz API Route:', err)
    return NextResponse.json({ error: err.message || 'Ralat dalaman server.' }, { status: 500 })
  }
}
