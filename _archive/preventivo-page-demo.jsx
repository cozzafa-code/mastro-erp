import { useState } from "react";

const T = {
  bg: "#F2F1EC", card: "#fff", text: "#1A1A1C", sub: "#6B7280", sub2: "#9CA3AF",
  acc: "#D08008", accLt: "#D0800815", bdr: "#E5E5E0", blue: "#3B7FE0",
  grn: "#1A9E73", red: "#DC4444", orange: "#ff9500", purple: "#af52de",
  topbar: "#1A1A1C", r: 12,
};

const DEMO_VANI = [
  { id: 1, nome: "F1 Soggiorno", tipo: "F2A", stanza: "Soggiorno", piano: "PT", pezzi: 3, l: 1200, h: 1400, sistema: "Aluplast Ideal 4000", colore: "Bianco", vetro: "Doppio Basso-E", tapparella: true, persiana: false, zanzariera: true, cassonetto: "Coibentato", controtelaio: "Monoblocco", coprifilo: "PVC 60mm", davanzale: "Alluminio 200mm", prezzo: 395.54, prezzoManuale: null, ivaVano: null, note: "", foto: ["ext_1.jpg", "int_1.jpg"], schizzo: "schizzo_1.png", misureOk: true },
  { id: 2, nome: "PF Cucina", tipo: "PF2A", stanza: "Cucina", piano: "PT", pezzi: 1, l: 1800, h: 2300, sistema: "Aluplast Ideal 4000", colore: "Grigio Antracite", vetro: "Triplo Basso-E", tapparella: false, persiana: true, zanzariera: false, cassonetto: "", controtelaio: "Standard", coprifilo: "Alluminio 70mm", davanzale: "Alluminio 350mm", prezzo: 680.00, prezzoManuale: null, ivaVano: null, note: "Soglia ribassata uscita giardino", foto: ["ext_2.jpg"], schizzo: "schizzo_2.png", misureOk: true },
  { id: 3, nome: "F2 Camera", tipo: "F2A", stanza: "Camera", piano: "1°", pezzi: 2, l: 1000, h: 1200, sistema: "Aluplast Ideal 4000", colore: "Bianco", vetro: "Doppio Basso-E", tapparella: true, persiana: false, zanzariera: true, cassonetto: "Standard", controtelaio: "Nessuno", coprifilo: "PVC 40mm", davanzale: "Alluminio 150mm", prezzo: 285.00, prezzoManuale: null, ivaVano: null, note: "", foto: [], schizzo: null, misureOk: false },
  { id: 4, nome: "VAS Bagno", tipo: "VAS", stanza: "Bagno", piano: "1°", pezzi: 1, l: 600, h: 500, sistema: "Aluplast Ideal 4000", colore: "Bianco", vetro: "Doppio Satinato", tapparella: false, persiana: false, zanzariera: false, cassonetto: "", controtelaio: "Nessuno", coprifilo: "PVC 40mm", davanzale: "", prezzo: 120.00, prezzoManuale: null, ivaVano: null, note: "Vetro satinato privacy", foto: ["ext_4.jpg", "int_4.jpg", "det_4.jpg"], schizzo: null, misureOk: true },
];

const SISTEMI = ["Aluplast Ideal 4000", "Aluplast Ideal 7000", "Aluplast Ideal 8000", "Rehau Euro Design 70", "Rehau Geneo"];
const COLORI = ["Bianco", "Grigio Antracite", "Grigio Quarzo", "Rovere Naturale", "Noce", "Nero Opaco", "Crema", "Corten"];
const VETRI = ["Doppio Standard", "Doppio Basso-E", "Doppio Selettivo", "Triplo Standard", "Triplo Basso-E", "Sicurezza P2A", "Doppio Satinato", "Acustico 42dB"];
const TIPI = ["F1A", "F2A", "F3A", "PF1A", "PF2A", "PF3A", "VAS", "FISSO", "SC2A", "SC3A"];
const CONTROT = ["Nessuno", "Standard", "Monoblocco", "Monoblocco coibentato"];
const CASS = ["", "Standard", "Coibentato", "Monoblocco"];
const DETRAZIONI = [
  { id: "nessuna", l: "Nessuna", perc: 0 },
  { id: "50", l: "Ristrutt. 50%", perc: 50 },
  { id: "65", l: "Ecobonus 65%", perc: 65 },
  { id: "75", l: "Barriere 75%", perc: 75 },
  { id: "110", l: "Superbonus", perc: 110 },
];

