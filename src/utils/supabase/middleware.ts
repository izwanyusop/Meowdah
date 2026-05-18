import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getValidUrl(envUrl: string | undefined): string {
  const trimmed = envUrl?.trim()
  if (trimmed && trimmed.startsWith('http')) {
    return trimmed
  }
  return 'https://mqmxutlvsyxfyerywxsy.supabase.co'
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = getValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbXh1dGx2c3l4Znllcnl3eHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTAyNzUsImV4cCI6MjA5NDIyNjI3NX0.VdoVOMVNGA3_91b-aBBZpedaFx2x-KbVkAB77jZY8hE'

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do NOT remove this. It is needed for Supabase Auth to refresh sessions.
  // This will check if the user is authenticated and refresh their session token.
  await supabase.auth.getUser()

  return supabaseResponse
}
