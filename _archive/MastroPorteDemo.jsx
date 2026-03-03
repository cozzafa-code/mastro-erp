import { useState, useRef } from "react";

// ═══ MASTRO DS v1.0 ═══
const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", blue: "#3B7FE0", r: 14 };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ CATALOGHI ═══
const MATERIALI = ["Legno massello","Laccato opaco","Laccato lucido","Laminato CPL","Laminato HPL","Vetro temperato","Blindata","Metallica REI","Light","EI tagliafuoco"];
const APERTURE = {
  "Battente": ["Battente singola","Battente doppia","Ventola singola"],
  "Libro": ["Libro simmetrica","Libro asimmetrica"],
  "Roto": ["Roto singola","Compack 180"],
  "Scomparsa": ["Scomparsa singola","Scomparsa doppia"],
  "Esterno muro": ["Esterno muro singola","Esterno muro doppia","Sovrapposta 2 ante"],
  "Filomuro": ["Filomuro battente","Filomuro scorrevole"],
};
const FINITURE = ["Liscio","Pantografato","Inciso","Con vetro","Bugnato","Dogato H","Dogato V"];
const VETRI_INS = ["Trasparente","Satinato","Decorato","Laccato","Temperato"];
const COLORI = ["Bianco laccato","Bianco matrix","Grigio 7035","Grigio 7016","Noce nazionale","Noce canaletto","Rovere sbiancato","Rovere naturale","Rovere grigio","Wengé","Olmo","Frassino","RAL custom","NCS custom"];
const SENSI = ["DX spinta","DX tirare","SX spinta","SX tirare"];
const CONTROTELAI = ["Standard legno","Metallo zincato","Scomparsa","Filomuro alu","Esistente","Da definire"];
const CLASSI_EI = ["EI 30","EI 60","EI 90","EI 120"];
const CLASSI_RC = ["RC 2","RC 3","RC 4"];
const MISURE_STD = [{l:600,h:2100,lb:"60×210"},{l:700,h:2100,lb:"70×210"},{l:800,h:2100,lb:"80×210"},{l:900,h:2100,lb:"90×210"},{l:1000,h:2100,lb:"100×210"},{l:800,h:2400,lb:"80×240"},{l:900,h:2400,lb:"90×240"}];

// MODELLI PORTA — ogni azienda caricherà i suoi con foto
const MODELLI_INIT = [
  { id: "mod01", nome: "Liscio Classic",     materiale: "Laccato opaco",    shape: "liscio",  bg1: "#d6d3d1", bg2: "#f5f5f4" },
  { id: "mod02", nome: "Pantografato Deco",  materiale: "Laccato opaco",    shape: "panto",   bg1: "#c4b5a8", bg2: "#e7e5e4" },
  { id: "mod03", nome: "Vetro Satinato",     materiale: "Vetro temperato",  shape: "vetro",   bg1: "#93c5fd", bg2: "#dbeafe" },
  { id: "mod04", nome: "Rovere Naturale",    materiale: "Legno massello",   shape: "legno",   bg1: "#a18072", bg2: "#d6cfc7" },
  { id: "mod05", nome: "Noce Canaletto",     materiale: "Legno massello",   shape: "legno",   bg1: "#78543e", bg2: "#a18072" },
  { id: "mod06", nome: "Dogato Moderno",     materiale: "Laminato CPL",     shape: "dogato",  bg1: "#a1a1aa", bg2: "#d4d4d8" },
  { id: "mod07", nome: "Minimal Filomuro",   materiale: "Laccato opaco",    shape: "filo",    bg1: "#e7e5e4", bg2: "#fafaf9" },
  { id: "mod08", nome: "Blindata Classe 3",  materiale: "Blindata",         shape: "blindata",bg1: "#57534e", bg2: "#78716c" },
  { id: "mod09", nome: "REI 60 Hotel",       materiale: "EI tagliafuoco",   shape: "rei",     bg1: "#dc2626", bg2: "#fca5a5" },
  { id: "mod10", nome: "Scorrevole Glass",   materiale: "Vetro temperato",  shape: "scorr-d", bg1: "#60a5fa", bg2: "#bfdbfe" },
  { id: "mod11", nome: "Inciso Decor",       materiale: "Laminato HPL",     shape: "inciso",  bg1: "#94a3b8", bg2: "#e2e8f0" },
  { id: "mod12", nome: "Light Economica",    materiale: "Light",            shape: "liscio",  bg1: "#e5e5e5", bg2: "#f5f5f5" },
];
const AGGANCIO_PORTE = ["Frontale a muro","A pavimento (perno)","Su controtelaio","Filomuro (incasso)","Su stipite esistente","A soffitto (binario)"];

