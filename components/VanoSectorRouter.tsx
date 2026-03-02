"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — VanoSectorRouter v3
// Smista il vano al form di misure corretto in base al settore.
// ═══════════════════════════════════════════════════════════
import React, { useState, useCallback } from "react";
import { useMastro } from "./MastroContext";
import { FF, FM, ICO, Ico, TIPOLOGIE_RAPIDE } from "./mastro-constants";
import VanoDetailPanel from "./VanoDetailPanel";

export default function VanoSectorRouter() {
  const { selectedVano } = useMastro();
  if (!selectedVano) return null;
  const tipObj = TIPOLOGIE_RAPIDE.find(t => t.code === selectedVano.tipo);
  const settore = tipObj?.settore || "serramenti";
  if (settore === "porte") return <PorteDetailPanel />;
  if (settore === "boxdoccia") return <BoxDocciaDetailPanel />;
  if (settore === "cancelli") return <CancelliDetailPanel />;
  return <VanoDetailPanel />;
}

// ═══════════════════════════════════════════════════════════
// SHARED — Section accordion (same pattern as VanoDetailPanel)
// ═══════════════════════════════════════════════════════════
function SectionAcc({ id, icon, label, badge, filled, total, T, S, vanoInfoOpen, setVanoInfoOpen, children }) {
  const isOpen = vanoInfoOpen === id;
  const hasFill = filled > 0;
  const allFill = filled >= total;
  return (
    <div style={{ marginBottom: 3, borderRadius: 10, border: `1px solid ${isOpen ? T.acc + "50" : hasFill ? T.grn + "30" : T.bdr}`, overflow: "hidden" }}>
      <div onClick={() => setVanoInfoOpen(isOpen ? null : id)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: isOpen ? T.acc + "06" : T.card, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label}</span>
          {badge && <span style={{ ...S.badge(T.accLt, T.acc), fontSize: 9, padding: "1px 6px" }}>{badge}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {hasFill && <span style={{ width: 8, height: 8, borderRadius: "50%", background: allFill ? T.grn : T.orange, display: "inline-block" }} />}
          {hasFill && <span style={{ fontSize: 9, fontWeight: 700, color: allFill ? T.grn : T.orange }}>{filled}/{total}</span>}
          <span style={{ fontSize: 9, color: T.sub, display: "inline-block", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
        </div>
      </div>
      {isOpen && <div style={{ padding: "12px", background: T.bg, borderTop: `1px solid ${T.bdr}` }}>{children}</div>}
    </div>
  );
}

// ═══ SHARED — Top bar, dots, step header, bottom nav ═══
function VanoShell({ children, steps, totalFilled, stepColor }) {
  const { T, S, selectedVano, setSelectedVano, vanoStep, setVanoStep } = useMastro();
  if (!selectedVano) return null;
  const v = selectedVano;
  const step = steps[vanoStep] || steps[0];
  return (
    <div style={{ paddingBottom: 80, background: T.bg }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.card, borderBottom: `1px solid ${T.bdr}` }}>
        <div onClick={() => { setSelectedVano(null); setVanoStep(0); }} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={20} c={T.sub} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{v.nome}</div>
          <div style={{ fontSize: 10, color: T.sub }}>{TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.label || v.tipo} · {v.stanza} · {v.piano}</div>
        </div>
        <div style={{ background: totalFilled >= 8 ? T.grn + "20" : T.acc + "20", color: totalFilled >= 8 ? T.grn : T.acc, padding: "3px 10px", borderRadius: 16, fontSize: 11, fontWeight: 800, fontFamily: FM }}>{totalFilled}</div>
      </div>
      {/* DOTS */}
      <div style={{ display: "flex", justifyContent: "center", gap: 5, padding: "14px 16px 6px" }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => setVanoStep(i)} style={{ width: i === vanoStep ? 18 : 8, height: 8, borderRadius: 4, background: i === vanoStep ? s.color : i < vanoStep ? s.color + "60" : T.bdr, cursor: "pointer", transition: "all 0.2s" }} />
        ))}
      </div>
      {/* STEP HEADER */}
      <div style={{ padding: "8px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: step.color + "10", borderRadius: 14, border: `1px solid ${step.color}25`, marginBottom: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: step.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{step.icon}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: step.color }}>{step.icon} {step.title}</div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{step.desc}</div>
          </div>
        </div>
        {children}
      </div>
      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, background: T.card, borderTop: `1px solid ${T.bdr}`, padding: "8px 16px", display: "flex", gap: 8 }}>
        <div onClick={() => { if (vanoStep === 0) { setSelectedVano(null); setVanoStep(0); } else setVanoStep(vanoStep - 1); }}
          style={{ flex: 1, padding: "12px", borderRadius: 10, background: T.bg, textAlign: "center", fontSize: 12, fontWeight: 700, color: T.sub, cursor: "pointer" }}>
          {vanoStep === 0 ? "← Indietro" : "← Precedente"}
        </div>
        <div onClick={() => { if (vanoStep < steps.length - 1) setVanoStep(vanoStep + 1); else { setSelectedVano(null); setVanoStep(0); } }}
          style={{ flex: 2, padding: "12px", borderRadius: 10, background: step.color, textAlign: "center", fontSize: 12, fontWeight: 800, color: "#fff", cursor: "pointer" }}>
          {vanoStep < steps.length - 1 ? `${steps[vanoStep + 1].icon} ${steps[vanoStep + 1].title} →` : "✓ Chiudi"}
        </div>
      </div>
    </div>
  );
}

