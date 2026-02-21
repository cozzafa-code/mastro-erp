'use client'
import { useState, useEffect } from 'react'
import { useApp } from '../layout'
import { getCampagne, upsertCampagna, deleteCampagna } from '@/lib/queries'
import type { Campagna } from '@/types'

const CANALI: Record<string, { l: string, col: string, icon: string }> = {
  google:   { l: 'Google Ads',   col: '#4285F4', icon: 'G' },
  meta:     { l: 'Meta Ads',     col: '#1877F2', icon: 'M' },
  linkedin: { l: 'LinkedIn',     col: '#0A66C2', icon: 'in' },
  email:    { l: 'Email Mkt',    col: '#111',    icon: '@' },
  seo:      { l: 'SEO',          col: '#16A34A', icon: '↑' },
  youtube:  { l: 'YouTube',      col: '#FF0000', icon: '▶' },
  altro:    { l: 'Altro',        col: '#9CA3AF', icon: '?' },
}
const OBJ: Record<string, string> = { lead: 'Lead', trial: 'Trial', brand: 'Brand', traffico: 'Traffico', retention: 'Retention' }

export default function CampagnePage() {
  const { progetti } = useApp()
  const [camp, setCamp] = useState<Campagna[]>([])
  const [tab, setTab] = useState('lista')
  const [open, setOpen] = useState<string | null>(null)
  const [detTab, setDetTab] = useState<Record<string, string>>({})
  const [modal, setModal] = useState(false)
  const [nc, setNc] = useState({ nome: '', canale: 'google', obiettivo: 'trial', budget_totale: 0, data_inizio: '', note: '' })

  useEffect(() => { getCampagne().then(setCamp) }, [])
  const refresh = async () => { const c = await getCampagne(); setCamp(c) }

  const totS = camp.reduce((s, c) => s + c.speso, 0)
  const totL = camp.reduce((s, c) => s + (c.leads || 0), 0)
  const totT = camp.reduce((s, c) => s + (c.trial || 0), 0)
  const totI = camp.reduce((s, c) => s + (c.impressioni || 0), 0)
  const totCl = camp.reduce((s, c) => s + (c.click || 0), 0)

  const saveCamp = async (id: string, updates: Partial<Campagna>) => {
    await upsertCampagna({ id, ...updates })
    await refresh()
  }

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Marketing</div>
          <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.03em' }}>Campagne</div>
        </div>
        <button className="btn" onClick={() => setModal(true)}>+ Nuova campagna</button>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'Attive', v: camp.filter(c => c.stato === 'attiva').length, bt: '#111' },
          { l: 'Speso', v: `€${totS}`, bt: '#9CA3AF' },
          { l: 'Impressioni', v: totI > 999 ? (totI / 1000).toFixed(1) + 'k' : totI, bt: '#3B82F6' },
          { l: 'Click', v: totCl, bt: '#3B82F6' },
          { l: 'Lead', v: totL, bt: '#22C55E' },
          { l: 'CPA', v: totL > 0 ? `€${(totS / totL).toFixed(0)}` : '—', bt: '#22C55E' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: '12px 14px', borderTop: `3px solid ${k.bt}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs globali */}
      <div className="tab-bar" style={{ marginBottom: 14 }}>
        {[['lista', '📋 Campagne'], ['confronto', '📊 Canali'], ['roi', '💰 ROI']].map(([v, l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {/* TAB LISTA */}
      {tab === 'lista' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {camp.map(c => {
            const can = CANALI[c.canale] || CANALI.altro
            const isOpen = open === c.id
            const pct = c.budget_totale > 0 ? Math.min(100, Math.round(c.speso / c.budget_totale * 100)) : 0
            const stCol = { attiva: '#22C55E', pausa: '#9CA3AF', pianificata: '#D97706', completata: '#111' }[c.stato] || '#9CA3AF'
            const stBg = { attiva: '#F0FDF4', pausa: '#F4F4F4', pianificata: '#FFF7ED', completata: '#F4F4F4' }[c.stato] || '#F4F4F4'
            const dt = detTab[c.id] || 'dati'

            return (
              <div key={c.id} style={{ background: '#fff', border: `1px solid ${isOpen ? can.col : '#E5E5E5'}`, borderRadius: 14, overflow: 'hidden', boxShadow: isOpen ? `0 4px 20px ${can.col}22` : 'none' }}>
                <div style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }} onClick={() => setOpen(isOpen ? null : c.id)}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: can.col, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 12 }}>{can.icon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{c.nome}</span>
                      <span className="badge" style={{ background: stBg, color: stCol }}>{c.stato}</span>
                      <span className="badge" style={{ background: '#F4F4F4', color: '#6B7280' }}>{can.l}</span>
                      <span className="badge" style={{ background: '#F4F4F4', color: '#6B7280' }}>{OBJ[c.obiettivo]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="bar" style={{ width: 160 }}><div className="bar-fill" style={{ width: pct + '%', background: can.col }} /></div>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>€{c.speso}/{c.budget_totale === 0 ? 'free' : `€${c.budget_totale}`}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                    {[['Impr.', c.impressioni > 999 ? (c.impressioni / 1000).toFixed(1) + 'k' : c.impressioni || 0], ['Click', c.click || 0], ['Lead', c.leads || 0], ['Trial', c.trial || 0]].map(([l, v]) => (
                      <div key={l as string} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{v}</div>
                        <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #F0F0F0', background: '#FAFAFA' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', background: '#fff' }}>
                      {[['dati', '📊 Dati'], ['metriche', '✏️ Aggiorna'], ['note', '📝 Note']].map(([tv, tl]) => (
                        <button key={tv} onClick={() => setDetTab(p => ({ ...p, [c.id]: tv }))}
                          style={{ padding: '9px 15px', border: 'none', borderBottom: `2px solid ${dt === tv ? can.col : 'transparent'}`, background: 'transparent', fontSize: 11, fontWeight: dt === tv ? 700 : 500, color: dt === tv ? '#111' : '#9CA3AF', cursor: 'pointer' }}>{tl}</button>
                      ))}
                      <div style={{ marginLeft: 'auto', padding: '5px 14px', display: 'flex', gap: 5, alignItems: 'center' }}>
                        {c.stato === 'attiva' && <button onClick={() => saveCamp(c.id, { stato: 'pausa' })} style={{ padding: '3px 10px', background: '#F4F4F4', border: '1px solid #E5E5E5', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>⏸</button>}
                        {c.stato === 'pausa' && <button onClick={() => saveCamp(c.id, { stato: 'attiva' })} style={{ padding: '3px 10px', background: '#111', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>▶</button>}
                        <button onClick={async () => { await deleteCampagna(c.id); await refresh() }} style={{ padding: '3px 8px', background: 'none', border: '1px solid #F0F0F0', borderRadius: 7, fontSize: 12, color: '#D1D5DB', cursor: 'pointer' }}>×</button>
                      </div>
                    </div>

                    {dt === 'dati' && (
                      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                        {[
                          ['Budget', `€${c.budget_totale}`], ['Speso', `€${c.speso}`], ['Consumo', pct + '%'],
                          ['Impressioni', (c.impressioni || 0).toLocaleString('it-IT')], ['Click', (c.click || 0).toLocaleString('it-IT')],
                          ['CTR', (c.ctr || 0) + '%'], ['CPC', `€${c.cpc || 0}`], ['Lead', c.leads || 0],
                          ['Trial', c.trial || 0], ['CPA', c.cpa > 0 ? `€${c.cpa}` : '—'], ['ROAS', c.roas > 0 ? c.roas + 'x' : '—'],
                          ['Inizio', c.data_inizio || '—'], ['Fine', c.data_fine || '∞'],
                        ].map(([k, v]) => (
                          <div key={k as string} style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 8, padding: '8px 12px' }}>
                            <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {dt === 'metriche' && (
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 11, color: '#15803D', marginBottom: 12, fontWeight: 600 }}>✓ Modifiche salvate automaticamente (Tab o click fuori)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                          {[
                            { k: 'budget_totale', l: 'Budget €' }, { k: 'speso', l: 'Speso €' },
                            { k: 'impressioni', l: 'Impressioni' }, { k: 'click', l: 'Click' },
                            { k: 'leads', l: 'Lead' }, { k: 'trial', l: 'Trial' },
                            { k: 'ctr', l: 'CTR %' }, { k: 'cpc', l: 'CPC €' },
                            { k: 'cpa', l: 'CPA €' }, { k: 'roas', l: 'ROAS x' },
                          ].map(({ k, l }) => (
                            <div key={k}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                              <input className="inp" type="number" defaultValue={(c as any)[k] || 0} style={{ fontSize: 12 }}
                                onBlur={e => saveCamp(c.id, { [k]: parseFloat(e.target.value) || 0 })} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dt === 'note' && (
                      <div style={{ padding: '16px 20px' }}>
                        <textarea defaultValue={c.note || ''} rows={5} onBlur={e => saveCamp(c.id, { note: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E5E5', borderRadius: 9, fontSize: 12, lineHeight: 1.7, outline: 'none', resize: 'none', background: '#fff' }}
                          placeholder="Note, target audience, osservazioni..." />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {camp.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#C5C5C5' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>◬</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Nessuna campagna ancora</div>
              <button className="btn" onClick={() => setModal(true)}>Crea la prima campagna</button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONFRONTO */}
      {tab === 'confronto' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Object.entries(CANALI).map(([key, can]) => {
            const cc = camp.filter(c => c.canale === key)
            if (cc.length === 0) return null
            const tS = cc.reduce((s, c) => s + c.speso, 0)
            const tL = cc.reduce((s, c) => s + (c.leads || 0), 0)
            const tCl = cc.reduce((s, c) => s + (c.click || 0), 0)
            return (
              <div key={key} className="card" style={{ padding: '15px 18px', borderTop: `3px solid ${can.col}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: can.col, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 11 }}>{can.icon}</span>
                  </div>
                  <span style={{ fontWeight: 800 }}>{can.l}</span>
                </div>
                {[['Campagne', cc.length], ['Speso', `€${tS}`], ['Click', tCl.toLocaleString('it-IT')], ['Lead', tL], ['CPA', tL > 0 ? `€${(tS / tL).toFixed(0)}` : '—']].map(([k, v]) => (
                  <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #F5F5F5' }}>
                    <span style={{ color: '#9CA3AF' }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* TAB ROI */}
      {tab === 'roi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Funnel di conversione</div>
            {(() => {
              const steps = [
                { fl: 'Impressioni', fv: totI, fpct: 100 },
                { fl: 'Click', fv: totCl, fpct: totI > 0 ? Math.round(totCl / totI * 100) : 0 },
                { fl: 'Lead', fv: totL, fpct: totCl > 0 ? Math.round(totL / totCl * 100) : 0 },
                { fl: 'Trial', fv: totT, fpct: totL > 0 ? Math.round(totT / totL * 100) : 0 },
                { fl: 'Paganti (stima 30%)', fv: Math.round(totT * 0.3), fpct: totT > 0 ? 30 : 0 },
              ]
              return steps.map((s, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{s.fl}</span>
                    <span style={{ fontWeight: 800 }}>{s.fv.toLocaleString('it-IT')} <span style={{ color: '#9CA3AF', fontSize: 10, fontWeight: 400 }}>({s.fpct}%)</span></span>
                  </div>
                  <div className="bar" style={{ height: 9 }}><div className="bar-fill" style={{ width: s.fpct + '%', background: '#111' }} /></div>
                </div>
              ))
            })()}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>ROI stimato</div>
            {(() => {
              const pg = Math.round(totT * 0.3)
              const mrr2 = pg * 39
              const ltv = mrr2 * 12
              const roi = totS > 0 ? ((ltv - totS) / totS * 100).toFixed(0) : '—'
              return [['Spesa ads', `€${totS}`], ['Trial generati', totT], ['Paganti stimati', `~${pg}`], ['MRR aggiuntivo', `€${mrr2}/mese`], ['LTV 12m', `€${ltv}`], ['ROI stimato', roi !== '—' ? roi + '%' : '—']].map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                  <span style={{ color: '#6B7280' }}>{k}</span><span style={{ fontWeight: 800 }}>{v}</span>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {/* Modal nuova campagna */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>+ Nuova campagna</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <input className="inp" placeholder="Nome campagna *" value={nc.nome} onChange={e => setNc(n => ({ ...n, nome: e.target.value }))} />
              </div>
              <select className="inp" value={nc.canale} onChange={e => setNc(n => ({ ...n, canale: e.target.value }))}>
                {Object.entries(CANALI).map(([k, c]) => <option key={k} value={k}>{c.l}</option>)}
              </select>
              <select className="inp" value={nc.obiettivo} onChange={e => setNc(n => ({ ...n, obiettivo: e.target.value }))}>
                {Object.entries(OBJ).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input className="inp" type="number" placeholder="Budget totale €" value={nc.budget_totale || ''} onChange={e => setNc(n => ({ ...n, budget_totale: +e.target.value }))} />
              <input className="inp" placeholder="Data inizio" value={nc.data_inizio} onChange={e => setNc(n => ({ ...n, data_inizio: e.target.value }))} />
              <div style={{ gridColumn: '1/-1' }}>
                <textarea className="inp" rows={2} placeholder="Note, target, obiettivi..." value={nc.note} onChange={e => setNc(n => ({ ...n, note: e.target.value }))} style={{ resize: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1, padding: 11 }} onClick={async () => {
                if (!nc.nome) return
                await upsertCampagna({ nome: nc.nome, canale: nc.canale as any, obiettivo: nc.obiettivo as any, stato: 'pianificata', budget_totale: nc.budget_totale, speso: 0, impressioni: 0, click: 0, conversioni: 0, leads: 0, trial: 0, ctr: 0, cpc: 0, cpa: 0, roas: 0, data_inizio: nc.data_inizio || undefined, note: nc.note })
                await refresh()
                setNc({ nome: '', canale: 'google', obiettivo: 'trial', budget_totale: 0, data_inizio: '', note: '' })
                setModal(false)
              }}>Crea campagna</button>
              <button className="btn-ghost" style={{ padding: '11px 20px' }} onClick={() => setModal(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
