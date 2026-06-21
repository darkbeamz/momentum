import { useEffect, useState } from 'react'
import Sheet from './Sheet.jsx'
import Avatar from './Avatar.jsx'
import { useData } from '../hooks/useData.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import * as db from '../lib/db.js'
import { STATUS, STATUS_ORDER, ENERGY, PRIORITY, formatDateTime } from '../lib/gtd.js'

export default function TaskEditor({ task, open, onClose }) {
  const { projects, contexts, members, tasks, addTask, editTask, removeTask, toggleDone } = useData()
  const { user } = useAuth()
  const [form, setForm] = useState({})
  const [tagInput, setTagInput] = useState('')
  const [subInput, setSubInput] = useState('')
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [saving, setSaving] = useState(false)

  const isNew = !task?.id
  const subtasks = tasks.filter((t) => t.parent_id === task?.id)

  useEffect(() => {
    if (!open) return
    setForm({
      title: task?.title || '', notes: task?.notes || '', status: task?.status || 'inbox',
      project_id: task?.project_id || '', context_id: task?.context_id || '',
      assignee_id: task?.assignee_id || '', due_date: task?.due_date || '',
      remind_at: task?.remind_at ? task.remind_at.slice(0, 16) : '',
      energy: task?.energy || '', priority: task?.priority ?? 0, tags: task?.tags || []
    })
    setTagInput(''); setSubInput(''); setCommentInput('')
    if (task?.id) db.listComments(task.id).then(setComments).catch(() => {})
    else setComments([])
  }, [open, task])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const payload = () => ({
    title: form.title.trim(), notes: form.notes || null, status: form.status,
    project_id: form.project_id || null, context_id: form.context_id || null,
    assignee_id: form.assignee_id || null, due_date: form.due_date || null,
    remind_at: form.remind_at ? new Date(form.remind_at).toISOString() : null,
    energy: form.energy || null, priority: Number(form.priority) || 0, tags: form.tags
  })

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (isNew) await addTask(payload())
      else await editTask(task.id, payload())
      onClose()
    } finally { setSaving(false) }
  }

  const addTag = () => {
    const v = tagInput.trim().replace(/^#/, '')
    if (v && !form.tags.includes(v)) set('tags', [...form.tags, v])
    setTagInput('')
  }
  const addSub = async () => {
    if (!subInput.trim() || isNew) return
    await addTask({ title: subInput.trim(), parent_id: task.id, project_id: task.project_id, status: 'next' })
    setSubInput('')
  }
  const sendComment = async () => {
    if (!commentInput.trim() || isNew) return
    const row = await db.addComment(task.id, commentInput.trim(), user.id)
    setComments((c) => [...c, { ...row, author: { full_name: user.user_metadata?.full_name, email: user.email, id: user.id } }])
    setCommentInput('')
  }

  return (
    <Sheet open={open} onClose={onClose} title={isNew ? 'New task' : 'Edit task'}>
      <div className="field">
        <input className="input" placeholder="What needs to be done?" autoFocus
          value={form.title || ''} onChange={(e) => set('title', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && save()} />
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea className="textarea" placeholder="Details, links, next steps…"
          value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="field">
        <label>List (GTD status)</label>
        <div className="pills">
          {STATUS_ORDER.map((s) => (
            <button key={s} className={`pill ${form.status === s ? 'active' : ''}`} onClick={() => set('status', s)}>
              {STATUS[s].icon} {STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Project</label>
          <select className="input" value={form.project_id || ''} onChange={(e) => set('project_id', e.target.value)}>
            <option value="">— None —</option>
            {projects.filter((p) => p.status !== 'archived').map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Context</label>
          <select className="input" value={form.context_id || ''} onChange={(e) => set('context_id', e.target.value)}>
            <option value="">— None —</option>
            {contexts.map((c) => <option key={c.id} value={c.id}>@{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Assign to</label>
        <select className="input" value={form.assignee_id || ''} onChange={(e) => set('assignee_id', e.target.value)}>
          <option value="">— Unassigned —</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.profiles?.full_name || m.profiles?.email || m.user_id.slice(0, 8)}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="field">
          <label>Due date</label>
          <input type="date" className="input" value={form.due_date || ''} onChange={(e) => set('due_date', e.target.value)} />
        </div>
        <div className="field">
          <label>Reminder</label>
          <input type="datetime-local" className="input" value={form.remind_at || ''} onChange={(e) => set('remind_at', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Priority</label>
        <div className="pills">
          {Object.entries(PRIORITY).map(([k, v]) => (
            <button key={k} className={`pill ${Number(form.priority) === Number(k) ? 'active' : ''}`}
              onClick={() => set('priority', Number(k))}>
              <span className="dot" style={{ background: v.color }} /> {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Energy</label>
        <div className="pills">
          <button className={`pill ${!form.energy ? 'active' : ''}`} onClick={() => set('energy', '')}>Any</button>
          {Object.entries(ENERGY).map(([k, v]) => (
            <button key={k} className={`pill ${form.energy === k ? 'active' : ''}`} onClick={() => set('energy', k)}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Tags</label>
        <div className="pills" style={{ marginBottom: 8 }}>
          {form.tags?.map((t) => (
            <button key={t} className="pill active" onClick={() => set('tags', form.tags.filter((x) => x !== t))}>#{t} ✕</button>
          ))}
        </div>
        <input className="input" placeholder="Add tag + Enter" value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
      </div>

      {/* Subtasks / checklist */}
      {!isNew && (
        <div className="field">
          <label>Checklist / subtasks {subtasks.length > 0 && `(${subtasks.filter((s) => s.status === 'done').length}/${subtasks.length})`}</label>
          {subtasks.map((s) => (
            <div className="task" key={s.id} style={{ marginBottom: 6 }}>
              <button className={`check ${s.status === 'done' ? 'checked' : ''}`} onClick={() => toggleDone(s)}>✓</button>
              <div className={`task-body ${s.status === 'done' ? 'done' : ''}`}>
                <span className="task-title">{s.title}</span>
              </div>
              <button className="iconbtn" onClick={() => removeTask(s.id)}>🗑️</button>
            </div>
          ))}
          <input className="input" placeholder="Add subtask + Enter" value={subInput}
            onChange={(e) => setSubInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSub())} />
        </div>
      )}

      <div className="row mt">
        <button className="btn" onClick={save} disabled={saving || !form.title?.trim()}>
          {saving ? 'Saving…' : isNew ? 'Add task' : 'Save'}
        </button>
        {!isNew && <button className="btn danger" style={{ flex: '0 0 auto', width: 'auto' }}
          onClick={() => { removeTask(task.id); onClose() }}>Delete</button>}
      </div>

      {/* Comments */}
      {!isNew && (
        <>
          <div className="divider" />
          <label style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>Comments</label>
          <div className="mt">
            {comments.length === 0 && <p className="muted" style={{ fontSize: 14 }}>No comments yet.</p>}
            {comments.map((c) => (
              <div className="comment" key={c.id}>
                <Avatar profile={c.author} size="sm" />
                <div className="cbody">
                  <div>{c.body}</div>
                  <div className="cmeta">{c.author?.full_name || c.author?.email || 'Someone'} · {formatDateTime(c.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex mt">
            <input className="input" placeholder="Write a comment…" value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()} />
            <button className="btn sm" onClick={sendComment}>Send</button>
          </div>
        </>
      )}
    </Sheet>
  )
}
