import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const sb = getSupabase()

  useEffect(() => {
    if (!sb) { setLoading(false); return }
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user || null,
    loading,
    signUp: (email, password, fullName) =>
      sb.auth.signUp({ email, password, options: { data: { full_name: fullName } } }),
    signIn: (email, password) => sb.auth.signInWithPassword({ email, password }),
    signOut: () => sb.auth.signOut(),
    resetPassword: (email) => sb.auth.resetPasswordForEmail(email)
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
