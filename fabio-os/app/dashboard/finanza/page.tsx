'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../layout'
import { getMovimenti, addMovimento, deleteMovimento, getSpeseCorrenti, upsertSpesa, deleteSpesa } from '@/lib/queries'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Movimento, SpesaCorrente } from '@/types'

const CAT_SPESA: Record<string, string> = {
  'Famiglia': '#111', 'SaaS Tools': '#3B82F6', 'Marketing': '#F59E0B',
  'Abbonamenti': '#8B5CF6', 'Personale': '#EF4444', 'Altro': '#9CA3AF'
}

export default function FinanzaPage() {
  const { progetti } = useApp()
  const [mov, setMov] = useState<Movimento[]>([])
  const [spese, setSpese] = useState<SpesaCorrente[]>([])
  const [tab, setTab] = useState('overview')
  const [movFiltro, setMovFiltro] = useState('tutti')
  const [newMovOpen, setNewMovOpen] = useState(false)
  const [speseOpen, setSpeseOpen] = useState(false)
  const [nm, setNm] = useState({ tipo: 'uscita', cat: 'SaaS Tools', desc: '', imp: '' })
  const [ns, setNs] = useState({ desc: '', cat: 'Famiglia', imp: '', freq: 'mensile' })

  useEffect(() => {
    getMovimenti().then(setMov)
    getSpeseCorrenti().then(setSpese)
  }, [])

  const mrr = progetti.reduce((s, p) => s + p.mrr, 0)
  const speseTot = spese.filter(s => s.attiva).reduce((s, x) => s + x.importo, 0)
  const entratePas = 2100
  const burn = Math.max(0, speseTot - entratePas - mrr)
  const runway = burn > 0 ? Math.floor(130000 / burn) : 459
  const bk = Math.min(100, Math.round(mrr / 2500 * 100))

  const speseByCat = spese.filter(s => s.attiva).reduce((acc: Record<string, number>, s) => {
    acc[s.categoria] = (acc[s.categoria] || 0) + s.importo; return acc
  }, {})

  // Cashflow data
  const cf = Array.from({ length: 12 }, (_, i) => {
    const mese = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'][i]
    const growth = 1 + (i * 0.1)
    const mrrSim = mrr * growth
    const cassa = Math.max(0, 130000 - (burn * i))
    return { mese, cReal: Math.round(cassa), cOtt: Math.round(130000 + mrrSim * i * 0.5), cPess: Math.round(Math.max(0, 130000 - burn * i * 1.3)) }
  })

  const addMov = async () => {
    if (!nm.desc || !nm.imp) return
    await addMovimento({ tipo: nm.tipo as any, categoria: nm.cat, descrizione: nm.desc, importo: +nm.imp, data: new Date().toISOString().split('T')[0], ricorrente: false })
    const updated = await getMovimenti()
    setMov(updated)
    setNm({ tipo: 'uscita', cat: 'SaaS Tools', desc: '', imp: '' })
    setNewMovOpen(false)
  }

  const addSpesa = async () => {
    if (!ns.desc || !ns.imp) return
    await upsertSpesa({ categoria: ns.cat, descrizione: ns.desc, importo: +ns.imp, frequenza: ns.freq as any, attiva: true, ordinamento: 0 })
    const updated = await getSpeseCorrenti()
    setSpese(updated)
    setNs({ desc: '', cat: 'Famiglia', imp: '', freq: 'mensile' })
    setSpeseOpen(false)
  }

  const toggleSpesa = async (s: SpesaCorrente) => {
    await upsertSpesa({ ...s, attiva: !s.attiva })
    const updated = await getSpeseCorrenti()
    setSpese(updated)
  }

  const TABS = [['overview', '📊 Overview'], ['spese', '💸 Spese'], ['movimenti', '📋 Movimenti'], ['cashflow', '📈 Cashflow']]

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Gestione economica</div>
          <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.03em' }}>Finanza</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setNewMovOpen(true)}>+ Movimento</button>
          <button className="btn-ghost" onClick={() => setSpeseOpen(true)}>⚙ Spese correnti</button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Risparmi', v: '€130.000', s: 'Disponibili', bt: '#111' },
          { l: 'Runway', v: `${runway} mesi`, s: `Burn €${burn}/mese`, bt: burn === 0 ? '#22C55E' : '#9CA3AF' },
          { l: 'MRR', v: `€${mrr}`, s: `${bk}% break-even`, bt: '#E5E5E5' },
          { l: 'Break-Even', v: 'Mese 12-15', s: `Mancano €${Math.max(0, 2500 - mrr)}`, bt: '#E5E5E5' },
          { l: 'Spese/mese', v: `€${speseTot}`, s: `${Object.keys(speseByCat).length} categorie`, bt: '#EF4444' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px', borderTop: `3px solid ${k.bt}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{k.l}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{k.v}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>{k.s}</div>
          </div>
        ))}
      </div>

      {/* Break-even bar */}
      <div className="card" style={{ padding: '12px 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Break-Even · Target €2.500/mese</span>
          <span style={{ fontWeight: 800 }}>€{mrr} / €2.500</span>
        </div>
        <div className="bar"><div className="bar-fill" style={{ width: bk + '%', background: '#111' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 5 }}>
          <span>{bk}% raggiunto</span><span>Mancano €{Math.max(0, 2500 - mrr)}/mese</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 14 }}>
        {TABS.map(([v, l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {/* TAB OVERVIEW */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>MRR per progetto</div>
            {progetti.map(p => {
              const pct = Math.min(100, Math.round(p.mrr / 2500 * 100))
              return (
                <div key={p.id} style={{ marginBottom: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: p.colore }} />
                      <span style={{ fontWeight: 600 }}>{p.nome}</span>
                    </div>
                    <span style={{ fontWeight: 800 }}>€{p.mrr}/mese</span>
                  </div>
                  <div className="bar"><div className="bar-fill" style={{ width: pct + '%', background: p.colore }} /></div>
                </div>
              )
            })}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '2px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}>
              <span>MRR Totale</span><span>€{mrr}/mese</span>
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Spese per categoria</div>
              <button onClick={() => setSpeseOpen(true)} className="btn-ghost" style={{ fontSize: 10, padding: '3px 10px' }}>modifica</button>
            </div>
            {Object.entries(speseByCat).sort(([, a], [, b]) => b - a).map(([cat, tot]) => {
              const col = CAT_SPESA[cat] || '#9CA3AF'
              const pct = Math.round(tot / speseTot * 100)
              return (
                <div key={cat} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />
                      <span style={{ fontWeight: 600 }}>{cat}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>€{tot}</span>
                  </div>
                  <div className="bar" style={{ height: 4 }}><div className="bar-fill" style={{ width: pct + '%', background: col }} /></div>
                </div>
              )
            })}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '2px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}>
              <span>Totale uscite</span><span>€{speseTot}/mese</span>
            </div>
          </div>
          <div className="card" style={{ padding: 20, gridColumn: '1/-1' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Bilancio mensile</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', textTransform: 'uppercase', marginBottom: 8 }}>Entrate</div>
                {[['MRR prodotti', `€${mrr}`], ['NASpI', '€1.200'], ['Affitto Cosenza', '€900']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid #F5F5F5' }}>
                    <span style={{ color: '#555' }}>{k}</span><span style={{ fontWeight: 700, color: '#15803D' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, marginTop: 8 }}>
                  <span>Totale</span><span style={{ color: '#15803D' }}>€{mrr + 2100}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', marginBottom: 8 }}>Uscite</div>
                {Object.entries(speseByCat).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid #F5F5F5' }}>
                    <span style={{ color: '#555' }}>{k}</span><span style={{ fontWeight: 700 }}>€{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, marginTop: 8 }}>
                  <span>Totale</span><span style={{ color: '#EF4444' }}>€{speseTot}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Risultato</div>
                {[
                  ['Entrate', `€${mrr + 2100}`],
                  ['Uscite', `€${speseTot}`],
                  ['Saldo', `${mrr + 2100 - speseTot >= 0 ? '+' : '−'}€${Math.abs(mrr + 2100 - speseTot)}`],
                  ['Burn', `€${burn}/mese`],
                  ['Runway', `${runway} mesi`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid #F5F5F5' }}>
                    <span style={{ color: '#555' }}>{k}</span>
                    <span style={{ fontWeight: 800, color: k === 'Saldo' ? (mrr + 2100 - speseTot >= 0 ? '#15803D' : '#EF4444') : '#111' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB SPESE */}
      {tab === 'spese' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Spese ricorrenti ({spese.length})</div>
            <button className="btn" style={{ fontSize: 11 }} onClick={() => setSpeseOpen(true)}>+ Aggiungi</button>
          </div>
          {Object.entries(spese.reduce((acc: Record<string, SpesaCorrente[]>, s) => {
            if (!acc[s.categoria]) acc[s.categoria] = []; acc[s.categoria].push(s); return acc
          }, {})).map(([cat, items]) => {
            const col = CAT_SPESA[cat] || '#9CA3AF'
            const catTot = items.filter(s => s.attiva).reduce((s, x) => s + x.importo, 0)
            return (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, padding: '7px 12px', background: '#F9F9F9', borderRadius: 9 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: col }} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{cat}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 800, color: col }}>€{catTot}/mese</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {items.map(sp => (
                    <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', background: '#fff', border: '1px solid #E5E5E5', borderRadius: 9, opacity: sp.attiva ? 1 : 0.5 }}>
                      <div onClick={() => toggleSpesa(sp)} style={{ width: 17, height: 17, borderRadius: 5, border: `2px solid ${sp.attiva ? '#111' : '#D1D5DB'}`, background: sp.attiva ? '#111' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        {sp.attiva && <svg width="9" height="8" viewBox="0 0 9 8" fill="none"><path d="M1 4L3.5 6.5L8 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{sp.descrizione}</div>
                        <div style={{ fontSize: 10, color: '#9CA3AF' }}>{sp.frequenza}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>€{sp.importo}</div>
                      <button onClick={async () => { await deleteSpesa(sp.id); const u = await getSpeseCorrenti(); setSpese(u) }}
                        style={{ padding: '2px 8px', background: 'none', border: '1px solid #F0F0F0', borderRadius: 6, fontSize: 12, color: '#D1D5DB', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 14, padding: '11px 16px', background: '#F4F4F4', borderRadius: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Totale attive</span>
            <span style={{ fontWeight: 800, fontSize: 18 }}>€{speseTot}/mese</span>
          </div>
        </div>
      )}

      {/* TAB MOVIMENTI */}
      {tab === 'movimenti' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="tab-bar">
              {[['tutti', 'Tutti'], ['entrata', 'Entrate'], ['uscita', 'Uscite']].map(([v, l]) => (
                <button key={v} className={`tab-btn ${movFiltro === v ? 'active' : ''}`} onClick={() => setMovFiltro(v)}>{l}</button>
              ))}
            </div>
            <button className="btn" style={{ fontSize: 11 }} onClick={() => setNewMovOpen(true)}>+ Nuovo</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {mov.filter(m => movFiltro === 'tutti' || m.tipo === movFiltro).map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px', background: '#fff', border: '1px solid #E5E5E5', borderRadius: 11 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: m.tipo === 'entrata' ? '#F0FDF4' : '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15 }}>
                  {m.tipo === 'entrata' ? '↑' : '↓'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.descrizione}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{m.categoria} · {m.data}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: m.tipo === 'entrata' ? '#15803D' : '#374151' }}>
                  {m.tipo === 'entrata' ? '+' : '−'}€{m.importo}
                </div>
                <button onClick={async () => { await deleteMovimento(m.id); const u = await getMovimenti(); setMov(u) }}
                  style={{ padding: '2px 8px', background: 'none', border: '1px solid #F0F0F0', borderRadius: 6, fontSize: 12, color: '#D1D5DB', cursor: 'pointer' }}>×</button>
              </div>
            ))}
            {mov.filter(m => movFiltro === 'tutti' || m.tipo === movFiltro).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#C5C5C5', fontSize: 13 }}>Nessun movimento</div>
            )}
          </div>
        </div>
      )}

      {/* TAB CASHFLOW */}
      {tab === 'cashflow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Cassa disponibile — scenari</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={cf} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="mese" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tickFormatter={v => '€' + Math.round(v / 1000) + 'k'} tick={{ fontSize: 11, fill: '#9CA3AF' }} width={52} />
                <Tooltip formatter={(v: number) => ['€' + v.toLocaleString('it-IT')]} contentStyle={{ borderRadius: 8, border: '1px solid #E5E5E5', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="cOtt" name="Ottimistico" stroke="#111" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cReal" name="Realistico" stroke="#6B7280" strokeWidth={2} dot={false} strokeDasharray="6 3" />
                <Line type="monotone" dataKey="cPess" name="Pessimistico" stroke="#D1D5DB" strokeWidth={2} dot={false} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MODAL MOVIMENTO */}
      {newMovOpen && (
        <div className="modal-overlay" onClick={() => setNewMovOpen(false)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 18 }}>+ Movimento</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['entrata', '↑ Entrata'], ['uscita', '↓ Uscita']].map(([v, l]) => (
                  <button key={v} onClick={() => setNm(n => ({ ...n, tipo: v }))}
                    style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: nm.tipo === v ? (v === 'entrata' ? '#F0FDF4' : '#FFF5F5') : '#F4F4F4', color: nm.tipo === v ? (v === 'entrata' ? '#15803D' : '#EF4444') : '#9CA3AF' }}>
                    {l}
                  </button>
                ))}
              </div>
              <input className="inp" placeholder="Descrizione" value={nm.desc} onChange={e => setNm(n => ({ ...n, desc: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="inp" style={{ flex: 1 }} value={nm.cat} onChange={e => setNm(n => ({ ...n, cat: e.target.value }))}>
                  {['MRR', 'Passiva', 'SaaS Tools', 'Marketing', 'Famiglia', 'Altro'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="inp" style={{ width: 100 }} type="number" placeholder="€" value={nm.imp} onChange={e => setNm(n => ({ ...n, imp: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1, padding: 10 }} onClick={addMov}>Aggiungi</button>
              <button className="btn-ghost" style={{ padding: '10px 18px' }} onClick={() => setNewMovOpen(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SPESA */}
      {speseOpen && (
        <div className="modal-overlay" onClick={() => setSpeseOpen(false)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 18 }}>+ Spesa corrente</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <input className="inp" placeholder="Descrizione (es. Figma Pro)" value={ns.desc} onChange={e => setNs(n => ({ ...n, desc: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="inp" style={{ flex: 1 }} value={ns.cat} onChange={e => setNs(n => ({ ...n, cat: e.target.value }))}>
                  {Object.keys(CAT_SPESA).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className="inp" style={{ width: 90 }} type="number" placeholder="€" value={ns.imp} onChange={e => setNs(n => ({ ...n, imp: e.target.value }))} />
                <select className="inp" style={{ width: 120 }} value={ns.freq} onChange={e => setNs(n => ({ ...n, freq: e.target.value }))}>
                  {['mensile', 'annuale', 'una_tantum'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1, padding: 10 }} onClick={addSpesa}>Aggiungi</button>
              <button className="btn-ghost" style={{ padding: '10px 18px' }} onClick={() => setSpeseOpen(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
