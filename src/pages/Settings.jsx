import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Avatar from '../components/Avatar.jsx'

export default function Settings() {
  const { user, signOut } = useAuth()
  const [notif, setNotif] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
  const profile = { full_name: user.user_metadata?.full_name, email: user.email, id: user.id }

  const enableNotif = async () => {
    if (typeof Notification === 'undefined') return
    const p = await Notification.requestPermission()
    setNotif(p)
    if (p === 'granted') new Notification('Momentum', { body: 'Reminders are on. 🔔' })
  }

  return (
    <>
      <h1 style={{ marginTop: 0 }}>⚙️ Settings</h1>

      <div className="card flex">
        <Avatar profile={profile} size="lg" />
        <div>
          <div style={{ fontWeight: 600 }}>{profile.full_name || 'You'}</div>
          <div className="muted" style={{ fontSize: 13 }}>{profile.email}</div>
        </div>
      </div>

      <div className="section-title">Notifications</div>
      <div className="card between">
        <div><div style={{ fontWeight: 600 }}>Reminders</div>
          <div className="muted" style={{ fontSize: 13 }}>Allow due-date & reminder alerts on this device.</div></div>
        {notif === 'granted'
          ? <span className="chip" style={{ background: 'rgba(34,197,94,.18)', color: '#86efac' }}>On</span>
          : <button className="btn sm" onClick={enableNotif} disabled={notif === 'unsupported'}>Enable</button>}
      </div>

      <div className="section-title">About</div>
      <div className="card">
        <p style={{ marginTop: 0 }}><b>Momentum</b> — a GTD task &amp; project manager.</p>
        <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>
          Capture in the Inbox, clarify into Next Actions / Projects / Waiting / Someday, organise with contexts &amp; tags,
          and stay current with the Weekly Review. Add it to your home screen for the full app experience.
        </p>
      </div>

      <button className="btn danger mt" onClick={signOut}>Sign out</button>
    </>
  )
}
