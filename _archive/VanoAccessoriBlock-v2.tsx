// ═══════════════════════════════════════════════════════════
// MASTRO ERP — VanoAccessoriBlock v2.0
// Blocco accessori espanso: 8 categorie con campi da catalogo
// 
// ISTRUZIONI INTEGRAZIONE:
// 1. Importa i cataloghi da mastro-accessori-config
// 2. Sostituisci il blocco accessori in VanoDetailPanel (righe ~1046-1206)
// 3. Aggiungi i nuovi useState in MastroContext/MastroERP
// ═══════════════════════════════════════════════════════════

// NUOVI STATE DA AGGIUNGERE IN MastroERP.tsx:
// const [zanzModelliDB, setZanzModelliDB] = useState(ZANZ_MODELLI_INIT);
// const [zanzRetiDB, setZanzRetiDB] = useState(ZANZ_RETI);
// const [cassModelliDB, setCassModelliDB] = useState(CASS_MODELLI_INIT);
// const [cassIspezioneDB, setCassIspezioneDB] = useState(CASS_ISPEZIONE);
// const [cassTappoDB, setCassTappoDB] = useState(CASS_TAPPO);
// const [cassSpallDB, setCassSpallDB] = useState(CASS_SPALLE);
// const [tdSoleModelliDB, setTdSoleModelliDB] = useState(TDSOLE_MODELLI_INIT);
// const [tdSoleMontaggioDB, setTdSoleMontaggioDB] = useState(TDSOLE_MONTAGGIO);
// const [tdSoleComandoDB, setTdSoleComandoDB] = useState(TDSOLE_COMANDO);
// const [tdIntCategorieDB, setTdIntCategorieDB] = useState(TDINT_CATEGORIE);
// const [tdIntTessutoDB, setTdIntTessutoDB] = useState(TDINT_TESSUTO);
// const [tdIntMontaggioDB, setTdIntMontaggioDB] = useState(TDINT_MONTAGGIO);
// const [tdIntFinituraDB, setTdIntFinituraDB] = useState(TDINT_FINITURA);
// const [bxDocCategorieDB, setBxDocCategorieDB] = useState(BXDOC_CATEGORIE);
// const [bxDocAperturaDB, setBxDocAperturaDB] = useState(BXDOC_APERTURA);
// const [bxDocVetroDB, setBxDocVetroDB] = useState(BXDOC_VETRO);
// const [bxDocProfiloDB, setBxDocProfiloDB] = useState(BXDOC_PROFILO);
// const [cancSistemaDB, setCancSistemaDB] = useState(CANC_SISTEMA);
// const [cancAutoDB, setCancAutoDB] = useState(CANC_AUTOMAZIONE);

// ─── HELPER: Chip selector riutilizzabile ────────────────
const ChipSelect = ({ items, value, onChange, color, T }) => (
  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
    {items.map(item => {
      const code = typeof item === "string" ? item : item.code;
      const isOn = value === code;
      return (
        <div key={code} onClick={() => onChange(code)} style={{
          padding: "6px 12px", borderRadius: 8,
          border: `1px solid ${isOn ? color : T.bdr}`,
          background: isOn ? color + "18" : T.card,
          fontSize: 12, cursor: "pointer",
          fontWeight: isOn ? 700 : 400,
          color: isOn ? color : T.text,
        }}>{code}</div>
      );
    })}
  </div>
);

// ─── HELPER: Input misura con unità ──────────────────────
const MisuraInput = ({ id, label, value, onChange, onNext, unit = "mm", color, T, FM }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input id={id} style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }}
        type="number" inputMode="numeric" enterKeyHint={onNext ? "next" : "done"}
        placeholder="" value={value || ""} onChange={e => onChange(parseInt(e.target.value) || 0)}
        onKeyDown={e => { if (e.key === "Enter" && onNext) { e.preventDefault(); onNext(); }}} />
      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>{unit}</span>
      {onNext && <div onClick={onNext} style={{ padding: "8px 12px", borderRadius: 8, background: color, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>→</div>}
    </div>
  </div>
);

// ─── HELPER: Select dropdown ─────────────────────────────
const SelectField = ({ label, value, onChange, options, T, FF }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
    <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF }}
      value={value || ""} onChange={e => onChange(e.target.value)}>
      <option value="">— Seleziona —</option>
      {options.map(o => <option key={o.id || o.code || o} value={o.code || o}>{o.code || o}{o.nome ? ` — ${o.nome}` : ""}</option>)}
    </select>
  </div>
);

