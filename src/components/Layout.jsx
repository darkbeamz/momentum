import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Sheet from './Sheet.jsx'
import TaskEditor from './TaskEditor.jsx'
import { useData } from '../hooks/useData.jsx'
import { useWorkspace } from '../hooks/useWorkspace.jsx'
import { useReminders } from '../hooks/useReminders.js'

const NAV = [
  { to: '/', icon: '📥', label: 'Inbox', end: true },
  { to: '/next', icon: '⚡', label: 'Next' },
  { to: '/today', icon: '📅', label: 'Today' },
  { to: '/projects', icon: '📁', label: 'Projects' },
  { to: '/more', icon: '⋯', label: 'More' }
]

export default function Layout() {
  const { tasks } = useData()
  const { workspaces, active, setActiveId } = useWorkspace()
  const [capture, setCapture] = useState(false)
  const [wsOpen, setWsOpen] = useState(false)
  const navigate = useNavigate()
  useReminders()

  const inboxCount = tasks.filter((t) => t.status === 'inbox' && !t.parent_id).length

  return (
    <div className="app">
      <div className="topbar">
        <button className="ws-switch" onClick={() => setWsOpen(true)}>
          {active?.is_personal ? '🔒' : '👥'} {active?.name || 'Workspace'} ▾
        </button>
        <div className="grow" />
        <button className="iconbtn" onClick={() => navigate('/search')}>🔍</button>
      </div>

      <div className="screen">
        <Outlet />
      </div>

      <button className="fab" onClick={() => setCapture(true)} aria-label="Quick capture">＋</button>

      <nav className="bottomnav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ico">{n.icon}</span>
            {n.to === '/' && inboxCount > 0 && <span className="badge">{inboxCount}</span>}
            {n.label}
          </NavLink>
        ))}
      </nav>

      <TaskEditor task={null} open={capture} onClose={() => setCapture(false)} />

      <Sheet open={wsOpen} onClose={() => setWsOpen(false)} title="Switch workspace">
        {workspaces.map((w) => (
          <button key={w.id} className={`pill ${w.id === active?.id ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 8, padding: '14px 16px' }}
            onClick={() => { setActiveId(w.id); setWsOpen(false) }}>
            {w.is_personal ? '🔒' : '👥'} &nbsp; {w.name}
          </button>
        ))}
        <button className="btn ghost mt" onClick={() => { setWsOpen(false); navigate('/team') }}>
          👥 Manage teams & members
        </button>
      </Sheet>
    </div>
  )
}
