"use client";
// @ts-nocheck
import React from "react";
import { useMastro } from "./MastroContext";
import { AFASE, FM, ICO, Ico } from "./mastro-constants";
import RilieviListPanel from "./RilieviListPanel";
import CMDetailPanel from "./CMDetailPanel";
import VanoDetailPanel from "./VanoDetailPanel";
import RiepilogoPanel from "./RiepilogoPanel";

export default function CommessePanel() {
  const {
    T, S, isDesktop, isTablet, fs, PIPELINE,
    cantieri, filtered, selectedCM, setSelectedCM, selectedRilievo, selectedVano,
    showRiepilogo, cmView, setCmView, filterFase, setFilterFase,
    searchQ, setSearchQ, setShowModal, setTab,
    faseIndex, getVaniAttivi, giorniFermaCM, sogliaDays,
    apriInboxDocumento,
  } = useMastro();

  const renderCMCard = (c, inGrid) => {
    const fase = PIPELINE.find(p => p.id === c.fase);
    const progress = ((faseIndex(c.fase) + 1) / PIPELINE.length) * 100;
    const az = AFASE[c.fase] || AFASE["sopralluogo"];
    const TODAY_ISO = new Date().toISOString().split("T")[0];
    const isScad = c.scadenza && c.scadenza < TODAY_ISO;
    const isUrgente = (giorniFermaCM(c) >= sogliaDays && c.fase !== "chiusura") || isScad;
    // Conta vani misurati da visite
    const vaniMisurati = c.vaniList?.length > 0
      ? [...new Set((c.visite || []).flatMap(v => v.vaniMisurati))].length
      : null;
    return (
      <div key={c.id} style={{
        ...S.card,
        margin: inGrid ? "0" : "0 16px 8px",
        borderLeft: `3px solid ${isUrgente ? T.red : progress > 50 ? T.grn : T.blue}`
      }} onClick={() => { setSelectedCM(c); setTab("commesse"); }}>
        <div style={S.cardInner}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: FM }}>{c.code}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{c.cliente}</span>
              </div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>
                {c.indirizzo}
                {vaniMisurati !== null
                  ? ` · ${vaniMisurati}/${c.vaniList.length} vani rilevati`
                  : ` · ${(c.rilievi||[]).length} rilievi`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {isUrgente && <span style={{ ...S.badge(T.redLt, T.red), fontSize: 9 }}>FERMA</span>}
              {c.tipo === "riparazione" && <span style={S.badge(T.orangeLt, T.orange)}>🔧</span>}
              <span style={S.badge(fase?.color + "18", fase?.color)}>{fase?.nome}</span>
            </div>
          </div>
          {c.alert && <div style={{ ...S.badge(c.alert.includes("Nessun") ? T.orangeLt : T.redLt, c.alert.includes("Nessun") ? T.orange : T.red), marginTop: 6 }}>{c.alert}</div>}
          <div style={{ height: 3, background: T.bdr, borderRadius: 2, marginTop: 8 }}>
            <div style={{ height: "100%", borderRadius: 2, background: isUrgente ? T.red : fase?.color, width: `${progress}%`, transition: "width 0.3s" }} />
          </div>
          {/* Box azione suggerita per fase */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "7px 10px", borderRadius: 7, marginTop: 8,
            background: isUrgente ? T.redLt : az.c + "12",
            border: `1px solid ${isUrgente ? T.red + "30" : az.c + "30"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>{isUrgente ? "🔴" : az.i}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: isUrgente ? T.red : az.c }}>
                  {isUrgente ? "Commessa bloccata" : az.t}
                </div>
                <div style={{ fontSize: 10, color: T.sub, marginTop: 1 }}>
                  {Math.round(progress)}%
                  {c.euro ? ` · €${c.euro.toLocaleString("it-IT")}` : ""}
                  {c.scadenza ? <span style={{ color: isScad ? T.red : T.sub }}>
                    {` · scad. ${new Date(c.scadenza + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" })}`}
                  </span> : null}
                </div>
              </div>
            </div>
            <div style={{ padding: "5px 10px", borderRadius: 6, background: isUrgente ? T.red : az.c, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
              {isUrgente ? "Sblocca" : "→"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCMCardCompact = (c) => {
    const fase = PIPELINE.find(p => p.id === c.fase);
    const TODAY_ISO = new Date().toISOString().split("T")[0];
    const isScad = c.scadenza && c.scadenza < TODAY_ISO;
    const isFerma = giorniFermaCM(c) >= sogliaDays && c.fase !== "chiusura";
    const vaniA = getVaniAttivi(c);
    const vaniMis = vaniA.filter(v => Object.values(v.misure||{}).filter(x=>(x as number)>0).length >= 6).length;
    const vaniInc = vaniA.filter(v => { const n=Object.values(v.misure||{}).filter(x=>(x as number)>0).length; return n>0&&n<6; }).length;
    const vaniBloc = vaniA.filter(v => v.note?.startsWith("🔴 BLOCCATO")).length;
    const az = AFASE[c.fase] || AFASE["sopralluogo"];
    const faseIdx = PIPELINE.findIndex(x => x.id === c.fase);
    const progFase = faseIdx >= 0 ? Math.round((faseIdx+1)/PIPELINE.length*100) : 0;
    return (
      <div key={c.id} onClick={() => { setSelectedCM(c); setTab("commesse"); }}
        style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:`1px solid ${T.bdr}`,
          borderLeft:`3px solid ${isFerma?T.red:isScad?T.orange:fase?.color||T.acc}`,
          background: isFerma ? "rgba(255,59,48,0.03)" : T.card, cursor:"pointer" }}>
        {/* Colonna sinistra: codice + cliente */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, color:T.sub, fontFamily:FM }}>{c.code}</span>
            <span style={{ fontSize:14, fontWeight:700 }}>{c.cliente}</span>
            {isFerma && <span style={{ fontSize:9, fontWeight:800, color:T.red, background:T.redLt, borderRadius:6, padding:"1px 5px" }}>FERMA {giorniFermaCM(c)}gg</span>}
            {isScad && !isFerma && <span style={{ fontSize:9, fontWeight:800, color:T.orange, background:T.orangeLt, borderRadius:6, padding:"1px 5px" }}>SCAD</span>}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:3, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ ...S.badge(fase?.color+"18"||T.accLt, fase?.color||T.acc), fontSize:10 }}>{fase?.ico} {fase?.nome}</span>
            {c.trackingStato && <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:4, background: c.trackingStato==="montato"?"#34c75920":c.trackingStato==="pronto"?"#34c75920":"#5856d620", color: c.trackingStato==="montato"?"#34c759":c.trackingStato==="pronto"?"#34c759":"#5856d6" }}>{{ordinato:"📦",produzione:"🏭",pronto:"✅",consegnato:"🚛",montato:"🔧"}[c.trackingStato]} {c.trackingStato}</span>}
            {c.confermato && <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:4, background:"#34c75920", color:"#34c759" }}>✍️ Confermato</span>}
            {c.euro && <span style={{ fontSize:11, color:T.grn, fontWeight:700 }}>€{c.euro.toLocaleString("it-IT")}</span>}
            {c.scadenza && <span style={{ fontSize:10, color: isScad ? T.red : T.sub }}>📅 {c.scadenza}</span>}
          </div>
        </div>
        {/* Colonna destra: info mancanti */}
        <div style={{ textAlign:"right", flexShrink:0, minWidth:80 }}>
          {vaniA.length > 0 ? (
            <div style={{ fontSize:11, fontWeight:600 }}>
              {vaniBloc > 0 && <div style={{ color:T.red }}>🔴 {vaniBloc} bloccati</div>}
              {vaniInc > 0 && <div style={{ color:T.orange }}>⚠ {vaniInc} incompleti</div>}
              {vaniBloc===0 && vaniInc===0 && <div style={{ color:T.grn }}>✅ {vaniMis}/{vaniA.length}</div>}
            </div>
          ) : (
            <div style={{ fontSize:10, color:T.sub }}>Nessun vano</div>
          )}
          <div style={{ marginTop:4, fontSize:10, color: isFerma?T.red:fase?.color||T.acc, fontWeight:700 }}>{progFase}%</div>
          <div style={{ marginTop:3, height:3, width:60, background:T.bdr, borderRadius:2, marginLeft:"auto" }}>
            <div style={{ height:"100%", width:`${progFase}%`, background:isFerma?T.red:fase?.color||T.acc, borderRadius:2 }}/>
          </div>
        </div>
        <span style={{ color:T.sub, fontSize:16 }}>›</span>
      </div>
    );
  };

    if (showRiepilogo && selectedCM) return <RiepilogoPanel />;
    if (selectedVano) return <VanoDetailPanel />;

      if (selectedRilievo) return <CMDetailPanel />;
    if (selectedCM) return <RilieviListPanel />;
    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={S.header}>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>Commesse</div>
            <div style={S.headerSub}>{cantieri.length} totali · {filtered.length} visibili</div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {/* Toggle vista */}
            <div style={{ display:"flex", background:T.bg, borderRadius:8, padding:2, gap:1 }}>
              <div onClick={() => setCmView("list")} style={{ padding:"4px 8px", borderRadius:6, background:cmView==="list"?T.card:"transparent", cursor:"pointer", fontSize:14 }} title="Lista compatta">☰</div>
              <div onClick={() => setCmView("card")} style={{ padding:"4px 8px", borderRadius:6, background:cmView==="card"?T.card:"transparent", cursor:"pointer", fontSize:14 }} title="Card grandi">▦</div>
            </div>
            <div onClick={() => apriInboxDocumento()} style={{ width:36, height:36, borderRadius:10, background:"#af52de", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:18 }} title="Carica documento fornitore">📥</div>
            <div onClick={() => setShowModal("commessa")} style={{ width:36, height:36, borderRadius:10, background:T.acc, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:20, fontWeight:300 }}>+</div>
          </div>
        </div>

        {/* Filtri fase */}
        <div style={{ display:"flex", gap:6, padding:"4px 16px 10px", overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          <div style={S.chip(filterFase === "tutte")} onClick={() => setFilterFase("tutte")}>Tutte ({cantieri.length})</div>
          {PIPELINE.map(p => {
            const n = cantieri.filter(c => c.fase === p.id).length;
            return n > 0 ? <div key={p.id} style={S.chip(filterFase === p.id)} onClick={() => setFilterFase(p.id)}>{p.ico} {p.nome} ({n})</div> : null;
          })}
        </div>

        {/* Search */}
        <div style={{ padding:"0 16px", marginBottom:10 }}>
          <input style={{ ...S.input, width:"100%", boxSizing:"border-box" }} placeholder="Cerca per cliente, codice, indirizzo..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>

        {/* Lista o Card */}
        {cmView === "list" ? (
          <div style={{ background:T.card, margin:"0 16px", borderRadius:T.r, border:`1px solid ${T.bdr}`, overflow:"hidden" }}>
            {filtered.length === 0
              ? <div style={{ padding:"24px", textAlign:"center", color:T.sub }}>Nessuna commessa trovata</div>
              : filtered.map(c => renderCMCardCompact(c))
            }
          </div>
        ) : (
          <div style={isDesktop ? { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, padding:"0 16px" } : isTablet ? { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:"0 16px" } : {}}>
            {filtered.map(c => renderCMCard(c, isTablet || isDesktop))}
          </div>
        )}
      </div>
    );

}