// ─── HELPER: Section label ───────────────────────────────
const SectionLabel = ({ text, T }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>{text}</div>
);

// ═══════════════════════════════════════════════════════════
// BLOCCO COMPLETO ACCESSORI — Sostituisci righe ~1046-1206
// in VanoDetailPanel.tsx
// ═══════════════════════════════════════════════════════════

/*
INIZIO BLOCCO — Copia da qui
Il codice sotto va dentro il step "dettagli" del VanoDetailPanel,
dopo la sezione spallette/davanzale e prima di "Voci libere".
Richiede: v (vano), m (misure), T, S, FM, FF,
updateAccessorio, toggleAccessorio, updateVanoField, updateMisura,
+ tutti i DB state dal context
*/

// ─── ACCESSORI TOGGLE HEADER ─────────────────────────────

const ACCESSORI_LISTA = [
  // Esistenti (arricchiti)
  { key: "tapparella",    icon: "🪟", label: "Tapparella",       color: "#ff9500", settore: "tapparelle" },
  { key: "persiana",      icon: "🏠", label: "Persiana",         color: "#007aff", settore: "persiane" },
  { key: "zanzariera",    icon: "🦟", label: "Zanzariera",       color: "#ff2d55", settore: "zanzariere" },
  { key: "cassonetto",    icon: "🧊", label: "Cassonetto",       color: "#b45309", settore: "tapparelle" },
  // Nuovi
  { key: "tenda_sole",    icon: "☀️", label: "Tenda da sole",     color: "#f59e0b", settore: "tende" },
  { key: "tenda_interna", icon: "🪞", label: "Tenda da interno",  color: "#8b5cf6", settore: "tendeinterne" },
  { key: "box_doccia",    icon: "🚿", label: "Box doccia",        color: "#06b6d4", settore: "boxdoccia" },
  { key: "cancello",      icon: "🚧", label: "Cancello/Recinzione",color: "#64748b", settore: "cancelli" },
];

// Filtra per settori attivi dell'azienda
// const accessoriFiltrati = ACCESSORI_LISTA.filter(a => settoriAttivi.includes(a.settore));

// ═══════════════════════════════════════════════════════════
// RENDER PER OGNI ACCESSORIO — Campi specifici
// ═══════════════════════════════════════════════════════════

// ─── 1. TAPPARELLA (invariato rispetto a v1) ─────────────
// Campi: L, H, materiale (PVC/Alluminio/Acciaio/Legno),
//        motorizzata (Sì/No), tipo misura, colore

// ─── 2. PERSIANA (invariato rispetto a v1) ───────────────
// Campi: L, H, telaio (telaiPersianaDB), posizionamento (posPersianaDB),
//        tipo misura, colore

// ─── 3. ZANZARIERA (ARRICCHITA) ─────────────────────────
// PRIMA: solo L, H, tipo misura, colore
// ORA aggiunge: categoria, modello, lato apertura, tipo rete, profondità telaio
//
// Esempio di render (pseudocodice React):
//
// {acc === "zanzariera" && a.attivo && (
//   <>
//     {/* CATEGORIA */}
//     <SectionLabel text="Categoria" />
//     <ChipSelect items={ZANZ_CATEGORIE} value={a.categoria} 
//       onChange={val => updateAccessorio(v.id, "zanzariera", "categoria", val)} color="#ff2d55" />
//
//     {/* MODELLO — filtrato per categoria */}
//     <SectionLabel text="Modello" />
//     <SelectField label="" value={a.modello}
//       onChange={val => updateAccessorio(v.id, "zanzariera", "modello", val)}
//       options={zanzModelliDB.filter(m => !a.categoria || m.cat === a.categoria)} />
//
//     {/* DIMENSIONI L × H */}
//     <MisuraInput label="Larghezza luce vano" value={a.l} ... />
//     <MisuraInput label="Altezza luce vano" value={a.h} ... />
//
//     {/* VALIDAZIONE DIMENSIONI vs modello selezionato */}
//     {a.modello && (() => {
//       const mod = zanzModelliDB.find(m => m.code === a.modello);
//       if (!mod) return null;
//       const warnL = a.l && (a.l < mod.lMin || a.l > mod.lMax);
//       const warnH = a.h && (a.h < mod.hMin || a.h > mod.hMax);
//       return (warnL || warnH) ? (
//         <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: "#991b1b" }}>
//           ⚠️ Fuori range per {a.modello}:
//           {warnL && ` L: ${mod.lMin}-${mod.lMax}mm`}
//           {warnH && ` H: ${mod.hMin}-${mod.hMax}mm`}
//         </div>
//       ) : null;
//     })()}
//
//     {/* PROFONDITÀ TELAIO (per incasso) */}
//     {a.categoria === "incas" && (
//       <MisuraInput label="Profondità telaio" value={a.profTelaio} ... />
//     )}
//
//     {/* LATO APERTURA */}
//     <SectionLabel text="Lato apertura" />
//     <ChipSelect items={["DX","SX","Centrale","Alto"]} value={a.latoApertura} ... />
//
//     {/* TIPO RETE */}
//     <SectionLabel text="Tipo rete" />
//     <ChipSelect items={zanzRetiDB} value={a.tipoRete} ... />
//
//     {/* TIPO MISURA + COLORE (esistenti) */}
//   </>
// )}

