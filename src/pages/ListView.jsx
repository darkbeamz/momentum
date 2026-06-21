import TaskList from '../components/TaskList.jsx'
import { useData } from '../hooks/useData.jsx'
import { STATUS } from '../lib/gtd.js'

export default function ListView({ status }) {
  const { tasks, loading } = useData()
  if (loading) return <div className="spinner" />
  const meta = STATUS[status]
  let items = tasks.filter((t) => t.status === status && !t.parent_id)
  if (status === 'done') items = items.sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))
  return (
    <>
      <h1 style={{ marginTop: 0 }}>{meta.icon} {meta.label}</h1>
      <TaskList tasks={items} emptyIcon={meta.icon} emptyTitle={`No “${meta.label}” items`} />
    </>
  )
}
