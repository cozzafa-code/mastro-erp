'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()
  const sb = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    if (mode === 'login') {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) { setMsg(error.message); setLoading(false); return }
      router.push('/dashboard')
    } else {
      const { error } = await sb.auth.signUp({ email, password })
      if (error) { setMsg(error.message); setLoading(false); return }
      setMsg('Controlla la tua email per confermare la registrazione.')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F5F5F5',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: 400, maxWidth: '95vw' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, background: '#111', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 22, fontWeight: 900, color: '#fff'
          }}>F</div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.03em' }}>FABIO OS</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            Il sistema operativo del founder
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>
            {mode === 'login' ? 'Accedi al tuo workspace' : 'Crea il tuo account'}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="inp"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="inp"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {msg && (
              <div style={{
                padding: '9px 12px', borderRadius: 8, fontSize: 12,
                background: msg.includes('email') ? '#F0FDF4' : '#FFF5F5',
                color: msg.includes('email') ? '#15803D' : '#EF4444',
                border: `1px solid ${msg.includes('email') ? '#BBF7D0' : '#FECACA'}`
              }}>{msg}</div>
            )}
            <button className="btn" type="submit" disabled={loading} style={{ padding: '11px 0', marginTop: 4 }}>
              {loading ? '...' : mode === 'login' ? 'Accedi' : 'Registrati'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E5E5E5' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>oppure</span>
            <div style={{ flex: 1, height: 1, background: '#E5E5E5' }} />
          </div>

          <button onClick={handleGoogle} className="btn-ghost" style={{ width: '100%', padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continua con Google
          </button>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#9CA3AF' }}>
            {mode === 'login' ? 'Non hai un account? ' : 'Hai già un account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{ background: 'none', border: 'none', color: '#111', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
              {mode === 'login' ? 'Registrati' : 'Accedi'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#C5C5C5' }}>
          Costruito da un founder, per i founder.
        </div>
      </div>
    </div>
  )
}
