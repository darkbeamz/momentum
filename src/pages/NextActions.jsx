import { useState } from 'react'
import TaskList from '../components/TaskList.jsx'
import { useData } from '../hooks/useData.jsx'
import { ENERGY, PRIORITY } from '../lib/gtd.js'

export default function NextActions() {
  const { tasks, contexts, loading } = useData()
  const [ctxFilter, setCtxFilter] = useState('')
  const [energyFilter, setEnergyFilter] = useState('')
  if (loading) return <div className="spinner" />

  let items = tasks.filter((t) => t.status === 'next' && !t.parent_id)
  if (ctxFilter) items = items.filter((t) => t.context_id === ctxFilter)
  if (energyFilter) items = items.filter((t) => t.energy === energyFilter)
  items = items.sort((a, b) => (b.priority - a.priority) || (a.position - b.position))

  return (
    <>
      <h1 style={{ marginTop: 0 }}>⚡ Next Actions</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>The things you can actually do right now.</p>

      <div className="pills" style={{ marginBottom: 8 }}>
        <button className={`pill ${!ctxFilter ? 'active' : ''}`} onClick={() => setCtxFilter('')}>All contexts</button>
        {contexts.map((c) => (
          <button key={c.id} className={`pill ${ctxFilter === c.id ? 'active' : ''}`}
            onClick={() => setCtxFilter(c.id)} style={ctxFilter === c.id ? { background: c.color, borderColor: c.color } : {}}>
            @{c.name}
          </button>
        ))}
      </div>
      <div className="pills" style={{ marginBottom: 16 }}>
        <button className={`pill ${!energyFilter ? 'active' : ''}`} onClick={() => setEnergyFilter('')}>Any energy</button>
        {Object.entries(ENERGY).map(([k, v]) => (
          <button key={k} className={`pill ${energyFilter === k ? 'active' : ''}`} onClick={() => setEnergyFilter(k)}>
            {v.icon} {k}
          </button>
        ))}
      </div>

      <TaskList tasks={items} emptyIcon="🌤️" emptyTitle="No next actions"
        emptyHint="Process your Inbox to populate this list, or adjust your filters." />
    </>
  )
}
