import { useNavigate } from 'react-router-dom'
import { useData } from '../hooks/useData.jsx'
import { useWorkspace } from '../hooks/useWorkspace.jsx'

export default function More() {
  const nav = useNavigate()
  const { tasks } = useData()
  const { active } = useWorkspace()
  const count = (s) => tasks.filter((t) => t.status === s && !t.parent_id).length

  const items = [
    { to: '/waiting', icon: '⏳', label: 'Waiting For', sub: `${count('waiting')} items` },
    { to: '/scheduled', icon: '📆', label: 'Scheduled', sub: `${count('scheduled')} items` },
    { to: '/someday', icon: '💭', label: 'Someday / Maybe', sub: `${count('someday')} items` },
    { to: '/done', icon: '✅', label: 'Completed', sub: `${count('done')} done` },
    { to: '/contexts', icon: '🏷️', label: 'Contexts & tags', sub: 'Organise where & how' },
    { to: '/review', icon: '🔄', label: 'Weekly Review', sub: 'Stay current & trusted' },
    { to: '/team', icon: '👥', label: 'Team & members', sub: active?.is_personal ? 'Create a shared team' : active?.name },
    { to: '/settings', icon: '⚙️', label: 'Settings', sub: 'Account & app' }
  ]

  return (
    <>
      <h1 style={{ marginTop: 0 }}>More</h1>
      {items.map((it) => (
        <button key={it.to} className="card between" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav(it.to)}>
          <span className="flex">
            <span style={{ fontSize: 22 }}>{it.icon}</span>
            <span>
              <div style={{ fontWeight: 600 }}>{it.label}</div>
              <div className="muted" style={{ fontSize: 13 }}>{it.sub}</div>
            </span>
          </span>
          <span className="muted">›</span>
        </button>
      ))}
    </>
  )
}
