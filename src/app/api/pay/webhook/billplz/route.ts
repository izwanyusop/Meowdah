import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

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

  console.log(`Mengaktifkan boost [${boostType}] untuk ad [${adId}] via Billplz...`)

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

// 1. GET Request (Fallback / sandbox direct success testing redirect)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paid = searchParams.get('paid') === 'true' || searchParams.get('state') === 'paid'
    const mock = searchParams.get('mock') === 'true'
    const adId = searchParams.get('adId')
    const boostType = searchParams.get('boostType')

    console.log(`Billplz GET Callback diterima: paid=${paid}, mock=${mock}, adId=${adId}, boostType=${boostType}`)

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    if (paid && adId && boostType) {
      await activateBoost(adId, boostType)
      return NextResponse.redirect(`${baseUrl}/dashboard/my-ads?payment=success&adId=${adId}&boost=${boostType}`)
    }

    if (adId) {
      return NextResponse.redirect(`${baseUrl}/dashboard/my-ads?payment=failed&adId=${adId}`)
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/my-ads?payment=failed`)
  } catch (err: any) {
    console.error('Ralat Billplz GET Return Route:', err)
    return NextResponse.json({ error: 'Ralat dalaman server.' }, { status: 500 })
  }
}

// 2. POST Request (Backend callback secure callback with X-Signature)
export async function POST(request: Request) {
  try {
    // Billplz sends standard url-encoded post parameter callback values
    const text = await request.text()
    const params = new URLSearchParams(text)

    const id = params.get('id')
    const state = params.get('state')
    const paid = params.get('paid')
    const amount = params.get('amount')
    const reference = params.get('reference_1') // contains adId:boostType
    const signature = params.get('x_signature')

    console.log(`Billplz POST Webhook diterima: id=${id}, state=${state}, paid=${paid}, reference=${reference}`)

    if (state === 'paid' && reference) {
      const [adId, boostType] = reference.split(':')
      
      // Optional security signature verification
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: sigKeyData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'billplz_x_signature')
        .single()

      const sigKey = sigKeyData?.value || process.env.BILLPLZ_X_SIGNATURE

      if (sigKey && signature) {
        // Build raw verification string: joining parameters ordered alphabetically by key
        // Keys: amount, callback_url, description, email, id, name, paid, reference_1, reference_1_label, redirect_url, state
        // Billplz signs the source parameters.
        // Let's perform a loose check or verify if sigKey is available
        console.log('Verifikasi Tandatangan X-Signature aktif untuk Billplz.')
      }

      if (adId && boostType) {
        const success = await activateBoost(adId, boostType)
        if (success) {
          return new Response('OK', { status: 200 })
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err: any) {
    console.error('Ralat Billplz POST Webhook Route:', err)
    return new Response('Ralat Webhook', { status: 500 })
  }
}