// HOPPE
const HOPPE_TIPO = ["Su rosetta","Su placca","Maniglione","Scorrevole incasso","Tagliafuoco","Compact System"];
const HOPPE_SERIE = ["Paris","Tokyo","Amsterdam","Atlanta","Milano","Maribor","Brindisi","Seattle","Dublin","Houston","Dallas","Hamburg","Stockholm FS","Paris FS","Singapore","Valencia"];
const HOPPE_MAT = ["Alluminio","Acciaio inox","Ottone","Resina"];
const HOPPE_FIN = ["F1 Argento","F9 Acciaio sat.","Nero satinato","Bronzo","Cromo lucido","Cromo sat.","Bianco 9016","Nero 9005","Titanio"];
const HOPPE_BOCC = ["Tonda Ø52","Quadrata","Ovale","Doppia mappa","WC nottolino","Cieca"];

// CISA
const CISA_TIPO = ["Da infilare standard","Da infilare 4 mandate","Da applicare","Multipunto","Elettrica","Smart","Antipanico"];
const CISA_CIL = ["Europeo standard","Europeo alta sicurezza","Per pomolo","Fisso doppia mappa","Elettronico"];
const CISA_MIS_CIL = ["30+30","30+40","30+50","35+35","40+40","40+50","50+50","Su misura"];
const CISA_ENTRATA = ["40mm","50mm","60mm","70mm","80mm"];
const CISA_ANTIPAN = ["Nessuno","Barra push","Leva touch","Con serratura"];
const CISA_CHIUDIP = ["Nessuno","A braccio","A slitta","A pavimento","Elettromagnetico"];

// ═══ CHIP COMPONENT ═══
const Chip = ({ label, selected, color, onTap, small }) => (
  <div onClick={onTap} style={{
    padding: small ? "5px 10px" : "8px 14px",
    borderRadius: 10,
    border: `1.5px solid ${selected ? color || T.acc : T.bdr}`,
    background: selected ? (color || T.acc) + "14" : T.card,
    fontSize: small ? 11 : 12,
    fontWeight: selected ? 700 : 500,
    color: selected ? (color || T.acc) : T.text,
    cursor: "pointer",
    transition: "all .15s ease",
    fontFamily: FF,
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  }}>{label}</div>
);

// ═══ SECTION HEADER ═══
const Sec = ({ icon, title, color, count, open, onToggle }) => (
  <div onClick={onToggle} style={{
    display: "flex", alignItems: "center", gap: 8, padding: "12px 0", cursor: "pointer",
    borderBottom: `1px solid ${T.bdr}`, marginBottom: open ? 12 : 0, userSelect: "none",
  }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span style={{ fontSize: 14, fontWeight: 700, color: color || T.text, flex: 1 }}>{title}</span>
    {count > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: (color || T.acc) + "20", color: color || T.acc, padding: "2px 8px", borderRadius: 20 }}>{count}</span>}
    <span style={{ fontSize: 12, color: T.sub, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>▼</span>
  </div>
);

// ═══ NUM INPUT ═══
const NumInput = ({ label, value, onChange, unit = "mm", placeholder }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 4, fontWeight: 600 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="number" inputMode="numeric" value={value || ""} onChange={e => onChange(parseInt(e.target.value) || 0)} placeholder={placeholder || ""} style={{
        flex: 1, padding: "12px 14px", fontSize: 16, fontFamily: FM, fontWeight: 600,
        border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, color: T.text,
        outline: "none", WebkitAppearance: "none",
      }} />
      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "8px 10px", borderRadius: 8, fontWeight: 600 }}>{unit}</span>
    </div>
  </div>
);

