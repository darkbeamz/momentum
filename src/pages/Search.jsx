import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskList from '../components/TaskList.jsx'
import { useData } from '../hooks/useData.jsx'

export default function Search() {
  const nav = useNavigate()
  const { tasks } = useData()
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const results = query
    ? tasks.filter((t) => !t.parent_id && (
        t.title.toLowerCase().includes(query) ||
        (t.notes || '').toLowerCase().includes(query) ||
        (t.tags || []).some((x) => x.toLowerCase().includes(query))))
    : []

  return (
    <>
      <div className="flex" style={{ marginBottom: 12 }}>
        <button className="linkbtn" style={{ paddingLeft: 0 }} onClick={() => nav(-1)}>‹</button>
        <input className="input" autoFocus placeholder="Search tasks, notes, #tags…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {query && <p className="muted" style={{ fontSize: 13 }}>{results.length} result{results.length === 1 ? '' : 's'}</p>}
      {query
        ? <TaskList tasks={results} emptyIcon="🔍" emptyTitle="No matches" emptyHint="Try a different word or tag." />
        : <div className="empty"><div className="big">🔍</div><h3>Search everything</h3><p>Find any task by title, note, or tag.</p></div>}
    </>
  )
}
