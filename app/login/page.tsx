'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o password non corretti')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A1C 0%, #2d2d30 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#F2F1EC',
        borderRadius: 20,
        padding: '40px 32px',
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em',
            color: '#1A1A1C', fontFamily: 'Georgia, serif',
          }}>
            MASTRO
          </div>
          <div style={{ fontSize: 11, color: '#86868b', fontWeight: 600, letterSpacing: '0.15em', marginTop: 2 }}>
            ERP SERRAMENTI
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nome@azienda.it"
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #e5e5ea', fontSize: 15, boxSizing: 'border-box',
                background: '#fff', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid #e5e5ea', fontSize: 15, boxSizing: 'border-box',
                background: '#fff', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #ff3b30', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ff3b30', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#86868b' : 'linear-gradient(135deg, #D08008, #b86e06)',
              color: '#fff', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            {loading ? 'Accesso in corso...' : 'Accedi →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#86868b' }}>
          Accesso riservato — contatta l&apos;amministratore
        </div>
      </div>
    </div>
  )
}
