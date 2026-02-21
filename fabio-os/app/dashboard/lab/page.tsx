'use client'
import { useState, useEffect } from 'react'
import { getLabIdee, upsertLabIdea } from '@/lib/queries'
import type { LabIdea } from '@/types'

export default function LabPage() {
  const [idee, setIdee] = useState<LabIdea[]>([])
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => { getLabIdee().then(setIdee) }, [])

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>Futuro</div>
          <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.03em' }}>Lab Idee</div>
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', maxWidth: 280, textAlign: 'right', lineHeight: 1.5 }}>
          Nessuna idea si perde.<br />Si sviluppano quando MASTRO genera revenue.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {idee.map(idea => {
          const io = open === idea.id
          return (
            <div key={idea.id} style={{ background: '#fff', border: `1px solid ${io ? '#111' : '#E5E5E5'}`, borderRadius: 14, overflow: 'hidden', boxShadow: io ? '0 4px 20px rgba(0,0,0,.08)' : 'none' }}>
              <div style={{ padding: '13px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }} onClick={() => setOpen(io ? null : idea.id)}>
                <div style={{ fontSize: 18 }}>{'⭐'.repeat(idea.stelle)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{idea.nome}</span>
                    {idea.tag && <span className="badge" style={{ background: '#F4F4F4', color: '#9CA3AF' }}>{idea.tag}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{idea.nota}</div>
                </div>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, flexShrink: 0 }}>{idea.quando}</span>
              </div>
              {io && (
                <div style={{ borderTop: '1px solid #F0F0F0', background: '#FAFAFA', padding: '16px 18px' }} onClick={e => e.stopPropagation()}>
                  <textarea defaultValue={idea.nota || ''} rows={4} onBlur={e => upsertLabIdea({ ...idea, nota: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E5E5', borderRadius: 9, fontSize: 12, lineHeight: 1.7, outline: 'none', resize: 'none', background: '#fff' }}
                    placeholder="Descrivi l'idea, target, monetizzazione..." />
                </div>
              )}
            </div>
          )
        })}
        {idee.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#C5C5C5' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>◌</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Il lab è vuoto — per ora</div>
          </div>
        )}
      </div>
    </div>
  )
}
