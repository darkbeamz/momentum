import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { listWorkspaces } from '../lib/db.js'
import { useAuth } from './useAuth.jsx'

const WsCtx = createContext(null)
const LS = 'momentum_active_ws'

export function WorkspaceProvider({ children }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState([])
  const [activeId, setActiveId] = useState(() => localStorage.getItem(LS) || null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    const ws = await listWorkspaces()
    setWorkspaces(ws)
    setActiveId((cur) => {
      if (cur && ws.some((w) => w.id === cur)) return cur
      return ws[0]?.id || null
    })
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => { if (activeId) localStorage.setItem(LS, activeId) }, [activeId])

  const active = workspaces.find((w) => w.id === activeId) || null

  return (
    <WsCtx.Provider value={{ workspaces, active, activeId, setActiveId, refresh, loading }}>
      {children}
    </WsCtx.Provider>
  )
}

export const useWorkspace = () => useContext(WsCtx)
