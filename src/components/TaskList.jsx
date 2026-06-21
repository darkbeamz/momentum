import { useState } from 'react'
import TaskEditor from './TaskEditor.jsx'
import Avatar from './Avatar.jsx'
import { useData } from '../hooks/useData.jsx'
import { STATUS, PRIORITY, formatDate, isOverdue, isToday } from '../lib/gtd.js'

function TaskItem({ task, onOpen }) {
  const { toggleDone, projects, contexts, members, tasks } = useData()
  const project = projects.find((p) => p.id === task.project_id)
  const ctx = contexts.find((c) => c.id === task.context_id)
  const assignee = members.find((m) => m.user_id === task.assignee_id)?.profiles
  const subs = tasks.filter((t) => t.parent_id === task.id)
  const subsDone = subs.filter((s) => s.status === 'done').length
  const due = task.due_date
  const dueClass = isOverdue(due) ? 'overdue' : isToday(due) ? 'due' : 'due'

  return (
    <div className={`task ${task.status === 'done' ? 'done' : ''}`}>
      <button className={`check ${task.status === 'done' ? 'checked' : ''}`}
        onClick={(e) => { e.stopPropagation(); toggleDone(task) }}>✓</button>
      <div className="task-body" onClick={() => onOpen(task)}>
        <div className="task-title">
          {task.priority > 0 && <span className="dot" style={{ background: PRIORITY[task.priority].color, display: 'inline-block', marginRight: 6 }} />}
          {task.title}
        </div>
        <div className="task-meta">
          {project && <span className="chip" style={{ background: project.color + '22', color: project.color }}>📁 {project.title}</span>}
          {ctx && <span className="chip ctx" style={{ background: ctx.color }}>@{ctx.name}</span>}
          {due && <span className={`chip ${dueClass}`}>📅 {formatDate(due)}</span>}
          {task.status !== 'done' && task.status !== 'next' && (
            <span className="chip">{STATUS[task.status].icon} {STATUS[task.status].label}</span>
          )}
          {subs.length > 0 && <span className="chip">☑ {subsDone}/{subs.length}</span>}
          {task.tags?.map((t) => <span className="chip" key={t}>#{t}</span>)}
          {assignee && <span className="chip assignee" style={{ paddingLeft: 2 }}><Avatar profile={assignee} size="sm" /></span>}
        </div>
      </div>
    </div>
  )
}

export default function TaskList({ tasks, emptyIcon = '🌱', emptyTitle = 'Nothing here', emptyHint = '' }) {
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const openTask = (t) => { setEditing(t); setOpen(true) }

  if (!tasks.length) {
    return (
      <div className="empty">
        <div className="big">{emptyIcon}</div>
        <h3>{emptyTitle}</h3>
        {emptyHint && <p>{emptyHint}</p>}
      </div>
    )
  }
  return (
    <>
      {tasks.map((t) => <TaskItem key={t.id} task={t} onOpen={openTask} />)}
      <TaskEditor task={editing} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
