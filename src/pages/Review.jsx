import { useNavigate } from 'react-router-dom'
import { useData } from '../hooks/useData.jsx'
import { isOverdue } from '../lib/gtd.js'

export default function Review() {
  const nav = useNavigate()
  const { tasks, projects } = useData()
  const t = (s) => tasks.filter((x) => x.status === s && !x.parent_id)
  const overdue = tasks.filter((x) => x.status !== 'done' && isOverdue(x.due_date) && !x.parent_id)
  const stalledProjects = projects.filter((p) => p.status === 'active' &&
    !tasks.some((x) => x.project_id === p.id && x.status === 'next'))

  const steps = [
    { n: 'Clear your Inbox', d: 'Process every captured item to a list, project, or trash.', to: '/', count: t('inbox').length, icon: '📥' },
    { n: 'Review Next Actions', d: 'Are they still the right next steps? Anything done?', to: '/next', count: t('next').length, icon: '⚡' },
    { n: 'Check overdue', d: 'Reschedule or complete anything past its date.', to: '/today', count: overdue.length, icon: '⚠️' },
    { n: 'Review Waiting For', d: 'Follow up on anything you delegated or are blocked on.', to: '/waiting', count: t('waiting').length, icon: '⏳' },
    { n: 'Review Projects', d: 'Every active project needs at least one Next Action.', to: '/projects', count: stalledProjects.length, icon: '📁', warnLabel: 'stalled' },
    { n: 'Review Someday / Maybe', d: 'Anything ready to activate this week?', to: '/someday', count: t('someday').length, icon: '💭' }
  ]

  return (
    <>
      <h1 style={{ marginTop: 0 }}>🔄 Weekly Review</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>
        The habit that makes GTD work. Run through this once a week to keep your system trusted and current.
      </p>
      {steps.map((s, i) => (
        <button key={i} className="card between" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav(s.to)}>
          <span className="flex">
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <span>
              <div style={{ fontWeight: 600 }}>{s.n}</div>
              <div className="muted" style={{ fontSize: 13 }}>{s.d}</div>
            </span>
          </span>
          {s.count > 0
            ? <span className="chip" style={{ background: 'rgba(245,158,11,.18)', color: '#fbbf24' }}>{s.count} {s.warnLabel || ''}</span>
            : <span className="chip" style={{ background: 'rgba(34,197,94,.18)', color: '#86efac' }}>✓</span>}
        </button>
      ))}
      <div className="note mt">When all six show a green check, your system is current. Nicely done. 🎯</div>
    </>
  )
}
