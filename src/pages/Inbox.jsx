import TaskList from '../components/TaskList.jsx'
import { useData } from '../hooks/useData.jsx'

export default function Inbox() {
  const { tasks, loading } = useData()
  if (loading) return <div className="spinner" />
  const items = tasks.filter((t) => t.status === 'inbox' && !t.parent_id)
  return (
    <>
      <div className="between" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>📥 Inbox</h1>
        <span className="muted">{items.length} to process</span>
      </div>
      <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>
        Capture first, organise later. Tap a task to clarify it — give it a project, context, or move it to Next Actions.
      </p>
      <TaskList tasks={items} emptyIcon="🎉" emptyTitle="Inbox zero!"
        emptyHint="Nothing left to process. Tap ＋ to capture a new thought." />
    </>
  )
}
