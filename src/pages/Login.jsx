import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setErr(''); setOk(''); setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, name)
        if (error) throw error
        setOk('Account created! If email confirmation is on, check your inbox, then sign in.')
        setMode('signin')
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setOk('Password reset email sent.')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
    } catch (e) { setErr(e.message || 'Something went wrong.') }
    finally { setBusy(false) }
  }

  return (
    <div className="auth-wrap">
      <div className="brand">
        <div className="logo">✅</div>
        <h1>Momentum</h1>
        <p>Capture everything. Do the right thing next.</p>
      </div>

      {err && <div className="err">{err}</div>}
      {ok && <div className="ok">{ok}</div>}

      {mode === 'signup' && (
        <div className="field">
          <label>Your name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Doe" />
        </div>
      )}
      <div className="field">
        <label>Email</label>
        <input className="input" type="email" autoCapitalize="none" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      {mode !== 'reset' && (
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>
      )}

      <button className="btn" onClick={submit} disabled={busy}>
        {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
      </button>

      <div className="center mt">
        {mode === 'signin' && <>
          <button className="linkbtn" onClick={() => setMode('signup')}>Create account</button>
          <span className="muted">·</span>
          <button className="linkbtn" onClick={() => setMode('reset')}>Forgot password</button>
        </>}
        {mode !== 'signin' && <button className="linkbtn" onClick={() => setMode('signin')}>← Back to sign in</button>}
      </div>
    </div>
  )
}
