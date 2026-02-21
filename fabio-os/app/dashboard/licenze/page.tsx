'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../layout'
import { getClienti, upsertCliente, deleteCliente } from '@/lib/queries'
import type { Cliente } from '@/types'

const STATO_COL: Record<string, { fg: string, bg: string }> = {
  trial: { fg: '#D97706', bg: '#FFF7ED' },
  attivo: { fg: '#15803D', bg: '#F0FDF4' },
  scaduto: { fg: '#EF4444', bg: '#FFF5F5' },
  churned: { fg: '#9CA3AF', bg: '#F4F4F4' },
  sospeso: { fg: '#6B7280', bg: '#F4F4F4' },
}

const PIANO_LABEL: Record<string, string> = { trial: 'Trial', free: 'Free', pro: 'Pro', business: 'Business', custom: 'Custom' }

export default function LicenzePage() {
  const { progetti } = useApp()
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState('tutti')
  const [filtroProj, setFiltroProj] = useState('tutti')
  const [open, setOpen] = useState<string | null>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<Cliente> | null>(null)

  useEffect(() => { getClienti().then(setClienti) }, [])

  const refresh = async () => { const c = await getClienti(); setClienti(c) }

  const save = async () => {
    if (!editing?.nome || !editing?.progetto_id) return
    await upsertCliente(editing)
    await refresh()
    setModal(false)
    setEditing(null)
  }

  const visibili = clienti.filter(c =>
    (filtro === 'tutti' || c.stato === filtro) &&
    (filtroProj === 'tutti' || c.progetto_id === filtroProj)
  )

  const mrrTot = clienti.filter(c => c.stato === 'attivo').reduce((s, c) => s + c.mrr, 0)
  const trial = clienti.filter(c => c.stato === 'trial').length
  const attivi = clienti.filter(c => c.stato === 'attivo').length
  const churned = clienti.filter(c => c.stato === 'churned').length

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>SaaS</div>
          <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.03em' }}>Licenze & Clienti</div>
        </div>
        <button className="btn" onClick={() => { setEditing({ piano: 'trial', stato: 'trial', mrr: 0 }); setModal(true) }}>+ Nuovo cliente</button>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'MRR attivo', v: `€${mrrTot}`, bt: '#22C55E' },
          { l: 'Clienti attivi', v: attivi, bt: '#111' },
          { l: 'Trial in corso', v: trial, bt: '#D97706' },
          { l: 'Churn totale', v: churned, bt: '#EF4444' },
          { l: 'Conv. trial→paid', v: mrrTot > 0 ? Math.round(attivi / (attivi + trial) * 100) + '%' : '—', bt: '#E5E5E5' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px', borderTop: `3px solid ${k.bt}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Filtri */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div className="tab-bar">
          {[['tutti', 'Tutti'], ['trial', 'Trial'], ['attivo', 'Attivi'], ['churned', 'Churned']].map(([v, l]) => (
            <button key={v} className={`tab-btn ${filtro === v ? 'active' : ''}`} onClick={() => setFiltro(v)}>{l}</button>
          ))}
        </div>
        <select className="inp" style={{ width: 180 }} value={filtroProj} onChange={e => setFiltroProj(e.target.value)}>
          <option value="tutti">Tutti i progetti</option>
          {progetti.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      {/* Lista clienti */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {visibili.map(c => {
          const isOpen = open === c.id
          const st = STATO_COL[c.stato] || { fg: '#9CA3AF', bg: '#F4F4F4' }
          const prog = progetti.find(p => p.id === c.progetto_id)
          return (
            <div key={c.id} style={{ background: '#fff', border: `1px solid ${isOpen ? '#111' : '#E5E5E5'}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }} onClick={() => setOpen(isOpen ? null : c.id)}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: prog?.colore || '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{c.nome.charAt(0).toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{c.nome}</span>
                    {c.azienda && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{c.azienda}</span>}
                    <span className="badge" style={{ background: st.bg, color: st.fg }}>{c.stato}</span>
                    <span className="badge" style={{ background: '#F4F4F4', color: '#6B7280' }}>{PIANO_LABEL[c.piano]}</span>
                    {prog && <span className="badge" style={{ background: prog.colore + '20', color: prog.colore }}>{prog.nome}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.email || '—'}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{c.mrr > 0 ? `€${c.mrr}/mese` : '—'}</div>
              </div>
              {isOpen && (
                <div style={{ borderTop: '1px solid #F0F0F0', padding: '14px 18px', background: '#FAFAFA', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    ['Trial inizio', c.trial_inizio || '—'],
                    ['Trial fine', c.trial_fine || '—'],
                    ['Attivazione', c.attivazione || '—'],
                    ['Ultimo accesso', c.ultimo_accesso ? new Date(c.ultimo_accesso).toLocaleDateString('it-IT') : '—'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                  {c.note && <div style={{ gridColumn: '1/-1', fontSize: 12, color: '#555', padding: '8px 0', borderTop: '1px solid #F0F0F0', marginTop: 4 }}>{c.note}</div>}
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, marginTop: 4 }}>
                    <button className="btn" onClick={() => { setEditing({ ...c }); setModal(true) }} style={{ fontSize: 12 }}>Modifica</button>
                    <button className="btn-ghost" onClick={async () => { await deleteCliente(c.id); await refresh() }} style={{ fontSize: 12, color: '#EF4444', borderColor: '#FECACA' }}>Elimina</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {visibili.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#C5C5C5' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>◉</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Nessun cliente ancora</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && editing && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>{editing.id ? 'Modifica cliente' : '+ Nuovo cliente'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <input className="inp" placeholder="Nome *" value={editing.nome || ''} onChange={e => setEditing(x => ({ ...x!, nome: e.target.value }))} />
              <input className="inp" placeholder="Email" value={editing.email || ''} onChange={e => setEditing(x => ({ ...x!, email: e.target.value }))} />
              <input className="inp" placeholder="Azienda" value={editing.azienda || ''} onChange={e => setEditing(x => ({ ...x!, azienda: e.target.value }))} />
              <select className="inp" value={editing.progetto_id || ''} onChange={e => setEditing(x => ({ ...x!, progetto_id: e.target.value }))}>
                <option value="">Seleziona progetto *</option>
                {progetti.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <select className="inp" value={editing.piano || 'trial'} onChange={e => setEditing(x => ({ ...x!, piano: e.target.value as any }))}>
                {['trial', 'free', 'pro', 'business', 'custom'].map(p => <option key={p} value={p}>{PIANO_LABEL[p]}</option>)}
              </select>
              <select className="inp" value={editing.stato || 'trial'} onChange={e => setEditing(x => ({ ...x!, stato: e.target.value as any }))}>
                {Object.keys(STATO_COL).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="inp" type="number" placeholder="MRR €" value={editing.mrr || 0} onChange={e => setEditing(x => ({ ...x!, mrr: +e.target.value }))} />
              <input className="inp" placeholder="Data attivazione" value={editing.attivazione || ''} onChange={e => setEditing(x => ({ ...x!, attivazione: e.target.value }))} />
              <div style={{ gridColumn: '1/-1' }}>
                <textarea className="inp" rows={2} placeholder="Note..." value={editing.note || ''} onChange={e => setEditing(x => ({ ...x!, note: e.target.value }))} style={{ resize: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1, padding: 11 }} onClick={save}>Salva</button>
              <button className="btn-ghost" style={{ padding: '11px 20px' }} onClick={() => setModal(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
