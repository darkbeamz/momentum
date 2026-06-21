import { useEffect, useRef } from 'react'
import { useData } from './useData.jsx'

// Fires a local notification when a task's remind_at time arrives while the app is open.
const FIRED_KEY = 'momentum_fired_reminders'

function loadFired() { try { return new Set(JSON.parse(localStorage.getItem(FIRED_KEY) || '[]')) } catch { return new Set() } }
function saveFired(set) { localStorage.setItem(FIRED_KEY, JSON.stringify([...set].slice(-200))) }

export function useReminders() {
  const { tasks } = useData()
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  useEffect(() => {
    const fired = loadFired()
    const tick = () => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      const now = Date.now()
      for (const t of tasksRef.current) {
        if (!t.remind_at || t.status === 'done' || fired.has(t.id)) continue
        const at = new Date(t.remind_at).getTime()
        if (at <= now && now - at < 60 * 60 * 1000) { // within the last hour
          new Notification('⏰ ' + t.title, { body: t.notes || 'Reminder from Momentum', tag: t.id })
          fired.add(t.id); saveFired(fired)
        }
      }
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])
}