// ═══ SELECT ═══
const Sel = ({ label, value, onChange, options, groups }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 4, fontWeight: 600 }}>{label}</div>
    <select value={value || ""} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 14px", fontSize: 13, fontFamily: FF, fontWeight: 600,
      border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, color: T.text,
      WebkitAppearance: "none", outline: "none",
    }}>
      <option value="">— Seleziona —</option>
      {groups ? Object.entries(groups).map(([g, items]) => (
        <optgroup key={g} label={g}>{items.map(i => <option key={i} value={i}>{i}</option>)}</optgroup>
      )) : options?.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ═══ CHIP SELECTOR ═══
const ChipSel = ({ label, options, value, onChange, color, small }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {options.map(o => <Chip key={o} label={o} selected={value === o} color={color} onTap={() => onChange(o)} small={small} />)}
    </div>
  </div>
);

// ═══ PRODUCT THUMBNAIL ═══
const Thumb = ({ shape, bg1, bg2 }) => {
  const shapes = {
    "liscio": () => <div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:3}}><div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    "panto": () => <div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:bg2,borderRadius:3,border:`1.5px solid ${bg1}55`}}>{[20,40,60].map(y=><div key={y} style={{position:"absolute",left:"15%",top:`${y}%`,width:"70%",height:2,background:bg1+"44"}}/>)}<div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    "vetro": () => <div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",border:`2px solid ${bg1}`,borderRadius:3}}><div style={{position:"absolute",left:"15%",top:"10%",width:"70%",height:"55%",background:`linear-gradient(135deg,${bg1}33,${bg2})`,borderRadius:2}}/><div style={{position:"absolute",right:"15%",top:"75%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    "legno": () => <div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:3}}>{Array.from({length:5},(_,i)=><div key={i} style={{position:"absolute",left:0,top:`${i*20}%`,width:"100%",height:1,background:bg1+"33"}}/>)}<div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg2}}/></div>,
    "dogato": () => <div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:bg2,borderRadius:3}}>{Array.from({length:8},(_,i)=><div key={i} style={{position:"absolute",left:0,top:`${5+i*12}%`,width:"100%",height:4,background:bg1+"44"}}/>)}<div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    "filo": () => <><div style={{position:"absolute",left:"15%",top:"3%",width:"70%",height:"92%",background:bg2,borderRadius:1}}/><div style={{position:"absolute",left:"23%",top:"5%",width:"54%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:0}}/></>,
    "blindata": () => <div style={{position:"absolute",left:"18%",top:"5%",width:"64%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:3,border:`2px solid ${bg1}`}}><div style={{position:"absolute",right:"12%",top:"30%",width:6,height:6,borderRadius:3,background:bg2}}/><div style={{position:"absolute",right:"12%",top:"50%",width:6,height:6,borderRadius:3,background:bg2}}/><div style={{position:"absolute",right:"12%",top:"70%",width:6,height:6,borderRadius:3,background:bg2}}/></div>,
    "rei": () => <div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:`linear-gradient(180deg,${bg1}44,${bg2})`,borderRadius:3,border:`2px solid ${bg1}`}}><div style={{position:"absolute",left:"25%",top:"35%",width:"50%",height:"25%",border:`2px solid ${bg1}`,borderRadius:2}}/></div>,
    "scorr-d": () => <><div style={{position:"absolute",left:"10%",top:"5%",width:"55%",height:"88%",background:`linear-gradient(135deg,${bg1}44,${bg2})`,borderRadius:3,border:`1.5px solid ${bg1}55`}}/><div style={{position:"absolute",left:"5%",top:"90%",width:"90%",height:3,background:bg1,borderRadius:1}}/></>,
    "inciso": () => <div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:bg2,borderRadius:3}}>{Array.from({length:3},(_,i)=><div key={i} style={{position:"absolute",left:"20%",top:`${20+i*25}%`,width:"60%",height:8,border:`1px solid ${bg1}55`,borderRadius:2}}/>)}<div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
  };
  return <div style={{ width: "100%", height: 80, background: `linear-gradient(145deg,${bg1}15,${bg2}25)`, position: "relative", overflow: "hidden" }}>{(shapes[shape]||shapes["liscio"])()}</div>;
};