// ═══ SHARED — useVanoUpdate hook ═══
function useVanoUpdate() {
  const { selectedVano, setSelectedVano, selectedCM, setSelectedCM, selectedRilievo, setSelectedRilievo, cantieri, setCantieri } = useMastro();
  return useCallback((field, val) => {
    if (!selectedVano || !selectedRilievo) return;
    const updRil = { ...selectedRilievo, vani: selectedRilievo.vani.map(vn => vn.id === selectedVano.id ? { ...vn, [field]: val } : vn) };
    setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, rilievi: c.rilievi.map(r2 => r2.id === selectedRilievo?.id ? updRil : r2) } : c));
    setSelectedRilievo(updRil);
    setSelectedCM(prev => prev ? ({ ...prev, rilievi: prev.rilievi.map(r => r.id === selectedRilievo?.id ? updRil : r) }) : prev);
    setSelectedVano(prev => ({ ...prev, [field]: val }));
  }, [selectedVano?.id, selectedRilievo, selectedCM]);
}

// ═══ SHARED — Photo handler ═══
function PhotoRow({ v, updateV }) {
  const { T } = useMastro();
  const handlePhoto = (e, cat) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateV("foto", { ...(v.foto || {}), [cat]: reader.result });
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6 }}>FOTO</div>
      <div style={{ display: "flex", gap: 6 }}>
        {["fronte", "retro", "dettaglio"].map(cat => {
          const has = v.foto?.[cat];
          return (
            <label key={cat} style={{ flex: 1, cursor: "pointer" }}>
              <div style={{ height: 60, borderRadius: 10, border: `2px dashed ${has ? T.grn : T.bdr}`, background: has ? T.grn + "08" : T.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                {has ? <><span style={{ fontSize: 14 }}>✅</span><span style={{ fontSize: 8, color: T.grn, fontWeight: 700 }}>{cat}</span></> : <><span style={{ fontSize: 14 }}>📷</span><span style={{ fontSize: 8, color: T.sub, fontWeight: 600 }}>{cat}</span></>}
              </div>
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handlePhoto(e, cat)} />
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ═══ SHARED — Stanza/Piano/Pezzi section ═══
function PosSection({ v, updateV, T, S, vanoInfoOpen, setVanoInfoOpen }) {
  return (
    <SectionAcc id="posizione" icon="🏠" label="Stanza / Piano" badge={v.stanza ? `${v.stanza} · ${v.piano}` : null} filled={[v.stanza, v.piano].filter(Boolean).length} total={2} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>STANZA</div>
          <select style={S.select} value={v.stanza || ""} onChange={e => updateV("stanza", e.target.value)}>
            {["Soggiorno", "Cucina", "Camera", "Bagno", "Studio", "Ingresso", "Corridoio", "Ripostiglio", "Altro"].map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>PIANO</div>
          <select style={S.select} value={v.piano || ""} onChange={e => updateV("piano", e.target.value)}>
            {["S2", "S1", "PT", "P1", "P2", "P3", "P4", "P5", "M"].map(p => <option key={p} value={p}>{p === "PT" ? "PT — Piano Terra" : p === "M" ? "M — Mansarda" : p}</option>)}
          </select>
        </div>
        <div style={{ width: 80 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>PEZZI</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div onClick={() => updateV("pezzi", Math.max(1, (v.pezzi || 1) - 1))} style={{ width: 28, height: 32, borderRadius: 6, background: T.bg, border: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, fontWeight: 700, color: T.sub }}>−</div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 800, color: T.acc }}>{v.pezzi || 1}</div>
            <div onClick={() => updateV("pezzi", (v.pezzi || 1) + 1)} style={{ width: 28, height: 32, borderRadius: 6, background: T.bg, border: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, fontWeight: 700, color: T.sub }}>+</div>
          </div>
        </div>
      </div>
    </SectionAcc>
  );
}

// ═══ SHARED — Tipologia section ═══
function TipoSection({ v, updateV, T, S, vanoInfoOpen, setVanoInfoOpen }) {
  const { tipologieFiltrate, tipCat, setTipCat } = useMastro();
  return (
    <SectionAcc id="tipologia" icon="📦" label="Tipologia" badge={TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.label || null} filled={v.tipo ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
      <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.bdr}`, paddingBottom: 0, marginBottom: 4 }}>
        {[...new Set(tipologieFiltrate.map(t => t.cat))].map(cat => (
          <div key={cat} onClick={() => setTipCat(cat)} style={{ padding: "5px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", color: tipCat === cat ? T.acc : T.sub, borderBottom: `2px solid ${tipCat === cat ? T.acc : "transparent"}`, marginBottom: -1, whiteSpace: "nowrap" }}>{cat}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        {tipologieFiltrate.filter(t => t.cat === tipCat).map(t => (
          <div key={t.code} onClick={() => updateV("tipo", t.code)} style={{ padding: "7px 10px", borderRadius: 10, border: `1.5px solid ${v.tipo === t.code ? T.acc : T.bdr}`, background: v.tipo === t.code ? T.accLt : T.card, fontSize: 11, fontWeight: 700, color: v.tipo === t.code ? T.acc : T.text, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t.icon} {t.code}</div>
        ))}
      </div>
    </SectionAcc>
  );
}

// ═══ SHARED — Chip selector ═══
function ChipSelect({ items, value, onChange, color, T }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {items.map(item => (
        <div key={item} onClick={() => onChange(value === item ? "" : item)}
          style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${value === item ? (color || T.acc) : T.bdr}`, background: value === item ? (color || T.acc) + "15" : T.card, fontSize: 10, fontWeight: 700, color: value === item ? (color || T.acc) : T.text, cursor: "pointer" }}>
          {item}
        </div>
      ))}
    </div>
  );
}

// ═══ SHARED — Misure L × H input ═══
function MisureLH({ v, stepColor }) {
  const { T, S, updateMisureBatch } = useMastro();
  const m = v.misure || {};
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 8, color: stepColor, marginBottom: 2, fontWeight: 700 }}>LARGHEZZA</div>
        <input type="number" inputMode="numeric" style={{ ...S.input, fontSize: 16, fontFamily: FM, fontWeight: 700, textAlign: "center", padding: "10px", borderColor: stepColor + "50" }}
          value={m.lCentro || ""} placeholder="L"
          onChange={e => { const val = parseInt(e.target.value) || 0; updateMisureBatch(v.id, { lAlto: val, lCentro: val, lBasso: val }); }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", paddingTop: 8, fontSize: 18, color: T.sub, fontWeight: 300 }}>×</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 8, color: stepColor, marginBottom: 2, fontWeight: 700 }}>ALTEZZA</div>
        <input type="number" inputMode="numeric" style={{ ...S.input, fontSize: 16, fontFamily: FM, fontWeight: 700, textAlign: "center", padding: "10px", borderColor: stepColor + "50" }}
          value={m.hCentro || ""} placeholder="H"
          onChange={e => { const val = parseInt(e.target.value) || 0; updateMisureBatch(v.id, { hSx: val, hCentro: val, hDx: val }); }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 8 }}>
        {m.lCentro > 0 && m.hCentro > 0 && <>
          <div style={{ fontSize: 13, color: T.grn, fontWeight: 800, fontFamily: FM }}>{((m.lCentro / 1000) * (m.hCentro / 1000)).toFixed(2)}</div>
          <div style={{ fontSize: 8, color: T.grn, fontWeight: 600 }}>mq</div>
        </>}
      </div>
    </div>
  );
}

