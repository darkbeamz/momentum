import TaskList from '../components/TaskList.jsx'
import { useData } from '../hooks/useData.jsx'
import { isOverdue, isToday } from '../lib/gtd.js'

export default function Today() {
  const { tasks, loading } = useData()
  if (loading) return <div className="spinner" />

  const active = tasks.filter((t) => t.status !== 'done' && !t.parent_id)
  const overdue = active.filter((t) => isOverdue(t.due_date))
  const today = active.filter((t) => isToday(t.due_date))
  const reminders = active.filter((t) => t.remind_at && isToday(t.remind_at) && !isToday(t.due_date) && !isOverdue(t.due_date))

  const empty = !overdue.length && !today.length && !reminders.length

  return (
    <>
      <h1 style={{ marginTop: 0 }}>📅 Today</h1>
      <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>
        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {empty && (
        <div className="empty">
          <div className="big">☀️</div>
          <h3>Nothing due today</h3>
          <p>Enjoy a clear schedule, or pull from your Next Actions.</p>
        </div>
      )}

      {overdue.length > 0 && (<>
        <div className="section-title" style={{ color: '#f87171' }}>⚠️ Overdue</div>
        <TaskList tasks={overdue} />
      </>)}
      {today.length > 0 && (<>
        <div className="section-title">Due today</div>
        <TaskList tasks={today} />
      </>)}
      {reminders.length > 0 && (<>
        <div className="section-title">🔔 Reminders today</div>
        <TaskList tasks={reminders} />
      </>)}
    </>
  )
}
