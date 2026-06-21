import { createClient } from '@supabase/supabase-js'
import { getConfig } from './config.js'

let client = null

export function getSupabase() {
  if (client) return client
  const { url, anonKey } = getConfig()
  if (!url || !anonKey) return null
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    realtime: { params: { eventsPerSecond: 5 } }
  })
  return client
}
