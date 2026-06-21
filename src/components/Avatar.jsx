import { initials, avatarColor } from '../lib/gtd.js'

export default function Avatar({ profile, name, size = '' }) {
  const label = profile?.full_name || profile?.email || name || '?'
  const seed = profile?.id || profile?.email || label
  return (
    <div className={`avatar ${size}`} style={{ background: avatarColor(seed) }} title={label}>
      {initials(label)}
    </div>
  )
}
