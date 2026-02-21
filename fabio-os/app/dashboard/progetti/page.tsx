'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../layout'
import { getProgetti, upsertProgetto, deleteProgetto } from '@/lib/queries'
import type { Progetto } from '@/types'

const COLORI = ['#111111','#16A34A','#2563EB','#D97706','#9333EA','#EF4444','#0891B2','#BE185D']

export default function ProgettiPage() {
  const { refreshProgetti } = useApp()
  const [progetti, setProgetti] = useState<Progetto[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<Progetto> | null>(null)

  useEffect(() => { getProgetti().then(setProgetti) }, [])

  const refresh = async () => {
    const p = await getProgetti()
    setProgetti(p)
    await refreshProgetti()
  }

  const save = async () => {
    if (!editing?.nome) return
    await upsertProgetto(editing)
    await refresh()
    setModal(false)
    setEditing(null)
  }

  const del = async (id: string) => {
    if (!confirm('Eliminare il progetto e tutti i dati collegati?')) return
    await deleteProgetto(id)
    await refresh()
  }

  const openNew = () => {
    setEditing({ nome: '', descrizione: '', stato: 'attivo', colore: '#111111', mrr: 0, beta_clienti: 0, prezzo: 39, priorita: 1 })
    setModal(true)
  }

  const openEdit = (p: Progetto) => {
    setEditing({ ...p })
    setModal(true)
  }

  const totMrr = progetti.reduce((s, p) => s + p.mrr, 0)

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Portfolio</div>
          <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.03em' }}>Progetti</div>
        </div>
        <button className="btn" onClick={openNew}>+ Nuovo progetto</button>
      </div>

      {/* MRR totale */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700 }}>MRR totale portfolio</span>
        <span style={{ fontWeight: 900, fontSize: 22 }}>€{totMrr}/mese</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {progetti.map(p => {
          const isOpen = open === p.id
          const pct = Math.min(100, Math.round(p.mrr / 2500 * 100))
          return (
            <div key={p.id} style={{ background: '#fff', border: `1px solid ${isOpen ? p.colore : '#E5E5E5'}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                onClick={() => setOpen(isOpen ? null : p.id)}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: p.colore, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>{p.nome.charAt(0)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{p.nome}</span>
                    <span className="badge" style={{ background: p.stato === 'attivo' ? '#F0FDF4' : '#F4F4F4', color: p.stato === 'attivo' ? '#15803D' : '#9CA3AF' }}>{p.stato}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="bar" style={{ width: 180 }}><div className="bar-fill" style={{ width: pct + '%', background: p.colore }} /></div>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>€{p.mrr}/mese · {p.beta_clienti} clienti · €{p.prezzo}/mese</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
                  {[['MRR', `€${p.mrr}`], ['Clienti', p.beta_clienti], ['Prezzo', `€${p.prezzo}`]].map(([l, v]) => (
                    <div key={l as string} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{v}</div>
                      <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {isOpen && (
                <div style={{ borderTop: '1px solid #F0F0F0', padding: '18px 20px', background: '#FAFAFA' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[['Descrizione', p.descrizione || '—'], ['URL', p.url || '—'], ['Repository', p.repo || '—']].map(([k, v]) => (
                      <div key={k as string}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                        <div style={{ fontSize: 13 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button className="btn" onClick={() => openEdit(p)} style={{ fontSize: 12 }}>Modifica</button>
                    <button className="btn-ghost" onClick={() => del(p.id)} style={{ fontSize: 12, color: '#EF4444', borderColor: '#FECACA' }}>Elimina</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {progetti.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#C5C5C5' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>◈</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Nessun progetto ancora</div>
            <button className="btn" onClick={openNew} style={{ marginTop: 8 }}>Crea il primo progetto</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && editing && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>{editing.id ? 'Modifica progetto' : '+ Nuovo progetto'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <input className="inp" placeholder="Nome progetto *" value={editing.nome || ''} onChange={e => setEditing(x => ({ ...x!, nome: e.target.value }))} />
              <input className="inp" placeholder="Descrizione" value={editing.descrizione || ''} onChange={e => setEditing(x => ({ ...x!, descrizione: e.target.value }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>Prezzo €/mese</div>
                  <input className="inp" type="number" value={editing.prezzo || 39} onChange={e => setEditing(x => ({ ...x!, prezzo: +e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>Clienti beta</div>
                  <input className="inp" type="number" value={editing.beta_clienti || 0} onChange={e => setEditing(x => ({ ...x!, beta_clienti: +e.target.value, mrr: +e.target.value * (editing.prezzo || 39) }))} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>MRR €</div>
                  <input className="inp" type="number" value={editing.mrr || 0} onChange={e => setEditing(x => ({ ...x!, mrr: +e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input className="inp" placeholder="URL (es. https://mastro.app)" value={editing.url || ''} onChange={e => setEditing(x => ({ ...x!, url: e.target.value }))} />
                <input className="inp" placeholder="Repository GitHub" value={editing.repo || ''} onChange={e => setEditing(x => ({ ...x!, repo: e.target.value }))} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Colore</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORI.map(c => (
                    <div key={c} onClick={() => setEditing(x => ({ ...x!, colore: c }))}
                      style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', border: editing.colore === c ? '3px solid #111' : '3px solid transparent' }} />
                  ))}
                </div>
              </div>
              <select className="inp" value={editing.stato || 'attivo'} onChange={e => setEditing(x => ({ ...x!, stato: e.target.value as any }))}>
                <option value="attivo">Attivo</option>
                <option value="pausa">In pausa</option>
                <option value="archiviato">Archiviato</option>
              </select>
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