// ═══ SHARED — Notes textarea ═══
function NoteField({ v, updateV, T, S }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>NOTE</div>
      <textarea value={v.note || ""} onChange={e => updateV("note", e.target.value)} placeholder="Note aggiuntive..." style={{ ...S.input, minHeight: 60, resize: "vertical", fontSize: 12 }} />
    </div>
  );
}

// ═══ SHARED — Riepilogo line ═══
function RiepLine({ label, value, sub, T }) {
  if (!value) return null;
  return <div style={{ fontSize: 12, lineHeight: 2.2, color: T.text }}><span style={{ color: T.sub, fontSize: 11 }}>{label}:</span> <strong>{value}</strong>{sub && <span style={{ color: T.sub }}> · {sub}</span>}</div>;
}


// ═══════════════════════════════════════════════════════════
// PORTE DETAIL PANEL
// ═══════════════════════════════════════════════════════════
const PT = {
  MAT: ["Legno massello","Laccato opaco","Laccato lucido","Laminato CPL","Laminato HPL","Vetro temperato","Blindata","Metallica REI","Light","EI tagliafuoco"],
  APE: { "Battente": ["Battente singola","Battente doppia"], "Scorrevole": ["Scomparsa singola","Scomparsa doppia","Esterno muro"], "Libro": ["Libro simmetrica","Libro asimmetrica"], "Filomuro": ["Filomuro battente","Filomuro scorrevole"] },
  SENSI: ["DX spinta","DX tirare","SX spinta","SX tirare"],
  FIN: ["Liscio","Pantografato","Inciso","Con vetro","Bugnato","Dogato H","Dogato V"],
  COL: ["Bianco laccato","Bianco matrix","Grigio 7035","Grigio 7016","Noce nazionale","Noce canaletto","Rovere sbiancato","Rovere naturale","Rovere grigio","Wengé","Olmo","Frassino","RAL custom"],
  CT: ["Standard legno","Metallo zincato","Scrigno scomparsa","Eclisse scomparsa","Filomuro alu","Esistente"],
  COPRI: ["Piatto liscio","Bombato classico","Squadrato moderno","Telescopico","Complanare","Senza"],
  SOGLIA: ["Automatica","Fissa pavimento","Ribassata","Nessuna","Esistente"],
  MAN_TIPO: ["Su rosetta","Su placca","Maniglione","Scorrevole incasso","Tagliafuoco"],
  MAN_SERIE: ["Paris","Tokyo","Amsterdam","Atlanta","Milano","Dallas","Singapore","London","Sertos","Liège"],
  MAN_FIN: ["Cromo satinato F69","Cromo lucido F1","Nero opaco F9714M","Bronzo F4","Ottone F3","Inox F69SS","Bianco RAL 9016","Rame F49","Titanio F9"],
  SERR: ["Da infilare standard","Da infilare 4 mandate","Multipunto","Elettrica","Smart","Antipanico"],
  CIL: ["Europeo","Alta sicurezza","Per pomolo","Doppia mappa","Elettronico"],
  CHIUDI: ["Nessuno","A braccio","A slitta","A pavimento","Elettromagnetico"],
  CERN: ["A scomparsa regolabile","A vista 3D","A molla","A bilico (pivot)","Per blindata","Per REI","Anuba","A libro"],
  RAP: [{ l:600,h:2100,lb:"60×210" },{ l:700,h:2100,lb:"70×210" },{ l:800,h:2100,lb:"80×210" },{ l:900,h:2100,lb:"90×210" },{ l:1000,h:2100,lb:"100×210" },{ l:800,h:2400,lb:"80×240" },{ l:900,h:2400,lb:"90×240" }],
};

