'use client'
import { useState } from 'react'

const TEMPLATES = [
  {
    id: 'benvenuto',
    nome: 'Benvenuto beta tester',
    oggetto: 'Benvenuto in [PRODOTTO] — sei tra i primi!',
    corpo: `Ciao [NOME],\n\nSono Fabio, il fondatore. Ho costruito questo strumento per risolvere [PROBLEMA].\n\nSei tra i primi beta tester:\n• Accesso gratuito 60 giorni\n• Il tuo feedback guida lo sviluppo\n• Sconto 40% permanente al lancio\n\nPer iniziare: [LINK]\n\nA presto,\nFabio`,
  },
  {
    id: 'followup',
    nome: 'Follow-up dopo 7 giorni',
    oggetto: 'Come sta andando con [PRODOTTO]?',
    corpo: `Ciao [NOME],\n\nSono passati 7 giorni — hai avuto modo di provare [PRODOTTO]?\n\nSe hai domande o difficoltà, sono qui.\nSe ti sta piacendo, mi farebbe piacere sapere cosa funziona meglio.\n\nGrazie,\nFabio`,
  },
  {
    id: 'lancio',
    nome: 'Annuncio lancio',
    oggetto: '[PRODOTTO] è ufficialmente live 🚀',
    corpo: `Ciao [NOME],\n\n[PRODOTTO] è ufficialmente disponibile!\n\nPer i beta tester come te: usa il codice BETA40 per il 40% di sconto permanente.\n\nAccedi ora: [LINK]\n\nGrazie per aver creduto nel progetto.\n\nFabio`,
  },
  {
    id: 'churn',
    nome: 'Recupero churn',
    oggetto: 'Posso chiederti una cosa, [NOME]?',
    corpo: `Ciao [NOME],\n\nHo visto che non usi più [PRODOTTO].\n\nNon ti chiedo di tornare — voglio solo capire cosa non ha funzionato.\n\nAnche una risposta di una riga mi aiuta.\n\nGrazie,\nFabio`,
  },
]

export default function EmailPage() {
  const [tab, setTab] = useState('componi')
  const [to, setTo] = useState('')
  const [oggetto, setOggetto] = useState('')
  const [corpo, setCorpo] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<{to:string,oggetto:string,data:string}[]>([])
  const [msg, setMsg] = useState<{tipo:'ok'|'err',testo:string}|null>(null)

  const loadTemplate = (id: string) => {
    const t = TEMPLATES.find(t => t.id === id)
    if (!t) return
    setTemplateId(id)
    setOggetto(t.oggetto)
    setCorpo(t.corpo)
    setTab('componi')
  }

  const send = async () => {
    if (!to || !oggetto || !corpo) { setMsg({tipo:'err',testo:'Compila tutti i campi'}); return }
    setSending(true); setMsg(null)
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({to, subject: oggetto, html: corpo.replace(/\n/g,'<br>')})
      })
      const data = await res.json()
      if (data.error) { setMsg({tipo:'err',testo:data.error}) }
      else {
        setMsg({tipo:'ok',testo:`Email inviata a ${to}`})
        setSent(s => [{to, oggetto, data: new Date().toLocaleString('it-IT')}, ...s])
        setTo(''); setOggetto(''); setCorpo(''); setTemplateId('')
      }
    } catch(e:any) { setMsg({tipo:'err',testo:e.message}) }
    setSending(false)
  }

  return (
    <div className="fade">
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Comunicazione</div>
        <div style={{fontSize:25,fontWeight:800,letterSpacing:'-.03em'}}>Email</div>
      </div>

      <div className="tab-bar" style={{marginBottom:16}}>
        {[['componi','✉ Componi'],['template','📋 Template'],['inviati',`📤 Inviati (${sent.length})`]].map(([v,l]) => (
          <button key={v} className={`tab-btn ${tab===v?'active':''}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {tab==='componi' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:16}}>
          <div className="card" style={{padding:24}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>Nuova email</div>
            {msg && <div style={{padding:'10px 14px',borderRadius:9,marginBottom:14,fontSize:13,fontWeight:600,background:msg.tipo==='ok'?'#F0FDF4':'#FFF5F5',color:msg.tipo==='ok'?'#15803D':'#EF4444',border:`1px solid ${msg.tipo==='ok'?'#BBF7D0':'#FECACA'}`}}>{msg.tipo==='ok'?'✓ ':'✗ '}{msg.testo}</div>}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div><div style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',marginBottom:4}}>A</div><input className="inp" placeholder="email@destinatario.com" value={to} onChange={e=>setTo(e.target.value)}/></div>
              <div><div style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',marginBottom:4}}>Oggetto</div><input className="inp" placeholder="Oggetto" value={oggetto} onChange={e=>setOggetto(e.target.value)}/></div>
              <div><div style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',marginBottom:4}}>Messaggio</div><textarea className="inp" rows={12} value={corpo} onChange={e=>setCorpo(e.target.value)} style={{resize:'vertical',lineHeight:1.7}}/></div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn" style={{flex:1,padding:11}} onClick={send} disabled={sending}>{sending?'Invio...':'✉ Invia'}</button>
                <button className="btn-ghost" style={{padding:'11px 16px'}} onClick={()=>{setTo('');setOggetto('');setCorpo('');setMsg(null)}}>Pulisci</button>
              </div>
            </div>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'#6B7280'}}>Template rapidi</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {TEMPLATES.map(t => (
                <div key={t.id} onClick={()=>loadTemplate(t.id)} style={{padding:'12px 14px',background:templateId===t.id?'#111':'#fff',color:templateId===t.id?'#fff':'#111',border:`1px solid ${templateId===t.id?'#111':'#E5E5E5'}`,borderRadius:10,cursor:'pointer'}}>
                  <div style={{fontWeight:700,fontSize:13}}>{t.nome}</div>
                  <div style={{fontSize:11,color:'#9CA3AF',marginTop:3}}>{t.oggetto.substring(0,40)}...</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='template' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {TEMPLATES.map(t => (
            <div key={t.id} className="card" style={{padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div><div style={{fontWeight:800,fontSize:15}}>{t.nome}</div><div style={{fontSize:12,color:'#9CA3AF',marginTop:3}}>{t.oggetto}</div></div>
                <button className="btn" style={{fontSize:12}} onClick={()=>loadTemplate(t.id)}>Usa</button>
              </div>
              <pre style={{fontSize:12,color:'#555',lineHeight:1.7,whiteSpace:'pre-wrap',fontFamily:'inherit',background:'#F9F9F9',padding:'12px 14px',borderRadius:9}}>{t.corpo}</pre>
            </div>
          ))}
        </div>
      )}

      {tab==='inviati' && (
        <div>
          {sent.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'#C5C5C5'}}><div style={{fontSize:48,marginBottom:12}}>◫</div><div>Nessuna email inviata</div></div>
          ) : sent.map((s,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',background:'#fff',border:'1px solid #E5E5E5',borderRadius:11,marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:9,background:'#F0FDF4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>✓</div>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{s.oggetto}</div><div style={{fontSize:11,color:'#9CA3AF'}}>A: {s.to}</div></div>
              <div style={{fontSize:11,color:'#9CA3AF'}}>{s.data}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
