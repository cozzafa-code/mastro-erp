'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter, useParams } from 'next/navigation';
import FirmaPad from '@/app/components/FirmaPad';

// ═══════ COLORS ═══════
const C = {
  dk: '#1A1A1C', w: '#fff', bg: '#F7F7F5', g: '#8E8E93', ln: '#E8E8E6',
  bl: '#007AFF', gn: '#34C759', rd: '#FF3B30', or: '#FF9500', pu: '#AF52DE',
  in: '#5856D6', cy: '#5AC8FA',
};
const fCol = {
  lead: '#AF52DE', sopralluogo: '#007AFF', preventivo: '#FF9500', conferma_ordine: '#FF9500',
  ordine_materiale: '#5856D6', arrivo_materiale: '#5856D6', produzione: '#FF9500',
  montaggio: '#FF3B30', saldo: '#34C759', chiusura: '#8E8E93',
};

export default function CommessaPage() {
  // ═══════ STATE ═══════
  const [comm, setComm] = useState(null);
  const [fasi, setFasi] = useState([]);
  const [azioni, setAzioni] = useState([]);
  const [completate, setCompletate] = useState([]);
  const [commFasi, setCommFasi] = useState([]);
  const [emergenze, setEmergenze] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [membro, setMembro] = useState(null);
  const [membri, setMembri] = useState([]);
  const [openFase, setOpenFase] = useState(null);
  const [nota, setNota] = useState('');
  const [showNota, setShowNota] = useState(null);
  const [tab, setTab] = useState('guida');
  const [messaggi, setMessaggi] = useState([]);
  const [msgTesto, setMsgTesto] = useState('');
  const [feedItems, setFeedItems] = useState([]);
  const [pagamenti, setPagamenti] = useState([]);
  const [showPag, setShowPag] = useState(false);
  const [pagTipo, setPagTipo] = useState('acconto');
  const [pagImporto, setPagImporto] = useState('');
  const [showFirma, setShowFirma] = useState(null);
  const [showEmergenza, setShowEmergenza] = useState(false);
  const [emDesc, setEmDesc] = useState('');
  const [emGravita, setEmGravita] = useState('media');
  const [emFoto, setEmFoto] = useState(null);
  const [showInvia, setShowInvia] = useState(null);
  const [documenti, setDocumenti] = useState([]);

  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const msgEndRef = useRef(null);

  // ═══════ LOAD DATA ═══════
  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: m } = await supabase.from('membro').select('*').eq('user_id', user.id).single();
    if (m) setMembro(m);

    const { data: c } = await supabase.from('commessa').select('*').eq('id', params.id).single();
    if (c) { setComm(c); setOpenFase(c.fase_corrente); }

    const { data: mb } = await supabase.from('membro').select('*').eq('azienda_id', m?.azienda_id);
    if (mb) setMembri(mb);

    // Template fasi con nuovi campi
    const { data: f } = await supabase.from('template_fase').select('*').eq('settore_id', 'serramenti').order('ordine');
    if (f) setFasi(f);

    const { data: a } = await supabase.from('template_azione').select('*').order('ordine');
    if (a) setAzioni(a);

    const { data: comp } = await supabase.from('azione_completata').select('*,completata_da_membro:completata_da(nome)').eq('commessa_id', params.id);
    if (comp) setCompletate(comp);

    // Stato fasi per questa commessa
    const { data: cf } = await supabase.from('commessa_fase').select('*').eq('commessa_id', params.id);
    if (cf) setCommFasi(cf);

    // Emergenze
    const { data: em } = await supabase.from('emergenza').select('*,segnalata_da_membro:segnalata_da(nome)').eq('commessa_id', params.id).order('created_at', { ascending: false });
    if (em) setEmergenze(em);

    // Timeline
    const { data: tl } = await supabase.from('timeline').select('*').eq('commessa_id', params.id).order('created_at', { ascending: false });
    if (tl) setTimelineItems(tl);

    // Documenti
    const { data: docs } = await supabase.from('documento').select('*,caricato_da_membro:caricato_da(nome)').eq('commessa_id', params.id).order('created_at');
    if (docs) setDocumenti(docs);

    // Messaggi
    const { data: msg } = await supabase.from('messaggi').select('*,membro:membro_id(nome)').eq('commessa_id', params.id).order('created_at');
    if (msg) setMessaggi(msg);

    // Feed (fallback for timeline if empty)
    const { data: feed } = await supabase.from('feed').select('*,membro:membro_id(nome)').eq('commessa_id', params.id).order('created_at', { ascending: false }).limit(50);
    if (feed) setFeedItems(feed);

    // Pagamenti
    const { data: pag } = await supabase.from('pagamento').select('*,registrato_da_membro:registrato_da(nome)').eq('commessa_id', params.id).order('created_at');
    if (pag) setPagamenti(pag);

    // Inizializza commessa_fase se non esistono
    if (c && f && (!cf || cf.length === 0)) {
      const faseIdx = f.findIndex(fase => fase.codice === c.fase_corrente);
      const inserts = f.map((fase, i) => ({
        commessa_id: params.id,
        fase_codice: fase.codice,
        stato: i === 0 ? 'attiva' : (i <= faseIdx ? 'completata' : 'locked'),
      }));
      await supabase.from('commessa_fase').insert(inserts);
      const { data: cf2 } = await supabase.from('commessa_fase').select('*').eq('commessa_id', params.id);
      if (cf2) setCommFasi(cf2);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === 'chat' && msgEndRef.current) msgEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messaggi, tab]);

  // ═══════ HELPERS ═══════
  function isCompleted(fc, ac) { return completate.find(c => c.fase_codice === fc && c.azione_codice === ac); }

  function getFaseStato(fc) {
    const cf = commFasi.find(x => x.fase_codice === fc);
    if (cf) return cf.stato;
    // Fallback basato su posizione
    const idx = fasi.findIndex(f => f.codice === fc);
    const corrIdx = fasi.findIndex(f => f.codice === comm?.fase_corrente);
    if (idx < corrIdx) return 'completata';
    if (idx === corrIdx) return 'attiva';
    return 'locked';
  }

  function faseCompletata(fc) {
    const faseTemplate = fasi.find(f => f.codice === fc);
    if (!faseTemplate) return false;
    const azFase = azioni.filter(a => a.fase_id === faseTemplate.id);
    return azFase.filter(a => a.obbligatoria).every(a => isCompleted(fc, a.codice));
  }

  function fasePrecedenteOk(fc) {
    const i = fasi.findIndex(f => f.codice === fc);
    if (i <= 0) return true;
    return faseCompletata(fasi[i - 1].codice);
  }

  // ═══════ BLOCCO FASE INTELLIGENTE ═══════
  function checkBloccoFase(fc) {
    const faseTemplate = fasi.find(f => f.codice === fc);
    if (!faseTemplate) return { bloccata: false, motivi: [] };
    const motivi = [];

    // Check emergenze aperte
    const emAperte = emergenze.filter(e => e.fase_codice === fc && e.stato === 'aperta');
    if (emAperte.length > 0) motivi.push('Emergenza aperta: ' + emAperte[0].descrizione);

    // Check azioni obbligatorie con foto
    const azFase = azioni.filter(a => a.fase_id === faseTemplate.id);
    azFase.forEach(az => {
      if (az.obbligatoria && az.richiede_foto) {
        const done = isCompleted(fc, az.codice);
        if (done && !done.foto_url) motivi.push('Foto mancante: ' + az.label);
        if (!done) motivi.push('Azione incompleta: ' + az.label);
      }
      if (az.obbligatoria && az.richiede_firma) {
        const done = isCompleted(fc, az.codice);
        if (done && !done.firma_url) motivi.push('Firma mancante: ' + az.label);
        if (!done) motivi.push('Azione incompleta: ' + az.label);
      }
      if (az.obbligatoria && !isCompleted(fc, az.codice)) {
        if (!motivi.find(m => m.includes(az.label))) motivi.push('Azione incompleta: ' + az.label);
      }
    });

    // Check condizione economica (acconto per ordine_materiale)
    if (fc === 'ordine_materiale') {
      const totPag = pagamenti.reduce((s, p) => s + Number(p.importo), 0);
      if (totPag <= 0) motivi.push('Acconto non ancora ricevuto');
    }

    return { bloccata: motivi.length > 0, motivi };
  }

  // ═══════ COMPLETA AZIONE ═══════
  async function completa(fc, ac, fotoUrl, firmaUrl) {
    if (!membro || isCompleted(fc, ac)) return;
    const stato = getFaseStato(fc);
    if (stato === 'locked') { alert('Completa prima la fase precedente!'); return; }
    if (stato === 'bloccata') { alert('Fase bloccata — risolvi il problema prima!'); return; }

    const az = azioni.find(a => a.codice === ac && a.fase_id === fasi.find(f => f.codice === fc)?.id);
    if (az && az.richiede_foto && !fotoUrl) { alert('Questa azione richiede una foto!'); return; }
    if (az && az.richiede_firma && !firmaUrl) { setShowFirma({ fc, ac }); return; }

    await supabase.from('azione_completata').insert({
      commessa_id: params.id, fase_codice: fc, azione_codice: ac,
      completata_da: membro.id, nota: nota || null,
      foto_url: fotoUrl || null, firma_url: firmaUrl || null,
    });

    // Feed
    await supabase.from('feed').insert({
      azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id,
      tipo: 'azione', testo: membro.nome + ' ha completato "' + (az?.label || ac) + '"' + (firmaUrl ? ' (con firma)' : ''),
      fase_codice: fc, azione_codice: ac,
    });

    // Timeline
    await supabase.from('timeline').insert({
      commessa_id: params.id, azienda_id: comm.azienda_id,
      tipo: 'azione_completata', fase_codice: fc,
      descrizione: (az?.label || ac) + (firmaUrl ? ' (firmato)' : ''),
      membro_id: membro.id, membro_nome: membro.nome,
    });

    // Messaggio sistema in chat
    await supabase.from('messaggi').insert({
      azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id,
      tipo: 'sistema', testo: '✅ ' + membro.nome + ' ha completato: ' + (az?.label || ac),
    });

    setNota(''); setShowNota(null); setShowFirma(null); load();
  }

  // ═══════ INVIA AL PROSSIMO ═══════
  async function inviaAlProssimo(fc) {
    const i = fasi.findIndex(f => f.codice === fc);
    if (i < 0 || i >= fasi.length - 1) return;
    const { bloccata, motivi } = checkBloccoFase(fc);
    if (bloccata) { alert('Non puoi avanzare:\n\n' + motivi.join('\n')); return; }

    const next = fasi[i + 1];

    // Aggiorna commessa_fase
    await supabase.from('commessa_fase').update({ stato: 'completata', completata_da: membro.id, completata_at: new Date().toISOString(), inviata_al_prossimo: true, inviata_at: new Date().toISOString() }).eq('commessa_id', params.id).eq('fase_codice', fc);
    await supabase.from('commessa_fase').update({ stato: 'attiva' }).eq('commessa_id', params.id).eq('fase_codice', next.codice);

    // Aggiorna commessa.fase_corrente
    await supabase.from('commessa').update({ fase_corrente: next.codice, updated_at: new Date().toISOString() }).eq('id', params.id);

    // Feed
    await supabase.from('feed').insert({
      azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id,
      tipo: 'fase', testo: comm.codice + ' → ' + next.nome + (next.responsabile_ruolo ? ' (a ' + next.responsabile_ruolo + ')' : ''),
      fase_codice: next.codice,
    });

    // Timeline
    await supabase.from('timeline').insert({
      commessa_id: params.id, azienda_id: comm.azienda_id,
      tipo: 'fase_completata', fase_codice: fc,
      descrizione: fasi[i].nome + ' completata → passa a ' + next.nome,
      membro_id: membro.id, membro_nome: membro.nome,
    });

    // Messaggio sistema
    await supabase.from('messaggi').insert({
      azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id,
      tipo: 'sistema', testo: '🚀 Fase "' + fasi[i].nome + '" completata! Passa a "' + next.nome + '" → ' + (next.responsabile_ruolo || ''),
    });

    setShowInvia(null); setOpenFase(next.codice); load();
  }

  // ═══════ EMERGENZA ═══════
  async function segnalaEmergenza() {
    if (!emDesc.trim() || !membro) return;
    let fotoUrl = null;
    if (emFoto) {
      const path = comm.id + '/emergenze/' + Date.now() + '.' + emFoto.name.split('.').pop();
      const { error } = await supabase.storage.from('allegati').upload(path, emFoto);
      if (!error) { const { data } = supabase.storage.from('allegati').getPublicUrl(path); fotoUrl = data.publicUrl; }
    }

    await supabase.from('emergenza').insert({
      commessa_id: params.id, azienda_id: comm.azienda_id,
      fase_codice: comm.fase_corrente, segnalata_da: membro.id,
      descrizione: emDesc, foto_url: fotoUrl, gravita: emGravita,
    });

    // Blocca la fase
    await supabase.from('commessa_fase').update({ stato: 'bloccata', bloccata_motivo: emDesc }).eq('commessa_id', params.id).eq('fase_codice', comm.fase_corrente);

    // Feed
    await supabase.from('feed').insert({
      azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id,
      tipo: 'problema', testo: '🚨 ' + membro.nome + ': ' + emDesc,
      fase_codice: comm.fase_corrente,
    });

    // Timeline
    await supabase.from('timeline').insert({
      commessa_id: params.id, azienda_id: comm.azienda_id,
      tipo: 'emergenza_aperta', fase_codice: comm.fase_corrente,
      descrizione: emDesc, membro_id: membro.id, membro_nome: membro.nome,
    });

    // Messaggio sistema
    await supabase.from('messaggi').insert({
      azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id,
      tipo: 'sistema', testo: '🚨 PROBLEMA: ' + emDesc + ' (fase: ' + comm.fase_corrente + ')',
    });

    setShowEmergenza(false); setEmDesc(''); setEmFoto(null); setEmGravita('media'); load();
  }

  async function risolviEmergenza(emId) {
    await supabase.from('emergenza').update({ stato: 'risolta', risolta_da: membro.id, risolta_at: new Date().toISOString() }).eq('id', emId);
    // Sblocca fase se non ci sono altre emergenze aperte
    const altreAperte = emergenze.filter(e => e.id !== emId && e.stato === 'aperta' && e.fase_codice === comm.fase_corrente);
    if (altreAperte.length === 0) {
      await supabase.from('commessa_fase').update({ stato: 'attiva', bloccata_motivo: null }).eq('commessa_id', params.id).eq('fase_codice', comm.fase_corrente);
    }
    await supabase.from('feed').insert({ azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id, tipo: 'risolto', testo: '✅ Problema risolto da ' + membro.nome, fase_codice: comm.fase_corrente });
    await supabase.from('timeline').insert({ commessa_id: params.id, azienda_id: comm.azienda_id, tipo: 'emergenza_risolta', fase_codice: comm.fase_corrente, descrizione: 'Problema risolto', membro_id: membro.id, membro_nome: membro.nome });
    load();
  }

  // ═══════ UPLOAD & CHAT ═══════
  async function uploadFoto(fc, ac, file) {
    const path = comm.id + '/' + fc + '/' + ac + '-' + Date.now() + '.' + file.name.split('.').pop();
    const { error } = await supabase.storage.from('allegati').upload(path, file);
    if (error) { alert('Upload fallito'); return null; }
    const { data } = supabase.storage.from('allegati').getPublicUrl(path);
    return data.publicUrl;
  }
  async function uploadFirma(dataUrl) {
    const res = await fetch(dataUrl); const blob = await res.blob();
    const path = comm.id + '/firme/firma-' + Date.now() + '.png';
    const { error } = await supabase.storage.from('allegati').upload(path, blob);
    if (error) { alert('Upload firma fallito'); return null; }
    const { data } = supabase.storage.from('allegati').getPublicUrl(path);
    return data.publicUrl;
  }
  async function inviaMessaggio() {
    if (!msgTesto.trim() || !membro) return;
    await supabase.from('messaggi').insert({ azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id, testo: msgTesto, tipo: 'testo' });
    setMsgTesto(''); load();
  }
  async function inviaFoto(file) {
    if (!membro) return;
    const path = comm.id + '/chat/' + Date.now() + '-' + file.name;
    const { error } = await supabase.storage.from('allegati').upload(path, file);
    if (error) return;
    const { data } = supabase.storage.from('allegati').getPublicUrl(path);
    await supabase.from('messaggi').insert({ azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id, tipo: 'foto', allegato_url: data.publicUrl, allegato_nome: file.name });
    load();
  }
  async function registraPagamento() {
    if (!pagImporto || !membro) return;
    await supabase.from('pagamento').insert({ commessa_id: params.id, azienda_id: comm.azienda_id, tipo: pagTipo, importo: parseFloat(pagImporto), registrato_da: membro.id });
    await supabase.from('feed').insert({ azienda_id: comm.azienda_id, commessa_id: params.id, membro_id: membro.id, tipo: 'pagamento', testo: membro.nome + ' ha registrato ' + pagTipo + ' di €' + pagImporto });
    await supabase.from('timeline').insert({ commessa_id: params.id, azienda_id: comm.azienda_id, tipo: 'pagamento_ricevuto', descrizione: pagTipo + ' €' + pagImporto, membro_id: membro.id, membro_nome: membro.nome, importo: parseFloat(pagImporto) });
    setPagImporto(''); setShowPag(false); load();
  }

  function shareWA(text) { window.open('https://wa.me/?text=' + encodeURIComponent(text)); }
  function timeAgo(d) { const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return 'ora'; if (s < 3600) return Math.floor(s / 60) + 'min'; if (s < 86400) return Math.floor(s / 3600) + 'h'; return Math.floor(s / 86400) + 'g'; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }

  // ═══════ LOADING ═══════
  if (!comm || !fasi.length) return (
    <div style={{ fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.bg, color: C.g }}>Caricamento...</div>
  );

  const faseIdx = fasi.findIndex(f => f.codice === comm.fase_corrente);
  const allPhotos = completate.filter(c => c.foto_url || c.firma_url);
  const totPag = pagamenti.reduce((s, p) => s + Number(p.importo), 0);
  const trackUrl = typeof window !== 'undefined' ? window.location.origin + '/track/' + comm.token_cliente : '';
  const emergAperte = emergenze.filter(e => e.stato === 'aperta');
  const responsabile = (ruolo) => membri.find(m => m.ruolo === ruolo);

  // ═══════ RENDER ═══════
  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 480, margin: '0 auto', background: C.bg, minHeight: '100vh', paddingBottom: 70 }}>

      {/* FIRMA MODAL */}
      {showFirma && <FirmaPad titolo={'Firma cliente - ' + showFirma.ac} onCancel={() => setShowFirma(null)} onSave={async (dataUrl) => { const url = await uploadFirma(dataUrl); if (url) completa(showFirma.fc, showFirma.ac, null, url); }} />}

      {/* ═══════ HEADER ═══════ */}
      <div style={{ background: C.dk, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={() => router.push('/dashboard')} style={{ fontSize: 18, color: C.w, cursor: 'pointer' }}>←</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.w }}>{comm.codice} - {comm.cliente_nome}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{comm.indirizzo || ''} {comm.descrizione ? '· ' + comm.descrizione : ''}</div>
          </div>
          {emergAperte.length > 0 && <div style={{ width: 28, height: 28, borderRadius: 14, background: C.rd, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: C.w }}>⚠</div>}
          <div onClick={() => shareWA('Commessa ' + comm.codice + ' - ' + comm.cliente_nome + '\nFase: ' + comm.fase_corrente + '\n\nSegui: ' + trackUrl)} style={{ width: 28, height: 28, borderRadius: 14, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, color: C.w, fontWeight: 700 }}>W</div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
          {fasi.map((f, i) => {
            const stato = getFaseStato(f.codice);
            const col = stato === 'completata' ? C.gn : stato === 'attiva' ? (f.colore || C.bl) : stato === 'bloccata' ? C.rd : 'rgba(255,255,255,.15)';
            return <div key={f.id} style={{ flex: 1, height: 4, borderRadius: 2, background: col }} />;
          })}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginTop: 10 }}>
          {[['guida', 'Guida'], ['timeline', 'Timeline'], ['docs', 'Docs'], ['chat', 'Chat'], ['soldi', '€']].map(([k, l]) => (
            <div key={k} onClick={() => setTab(k)} style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: 10, fontWeight: tab === k ? 700 : 500, color: tab === k ? C.w : 'rgba(255,255,255,.5)', borderBottom: tab === k ? '2px solid ' + C.w : '2px solid transparent', cursor: 'pointer' }}>{l}</div>
          ))}
        </div>
      </div>

      {/* ═══════ TAB: GUIDA (FLOW-BASED) ═══════ */}
      {tab === 'guida' && <div style={{ padding: '8px 16px' }}>

        {/* EMERGENZA BUTTON */}
        <div onClick={() => setShowEmergenza(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#FF3B3010', border: '1px solid #FF3B3040', cursor: 'pointer', marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.rd }}>Segnala Problema</div>
          {emergAperte.length > 0 && <div style={{ padding: '2px 8px', borderRadius: 10, background: C.rd, color: C.w, fontSize: 10, fontWeight: 700 }}>{emergAperte.length}</div>}
        </div>

        {/* EMERGENZE APERTE */}
        {emergAperte.map(em => (
          <div key={em.id} style={{ padding: 12, borderRadius: 10, background: '#FFF0EF', border: '1px solid #FF3B3030', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.rd }}>{em.descrizione}</div>
              <div style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: { bassa: '#FF950020', media: '#FF3B3020', alta: '#FF3B3040', critica: '#FF3B30' }[em.gravita], color: em.gravita === 'critica' ? C.w : C.rd, fontWeight: 700 }}>{em.gravita}</div>
            </div>
            <div style={{ fontSize: 9, color: C.g }}>{em.segnalata_da_membro?.nome} · {fmtDate(em.created_at)} · fase: {em.fase_codice}</div>
            {em.foto_url && <img src={em.foto_url} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 6 }} onClick={() => window.open(em.foto_url)} />}
            <div onClick={() => risolviEmergenza(em.id)} style={{ marginTop: 8, padding: 8, borderRadius: 8, background: C.gn, color: C.w, textAlign: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓ Risolvi problema</div>
          </div>
        ))}

        {/* FASI */}
        {fasi.map((fase, fi) => {
          const azFase = azioni.filter(a => a.fase_id === fase.id);
          const cFase = azFase.filter(a => isCompleted(fase.codice, a.codice)).length;
          const isOpen = openFase === fase.codice;
          const stato = getFaseStato(fase.codice);
          const { bloccata, motivi } = checkBloccoFase(fase.codice);
          const tutteComplete = azFase.filter(a => a.obbligatoria).every(a => isCompleted(fase.codice, a.codice));
          const isDone = stato === 'completata';
          const isLocked = stato === 'locked';
          const isBloccata = stato === 'bloccata';
          const resp = responsabile(fase.responsabile_ruolo);
          const borderCol = isDone ? C.gn : isBloccata ? C.rd : isLocked ? C.ln : (fase.colore || C.bl);

          return (
            <div key={fase.id} style={{ marginBottom: 6 }}>
              {/* FASE HEADER */}
              <div onClick={() => setOpenFase(isOpen ? null : fase.codice)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 10, background: C.w, border: '1px solid ' + C.ln,
                borderLeft: '4px solid ' + borderCol, cursor: 'pointer', opacity: isLocked ? 0.5 : 1,
              }}>
                <div style={{ fontSize: 20 }}>{fase.icona || '📋'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{fase.nome}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {resp && <div style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: borderCol + '15', color: borderCol, fontWeight: 600 }}>{resp.nome}</div>}
                    <div style={{ fontSize: 9, color: C.g }}>{cFase}/{azFase.length}</div>
                    {isBloccata && <div style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: C.rd, color: C.w, fontWeight: 700 }}>BLOCCATA</div>}
                  </div>
                </div>
                {isLocked && <span style={{ fontSize: 14 }}>🔒</span>}
                {isDone && <div style={{ width: 24, height: 24, borderRadius: 12, background: C.gn, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.w, fontSize: 12 }}>✓</div>}
              </div>

              {/* FASE EXPANDED */}
              {isOpen && !isLocked && (
                <div style={{ marginLeft: 4, marginTop: 2, padding: '12px', borderRadius: '0 0 10px 10px', background: C.w, borderLeft: '3px solid ' + borderCol + '40' }}>

                  {/* Descrizione */}
                  {fase.descrizione && <div style={{ fontSize: 11, color: C.g, marginBottom: 8, fontStyle: 'italic' }}>{fase.descrizione}</div>}

                  {/* Documenti IN */}
                  {fase.documenti_in && fase.documenti_in.length > 0 && fase.documenti_in[0] !== '' && (
                    <div style={{ marginBottom: 10, padding: 8, borderRadius: 8, background: '#F0F5FF', border: '1px solid #007AFF20' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.bl, marginBottom: 4 }}>📥 Serve per iniziare</div>
                      {fase.documenti_in.map((d, i) => <div key={i} style={{ fontSize: 11, color: '#333', padding: '2px 0' }}>· {d}</div>)}
                    </div>
                  )}

                  {/* AZIONI */}
                  {azFase.map(az => {
                    const done = isCompleted(fase.codice, az.codice);
                    return (
                      <div key={az.id} style={{ padding: '8px 0', borderBottom: '1px solid ' + C.ln + '80' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div onClick={() => {
                            if (!done && !isLocked && !isBloccata) {
                              if (az.richiede_firma) { completa(fase.codice, az.codice); }
                              else if (showNota === az.codice) { completa(fase.codice, az.codice); }
                              else { setShowNota(az.codice); setNota(''); }
                            }
                          }} style={{
                            width: 22, height: 22, borderRadius: 11, marginTop: 1, flexShrink: 0,
                            cursor: (isLocked || isBloccata) ? 'default' : 'pointer',
                            border: '2px solid ' + (done ? C.gn : borderCol),
                            background: done ? C.gn : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>{done && <span style={{ color: C.w, fontSize: 10 }}>✓</span>}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: done ? 500 : 700, color: done ? C.gn : C.dk, textDecoration: done ? 'line-through' : 'none' }}>
                              {az.label}
                              {az.obbligatoria && <span style={{ color: C.rd, fontSize: 8, marginLeft: 4 }}>*</span>}
                              {az.richiede_foto && <span style={{ fontSize: 8, marginLeft: 4 }}>📷</span>}
                              {az.richiede_firma && <span style={{ fontSize: 8, marginLeft: 4 }}>✍️</span>}
                            </div>
                            {az.descrizione && <div style={{ fontSize: 10, color: C.g }}>{az.descrizione}</div>}
                            {done && <div style={{ fontSize: 9, color: C.g }}>{done.completata_da_membro?.nome} · {fmtDate(done.completata_at)}{done.nota && <span style={{ fontStyle: 'italic' }}> "{done.nota}"</span>}</div>}
                            {done && done.foto_url && <img src={done.foto_url} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, marginTop: 4, cursor: 'pointer' }} onClick={() => window.open(done.foto_url)} />}
                            {done && done.firma_url && <div style={{ marginTop: 4 }}><div style={{ fontSize: 8, color: C.g }}>Firma:</div><img src={done.firma_url} style={{ width: 120, height: 50, objectFit: 'contain', borderRadius: 4, border: '1px solid ' + C.ln }} onClick={() => window.open(done.firma_url)} /></div>}
                          </div>
                        </div>
                        {showNota === az.codice && !done && !az.richiede_firma && (
                          <div style={{ marginTop: 6, marginLeft: 30 }}>
                            <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota (opzionale)" style={{ width: '100%', fontSize: 12, padding: '8px 10px', borderRadius: 8, border: '1px solid ' + C.ln, outline: 'none' }} />
                            {az.richiede_foto && <div style={{ marginTop: 4 }}><label style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 8, background: C.bl + '15', color: C.bl, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>📷 Scatta foto<input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files[0]; if (f) { const url = await uploadFoto(fase.codice, az.codice, f); if (url) completa(fase.codice, az.codice, url); } }} /></label></div>}
                            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                              {!az.richiede_foto && <div onClick={() => completa(fase.codice, az.codice)} style={{ flex: 1, padding: 8, borderRadius: 8, background: C.gn, color: C.w, textAlign: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✓ Completa</div>}
                              <div onClick={() => setShowNota(null)} style={{ padding: '8px 12px', borderRadius: 8, background: C.ln, fontSize: 12, cursor: 'pointer' }}>Annulla</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Documenti OUT */}
                  {fase.documenti_out && fase.documenti_out.length > 0 && fase.documenti_out[0] !== '' && (
                    <div style={{ marginTop: 10, padding: 8, borderRadius: 8, background: '#F0FFF4', border: '1px solid #34C75920' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.gn, marginBottom: 4 }}>📤 Da consegnare alla fase successiva</div>
                      {fase.documenti_out.map((d, i) => <div key={i} style={{ fontSize: 11, color: '#333', padding: '2px 0' }}>· {d}</div>)}
                    </div>
                  )}

                  {/* INVIA AL PROSSIMO */}
                  {tutteComplete && !isDone && fi < fasi.length - 1 && (
                    <div style={{ marginTop: 12 }}>
                      {showInvia === fase.codice ? (
                        <div style={{ padding: 12, borderRadius: 10, background: C.bl + '10', border: '1px solid ' + C.bl + '30' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.bl, marginBottom: 4 }}>Passare a: {fasi[fi + 1].nome}</div>
                          <div style={{ fontSize: 11, color: C.g, marginBottom: 8 }}>Responsabile: {fasi[fi + 1].responsabile_ruolo || '—'}</div>
                          {bloccata && (
                            <div style={{ padding: 8, borderRadius: 8, background: '#FFF0EF', marginBottom: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: C.rd }}>⚠ Blocchi attivi:</div>
                              {motivi.map((m, i) => <div key={i} style={{ fontSize: 10, color: C.rd }}>· {m}</div>)}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 6 }}>
                            <div onClick={() => inviaAlProssimo(fase.codice)} style={{ flex: 1, padding: 10, borderRadius: 8, background: bloccata ? C.g : C.bl, color: C.w, textAlign: 'center', fontSize: 12, fontWeight: 700, cursor: bloccata ? 'default' : 'pointer', opacity: bloccata ? 0.5 : 1 }}>🚀 Invia al prossimo</div>
                            <div onClick={() => setShowInvia(null)} style={{ padding: '10px 14px', borderRadius: 8, background: C.ln, fontSize: 12, cursor: 'pointer' }}>Annulla</div>
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => setShowInvia(fase.codice)} style={{ padding: 12, borderRadius: 10, background: C.bl, color: C.w, textAlign: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                          🚀 Invia al prossimo → {fasi[fi + 1].nome}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>}

      {/* ═══════ TAB: TIMELINE ═══════ */}
      {tab === 'timeline' && <div style={{ padding: '8px 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, padding: '8px 0' }}>Timeline</div>
        {(timelineItems.length > 0 ? timelineItems : feedItems).map((item, idx) => {
          const isTimeline = !!item.tipo;
          const tipo = item.tipo || 'nota';
          const ic = { fase_iniziata: '▶', fase_completata: '✓', fase_bloccata: '⛔', azione_completata: '✓', emergenza_aperta: '🚨', emergenza_risolta: '✅', pagamento_ricevuto: '€', documento_firmato: '✍️', documento_caricato: '📄', messaggio_sistema: '💬', commessa_creata: '+', commessa_chiusa: '🏁', azione: '✓', fase: '→', problema: '⚠', risolto: '✓', commessa: '+', nota: '✎', pagamento: '€' }[tipo] || '·';
          const bg = { fase_completata: C.gn, azione_completata: C.gn, emergenza_aperta: C.rd, emergenza_risolta: C.gn, pagamento_ricevuto: C.gn, fase_bloccata: C.rd, azione: C.gn, fase: C.bl, problema: C.rd, risolto: C.gn, commessa: C.pu, nota: C.or, pagamento: C.gn }[tipo] || C.g;

          return (
            <div key={item.id} style={{ display: 'flex', gap: 10, position: 'relative' }}>
              {/* Vertical line */}
              {idx < (timelineItems.length > 0 ? timelineItems : feedItems).length - 1 && <div style={{ position: 'absolute', left: 13, top: 32, bottom: -4, width: 2, background: C.ln }} />}
              <div style={{ width: 28, height: 28, borderRadius: 14, background: bg, color: C.w, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, zIndex: 1 }}>{ic}</div>
              <div style={{ flex: 1, paddingBottom: 14 }}>
                <div style={{ fontSize: 12 }}>{item.descrizione || item.testo}</div>
                <div style={{ fontSize: 9, color: C.g, marginTop: 2 }}>{fmtDate(item.created_at)}{item.membro_nome ? ' · ' + item.membro_nome : (item.membro?.nome ? ' · ' + item.membro.nome : '')}{item.importo ? ' · €' + Number(item.importo).toLocaleString() : ''}</div>
              </div>
            </div>
          );
        })}
        {timelineItems.length === 0 && feedItems.length === 0 && <div style={{ textAlign: 'center', color: C.g, fontSize: 12, padding: 40 }}>Nessuna attività</div>}
      </div>}

      {/* ═══════ TAB: DOCS ═══════ */}
      {tab === 'docs' && <div style={{ padding: '8px 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, padding: '8px 0' }}>Documenti e Foto</div>

        {/* Documenti strutturati */}
        {documenti.map(doc => {
          const stCol = { bozza: C.or, inviato: C.bl, firmato: C.gn, pagato: C.gn, ricevuto: C.bl, archiviato: C.g }[doc.stato] || C.g;
          return (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: C.w, border: '1px solid ' + C.ln, marginBottom: 4, cursor: doc.url ? 'pointer' : 'default' }} onClick={() => doc.url && window.open(doc.url)}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: stCol + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{doc.nome}</div>
                <div style={{ fontSize: 9, color: C.g }}>{doc.tipo} · {doc.caricato_da_membro?.nome} · {fmtDate(doc.created_at)}</div>
              </div>
              <div style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: stCol + '15', color: stCol, fontWeight: 700 }}>{doc.stato}</div>
              {doc.importo && <div style={{ fontSize: 11, fontWeight: 700, color: C.dk }}>€{Number(doc.importo).toLocaleString()}</div>}
            </div>
          );
        })}

        {/* Foto griglia */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 8 }}>
          {allPhotos.filter(d => d.foto_url).map(d => (<div key={d.id + 'f'} onClick={() => window.open(d.foto_url)} style={{ cursor: 'pointer' }}><img src={d.foto_url} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} /><div style={{ fontSize: 8, color: C.g, marginTop: 2 }}>{d.fase_codice}</div></div>))}
          {allPhotos.filter(d => d.firma_url).map(d => (<div key={d.id + 's'} onClick={() => window.open(d.firma_url)} style={{ cursor: 'pointer' }}><img src={d.firma_url} style={{ width: '100%', height: 90, objectFit: 'contain', borderRadius: 8, border: '1px solid ' + C.ln, background: C.w }} /><div style={{ fontSize: 8, color: C.g, marginTop: 2 }}>Firma · {d.fase_codice}</div></div>))}
          {messaggi.filter(m => m.tipo === 'foto').map(m => (<div key={m.id} onClick={() => window.open(m.allegato_url)} style={{ cursor: 'pointer' }}><img src={m.allegato_url} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} /><div style={{ fontSize: 8, color: C.g, marginTop: 2 }}>chat</div></div>))}
        </div>
        {documenti.length === 0 && allPhotos.length === 0 && messaggi.filter(m => m.tipo === 'foto').length === 0 && <div style={{ textAlign: 'center', color: C.g, fontSize: 12, padding: 40 }}>Nessun documento</div>}
      </div>}

      {/* ═══════ TAB: CHAT ═══════ */}
      {tab === 'chat' && <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 170px)' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
          {messaggi.map(m => {
            const isMine = m.membro_id === membro?.id;
            const isSys = m.tipo === 'sistema';
            if (isSys) return (
              <div key={m.id} style={{ textAlign: 'center', margin: '8px 0' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 12, background: C.ln, fontSize: 10, color: C.g }}>{m.testo}</div>
              </div>
            );
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px', background: isMine ? C.bl : C.w, color: isMine ? C.w : C.dk, border: isMine ? 'none' : '1px solid ' + C.ln }}>
                  {!isMine && <div style={{ fontSize: 9, fontWeight: 700, color: C.bl, marginBottom: 2 }}>{m.membro?.nome}</div>}
                  {m.tipo === 'foto' && m.allegato_url && <img src={m.allegato_url} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 4, cursor: 'pointer' }} onClick={() => window.open(m.allegato_url)} />}
                  {m.tipo === 'documento' && (
                    <div style={{ padding: 8, borderRadius: 8, background: isMine ? 'rgba(255,255,255,.15)' : '#F0F5FF', marginBottom: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>📄 {m.doc_nome || 'Documento'}</div>
                      {m.doc_importo && <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,.7)' : C.g }}>€{Number(m.doc_importo).toLocaleString()}</div>}
                      {m.doc_stato && <div style={{ fontSize: 9, marginTop: 2, padding: '1px 6px', borderRadius: 4, background: C.gn + '20', color: C.gn, display: 'inline-block' }}>{m.doc_stato}</div>}
                    </div>
                  )}
                  {m.testo && <div style={{ fontSize: 13 }}>{m.testo}</div>}
                  <div style={{ fontSize: 8, marginTop: 2, opacity: .6, textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
          <div ref={msgEndRef} />
        </div>
        <div style={{ padding: '8px 16px', background: C.w, borderTop: '1px solid ' + C.ln, display: 'flex', gap: 6, alignItems: 'center' }}>
          <label style={{ cursor: 'pointer', fontSize: 20 }}>📷<input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) inviaFoto(f); }} /></label>
          <input value={msgTesto} onChange={e => setMsgTesto(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') inviaMessaggio(); }} placeholder="Scrivi..." style={{ flex: 1, fontSize: 13, padding: '10px 12px', borderRadius: 20, border: '1px solid ' + C.ln, outline: 'none' }} />
          <div onClick={inviaMessaggio} style={{ width: 32, height: 32, borderRadius: 16, background: msgTesto.trim() ? C.bl : '#C7C7CC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.w, fontSize: 14 }}>↑</div>
        </div>
      </div>}

      {/* ═══════ TAB: SOLDI ═══════ */}
      {tab === 'soldi' && <div style={{ padding: '8px 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, padding: '8px 0' }}>Pagamenti</div>
        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 3, background: C.ln, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: C.gn, width: (comm.importo > 0 ? Math.min(100, (totPag / comm.importo) * 100) : 0) + '%', transition: 'width .3s' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, padding: 14, borderRadius: 10, background: C.w, border: '1px solid ' + C.ln, textAlign: 'center' }}><div style={{ fontSize: 9, color: C.g }}>Importo</div><div style={{ fontSize: 18, fontWeight: 800 }}>€{Number(comm.importo || 0).toLocaleString()}</div></div>
          <div style={{ flex: 1, padding: 14, borderRadius: 10, background: '#EDFCF2', border: '1px solid #34C75930', textAlign: 'center' }}><div style={{ fontSize: 9, color: C.gn }}>Incassato</div><div style={{ fontSize: 18, fontWeight: 800, color: C.gn }}>€{totPag.toLocaleString()}</div></div>
          <div style={{ flex: 1, padding: 14, borderRadius: 10, background: comm.importo - totPag > 0 ? '#FFF0EF' : '#EDFCF2', border: '1px solid ' + (comm.importo - totPag > 0 ? '#FF3B3030' : '#34C75930'), textAlign: 'center' }}><div style={{ fontSize: 9, color: comm.importo - totPag > 0 ? C.rd : C.gn }}>Residuo</div><div style={{ fontSize: 18, fontWeight: 800, color: comm.importo - totPag > 0 ? C.rd : C.gn }}>€{(Number(comm.importo || 0) - totPag).toLocaleString()}</div></div>
        </div>
        {pagamenti.map(p => (<div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: C.w, border: '1px solid ' + C.ln, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: p.tipo === 'acconto' ? '#FF950020' : '#34C75920', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: p.tipo === 'acconto' ? C.or : C.gn }}>€</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1)} - €{Number(p.importo).toLocaleString()}</div><div style={{ fontSize: 9, color: C.g }}>{p.registrato_da_membro?.nome} · {fmtDate(p.created_at)}</div></div>
        </div>))}
        {!showPag && <div onClick={() => setShowPag(true)} style={{ marginTop: 8, padding: 14, borderRadius: 10, background: C.bl, color: C.w, textAlign: 'center', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ Registra pagamento</div>}
        {showPag && <div style={{ marginTop: 8, padding: 14, borderRadius: 10, background: C.w, border: '1px solid ' + C.ln }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>{['acconto', 'saldo', 'caparra'].map(t => (<div key={t} onClick={() => setPagTipo(t)} style={{ flex: 1, padding: 8, borderRadius: 8, textAlign: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: pagTipo === t ? C.bl : C.bg, color: pagTipo === t ? C.w : C.dk }}>{t}</div>))}</div>
          <input value={pagImporto} onChange={e => setPagImporto(e.target.value)} placeholder="Importo" type="number" style={{ width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 8, border: '1px solid ' + C.ln, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <div onClick={registraPagamento} style={{ flex: 1, padding: 10, borderRadius: 8, background: C.gn, color: C.w, textAlign: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✓ Registra</div>
            <div onClick={() => setShowPag(false)} style={{ padding: '10px 14px', borderRadius: 8, background: C.ln, fontSize: 12, cursor: 'pointer' }}>Annulla</div>
          </div>
        </div>}
      </div>}

      {/* ═══════ MODAL EMERGENZA ═══════ */}
      {showEmergenza && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: C.w, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, margin: '0 auto', padding: 20, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 5, borderRadius: 3, background: C.ln, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 17, fontWeight: 700, color: C.rd, marginBottom: 12 }}>🚨 Segnala Problema</div>
            <div style={{ fontSize: 11, color: C.g, marginBottom: 12 }}>Fase: {comm.fase_corrente}</div>

            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Descrizione *</label>
            <textarea value={emDesc} onChange={e => setEmDesc(e.target.value)} placeholder="Es: Vano fuori squadra +5mm..." rows={3} style={{ width: '100%', background: C.bg, borderRadius: 10, padding: 12, fontSize: 14, outline: 'none', border: '1px solid ' + C.ln, marginBottom: 12, resize: 'none', fontFamily: 'inherit' }} />

            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Gravità</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[['bassa', '#FF9500'], ['media', '#FF3B30'], ['alta', '#FF3B30'], ['critica', '#8B0000']].map(([g, col]) => (
                <div key={g} onClick={() => setEmGravita(g)} style={{ flex: 1, padding: 8, borderRadius: 8, textAlign: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: emGravita === g ? col : C.bg, color: emGravita === g ? C.w : C.dk }}>{g}</div>
              ))}
            </div>

            <label style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 8, background: C.bl + '15', color: C.bl, fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
              📷 {emFoto ? emFoto.name : 'Allega foto'}
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => setEmFoto(e.target.files[0])} />
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <div onClick={() => setShowEmergenza(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid ' + C.ln, background: C.w, color: C.g, fontWeight: 600, fontSize: 15, cursor: 'pointer', textAlign: 'center' }}>Annulla</div>
              <div onClick={segnalaEmergenza} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: !emDesc.trim() ? C.g : C.rd, color: C.w, fontWeight: 700, fontSize: 15, cursor: !emDesc.trim() ? 'default' : 'pointer', opacity: !emDesc.trim() ? 0.5 : 1, textAlign: 'center' }}>🚨 Segnala</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