function PorteDetailPanel() {
  const ctx = useMastro();
  const { T, S, selectedVano, vanoStep, vanoInfoOpen, setVanoInfoOpen, updateMisura, updateMisureBatch } = ctx;
  const updateV = useVanoUpdate();
  if (!selectedVano) return null;
  const v = selectedVano;
  const m = v.misure || {};
  const STEPS = [
    { id: "config", title: "CONFIGURAZIONE", desc: "Misure, materiale, apertura, colore", color: "#D08008", icon: "🚪" },
    { id: "ferr", title: "FERRAMENTA", desc: "Maniglie, serratura, cerniere, soglia", color: "#507aff", icon: "🔑" },
    { id: "riep", title: "RIEPILOGO", desc: "Anteprima completa della porta", color: "#34c759", icon: "📋" },
  ];
  const step = STEPS[vanoStep] || STEPS[0];
  const mCnt = [m.lCentro, m.hCentro, m.spessoreMuro].filter(x => x > 0).length;
  const cCnt = [v.materiale, v.apertura, v.senso, v.finitura, v.colore, v.controtelaioPorta].filter(Boolean).length;
  const fCnt = [v.maniglia, v.serratura, v.cerniera, v.coprifilo, v.soglia].filter(Boolean).length;
  const tot = mCnt + cCnt + fCnt;

  return (
    <VanoShell steps={STEPS} totalFilled={tot}>
      {/* STEP 0: CONFIGURAZIONE */}
      {vanoStep === 0 && (<>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: step.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📏 Misure vano</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, marginBottom: 4 }}>RAPIDA</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {PT.RAP.map(ms => (
              <div key={ms.lb} onClick={() => { updateMisureBatch(v.id, { lAlto: ms.l, lCentro: ms.l, lBasso: ms.l }); updateMisureBatch(v.id, { hSx: ms.h, hCentro: ms.h, hDx: ms.h }); }}
                style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${m.lCentro === ms.l && m.hCentro === ms.h ? T.acc : T.bdr}`, background: m.lCentro === ms.l && m.hCentro === ms.h ? T.accLt : T.card, fontSize: 11, fontWeight: 700, color: m.lCentro === ms.l && m.hCentro === ms.h ? T.acc : T.text, cursor: "pointer", fontFamily: FM }}>{ms.lb}</div>
            ))}
          </div>
          <MisureLH v={v} stepColor={step.color} />
          <div><div style={{ fontSize: 8, color: T.sub, marginBottom: 2, fontWeight: 700 }}>SPESSORE MURO</div>
            <input type="number" inputMode="numeric" style={{ ...S.input, fontSize: 14, fontFamily: FM, fontWeight: 600, textAlign: "center", padding: "8px", maxWidth: 160 }} value={m.spessoreMuro || ""} placeholder="mm" onChange={e => updateMisura(v.id, "spessoreMuro", e.target.value)} />
          </div>
        </div>
        <TipoSection v={v} updateV={updateV} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen} />
        <PosSection v={v} updateV={updateV} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen} />
        <SectionAcc id="materiale" icon="🪵" label="Materiale / Finitura" badge={v.materiale || null} filled={[v.materiale, v.finitura, v.colore].filter(Boolean).length} total={3} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>MATERIALE</div><ChipSelect items={PT.MAT} value={v.materiale} onChange={val => updateV("materiale", val)} T={T} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>FINITURA</div><ChipSelect items={PT.FIN} value={v.finitura} onChange={val => updateV("finitura", val)} T={T} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>COLORE / ESSENZA</div>
              <select style={S.select} value={v.colore || ""} onChange={e => updateV("colore", e.target.value)}><option value="">— Seleziona —</option>{PT.COL.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
        </SectionAcc>
        <SectionAcc id="apertura" icon="↔️" label="Apertura / Senso" badge={v.apertura ? `${v.apertura}` : null} filled={[v.apertura, v.senso].filter(Boolean).length} total={2} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>APERTURA</div>
              <select style={S.select} value={v.apertura || ""} onChange={e => updateV("apertura", e.target.value)}><option value="">— Seleziona —</option>
                {Object.entries(PT.APE).map(([g, items]) => <optgroup key={g} label={g}>{items.map(i => <option key={i} value={i}>{i}</option>)}</optgroup>)}
              </select></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>SENSO</div>
              <div style={{ display: "flex", gap: 5 }}>{PT.SENSI.map(s => (
                <div key={s} onClick={() => updateV("senso", v.senso === s ? "" : s)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: `1.5px solid ${v.senso === s ? T.acc : T.bdr}`, background: v.senso === s ? T.accLt : T.card, textAlign: "center", fontSize: 11, fontWeight: 700, color: v.senso === s ? T.acc : T.sub, cursor: "pointer" }}>{s}</div>
              ))}</div></div>
          </div>
        </SectionAcc>
        <SectionAcc id="ct" icon="🔲" label="Controtelaio" badge={v.controtelaioPorta || null} filled={v.controtelaioPorta ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={PT.CT} value={v.controtelaioPorta} onChange={val => updateV("controtelaioPorta", val)} T={T} />
        </SectionAcc>
      </>)}

      {/* STEP 1: FERRAMENTA */}
      {vanoStep === 1 && (<>
        <SectionAcc id="maniglia" icon="🔑" label="Maniglieria HOPPE" badge={v.maniglia || null} filled={[v.maniglia, v.serieManiglia, v.finituraManiglia].filter(Boolean).length} total={3} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>TIPO</div><ChipSelect items={PT.MAN_TIPO} value={v.maniglia} onChange={val => updateV("maniglia", val)} color={step.color} T={T} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>SERIE</div><ChipSelect items={PT.MAN_SERIE} value={v.serieManiglia} onChange={val => updateV("serieManiglia", val)} color={step.color} T={T} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>FINITURA</div>
              <select style={S.select} value={v.finituraManiglia || ""} onChange={e => updateV("finituraManiglia", e.target.value)}><option value="">— Seleziona —</option>{PT.MAN_FIN.map(f => <option key={f}>{f}</option>)}</select></div>
          </div>
        </SectionAcc>
        <SectionAcc id="serratura" icon="🔒" label="Serratura CISA" badge={v.serratura || null} filled={[v.serratura, v.cilindro].filter(Boolean).length} total={2} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>TIPO</div><ChipSelect items={PT.SERR} value={v.serratura} onChange={val => updateV("serratura", val)} color={step.color} T={T} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>CILINDRO</div><select style={S.select} value={v.cilindro || ""} onChange={e => updateV("cilindro", e.target.value)}><option value="">— Seleziona —</option>{PT.CIL.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 3 }}>CHIUDIPORTA</div><select style={S.select} value={v.chiudiporta || ""} onChange={e => updateV("chiudiporta", e.target.value)}><option value="">— Seleziona —</option>{PT.CHIUDI.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
        </SectionAcc>
        <SectionAcc id="cerniere" icon="🔩" label="Cerniere" badge={v.cerniera || null} filled={v.cerniera ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={PT.CERN} value={v.cerniera} onChange={val => updateV("cerniera", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="coprifilo" icon="🪵" label="Coprifilo" badge={v.coprifilo || null} filled={v.coprifilo ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={PT.COPRI} value={v.coprifilo} onChange={val => updateV("coprifilo", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="soglia" icon="🧱" label="Soglia" badge={v.soglia || null} filled={v.soglia ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={PT.SOGLIA} value={v.soglia} onChange={val => updateV("soglia", val)} color={step.color} T={T} />
        </SectionAcc>
        <NoteField v={v} updateV={updateV} T={T} S={S} />
        <PhotoRow v={v} updateV={updateV} />
      </>)}

      {/* STEP 2: RIEPILOGO */}
      {vanoStep === 2 && (
        <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: T.text, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>📋</span><span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Riepilogo Porta</span>
            <span style={{ fontSize: 9, color: "#888", marginLeft: "auto", fontFamily: FM }}>{tot} campi</span>
          </div>
          <div style={{ padding: "14px 14px" }}>
            <RiepLine label="Misure" value={m.lCentro > 0 ? `${m.lCentro}×${m.hCentro} mm` : null} sub={m.spessoreMuro > 0 ? `Muro ${m.spessoreMuro}` : null} T={T} />
            <RiepLine label="Tipo" value={TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.label} T={T} />
            <RiepLine label="Materiale" value={v.materiale} T={T} />
            <RiepLine label="Finitura" value={v.finitura} sub={v.colore} T={T} />
            <RiepLine label="Apertura" value={v.apertura} sub={v.senso} T={T} />
            <RiepLine label="Controtelaio" value={v.controtelaioPorta} T={T} />
            <RiepLine label="Maniglia" value={v.maniglia} sub={[v.serieManiglia, v.finituraManiglia].filter(Boolean).join(" · ")} T={T} />
            <RiepLine label="Serratura" value={v.serratura} sub={v.cilindro} T={T} />
            <RiepLine label="Cerniere" value={v.cerniera} T={T} />
            <RiepLine label="Coprifilo" value={v.coprifilo} T={T} />
            <RiepLine label="Soglia" value={v.soglia} T={T} />
            {v.chiudiporta && v.chiudiporta !== "Nessuno" && <RiepLine label="Chiudiporta" value={v.chiudiporta} T={T} />}
            {v.note && <div style={{ marginTop: 4, padding: "6px 10px", background: T.bg, borderRadius: 8, fontSize: 11, color: T.sub }}>{v.note}</div>}
            {tot === 0 && <div style={{ textAlign: "center", color: T.sub, padding: 20 }}>Nessun dato. Torna a Configurazione.</div>}
          </div>
        </div>
      )}
    </VanoShell>
  );
}


// ═══════════════════════════════════════════════════════════
// BOX DOCCIA DETAIL PANEL
// ═══════════════════════════════════════════════════════════
const BD = {
  TIPO: ["Nicchia","Angolo","Walk-in","Vasca","Semicircolare","Tre lati"],
  VETRO: ["Trasparente 6mm","Trasparente 8mm","Satinato 6mm","Satinato 8mm","Stampato 4mm","Serigrafato","Fumè"],
  PROFILO: ["Cromo lucido","Cromo satinato","Nero opaco","Oro spazzolato","Bronzo","Bianco","Senza profilo"],
  APERTURA: ["Scorrevole","Battente","Saloon","Soffietto","Pivot","Walk-in fisso"],
  TRATTAMENTO: ["Anti-calcare","Nessuno"],
  GUARNIZIONI: ["Standard","Magnetiche","Gocciolatoio trasparente","Anti-infiltrazione rinforzata"],
  ACCESSORI: ["Maniglione cromato","Pomolo","Porta asciugamani integrato","Portasapone","Profilo compensazione"],
  RAP_NIC: [{ l:700,lb:"70" },{ l:800,lb:"80" },{ l:900,lb:"90" },{ l:1000,lb:"100" },{ l:1200,lb:"120" },{ l:1400,lb:"140" }],
};

function BoxDocciaDetailPanel() {
  const ctx = useMastro();
  const { T, S, selectedVano, vanoStep, vanoInfoOpen, setVanoInfoOpen, updateMisura, updateMisureBatch } = ctx;
  const updateV = useVanoUpdate();
  if (!selectedVano) return null;
  const v = selectedVano;
  const m = v.misure || {};
  const STEPS = [
    { id: "config", title: "CONFIGURAZIONE", desc: "Misure, tipo, vetro, profili", color: "#3B7FE0", icon: "🚿" },
    { id: "dett", title: "DETTAGLI", desc: "Guarnizioni, accessori, trattamento", color: "#af52de", icon: "⚙" },
    { id: "riep", title: "RIEPILOGO", desc: "Anteprima completa", color: "#34c759", icon: "📋" },
  ];
  const step = STEPS[vanoStep] || STEPS[0];
  const mCnt = [m.lCentro, m.hCentro, m.profondita].filter(x => x > 0).length;
  const cCnt = [v.tipoBox, v.vetroBox, v.profiloBox, v.aperturaBox].filter(Boolean).length;
  const dCnt = [v.trattamento, v.guarnizioni].filter(Boolean).length + (v.accessoriBox?.length || 0 > 0 ? 1 : 0);
  const tot = mCnt + cCnt + dCnt;
  const isAngolo = v.tipoBox === "Angolo" || v.tipoBox === "Tre lati" || v.tipoBox === "Semicircolare";

  return (
    <VanoShell steps={STEPS} totalFilled={tot}>
      {vanoStep === 0 && (<>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: step.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📏 Misure vano doccia</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, marginBottom: 4 }}>LARGHEZZA RAPIDA (cm)</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {BD.RAP_NIC.map(ms => (
              <div key={ms.lb} onClick={() => updateMisureBatch(v.id, { lAlto: ms.l, lCentro: ms.l, lBasso: ms.l })}
                style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${m.lCentro === ms.l ? step.color : T.bdr}`, background: m.lCentro === ms.l ? step.color + "15" : T.card, fontSize: 11, fontWeight: 700, color: m.lCentro === ms.l ? step.color : T.text, cursor: "pointer", fontFamily: FM }}>{ms.lb}</div>
            ))}
          </div>
          <MisureLH v={v} stepColor={step.color} />
          {isAngolo && <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 8, color: T.sub, marginBottom: 2, fontWeight: 700 }}>PROFONDITÀ (lato corto) mm</div>
            <input type="number" inputMode="numeric" style={{ ...S.input, fontSize: 14, fontFamily: FM, fontWeight: 600, textAlign: "center", padding: "8px", maxWidth: 160 }} value={m.profondita || ""} placeholder="mm" onChange={e => updateMisura(v.id, "profondita", e.target.value)} />
          </div>}
        </div>
        <SectionAcc id="tipobox" icon="🚿" label="Tipo box" badge={v.tipoBox || null} filled={v.tipoBox ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={BD.TIPO} value={v.tipoBox} onChange={val => updateV("tipoBox", val)} color={step.color} T={T} />
        </SectionAcc>
        <TipoSection v={v} updateV={updateV} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen} />
        <PosSection v={v} updateV={updateV} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen} />
        <SectionAcc id="vetrobox" icon="🪟" label="Vetro" badge={v.vetroBox || null} filled={v.vetroBox ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={BD.VETRO} value={v.vetroBox} onChange={val => updateV("vetroBox", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="profilobox" icon="🔧" label="Profilo" badge={v.profiloBox || null} filled={v.profiloBox ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={BD.PROFILO} value={v.profiloBox} onChange={val => updateV("profiloBox", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="apertbox" icon="↔️" label="Apertura" badge={v.aperturaBox || null} filled={v.aperturaBox ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={BD.APERTURA} value={v.aperturaBox} onChange={val => updateV("aperturaBox", val)} color={step.color} T={T} />
        </SectionAcc>
      </>)}

      {vanoStep === 1 && (<>
        <SectionAcc id="trattamento" icon="💧" label="Trattamento vetro" badge={v.trattamento || null} filled={v.trattamento ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={BD.TRATTAMENTO} value={v.trattamento} onChange={val => updateV("trattamento", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="guarnizioni" icon="🔲" label="Guarnizioni" badge={v.guarnizioni || null} filled={v.guarnizioni ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={BD.GUARNIZIONI} value={v.guarnizioni} onChange={val => updateV("guarnizioni", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="accbox" icon="🔩" label="Accessori" badge={v.accessoriBox?.length > 0 ? `${v.accessoriBox.length}` : null} filled={v.accessoriBox?.length > 0 ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {BD.ACCESSORI.map(a => {
              const sel = (v.accessoriBox || []).includes(a);
              return <div key={a} onClick={() => updateV("accessoriBox", sel ? (v.accessoriBox || []).filter(x => x !== a) : [...(v.accessoriBox || []), a])}
                style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${sel ? step.color : T.bdr}`, background: sel ? step.color + "15" : T.card, fontSize: 10, fontWeight: 700, color: sel ? step.color : T.text, cursor: "pointer" }}>{a}</div>;
            })}
          </div>
        </SectionAcc>
        <NoteField v={v} updateV={updateV} T={T} S={S} />
        <PhotoRow v={v} updateV={updateV} />
      </>)}

      {vanoStep === 2 && (
        <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: T.text, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>📋</span><span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Riepilogo Box Doccia</span>
            <span style={{ fontSize: 9, color: "#888", marginLeft: "auto", fontFamily: FM }}>{tot} campi</span>
          </div>
          <div style={{ padding: "14px 14px" }}>
            <RiepLine label="Misure" value={m.lCentro > 0 ? `${m.lCentro}×${m.hCentro}${m.profondita > 0 ? "×" + m.profondita : ""} mm` : null} T={T} />
            <RiepLine label="Tipo" value={v.tipoBox} T={T} />
            <RiepLine label="Vetro" value={v.vetroBox} T={T} />
            <RiepLine label="Profilo" value={v.profiloBox} T={T} />
            <RiepLine label="Apertura" value={v.aperturaBox} T={T} />
            <RiepLine label="Trattamento" value={v.trattamento} T={T} />
            <RiepLine label="Guarnizioni" value={v.guarnizioni} T={T} />
            {v.accessoriBox?.length > 0 && <RiepLine label="Accessori" value={v.accessoriBox.join(", ")} T={T} />}
            {v.note && <div style={{ marginTop: 4, padding: "6px 10px", background: T.bg, borderRadius: 8, fontSize: 11, color: T.sub }}>{v.note}</div>}
            {tot === 0 && <div style={{ textAlign: "center", color: T.sub, padding: 20 }}>Nessun dato. Torna a Configurazione.</div>}
          </div>
        </div>
      )}
    </VanoShell>
  );
}


// ═══════════════════════════════════════════════════════════
// CANCELLI DETAIL PANEL
// ═══════════════════════════════════════════════════════════
const CN = {
  TIPO: ["Battente singolo","Battente doppio","Scorrevole","Scorrevole autoportante","Sezionale","Basculante","Pedonale","Carraio+Pedonale"],
  MAT: ["Ferro zincato","Ferro verniciato","Alluminio","Acciaio inox","Acciaio corten","Legno","Misto ferro/legno"],
  TAMPONAMENTO: ["Doghe orizzontali","Doghe verticali","Lamiera piena","Lamiera forata","Pannelli sandwich","Grigliato","Pali tondi","Pali quadri","Maglia metallica","Vetro/policarbonato"],
  AUTOMAZIONE: ["Nessuna","Motore interrato","Motore a braccio","Motore scorrevole","Motore a cremagliera","Motore a catena"],
  MARCA_MOTORE: ["FAAC","CAME","BFT","Nice","Somfy","Benincà","Fadini"],
  SERRATURA_CN: ["Semplice","Elettroserratura","Elettroblocco","Selettore a chiave","Tastierino codice"],
  ACCESSORI_CN: ["Fotocellule","Lampeggiante","Antenna","Batteria emergenza","Telecomandi (2pz)","Telecomandi (4pz)","Costa sensibile","Selettore chiave","Piastra intercom"],
  FINITURA_CN: ["Zincato grezzo","Verniciato RAL","Corten naturale","Corten stabilizzato","Effetto legno","Anodizzato","Satinato"],
};

function CancelliDetailPanel() {
  const ctx = useMastro();
  const { T, S, selectedVano, vanoStep, vanoInfoOpen, setVanoInfoOpen, updateMisura, updateMisureBatch } = ctx;
  const updateV = useVanoUpdate();
  if (!selectedVano) return null;
  const v = selectedVano;
  const m = v.misure || {};
  const STEPS = [
    { id: "config", title: "CONFIGURAZIONE", desc: "Misure, tipo, materiale, tamponamento", color: "#8B5E34", icon: "🏗️" },
    { id: "auto", title: "AUTOMAZIONE", desc: "Motore, accessori, serratura", color: "#e63946", icon: "⚡" },
    { id: "riep", title: "RIEPILOGO", desc: "Anteprima completa", color: "#34c759", icon: "📋" },
  ];
  const step = STEPS[vanoStep] || STEPS[0];
  const mCnt = [m.lCentro, m.hCentro].filter(x => x > 0).length;
  const cCnt = [v.tipoCancello, v.materialeCancello, v.tamponamento, v.finituraCancello].filter(Boolean).length;
  const aCnt = [v.automazione, v.marcaMotore, v.serraturaCancello].filter(Boolean).length + (v.accessoriCancello?.length > 0 ? 1 : 0);
  const tot = mCnt + cCnt + aCnt;

  return (
    <VanoShell steps={STEPS} totalFilled={tot}>
      {vanoStep === 0 && (<>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: step.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📏 Misure luce netta</div>
          <MisureLH v={v} stepColor={step.color} />
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 8, color: T.sub, marginBottom: 2, fontWeight: 700 }}>PROF. BINARIO / INGOMBRO mm</div>
              <input type="number" inputMode="numeric" style={{ ...S.input, fontSize: 14, fontFamily: FM, fontWeight: 600, textAlign: "center", padding: "8px" }} value={m.profondita || ""} placeholder="mm" onChange={e => updateMisura(v.id, "profondita", e.target.value)} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 8, color: T.sub, marginBottom: 2, fontWeight: 700 }}>SPESSORE PILASTRI mm</div>
              <input type="number" inputMode="numeric" style={{ ...S.input, fontSize: 14, fontFamily: FM, fontWeight: 600, textAlign: "center", padding: "8px" }} value={m.spessorePilastri || ""} placeholder="mm" onChange={e => updateMisura(v.id, "spessorePilastri", e.target.value)} /></div>
          </div>
        </div>
        <SectionAcc id="tipocn" icon="🏗️" label="Tipo cancello" badge={v.tipoCancello || null} filled={v.tipoCancello ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={CN.TIPO} value={v.tipoCancello} onChange={val => updateV("tipoCancello", val)} color={step.color} T={T} />
        </SectionAcc>
        <TipoSection v={v} updateV={updateV} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen} />
        <SectionAcc id="matcn" icon="🔧" label="Materiale" badge={v.materialeCancello || null} filled={v.materialeCancello ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={CN.MAT} value={v.materialeCancello} onChange={val => updateV("materialeCancello", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="tampcn" icon="▦" label="Tamponamento" badge={v.tamponamento || null} filled={v.tamponamento ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={CN.TAMPONAMENTO} value={v.tamponamento} onChange={val => updateV("tamponamento", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="fincn" icon="🎨" label="Finitura" badge={v.finituraCancello || null} filled={v.finituraCancello ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={CN.FINITURA_CN} value={v.finituraCancello} onChange={val => updateV("finituraCancello", val)} color={step.color} T={T} />
        </SectionAcc>
      </>)}

      {vanoStep === 1 && (<>
        <SectionAcc id="autocn" icon="⚡" label="Automazione" badge={v.automazione || null} filled={[v.automazione, v.marcaMotore].filter(Boolean).length} total={2} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>TIPO MOTORE</div><ChipSelect items={CN.AUTOMAZIONE} value={v.automazione} onChange={val => updateV("automazione", val)} color={step.color} T={T} /></div>
            {v.automazione && v.automazione !== "Nessuna" && <div><div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>MARCA</div><ChipSelect items={CN.MARCA_MOTORE} value={v.marcaMotore} onChange={val => updateV("marcaMotore", val)} color={step.color} T={T} /></div>}
          </div>
        </SectionAcc>
        <SectionAcc id="serrcn" icon="🔒" label="Serratura" badge={v.serraturaCancello || null} filled={v.serraturaCancello ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <ChipSelect items={CN.SERRATURA_CN} value={v.serraturaCancello} onChange={val => updateV("serraturaCancello", val)} color={step.color} T={T} />
        </SectionAcc>
        <SectionAcc id="acccn" icon="📡" label="Accessori" badge={v.accessoriCancello?.length > 0 ? `${v.accessoriCancello.length}` : null} filled={v.accessoriCancello?.length > 0 ? 1 : 0} total={1} T={T} S={S} vanoInfoOpen={vanoInfoOpen} setVanoInfoOpen={setVanoInfoOpen}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {CN.ACCESSORI_CN.map(a => {
              const sel = (v.accessoriCancello || []).includes(a);
              return <div key={a} onClick={() => updateV("accessoriCancello", sel ? (v.accessoriCancello || []).filter(x => x !== a) : [...(v.accessoriCancello || []), a])}
                style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${sel ? step.color : T.bdr}`, background: sel ? step.color + "15" : T.card, fontSize: 10, fontWeight: 700, color: sel ? step.color : T.text, cursor: "pointer" }}>{a}</div>;
            })}
          </div>
        </SectionAcc>
        <NoteField v={v} updateV={updateV} T={T} S={S} />
        <PhotoRow v={v} updateV={updateV} />
      </>)}

      {vanoStep === 2 && (
        <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: T.text, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>📋</span><span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Riepilogo Cancello</span>
            <span style={{ fontSize: 9, color: "#888", marginLeft: "auto", fontFamily: FM }}>{tot} campi</span>
          </div>
          <div style={{ padding: "14px 14px" }}>
            <RiepLine label="Misure" value={m.lCentro > 0 ? `${m.lCentro}×${m.hCentro} mm` : null} sub={m.profondita > 0 ? `Prof. ${m.profondita}` : null} T={T} />
            <RiepLine label="Tipo" value={v.tipoCancello} T={T} />
            <RiepLine label="Materiale" value={v.materialeCancello} T={T} />
            <RiepLine label="Tamponamento" value={v.tamponamento} T={T} />
            <RiepLine label="Finitura" value={v.finituraCancello} T={T} />
            <RiepLine label="Automazione" value={v.automazione} sub={v.marcaMotore} T={T} />
            <RiepLine label="Serratura" value={v.serraturaCancello} T={T} />
            {v.accessoriCancello?.length > 0 && <RiepLine label="Accessori" value={v.accessoriCancello.join(", ")} T={T} />}
            {v.note && <div style={{ marginTop: 4, padding: "6px 10px", background: T.bg, borderRadius: 8, fontSize: 11, color: T.sub }}>{v.note}</div>}
            {tot === 0 && <div style={{ textAlign: "center", color: T.sub, padding: 20 }}>Nessun dato. Torna a Configurazione.</div>}
          </div>
        </div>
      )}
    </VanoShell>
  );
}
