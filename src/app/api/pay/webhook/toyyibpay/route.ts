import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper function to update Ad boost status in DB
async function activateBoost(adId: string, boostType: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let updateFields: any = {}
  if (boostType === 'featured') {
    updateFields = { is_featured: true }
  } else if (boostType === 'urgent') {
    updateFields = { is_urgent: true }
  } else if (boostType === 'combo') {
    updateFields = { is_featured: true, is_urgent: true }
  } else {
    console.error('Boost type tidak sah:', boostType)
    return false
  }

  console.log(`Mengaktifkan boost [${boostType}] untuk ad [${adId}]...`)

  const { data, error } = await supabase
    .from('ads')
    .update(updateFields)
    .eq('id', adId)

  if (error) {
    console.error('Ralat mengemas kini database iklan:', error)
    return false
  }
  
  console.log(`Berjaya mengaktifkan boost [${boostType}] untuk iklan:`, adId)
  return true
}

// 1. GET Request (Return redirect from ToyyibPay checkout page)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusId = searchParams.get('status_id')
    const externalRef = searchParams.get('billExternalReferenceNo')

    console.log(`ToyyibPay GET Callback diterima: status_id=${statusId}, externalRef=${externalRef}`)

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    if (statusId === '1' && externalRef) {
      const [adId, boostType] = externalRef.split(':')
      if (adId && boostType) {
        await activateBoost(adId, boostType)
        return NextResponse.redirect(`${baseUrl}/dashboard/my-ads?payment=success&adId=${adId}&boost=${boostType}`)
      }
    }

    // If payment was not successful or failed
    if (externalRef) {
      const [adId] = externalRef.split(':')
      return NextResponse.redirect(`${baseUrl}/dashboard/my-ads?payment=failed&adId=${adId}`)
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/my-ads?payment=failed`)
  } catch (err: any) {
    console.error('Ralat ToyyibPay GET Return Route:', err)
    return NextResponse.json({ error: 'Ralat dalaman server.' }, { status: 500 })
  }
}

// 2. POST Request (Backend-to-backend secure callback webhook)
export async function POST(request: Request) {
  try {
    // ToyyibPay callback sends parameters as application/x-www-form-urlencoded POST
    const text = await request.text()
    const params = new URLSearchParams(text)

    const statusId = params.get('status_id')
    const externalRef = params.get('billExternalReferenceNo')
    const billCode = params.get('billcode')

    console.log(`ToyyibPay POST Webhook diterima: status_id=${statusId}, externalRef=${externalRef}, billCode=${billCode}`)

    if (statusId === '1' && externalRef) {
      const [adId, boostType] = externalRef.split(':')
      if (adId && boostType) {
        const success = await activateBoost(adId, boostType)
        if (success) {
          return new Response('OK', { status: 200 })
        }
      }
    }

    return new Response('OK', { status: 200 }) // Return OK even if not status 1 to prevent retries
  } catch (err: any) {
    console.error('Ralat ToyyibPay POST Webhook Route:', err)
    return new Response('Ralat Webhook', { status: 500 })
  }
}