// ─── 4. CASSONETTO (ARRICCHITO) ─────────────────────────
// PRIMA: tipo (tipoCassonettoDB), L, H, P, cielino L/P
// ORA aggiunge: modello (Ferraro), ispezione, tappo, spalle
//
// {v.cassonetto && (
//   <>
//     {/* MODELLO CASSONETTO (da catalogo Ferraro) */}
//     <SectionLabel text="Modello" />
//     <SelectField value={v.casModello}
//       onChange={val => {
//         updateVanoField(v.id, "casModello", val);
//         // Auto-fill dimensioni standard se disponibili
//         const mod = cassModelliDB.find(m => m.code === val);
//         if (mod?.hStd) updateMisura(v.id, "casH", mod.hStd);
//         if (mod?.pStd) updateMisura(v.id, "casP", mod.pStd);
//       }}
//       options={cassModelliDB} />
//
//     {/* TIPO CASSONETTO (esistente) */}
//     <SectionLabel text="Tipo" />
//     <ChipSelect items={tipoCassonettoDB} value={v.casTipo} ... />
//
//     {/* DIMENSIONI (esistenti) */}
//     L, H, P, Cielino L, Cielino P
//
//     {/* ISPEZIONE (NUOVO) */}
//     <SectionLabel text="Tipo ispezione" />
//     <ChipSelect items={cassIspezioneDB} value={v.casIspezione} ... />
//
//     {/* TAPPO (NUOVO) */}
//     <SectionLabel text="Tipo tappo" />
//     <ChipSelect items={cassTappoDB} value={v.casTappo} ... />
//
//     {/* SPALLE (NUOVO) */}
//     <SectionLabel text="Spalle coibentate" />
//     <ChipSelect items={cassSpallDB} value={v.casSpalle} ... />
//   </>
// )}

// ─── 5. TENDA DA SOLE (NUOVO) ───────────────────────────
// Campi: categoria, modello, larghezza, sporgenza/proiezione,
//        altezza installazione, montaggio, comando, colore telo
//
// {acc === "tenda_sole" && a.attivo && (
//   <>
//     <SectionLabel text="Tipo" />
//     <ChipSelect items={TDSOLE_CATEGORIE} value={a.categoria} ... />
//
//     <SectionLabel text="Modello" />
//     <SelectField value={a.modello}
//       options={tdSoleModelliDB.filter(m => !a.categoria || m.cat === a.categoria)} ... />
//
//     <MisuraInput label="Larghezza totale" value={a.larghezza} ... />
//     <MisuraInput label="Sporgenza / Proiezione" value={a.sporgenza} ... />
//     <MisuraInput label="Altezza installazione da terra" value={a.altezzaInst} ... />
//
//     {/* VALIDAZIONE DIMENSIONI vs modello */}
//     {a.modello && (() => {
//       const mod = tdSoleModelliDB.find(m => m.code === a.modello);
//       if (!mod) return null;
//       const warnL = a.larghezza && (a.larghezza < mod.lMin || a.larghezza > mod.lMax);
//       const warnS = a.sporgenza && mod.spMax > 0 && (a.sporgenza < mod.spMin || a.sporgenza > mod.spMax);
//       return (warnL || warnS) ? <WarningBox ... /> : null;
//     })()}
//
//     <SectionLabel text="Montaggio" />
//     <ChipSelect items={tdSoleMontaggioDB} value={a.montaggio} ... />
//
//     <SectionLabel text="Comando" />
//     <ChipSelect items={tdSoleComandoDB} value={a.comando} ... />
//
//     <SectionLabel text="Colore telo" />
//     <input placeholder="Es. Bianco, Righe giallo/bianco..." ... />
//
//     <SectionLabel text="Colore struttura" />
//     <SelectField options={coloriDB} value={a.colore} ... />
//   </>
// )}

