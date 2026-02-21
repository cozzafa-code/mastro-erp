'use client'
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../layout'
import { createClient } from '@/lib/supabase/client'
import type { Task, Progetto } from '@/types'

const supabase = createClient()

const PRIORITA_COLORI: Record<string, string> = {
  alta: '#EF4444', media: '#D97706', bassa: '#9CA3AF'
}

const CHI_COLORI: Record<string, string> = {
  fabio: '#2563EB', lidia: '#EC4899', entrambi: '#7C3AED'
}

function fmtTimer(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor(s / 60 % 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
}

export default function OggiPage() {
  const { progetti, mrr, burn, runway } = useApp()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'tutti' | 'fabio' | 'lidia'>('tutti')
  const [nuovoTask, setNuovoTask] = useState('')
  const [nuovoChi, setNuovoChi] = useState<'fabio' | 'lidia' | 'entrambi'>('fabio')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [editNote, setEditNote] = useState<Record<string, string>>({})
  const [editScadenza, setEditScadenza] = useState<Record<string, string>>({})

  // Timer sessione
  const [sessioneAttiva, setSessioneAttiva] = useState(false)
  const [sessioneProgetto, setSessioneProgetto] = useState<Progetto | null>(null)
  const [sessioneTempo, setSessioneTempo] = useState(0)
  const [sessioneNota, setSessioneNota] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    if (sessioneAttiva) {
      timerRef.current = setInterval(() => setSessioneTempo(t => t + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sessioneAttiva])

  async function loadTasks() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('stato', 'aperto')
      .order('ordinamento')
    setTasks(data || [])
    setLoading(false)
  }

  async function aggiungiTask() {
    if (!nuovoTask.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('tasks').insert({
      testo: nuovoTask.trim(), chi: nuovoChi, stato: 'aperto',
      priorita: 'media', user_id: user.id, ordinamento: tasks.length
    }).select().single()
    if (data) { setTasks(t => [...t, data]); setNuovoTask('') }
  }

  async function completaTask(id: string) {
    await supabase.from('tasks').update({ stato: 'fatto' }).eq('id', id)
    setTasks(t => t.filter(x => x.id !== id))
  }

  async function eliminaTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(t => t.filter(x => x.id !== id))
  }

  async function salvaNota(id: string) {
    const nota = editNote[id] ?? ''
    await supabase.from('tasks').update({ nota } as any).eq('id', id)
    setTasks(t => t.map(x => x.id === id ? { ...x, nota } as any : x))
  }

  async function salvaScadenza(id: string) {
    const scadenza = editScadenza[id] ?? null
    await supabase.from('tasks').update({ scadenza } as any).eq('id', id)
    setTasks(t => t.map(x => x.id === id ? { ...x, scadenza } as any : x))
  }

  async function aggiornaPriorita(id: string, priorita: string) {
    await supabase.from('tasks').update({ priorita } as any).eq('id', id)
    setTasks(t => t.map(x => x.id === id ? { ...x, priorita } as any : x))
  }

  const taskFiltrati = filtro === 'tutti' ? tasks : tasks.filter(t => t.chi === filtro || (filtro === 'fabio' && t.chi === 'entrambi') || (filtro === 'lidia' && t.chi === 'entrambi'))
  const breakeven = 2500
  const breakPct = Math.min(100, Math.round((mrr / breakeven) * 100))
  const progettiAttivi = progetti.filter(p => p.stato === 'attivo')

  return (
    <div className="fade">
      {/* Timer sessione overlay */}
      {sessioneAttiva && sessioneProgetto && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 500, background: '#111', color: '#fff', borderRadius: 16, padding: '18px 22px', boxShadow: '0 8px 40px rgba(0,0,0,.4)', minWidth: 280 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 6 }}>Sessione attiva</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: sessioneProgetto.colore }} />
            <div style={{ fontWeight: 800, fontSize: 15 }}>{sessioneProgetto.nome}</div>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>{fmtTimer(sessioneTempo)}</div>
          <textarea
            value={sessioneNota}
            onChange={e => setSessioneNota(e.target.value)}
            placeholder="Note sulla sessione..."
            rows={2}
            style={{ width: '100%', background: '#222', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '8px 10px', fontSize: 12, resize: 'none', marginBottom: 10 }}
          />
          <button onClick={() => { setSessioneAttiva(false); setSessioneProgetto(null); setSessioneTempo(0) }}
            style={{ width: '100%', padding: 9, background: '#EF4444', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            ■ Termina sessione
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>
          {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
        </div>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.03em' }}>Buongiorno, Fabio 👋</div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'MRR', val: `€${mrr.toLocaleString('it')}`, sub: `${breakPct}% del break-even` },
          { label: 'RUNWAY', val: `${runway} mesi`, sub: `Burn €${burn.toLocaleString('it')}/mese` },
          { label: 'PROGETTI ATTIVI', val: progettiAttivi.length, sub: `${progetti.length} totali` },
          { label: 'TASK APERTI', val: tasks.length, sub: `${taskFiltrati.length} visibili` },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{k.val}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Break-even */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Break-Even · Target €{breakeven.toLocaleString('it')}/mese</span>
          <span style={{ fontSize: 13, fontWeight: 800 }}>€{mrr.toLocaleString('it')} / €{breakeven.toLocaleString('it')}</span>
        </div>
        <div className="bar"><div className="bar-fill" style={{ width: `${breakPct}%`, background: '#111' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{breakPct}% raggiunto</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Mancano €{(breakeven - mrr).toLocaleString('it')}/mese</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* TASK */}
        <div>
          {/* Aggiungi task */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              className="inp" placeholder="+ Aggiungi task..."
              value={nuovoTask} onChange={e => setNuovoTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && aggiungiTask()}
              style={{ flex: 1 }}
            />
            <select className="inp" value={nuovoChi} onChange={e => setNuovoChi(e.target.value as any)} style={{ width: 110 }}>
              <option value="fabio">Fabio</option>
              <option value="lidia">Lidia</option>
              <option value="entrambi">Entrambi</option>
            </select>
            <button className="btn" onClick={aggiungiTask} style={{ padding: '9px 14px' }}>+</button>
          </div>

          {/* Filtri */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Task ({taskFiltrati.length})</div>
            <div className="tab-bar">
              {(['tutti', 'fabio', 'lidia'] as const).map(f => (
                <button key={f} className={`tab-btn ${filtro === f ? 'active' : ''}`} onClick={() => setFiltro(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#C5C5C5' }}>Caricamento...</div>
          ) : taskFiltrati.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#C5C5C5' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
              <div>Nessun task aperto</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {taskFiltrati.map(task => {
                const isExpanded = expandedTask === task.id
                const nota = editNote[task.id] ?? (task as any).nota ?? ''
                const scadenza = editScadenza[task.id] ?? (task as any).scadenza ?? ''
                const progetto = progetti.find(p => p.id === task.progetto_id)

                return (
                  <div key={task.id} style={{ background: '#fff', border: `1px solid ${isExpanded ? '#111' : '#E5E5E5'}`, borderRadius: 12, overflow: 'hidden', transition: 'all .15s' }}>
                    {/* Riga principale */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer' }}
                      onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                      <div onClick={e => { e.stopPropagation(); completaTask(task.id) }}
                        style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid #D1D5DB', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F0FDF4')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{task.testo}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, color: CHI_COLORI[task.chi] || '#6B7280', fontWeight: 700 }}>{task.chi}</span>
                          <span style={{ fontSize: 10, color: '#9CA3AF' }}>·</span>
                          <span style={{ fontSize: 10, color: PRIORITA_COLORI[task.priorita] || '#9CA3AF', fontWeight: 600 }}>{task.priorita}</span>
                          {progetto && <><span style={{ fontSize: 10, color: '#9CA3AF' }}>·</span><span style={{ fontSize: 10, color: progetto.colore, fontWeight: 600 }}>{progetto.nome}</span></>}
                          {(task as any).scadenza && <><span style={{ fontSize: 10, color: '#9CA3AF' }}>·</span><span style={{ fontSize: 10, color: '#9CA3AF' }}>📅 {(task as any).scadenza}</span></>}
                          {(task as any).nota && <span style={{ fontSize: 10, color: '#9CA3AF' }}>· 📝</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHI_COLORI[task.chi] || '#D1D5DB' }} />
                        <button onClick={e => { e.stopPropagation(); eliminaTask(task.id) }}
                          style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}>×</button>
                        <span style={{ fontSize: 11, color: isExpanded ? '#111' : '#C5C5C5' }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Pannello espanso */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid #F0F0F0', padding: '14px 14px', background: '#FAFAFA' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                          {/* Priorità */}
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 5 }}>Priorità</div>
                            <div style={{ display: 'flex', gap: 5 }}>
                              {(['alta', 'media', 'bassa'] as const).map(p => (
                                <button key={p} onClick={() => aggiornaPriorita(task.id, p)}
                                  style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                    background: task.priorita === p ? PRIORITA_COLORI[p] : '#F0F0F0',
                                    color: task.priorita === p ? '#fff' : '#6B7280' }}>
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Scadenza */}
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 5 }}>Scadenza</div>
                            <input type="date" className="inp" value={scadenza} style={{ fontSize: 12, padding: '5px 8px' }}
                              onChange={e => setEditScadenza(s => ({ ...s, [task.id]: e.target.value }))}
                              onBlur={() => salvaScadenza(task.id)} />
                          </div>
                        </div>

                        {/* Nota */}
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 5 }}>Note</div>
                          <textarea className="inp" rows={2} placeholder="Aggiungi una nota..."
                            value={nota} style={{ fontSize: 12, lineHeight: 1.6, resize: 'vertical' }}
                            onChange={e => setEditNote(n => ({ ...n, [task.id]: e.target.value }))}
                            onBlur={() => salvaNota(task.id)} />
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button className="btn" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => completaTask(task.id)}>
                            ✓ Completa
                          </button>
                          <button className="btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => salvaNota(task.id)}>
                            Salva nota
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR — Progetti + Timer */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#6B7280', marginBottom: 10 }}>Progetti — Sessione lavoro</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {progettiAttivi.map(p => (
              <div key={p.id} className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.colore, flexShrink: 0 }} />
                  <div style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{p.nome}</div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>€{p.mrr.toLocaleString('it')}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => { setSessioneProgetto(p); setSessioneAttiva(true); setSessioneTempo(0); setSessioneNota('') }}
                    style={{ flex: 1, padding: '6px 10px', background: sessioneProgetto?.id === p.id && sessioneAttiva ? p.colore : '#F5F5F5', color: sessioneProgetto?.id === p.id && sessioneAttiva ? '#fff' : '#111', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {sessioneProgetto?.id === p.id && sessioneAttiva ? `▶ ${fmtTimer(sessioneTempo)}` : '▶ Avvia sessione'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}