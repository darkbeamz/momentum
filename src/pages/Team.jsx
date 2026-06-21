import { useEffect, useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import Sheet from '../components/Sheet.jsx'
import { useWorkspace } from '../hooks/useWorkspace.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useData } from '../hooks/useData.jsx'
import * as db from '../lib/db.js'
import { getSupabase } from '../lib/supabase.js'

export default function Team() {
  const { workspaces, active, activeId, setActiveId, refresh } = useWorkspace()
  const { user } = useAuth()
  const { members, reload } = useData()
  const [invites, setInvites] = useState([])
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [newTeam, setNewTeam] = useState(false)
  const [teamName, setTeamName] = useState('')

  const isOwner = active && active.owner_id === user.id
  const teams = workspaces.filter((w) => !w.is_personal)

  const loadInvites = () => {
    if (activeId && !active?.is_personal) db.listInvites(activeId).then(setInvites).catch(() => {})
    else setInvites([])
  }
  useEffect(loadInvites, [activeId, active])

  const createTeam = async () => {
    if (!teamName.trim()) return
    const ws = await db.createWorkspace(teamName.trim(), user.id)
    setTeamName(''); setNewTeam(false)
    await refresh(); setActiveId(ws.id)
  }

  const invite = async () => {
    setErr(‘’); setMsg(‘’)
    const e = email.trim().toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setErr(‘Enter a valid email.’); return }
    try {
      await db.inviteMember(activeId, e, ‘member’, user.id)
      setEmail(‘’)
      loadInvites()
      // Send invite email via Edge Function (non-blocking — invite is saved regardless)
      try {
        await getSupabase().functions.invoke(‘send-invite’, {
          body: {
            email: e,
            workspaceName: active.name,
            inviterName: user.user_metadata?.full_name || user.email,
            appUrl: window.location.origin,
          },
        })
        setMsg(`Invite sent! ${e} will receive an email with a link to join.`)
      } catch {
        // Email failed but invite is saved — fall back to manual share message
        setMsg(`Invited ${e}. Share the app link with them — they’ll auto-join on signup.`)
      }
    } catch (ex) { setErr(ex.message) }
  }

  return (
    <>
      <h1 style={{ marginTop: 0 }}>👥 Teams</h1>

      <div className="section-title">Your workspaces</div>
      {workspaces.map((w) => (
        <button key={w.id} className={`task ${w.id === activeId ? '' : ''}`} style={{ width: '100%', textAlign: 'left' }}
          onClick={() => setActiveId(w.id)}>
          <span style={{ fontSize: 20 }}>{w.is_personal ? '🔒' : '👥'}</span>
          <div className="task-body"><span className="task-title">{w.name}</span>
            <div className="muted" style={{ fontSize: 12 }}>{w.is_personal ? 'Private — just you' : 'Shared team'}</div>
          </div>
          {w.id === activeId && <span className="chip assignee">Active</span>}
        </button>
      ))}
      <button className="btn ghost mt" onClick={() => setNewTeam(true)}>＋ Create a team workspace</button>

      {active && !active.is_personal && (
        <>
          <div className="section-title">Members of “{active.name}”</div>
          {members.map((m) => (
            <div className="task" key={m.user_id}>
              <Avatar profile={m.profiles} />
              <div className="task-body">
                <span className="task-title">{m.profiles?.full_name || m.profiles?.email || 'Member'}{m.user_id === user.id ? ' (you)' : ''}</span>
                <div className="muted" style={{ fontSize: 12 }}>{m.role}</div>
              </div>
              {isOwner && m.user_id !== user.id &&
                <button className="iconbtn" onClick={() => db.removeMember(activeId, m.user_id).then(reload)}>✕</button>}
            </div>
          ))}

          {invites.length > 0 && <>
            <div className="section-title">Pending invites</div>
            {invites.map((i) => (
              <div className="task" key={i.id}>
                <span style={{ fontSize: 20 }}>✉️</span>
                <div className="task-body"><span className="task-title">{i.email}</span>
                  <div className="muted" style={{ fontSize: 12 }}>Invited · will auto-join on signup</div></div>
                <button className="iconbtn" onClick={() => db.removeInvite(i.id).then(loadInvites)}>✕</button>
              </div>
            ))}
          </>}

          <div className="card mt">
            <label style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>Invite a teammate by email</label>
            {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
            {msg && <div className="ok" style={{ marginTop: 8 }}>{msg}</div>}
            <div className="flex mt">
              <input className="input" type="email" placeholder="teammate@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && invite()} />
              <button className="btn sm" onClick={invite}>Invite</button>
            </div>
            <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>
              They’ll receive an email invite. When they sign up with that address, they’ll land straight in this team and see shared projects in real time.
            </p>
          </div>
        </>
      )}

      {active?.is_personal && (
        <div className="note mt">This is your private workspace. Create a team above to collaborate, assign tasks, and comment with others.</div>
      )}

      <Sheet open={newTeam} onClose={() => setNewTeam(false)} title="New team workspace">
        <div className="field"><label>Team name</label>
          <input className="input" autoFocus placeholder="Marketing Team" value={teamName}
            onChange={(e) => setTeamName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createTeam()} /></div>
        <button className="btn" onClick={createTeam} disabled={!teamName.trim()}>Create team</button>
      </Sheet>
    </>
  )
}