// ─── 6. TENDA DA INTERNO (NUOVO) ────────────────────────
// Campi: categoria, larghezza, altezza, profondità telaio,
//        montaggio, tessuto, finitura, lato comando, colore
//
// {acc === "tenda_interna" && a.attivo && (
//   <>
//     <SectionLabel text="Tipo tenda" />
//     <ChipSelect items={tdIntCategorieDB} value={a.categoria} ... />
//
//     <MisuraInput label="Larghezza finestra/vano" value={a.larghezza} ... />
//     <MisuraInput label="Altezza finestra/vano" value={a.altezza} ... />
//
//     {/* Profondità telaio solo per montaggio a vetro */}
//     {(a.montaggio === "A vetro (senza fori)" || a.montaggio === "Al telaio finestra") && (
//       <MisuraInput label="Profondità telaio finestra" value={a.profTelaio} ... />
//     )}
//
//     <SectionLabel text="Montaggio" />
//     <ChipSelect items={tdIntMontaggioDB} value={a.montaggio} ... />
//
//     <SectionLabel text="Tessuto" />
//     <ChipSelect items={tdIntTessutoDB} value={a.tessuto} ... />
//
//     {/* Finitura solo per bastone/binario */}
//     {(a.categoria === "bastone" || a.categoria === "binario" || a.categoria === "doppiobin") && (
//       <>
//         <SectionLabel text="Finitura" />
//         <ChipSelect items={tdIntFinituraDB} value={a.finitura} ... />
//       </>
//     )}
//
//     <SectionLabel text="Lato comando" />
//     <ChipSelect items={["DX","SX"]} value={a.latoComando} ... />
//
//     <SectionLabel text="Colore" />
//     <input placeholder="Es. Bianco, Grigio perla, Legno noce..." ... />
//   </>
// )}

// ─── 7. BOX DOCCIA (NUOVO) ──────────────────────────────
// Campi: tipo configurazione, larghezza, profondità, altezza,
//        tipo apertura, vetro, profilo
//
// {acc === "box_doccia" && a.attivo && (
//   <>
//     <SectionLabel text="Configurazione" />
//     <ChipSelect items={bxDocCategorieDB} value={a.tipo} ... />
//
//     <MisuraInput label="Larghezza apertura" value={a.larghezza} ... />
//
//     {/* Profondità solo per angolare/semicircolare/pentagonale */}
//     {["angolare","semicir","pentag"].includes(a.tipo) && (
//       <MisuraInput label="Profondità" value={a.profondita} ... />
//     )}
//
//     <MisuraInput label="Altezza box" value={a.altezza} ... />
//
//     <SectionLabel text="Tipo apertura" />
//     <ChipSelect items={bxDocAperturaDB} value={a.apertura} ... />
//
//     <SectionLabel text="Vetro" />
//     <ChipSelect items={bxDocVetroDB} value={a.vetro} ... />
//
//     <SectionLabel text="Profilo" />
//     <ChipSelect items={bxDocProfiloDB} value={a.profilo} ... />
//   </>
// )}