// ═══ MODEL CARD ═══
const ModelCard = ({ model, selected, onTap }) => (
  <div onClick={onTap} style={{
    width: 100, minHeight: 130, borderRadius: 12, border: `2px solid ${selected ? T.acc : T.bdr}`,
    background: selected ? T.acc + "0a" : T.card, cursor: "pointer", overflow: "hidden",
    transition: "all .15s ease", userSelect: "none", flexShrink: 0,
    boxShadow: selected ? `0 2px 12px ${T.acc}25` : "none",
  }}>
    <div style={{ position: "relative" }}>
      <Thumb shape={model.shape} bg1={model.bg1} bg2={model.bg2} />
      {selected && <div style={{
        position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 9,
        background: T.acc, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: "#fff", fontWeight: 800, zIndex: 2,
      }}>✓</div>}
    </div>
    <div style={{ padding: "6px 8px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: selected ? T.acc : T.text, lineHeight: 1.3 }}>{model.nome}</div>
      <div style={{ fontSize: 8, color: T.sub, marginTop: 2 }}>{model.materiale}</div>
    </div>
  </div>
);

// ═══ MAIN COMPONENT ═══
export default function MastroPorteDemo() {
  const [d, setD] = useState({});
  const [openSec, setOpenSec] = useState({ porta: true, misure: true, hoppe: false, cisa: false });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const tog = (s) => setOpenSec(prev => ({ ...prev, [s]: !prev[s] }));

  // Conteggi completamento
  const portaCount = [d.modello, d.materiale, d.apertura, d.senso, d.finitura, d.colore, d.aggancio].filter(Boolean).length;
  const misureCount = [d.larghezza, d.altezza, d.spessoreMuro].filter(Boolean).length;
  const hoppeCount = [d.hTipo, d.hSerie, d.hMat].filter(Boolean).length;
  const cisaCount = [d.cTipo, d.cCil, d.cEntrata].filter(Boolean).length;
  const totalFields = portaCount + misureCount + hoppeCount + cisaCount;
  const totalMax = 15;

  const needEI = d.materiale === "EI tagliafuoco" || d.materiale === "Metallica REI";
  const needRC = d.materiale === "Blindata";
  const needVetro = d.finitura === "Con vetro";

  // Filtra modelli per materiale selezionato (o mostra tutti)
  const modelliVisibili = d.materiale 
    ? MODELLI_INIT.filter(m => m.materiale === d.materiale)
    : MODELLI_INIT;

  // Seleziona modello e auto-imposta materiale
  const selModello = (mod) => {
    set("modello", mod.id === d.modello ? null : mod.id);
    if (mod.id !== d.modello) {
      set("materiale", mod.materiale);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: FF }}>
      {/* TOPBAR */}
      <div style={{
        background: T.topbar, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 99,
      }}>
        <span style={{ fontSize: 20 }}>🚪</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Presa Misure — Porta</div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Vano P1 · Soggiorno</div>
        </div>
        <div style={{
          background: totalFields >= totalMax * 0.7 ? T.green + "30" : T.acc + "30",
          color: totalFields >= totalMax * 0.7 ? T.green : T.acc,
          padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, fontFamily: FM,
        }}>{totalFields}/{totalMax}</div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ height: 3, background: T.bdr }}>
        <div style={{ height: 3, background: totalFields >= totalMax * 0.7 ? T.green : T.acc, width: `${(totalFields / totalMax) * 100}%`, transition: "width .3s ease", borderRadius: 2 }} />
      </div>

      <div style={{ padding: "8px 16px 100px 16px" }}>

        {/* ═══ SEZIONE MISURE ═══ */}
        <Sec icon="📐" title="Misure vano" color={T.acc} count={misureCount} open={openSec.misure} onToggle={() => tog("misure")} />
        {openSec.misure && (<div style={{ animation: "fadeIn .2s ease" }}>
          {/* Quick measure */}
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Misura rapida</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {MISURE_STD.map(ms => {
              const sel = d.larghezza === ms.l && d.altezza === ms.h;
              return <Chip key={ms.lb} label={ms.lb} selected={sel} color={T.acc} onTap={() => { set("larghezza", ms.l); set("altezza", ms.h); }} />;
            })}
          </div>
          <NumInput label="Larghezza luce vano" value={d.larghezza} onChange={v => set("larghezza", v)} />
          <NumInput label="Altezza luce vano" value={d.altezza} onChange={v => set("altezza", v)} />
          <NumInput label="Spessore muro" value={d.spessoreMuro} onChange={v => set("spessoreMuro", v)} placeholder="100, 120, 150..." />
          {d.spessoreMuro > 0 && d.spessoreMuro < 80 && (
            <div style={{ fontSize: 10, color: T.red, background: T.red + "12", padding: "6px 10px", borderRadius: 8, marginTop: -4, marginBottom: 10 }}>
              ⚠️ Spessore &lt;80mm — verificare fattibilità controtelaio
            </div>
          )}
        </div>)}

        {/* ═══ SEZIONE PORTA ═══ */}
        <Sec icon="🚪" title="Configurazione porta" color={T.acc} count={portaCount} open={openSec.porta} onToggle={() => tog("porta")} />
        {openSec.porta && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Materiale / Linea" options={MATERIALI} value={d.materiale} onChange={v => { set("materiale", v); set("modello", null); }} color={T.acc} />

          {/* MODELLO con foto — scroll orizzontale */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Modello {d.materiale ? `· ${modelliVisibili.length} disponibili` : ""}
              </div>
              {d.modello && <div onClick={() => set("modello", null)} style={{ fontSize: 9, color: T.red, cursor: "pointer", fontWeight: 700 }}>✕ Rimuovi</div>}
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
              {modelliVisibili.map(mod => (
                <ModelCard
                  key={mod.id}
                  model={mod}
                  selected={d.modello === mod.id}
                  onTap={() => selModello(mod)}
                />
              ))}
              {/* Card Aggiungi */}
              <div style={{
                width: 100, minHeight: 130, borderRadius: 12, border: `2px dashed ${T.bdr}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, background: T.card,
              }}>
                <span style={{ fontSize: 24, color: T.sub }}>+</span>
                <span style={{ fontSize: 9, color: T.sub, fontWeight: 600, textAlign: "center", padding: "0 4px" }}>Aggiungi modello</span>
              </div>
            </div>
            {d.modello && (() => {
              const m = MODELLI_INIT.find(x => x.id === d.modello);
              return m ? (
                <div style={{ marginTop: 8, background: T.acc + "0c", border: "1px solid " + T.acc + "25", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}><Thumb shape={m.shape} bg1={m.bg1} bg2={m.bg2} /></div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.acc }}>{m.nome}</div>
                    <div style={{ fontSize: 10, color: T.sub }}>{m.materiale}</div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          <Sel label="Sistema apertura" value={d.apertura} onChange={v => set("apertura", v)} groups={APERTURE} />

          <ChipSel label="Senso apertura" options={SENSI} value={d.senso} onChange={v => set("senso", v)} color={T.acc} />

          <ChipSel label="Finitura" options={FINITURE} value={d.finitura} onChange={v => set("finitura", v)} color={T.acc} small />

          {needVetro && (
            <ChipSel label="Tipo vetro inserto" options={VETRI_INS} value={d.vetroIns} onChange={v => set("vetroIns", v)} color={T.acc} small />
          )}

          <Sel label="Colore / Essenza" value={d.colore} onChange={v => set("colore", v)} options={COLORI} />

          <ChipSel label="Controtelaio" options={CONTROTELAI} value={d.controtelaio} onChange={v => set("controtelaio", v)} color={T.acc} small />

          <ChipSel label="Sistema di aggancio" options={AGGANCIO_PORTE} value={d.aggancio} onChange={v => set("aggancio", v)} />

          {/* EI condizionale */}
          {needEI && (<>
            <ChipSel label="🔥 Classe EI taglio fuoco" options={CLASSI_EI} value={d.classeEI} onChange={v => set("classeEI", v)} color={T.red} />
            <div style={{ fontSize: 10, color: T.green, background: T.green + "12", border: "1px solid " + T.green + "30", padding: "8px 12px", borderRadius: 10, marginBottom: 12, lineHeight: 1.5 }}>
              🔥 Certificazione EN 1634 — Resistenza fuoco {d.classeEI || "..."} minuti
            </div>
          </>)}

          {/* RC condizionale */}
          {needRC && (<>
            <ChipSel label="🛡 Classe antieffrazione" options={CLASSI_RC} value={d.classeRC} onChange={v => set("classeRC", v)} color={T.acc} />
            <div style={{ fontSize: 10, color: T.acc, background: T.acc + "15", border: "1px solid " + T.acc + "30", padding: "8px 12px", borderRadius: 10, marginBottom: 12, lineHeight: 1.5 }}>
              🛡 Porta blindata — Pannelli coordinabili con tutte le finiture
            </div>
          </>)}
        </div>)}

        {/* ═══ SEZIONE HOPPE ═══ */}
        <Sec icon="🔑" title="Maniglieria" color={T.acc} count={hoppeCount} open={openSec.hoppe} onToggle={() => tog("hoppe")} />
        {openSec.hoppe && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Tipo guarnitura" options={HOPPE_TIPO} value={d.hTipo} onChange={v => set("hTipo", v)} color={T.acc} />

          <Sel label="Serie / Modello" value={d.hSerie} onChange={v => set("hSerie", v)} options={
            d.hTipo === "Tagliafuoco" ? HOPPE_SERIE.filter(s => s.includes("FS")) :
            d.hTipo === "Maniglione" ? ["Singapore","Valencia","Dallas"] :
            d.hTipo === "Scorrevole incasso" ? ["Kit M463 standard","Kit M463 con nottolino"] :
            HOPPE_SERIE.filter(s => !s.includes("FS"))
          } />

          <ChipSel label="Materiale" options={HOPPE_MAT} value={d.hMat} onChange={v => set("hMat", v)} color={T.acc} small />

          <ChipSel label="Finitura" options={HOPPE_FIN} value={d.hFin} onChange={v => set("hFin", v)} color={T.acc} small />

          {(d.hTipo === "Su rosetta" || d.hTipo === "Su placca" || d.hTipo === "Tagliafuoco") && (
            <ChipSel label="Bocchetta" options={HOPPE_BOCC} value={d.hBocc} onChange={v => set("hBocc", v)} color={T.acc} small />
          )}

          {/* Mini riepilogo */}
          {d.hSerie && (
            <div style={{ background: T.acc + "0c", border: "1px solid " + T.acc + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.acc }}>
                {d.hTipo || "Guarnitura"} — {d.hSerie}
              </div>
              <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>
                {[d.hMat, d.hFin, d.hBocc].filter(Boolean).join(" · ")}
              </div>
            </div>
          )}
        </div>)}

        {/* ═══ SEZIONE CISA ═══ */}
        <Sec icon="🔒" title="Serratura e sicurezza" color={T.acc} count={cisaCount} open={openSec.cisa} onToggle={() => tog("cisa")} />
        {openSec.cisa && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Tipo serratura" options={
            needRC ? ["Da infilare 4 mandate","Multipunto","Smart","Elettrica"] :
            needEI ? ["Da infilare standard","Antipanico"] :
            CISA_TIPO
          } value={d.cTipo} onChange={v => set("cTipo", v)} color={T.acc} />

          <ChipSel label="Cilindro" options={CISA_CIL} value={d.cCil} onChange={v => set("cCil", v)} color={T.acc} small />

          {d.cCil && d.cCil !== "Elettronico" && (
            <ChipSel label="Misura cilindro" options={CISA_MIS_CIL} value={d.cMisCil} onChange={v => set("cMisCil", v)} color={T.acc} small />
          )}

          <ChipSel label="Entrata" options={CISA_ENTRATA} value={d.cEntrata} onChange={v => set("cEntrata", v)} color={T.acc} small />

          {d.cTipo === "Antipanico" && (
            <ChipSel label="Maniglione antipanico" options={CISA_ANTIPAN.filter(a => a !== "Nessuno")} value={d.cAntip} onChange={v => set("cAntip", v)} color={T.red} />
          )}

          <ChipSel label="Chiudiporta" options={CISA_CHIUDIP} value={d.cChiudip} onChange={v => set("cChiudip", v)} color={T.acc} small />

          <Sel label="Versione" value={d.cVers} onChange={v => set("cVers", v)} options={["Destra","Sinistra","Reversibile"]} />

          {/* Mini riepilogo */}
          {d.cTipo && (
            <div style={{ background: T.acc + "0c", border: "1px solid " + T.acc + "30", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.acc }}>
                {d.cTipo}
              </div>
              <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>
                {[d.cCil, d.cMisCil, d.cEntrata, d.cChiudip !== "Nessuno" ? d.cChiudip : null].filter(Boolean).join(" · ")}
              </div>
            </div>
          )}
        </div>)}

        {/* ═══ NOTE ═══ */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Note</div>
          <textarea value={d.note || ""} onChange={e => set("note", e.target.value)} placeholder="Coprifilo da coordinare, soglia da incassare, muro curvo, prese vicine..." style={{
            width: "100%", padding: "12px 14px", fontSize: 12, fontFamily: FF, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box",
          }} />
        </div>

        {/* ═══ FOTO ═══ */}
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <div style={{
            flex: 1, height: 80, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", cursor: "pointer", background: T.card,
          }}>
            <span style={{ fontSize: 24 }}>📷</span>
            <span style={{ fontSize: 10, color: T.sub, marginTop: 2, fontWeight: 600 }}>Foto vano</span>
          </div>
          <div style={{
            flex: 1, height: 80, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", cursor: "pointer", background: T.card,
          }}>
            <span style={{ fontSize: 24 }}>📐</span>
            <span style={{ fontSize: 10, color: T.sub, marginTop: 2, fontWeight: 600 }}>Schizzo</span>
          </div>
          <div style={{
            flex: 1, height: 80, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", cursor: "pointer", background: T.card,
          }}>
            <span style={{ fontSize: 24 }}>🎤</span>
            <span style={{ fontSize: 10, color: T.sub, marginTop: 2, fontWeight: 600 }}>Nota vocale</span>
          </div>
        </div>

        {/* ═══ RIEPILOGO ═══ */}
        {totalFields >= 5 && (
          <div style={{ marginTop: 20, background: T.card, borderRadius: 14, border: `1.5px solid ${T.bdr}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: T.topbar, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📋</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Riepilogo Porta</span>
            </div>
            <div style={{ padding: "14px 16px", fontSize: 12, lineHeight: 2, color: T.text }}>
              {d.modello && (() => { const m = MODELLI_INIT.find(x => x.id === d.modello); return m ? <div><span style={{ color: T.sub }}>Modello:</span> <strong>{m.nome}</strong></div> : null; })()}
              {d.materiale && <div><span style={{ color: T.sub }}>Materiale:</span> <strong>{d.materiale}</strong></div>}
              {d.apertura && <div><span style={{ color: T.sub }}>Apertura:</span> <strong>{d.apertura}</strong></div>}
              {d.larghezza > 0 && d.altezza > 0 && <div><span style={{ color: T.sub }}>Misure:</span> <strong style={{ fontFamily: FM }}>{d.larghezza}×{d.altezza}</strong> mm {d.spessoreMuro > 0 && <span style={{ color: T.sub }}>(muro {d.spessoreMuro}mm)</span>}</div>}
              {d.senso && <div><span style={{ color: T.sub }}>Senso:</span> <strong>{d.senso}</strong></div>}
              {d.finitura && <div><span style={{ color: T.sub }}>Finitura:</span> <strong>{d.finitura}</strong>{d.vetroIns ? ` — ${d.vetroIns}` : ""}</div>}
              {d.colore && <div><span style={{ color: T.sub }}>Colore:</span> <strong>{d.colore}</strong></div>}
              {d.controtelaio && <div><span style={{ color: T.sub }}>Controtelaio:</span> <strong>{d.controtelaio}</strong></div>}
              {d.aggancio && <div><span style={{ color: T.sub }}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
              {d.classeEI && <div><span style={{ color: T.red }}>🔥 {d.classeEI}</span></div>}
              {d.classeRC && <div><span style={{ color: T.acc }}>🛡 {d.classeRC}</span></div>}
              {d.hSerie && <div><span style={{ color: T.acc }}>🔑 {d.hTipo} {d.hSerie}</span> <span style={{ color: T.sub }}>{d.hMat} {d.hFin}</span></div>}
              {d.cTipo && <div><span style={{ color: T.acc }}>🔒 {d.cTipo}</span> <span style={{ color: T.sub }}>{d.cCil} {d.cEntrata}</span></div>}
              {d.cChiudip && d.cChiudip !== "Nessuno" && <div><span style={{ color: T.acc }}>🚪 Chiudiporta: {d.cChiudip}</span></div>}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.bdr}`,
        padding: "12px 16px", display: "flex", gap: 10, maxWidth: 480, margin: "0 auto",
      }}>
        <div style={{
          flex: 1, padding: "14px", borderRadius: 12, background: T.bg, textAlign: "center",
          fontSize: 13, fontWeight: 700, color: T.sub, cursor: "pointer",
        }}>← Indietro</div>
        <div style={{
          flex: 2, padding: "14px", borderRadius: 12, background: totalFields >= 5 ? T.acc : T.bdr,
          textAlign: "center", fontSize: 13, fontWeight: 800, color: totalFields >= 5 ? "#fff" : T.sub,
          cursor: totalFields >= 5 ? "pointer" : "default", transition: "all .2s",
        }}>✓ Salva porta</div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, select:focus, textarea:focus { border-color: ${T.acc} !important; box-shadow: 0 0 0 3px ${T.acc}20; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
      `}</style>
    </div>
  );
}
