'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'

// Carica MASTRO dinamicamente (client-side only, è una SPA React)
const MastroERP = dynamic(() => import('./MastroERP'), { ssr: false })

interface Props {
  user: { id: string; email?: string }
  azienda: {
    id: string
    ragione: string
    piva: string
    indirizzo: string
    telefono: string
    email: string
    approved: boolean
  } | null
}

export default function MastroApp({ user, azienda }: Props) {
  const supabase = createClient()

  // Se non approvato mostra schermata di attesa
  if (!azienda?.approved) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F2F1EC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        flexDirection: 'column',
        gap: 16,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>⏳</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1C' }}>Accesso in attesa di approvazione</div>
        <div style={{ fontSize: 15, color: '#86868b', maxWidth: 380 }}>
          Il tuo account è in fase di revisione. Ti contatteremo entro 24 ore.
        </div>
        <div style={{ fontSize: 13, color: '#86868b' }}>{user.email}</div>
        <button
          onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
          style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: '1px solid #e5e5ea', background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#86868b' }}
        >
          Esci
        </button>
      </div>
    )
  }

  return <MastroERP user={user} azienda={azienda} supabase={supabase} />
}
