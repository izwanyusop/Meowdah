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
    let billName = ''
    if (boostType === 'featured') {
      amount = 10.00
      billName = 'Featured Ad (Iklan Utama) - Meowdah.my'
    } else if (boostType === 'urgent') {
      amount = 5.00
      billName = 'Urgent Ad (Iklan Segera) - Meowdah.my'
    } else if (boostType === 'combo') {
      amount = 12.00
      billName = 'Combo Premium Boost - Meowdah.my'
    } else {
      return NextResponse.json({ error: 'boostType tidak sah.' }, { status: 400 })
    }

    // Initialize Supabase admin client
    const supabase = createAdminClient()

    // Fetch ad to make sure it exists
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('title, seller_id')
      .eq('id', adId)
      .single()

    if (adError || !ad) {
      return NextResponse.json({ error: 'Iklan tidak dijumpai.' }, { status: 404 })
    }

    // Fetch ToyyibPay credentials from DB system_settings
    const { data: secretKeyData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'toyyibpay_secret_key')
      .single()

    const { data: categoryCodeData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'toyyibpay_category_code')
      .single()

    const secretKey = secretKeyData?.value || process.env.TOYYIBPAY_SECRET_KEY || 'mock-secret-key'
    const categoryCode = categoryCodeData?.value || process.env.TOYYIBPAY_CATEGORY_CODE || 'mock-category-code'

    // Determine return and webhook callback URLs dynamically from host header
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    const returnUrl = `${baseUrl}/dashboard/my-ads?payment=success&adId=${adId}`
    const callbackUrl = `${baseUrl}/api/pay/webhook/toyyibpay`

    // ToyyibPay Payload in cents (amount * 100)
    const toyyibAmount = amount * 100

    const formData = new URLSearchParams()
    formData.append('userSecretKey', secretKey)
    formData.append('categoryCode', categoryCode)
    formData.append('billName', billName)
    formData.append('billDescription', `Pembayaran booster untuk iklan: ${ad.title}`)
    formData.append('billPriceSetting', '1')
    formData.append('billPayeeInfo', '1')
    formData.append('billAmount', toyyibAmount.toString())
    formData.append('billReturnUrl', returnUrl)
    formData.append('billCallbackUrl', callbackUrl)
    formData.append('billExternalReferenceNo', `${adId}:${boostType}`)
    formData.append('billTo', 'Penjual Meowdah')
    formData.append('billEmail', 'seller@meowdah.my')
    formData.append('billPhone', '60123456789')

    // Call ToyyibPay API (Dev Sandbox URL is used for sandbox testing, Production is toyyibpay.com)
    const isSandbox = secretKey.startsWith('mock') || secretKey.includes('sandbox') || !process.env.SUPABASE_SERVICE_ROLE_KEY
    const toyyibUrl = isSandbox 
      ? 'https://dev.toyyibpay.com/index.php/api/createBill'
      : 'https://toyyibpay.com/index.php/api/createBill'

    console.log(`Menjana bil ToyyibPay [Sandbox: ${isSandbox}]: ${toyyibUrl}`)

    const toyyibResponse = await fetch(toyyibUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const result = await toyyibResponse.json()
    console.log('ToyyibPay API Response:', result)

    // Result should contain a billcode
    if (Array.isArray(result) && result[0]?.BillCode) {
      const billCode = result[0].BillCode
      const checkoutUrl = isSandbox
        ? `https://dev.toyyibpay.com/${billCode}`
        : `https://toyyibpay.com/${billCode}`
      
      return NextResponse.json({ checkoutUrl })
    }

    // In case of mock/testing fallback to mock success URL
    if (isSandbox) {
      console.log('Sandbox/Mock checkout generated locally.')
      const mockCheckoutUrl = `${baseUrl}/api/pay/webhook/toyyibpay?status_id=1&billExternalReferenceNo=${adId}:${boostType}&mock=true`
      return NextResponse.json({ checkoutUrl: mockCheckoutUrl })
    }

    return NextResponse.json({ error: 'Gagal menjana pautan pembayaran ToyyibPay.' }, { status: 500 })
  } catch (err: any) {
    console.error('Ralat ToyyibPay API Route:', err)
    return NextResponse.json({ error: err.message || 'Ralat dalaman server.' }, { status: 500 })
  }
}
