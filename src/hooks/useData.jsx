import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { getSupabase } from '../lib/supabase.js'
import * as db from '../lib/db.js'
import { useWorkspace } from './useWorkspace.jsx'
import { useAuth } from './useAuth.jsx'

const DataCtx = createContext(null)

export function DataProvider({ children }) {
  const { activeId } = useWorkspace()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [contexts, setContexts] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  const reload = useCallback(async () => {
    if (!activeId) return
    setLoading(true)
    const [t, p, c, m] = await Promise.all([
      db.listTasks(activeId), db.listProjects(activeId),
      db.listContexts(activeId), db.listMembers(activeId)
    ])
    setTasks(t); setProjects(p); setContexts(c); setMembers(m)
    setLoading(false)
  }, [activeId])

  useEffect(() => { reload() }, [reload])

  // ---- Realtime: keep tasks/projects/contexts in sync across the team ----
  useEffect(() => {
    const sb = getSupabase()
    if (!sb || !activeId) return
    if (channelRef.current) { sb.removeChannel(channelRef.current); channelRef.current = null }

    const applyChange = (setter) => (payload) => {
      setter((prev) => {
        if (payload.eventType === 'INSERT') {
          if (prev.some((r) => r.id === payload.new.id)) return prev
          return [...prev, payload.new]
        }
        if (payload.eventType === 'UPDATE') return prev.map((r) => (r.id === payload.new.id ? payload.new : r))
        if (payload.eventType === 'DELETE') return prev.filter((r) => r.id !== payload.old.id)
        return prev
      })
    }

    const ch = sb.channel(`ws-${activeId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${activeId}` }, applyChange(setTasks))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `workspace_id=eq.${activeId}` }, applyChange(setProjects))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contexts', filter: `workspace_id=eq.${activeId}` }, applyChange(setContexts))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspace_members', filter: `workspace_id=eq.${activeId}` }, () => db.listMembers(activeId).then(setMembers))
      .subscribe()

    channelRef.current = ch
    return () => { sb.removeChannel(ch); channelRef.current = null }
  }, [activeId])

  // ---- Optimistic mutations ----
  const addTask = async (fields) => {
    const row = await db.createTask(activeId, fields, user.id)
    setTasks((p) => (p.some((r) => r.id === row.id) ? p : [...p, row]))
    return row
  }
  const editTask = async (id, fields) => {
    setTasks((p) => p.map((r) => (r.id === id ? { ...r, ...fields } : r)))
    return db.updateTask(id, fields)
  }
  const removeTask = async (id) => {
    setTasks((p) => p.filter((r) => r.id !== id && r.parent_id !== id))
    return db.deleteTask(id)
  }
  const toggleDone = (task) =>
    editTask(task.id, { status: task.status === 'done' ? 'next' : 'done',
                        completed_at: task.status === 'done' ? null : new Date().toISOString() })

  const addProject = async (fields) => {
    const row = await db.createProject(activeId, fields, user.id)
    setProjects((p) => [...p, row]); return row
  }
  const editProject = async (id, fields) => {
    setProjects((p) => p.map((r) => (r.id === id ? { ...r, ...fields } : r)))
    return db.updateProject(id, fields)
  }
  const removeProject = async (id) => {
    setProjects((p) => p.filter((r) => r.id !== id)); return db.deleteProject(id)
  }

  const addContext = async (name, color) => {
    const row = await db.createContext(activeId, name, color)
    setContexts((p) => [...p, row]); return row
  }
  const removeContext = async (id) => {
    setContexts((p) => p.filter((r) => r.id !== id)); return db.deleteContext(id)
  }

  const value = {
    tasks, projects, contexts, members, loading, reload,
    addTask, editTask, removeTask, toggleDone,
    addProject, editProject, removeProject,
    addContext, removeContext
  }
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}

export const useData = () => useContext(DataCtx)
