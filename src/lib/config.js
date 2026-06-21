// Resolves Supabase config from (in priority order):
//   1. Build-time env vars  (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
//   2. Runtime public/config.js  (window.__APP_CONFIG__)
//   3. localStorage  (in-app Setup screen)
const LS_KEY = 'momentum_config'

export function getConfig() {
  const env = import.meta.env || {}
  const win = (typeof window !== 'undefined' && window.__APP_CONFIG__) || {}
  let ls = {}
  try { ls = JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { /* ignore */ }

  const url = env.VITE_SUPABASE_URL || win.supabaseUrl || ls.supabaseUrl || ''
  const anonKey = env.VITE_SUPABASE_ANON_KEY || win.supabaseAnonKey || ls.supabaseAnonKey || ''
  return { url: url.trim(), anonKey: anonKey.trim() }
}

export function saveConfig({ url, anonKey }) {
  localStorage.setItem(LS_KEY, JSON.stringify({ supabaseUrl: url.trim(), supabaseAnonKey: anonKey.trim() }))
}

export function isConfigured() {
  const { url, anonKey } = getConfig()
  return Boolean(url && anonKey)
}