export default function PreventivoPageDemo() {
  const [tab, setTab] = useState("preventivo");
  const [vani, setVani] = useState(DEMO_VANI);
  const [vociExtra, setVociExtra] = useState([
    { id: 101, desc: "Posa in opera", importo: 45, qta: 7, iva: 10 },
    { id: 102, desc: "Smaltimento vecchi infissi", importo: 25, qta: 7, iva: 22 },
    { id: 103, desc: "Ponteggio 3° piano", importo: 450, qta: 1, iva: 22 },
  ]);
  const [editId, setEditId] = useState(null);
  const [sconto, setSconto] = useState(10);
  const [ivaDefault, setIvaDefault] = useState(10);
  const [detrazione, setDetrazione] = useState("50");
  const [noteGen, setNoteGen] = useState("Tempi consegna: 45-60 gg lavorativi.\nGaranzia: 10 anni profili e vetrocamere.\nPagamento: 50% alla conferma, saldo a fine lavori.");
  const [addVoce, setAddVoce] = useState(false);
  const [newVoce, setNewVoce] = useState({ desc: "", importo: "", qta: "1", iva: "10" });
  const [sent, setSent] = useState(false);
  const [fotoView, setFotoView] = useState(null);

  const updV = (id, field, val) => setVani(vs => vs.map(v => v.id === id ? { ...v, [field]: val } : v));
  const vanoPrezzo = (v) => (v.prezzoManuale ?? v.prezzo) * v.pezzi;
  const vanoIva = (v) => v.ivaVano ?? ivaDefault;
  const totVaniNetto = vani.reduce((s, v) => s + vanoPrezzo(v), 0);
  const totVociNetto = vociExtra.reduce((s, v) => s + v.importo * v.qta, 0);
  const subtot = totVaniNetto + totVociNetto;
  const scontoVal = subtot * sconto / 100;
  const imponibile = subtot - scontoVal;
  const ivaInfissi = vani.reduce((s, v) => s + vanoPrezzo(v) * (1 - sconto / 100) * (vanoIva(v) / 100), 0);
  const ivaVoci = vociExtra.reduce((s, ve) => s + ve.importo * ve.qta * (1 - sconto / 100) * ((ve.iva || ivaDefault) / 100), 0);
  const totIva = ivaInfissi + ivaVoci;
  const totale = imponibile + totIva;
  const detr = DETRAZIONI.find(d => d.id === detrazione);
  const detraibile = detr && detr.perc > 0 ? imponibile * detr.perc / 100 : 0;
  const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";

  const tabStyle = (t) => ({ flex: 1, padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 700, cursor: "pointer", borderBottom: `2.5px solid ${tab === t ? T.acc : "transparent"}`, color: tab === t ? T.acc : T.sub });
  const inputS = { width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${T.bdr}`, fontSize: 13, fontFamily: "'Inter',sans-serif", boxSizing: "border-box", background: T.card };
  const btnS = (c) => ({ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${c}30`, background: `${c}10`, color: c, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" });
  const chipS = (on) => ({ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", background: on ? T.acc : T.card, color: on ? "#fff" : T.text, border: `1.5px solid ${on ? T.acc : T.bdr}` });
  const Row = ({ l, v, c, bold }) => (<div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}><span style={{ color: c || T.sub }}>{l}</span><span style={{ fontWeight: bold ? 700 : 400, color: c || T.text }}>{v}</span></div>);

  // ══════════ SOPRALLUOGO ══════════
  const renderSopralluogo = () => (
    <div style={{ padding: "0 12px 20px" }}>
      <div style={{ padding: 14, background: `${T.blue}10`, borderRadius: 12, marginBottom: 14, border: `1px solid ${T.blue}20` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.blue }}>📋 Report Sopralluogo</div>
          <div style={{ fontSize: 10, color: T.sub, background: T.card, padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>R1 · 01/03/2026</div>
        </div>
        <div style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>Marco Ferraro · Via dei Mille 33, Rende</div>
        <div style={{ fontSize: 10, color: T.sub2, marginTop: 2 }}>Rilevatore: Fabio · 09:30</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
        {[{ l: "Vani", v: vani.length, c: T.acc }, { l: "Pezzi", v: vani.reduce((s, v) => s + v.pezzi, 0), c: T.blue }, { l: "Foto", v: vani.reduce((s, v) => s + v.foto.length, 0), c: T.grn }, { l: "⚠️", v: vani.filter(v => !v.misureOk).length, c: T.red }].map((s, i) => (
          <div key={i} style={{ background: T.card, borderRadius: 10, padding: "10px 6px", textAlign: "center", border: `1px solid ${T.bdr}` }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: T.sub }}>{s.l}</div>
          </div>
        ))}
      </div>
      {vani.map(v => (
        <div key={v.id} style={{ background: T.card, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${T.bdr}`, borderLeft: `4px solid ${v.misureOk ? T.grn : T.orange}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{v.nome}</div>
              <div style={{ fontSize: 10, color: T.sub }}>{v.tipo} · {v.stanza} · {v.piano} · {v.pezzi}pz</div>
            </div>
            <span style={{ fontSize: 10, background: v.misureOk ? `${T.grn}15` : `${T.red}15`, color: v.misureOk ? T.grn : T.red, padding: "3px 8px", borderRadius: 6, fontWeight: 700, height: "fit-content" }}>{v.misureOk ? "✅ OK" : "⚠️"}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
            {[{ l: "Larg.", v: v.l }, { l: "Alt.", v: v.h }, { l: "mq", v: ((v.l * v.h) / 1000000).toFixed(2) }].map((m, mi) => (
              <div key={mi} style={{ background: T.bg, borderRadius: 8, padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: T.sub }}>{m.l}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: mi === 2 ? T.acc : T.text }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.8 }}>
            🏗 {v.sistema} · 🎨 {v.colore} · 🪟 {v.vetro}
            {v.controtelaio !== "Nessuno" && ` · 🔲 ${v.controtelaio}`}
            {v.tapparella && " · Tapp."}{v.persiana && " · Pers."}{v.zanzariera && " · Zanz."}
            {v.cassonetto && ` · Cass: ${v.cassonetto}`}
          </div>
          {v.note && <div style={{ fontSize: 11, color: T.orange, fontWeight: 600, marginTop: 4 }}>📌 {v.note}</div>}
          {(v.foto.length > 0 || v.schizzo) && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
              {v.foto.map((f, fi) => (
                <div key={fi} onClick={() => setFotoView({ vano: v.nome, file: f })} style={{ minWidth: 64, height: 64, borderRadius: 8, background: `${T.blue}10`, border: `1px solid ${T.blue}25`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ fontSize: 22 }}>📷</span><span style={{ fontSize: 7, color: T.blue }}>{f}</span>
                </div>
              ))}
              {v.schizzo && (
                <div onClick={() => setFotoView({ vano: v.nome, file: v.schizzo })} style={{ minWidth: 64, height: 64, borderRadius: 8, background: `${T.purple}10`, border: `1px solid ${T.purple}25`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ fontSize: 22 }}>✏️</span><span style={{ fontSize: 7, color: T.purple }}>Schizzo</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ══════════ PREVENTIVO ══════════
  const renderPreventivo = () => (
    <div style={{ padding: "0 12px 20px" }}>
      {/* Pratica fiscale */}
      <div style={{ background: T.card, borderRadius: 12, padding: 12, marginBottom: 8, border: `1px solid ${T.bdr}` }}>
        <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>🏛 Pratica fiscale</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {DETRAZIONI.map(d => (
            <div key={d.id} onClick={() => setDetrazione(d.id)} style={{
              padding: "7px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: "pointer",
              background: detrazione === d.id ? (d.perc > 0 ? `${T.grn}15` : T.bg) : T.bg,
              color: detrazione === d.id ? (d.perc > 0 ? T.grn : T.text) : T.sub,
              border: `1.5px solid ${detrazione === d.id ? (d.perc > 0 ? T.grn : T.bdr) : T.bdr}`,
            }}>{d.l}</div>
          ))}
        </div>
      </div>

      {/* IVA + Sconto */}
      <div style={{ background: T.card, borderRadius: 12, padding: 12, marginBottom: 8, border: `1px solid ${T.bdr}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, flex: 1 }}>IVA Infissi</span>
          {[4, 10, 22].map(iv => (<div key={iv} onClick={() => setIvaDefault(iv)} style={chipS(ivaDefault === iv)}>{iv}%</div>))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, flex: 1 }}>Sconto</span>
          {[0, 5, 10, 15, 20].map(s => (<div key={s} onClick={() => setSconto(s)} style={chipS(sconto === s)}>{s === 0 ? "No" : s + "%"}</div>))}
        </div>
      </div>

      {/* Vani */}
      {vani.map((v, i) => {
        const isEdit = editId === v.id;
        const pUnit = v.prezzoManuale ?? v.prezzo;
        const pTot = pUnit * v.pezzi;
        return (
          <div key={v.id} style={{ background: T.card, borderRadius: 12, marginBottom: 6, border: `1.5px solid ${isEdit ? T.acc : T.bdr}`, overflow: "hidden" }}>
            <div onClick={() => setEditId(isEdit ? null : v.id)} style={{ display: "flex", alignItems: "center", padding: 12, cursor: "pointer", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${T.acc}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: T.acc, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.nome} <span style={{ fontWeight: 400, color: T.sub, fontSize: 10 }}>{v.tipo} · {v.pezzi}pz</span></div>
                <div style={{ fontSize: 10, color: T.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.l}×{v.h} · {v.colore}{v.controtelaio !== "Nessuno" ? ` · CT` : ""}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: T.acc }}>€{fmt(pTot)}</div>
                {v.pezzi > 1 && <div style={{ fontSize: 9, color: T.sub }}>€{fmt(pUnit)}/pz</div>}
              </div>
              <span style={{ fontSize: 12, color: T.sub, transform: isEdit ? "rotate(180deg)" : "", transition: "0.2s" }}>▾</span>
            </div>
            {isEdit && (
              <div style={{ padding: "0 12px 14px", borderTop: `1px solid ${T.bdr}` }}>
                {/* Foto review */}
                {(v.foto.length > 0 || v.schizzo) && (
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>📷 FOTO E SCHIZZI</div>
                    <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                      {v.foto.map((f, fi) => (<div key={fi} style={{ minWidth: 68, height: 68, borderRadius: 8, background: `${T.blue}08`, border: `1px solid ${T.blue}20`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 22 }}>📷</span><span style={{ fontSize: 7, color: T.blue }}>{f}</span></div>))}
                      {v.schizzo && (<div style={{ minWidth: 68, height: 68, borderRadius: 8, background: `${T.purple}08`, border: `1px solid ${T.purple}20`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 22 }}>✏️</span><span style={{ fontSize: 7, color: T.purple }}>Schizzo</span></div>)}
                      <div style={{ minWidth: 68, height: 68, borderRadius: 8, border: `2px dashed ${T.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: T.sub2, flexShrink: 0 }}>+</div>
                    </div>
                  </div>
                )}
                {/* Tipo + Nome + Pezzi */}
                <div style={{ display: "flex", gap: 6, marginTop: v.foto.length === 0 && !v.schizzo ? 10 : 0, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Tipo</div><select value={v.tipo} onChange={e => updV(v.id, "tipo", e.target.value)} style={inputS}>{TIPI.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div style={{ flex: 2 }}><div style={{ fontSize: 9, color: T.sub2 }}>Nome</div><input value={v.nome} onChange={e => updV(v.id, "nome", e.target.value)} style={inputS} /></div>
                  <div style={{ width: 50 }}><div style={{ fontSize: 9, color: T.sub2 }}>Pz</div><input type="number" value={v.pezzi} onChange={e => updV(v.id, "pezzi", Math.max(1, parseInt(e.target.value) || 1))} style={inputS} /></div>
                </div>
                {/* Misure */}
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Larg. mm</div><input type="number" value={v.l} onChange={e => updV(v.id, "l", parseInt(e.target.value) || 0)} style={inputS} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Alt. mm</div><input type="number" value={v.h} onChange={e => updV(v.id, "h", parseInt(e.target.value) || 0)} style={inputS} /></div>
                </div>
                {/* Sistema + Colore + Vetro */}
                <div style={{ marginBottom: 6 }}><div style={{ fontSize: 9, color: T.sub2 }}>Sistema</div><select value={v.sistema} onChange={e => updV(v.id, "sistema", e.target.value)} style={inputS}>{SISTEMI.map(s => <option key={s}>{s}</option>)}</select></div>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Colore</div><select value={v.colore} onChange={e => updV(v.id, "colore", e.target.value)} style={inputS}>{COLORI.map(c => <option key={c}>{c}</option>)}</select></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Vetro</div><select value={v.vetro} onChange={e => updV(v.id, "vetro", e.target.value)} style={inputS}>{VETRI.map(vt => <option key={vt}>{vt}</option>)}</select></div>
                </div>
                {/* Controtelaio */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>🔲 CONTROTELAIO</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {CONTROT.map(ct => (<div key={ct} onClick={() => updV(v.id, "controtelaio", ct)} style={{ padding: "7px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: "pointer", background: v.controtelaio === ct ? `${T.acc}15` : T.bg, color: v.controtelaio === ct ? T.acc : T.sub, border: `1.5px solid ${v.controtelaio === ct ? T.acc : T.bdr}` }}>{ct}</div>))}
                  </div>
                </div>
                {/* Accessori */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                  {[{ k: "tapparella", l: "🪟 Tapparella" }, { k: "persiana", l: "🏠 Persiana" }, { k: "zanzariera", l: "🦟 Zanzariera" }].map(a => (
                    <div key={a.k} onClick={() => updV(v.id, a.k, !v[a.k])} style={{ padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: v[a.k] ? `${T.acc}15` : T.bg, color: v[a.k] ? T.acc : T.sub, border: `1.5px solid ${v[a.k] ? T.acc : T.bdr}` }}>{a.l}</div>
                  ))}
                </div>
                {/* Cassonetto + Coprifilo */}
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Cassonetto</div><select value={v.cassonetto || ""} onChange={e => updV(v.id, "cassonetto", e.target.value)} style={inputS}>{CASS.map(c => <option key={c} value={c}>{c || "Nessuno"}</option>)}</select></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Coprifilo</div><select value={v.coprifilo || ""} onChange={e => updV(v.id, "coprifilo", e.target.value)} style={inputS}><option value="">Nessuno</option><option>PVC 40mm</option><option>PVC 60mm</option><option>Alluminio 60mm</option><option>Alluminio 70mm</option></select></div>
                </div>
                {/* Prezzo */}
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginBottom: 6 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Listino</div><div style={{ padding: 10, background: T.bg, borderRadius: 8, fontSize: 13, fontWeight: 700, color: T.sub }}>€{fmt(v.prezzo)}</div></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 9, color: T.sub2 }}>Override €</div><input type="number" placeholder={String(v.prezzo)} value={v.prezzoManuale ?? ""} onChange={e => updV(v.id, "prezzoManuale", e.target.value ? parseFloat(e.target.value) : null)} style={{ ...inputS, fontWeight: 800, color: T.acc }} /></div>
                  <div style={{ width: 50 }}><div style={{ fontSize: 9, color: T.sub2 }}>IVA</div><select value={vanoIva(v)} onChange={e => updV(v.id, "ivaVano", parseInt(e.target.value))} style={inputS}><option value={4}>4%</option><option value={10}>10%</option><option value={22}>22%</option></select></div>
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: T.sub, marginBottom: 8 }}>× {v.pezzi}pz = <span style={{ fontSize: 16, fontWeight: 900, color: T.acc }}>€{fmt(pTot)}</span></div>
                <input placeholder="Note vano..." value={v.note} onChange={e => updV(v.id, "note", e.target.value)} style={{ ...inputS, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { const cl = { ...v, id: Date.now(), nome: v.nome + " (copia)" }; setVani(vs => [...vs.slice(0, i + 1), cl, ...vs.slice(i + 1)]); setEditId(cl.id); }} style={btnS(T.blue)}>📋 Duplica</button>
                  <button onClick={() => { if (confirm("Elimina?")) { setVani(vs => vs.filter(x => x.id !== v.id)); setEditId(null); } }} style={btnS(T.red)}>🗑 Elimina</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div onClick={() => { const nv = { id: Date.now(), nome: `Vano ${vani.length + 1}`, tipo: "F2A", stanza: "", piano: "PT", pezzi: 1, l: 0, h: 0, sistema: SISTEMI[0], colore: COLORI[0], vetro: VETRI[1], tapparella: false, persiana: false, zanzariera: false, cassonetto: "", controtelaio: "Nessuno", coprifilo: "", davanzale: "", prezzo: 0, prezzoManuale: null, ivaVano: null, note: "", foto: [], schizzo: null, misureOk: false }; setVani(vs => [...vs, nv]); setEditId(nv.id); }} style={{ padding: 14, textAlign: "center", borderRadius: 12, border: `2px dashed ${T.acc}40`, color: T.acc, fontSize: 13, fontWeight: 800, cursor: "pointer", marginBottom: 14, background: `${T.acc}05` }}>+ Aggiungi vano</div>

      {/* Voci extra */}
      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>📎 Voci extra</div>
      {vociExtra.map(ve => (
        <div key={ve.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: 10, background: T.card, borderRadius: 10, marginBottom: 4, border: `1px solid ${T.bdr}` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ve.desc}</div>
            <div style={{ fontSize: 9, color: T.sub }}>€{ve.importo} × {ve.qta} · IVA {ve.iva}%</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.acc, flexShrink: 0 }}>€{fmt(ve.importo * ve.qta)}</div>
          <div onClick={() => setVociExtra(vs => vs.filter(x => x.id !== ve.id))} style={{ fontSize: 16, color: T.red, cursor: "pointer", padding: "0 4px" }}>✕</div>
        </div>
      ))}
      {addVoce ? (
        <div style={{ background: T.bg, borderRadius: 10, padding: 10, marginBottom: 8, border: `1px solid ${T.bdr}` }}>
          <input placeholder="Descrizione" value={newVoce.desc} onChange={e => setNewVoce(p => ({ ...p, desc: e.target.value }))} style={{ ...inputS, marginBottom: 4 }} />
          <div style={{ display: "flex", gap: 4 }}>
            <input type="number" placeholder="€" value={newVoce.importo} onChange={e => setNewVoce(p => ({ ...p, importo: e.target.value }))} style={{ ...inputS, flex: 2 }} />
            <input type="number" placeholder="Qt" value={newVoce.qta} onChange={e => setNewVoce(p => ({ ...p, qta: e.target.value }))} style={{ ...inputS, flex: 1 }} />
            <select value={newVoce.iva} onChange={e => setNewVoce(p => ({ ...p, iva: e.target.value }))} style={{ ...inputS, flex: 1 }}><option value="4">4%</option><option value="10">10%</option><option value="22">22%</option></select>
            <button onClick={() => { if (!newVoce.desc || !newVoce.importo) return; setVociExtra(vs => [...vs, { id: Date.now(), desc: newVoce.desc, importo: parseFloat(newVoce.importo) || 0, qta: parseInt(newVoce.qta) || 1, iva: parseInt(newVoce.iva) || 10 }]); setNewVoce({ desc: "", importo: "", qta: "1", iva: "10" }); setAddVoce(false); }} style={{ ...btnS(T.grn), flex: "none", padding: "10px 14px" }}>✓</button>
          </div>
        </div>
      ) : (<div onClick={() => setAddVoce(true)} style={{ padding: 12, textAlign: "center", fontSize: 12, color: T.acc, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>+ Aggiungi voce</div>)}

      <textarea value={noteGen} onChange={e => setNoteGen(e.target.value)} rows={3} placeholder="Condizioni, tempi, garanzie..." style={{ ...inputS, resize: "vertical", lineHeight: 1.5 }} />
    </div>
  );

  // ══════════ RIEPILOGO ══════════
  const renderRiepilogo = () => (
    <div style={{ padding: "0 12px 20px" }}>
      <div style={{ background: T.topbar, borderRadius: 12, padding: 16, marginBottom: 12, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 10, color: "#ffffff60" }}>PREVENTIVO</div><div style={{ fontSize: 26, fontWeight: 900, marginTop: 2 }}>€{fmt(totale)}</div></div>
          {detr && detr.perc > 0 && (<div style={{ background: `${T.grn}30`, borderRadius: 8, padding: "6px 10px", textAlign: "right" }}><div style={{ fontSize: 9, color: "#ffffffa0" }}>{detr.l}</div><div style={{ fontSize: 14, fontWeight: 900, color: "#4ade80" }}>-€{fmt(detraibile)}</div></div>)}
        </div>
        <div style={{ fontSize: 10, color: "#ffffff60", marginTop: 6 }}>S-0007 · Marco Ferraro · {vani.length} vani · {vani.reduce((s, v) => s + v.pezzi, 0)}pz</div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>INFISSI</div>
      {vani.map(v => (
        <div key={v.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bdr}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ fontWeight: 700 }}>{v.nome}</span>
            <span style={{ fontWeight: 800, color: T.acc }}>€{fmt(vanoPrezzo(v))}</span>
          </div>
          <div style={{ fontSize: 9, color: T.sub }}>{v.tipo} · {v.l}×{v.h} · {v.pezzi}pz · {v.colore} · {v.vetro}{v.controtelaio !== "Nessuno" ? ` · CT: ${v.controtelaio}` : ""}{v.tapparella ? " · Tapp." : ""}{v.persiana ? " · Pers." : ""}{vanoIva(v) !== ivaDefault ? ` · IVA ${vanoIva(v)}%` : ""}</div>
        </div>
      ))}

      {vociExtra.length > 0 && (<><div style={{ fontSize: 11, fontWeight: 800, marginTop: 12, marginBottom: 6 }}>LAVORI</div>
        {vociExtra.map(ve => (<div key={ve.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.bdr}`, fontSize: 11 }}><span>{ve.desc} <span style={{ color: T.sub, fontSize: 9 }}>×{ve.qta} · IVA {ve.iva}%</span></span><span style={{ fontWeight: 700 }}>€{fmt(ve.importo * ve.qta)}</span></div>))}</>)}

      <div style={{ background: T.card, borderRadius: 12, padding: 14, marginTop: 14, border: `1px solid ${T.bdr}` }}>
        <Row l="Subtotale" v={`€${fmt(subtot)}`} />
        {sconto > 0 && <Row l={`Sconto ${sconto}%`} v={`-€${fmt(scontoVal)}`} c={T.grn} />}
        <Row l="Imponibile" v={`€${fmt(imponibile)}`} bold />
        <Row l="IVA (mista)" v={`€${fmt(totIva)}`} />
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${T.acc}`, paddingTop: 8, marginTop: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 900 }}>TOTALE</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: T.acc }}>€{fmt(totale)}</span>
        </div>
        {detr && detr.perc > 0 && (<>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "8px 10px", background: `${T.grn}10`, borderRadius: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.grn }}>🏛 {detr.l}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: T.grn }}>-€{fmt(detraibile)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700 }}>Costo effettivo</span>
            <span style={{ fontSize: 16, fontWeight: 900 }}>€{fmt(totale - detraibile)}</span>
          </div>
        </>)}
      </div>

      {noteGen && (<div style={{ marginTop: 12, padding: 12, background: T.bg, borderRadius: 10, fontSize: 10, color: T.sub, lineHeight: 1.6, whiteSpace: "pre-wrap" }}><div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>NOTE E CONDIZIONI</div>{noteGen}</div>)}

      <div style={{ marginTop: 16, display: "flex", gap: 8, marginBottom: 8 }}>
        <button style={{ flex: 1, padding: 14, borderRadius: 10, background: `${T.acc}10`, color: T.acc, border: `1.5px solid ${T.acc}`, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>📄 PDF</button>
        <button style={{ flex: 1, padding: 14, borderRadius: 10, background: T.card, color: T.sub, border: `1.5px solid ${T.bdr}`, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>👁 Anteprima</button>
      </div>
      <button onClick={() => { setSent(true); setTimeout(() => setSent(false), 3000); }} style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", background: sent ? "#34c759" : "#25d366", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>{sent ? "✅ Inviato!" : "📤 INVIA AL CLIENTE →"}</button>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
        <span style={{ fontSize: 10, color: T.sub, cursor: "pointer", textDecoration: "underline" }}>📧 Email</span>
        <span style={{ fontSize: 10, color: T.sub, cursor: "pointer", textDecoration: "underline" }}>✅ Segna completato</span>
      </div>
    </div>
  );

  // Foto modal
  const fotoModal = fotoView && (
    <div onClick={() => setFotoView(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontSize: 80 }}>📷</div>
      <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 12 }}>{fotoView.vano} — {fotoView.file}</div>
      <div style={{ color: "#ffffff80", fontSize: 11, marginTop: 4 }}>Tap per chiudere</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: T.bg, minHeight: "100vh", fontFamily: "'Inter',sans-serif", WebkitFontSmoothing: "antialiased" }}>
      {fotoModal}
      <div style={{ background: T.topbar, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 18, cursor: "pointer", color: "#fff" }}>←</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>S-0007 · Marco Ferraro</div>
          <div style={{ fontSize: 10, color: "#ffffff60" }}>Via dei Mille 33, Rende</div>
        </div>
        <div style={{ background: T.acc, padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0 }}>€{fmt(totale)}</div>
      </div>
      <div style={{ display: "flex", background: T.card, borderBottom: `1px solid ${T.bdr}`, position: "sticky", top: 52, zIndex: 10 }}>
        <div onClick={() => setTab("sopralluogo")} style={tabStyle("sopralluogo")}>🔍 Sopralluogo</div>
        <div onClick={() => setTab("preventivo")} style={tabStyle("preventivo")}>📋 Preventivo</div>
        <div onClick={() => setTab("riepilogo")} style={tabStyle("riepilogo")}>📊 Riepilogo</div>
      </div>
      <div style={{ paddingTop: 12, paddingBottom: 40 }}>
        {tab === "sopralluogo" && renderSopralluogo()}
        {tab === "preventivo" && renderPreventivo()}
        {tab === "riepilogo" && renderRiepilogo()}
      </div>
    </div>
  );
}
