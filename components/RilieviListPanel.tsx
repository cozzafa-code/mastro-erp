"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — RilieviListPanel
// Estratto S3: ~1.812 righe (Lista rilievi + wizard + report + dossier)
// ═══════════════════════════════════════════════════════════
import React from "react";
import { useMastro } from "./MastroContext";
import { FM, ICO, Ico } from "./mastro-constants";

export default function RilieviListPanel() {
  const {
    T, S, PIPELINE,
    // State
    selectedCM, setSelectedCM, cantieri, setCantieri,
    selectedRilievo, setSelectedRilievo, selectedVano, setSelectedVano,
    cmSubTab, setCmSubTab, dossierTab, setDossierTab,
    showNuovoRilievo, setShowNuovoRilievo, nuovoRilTipo, setNuovoRilTipo,
    nuovoRilData, setNuovoRilData,
    events, setEvents, msgs, fattureDB, setFattureDB,
    ordiniFornDB, setOrdiniFornDB, montaggiDB, setMontaggiDB,
    squadreDB, fornitori,
    // Centro comando
    ccConfirm, setCcConfirm, ccDone, setCcDone, ccExpandStep, setCcExpandStep,
    confSett, setConfSett, firmaStep, setFirmaStep,
    firmaFileUrl, setFirmaFileUrl, firmaFileName, setFirmaFileName,
    fattPerc, setFattPerc, montGiorni, setMontGiorni,
    montFormOpen, setMontFormOpen, montFormData, setMontFormData,
    // Navigation
    tab, setShowPreventivoModal,
    // Helpers
    calcolaVanoPrezzo, getVaniAttivi, deleteCommessa, setFaseTo,
    PipelineBar, ORDINE_STATI,
    // Business logic
    generaPreventivoPDF, creaFattura, creaOrdineFornitore,
    apriInboxDocumento,
  } = useMastro();

    if (!selectedCM) return null;
    const c = selectedCM;
    const rilievi = c.rilievi || [];

    const salvaRilievo = () => {
      const n = rilievi.length + 1;
      const nr = {
        id: Date.now(), n,
        data: nuovoRilData.data || new Date().toISOString().split("T")[0],
        ora: nuovoRilData.ora || "",
        rilevatore: nuovoRilData.rilevatore || "",
        tipo: nuovoRilTipo,
        motivoModifica: nuovoRilData.motivoModifica || "",
        note: nuovoRilData.note || "",
        stato: "nuovo",
        vani: [],
      };
      const updCM = { ...c, rilievi: [...rilievi, nr], aggiornato: "Oggi" };
      setCantieri(cs => cs.map(x => x.id === c.id ? updCM : x));
      setSelectedCM(updCM);
      setShowNuovoRilievo(false);
      setNuovoRilData({ data: "", ora: "", rilevatore: "", note: "", motivoModifica: "" });
      setNuovoRilTipo("rilievo");
      setSelectedRilievo(nr);
    };

    // == WIZARD NUOVO RILIEVO ==
    if (showNuovoRilievo) return (
      <div style={{ paddingBottom: 80 }}>
        <div style={S.header}>
          <div onClick={() => setShowNuovoRilievo(false)} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={20} c={T.sub} /></div>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>Nuovo Rilievo</div>
            <div style={S.headerSub}>{c.code} · {c.cliente} {c.cognome}</div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {/* Tipo */}
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Tipo di visita</div>
          {[
            { k: "rilievo",    ico: "📐", l: "Rilievo misure",    d: "Misuri i vani del cantiere" },
            { k: "definitiva", ico: "✅", l: "Misure definitive", d: "Conferma finale — si va in produzione" },
            { k: "modifica",   ico: "🔧", l: "Modifica",          d: "Cliente cambia configurazione o aggiunge vani" },
          ].map(t => (
            <div key={t.k} onClick={() => setNuovoRilTipo(t.k)}
              style={{ ...S.card, padding: "12px 14px", marginBottom: 8, cursor: "pointer",
                border: `1.5px solid ${nuovoRilTipo === t.k ? T.acc : T.bdr}`,
                background: nuovoRilTipo === t.k ? T.accLt : T.card,
                display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 22 }}>{t.ico}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: nuovoRilTipo === t.k ? T.acc : T.text }}>{t.l}</div>
                <div style={{ fontSize: 11, color: T.sub }}>{t.d}</div>
              </div>
              {nuovoRilTipo === t.k && <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11 }}>✓</div>}
            </div>
          ))}
          {nuovoRilTipo === "modifica" && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, marginBottom: 5 }}>MOTIVO MODIFICA</div>
              <input style={S.input} placeholder="Es: cliente cambia 3 balconi in finestre..." value={nuovoRilData.motivoModifica} onChange={e => setNuovoRilData(d => ({...d, motivoModifica: e.target.value}))} />
            </div>
          )}
          {/* Dati */}
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Data e rilevatore</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.sub, marginBottom: 4 }}>DATA</div>
              <input style={S.input} type="date" value={nuovoRilData.data} onChange={e => setNuovoRilData(d => ({...d, data: e.target.value}))} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.sub, marginBottom: 4 }}>ORA</div>
              <input style={S.input} type="time" value={nuovoRilData.ora} onChange={e => setNuovoRilData(d => ({...d, ora: e.target.value}))} />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 4 }}>RILEVATORE</div>
            <input style={S.input} placeholder="Chi esegue il rilievo..." value={nuovoRilData.rilevatore} onChange={e => setNuovoRilData(d => ({...d, rilevatore: e.target.value}))} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 4 }}>NOTE</div>
            <textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }} placeholder="Note preliminari..." value={nuovoRilData.note} onChange={e => setNuovoRilData(d => ({...d, note: e.target.value}))} />
          </div>
          <button onClick={salvaRilievo} style={{ ...S.btn, width: "100%", marginTop: 20, background: T.grn }}>✓ Crea Rilievo</button>
        </div>
      </div>
    );

    // == REPORT DIFFERENZE ==
    const renderReportDiff = () => {
      if (rilievi.length < 2) return (
        <div style={{ padding: 20, textAlign: "center", color: T.sub, fontSize: 12 }}>
          Servono almeno 2 rilievi per generare il report differenze.
        </div>
      );
      return (
        <div style={{ padding: "0 16px 80px" }}>
          {rilievi.slice(1).map((r, idx) => {
            const prev = rilievi[idx];
            const prevVani = prev?.vani || [];
            const currVani = r.vani || [];
            const aggiunti = currVani.filter(v => !prevVani.some(p => p.nome.replace(" ❌","") === v.nome.replace(" ❌","")));
            const rimossi  = prevVani.filter(p => !currVani.some(v => v.nome.replace(" ❌","") === p.nome.replace(" ❌","")));
            const modificati = currVani.filter(v => {
              const match = prevVani.find(p => p.nome.replace(" ❌","") === v.nome.replace(" ❌",""));
              if (!match) return false;
              return JSON.stringify(v.misure) !== JSON.stringify(match.misure) ||
                     v.sistema !== match.sistema || v.tipo !== match.tipo;
            });
            return (
              <div key={r.id} style={{ ...S.card, marginBottom: 12 }}>
                <div style={{ padding: "11px 14px", borderBottom: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 20 }}>🔀</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>R{prev.n} → R{r.n}</div>
                    <div style={{ fontSize: 11, color: T.sub }}>
                      {new Date(prev.data + "T12:00:00").toLocaleDateString("it-IT", { day:"numeric", month:"short" })} → {new Date(r.data + "T12:00:00").toLocaleDateString("it-IT", { day:"numeric", month:"short" })}
                    </div>
                  </div>
                  {aggiunti.length + rimossi.length + modificati.length === 0
                    ? <span style={S.badge(T.grnLt, T.grn)}>Nessuna differenza</span>
                    : <span style={S.badge(T.orangeLt, T.orange)}>{aggiunti.length + rimossi.length + modificati.length} diff</span>}
                </div>
                <div style={{ padding: "10px 14px" }}>
                  {aggiunti.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.grn, marginBottom: 4 }}>+ AGGIUNTI</div>
                      {aggiunti.map(v => <span key={v.id} style={{ ...S.badge(T.grnLt, T.grn), marginRight: 4, marginBottom: 4, display: "inline-block" }}>+ {v.nome.replace(" ❌","")}</span>)}
                    </div>
                  )}
                  {rimossi.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.red, marginBottom: 4 }}>- RIMOSSI</div>
                      {rimossi.map(v => <span key={v.id} style={{ ...S.badge(T.redLt, T.red), marginRight: 4, marginBottom: 4, display: "inline-block" }}>- {v.nome.replace(" ❌","")}</span>)}
                    </div>
                  )}
                  {modificati.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.orange, marginBottom: 6 }}>~ MODIFICATI</div>
                      {modificati.map(v => {
                        const match = prevVani.find(p => p.nome.replace(" ❌","") === v.nome.replace(" ❌",""));
                        const diffMisure = Object.entries(v.misure || {}).filter(([k, val]) => match?.misure?.[k] !== val);
                        return (
                          <div key={v.id} style={{ marginBottom: 8, padding: "8px 10px", background: T.orangeLt, borderRadius: 8, border: `1px solid ${T.orange}30` }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.orange, marginBottom: 4 }}>~ {v.nome.replace(" ❌","")}</div>
                            {v.sistema !== match?.sistema && <div style={{ fontSize: 11, color: T.text, marginBottom: 2 }}>Sistema: <strong>{match?.sistema || "—"}</strong> → <strong>{v.sistema}</strong></div>}
                            {v.tipo !== match?.tipo && <div style={{ fontSize: 11, color: T.text, marginBottom: 2 }}>Tipo: <strong>{match?.tipo || "—"}</strong> → <strong>{v.tipo}</strong></div>}
                            {diffMisure.slice(0, 5).map(([k, val]) => (
                              <div key={k} style={{ fontSize: 11, color: T.sub }}>
                                {k}: <span style={{ color: T.red }}>{match?.misure?.[k] || 0}</span> → <span style={{ color: T.grn }}>{val as any}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {aggiunti.length + rimossi.length + modificati.length === 0 && (
                    <div style={{ fontSize: 12, color: T.sub }}>Nessuna variazione tra i due rilievi.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    // ═══ COMMESSA CHIUSA → DOSSIER COMPLETO ═══
    if (c.fase === "chiusura") {
      const allVD = getVaniAttivi(c);
      const fattD = fattureDB.filter(f => f.cmId === c.id);
      const ordD = (ordiniFornDB || []).filter(o => o.cmId === c.id);
      const montD = (montaggiDB || []).filter(m => m.cmId === c.id);
      const totPD = allVD.reduce((s, v) => s + calcolaVanoPrezzo(v, c), 0) + (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo || 0) * (vl.qta || 1)), 0);
      const ivaP = c.ivaPerc || 10;
      const totID = totPD * (1 + ivaP / 100);
      const incD = fattD.filter(f => f.pagata).reduce((s, f) => s + f.importo, 0);
      const costD = ordD.reduce((s, o) => s + (o.totaleIva || o.totale || 0), 0);
      const restD = totID - incD;
      const fD = (n: number) => "€" + n.toLocaleString("it-IT", { minimumFractionDigits: 2 });
      // dossierTab is defined at component top level

      // Timeline events
      const timeline: Array<{data:string;iso:string;ico:string;titolo:string;desc:string;col:string;ora?:string}> = [];
      timeline.push({ data: c.creato || "", iso: "0000", ico: "📁", titolo: "Commessa creata", desc: c.code + " · " + c.cliente + " " + (c.cognome||""), col: "#86868b", ora: "09:00" });
      (c.rilievi||[]).forEach(r => timeline.push({ data: r.data || "", iso: r.data || "", ico: "📐", titolo: "Rilievo #" + r.n + " — " + (r.tipo||"rilievo"), desc: (r.vani||[]).length + " vani · " + (r.rilevatore||"Fabio"), col: "#5856d6", ora: r.ora || "10:00" }));
      if(c.firmaCliente) timeline.push({ data: c.dataFirma || "", iso: c.dataFirma || "", ico: "✍️", titolo: "Preventivo firmato", desc: "Importo: " + fD(totID) + " (IVA " + ivaP + "%)", col: "#34c759", ora: "11:00" });
      ordD.forEach(o => timeline.push({ data: o.dataInvio || "", iso: o.dataInvio || "", ico: "📦", titolo: "Ordine " + (o.fornitore?.nome||""), desc: fD(o.totaleIva||o.totale||0) + " · " + (o.conferma?.ricevuta ? "Confermato" : o.stato), col: "#ff9500", ora: "09:30" }));
      ordD.filter(o => o.conferma?.ricevuta && o.conferma?.dataRicezione).forEach(o => timeline.push({ data: o.conferma.dataRicezione, iso: o.conferma.dataRicezione, ico: "✅", titolo: "Conferma ricevuta " + (o.fornitore?.nome||""), desc: o.conferma.nomeFile || "", col: "#34c759", ora: "14:00" }));
      montD.forEach(m => timeline.push({ data: m.data || "", iso: m.data || "", ico: "🔧", titolo: "Montaggio", desc: (m.vani||"?") + " vani · " + ((squadreDB||[]).find(s=>s.id===m.squadraId)?.nome||"") + " · " + m.stato, col: "#007aff", ora: m.orario || "08:00" }));
      fattD.forEach(f => timeline.push({ data: f.dataISO || f.data || "", iso: f.dataISO || "", ico: "📄", titolo: "Fattura N." + f.numero + "/" + f.anno + " — " + f.tipo, desc: fD(f.importo) + (f.pagata ? " · ✅ Pagata" : " · ⏳ Da incassare"), col: f.pagata ? "#34c759" : "#ff3b30", ora: "10:00" }));
      // Messaggi e email collegati alla commessa
      const chIcoD = { email: "📧", whatsapp: "💬", sms: "📱", telegram: "✈️" };
      const chColD = { email: "#5856d6", whatsapp: "#25d366", sms: "#ff9500", telegram: "#0088cc" };
      const msgsCm = msgs.filter(m => m.cm === c.code);
      msgsCm.forEach(m => {
        (m.thread || []).forEach(t => {
          timeline.push({ data: t.date || m.date || "", iso: m.date || "", ico: chIcoD[t.canale || m.canale] || "💬", titolo: (t.who === "Tu" ? "Inviato a " + m.from : "Ricevuto da " + m.from) + " · " + (t.canale || m.canale), desc: t.text?.substring(0, 80) + (t.text?.length > 80 ? "..." : ""), col: chColD[t.canale || m.canale] || "#86868b", ora: t.time || m.time || "" });
        });
      });
      (c.log||[]).forEach(l => timeline.push({ data: l.quando || "", iso: "", ico: "📝", titolo: l.cosa, desc: l.chi || "", col: l.color || "#86868b", ora: l.ora || "" }));
      timeline.sort((a,b) => (a.iso||"").localeCompare(b.iso||""));

      // Foto from rilievi
      const fotoVani: Array<{vano:string;stanza:string;tipo:string;url:string}> = [];
      allVD.forEach(v => {
        if(v.foto) Object.values(v.foto).forEach((url: any) => { if(url && typeof url === "string") fotoVani.push({ vano: v.nome||v.tipo, stanza: v.stanza||"", tipo: v.tipo, url }); });
      });

      // Print report
      const stampaReport = () => {
        const w = window.open("", "_blank");
        if(!w) return;
        const vaniHTML = allVD.map(v => {
          const m = v.misure || {};
          return `<tr><td>${v.nome||v.tipo}</td><td>${v.stanza||""}</td><td>${v.tipo}</td><td>${v.sistema||c.sistema||""}</td><td>${m.lCentro||"—"}×${m.hCentro||"—"}</td><td>${fD(calcolaVanoPrezzo(v,c))}</td></tr>`;
        }).join("");
        const fatHTML = fattD.map(f => `<tr><td>N.${f.numero}/${f.anno}</td><td>${f.tipo}</td><td>${fD(f.importo)}</td><td>${f.pagata?"✅ Pagata":"⏳ Da incassare"}</td><td>${f.data||""}</td></tr>`).join("");
        const ordHTML = ordD.map(o => `<tr><td>${o.fornitore?.nome||""}</td><td>${fD(o.totaleIva||o.totale||0)}</td><td>${o.stato}</td><td>${o.consegna?.prevista||""}</td></tr>`).join("");
        const timeHTML = timeline.map(t => `<tr><td>${t.data}${t.ora ? "<br><small>" + t.ora + "</small>" : ""}</td><td>${t.ico} ${t.titolo}</td><td>${t.desc}</td></tr>`).join("");
        const msgHTML = msgsCm.length > 0 ? msgsCm.map(m => {
          const threads = (m.thread||[]).map(t => `<div style="margin:4px 0;padding:6px 10px;border-radius:8px;background:${t.who==="Tu"?"#e8f5e9":"#f5f5f5"};font-size:11px"><b>${t.who}</b> · ${t.date} ${t.time}<br>${t.text}</div>`).join("");
          return `<div style="margin-bottom:12px;border:1px solid #ddd;border-radius:8px;overflow:hidden"><div style="padding:8px 12px;background:#f8f8f8;border-bottom:1px solid #ddd"><b>${m.from}</b> · ${m.canale} · ${(m.thread||[]).length} msg</div><div style="padding:8px 12px">${threads}</div></div>`;
        }).join("") : "";
        w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dossier ${c.code}</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#1a1a1c}
h1{color:#34c759;border-bottom:3px solid #34c759;padding-bottom:8px}h2{color:#555;margin-top:24px;border-bottom:1px solid #ddd;padding-bottom:4px}
table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:12px}
th{background:#f5f5f5;font-weight:700}.grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0}
.kpi{background:#f8f8f8;padding:12px;border-radius:8px;text-align:center}.kpi b{font-size:18px;display:block}
.green{color:#34c759}.red{color:#ff3b30}.orange{color:#ff9500}
@media print{body{padding:0}h1{font-size:18px}}</style></head><body>
<h1>📋 DOSSIER COMMESSA ${c.code}</h1>
<p><b>Cliente:</b> ${c.cliente} ${c.cognome||""}<br>
<b>Indirizzo:</b> ${c.indirizzo||""}<br>
<b>Telefono:</b> ${c.telefono||""} · <b>Email:</b> ${c.email||""}<br>
<b>CF:</b> ${c.cf||""} · <b>P.IVA:</b> ${c.piva||""}<br>
<b>Sistema:</b> ${c.sistema||""} · <b>Tipo:</b> ${c.tipo||""}<br>
<b>Pratica Fiscale:</b> ${c.praticaFiscale||"Nessuna"}</p>
<h2>💰 Riepilogo Economico</h2>
<div class="grid">
<div class="kpi"><small>PREVENTIVO</small><b>${fD(totID)}</b></div>
<div class="kpi"><small>INCASSATO</small><b class="green">${fD(incD)}</b></div>
<div class="kpi"><small>MARGINE</small><b class="${(incD-costD)>=0?"green":"red"}">${fD(incD-costD)}</b></div>
</div>
<p>Imponibile: ${fD(totPD)} · IVA ${ivaP}% · Totale: ${fD(totID)}<br>
Costi fornitori: ${fD(costD)} · Margine: ${fD(incD-costD)} (${totPD>0?Math.round((incD-costD)/totPD*100):0}%)</p>
<h2>📐 Vani (${allVD.length})</h2>
<table><tr><th>Nome</th><th>Stanza</th><th>Tipo</th><th>Sistema</th><th>L×H mm</th><th>Prezzo</th></tr>${vaniHTML}</table>
<h2>📄 Fatture (${fattD.length})</h2>
<table><tr><th>Numero</th><th>Tipo</th><th>Importo</th><th>Stato</th><th>Data</th></tr>${fatHTML}</table>
<h2>📦 Ordini (${ordD.length})</h2>
<table><tr><th>Fornitore</th><th>Importo</th><th>Stato</th><th>Consegna</th></tr>${ordHTML}</table>
<h2>📅 Timeline</h2>
<table><tr><th>Data/Ora</th><th>Evento</th><th>Dettaglio</th></tr>${timeHTML}</table>
${msgsCm.length > 0 ? "<h2>💬 Comunicazioni (" + msgsCm.length + " conversazioni)</h2>" + msgHTML : ""}
<hr><p style="font-size:10px;color:#999">Generato da MASTRO ERP · Walter Cozza Serramenti SRL · ${new Date().toLocaleDateString("it-IT")}</p>
</body></html>`);
        w.document.close();
        setTimeout(() => w.print(), 500);
      };

      return (
        <div style={{ paddingBottom: 80 }}>
          {/* Header */}
          <div style={S.header}>
            <div onClick={() => { setSelectedCM(null); setSelectedRilievo(null); }} style={{ cursor:"pointer", padding:4 }}><Ico d={ICO.back} s={20} c={T.sub} /></div>
            <div style={{ flex:1 }}>
              <div style={S.headerTitle}>{c.code} · {c.cliente} {c.cognome||""}</div>
              <div style={S.headerSub}>{c.indirizzo}</div>
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <div onClick={stampaReport} style={{ padding:"6px 12px", borderRadius:8, background:"#007aff", color:"#fff", fontSize:10, fontWeight:700, cursor:"pointer" }}>🖨 Stampa</div>
              <span style={{ padding:"6px 12px", borderRadius:9, background:"#34c75918", color:"#34c759", fontSize:11, fontWeight:800, border:"1.5px solid #34c759" }}>✅ ARCHIVIATA</span>
            </div>
          </div>

          {/* Banner verde */}
          <div style={{ margin:"0 16px 8px", background:"#34c759", borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:28 }}>📋</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:18, fontWeight:900, color:"#fff" }}>DOSSIER COMMESSA</div>
              <div style={{ fontSize:12, color:"#ffffffcc" }}>{c.code} · Completata · {allVD.length} vani · {fD(totID)}</div>
            </div>
          </div>

          {/* Tab navigation */}
          <div style={{ display:"flex", gap:2, padding:"0 16px 8px" }}>
            {[
              { id:"storia", l:"📅 Storia", col:"#5856d6" },
              { id:"economico", l:"💰 Economico", col:"#34c759" },
              { id:"vani", l:"📐 Vani", col:"#007aff" },
              { id:"documenti", l:"📁 Documenti", col:"#ff9500" },
            ].map(t => (
              <div key={t.id} onClick={() => setDossierTab(t.id)}
                style={{ flex:1, padding:"8px 4px", borderRadius:8, textAlign:"center", fontSize:10, fontWeight:700, cursor:"pointer",
                  background: dossierTab === t.id ? t.col + "15" : T.bg,
                  color: dossierTab === t.id ? t.col : T.sub,
                  border: "1.5px solid " + (dossierTab === t.id ? t.col : T.bdr),
                }}>{t.l}</div>
            ))}
          </div>

          {/* ═══ TAB: STORIA (Timeline) ═══ */}
          {dossierTab === "storia" && (
            <div style={{ padding:"0 16px" }}>
              {/* Cliente card */}
              <div style={{ background:T.card, borderRadius:12, border:"1px solid "+T.bdr, padding:14, marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:6 }}>👤 DATI CLIENTE</div>
                <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{c.cliente} {c.cognome||""}</div>
                {c.indirizzo && <div style={{ fontSize:12, color:T.sub, marginTop:2 }}>📍 {c.indirizzo}</div>}
                <div style={{ display:"flex", gap:12, marginTop:6, flexWrap:"wrap" as const }}>
                  {c.telefono && <span onClick={() => window.location.href="tel:"+c.telefono} style={{ fontSize:11, color:T.acc, cursor:"pointer" }}>📞 {c.telefono}</span>}
                  {c.email && <span style={{ fontSize:11, color:T.acc }}>✉️ {c.email}</span>}
                </div>
                <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" as const }}>
                  {c.cf && <span style={{ fontSize:10, color:T.sub }}>CF: {c.cf}</span>}
                  {c.piva && <span style={{ fontSize:10, color:T.sub }}>P.IVA: {c.piva}</span>}
                  {c.pec && <span style={{ fontSize:10, color:T.sub }}>PEC: {c.pec}</span>}
                  {c.sdi && <span style={{ fontSize:10, color:T.sub }}>SDI: {c.sdi}</span>}
                </div>
                <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" as const }}>
                  {c.sistema && <span style={S.badge(T.blueLt, T.blue)}>{c.sistema}</span>}
                  {c.tipo && <span style={S.badge(T.grnLt, T.grn)}>{c.tipo}</span>}
                  {c.praticaFiscale && <span style={S.badge("#ff950018", "#ff9500")}>🏛 {c.praticaFiscale}</span>}
                </div>
              </div>

              {/* Timeline */}
              <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:8 }}>📅 TIMELINE COMPLETA ({timeline.length} eventi)</div>
              {timeline.map((ev, i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:2 }}>
                  <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", width:24 }}>
                    <div style={{ width:24, height:24, borderRadius:12, background:ev.col+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, flexShrink:0 }}>{ev.ico}</div>
                    {i < timeline.length - 1 && <div style={{ width:2, flex:1, background:T.bdr, marginTop:2 }}/>}
                  </div>
                  <div style={{ flex:1, paddingBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.text, flex:1 }}>{ev.titolo}</div>
                      <div style={{ fontSize:9, color:ev.col, fontWeight:600, textAlign:"right" as const, flexShrink:0, marginLeft:8 }}>
                        {ev.data}{ev.ora ? " · " + ev.ora : ""}
                      </div>
                    </div>
                    <div style={{ fontSize:10, color:T.sub, marginTop:1 }}>{ev.desc}</div>
                  </div>
                </div>
              ))}

              {/* Note */}
              {c.note && (
                <div style={{ background:T.card, borderRadius:12, border:"1px solid "+T.bdr, padding:14, marginTop:8 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:T.sub, marginBottom:4 }}>📝 NOTE</div>
                  <div style={{ fontSize:12, color:T.text, whiteSpace:"pre-wrap" as const }}>{c.note}</div>
                </div>
              )}

              {/* Messaggi collegati */}
              {msgsCm.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:8 }}>💬 COMUNICAZIONI ({msgsCm.length} conversazioni · {msgsCm.reduce((s,m) => s + (m.thread?.length||0), 0)} messaggi)</div>
                  {msgsCm.map(m => {
                    const chIcoM = { email: "📧", whatsapp: "💬", sms: "📱", telegram: "✈️" };
                    const chColM = { email: "#5856d6", whatsapp: "#25d366", sms: "#ff9500", telegram: "#0088cc" };
                    const mcol = chColM[m.canale] || "#86868b";
                    return (
                      <div key={m.id} style={{ background:T.card, borderRadius:12, border:"1px solid "+T.bdr, marginBottom:8, overflow:"hidden" }}>
                        <div style={{ padding:"10px 14px", borderBottom:"1px solid "+T.bdr, display:"flex", alignItems:"center", gap:10, background:mcol+"06" }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:mcol+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{chIcoM[m.canale]||"💬"}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{m.from}</div>
                            <div style={{ fontSize:9, color:T.sub }}>{m.canale} · {m.date||""} · {(m.thread||[]).length} messaggi</div>
                          </div>
                        </div>
                        <div style={{ padding:"8px 14px" }}>
                          {(m.thread||[]).map((t, ti) => {
                            const isMe = t.who === "Tu";
                            return (
                              <div key={ti} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start", marginBottom:4 }}>
                                <div style={{ maxWidth:"85%", padding:"8px 12px", borderRadius:isMe?"12px 12px 4px 12px":"12px 12px 12px 4px",
                                  background:isMe?mcol+"15":T.bg, fontSize:11, color:T.text }}>
                                  <div style={{ fontSize:9, fontWeight:700, color:isMe?mcol:T.sub, marginBottom:2 }}>{t.who} · {t.date} {t.time}</div>
                                  {t.text}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ TAB: ECONOMICO ═══ */}
          {dossierTab === "economico" && (
            <div style={{ padding:"0 16px" }}>
              {/* KPI */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                {[{l:"PREVENTIVO",v:fD(totID),cl:T.text},{l:"INCASSATO",v:fD(incD),cl:"#34c759"},{l:"MARGINE",v:fD(incD-costD),cl:(incD-costD)>=0?"#34c759":"#ff3b30"}].map((k,i) => (
                  <div key={i} style={{ padding:12, borderRadius:10, background:T.card, textAlign:"center", border:"1px solid "+T.bdr }}>
                    <div style={{ fontSize:8, color:T.sub, fontWeight:700 }}>{k.l}</div>
                    <div style={{ fontSize:18, fontWeight:900, color:k.cl }}>{k.v}</div>
                  </div>
                ))}
              </div>
              {/* Detail */}
              <div style={{ background:T.card, borderRadius:12, border:"1px solid "+T.bdr, padding:14, marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:800, color:T.sub, marginBottom:8 }}>DETTAGLIO</div>
                {[
                  { l: "Imponibile", v: fD(totPD) },
                  { l: "IVA " + ivaP + "%", v: fD(totID - totPD) },
                  { l: "Totale preventivo", v: fD(totID), bold: true },
                  { l: "Costi fornitori", v: fD(costD), cl: "#ff9500" },
                  { l: "Margine lordo", v: fD(incD - costD), cl: (incD-costD) >= 0 ? "#34c759" : "#ff3b30", bold: true },
                  { l: "% Margine", v: totPD > 0 ? Math.round((incD-costD)/totPD*100) + "%" : "—" },
                ].map((r, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom: "1px solid " + T.bdr + "30", fontSize:12 }}>
                    <span style={{ color:T.sub, fontWeight: r.bold ? 700 : 400 }}>{r.l}</span>
                    <span style={{ color: r.cl || T.text, fontWeight: r.bold ? 800 : 600 }}>{r.v}</span>
                  </div>
                ))}
              </div>
              {restD > 0 && <div style={{ background:"#ff950010", borderRadius:12, border:"1px solid #ff950030", padding:14, textAlign:"center", marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#ff9500" }}>⚠️ RESTA DA INCASSARE</div>
                <div style={{ fontSize:22, fontWeight:900, color:"#ff9500" }}>{fD(restD)}</div>
              </div>}
              {/* Fatture */}
              <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:6 }}>📄 FATTURE ({fattD.length})</div>
              {fattD.map(f => (
                <div key={f.id} style={{ background:T.card, borderRadius:10, border:"1px solid "+T.bdr, padding:"10px 12px", marginBottom:6, borderLeft:"4px solid "+(f.pagata?"#34c759":"#ff3b30") }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:T.text }}>N.{f.numero}/{f.anno} — {f.tipo}</div>
                      <div style={{ fontSize:10, color:T.sub }}>{f.data} · {f.cliente}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:14, fontWeight:900, color:f.pagata?"#34c759":"#ff3b30" }}>{fD(f.importo)}</div>
                      <div style={{ fontSize:9, color:f.pagata?"#34c759":"#ff9500" }}>{f.pagata?"✅ Pagata"+(f.dataPagamento?" "+f.dataPagamento:""):"⏳ Scad. "+(f.scadenza||"")}</div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Ordini */}
              <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:6, marginTop:10 }}>📦 ORDINI FORNITORI ({ordD.length})</div>
              {ordD.map(o => {
                const st = ORDINE_STATI.find(s => s.id === o.stato) || ORDINE_STATI[0];
                return (
                  <div key={o.id} style={{ background:T.card, borderRadius:10, border:"1px solid "+T.bdr, padding:"10px 12px", marginBottom:6, borderLeft:"4px solid "+st.color }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{st.icon} {o.fornitore?.nome||""}</div>
                        <div style={{ fontSize:10, color:T.sub }}>Inviato: {o.dataInvio||""} · Consegna: {o.consegna?.prevista||"—"}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:14, fontWeight:900, color:T.text }}>{fD(o.totaleIva||o.totale||0)}</div>
                        <span style={{ fontSize:8, fontWeight:700, padding:"2px 6px", borderRadius:4, background:st.color+"18", color:st.color }}>{st.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ TAB: VANI ═══ */}
          {dossierTab === "vani" && (
            <div style={{ padding:"0 16px" }}>
              <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:8 }}>📐 VANI RILEVATI ({allVD.length})</div>
              {(c.rilievi||[]).map(r => (
                <div key={r.id}>
                  <div onClick={() => setSelectedRilievo(r)} style={{ fontSize:11, fontWeight:700, color:"#5856d6", marginBottom:6, cursor:"pointer" }}>
                    📐 Rilievo #{r.n} — {r.data} · {r.rilevatore||"Fabio"} · {(r.vani||[]).length} vani
                  </div>
                  {(r.vani||[]).map(v => {
                    const m = v.misure || {};
                    const prezzo = calcolaVanoPrezzo(v, c);
                    return (
                      <div key={v.id} style={{ background:T.card, borderRadius:12, border:"1px solid "+T.bdr, padding:12, marginBottom:8 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{v.nome || v.tipo}</div>
                            <div style={{ fontSize:10, color:T.sub }}>{v.stanza||""} · {v.piano||""} · {v.tipo} · {v.sistema||c.sistema||""}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:13, fontWeight:900, color:T.acc }}>{fD(prezzo)}</div>
                            <div style={{ fontSize:9, color:T.sub }}>{m.lCentro||"—"}×{m.hCentro||"—"} mm</div>
                          </div>
                        </div>
                        {/* Colors */}
                        <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" as const }}>
                          {v.coloreInt && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:T.bg, color:T.sub }}>Int: {v.coloreInt}</span>}
                          {v.coloreEst && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:T.bg, color:T.sub }}>Est: {v.coloreEst}</span>}
                          {v.bicolore && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:"#af52de18", color:"#af52de" }}>Bicolore</span>}
                        </div>
                        {/* Accessories */}
                        <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" as const }}>
                          {v.accessori?.tapparella?.attivo && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:"#007aff12", color:"#007aff" }}>🪟 Tapparella</span>}
                          {v.accessori?.persiana?.attivo && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:"#ff950012", color:"#ff9500" }}>🚪 Persiana</span>}
                          {v.accessori?.zanzariera?.attivo && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:"#34c75912", color:"#34c759" }}>🦟 Zanzariera</span>}
                          {v.cassonetto && <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:"#86868b12", color:"#86868b" }}>📦 Cassonetto</span>}
                        </div>
                        {/* Measures detail */}
                        {Object.keys(m).length > 0 && (
                          <div style={{ marginTop:6, padding:8, borderRadius:8, background:T.bg, display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:4 }}>
                            {[{l:"L alto",v:m.lAlto},{l:"L centro",v:m.lCentro},{l:"L basso",v:m.lBasso},{l:"H sx",v:m.hSx},{l:"H centro",v:m.hCentro},{l:"H dx",v:m.hDx},{l:"D1",v:m.d1},{l:"D2",v:m.d2}].map((mi,idx) => mi.v ? (
                              <div key={idx} style={{ textAlign:"center" }}>
                                <div style={{ fontSize:7, color:T.sub }}>{mi.l}</div>
                                <div style={{ fontSize:10, fontWeight:700, color:T.text }}>{mi.v}</div>
                              </div>
                            ) : null)}
                          </div>
                        )}
                        {v.note && <div style={{ fontSize:10, color:T.sub, marginTop:4, fontStyle:"italic" }}>{v.note}</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* ═══ TAB: DOCUMENTI ═══ */}
          {dossierTab === "documenti" && (
            <div style={{ padding:"0 16px" }}>
              {/* Pratica Fiscale */}
              {c.praticaFiscale && (
                <div style={{ background:"#ff950010", borderRadius:12, border:"1px solid #ff950030", padding:14, marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:800, color:"#ff9500" }}>🏛 Pratica Fiscale: {c.praticaFiscale}</div>
                  {(c.docFiscali||[]).map((d: any, i: number) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"1px solid #ff950020" }}>
                      <span style={{ fontSize:14 }}>📑</span>
                      <div><div style={{ fontSize:11, fontWeight:700, color:T.text }}>{typeof d === "string" ? d : d.nome}</div>{d.data && <div style={{ fontSize:9, color:T.sub }}>{d.data}</div>}</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Doc identita */}
              {(c.docIdentita||[]).length > 0 && (
                <div style={{ background:"#5856d610", borderRadius:12, border:"1px solid #5856d630", padding:14, marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:800, color:"#5856d6", marginBottom:6 }}>🪪 Documenti di Riconoscimento</div>
                  {(c.docIdentita||[]).map((d: any, i: number) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #5856d620" }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:"#5856d618", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{d.tipo==="CI"?"🪪":"💳"}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{d.tipo==="CI"?"Carta d'Identità":"Codice Fiscale"}</div>
                        <div style={{ fontSize:10, color:T.sub }}>{d.nome} · {d.data||""}</div>
                      </div>
                      {d.dataUrl && <img src={d.dataUrl} style={{ width:48, height:48, borderRadius:6, objectFit:"cover" as const }} />}
                    </div>
                  ))}
                </div>
              )}
              {/* Allegati */}
              <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:6 }}>📎 ALLEGATI ({(c.allegati||[]).length})</div>
              {(c.allegati||[]).map((a: any, i: number) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid "+T.bdr+"20" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
                    {a.tipo==="firma"?"✍️":a.tipo==="fattura"?"📄":a.tipo==="ordine"?"📦":a.tipo==="conferma"?"✅":a.tipo==="verbale"?"📋":"📎"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{a.nome}</div>
                    <div style={{ fontSize:10, color:T.sub }}>{a.tipo||"allegato"} · {a.data||""}</div>
                  </div>
                </div>
              ))}
              {(c.allegati||[]).length === 0 && <div style={{ fontSize:11, color:T.sub, textAlign:"center", padding:16 }}>Nessun allegato</div>}
              {/* Foto Vani */}
              {fotoVani.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:6 }}>📷 FOTO VANI ({fotoVani.length})</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
                    {fotoVani.map((f, i) => (
                      <div key={i} style={{ borderRadius:8, overflow:"hidden", border:"1px solid "+T.bdr }}>
                        <img src={f.url} style={{ width:"100%", height:80, objectFit:"cover" as const }} />
                        <div style={{ padding:"3px 6px", fontSize:8, color:T.sub }}>{f.vano}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Montaggi */}
          {montD.length > 0 && (
            <div style={{ padding:"8px 16px" }}>
              <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:6 }}>🔧 MONTAGGI ({montD.length})</div>
              {montD.map(m => { const sq=(squadreDB||[]).find(s=>s.id===m.squadraId); return (
                <div key={m.id} style={{ background:T.card, borderRadius:10, border:"1px solid "+T.bdr, padding:"10px 12px", marginBottom:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <div><div style={{ fontSize:12, fontWeight:700, color:T.text }}>{m.data||"—"} · {sq?.nome||""}</div><div style={{ fontSize:10, color:T.sub }}>{m.vani||"?"} vani · {m.durata||""}</div></div>
                    <span style={{ fontSize:10, fontWeight:700, color:m.stato==="completato"?"#34c759":"#007aff" }}>{m.stato==="completato"?"✅ Completato":m.stato}</span>
                  </div>
                  {m.note && <div style={{ fontSize:10, color:T.sub, marginTop:3 }}>{m.note}</div>}
                </div>
              );})}
            </div>
          )}

          {/* Actions */}
          <div style={{ padding:"12px 16px", display:"flex", gap:8, justifyContent:"center" }}>
            <div onClick={stampaReport} style={{ padding:"10px 20px", borderRadius:10, background:"#007aff", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>🖨 Stampa Report Completo</div>
            <div onClick={() => { setCantieri(cs => cs.map(cm => cm.id===c.id?{...cm,fase:"posa"}:cm)); setSelectedCM(p => ({...p,fase:"posa"})); }}
              style={{ padding:"10px 20px", borderRadius:10, background:"#ff950018", color:"#ff9500", fontSize:12, fontWeight:700, cursor:"pointer", border:"1px solid #ff950040" }}>↩ Riapri</div>
          </div>
          <div style={{ padding:"8px 16px", textAlign:"center" }}>
            <span onClick={() => deleteCommessa(c.id)} style={{ fontSize:11, color:T.sub2||T.sub, cursor:"pointer", textDecoration:"underline" }}>Elimina commessa</span>
          </div>
        </div>
      );
    }

    // == LISTA RILIEVI ==
    const tipoColor = { rilievo: T.blue, definitiva: T.grn, modifica: T.orange };
    const tipoIco   = { rilievo: "📐", definitiva: "✅", modifica: "🔧" };
    const [rilTab, setRilTab] = (window as any).__rilTab__ || [null, null];
    // Use local state via component trick: riutilizza cmSubTab per il tab rilievi/report
    return (
      <div style={{ paddingBottom: 80 }}>
        {/* Header */}
        <div style={S.header}>
          <div onClick={() => { setSelectedCM(null); setSelectedRilievo(null); }} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={20} c={T.sub} /></div>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>{c.code} · {c.cliente} {c.cognome || ""}</div>
            <div style={S.headerSub}>{c.indirizzo}</div>
          </div>
          {c.fase === "chiusura" ? (
            <span style={{ padding: "6px 14px", borderRadius: 9, background: "#34c75918", color: "#34c759", fontSize: 11, fontWeight: 800, border: "1.5px solid #34c759" }}>✅ ARCHIVIATA</span>
          ) : (
          <div onClick={() => setShowNuovoRilievo(true)}
            style={{ padding: "7px 14px", borderRadius: 9, background: T.acc, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            + Rilievo
          </div>
          )}
        </div>

        {/* Info badges */}
        <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          <PipelineBar fase={c.fase} />
        </div>
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {c.sistema && <span style={S.badge(T.blueLt, T.blue)}>{c.sistema}</span>}
          {c.tipo === "nuova" && <span style={S.badge(T.grnLt, T.grn)}>🆕 Nuova</span>}
          {c.tipo === "riparazione" && <span style={S.badge(T.orangeLt, T.orange)}>🔧 Riparazione</span>}
          {c.telefono && <span onClick={() => window.location.href=`tel:${c.telefono}`} style={{ ...S.badge(T.grnLt, T.grn), cursor: "pointer" }}>📞 {c.telefono}</span>}
          {c.euro > 0 && <span style={S.badge(T.accLt, T.acc)}>€{c.euro.toLocaleString("it-IT")}</span>}
        </div>


        {/* ═══ DOSSIER COMMESSA CHIUSA ═══ */}
        {c.fase === "chiusura" && (() => {
          const rilievi = c.rilievi || [];
          const allVani = getVaniAttivi(c);
          const fattCm = fattureDB.filter(f => f.cmId === c.id);
          const ordCm = (ordiniFornDB || []).filter(o => o.cmId === c.id);
          const montCm = (montaggiDB || []).filter(m => m.cmId === c.id);
          const totPrev = allVani.reduce((s, v) => s + calcolaVanoPrezzo(v, c), 0) + (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo || 0) * (vl.qta || 1)), 0);
          const totIvaD = totPrev * (1 + (c.ivaPerc || 10) / 100);
          const incassato = fattCm.filter(f => f.pagata).reduce((s, f) => s + f.importo, 0);
          const costoForn = ordCm.reduce((s, o) => s + (o.totaleIva || o.totale || 0), 0);
          const fmtE = (n: number) => "€" + n.toLocaleString("it-IT", { minimumFractionDigits: 2 });
          const docs: Array<{ico:string;nome:string;detail:string;col:string}> = [];
          rilievi.forEach(r => docs.push({ ico: "📏", nome: `Rilievo #${r.n} — ${r.tipo || "rilievo"}`, detail: `${(r.vani || []).length} vani · ${r.data || ""}`, col: T.blue }));
          if (c.firmaCliente) docs.push({ ico: "✍️", nome: "Preventivo Firmato", detail: c.dataFirma || "", col: T.grn });
          fattCm.forEach(f => docs.push({ ico: "📄", nome: `Fattura N.${f.numero}/${f.anno} — ${f.tipo}`, detail: `${fmtE(f.importo)} · ${f.pagata ? "✅ Pagata" : "⏳ Da incassare"}`, col: f.pagata ? T.grn : T.red }));
          ordCm.forEach(o => docs.push({ ico: "📦", nome: `Ordine ${o.fornitore?.nome || ""}`, detail: `${fmtE(o.totaleIva || o.totale || 0)} · ${o.conferma?.ricevuta ? "✅ Confermato" : "⏳"}`, col: T.purple }));
          montCm.forEach(m => { const sq = (squadreDB || []).find(s => s.id === m.squadraId); docs.push({ ico: "🔧", nome: `Montaggio ${m.data || ""}`, detail: `${sq?.nome || ""} · ${m.stato === "completato" ? "✅ Completato" : m.stato}`, col: "#007aff" }); });
          if (c.praticaFiscale) docs.push({ ico: "🏛", nome: `Pratica Fiscale: ${c.praticaFiscale}`, detail: `${(c.docFiscali || []).length} documenti`, col: T.orange });
          (c.docIdentita || []).forEach(d => docs.push({ ico: d.tipo === "CI" ? "🪪" : "💳", nome: d.tipo === "CI" ? "Carta d'Identità" : "Codice Fiscale", detail: `${d.nome} · ${d.data || ""}`, col: "#5856d6" }));
          (c.docFiscali || []).forEach(d => docs.push({ ico: "📑", nome: d.nome, detail: d.data || "", col: T.orange }));
          (c.allegati || []).forEach(a => docs.push({ ico: a.tipo === "firma" ? "✍️" : a.tipo === "fattura" ? "📄" : a.tipo === "ordine" ? "📦" : a.tipo === "conferma" ? "✅" : a.tipo === "verbale" ? "📋" : "📎", nome: a.nome, detail: a.data || "", col: "#86868b" }));
          
          return <div style={{ margin: "0 16px 12px", background: "linear-gradient(135deg, #34c75908, #34c75912)", borderRadius: 16, border: "2px solid #34c759", overflow: "hidden" }}>
            {/* Banner */}
            <div style={{ background: "#34c759", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 24 }}>📋</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>DOSSIER COMMESSA</div>
                <div style={{ fontSize: 11, color: "#ffffffcc" }}>{c.code} · {c.cliente} {c.cognome || ""} · Completata</div>
              </div>
            </div>
            
            {/* Dati Cliente */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #34c75920" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6 }}>👤 CLIENTE</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.cliente} {c.cognome || ""}</div>
              {c.indirizzo && <div style={{ fontSize: 11, color: T.sub }}>📍 {c.indirizzo}</div>}
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                {c.telefono && <span style={{ fontSize: 11, color: T.acc }}>📞 {c.telefono}</span>}
                {c.email && <span style={{ fontSize: 11, color: T.acc }}>✉️ {c.email}</span>}
                {c.cf && <span style={{ fontSize: 11, color: T.sub }}>CF: {c.cf}</span>}
              </div>
            </div>
            
            {/* Riepilogo Economico */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #34c75920" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 8 }}>💰 RIEPILOGO ECONOMICO</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <div style={{ padding: 8, borderRadius: 8, background: "#fff", textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: T.sub, fontWeight: 700 }}>PREVENTIVO</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{fmtE(totIvaD)}</div>
                </div>
                <div style={{ padding: 8, borderRadius: 8, background: "#fff", textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: T.sub, fontWeight: 700 }}>INCASSATO</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.grn }}>{fmtE(incassato)}</div>
                </div>
                <div style={{ padding: 8, borderRadius: 8, background: "#fff", textAlign: "center" }}>
                  <div style={{ fontSize: 7, color: T.sub, fontWeight: 700 }}>MARGINE</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: (incassato - costoForn) >= 0 ? T.grn : T.red }}>{fmtE(incassato - costoForn)}</div>
                </div>
              </div>
            </div>
            
            {/* Tutti i Documenti */}
            <div style={{ padding: "12px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 8 }}>📁 DOCUMENTI E ATTIVITÀ ({docs.length})</div>
              {docs.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i < docs.length - 1 ? "1px solid #34c75915" : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: d.col + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{d.ico}</div>
                  <div style={{ flex: 1, marginLeft: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{d.nome}</div>
                    <div style={{ fontSize: 9, color: T.sub }}>{d.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Riapri */}
            <div style={{ padding: "8px 16px 12px", textAlign: "center" }}>
              <div onClick={() => { setCantieri(cs => cs.map(cm => cm.id === c.id ? {...cm, fase: "posa"} : cm)); setSelectedCM(p => ({...p, fase: "posa"})); }}
                style={{ fontSize: 11, color: "#ff9500", cursor: "pointer", textDecoration: "underline" }}>↩ Riapri commessa</div>
            </div>
          </div>;
        })()}

        {/* ═══════════════════════════════════════════════════ */}
        {/* ═══ CENTRO COMANDO v4 — TIMELINE COMPLETA ═══════ */}
        {/* ═══════════════════════════════════════════════════ */}
        {c.fase !== "chiusura" && (() => {
          const vani = getVaniAttivi(c);
          const rilievi = c.rilievi || [];
          const hasRilievi = rilievi.length > 0;
          const hasVani = vani.length > 0;
          const vaniConMisure = vani.filter(v => Object.keys(v.misure || {}).length >= 4);
          const vaniConPrezzo = vani.filter(v => calcolaVanoPrezzo(v, c) > 0);
          const totVani = vani.reduce((s, v) => s + calcolaVanoPrezzo(v, c), 0);
          const totVoci = (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo || 0) * (vl.qta || 1)), 0);
          const totPreventivo = totVani + totVoci;
          const ivaPerc = c.ivaPerc || 10;
          const totIva = totPreventivo * (1 + ivaPerc / 100);
          const hasFirma = !!c.firmaCliente;
          const fattureCommessa = fattureDB.filter(f => f.cmId === c.id);
          const hasAcconto = fattureCommessa.some(f => f.tipo === "acconto");
          const hasUnica = fattureCommessa.some(f => f.tipo === "unica");
          const hasFattura = hasAcconto || hasUnica;
          const incassato = fattureCommessa.filter(f => f.pagata).reduce((s, f) => s + (f.importo || 0), 0);
          const ordiniCommessa = ordiniFornDB.filter(o => o.cmId === c.id);
          const hasOrdine = ordiniCommessa.length > 0;
          const ordineConfermato = ordiniCommessa.some(o => o.conferma?.ricevuta);
          const confermaFirmata = ordiniCommessa.some(o => o.conferma?.firmata);
          const montaggiCommessa = montaggiDB.filter(m => m.cmId === c.id);
          const hasMontaggio = montaggiCommessa.length > 0;
          const hasSaldo = fattureCommessa.some(f => f.tipo === "saldo");
          const saldoPagato = fattureCommessa.find(f => f.tipo === "saldo")?.pagata;
          const unicaPagata = fattureCommessa.find(f => f.tipo === "unica")?.pagata;
          const tuttoChiuso = (hasSaldo && saldoPagato) || (hasUnica && unicaPagata) || (c.fase === "chiusura" && incassato >= totIva) || (incassato >= totIva && fattureCommessa.length > 0 && fattureCommessa.every(f => f.pagata));

          const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";

          const steps = [
            { id: "rilievo", icon: "📐", label: "Rilievo", done: hasRilievi,
              detail: hasRilievi ? `${rilievi.length} rilievo · ${vani.length} vani · ${rilievi[0]?.data || ""}` : null },
            { id: "misure", icon: "📏", label: "Misure e Preventivo", done: hasVani && vaniConPrezzo.length > 0,
              detail: vaniConPrezzo.length > 0 ? `${vaniConPrezzo.length}/${vani.length} vani prezzati · Totale €${fmt(totPreventivo)}` : hasVani ? `${vaniConMisure.length}/${vani.length} vani misurati` : null },
            { id: "firma", icon: "✍️", label: "Firma Cliente", done: hasFirma,
              detail: hasFirma ? `Firmato il ${c.dataFirma || "—"} · €${fmt(totIva)} IVA incl.` : null },
            { id: "fattura", icon: "💰", label: "Fattura Acconto", done: hasFattura,
              detail: hasFattura ? fattureCommessa.map(f => `${f.tipo} €${fmt(f.importo)} ${f.pagata ? "✅ pagata" : "⏳ in attesa"}`).join(" · ") : null },
            { id: "ordine", icon: "📦", label: "Ordine Fornitore", done: hasOrdine,
              detail: hasOrdine ? `${ordiniCommessa[0]?.fornitore?.nome || "Fornitore da inserire"} · €${fmt(ordiniCommessa[0]?.totaleIva || 0)} · ${ordiniCommessa[0]?.stato || "bozza"}` : null },
            { id: "conferma", icon: "📄", label: "Conferma Fornitore", done: confermaFirmata,
              detail: ordineConfermato ? `Ricevuta · ${ordiniCommessa[0]?.consegna?.settimane || "?"} sett. · consegna ${ordiniCommessa[0]?.consegna?.prevista ? new Date(ordiniCommessa[0].consegna.prevista).toLocaleDateString("it-IT") : "da definire"}` : null },
            { id: "montaggio", icon: "🔧", label: "Montaggio", done: hasMontaggio,
              detail: hasMontaggio ? `${montaggiCommessa[0]?.data ? new Date(montaggiCommessa[0].data).toLocaleDateString("it-IT") : "Da pianificare"} · Squadra ${squadreDB.find(s => s.id === montaggiCommessa[0]?.squadraId)?.nome || "—"}` : null },
            { id: "saldo", icon: "💶", label: "Chiusura", done: tuttoChiuso,
              detail: tuttoChiuso ? `Incassato €${fmt(incassato)} · ✅ Completata` : null },
          ];

          const doneCount = steps.filter(s => s.done).length;
          const currentIdx = steps.findIndex(s => !s.done);
          const current = currentIdx >= 0 ? steps[currentIdx] : null;
          const progress = Math.round((doneCount / steps.length) * 100);

          return (
            <div style={{ margin: "0 16px 12px" }}>
              {/* Header with progress */}
              <div style={{ background: T.card, borderRadius: "16px 16px 0 0", border: `1px solid ${T.bdr}`, borderBottom: "none", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>🎯 Centro Comando</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.acc, fontFamily: FM }}>{doneCount}/{steps.length} · {progress}%</div>
                </div>
                <div style={{ height: 6, background: T.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: `linear-gradient(90deg, #34c759, ${T.acc})`, width: `${progress}%`, borderRadius: 3, transition: "width 0.5s" }} />
                </div>
                {/* Success flash */}
                {ccDone && (
                  <div style={{ marginTop: 6, padding: "10px 12px", borderRadius: 8, background: "#34c75918", border: "1px solid #34c75940", fontSize: 13, fontWeight: 700, color: "#34c759", textAlign: "center", animation: "fadeIn 0.3s" }}>
                    {ccDone}
                  </div>
                )}
                {/* Step dots */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 2px" }}>
                  {steps.map((s, i) => (
                    <div key={s.id} style={{
                      width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                      background: s.done ? "#34c759" : i === currentIdx ? T.acc : T.bg,
                      color: s.done || i === currentIdx ? "#fff" : T.sub, fontWeight: 700,
                      boxShadow: i === currentIdx ? `0 0 0 3px ${T.acc}40` : "none",
                    }}>{s.done ? "✓" : s.icon}</div>
                  ))}
                </div>
              </div>

              {/* Timeline — ALL steps visible */}
              <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderTop: "none", borderRadius: "0 0 16px 16px", overflow: "hidden" }}>
                {steps.map((step, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isFuture = !step.done && !isCurrent;
                  const borderColor = step.done ? "#34c759" : isCurrent ? T.acc : T.bg;

                  // Collect docs for this step
                  const stepDocs: any[] = [];
                  if (step.id === "rilievo") { rilievi.forEach(r => stepDocs.push({ nome: `Rilievo #${r.n} — ${r.data}`, tipo: "rilievo", data: r.data, detail: `${(r.vani||[]).length} vani · ${r.rilevatore||"Fabio"}` })); }
                  else if (step.id === "misure") { stepDocs.push({ nome: `Preventivo ${c.code}`, tipo: "preventivo", detail: `${vaniConPrezzo.length} vani · €${fmt(totPreventivo)}` }); }
                  else if (step.id === "firma") { stepDocs.push({ nome: "Preventivo firmato", tipo: "firma", data: c.dataFirma||"—", detail: `€${fmt(totIva)} IVA incl.` }); (c.allegati||[]).filter(a => a.tipo === "firma").forEach(a => stepDocs.push({ nome: a.nome, tipo: a.tipo, data: a.data, detail: "" })); }
                  else if (step.id === "fattura") { fattureCommessa.forEach(f => stepDocs.push({ nome: `Fattura N.${f.numero}/${f.anno} — ${f.tipo}`, tipo: "fattura", data: f.data, detail: `€${fmt(f.importo)} · ${f.pagata?"✅ Pagata":"⏳ In attesa"}` })); }
                  else if (step.id === "ordine") { ordiniCommessa.forEach(o => stepDocs.push({ nome: `Ordine ${o.fornitore?.nome||""}`, tipo: "ordine", data: o.dataInvio, detail: `€${fmt(o.totaleIva||0)} · ${o.stato}` })); }
                  else if (step.id === "conferma") { ordiniCommessa.filter(o => o.conferma?.ricevuta).forEach(o => stepDocs.push({ nome: o.conferma?.nomeFile||`Conferma ${o.fornitore?.nome}`, tipo: "conferma", data: o.conferma?.dataRicezione, detail: `${o.consegna?.settimane||"?"} sett.` })); }
                  else if (step.id === "montaggio") { montaggiCommessa.forEach(m => stepDocs.push({ nome: `Montaggio ${m.data?new Date(m.data).toLocaleDateString("it-IT"):"—"}`, tipo: "montaggio", data: m.data, detail: `${squadreDB.find(s=>s.id===m.squadraId)?.nome||"—"} · ${m.stato}` })); }
                  else if (step.id === "saldo") { fattureCommessa.filter(f => f.tipo==="saldo"||f.tipo==="unica").forEach(f => stepDocs.push({ nome: `Fattura ${f.numero}/${f.anno}`, tipo: "fattura", data: f.data, detail: `€${fmt(f.importo)} · ${f.pagata?"✅ Pagata":"⏳"}` })); }
                  // Generic allegati
                  (c.allegati||[]).filter(a => a.tipo === step.id && !stepDocs.find(d => d.nome === a.nome)).forEach(a => stepDocs.push({ ...a, detail: a.data||"" }));
                  const isExpanded = ccExpandStep === step.id;

                  return (
                    <div key={step.id} style={{
                      padding: isCurrent ? "14px 14px 16px" : "10px 14px",
                      borderLeft: `4px solid ${borderColor}`,
                      borderBottom: idx < steps.length - 1 ? `1px solid ${T.bg}` : "none",
                      background: isExpanded ? "#34c75908" : isCurrent ? `${T.acc}06` : "transparent",
                      opacity: isFuture ? 0.4 : 1,
                      cursor: step.done ? "pointer" : "default",
                    }}
                    onClick={() => { if (step.done && stepDocs.length > 0) setCcExpandStep(isExpanded ? null : step.id); }}
                    >
                      {/* Step header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: isCurrent ? 18 : 14 }}>{step.icon}</span>
                        <span style={{ fontSize: isCurrent ? 14 : 12, fontWeight: 700, color: T.text, flex: 1 }}>{step.label}</span>
                        {step.done && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#34c759", background: "#34c75912", padding: "2px 8px", borderRadius: 6 }}>
                              ✅ Fatto {stepDocs.length > 0 && <span style={{ fontSize: 8 }}>📎{stepDocs.length}</span>}
                            </span>
                        )}
                        {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, color: T.acc, background: `${T.acc}15`, padding: "2px 8px", borderRadius: 6 }}>👉 DA FARE</span>}
                      </div>

                      {/* Done detail */}
                      {step.done && step.detail && (
                        <div style={{ fontSize: 10, color: T.sub, marginTop: 3, marginLeft: 26 }}>{step.detail}</div>
                      )}

                      {/* ═══ DOCUMENTI ESPANSI ═══ */}
                      {isExpanded && stepDocs.length > 0 && (
                        <div style={{ marginTop: 8, marginLeft: 26, background: T.card, borderRadius: 10, border: "1px solid #34c75930", overflow: "hidden" }}>
                          <div style={{ padding: "8px 12px", background: "#34c75910", borderBottom: "1px solid #34c75920" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "#34c759" }}>📎 DOCUMENTI — {step.label.toUpperCase()}</div>
                          </div>
                          {stepDocs.map((doc, di) => (
                            <div key={di} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: di < stepDocs.length-1 ? "1px solid " + T.bdr + "30" : "none" }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#34c75912", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                                {doc.tipo === "rilievo" ? "📐" : doc.tipo === "preventivo" ? "📝" : doc.tipo === "firma" ? "✍️" : doc.tipo === "fattura" ? "📄" : doc.tipo === "ordine" ? "📦" : doc.tipo === "conferma" ? "✅" : doc.tipo === "montaggio" ? "🔧" : "📎"}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{doc.nome}</div>
                                <div style={{ fontSize: 10, color: T.sub }}>{doc.detail}{doc.data ? " · " + doc.data : ""}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ========== CURRENT STEP ACTIONS ========== */}
                      {isCurrent && step.id === "rilievo" && (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>Crea il primo rilievo con i vani da misurare</div>
                          <button onClick={() => setShowNuovoRilievo(true)} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                            📐 CREA RILIEVO →
                          </button>
                        </div>
                      )}

                      {isCurrent && step.id === "misure" && (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          <div style={{ fontSize: 11, color: T.sub, marginBottom: 6 }}>
                            {!hasVani ? "Aggiungi i vani e inserisci le misure" :
                             vaniConMisure.length < vani.length ? `${vaniConMisure.length}/${vani.length} vani misurati — completa le misure` :
                             vaniConPrezzo.length === 0 ? "Misure OK — imposta il prezzo €/mq nelle impostazioni o nella griglia" :
                             `${vaniConPrezzo.length} vani prezzati · Totale: €${fmt(totPreventivo)}`}
                          </div>
                          {hasRilievi && (
                            <button onClick={() => {
                              const ril = rilievi[rilievi.length - 1];
                              setSelectedRilievo(ril);
                              if (ril.vani?.length > 0) { setSelectedVano(ril.vani[0]); }
                            }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                              📏 {!hasVani ? "AGGIUNGI VANI →" : vaniConMisure.length < vani.length ? "COMPLETA MISURE →" : "APRI RILIEVO →"}
                            </button>
                          )}
                        </div>
                      )}

                      {isCurrent && step.id === "firma" && (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.acc, marginBottom: 8 }}>
                            Preventivo: €{fmt(totPreventivo)} + IVA {ivaPerc}% = <b>€{fmt(totIva)}</b>
                          </div>
                          {/* Sub-step 1: Invia preventivo */}
                          {firmaStep === 0 && (
                            <div>
                              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                                <button onClick={() => generaPreventivoPDF(c)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${T.acc}`, background: `${T.acc}08`, color: T.acc, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                  📄 Scarica PDF
                                </button>
                                <button onClick={() => setShowPreventivoModal(true)} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.card, color: T.sub, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                  👁 Anteprima
                                </button>
                              </div>
                              <button onClick={() => {
                                const tel = (c.telefono || "").replace(/\D/g, "");
                                window.open(`https://wa.me/${tel.startsWith("39") ? tel : "39" + tel}?text=${encodeURIComponent(`Gentile ${c.cliente}, in allegato il preventivo per la commessa ${c.code}.\nTotale: €${fmt(totIva)} IVA inclusa.\nPrego firmare e rinviare. Grazie!`)}`, "_blank");
                                setFirmaStep(1);
                              }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#25d366", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                📤 INVIA PREVENTIVO AL CLIENTE →
                              </button>
                              <div style={{ textAlign: "center", marginTop: 6 }}>
                                <span onClick={() => setFirmaStep(1)} style={{ fontSize: 11, color: T.sub, cursor: "pointer", textDecoration: "underline" }}>Già inviato? Vai al caricamento firma</span>
                              </div>
                            </div>
                          )}
                          {/* Sub-step 2: Carica documento firmato */}
                          {firmaStep === 1 && (
                            <div>
                              <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>✅ Preventivo inviato. Ora carica il documento firmato dal cliente.</div>
                              {!firmaFileUrl ? (
                                <div>
                                  <button onClick={() => {
                                    const inp = document.createElement("input");
                                    inp.type = "file"; inp.accept = "application/pdf,image/*,.jpg,.jpeg,.png";
                                    inp.onchange = (ev: any) => {
                                      const file = ev.target.files?.[0];
                                      if (!file) return;
                                      setFirmaFileName(file.name);
                                      const reader = new FileReader();
                                      reader.onload = (e) => setFirmaFileUrl(e.target?.result as string);
                                      reader.readAsDataURL(file);
                                    };
                                    inp.click();
                                  }} style={{ width: "100%", padding: 14, borderRadius: 10, border: `2px dashed ${T.acc}`, background: `${T.acc}08`, color: T.acc, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                    📥 CARICA DOCUMENTO FIRMATO
                                  </button>
                                  <div style={{ fontSize: 10, color: T.sub, textAlign: "center", marginTop: 4 }}>PDF, foto o scansione del preventivo firmato</div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ padding: 10, borderRadius: 8, background: "#34c75912", border: "1px solid #34c75930", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 20 }}>📎</span>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: "#34c759" }}>✅ Documento caricato</div>
                                      <div style={{ fontSize: 11, color: T.sub }}>{firmaFileName}</div>
                                    </div>
                                    <span onClick={() => { setFirmaFileUrl(null); setFirmaFileName(""); }} style={{ fontSize: 18, cursor: "pointer", color: T.sub }}>✕</span>
                                  </div>
                                  <button onClick={() => {
                                    const allegato = { id: Date.now(), tipo: "firma", nome: firmaFileName, data: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), dataUrl: firmaFileUrl };
                                    setCantieri(cs => cs.map(cm => cm.id === c.id ? { ...cm, firmaCliente: true, dataFirma: new Date().toISOString().split("T")[0], firmaDocumento: allegato, allegati: [...(cm.allegati || []), allegato], log: [{ chi: "Fabio", cosa: "documento firmato caricato", quando: "Adesso", color: "#34c759" }, ...(cm.log || [])] } : cm));
                                    setSelectedCM(prev => ({ ...prev, firmaCliente: true, dataFirma: new Date().toISOString().split("T")[0] }));
                                    setFirmaStep(0); setFirmaFileUrl(null); setFirmaFileName("");
                                    setCcDone("✅ Firma registrata con documento!"); setTimeout(() => setCcDone(null), 3000);
                                  }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#34c759", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                    ✅ CONFERMA FIRMA →
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {isCurrent && step.id === "fattura" && (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>Totale commessa: <b style={{ color: T.acc }}>€{fmt(totIva)}</b></div>
                          <div style={{ fontSize: 11, color: T.sub, marginBottom: 10 }}>Scegli la modalità di fatturazione:</div>
                          {/* Percentage chips */}
                          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" as any }}>
                            {[30, 40, 50, 60, 100].map(p => (
                              <div key={p} onClick={() => setFattPerc(p)} style={{
                                padding: "10px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800,
                                background: fattPerc === p ? T.acc : T.card,
                                color: fattPerc === p ? "#fff" : T.text,
                                border: `2px solid ${fattPerc === p ? T.acc : T.bdr}`,
                                transition: "all 0.15s",
                              }}>
                                {p === 100 ? "Unica 100%" : `Acconto ${p}%`}
                              </div>
                            ))}
                          </div>
                          {/* Amount preview */}
                          <div style={{ background: T.bg, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 12, color: T.sub }}>{fattPerc === 100 ? "Fattura unica" : `Acconto ${fattPerc}%`}</span>
                              <span style={{ fontSize: 16, fontWeight: 900, color: T.acc }}>€{fmt(Math.round(totIva * fattPerc / 100))}</span>
                            </div>
                            {fattPerc < 100 && (
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 11, color: T.sub }}>Saldo restante ({100 - fattPerc}%)</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>€{fmt(totIva - Math.round(totIva * fattPerc / 100))}</span>
                              </div>
                            )}
                          </div>
                          <button onClick={() => {
                            creaFattura(c, fattPerc === 100 ? "unica" : "acconto");
                            setCcDone(`✅ Fattura ${fattPerc === 100 ? "unica" : "acconto " + fattPerc + "%"} creata! €${fmt(Math.round(totIva * fattPerc / 100))}`);
                            setTimeout(() => setCcDone(null), 3000);
                          }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                            💰 CREA FATTURA €{fmt(Math.round(totIva * fattPerc / 100))} →
                          </button>
                        </div>
                      )}

                      {isCurrent && step.id === "ordine" && (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                            Fornitore: <b style={{ color: T.acc }}>{c.sistema?.split(" ")[0] || "—"}</b> · Sistema: {c.sistema || "—"}
                          </div>
                          {/* Order lines preview */}
                          <div style={{ background: T.bg, borderRadius: 10, padding: 10, marginBottom: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6 }}>📋 RIGHE ORDINE ({vani.length} vani)</div>
                            {vani.map((v, vi) => {
                              const larg = v.larghezza || v.l || 0;
                              const alt = v.altezza || v.h || 0;
                              const mq = ((larg * alt) / 1000000).toFixed(2);
                              return (
                                <div key={vi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: vi < vani.length - 1 ? `1px solid ${T.bdr}` : "none" }}>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{v.nome || v.tipo || `Vano ${vi + 1}`}</div>
                                    <div style={{ fontSize: 10, color: T.sub }}>{larg}×{alt}mm · {mq}m² · {v.apertura || "—"}</div>
                                  </div>
                                  <div style={{ fontSize: 12, fontWeight: 800, color: T.acc }}>€{fmt(calcolaVanoPrezzo(v, c))}</div>
                                </div>
                              );
                            })}
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 6, borderTop: `2px solid ${T.bdr}` }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Totale ordine</span>
                              <span style={{ fontSize: 15, fontWeight: 900, color: T.acc }}>€{fmt(totPreventivo)}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: T.sub, marginBottom: 8, textAlign: "center" }}>Controlla le righe sopra. Se tutto OK, conferma l'ordine.</div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setCcConfirm(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.bdr}`, background: T.card, color: T.sub, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                              ✏️ Modifica vani
                            </button>
                            <button onClick={() => {
                              const ord = creaOrdineFornitore(c, c.sistema?.split(" ")[0] || "");
                              if (ord) setSelectedCM(prev => ({ ...prev }));
                              setCcDone("✅ Ordine fornitore creato!"); setTimeout(() => setCcDone(null), 3000);
                            }} style={{ flex: 2, padding: 14, borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                              📦 CONFERMA ORDINE →
                            </button>
                          </div>
                        </div>
                      )}

                      {isCurrent && step.id === "conferma" && (() => {
                        const ord = ordiniCommessa[0];
                        const hasSett = ord?.consegna?.settimane && ord.consegna.settimane > 0;
                        const hasData = ord?.consegna?.prevista;
                        const infoComplete = hasSett || hasData;
                        return (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>
                            Ordine: {ord?.fornitore?.nome || "—"} · €{fmt(ord?.totaleIva || 0)}
                          </div>
                          {!ordineConfermato ? (
                            <div>
                              <button onClick={() => apriInboxDocumento()} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#af52de", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                📥 CARICA CONFERMA (PDF/Foto) →
                              </button>
                              <div style={{ fontSize: 10, color: T.sub, marginTop: 4, textAlign: "center" }}>Da email, WhatsApp o portale fornitore</div>
                            </div>
                          ) : ccConfirm !== "conferma_ok" ? (
                            <div>
                              <div style={{ padding: 10, borderRadius: 8, background: infoComplete ? "#34c75912" : "#ff950012", marginBottom: 6, fontSize: 11, color: infoComplete ? "#34c759" : "#ff9500", fontWeight: 700 }}>
                                {infoComplete ? `✅ Conferma ricevuta — ${ord?.consegna?.settimane || "?"} settimane · consegna ${hasData ? new Date(ord.consegna.prevista).toLocaleDateString("it-IT") : "da calcolare"}` : "⚠️ Conferma ricevuta ma MANCA la data di consegna"}
                              </div>
                              <button onClick={() => { setCcConfirm("conferma_ok"); setConfSett(ord?.consegna?.settimane?.toString() || ""); }} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "#34c759", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                ✅ APPROVA E CONFERMA →
                              </button>
                            </div>
                          ) : (
                            <div style={{ background: "#34c75912", borderRadius: 10, padding: 12, border: "1px solid #34c75930" }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#34c759", marginBottom: 8 }}>✅ Conferma approvazione</div>
                              <div style={{ fontSize: 12, color: T.text, marginBottom: 3 }}>Fornitore: <b>{ord?.fornitore?.nome || "—"}</b></div>
                              <div style={{ fontSize: 12, color: T.text, marginBottom: 8 }}>Importo: <b>€{fmt(ord?.totaleIva || 0)}</b></div>
                              
                              {/* Settimane / data consegna — ALWAYS show, editable */}
                              <div style={{ background: !infoComplete ? "#ff950015" : T.bg, borderRadius: 10, padding: 10, marginBottom: 10, border: !infoComplete ? "2px solid #ff9500" : `1px solid ${T.bdr}` }}>
                                {!infoComplete && (
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "#ff9500", marginBottom: 6 }}>
                                    ⚠️ Devi inserire i tempi di consegna prima di approvare
                                  </div>
                                )}
                                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>📅 SETTIMANE</div>
                                    <input type="number" min="1" max="52" placeholder="es. 6" value={confSett} onChange={e => setConfSett(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${!confSett ? "#ff9500" : T.bdr}`, fontSize: 14, fontWeight: 800, fontFamily: "inherit", boxSizing: "border-box", textAlign: "center" }} />
                                  </div>
                                  <div style={{ flex: 2 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>📆 DATA PREVISTA</div>
                                    <div style={{ padding: 10, borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 13, fontWeight: 700, color: T.text, textAlign: "center" }}>
                                      {confSett ? (() => { const d = new Date(); d.setDate(d.getDate() + parseInt(confSett) * 7); return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long", year: "numeric" }); })() : "Inserisci settimane →"}
                                    </div>
                                  </div>
                                </div>
                                {confSett && (
                                  <div style={{ fontSize: 11, color: "#34c759", fontWeight: 700, textAlign: "center" }}>
                                    ✅ Materiale previsto per {(() => { const d = new Date(); d.setDate(d.getDate() + parseInt(confSett) * 7); return d.toLocaleDateString("it-IT"); })()}
                                  </div>
                                )}
                              </div>
                              
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => setCcConfirm(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.bdr}`, background: T.card, color: T.sub, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Annulla</button>
                                <button onClick={() => {
                                  if (!confSett || parseInt(confSett) < 1) { alert("Inserisci le settimane di consegna"); return; }
                                  const settNum = parseInt(confSett);
                                  const dataPrev = new Date(); dataPrev.setDate(dataPrev.getDate() + settNum * 7);
                                  setOrdiniFornDB(prev => prev.map(o => o.cmId === c.id ? { ...o, conferma: { ...o.conferma, firmata: true, dataFirma: new Date().toISOString().split("T")[0] }, consegna: { ...o.consegna, settimane: settNum, prevista: dataPrev.toISOString().split("T")[0] } } : o));
                                  setCcConfirm(null); setConfSett("");
                                  setCcDone(`✅ Conferma approvata! Consegna prevista: ${dataPrev.toLocaleDateString("it-IT")}`);
                                  setTimeout(() => setCcDone(null), 3000);
                                }} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: confSett ? "#34c759" : "#ccc", color: "#fff", fontSize: 14, fontWeight: 800, cursor: confSett ? "pointer" : "not-allowed", fontFamily: "inherit" }}>✅ APPROVO</button>
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })()}

                      {isCurrent && step.id === "montaggio" && (() => {
                        // Contesto: montaggi pianificati questa settimana e prossima
                        const oggi = new Date();
                        const giorniSettimana = Array.from({ length: 28 }, (_, i) => {
                          const d = new Date(oggi); d.setDate(d.getDate() + i);
                          return d.toISOString().split("T")[0];
                        });
                        const montaggiAll = montaggiDB;
                        const giorniOccupatiMap = new Map(); // date → [{ cliente, giorni }]
                        montaggiAll.forEach(m => {
                          const gg = m.giorni || 1;
                          for (let d = 0; d < Math.ceil(gg); d++) {
                            const dt = new Date(m.data); dt.setDate(dt.getDate() + d);
                            const ds = dt.toISOString().split("T")[0];
                            if (!giorniOccupatiMap.has(ds)) giorniOccupatiMap.set(ds, []);
                            giorniOccupatiMap.get(ds).push({ cliente: m.cliente, gg, squadra: m.squadraId });
                          }
                        });
                        // Selected block
                        const selBlock = new Set<string>();
                        if (montFormData.data && montGiorni > 0) {
                          for (let d = 0; d < Math.ceil(montGiorni); d++) {
                            const dt = new Date(montFormData.data); dt.setDate(dt.getDate() + d);
                            selBlock.add(dt.toISOString().split("T")[0]);
                          }
                        }
                        const nomiGiorni = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
                        
                        return (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          {/* Context: this job info */}
                          <div style={{ background: T.bg, borderRadius: 10, padding: 10, marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>🔧 {c.cliente} — {c.indirizzo || "—"}</div>
                            <div style={{ fontSize: 11, color: T.sub }}>{vani.length} vani · {c.sistema || "—"} · {ordiniCommessa[0]?.consegna?.prevista ? `Materiale previsto: ${new Date(ordiniCommessa[0].consegna.prevista).toLocaleDateString("it-IT")}` : "Consegna da confermare"}</div>
                          </div>

                          {!montFormOpen ? (
                            <button onClick={() => { setMontFormOpen(true); setMontGiorni(1); setMontFormData({ data: "", orario: "08:00", durata: "giornata", squadraId: squadreDB[0]?.id || "", note: "" }); }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                              🔧 PIANIFICA MONTAGGIO →
                            </button>
                          ) : (
                            <div style={{ background: T.bg, borderRadius: 10, padding: 12, border: `1px solid ${T.bdr}` }}>
                              {/* Mini calendar 2 weeks */}
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6 }}>📅 SCEGLI DATA (prossime 4 settimane)</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
                                  {giorniSettimana.map(g => {
                                    const dt = new Date(g);
                                    const isSel = selBlock.has(g);
                                    const isStart = montFormData.data === g;
                                    const isBusy = giorniOccupatiMap.has(g);
                                    const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
                                    const busyMont = giorniOccupatiMap.get(g) || [];
                                    return (
                                      <div key={g} onClick={() => !isWeekend && setMontFormData(p => ({ ...p, data: g }))} title={busyMont.map(m => m.cliente + " (" + m.gg + "g)").join(", ")} style={{
                                        padding: "6px 2px", borderRadius: 8, textAlign: "center", cursor: isWeekend ? "not-allowed" : "pointer",
                                        background: isStart ? T.acc : isSel ? `${T.acc}30` : isBusy ? "#ff950020" : T.card,
                                        color: isStart ? "#fff" : isSel ? T.acc : isWeekend ? T.bdr : isBusy ? "#ff9500" : T.text,
                                        border: `2px solid ${isStart ? T.acc : isSel ? `${T.acc}60` : "transparent"}`,
                                        opacity: isWeekend ? 0.4 : 1,
                                      }}>
                                        <div style={{ fontSize: 8, fontWeight: 700 }}>{nomiGiorni[dt.getDay()]}</div>
                                        <div style={{ fontSize: 14, fontWeight: 800 }}>{dt.getDate()}</div>
                                        {isBusy && !isSel && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff9500", margin: "2px auto 0" }} />}
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Legend */}
                                {montaggiAll.length > 0 && (
                                  <div style={{ marginTop: 6 }}>
                                    <div style={{ fontSize: 10, color: T.sub, marginBottom: 4 }}>🟠 Montaggi pianificati:</div>
                                    {montaggiAll.filter(m => m.data >= oggi.toISOString().split("T")[0]).slice(0, 6).map((m, mi) => {
                                      const d = new Date(m.data);
                                      const sq = squadreDB.find(s => s.id === m.squadraId);
                                      return (
                                        <div key={mi} style={{ fontSize: 10, color: m.stato === "completato" ? "#34c759" : "#ff9500", padding: "2px 0", display: "flex", gap: 4 }}>
                                          <span style={{ fontWeight: 800, minWidth: 44 }}>{d.getDate()}/{d.getMonth() + 1}</span>
                                          <span style={{ flex: 1 }}>{m.cliente} · {m.giorni || 1}g · {sq?.nome || "—"}</span>
                                          {m.stato === "completato" && <span>✅</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Ora + Durata */}
                              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>⏰ ORARIO</div>
                                  <select value={montFormData.orario} onChange={e => setMontFormData(p => ({ ...p, orario: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${T.bdr}`, fontSize: 13, fontFamily: "inherit" }}>
                                    {["06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","14:00","15:00"].map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>⏱ GIORNI</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                                    <button onClick={() => setMontGiorni(Math.max(0.5, montGiorni - 0.5))} style={{ width: 36, height: 40, borderRadius: "8px 0 0 8px", border: `1px solid ${T.bdr}`, background: T.card, fontSize: 18, cursor: "pointer", fontFamily: "inherit" }}>−</button>
                                    <div style={{ flex: 1, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderTop: `1px solid ${T.bdr}`, borderBottom: `1px solid ${T.bdr}`, fontSize: 15, fontWeight: 800, background: "#fff" }}>
                                      {montGiorni === 0.5 ? "½" : montGiorni}
                                    </div>
                                    <button onClick={() => setMontGiorni(montGiorni + 0.5)} style={{ width: 36, height: 40, borderRadius: "0 8px 8px 0", border: `1px solid ${T.bdr}`, background: T.card, fontSize: 18, cursor: "pointer", fontFamily: "inherit" }}>+</button>
                                  </div>
                                </div>
                              </div>

                              {/* Squadra */}
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>👷 SQUADRA</div>
                                {squadreDB.length > 0 ? (
                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as any }}>
                                    {squadreDB.map(sq => (
                                      <div key={sq.id} onClick={() => setMontFormData(p => ({ ...p, squadraId: sq.id }))} style={{
                                        padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                                        background: montFormData.squadraId === sq.id ? T.acc : T.card,
                                        color: montFormData.squadraId === sq.id ? "#fff" : T.text,
                                        border: `1px solid ${montFormData.squadraId === sq.id ? T.acc : T.bdr}`,
                                      }}>{sq.nome || sq.id}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <input placeholder="Nome squadra" value={montFormData.note} onChange={e => setMontFormData(p => ({ ...p, note: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${T.bdr}`, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
                                )}
                              </div>

                              {/* Note */}
                              <div style={{ marginBottom: 10 }}>
                                <input placeholder="Note (opzionale)" value={montFormData.note} onChange={e => setMontFormData(p => ({ ...p, note: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${T.bdr}`, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" }} />
                              </div>

                              {/* === CONTESTO SQUADRE — cosa fanno le squadre === */}
                              <div style={{ marginBottom: 10, background: T.card, borderRadius: 10, padding: 10, border: `1px solid ${T.bdr}` }}>
                                <div style={{ fontSize: 9, fontWeight: 800, color: T.sub, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px" }}>📋 Impegni squadre — prossime 4 settimane</div>
                                {squadreDB.map(sq => {
                                  const sqMont = montaggiAll.filter(m => m.squadraId === sq.id && m.data >= oggi.toISOString().split("T")[0] && m.stato !== "completato").sort((a,b) => a.data.localeCompare(b.data));
                                  const isSel = montFormData.squadraId === sq.id;
                                  return (
                                    <div key={sq.id} style={{ marginBottom: 6, padding: "6px 8px", borderRadius: 8, background: isSel ? T.acc + "08" : "transparent", border: isSel ? `1px solid ${T.acc}30` : `1px solid transparent` }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: sqMont.length > 0 ? 4 : 0 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: sq.colore || T.acc, flexShrink: 0 }} />
                                        <div style={{ fontSize: 11, fontWeight: 700, color: isSel ? T.acc : T.text, flex: 1 }}>{sq.nome}</div>
                                        <div style={{ fontSize: 9, color: T.sub, fontWeight: 600 }}>{sqMont.length === 0 ? "✅ Libera" : `${sqMont.length} lavori`}</div>
                                      </div>
                                      {sqMont.map((m, mi) => {
                                        const d = new Date(m.data);
                                        const conflitto = montFormData.data && (() => {
                                          for (let i = 0; i < Math.ceil(montGiorni); i++) {
                                            const selD = new Date(montFormData.data); selD.setDate(selD.getDate() + i);
                                            for (let j = 0; j < Math.ceil(m.giorni || 1); j++) {
                                              const mD = new Date(m.data); mD.setDate(mD.getDate() + j);
                                              if (selD.toISOString().split("T")[0] === mD.toISOString().split("T")[0]) return true;
                                            }
                                          }
                                          return false;
                                        })();
                                        return (
                                          <div key={mi} style={{ display: "flex", gap: 6, alignItems: "center", padding: "2px 0 2px 14px", fontSize: 10 }}>
                                            <span style={{ fontWeight: 700, color: conflitto && isSel ? "#ff3b30" : T.sub, minWidth: 38 }}>
                                              {d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                                            </span>
                                            <span style={{ color: conflitto && isSel ? "#ff3b30" : T.text, flex: 1 }}>
                                              {m.cliente} · {m.giorni||1}g · {m.vani||"?"}v
                                            </span>
                                            {conflitto && isSel && <span style={{ fontSize: 8, fontWeight: 800, color: "#ff3b30", background: "#ff3b3015", padding: "1px 5px", borderRadius: 4 }}>⚠️ CONFLITTO</span>}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Summary */}
                              {montFormData.data && (
                                <div style={{ background: T.card, borderRadius: 8, padding: 8, marginBottom: 8, fontSize: 12, color: T.text }}>
                                  📅 <b>{new Date(montFormData.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</b> ore {montFormData.orario} · {montGiorni === 0.5 ? "mezza giornata" : montGiorni + (montGiorni === 1 ? " giorno" : " giorni")} · {squadreDB.find(s => s.id === montFormData.squadraId)?.nome || "—"}
                                </div>
                              )}

                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => setMontFormOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.bdr}`, background: T.card, color: T.sub, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Annulla</button>
                                <button onClick={() => {
                                  if (!montFormData.data) { alert("Scegli una data dal calendario"); return; }
                                  const durataStr = montGiorni === 0.5 ? "mezza" : montGiorni === 1 ? "giornata" : montGiorni + "giorni";
                                  const nuovoM = {
                                    id: "m_" + Date.now(), cmId: c.id, cmCode: c.code, cliente: c.cliente,
                                    indirizzo: c.indirizzo || "", vani: vani.length,
                                    data: montFormData.data, orario: montFormData.orario, durata: durataStr, giorni: montGiorni,
                                    squadraId: montFormData.squadraId, stato: "programmato", note: montFormData.note,
                                  };
                                  setMontaggiDB(prev => [...prev, nuovoM]);
                                  setMontFormOpen(false);
                                  const evMont = {
                                    id: "ev_mont_" + Date.now(), date: montFormData.data, time: montFormData.orario,
                                    text: `🔧 Montaggio ${c.cliente} (${montGiorni === 0.5 ? "½g" : montGiorni + "g"})`, tipo: "montaggio", persona: c.cliente,
                                    cm: c.code, addr: c.indirizzo || "", done: false,
                                  };
                                  setEvents(prev => [...prev, evMont]);
                                  setCcDone(`✅ Montaggio pianificato per il ${new Date(montFormData.data).toLocaleDateString("it-IT")}`);
                                  setTimeout(() => setCcDone(null), 3000);
                                }} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: "#34c759", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                  ✅ CONFERMA MONTAGGIO
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })()}

                      {isCurrent && step.id === "saldo" && (() => {
                        const saldoFat = fattureCommessa.find(f => f.tipo === "saldo");
                        const unicaFat = fattureCommessa.find(f => f.tipo === "unica");
                        const fatNonPagata = fattureCommessa.find(f => !f.pagata);
                        const restoSaldo = totIva - incassato;
                        const hasFatSaldo = !!saldoFat || !!unicaFat;
                        const isPagata = saldoFat?.pagata || unicaFat?.pagata;
                        
                        return (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          {/* Context box */}
                          <div style={{ background: T.bg, borderRadius: 10, padding: 10, marginBottom: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>💶 Riepilogo pagamenti</div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                              <span style={{ color: T.sub }}>Totale commessa</span>
                              <b>€{fmt(totIva)}</b>
                            </div>
                            {incassato > 0 && (
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                                <span style={{ color: "#34c759" }}>✅ Già incassato</span>
                                <b style={{ color: "#34c759" }}>€{fmt(incassato)}</b>
                              </div>
                            )}
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 900, padding: "4px 0", borderTop: `1px solid ${T.bdr}`, marginTop: 4 }}>
                              <span style={{ color: restoSaldo > 0 ? "#ff9500" : "#34c759" }}>{restoSaldo > 0 ? "⏳ Resta da incassare" : "✅ Tutto incassato"}</span>
                              <b style={{ color: restoSaldo > 0 ? "#ff9500" : "#34c759" }}>€{fmt(restoSaldo)}</b>
                            </div>
                            {fattureCommessa.length > 0 && (
                              <div style={{ marginTop: 6, fontSize: 10, color: T.sub }}>
                                {fattureCommessa.map(f => `Fat.${f.numero} ${f.tipo} €${fmt(f.importo)} ${f.pagata ? "✅" : "⏳"}`).join(" · ")}
                              </div>
                            )}
                          </div>

                          {/* PHASE 1: No saldo fattura yet → Create it */}
                          {!hasFatSaldo && restoSaldo > 0 && (
                            ccConfirm !== "saldo" ? (
                              <button onClick={() => setCcConfirm("saldo")} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                💶 CREA FATTURA SALDO €{fmt(restoSaldo)} →
                              </button>
                            ) : (
                              <div style={{ background: T.acc + "10", borderRadius: 10, padding: 12, border: `1px solid ${T.acc}30` }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: T.acc, marginBottom: 6 }}>💶 Conferma fattura saldo</div>
                                <div style={{ fontSize: 20, fontWeight: 900, color: T.acc, marginBottom: 3, textAlign: "center" }}>€{fmt(restoSaldo)}</div>
                                <div style={{ fontSize: 11, color: T.sub, marginBottom: 10, textAlign: "center" }}>{c.cliente} {c.cognome || ""} · {c.code}</div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button onClick={() => setCcConfirm(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.bdr}`, background: T.card, color: T.sub, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Annulla</button>
                                  <button onClick={() => {
                                    creaFattura(c, restoSaldo === totIva ? "unica" : "saldo");
                                    setCcConfirm(null); setCcDone("✅ Fattura saldo creata! €" + fmt(restoSaldo));
                                    setTimeout(() => setCcDone(null), 3000);
                                  }} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>✅ CREA FATTURA SALDO</button>
                                </div>
                              </div>
                            )
                          )}

                          {/* PHASE 2: Saldo created but not paid → Mark as paid */}
                          {hasFatSaldo && !isPagata && (
                            ccConfirm !== "pagata" ? (
                              <div>
                                <div style={{ padding: 10, borderRadius: 8, background: "#ff950012", marginBottom: 8, fontSize: 12, color: "#ff9500", fontWeight: 700 }}>
                                  ⏳ Fattura saldo emessa — in attesa di pagamento
                                </div>
                                <button onClick={() => setCcConfirm("pagata")} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#34c759", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                  ✅ IL CLIENTE HA PAGATO — SEGNA COME INCASSATA →
                                </button>
                                <div style={{ fontSize: 10, color: T.sub, marginTop: 4, textAlign: "center" }}>Oppure carica la ricevuta dal 📥 inbox</div>
                              </div>
                            ) : (
                              <div style={{ background: "#34c75912", borderRadius: 10, padding: 12, border: "1px solid #34c75930" }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#34c759", marginBottom: 6 }}>✅ Conferma pagamento ricevuto</div>
                                <div style={{ fontSize: 20, fontWeight: 900, color: "#34c759", marginBottom: 3, textAlign: "center" }}>€{fmt(restoSaldo)}</div>
                                <div style={{ fontSize: 11, color: T.sub, marginBottom: 6, textAlign: "center" }}>Metodo di pagamento:</div>
                                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10, flexWrap: "wrap" as any }}>
                                  {["Bonifico", "Assegno", "Contanti", "Carta"].map(m => (
                                    <span key={m} onClick={() => setCcConfirm("pagata_" + m)} style={{
                                      padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                      background: ccConfirm === "pagata_" + m ? "#34c759" : T.card,
                                      color: ccConfirm === "pagata_" + m ? "#fff" : T.text,
                                      border: `1px solid ${ccConfirm === "pagata_" + m ? "#34c759" : T.bdr}`,
                                    }}>{m}</span>
                                  ))}
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button onClick={() => setCcConfirm(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.bdr}`, background: T.card, color: T.sub, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Annulla</button>
                                  <button onClick={() => {
                                    const metodo = (ccConfirm || "").replace("pagata_", "") || "Bonifico";
                                    const fat = fattureCommessa.find(f => (f.tipo === "saldo" || f.tipo === "unica") && !f.pagata);
                                    if (fat) {
                                      setFattureDB(prev => prev.map(f => f.id === fat.id ? { ...f, pagata: true, dataPagamento: new Date().toISOString().split("T")[0], metodoPagamento: metodo } : f));
                                    }
                                    // Also mark any other unpaid fatture
                                    setFattureDB(prev => prev.map(f => f.cmId === c.id && !f.pagata ? { ...f, pagata: true, dataPagamento: new Date().toISOString().split("T")[0], metodoPagamento: metodo } : f));
                                    setFaseTo(c.id, "chiusura");
                                    setCcConfirm(null); setCcDone("🎉 Pagamento registrato! Commessa completata.");
                                    setTimeout(() => setCcDone(null), 3000);
                                  }} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: "#34c759", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>✅ CONFERMO INCASSO</button>
                                </div>
                              </div>
                            )
                          )}

                          {/* PHASE 3: Everything paid but fatture missing → allow closing directly */}
                          {!hasFatSaldo && restoSaldo <= 0 && (
                            <div>
                              <div style={{ padding: 10, borderRadius: 8, background: "#34c75912", marginBottom: 8, fontSize: 12, color: "#34c759", fontWeight: 700 }}>
                                ✅ Tutto incassato — €{fmt(incassato)}
                              </div>
                              <button onClick={() => {
                                setFaseTo(c.id, "chiusura");
                                setCcDone("🎉 Commessa chiusa!");
                                setTimeout(() => setCcDone(null), 3000);
                              }} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#34c759", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                                🎉 CHIUDI COMMESSA →
                              </button>
                            </div>
                          )}
                        </div>
                        );
                      })()}

                      {/* Completed: all done — DOSSIER COMMESSA */}
                      {!current && idx === steps.length - 1 && tuttoChiuso && (
                        <div style={{ marginTop: 10, marginLeft: 26 }}>
                          <div style={{ textAlign: "center", marginBottom: 12 }}>
                            <div style={{ fontSize: 20, fontWeight: 900, color: "#34c759" }}>🎉 Commessa Completata!</div>
                            <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>Incassato €{fmt(incassato)} · Margine €{fmt(incassato - ordiniCommessa.reduce((s, o) => s + (o.totaleIva || 0), 0))}</div>
                          </div>
                          {/* DOSSIER */}
                          <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 10 }}>📁 Dossier Commessa</div>
                            {[
                              { ico: "📐", l: "Rilievo", v: `${rilievi.length} rilievo · ${vani.length} vani`, d: rilievi[0]?.data || "" },
                              { ico: "📏", l: "Misure", v: `${vaniConMisure.length}/${vani.length} vani completi`, d: "" },
                              { ico: "📋", l: "Preventivo", v: `€${fmt(totPreventivo)} + IVA = €${fmt(totIva)}`, d: "" },
                              { ico: "✍️", l: "Firma cliente", v: c.dataFirma || "—", d: "" },
                              ...fattureCommessa.map(f => ({ ico: f.pagata ? "✅" : "⏳", l: `Fattura ${f.tipo} #${f.numero}`, v: `€${fmt(f.importo)} ${f.pagata ? "pagata" : "in attesa"}`, d: f.data || "" })),
                              ...ordiniCommessa.map(o => ({ ico: "📦", l: `Ordine ${o.fornitore?.nome || ""}`, v: `€${fmt(o.totaleIva || 0)} · ${o.stato || ""}`, d: "" })),
                              ...(ordiniCommessa[0]?.conferma?.ricevuta ? [{ ico: "📄", l: "Conferma fornitore", v: `Ricevuta · ${ordiniCommessa[0]?.consegna?.settimane || "?"} sett.`, d: "" }] : []),
                              ...montaggiCommessa.map(m => ({ ico: "🔧", l: "Montaggio", v: `${m.data ? new Date(m.data).toLocaleDateString("it-IT") : "—"} · ${squadreDB.find(s => s.id === m.squadraId)?.nome || ""}`, d: "" })),
                              ...(c.praticaFiscale ? [{ ico: "🏛️", l: "Pratica fiscale", v: c.praticaFiscale === "iva10" ? "IVA agevolata 10%" : c.praticaFiscale === "detrazione50" ? "Detrazione 50%" : c.praticaFiscale === "ecobonus65" ? "Ecobonus 65%" : c.praticaFiscale, d: "" }] : []),
                            ].map((row, ri) => (
                              <div key={ri} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.bdr}20` }}>
                                <span style={{ fontSize: 14, width: 22, textAlign: "center" }}>{row.ico}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.text, flex: 1 }}>{row.l}</span>
                                <span style={{ fontSize: 11, color: T.sub, textAlign: "right" }}>{row.v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 💰 RIEPILOGO ECONOMICO — sempre visibile */}
              {totPreventivo > 0 && (
                <div style={{ marginTop: 8, background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.sub, textTransform: "uppercase", marginBottom: 8 }}>💰 Riepilogo Economico</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                    <div style={{ fontSize: 11, color: T.sub }}>Preventivo</div>
                    <div style={{ fontSize: 12, fontWeight: 700, textAlign: "right" }}>€{fmt(totPreventivo)}</div>
                    <div style={{ fontSize: 11, color: T.sub }}>IVA {ivaPerc}%</div>
                    <div style={{ fontSize: 12, fontWeight: 700, textAlign: "right" }}>€{fmt(totPreventivo * ivaPerc / 100)}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: T.text, borderTop: `1px solid ${T.bdr}`, paddingTop: 4 }}>TOTALE</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: T.acc, textAlign: "right", borderTop: `1px solid ${T.bdr}`, paddingTop: 4 }}>€{fmt(totIva)}</div>
                    {incassato > 0 && <>
                      <div style={{ fontSize: 11, color: "#34c759" }}>✅ Incassato</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#34c759", textAlign: "right" }}>€{fmt(incassato)}</div>
                    </>}
                    {incassato > 0 && incassato < totIva && <>
                      <div style={{ fontSize: 11, color: T.orange }}>⏳ Resta</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.orange, textAlign: "right" }}>€{fmt(totIva - incassato)}</div>
                    </>}
                    {hasOrdine && <>
                      <div style={{ fontSize: 11, color: T.sub, borderTop: `1px solid ${T.bdr}`, paddingTop: 4 }}>📦 Costo fornitore</div>
                      <div style={{ fontSize: 12, fontWeight: 700, textAlign: "right", borderTop: `1px solid ${T.bdr}`, paddingTop: 4 }}>€{fmt(ordiniCommessa.reduce((s, o) => s + (o.totaleIva || 0), 0))}</div>
                      <div style={{ fontSize: 11, color: "#34c759" }}>📊 Margine</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#34c759", textAlign: "right" }}>€{fmt(totIva - ordiniCommessa.reduce((s, o) => s + (o.totaleIva || 0), 0))} ({Math.round((1 - ordiniCommessa.reduce((s, o) => s + (o.totaleIva || 0), 0) / (totIva || 1)) * 100)}%)</div>
                    </>}
                  </div>
                </div>
              )}
            </div>
          );
        })()}


        {/* 🏛️ PRATICA FISCALE */}
        {(() => {
          const c = selectedCM;
          if (!c) return null;
          const vaniPF = getVaniAttivi(c);
          const totPF = vaniPF.reduce((s, v) => s + calcolaVanoPrezzo(v, c), 0) + (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo || 0) * (vl.qta || 1)), 0);
          const ivaPF = c.ivaPerc || 10;
          const totIvaPF = totPF * (1 + ivaPF / 100);
          const fmtPF = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";
          return (
            <div style={{ margin: "8px 16px 0", background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.sub, textTransform: "uppercase" }}>🏛️ Pratica Fiscale</div>
                {c.praticaFiscale && <span style={{ fontSize: 10, fontWeight: 700, color: "#34c759", background: "#34c75912", padding: "2px 8px", borderRadius: 6 }}>✅ Attiva</span>}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as any, marginBottom: c.praticaFiscale ? 8 : 0 }}>
                {[
                  { id: "", l: "Nessuna", color: T.sub },
                  { id: "iva10", l: "IVA 10%", color: "#ff9500" },
                  { id: "detrazione50", l: "Detraz. 50%", color: "#007aff" },
                  { id: "ecobonus65", l: "Ecobonus 65%", color: "#34c759" },
                  { id: "superbonus", l: "Superbonus", color: "#af52de" },
                ].map(opt => (
                  <div key={opt.id} onClick={() => {
                    const newIva = opt.id ? 10 : 22;
                    setCantieri(cs => cs.map(cm => cm.id === c.id ? { ...cm, praticaFiscale: opt.id || undefined, ivaPerc: newIva } : cm));
                    setSelectedCM(prev => ({ ...prev, praticaFiscale: opt.id || undefined, ivaPerc: newIva }));
                  }} style={{
                    padding: "6px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: "pointer",
                    background: (c.praticaFiscale || "") === opt.id ? opt.color + "18" : T.bg,
                    color: (c.praticaFiscale || "") === opt.id ? opt.color : T.sub,
                    border: `1.5px solid ${(c.praticaFiscale || "") === opt.id ? opt.color : T.bdr}`,
                  }}>{opt.l}</div>
                ))}
              </div>
              {c.praticaFiscale && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6 }}>Documenti necessari:</div>
                  {[
                    ...(c.praticaFiscale === "iva10" ? [
                      { l: "Dichiarazione IVA agevolata 10%", desc: "Autocertificazione cliente per ristrutturazione", key: "dich_iva10" },
                      { l: "Titolo abilitativo (CILA/SCIA)", desc: "Numero protocollo e data", key: "titolo_abit" },
                    ] : []),
                    ...(c.praticaFiscale === "detrazione50" ? [
                      { l: "Dichiarazione IVA agevolata 10%", desc: "Autocertificazione", key: "dich_iva10" },
                      { l: "Titolo abilitativo (CILA/SCIA)", desc: "Protocollo e data", key: "titolo_abit" },
                      { l: "Dati Bonifico Parlante", desc: "CF beneficiario, P.IVA ditta, causale", key: "bonifico" },
                      { l: "Comunicazione ENEA", desc: "Entro 90gg da fine lavori", key: "enea" },
                    ] : []),
                    ...(c.praticaFiscale === "ecobonus65" ? [
                      { l: "Dichiarazione IVA agevolata 10%", desc: "Autocertificazione", key: "dich_iva10" },
                      { l: "Titolo abilitativo (CILA/SCIA)", desc: "Protocollo e data", key: "titolo_abit" },
                      { l: "Dati Bonifico Parlante", desc: "CF, P.IVA, causale", key: "bonifico" },
                      { l: "Comunicazione ENEA (obbligatoria)", desc: "Entro 90gg", key: "enea" },
                      { l: "Asseverazione tecnico", desc: "Prestazione energetica", key: "asseverazione" },
                      { l: "APE ante e post intervento", desc: "Attestato energetico", key: "ape" },
                    ] : []),
                    ...(c.praticaFiscale === "superbonus" ? [
                      { l: "Dichiarazione IVA agevolata", key: "dich_iva10", desc: "Autocertificazione" },
                      { l: "CILAS (Superbonus)", key: "titolo_abit", desc: "Titolo specifico" },
                      { l: "Bonifico Parlante", key: "bonifico", desc: "CF, P.IVA, causale" },
                      { l: "ENEA", key: "enea", desc: "Obbligatoria" },
                      { l: "Asseverazione tecnico", key: "asseverazione", desc: "Congruità spese" },
                      { l: "Visto di conformità", key: "visto", desc: "Commercialista/CAF" },
                      { l: "APE ante e post", key: "ape", desc: "Salto 2 classi" },
                    ] : []),
                  ].map((doc, di) => {
                    const done = (c.docFiscali || []).includes(doc.key);
                    return (
                      <div key={di} onClick={() => {
                        const docs = c.docFiscali || [];
                        const newDocs = done ? docs.filter(d => d !== doc.key) : [...docs, doc.key];
                        setCantieri(cs => cs.map(cm => cm.id === c.id ? { ...cm, docFiscali: newDocs } : cm));
                        setSelectedCM(prev => ({ ...prev, docFiscali: newDocs }));
                      }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.bdr}15`, cursor: "pointer" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${done ? "#34c759" : T.bdr}`, background: done ? "#34c75918" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#34c759", fontWeight: 800, flexShrink: 0 }}>
                          {done && "✓"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: done ? "#34c759" : T.text }}>{doc.l}</div>
                          <div style={{ fontSize: 9, color: T.sub }}>{doc.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                  {/* ═══ DOCUMENTI IDENTITÀ ═══ */}
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid " + T.bdr }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6 }}>🪪 Documenti di riconoscimento:</div>
                    {(c.docIdentita || []).map((doc, i) => (
                      <div key={doc.id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid " + T.bdr + "15" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#5856d618", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                          {doc.tipo === "CI" ? "🪪" : "💳"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{doc.tipo === "CI" ? "Carta d'Identità" : "Codice Fiscale"}</div>
                          <div style={{ fontSize: 9, color: T.sub }}>{doc.nome} · {doc.data || ""}</div>
                        </div>
                        <div onClick={() => {
                          const newDI = (c.docIdentita || []).filter((_, idx) => idx !== i);
                          setCantieri(cs => cs.map(cm => cm.id === c.id ? { ...cm, docIdentita: newDI } : cm));
                          setSelectedCM(prev => ({ ...prev, docIdentita: newDI }));
                        }} style={{ cursor: "pointer", fontSize: 10, color: "#ff3b30" }}>✕</div>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      {[
                        { tipo: "CI", l: "📷 Scansiona CI", col: "#5856d6" },
                        { tipo: "CF", l: "📷 Scansiona CF", col: "#007aff" },
                      ].map(btn => (
                        <label key={btn.tipo} style={{ flex: 1, padding: "8px 6px", borderRadius: 8, border: "1.5px dashed " + btn.col + "60", background: btn.col + "08", textAlign: "center", fontSize: 10, fontWeight: 700, color: btn.col, cursor: "pointer" }}>
                          {btn.l}
                          <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => {
                            const file = e.target.files?.[0]; if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const newDoc = { id: "di_" + Date.now(), tipo: btn.tipo, nome: file.name, data: new Date().toLocaleDateString("it-IT"), dataUrl: reader.result };
                              const newDI = [...(c.docIdentita || []), newDoc];
                              setCantieri(cs => cs.map(cm => cm.id === c.id ? { ...cm, docIdentita: newDI } : cm));
                              setSelectedCM(prev => ({ ...prev, docIdentita: newDI }));
                            };
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }} />
                        </label>
                      ))}
                    </div>
                    <div style={{ fontSize: 8, color: T.sub, marginTop: 3, textAlign: "center" }}>Obbligatori per pratiche fiscali con detrazione/bonus</div>
                  </div>
                  <button onClick={() => {
                    const tipoL = c.praticaFiscale === "iva10" ? "IVA Agevolata 10%" : c.praticaFiscale === "detrazione50" ? "Detrazione 50%" : c.praticaFiscale === "ecobonus65" ? "Ecobonus 65%" : "Superbonus";
                    const txt = [
                      `DICHIARAZIONE PER ${tipoL.toUpperCase()}`, `(ai sensi del DPR 445/2000)`, ``,
                      `Il/La sottoscritto/a: ${c.cliente} ${c.cognome || ""}`,
                      `C.F.: ${c.cf || "________________"}`,
                      `Residente in: ${c.indirizzo || "________________"}`, ``,
                      `DICHIARA`, ``,
                      `che i lavori di sostituzione infissi presso:`,
                      `${c.indirizzo || "________________"}`, ``,
                      `rientrano in intervento di manutenzione straordinaria/ristrutturazione`,
                      `ai sensi dell'art. 3 c.1 lett. b) DPR 380/2001`, ``,
                      `Titolo abilitativo: CILA/SCIA n. ________ del ________`,
                      `Comune di: ________`, ``,
                      ...(c.praticaFiscale === "iva10" ? [`CHIEDE l'applicazione dell'IVA agevolata al 10%`, `(art. 7 c.1 lett. b L. 488/99)`, ``] : []),
                      ...(c.praticaFiscale !== "iva10" ? [
                        `DATI PER BONIFICO PARLANTE:`,
                        `Beneficiario: ${c.cliente} ${c.cognome || ""} - CF: ${c.cf || "________"}`,
                        `Ditta: Walter Cozza Serramenti SRL - P.IVA: ________`,
                        `Causale: ${c.praticaFiscale === "detrazione50" ? "Art.16-bis TUIR - Detrazione 50%" : c.praticaFiscale === "ecobonus65" ? "L.296/2006 - Ecobonus 65%" : "DL 34/2020 - Superbonus"} - Fat. n. ___`, ``,
                        `NOTA: Comunicazione ENEA entro 90gg da fine lavori`, ``,
                      ] : []),
                      `Data: ________     Firma: ________________________`, ``,
                      `--- Commessa ${c.code} ---`,
                      `Importo: €${fmtPF(totPF)} · IVA ${ivaPF}% · Totale: €${fmtPF(totIvaPF)}`,
                    ].join("\n");
                    const blob = new Blob([txt], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url;
                    a.download = `Pratica_${c.code}_${c.cliente}.txt`;
                    a.click(); URL.revokeObjectURL(url);
                  }} style={{ width: "100%", marginTop: 8, padding: 11, borderRadius: 10, border: "none", background: "#007aff", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                    📄 SCARICA MODULI PRESTAMPATI
                  </button>
                  <div style={{ fontSize: 9, color: T.sub, marginTop: 3, textAlign: "center" }}>Genera dichiarazione da far compilare e firmare al cliente</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab: Rilievi | Report */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.bdr}`, margin: "0 0 4px 0" }}>
          {["rilievi", "report"].map(t => (
            <div key={t} onClick={() => setCmSubTab(t)}
              style={{ flex: 1, padding: "9px 4px", textAlign: "center", fontSize: 12, fontWeight: 600, cursor: "pointer",
                borderBottom: `2px solid ${cmSubTab === t ? T.acc : "transparent"}`,
                color: cmSubTab === t ? T.acc : T.sub, textTransform: "capitalize" }}>
              {t === "rilievi" ? `📁 Rilievi (${rilievi.length})` : "📊 Report Differenze"}
            </div>
          ))}
        </div>

        {/* TAB REPORT */}
        {cmSubTab === "report" && renderReportDiff()}

        {/* TAB RILIEVI */}
        {cmSubTab !== "report" && (
          <div style={{ padding: "8px 16px" }}>
            {rilievi.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>Nessun rilievo ancora</div>
                <div style={{ fontSize: 12, color: T.sub, marginBottom: 20 }}>Crea il primo rilievo per iniziare a misurare i vani</div>
                <button onClick={() => setShowNuovoRilievo(true)} style={{ ...S.btn, margin: "0 auto" }}>+ Crea primo rilievo</button>
              </div>
            )}
            {[...rilievi].reverse().map((r, idx) => {
              const vaniCount = (r.vani || []).length;
              const vaniMisurati = (r.vani || []).filter(v => Object.values(v.misure || {}).filter(x => (x as number) > 0).length >= 6).length;
              const colore = tipoColor[r.tipo] || T.blue;
              const ico = tipoIco[r.tipo] || "📐";
              const isUltimo = idx === 0;
              return (
                <div key={r.id} onClick={() => { setSelectedRilievo(r); setCmSubTab("sopralluoghi"); }}
                  style={{ ...S.card, marginBottom: 10, cursor: "pointer", overflow: "hidden",
                    border: `1.5px solid ${isUltimo ? colore + "50" : T.bdr}`,
                    background: isUltimo ? colore + "06" : T.card }}>
                  {/* Header rilievo */}
                  <div style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: colore + "15", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${colore}30` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: colore, fontFamily: FM }}>R{r.n}</div>
                      <div style={{ fontSize: 14 }}>{ico}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          {new Date(r.data + "T12:00:00").toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        {isUltimo && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: colore, color: "#fff" }}>ULTIMO</span>}
                      </div>
                      <div style={{ fontSize: 11, color: T.sub }}>
                        {r.ora && `🕐 ${r.ora} · `}👤 {r.rilevatore || "—"}
                      </div>
                      {r.motivoModifica && <div style={{ fontSize: 11, color: T.orange, marginTop: 2 }}>🔧 {r.motivoModifica}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: colore }}>{vaniCount}</div>
                      <div style={{ fontSize: 10, color: T.sub }}>vani</div>
                    </div>
                    <span style={{ transform: "rotate(180deg)", display:"inline-flex", marginLeft: 4 }}><Ico d={ICO.back} s={14} c={T.sub} /></span>
                  </div>
                  {/* Barra progresso vani */}
                  {vaniCount > 0 && (
                    <div style={{ padding: "0 14px 12px" }}>
                      <div style={{ height: 4, background: T.bdr, borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
                        <div style={{ height: "100%", width: `${Math.round(vaniMisurati / vaniCount * 100)}%`, background: vaniMisurati === vaniCount ? T.grn : colore, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 10, color: T.sub }}>{vaniMisurati}/{vaniCount} vani con misure</div>
                    </div>
                  )}
                  {/* Note */}
                  {r.note && <div style={{ padding: "0 14px 10px", fontSize: 11, color: T.sub, fontStyle: "italic" }}>"{r.note}"</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );

}
