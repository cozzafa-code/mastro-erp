import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function Home() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Se loggato, vai alla dashboard
  if (user) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#F2F1EC', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'rgba(242,241,236,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(26,26,28,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#1A1A1C', color: '#D08008',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, letterSpacing: -1,
          }}>M</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1C', letterSpacing: -0.5 }}>MASTRO</span>
        </div>
        <Link href="/login" style={{
          padding: '10px 24px', borderRadius: 10,
          background: '#1A1A1C', color: '#F2F1EC',
          fontSize: 14, fontWeight: 600, textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}>
          Accedi →
        </Link>
      </nav>

      {/* HERO */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '100px 32px 80px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px', borderRadius: 100,
          background: 'rgba(208,128,8,0.1)', border: '1px solid rgba(208,128,8,0.2)',
          fontSize: 13, fontWeight: 600, color: '#D08008',
          marginBottom: 24,
        }}>
          L&apos;ERP pensato per i serramentisti
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800, color: '#1A1A1C',
          lineHeight: 1.05, letterSpacing: -2,
          marginBottom: 20,
        }}>
          Gestisci le tue<br />
          <span style={{ color: '#D08008' }}>commesse</span> senza pensieri
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: '#6B6B6F', lineHeight: 1.6,
          maxWidth: 560, margin: '0 auto 40px',
        }}>
          Sopralluoghi, misure, preventivi, ordini, posa — tutto in un unico posto.
          Basta fogli Excel, WhatsApp e foglietti volanti.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{
            padding: '14px 32px', borderRadius: 12,
            background: '#D08008', color: '#fff',
            fontSize: 16, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(208,128,8,0.3)',
          }}>
            Prova MASTRO gratis
          </Link>
          <a href="#funzioni" style={{
            padding: '14px 32px', borderRadius: 12,
            background: '#fff', color: '#1A1A1C',
            fontSize: 16, fontWeight: 600, textDecoration: 'none',
            border: '1px solid rgba(26,26,28,0.1)',
          }}>
            Scopri le funzioni ↓
          </a>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{
        maxWidth: 700, margin: '0 auto 80px',
        padding: '0 32px', textAlign: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 32, flexWrap: 'wrap',
          fontSize: 14, color: '#9B9B9F',
        }}>
          <span>📐 Misure digitali</span>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: '#D0D0D0' }} />
          <span>📋 Pipeline 8 fasi</span>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: '#D0D0D0' }} />
          <span>☁️ Cloud · nessuna installazione</span>
        </div>
      </section>

      {/* FUNZIONI */}
      <section id="funzioni" style={{
        maxWidth: 1000, margin: '0 auto',
        padding: '0 32px 80px',
      }}>
        <h2 style={{
          fontSize: 32, fontWeight: 800, color: '#1A1A1C',
          textAlign: 'center', marginBottom: 48,
          letterSpacing: -1,
        }}>
          Tutto quello che ti serve, niente di più
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {[
            { ico: '🔍', title: 'Sopralluoghi', desc: 'Pianifica visite, registra blocchi, tieni traccia di ogni sopralluogo con foto e note.' },
            { ico: '📐', title: 'Misure digitali', desc: '6 punti + 2 diagonali per vano. Controllo fuori squadra automatico. Report istantaneo.' },
            { ico: '📋', title: 'Pipeline commesse', desc: '8 fasi da Sopralluogo a Chiusura. Sai sempre a che punto è ogni lavoro.' },
            { ico: '📅', title: 'Agenda integrata', desc: 'Calendario giorno, settimana, mese. Ogni evento collegato alla commessa.' },
            { ico: '💬', title: 'Messaggi', desc: 'Comunicazione centralizzata con clienti e fornitori. Rubrica integrata.' },
            { ico: '⚙️', title: 'Configuratore', desc: 'Sistemi, colori, vetri, coprifili, lamiere. Tutto personalizzabile per la tua azienda.' },
          ].map((f, i) => (
            <div key={i} style={{
              padding: 28, borderRadius: 16,
              background: '#fff',
              border: '1px solid rgba(26,26,28,0.06)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.ico}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1C', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#6B6B6F', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CHI È PER */}
      <section style={{
        maxWidth: 700, margin: '0 auto',
        padding: '60px 32px',
      }}>
        <div style={{
          padding: 40, borderRadius: 20,
          background: '#1A1A1C', color: '#F2F1EC',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, letterSpacing: -0.5 }}>
            Costruito da chi fa serramenti,<br />per chi fa serramenti.
          </h2>
          <p style={{ fontSize: 15, color: '#9B9B9F', lineHeight: 1.7, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
            MASTRO nasce in cantiere, non in Silicon Valley.
            Sappiamo cosa serve perché lo usiamo ogni giorno.
          </p>
          <Link href="/login" style={{
            display: 'inline-block',
            padding: '14px 32px', borderRadius: 12,
            background: '#D08008', color: '#fff',
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
          }}>
            Inizia ora — è gratuito
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        maxWidth: 1000, margin: '0 auto',
        padding: '40px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
        borderTop: '1px solid rgba(26,26,28,0.06)',
        fontSize: 13, color: '#9B9B9F',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: '#1A1A1C', color: '#D08008',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800,
          }}>M</div>
          <span>MASTRO ERP</span>
        </div>
        <div>© {new Date().getFullYear()} MASTRO · ERP per serramentisti</div>
      </footer>
    </div>
  )
}
