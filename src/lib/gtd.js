// GTD vocabulary & helpers shared across the app.

export const STATUS = {
  inbox: { key: 'inbox', label: 'Inbox', icon: '📥', color: '#64748b' },
  next: { key: 'next', label: 'Next Action', icon: '⚡', color: '#4f46e5' },
  waiting: { key: 'waiting', label: 'Waiting For', icon: '⏳', color: '#d97706' },
  scheduled: { key: 'scheduled', label: 'Scheduled', icon: '📅', color: '#0891b2' },
  someday: { key: 'someday', label: 'Someday / Maybe', icon: '💭', color: '#7c3aed' },
  done: { key: 'done', label: 'Done', icon: '✅', color: '#16a34a' }
}

export const STATUS_ORDER = ['inbox', 'next', 'waiting', 'scheduled', 'someday', 'done']

export const ENERGY = {
  low: { label: 'Low energy', icon: '🔋' },
  medium: { label: 'Medium energy', icon: '⚡' },
  high: { label: 'High energy', icon: '🚀' }
}

export const PRIORITY = {
  0: { label: 'None', color: '#94a3b8' },
  1: { label: 'Low', color: '#0891b2' },
  2: { label: 'Medium', color: '#d97706' },
  3: { label: 'High', color: '#dc2626' }
}

export const CONTEXT_COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0d9488']

export function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
export function endOfDay(d = new Date()) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x }

export function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < startOfDay()
}

export function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d >= startOfDay() && d <= endOfDay()
}

export function isThisWeek(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const weekEnd = endOfDay(new Date(Date.now() + 7 * 86400000))
  return d <= weekEnd
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const today = startOfDay()
  const diff = Math.round((startOfDay(d) - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1 && diff <= 7) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${formatDate(dateStr)} · ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
}

export function initials(nameOrEmail = '?') {
  const s = (nameOrEmail || '?').trim()
  if (s.includes('@')) return s[0].toUpperCase()
  const parts = s.split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || s[0].toUpperCase()
}

export function avatarColor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h)
  return CONTEXT_COLORS[Math.abs(h) % CONTEXT_COLORS.length]
}
