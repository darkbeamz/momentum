import { useState } from 'react'
import { saveConfig, getConfig } from '../lib/config.js'

export default function Setup() {
  const cfg = getConfig()
  const [url, setUrl] = useState(cfg.url)
  const [key, setKey] = useState(cfg.anonKey)
  const [err, setErr] = useState('')

  const save = () => {
    if (!/^https:\/\/.+\.supabase\.co/.test(url.trim())) { setErr('That doesn’t look like a Supabase URL (https://xxxx.supabase.co).'); return }
    if (key.trim().length < 30) { setErr('The anon key looks too short — copy the full public anon key.'); return }
    saveConfig({ url, anonKey: key })
    window.location.reload()
  }

  return (
    <div className="auth-wrap">
      <div className="brand">
        <div className="logo">✅</div>
        <h1>Momentum</h1>
        <p>One-time setup — connect your Supabase backend</p>
      </div>
      {err && <div className="err">{err}</div>}
      <div className="note" style={{ marginBottom: 16 }}>
        Create a free project at <b>supabase.com</b>, run the <b>schema.sql</b> in the SQL editor,
        then paste your <b>Project URL</b> and <b>anon public key</b> from Project Settings → API.
      </div>
      <div className="field">
        <label>Supabase Project URL</label>
        <input className="input" placeholder="https://xxxx.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div className="field">
        <label>Anon public key</label>
        <textarea className="textarea" placeholder="eyJhbGciOi…" value={key} onChange={(e) => setKey(e.target.value)} />
      </div>
      <button className="btn" onClick={save}>Connect</button>
      <p className="muted center" style={{ fontSize: 12, marginTop: 16 }}>
        Tip: set <code>VITE_SUPABASE_URL</code> &amp; <code>VITE_SUPABASE_ANON_KEY</code> at build time to skip this screen for everyone.
      </p>
    </div>
  )
}
