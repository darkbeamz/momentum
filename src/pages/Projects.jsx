import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sheet from '../components/Sheet.jsx'
import { useData } from '../hooks/useData.jsx'
import { CONTEXT_COLORS } from '../lib/gtd.js'

function ProjectCard({ project, onOpen }) {
  const { tasks } = useData()
  const t = tasks.filter((x) => x.project_id === project.id && !x.parent_id)
  const done = t.filter((x) => x.status === 'done').length
  const pct = t.length ? Math.round((done / t.length) * 100) : 0
  return (
    <button className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => onOpen(project)}>
      <div className="between">
        <span className="flex"><span className="dot" style={{ background: project.color, width: 12, height: 12 }} />
          <b>{project.title}</b></span>
        <span className="muted" style={{ fontSize: 13 }}>{done}/{t.length}</span>
      </div>
      {project.description && <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{project.description}</div>}
      <div className="progress"><i style={{ width: `${pct}%`, background: project.color }} /></div>
    </button>
  )
}

export default function Projects() {
  const { projects, addProject, loading } = useData()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState(CONTEXT_COLORS[0])
  if (loading) return <div className="spinner" />

  const create = async () => {
    if (!title.trim()) return
    const p = await addProject({ title: title.trim(), description: desc || null, color })
    setOpen(false); setTitle(''); setDesc('')
    nav(`/projects/${p.id}`)
  }

  const active = projects.filter((p) => p.status === 'active')
  const other = projects.filter((p) => p.status !== 'active')

  return (
    <>
      <div className="between">
        <h1 style={{ marginTop: 0 }}>📁 Projects</h1>
        <button className="btn sm" onClick={() => setOpen(true)}>＋ New</button>
      </div>
      <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>A project is any outcome that needs more than one action.</p>

      {active.map((p) => <ProjectCard key={p.id} project={p} onOpen={(pr) => nav(`/projects/${pr.id}`)} />)}
      {other.length > 0 && <div className="section-title">Someday / Done / Archived</div>}
      {other.map((p) => <ProjectCard key={p.id} project={p} onOpen={(pr) => nav(`/projects/${pr.id}`)} />)}
      {projects.length === 0 && <div className="empty"><div className="big">📁</div><h3>No projects yet</h3><p>Create one to group related actions toward an outcome.</p></div>}

      <Sheet open={open} onClose={() => setOpen(false)} title="New project">
        <div className="field"><label>Title</label>
          <input className="input" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Launch new website" /></div>
        <div className="field"><label>Outcome / description</label>
          <textarea className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does done look like?" /></div>
        <div className="field"><label>Colour</label>
          <div className="pills">{CONTEXT_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: color === c ? '3px solid #fff' : 'none' }} />
          ))}</div>
        </div>
        <button className="btn" onClick={create} disabled={!title.trim()}>Create project</button>
      </Sheet>
    </>
  )
}
