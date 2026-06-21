import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TaskList from '../components/TaskList.jsx'
import Sheet from '../components/Sheet.jsx'
import { useData } from '../hooks/useData.jsx'
import { STATUS_ORDER, STATUS } from '../lib/gtd.js'

export default function ProjectDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { projects, tasks, addTask, editProject, removeProject, loading } = useData()
  const [quick, setQuick] = useState('')
  const [menu, setMenu] = useState(false)
  if (loading) return <div className="spinner" />

  const project = projects.find((p) => p.id === id)
  if (!project) return <div className="empty"><div className="big">🤔</div><h3>Project not found</h3><button className="btn ghost mt" onClick={() => nav('/projects')}>Back to projects</button></div>

  const items = tasks.filter((t) => t.project_id === id && !t.parent_id)
  const done = items.filter((t) => t.status === 'done').length
  const pct = items.length ? Math.round((done / items.length) * 100) : 0

  const add = async () => {
    if (!quick.trim()) return
    await addTask({ title: quick.trim(), project_id: id, status: 'next' })
    setQuick('')
  }

  const setStatus = (s) => { editProject(id, { status: s }); setMenu(false) }

  return (
    <>
      <div className="between">
        <button className="linkbtn" style={{ paddingLeft: 0 }} onClick={() => nav('/projects')}>‹ Projects</button>
        <button className="iconbtn" onClick={() => setMenu(true)}>⋯</button>
      </div>
      <div className="flex" style={{ marginTop: 6 }}>
        <span className="dot" style={{ background: project.color, width: 16, height: 16 }} />
        <h1 style={{ margin: 0 }}>{project.title}</h1>
      </div>
      {project.description && <p className="muted">{project.description}</p>}
      <div className="progress"><i style={{ width: `${pct}%`, background: project.color }} /></div>
      <p className="muted" style={{ fontSize: 13 }}>{done} of {items.length} actions complete · {STATUS[items.length ? 'next' : 'inbox'] && project.status}</p>

      <div className="flex" style={{ margin: '8px 0 16px' }}>
        <input className="input" placeholder="Add an action to this project…" value={quick}
          onChange={(e) => setQuick(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button className="btn sm" onClick={add}>＋</button>
      </div>

      {STATUS_ORDER.filter((s) => s !== 'inbox').map((s) => {
        const group = items.filter((t) => t.status === s)
        if (!group.length) return null
        return (
          <div key={s}>
            <div className="section-title">{STATUS[s].icon} {STATUS[s].label}</div>
            <TaskList tasks={group} />
          </div>
        )
      })}
      {items.filter((t) => t.status === 'inbox').length > 0 && (
        <div><div className="section-title">📥 Unprocessed</div><TaskList tasks={items.filter((t) => t.status === 'inbox')} /></div>
      )}
      {items.length === 0 && <div className="empty"><div className="big">🌱</div><h3>No actions yet</h3><p>Add the very next physical action above.</p></div>}

      <Sheet open={menu} onClose={() => setMenu(false)} title="Project status">
        {['active', 'someday', 'done', 'archived'].map((s) => (
          <button key={s} className={`pill ${project.status === s ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 8, padding: '14px 16px' }}
            onClick={() => setStatus(s)}>{s[0].toUpperCase() + s.slice(1)}</button>
        ))}
        <button className="btn danger mt" onClick={() => { removeProject(id); nav('/projects') }}>Delete project</button>
        <p className="muted center" style={{ fontSize: 12 }}>Deleting keeps its tasks but unlinks them.</p>
      </Sheet>
    </>
  )
}