// ─── 8. CANCELLO / RECINZIONE (NUOVO) ───────────────────
// Campi: tipo, sistema, larghezza, altezza, n.moduli, lunghezza recinzione,
//        pendenza terreno, automazione, colore RAL
//
// {acc === "cancello" && a.attivo && (
//   <>
//     <SectionLabel text="Tipo" />
//     <ChipSelect items={CANC_CATEGORIE} value={a.tipo} ... />
//
//     <SectionLabel text="Sistema / Linea" />
//     <ChipSelect items={cancSistemaDB} value={a.sistema} ... />
//
//     {/* Dimensioni cancello */}
//     {["batt_s","batt_d","scorr","pedon"].includes(a.tipo) && (
//       <>
//         <MisuraInput label="Larghezza apertura" value={a.larghezza} ... />
//         <MisuraInput label="Altezza" value={a.altezza} ... />
//       </>
//     )}
//
//     {/* Dimensioni recinzione */}
//     {["recinz","ringh"].includes(a.tipo) && (
//       <>
//         <MisuraInput label="Lunghezza totale recinzione" value={a.lunghezzaRec} ... />
//         <MisuraInput label="Altezza" value={a.altezza} ... />
//         <div style={{ marginBottom: 8 }}>
//           <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>N° moduli (2m cad.)</div>
//           <input type="number" value={a.nModuli || ""} onChange={...} ... />
//           {a.lunghezzaRec > 0 && (
//             <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>
//               Suggerito: {Math.ceil(a.lunghezzaRec / 2000)} moduli
//             </div>
//           )}
//         </div>
//       </>
//     )}
//
//     {/* Pendenza terreno (solo Gradius) */}
//     {a.sistema === "Gradius" && (
//       <div style={{ marginBottom: 8 }}>
//         <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Pendenza terreno (°)</div>
//         <input type="number" max="30" value={a.pendenza || ""} onChange={...} ... />
//         {a.pendenza > 30 && <div style={{ color: "#ff3b30", fontSize: 10 }}>⚠️ Max 30° per Gradius</div>}
//       </div>
//     )}
//
//     <SectionLabel text="Automazione" />
//     <ChipSelect items={cancAutoDB} value={a.automazione} ... />
//
//     <SectionLabel text="Colore RAL" />
//     <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
//       <input placeholder="Es. RAL 7016, RAL 9010, COR-TEN..." 
//         value={a.coloreRAL || ""} onChange={...}
//         style={{ flex: 1, padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} />
//     </div>
//
//     <SectionLabel text="Marcatura CE" />
//     <div style={{ fontSize: 10, color: T.grn, background: T.grnLt, padding: "6px 10px", borderRadius: 6 }}>
//       ✅ Conforme UNI EN 13241:2016 — Zona vento 3
//     </div>
//   </>
// )}

// ═══════════════════════════════════════════════════════════
// RIEPILOGO ACCESSORI — Badge contatori nel step riepilogo
// ═══════════════════════════════════════════════════════════

// Funzione per contare accessori attivi su un vano
export const countAccessoriAttivi = (v: any): number => {
  let count = 0;
  if (v.accessori?.tapparella?.attivo) count++;
  if (v.accessori?.persiana?.attivo) count++;
  if (v.accessori?.zanzariera?.attivo) count++;
  if (v.cassonetto) count++;
  if (v.accessori?.tenda_sole?.attivo) count++;
  if (v.accessori?.tenda_interna?.attivo) count++;
  if (v.accessori?.box_doccia?.attivo) count++;
  if (v.accessori?.cancello?.attivo) count++;
  return count;
};

// Funzione per generare riga riepilogo accessorio
export const riepilogoAccessorio = (v: any, acc: string): string | null => {
  const a = v.accessori?.[acc];
  if (!a?.attivo) return null;
  
  switch (acc) {
    case "tapparella":
      return `Tapparella ${a.materiale || ""} ${a.motorizzata === "Sì" ? "⚡mot." : ""} ${a.l || "?"}×${a.h || "?"}`;
    case "persiana":
      return `Persiana ${a.telaio || ""} ${a.l || "?"}×${a.h || "?"}`;
    case "zanzariera":
      return `Zanzariera ${a.modello || a.categoria || ""} ${a.l || "?"}×${a.h || "?"} ${a.tipoRete || ""}`;
    case "tenda_sole":
      return `Tenda sole ${a.modello || a.categoria || ""} L${a.larghezza || "?"}×S${a.sporgenza || "?"} ${a.comando || ""}`;
    case "tenda_interna":
      return `Tenda int. ${a.categoria || ""} ${a.larghezza || "?"}×${a.altezza || "?"} ${a.tessuto || ""}`;
    case "box_doccia":
      return `Box doccia ${a.tipo || ""} ${a.larghezza || "?"}${a.profondita ? "×" + a.profondita : ""}×${a.altezza || "?"} ${a.vetro || ""}`;
    case "cancello":
      return `${a.tipo?.includes("recinz") ? "Recinzione" : "Cancello"} ${a.sistema || ""} ${a.larghezza || a.lunghezzaRec || "?"}×${a.altezza || "?"} ${a.automazione || ""}`;
    default:
      return null;
  }
};

// Funzione per calcolo prezzo accessorio (placeholder — da completare con listini)
export const calcolaPrezzo = (v: any, acc: string): number => {
  const a = v.accessori?.[acc];
  if (!a?.attivo) return 0;
  
  // Per ora: prezzo = 0 (da implementare con listini configurabili)
  // In futuro: lookup modello → prezzo base + sovrapprezzo opzioni
  return 0;
};
