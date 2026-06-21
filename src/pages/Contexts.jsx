import { useState } from 'react'
import { useData } from '../hooks/useData.jsx'
import { CONTEXT_COLORS } from '../lib/gtd.js'

export default function Contexts() {
  const { contexts, tasks, addContext, removeContext } = useData()
  const [name, setName] = useState('')
  const [color, setColor] = useState(CONTEXT_COLORS[0])

  const add = async () => {
    const v = name.trim().replace(/^@/, '')
    if (!v) return
    await addContext(v, color)
    setName('')
  }

  return (
    <>
      <h1 style={{ marginTop: 0 }}>🏷️ Contexts</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>
        Contexts are the where/with-what of a task — <b>@home</b>, <b>@calls</b>, <b>@errands</b>, <b>@computer</b>. Filter Next Actions by them.
      </p>

      <div className="card">
        <div className="field" style={{ marginBottom: 10 }}>
          <input className="input" placeholder="New context, e.g. calls" value={name}
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        </div>
        <div className="pills" style={{ marginBottom: 10 }}>
          {CONTEXT_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: color === c ? '3px solid #fff' : 'none' }} />
          ))}
        </div>
        <button className="btn sm" onClick={add}>＋ Add context</button>
      </div>

      {contexts.map((c) => {
        const n = tasks.filter((t) => t.context_id === c.id).length
        return (
          <div className="task" key={c.id}>
            <span className="dot" style={{ background: c.color, width: 14, height: 14 }} />
            <div className="task-body"><span className="task-title">@{c.name}</span>
              <div className="muted" style={{ fontSize: 12 }}>{n} task{n === 1 ? '' : 's'}</div>
            </div>
            <button className="iconbtn" onClick={() => removeContext(c.id)}>🗑️</button>
          </div>
        )
      })}
      {contexts.length === 0 && <div className="empty"><div className="big">🏷️</div><h3>No contexts yet</h3><p>Add a few above to get started.</p></div>}
    </>
  )
}
