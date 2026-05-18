import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqmxutlvsyxfyerywxsy.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbXh1dGx2c3l4Znllcnl3eHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTAyNzUsImV4cCI6MjA5NDIyNjI3NX0.VdoVOMVNGA3_91b-aBBZpedaFx2x-KbVkAB77jZY8hE'
  
  return createBrowserClient(url, key)
}
