import { useState } from "react";

// ═══ MASTRO DS v1.0 ═══
const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", r: 14 };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ CATALOGHI CANCELLI ═══
const TIPOLOGIE = ["Battente singolo","Battente doppio","Scorrevole","Scorrevole telescopico","Pedonale","Carraio + pedonale"];
const RECINZIONI = ["Recinzione pannello","Ringhiera balcone","Ringhiera scala","Parapetto","Staccionata"];
const STILI = ["Doghe verticali privacy","Doghe orizzontali","Ferro battuto classico","Taglio laser decorativo","Lamiera piena","Rete / Grigliato","Paletti e cavi","Misto vetro/metallo","Su disegno custom"];
const MATERIALI = ["Ferro zincato verniciato","Alluminio","Acciaio inox 304","Acciaio inox 316 (marino)","Acciaio COR-TEN","Ferro battuto","Legno composito WPC"];
const COLORI = ["Ferro micaceo","Nero RAL 9005","Antracite RAL 7016","Grigio RAL 7035","Bianco RAL 9010","Marrone RAL 8017","Verde RAL 6005","COR-TEN naturale","RAL custom","Effetto legno"];
const AUTOMAZIONE = ["Manuale","Predisposizione automazione","Motore 230V","Motore solare","Motore a batteria"];
const MOTORI = ["Interrato","A braccio","Scorrevole a cremagliera","Scorrevole a catena","A bandiera"];
const ACCESSORI_AUTO = ["Fotocellule coppia","Lampeggiante","Selettore a chiave","Tastierino numerico","Telecomando (quantità)","Elettroserratura","Finecorsa magnetici","Batteria tampone","Modulo WiFi/App","Colonnina citofonica"];
const CHIUSURE = ["Serratura a cilindro","Catenaccio passante","Chiavistello a caduta","Elettroserratura","Maniglione antipanico","Lucchetto predisposizione"];
const FISSAGGIO = ["Tasselli su muro","Piastra a terra","Muretto basso","Cordolo cemento","Su pilastri esistenti","Pilastri nuovi da gettare"];

// MODELLI — ogni azienda caricherà i suoi
const MODELLI = [
  { id: "c01", nome: "Doghe Privacy 200", tipo: "Scorrevole",        shape: "doghe-v",  bg1: "#57534e", bg2: "#78716c" },
  { id: "c02", nome: "Classico Battente",  tipo: "Battente doppio",   shape: "battente", bg1: "#78716c", bg2: "#a18072" },
  { id: "c03", nome: "Minimal Nero",       tipo: "Scorrevole",        shape: "doghe-v",  bg1: "#1c1917", bg2: "#44403c" },
  { id: "c04", nome: "Pedonale Smart",     tipo: "Pedonale",          shape: "pedonale", bg1: "#a1a1aa", bg2: "#d4d4d8" },
  { id: "c05", nome: "Ferro Battuto Deco", tipo: "Battente doppio",   shape: "ferro",    bg1: "#78350f", bg2: "#92400e" },
  { id: "c06", nome: "Taglio Laser Art",   tipo: "Scorrevole",        shape: "laser",    bg1: "#94a3b8", bg2: "#e2e8f0" },
  { id: "c07", nome: "COR-TEN Garden",     tipo: "Recinzione pannello",shape: "corten",  bg1: "#92400e", bg2: "#b45309" },
  { id: "c08", nome: "Ringhiera Moderna",  tipo: "Ringhiera balcone", shape: "ringhiera",bg1: "#71717a", bg2: "#a1a1aa" },
  { id: "c09", nome: "Pannello Grigliato", tipo: "Recinzione pannello",shape: "grigliato",bg1: "#a8a29e", bg2: "#d6d3d1" },
];
const AGGANCIO = ["A pavimento","Frontale a muro","Su pilastro","Su muretto","A soffitto (pensilina)","Incasso a filo"];

// ═══ COMPONENTS ═══
const Chip = ({ label, selected, onTap, small }) => (
  <div onClick={onTap} style={{
    padding: small ? "5px 10px" : "8px 14px", borderRadius: 10,
    border: `1.5px solid ${selected ? T.acc : T.bdr}`,
    background: selected ? T.acc + "14" : T.card,
    fontSize: small ? 11 : 12, fontWeight: selected ? 700 : 500,
    color: selected ? T.acc : T.text, cursor: "pointer",
    transition: "all .15s ease", fontFamily: FF, userSelect: "none",
  }}>{label}</div>
);
const Sec = ({ icon, title, count, open, onToggle }) => (
  <div onClick={onToggle} style={{
    display: "flex", alignItems: "center", gap: 8, padding: "12px 0", cursor: "pointer",
    borderBottom: `1px solid ${T.bdr}`, marginBottom: open ? 12 : 0, userSelect: "none",
  }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1 }}>{title}</span>
    {count > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: T.acc + "20", color: T.acc, padding: "2px 8px", borderRadius: 20 }}>{count}</span>}
    <span style={{ fontSize: 12, color: T.sub, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>▼</span>
  </div>
);
const NumInput = ({ label, value, onChange, unit = "mm", placeholder }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 4, fontWeight: 600 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="number" inputMode="numeric" value={value || ""} onChange={e => onChange(parseInt(e.target.value) || 0)} placeholder={placeholder || ""} style={{
        flex: 1, padding: "12px 14px", fontSize: 16, fontFamily: FM, fontWeight: 600,
        border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, color: T.text, outline: "none",
      }} />
      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "8px 10px", borderRadius: 8, fontWeight: 600 }}>{unit}</span>
    </div>
  </div>
);
const Sel = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 4, fontWeight: 600 }}>{label}</div>
    <select value={value || ""} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 14px", fontSize: 13, fontFamily: FF, fontWeight: 600,
      border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, color: T.text,
      WebkitAppearance: "none", outline: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36,
    }}>
      <option value="">— Seleziona —</option>
      {options?.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const ChipSel = ({ label, options, value, onChange, small }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {options.map(o => <Chip key={o} label={o} selected={value === o} onTap={() => onChange(o)} small={small} />)}
    </div>
  </div>
);
// ═══ PRODUCT THUMBNAIL ═══
const Thumb = ({ shape, bg1, bg2 }) => {
  const base = { width: "100%", height: "100%", position: "absolute", top: 0, left: 0 };
  const bar = (x, w, h, top, col) => <div key={x+w} style={{ position: "absolute", left: `${x}%`, top: `${top}%`, width: `${w}%`, height: `${h}%`, background: col, borderRadius: 1 }} />;
  const shapes = {
    "doghe-v": () => <div style={base}>{Array.from({length:7},(_,i)=> bar(10+i*12, 8, 75, 10, i%2?bg1:bg2))}</div>,
    "battente": () => <div style={base}><div style={{position:"absolute",left:"5%",top:"8%",width:"42%",height:"80%",border:`2px solid ${bg1}`,borderRadius:2}}/><div style={{position:"absolute",right:"5%",top:"8%",width:"42%",height:"80%",border:`2px solid ${bg1}`,borderRadius:2}}/><div style={{position:"absolute",left:"42%",top:"40%",width:6,height:6,borderRadius:3,background:bg2}}/><div style={{position:"absolute",right:"42%",top:"40%",width:6,height:6,borderRadius:3,background:bg2}}/></div>,
    "pedonale": () => <div style={base}><div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",border:`2px solid ${bg1}`,borderRadius:3}}/>{Array.from({length:5},(_,i)=>bar(28,44,2,15+i*16,bg2))}<div style={{position:"absolute",right:"25%",top:"45%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    "ferro": () => <div style={base}>{Array.from({length:5},(_,i)=><div key={i} style={{position:"absolute",left:`${15+i*16}%`,top:"10%",width:3,height:"78%",background:bg1,borderRadius:1}}/>)}<div style={{position:"absolute",left:"10%",top:"20%",width:"80%",height:2,background:bg2}}/><div style={{position:"absolute",left:"10%",top:"70%",width:"80%",height:2,background:bg2}}/>{Array.from({length:4},(_,i)=><div key={`s${i}`} style={{position:"absolute",left:`${20+i*16}%`,top:"5%",width:8,height:8,borderRadius:4,border:`2px solid ${bg2}`}}/>)}</div>,
    "laser": () => <div style={base}><div style={{position:"absolute",left:"8%",top:"8%",width:"84%",height:"82%",background:`linear-gradient(135deg,${bg1}33,${bg2}66)`,borderRadius:4}}/>{Array.from({length:3},(_,i)=><div key={i} style={{position:"absolute",left:`${22+i*22}%`,top:`${20+i*12}%`,width:14,height:14,borderRadius:7,border:`2px solid ${bg1}`,background:"transparent"}}/>)}</div>,
    "corten": () => <div style={base}><div style={{position:"absolute",left:"5%",top:"8%",width:"90%",height:"82%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:2}}/>{Array.from({length:4},(_,i)=>bar(10,80,1.5,20+i*18,bg1+"88"))}</div>,
    "ringhiera": () => <div style={base}><div style={{position:"absolute",left:"5%",top:"15%",width:"90%",height:3,background:bg1,borderRadius:1}}/><div style={{position:"absolute",left:"5%",top:"82%",width:"90%",height:3,background:bg1,borderRadius:1}}/>{Array.from({length:9},(_,i)=><div key={i} style={{position:"absolute",left:`${8+i*10}%`,top:"15%",width:2,height:"67%",background:i%2?bg2:bg1}}/>)}</div>,
    "grigliato": () => <div style={base}>{Array.from({length:6},(_,i)=>bar(5,90,1.5,10+i*14,bg1+"88"))}{Array.from({length:7},(_,i)=><div key={`v${i}`} style={{position:"absolute",left:`${8+i*13}%`,top:"8%",width:1.5,height:"82%",background:bg2+"88"}}/>)}</div>,
  };
  return <div style={{ width: "100%", height: 80, background: `linear-gradient(145deg,${bg1}20,${bg2}35)`, position: "relative", overflow: "hidden" }}>{(shapes[shape]||shapes["doghe-v"])()}</div>;
};

const ModelCard = ({ model, selected, onTap }) => (
  <div onClick={onTap} style={{
    width: 100, minHeight: 130, borderRadius: 12, border: `2px solid ${selected ? T.acc : T.bdr}`,
    background: selected ? T.acc + "0a" : T.card, cursor: "pointer", overflow: "hidden",
    transition: "all .15s ease", flexShrink: 0, boxShadow: selected ? `0 2px 12px ${T.acc}25` : "none",
  }}>
    <div style={{ position: "relative" }}>
      <Thumb shape={model.shape} bg1={model.bg1} bg2={model.bg2} />
      {selected && <div style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 9, background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 800, zIndex: 2 }}>✓</div>}
    </div>
    <div style={{ padding: "6px 8px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: selected ? T.acc : T.text, lineHeight: 1.3 }}>{model.nome}</div>
      <div style={{ fontSize: 8, color: T.sub, marginTop: 2 }}>{model.tipo}</div>
    </div>
  </div>
);
const CheckItem = ({ label, checked, onToggle }) => (
  <div onClick={onToggle} style={{
    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8,
    border: `1.5px solid ${checked ? T.acc : T.bdr}`, background: checked ? T.acc + "0a" : T.card,
    cursor: "pointer", marginBottom: 4, userSelect: "none",
  }}>
    <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? T.acc : T.bdr}`, background: checked ? T.acc : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 800 }}>{checked ? "✓" : ""}</div>
    <span style={{ fontSize: 12, fontWeight: checked ? 600 : 400, color: checked ? T.acc : T.text }}>{label}</span>
  </div>
);

// ═══ MAIN ═══
export default function MastroCancelliDemo() {
  const [d, setD] = useState({});
  const [acc, setAcc] = useState([]);
  const [openSec, setOpenSec] = useState({ tipo: true, misure: true, config: false, auto: false, fissaggio: false });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const tog = (s) => setOpenSec(prev => ({ ...prev, [s]: !prev[s] }));
  const togAcc = (a) => setAcc(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const isRecinzione = (d.tipologia || "").includes("Recinzione") || (d.tipologia || "").includes("Ringhiera") || (d.tipologia || "").includes("Parapetto") || (d.tipologia || "").includes("Staccionata");
  const isCancello = !isRecinzione && d.tipologia;
  const isScorrevole = (d.tipologia || "").includes("Scorrevole");
  const needAuto = d.automazione && d.automazione !== "Manuale";

  const tipoCount = [d.modello, d.tipologia, d.stile, d.materiale].filter(Boolean).length;
  const misureCount = [d.larghezza, d.altezza, isRecinzione ? d.lunghezza : null, d.pendenza].filter(Boolean).length;
  const configCount = [d.colore, d.chiusura, d.fissaggio, d.aggancio].filter(Boolean).length;
  const autoCount = [d.automazione, needAuto ? d.motore : null].filter(Boolean).length + (needAuto ? Math.min(acc.length, 2) : 0);
  const totalFields = tipoCount + misureCount + configCount + autoCount;
  const totalMax = 14;

  // Filtra modelli per tipologia
  const modelliVisibili = d.tipologia ? MODELLI.filter(m => m.tipo === d.tipologia) : MODELLI;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: FF }}>
      {/* TOPBAR */}
      <div style={{ background: T.topbar, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 99 }}>
        <span style={{ fontSize: 20 }}>🏗️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Presa Misure — Cancello</div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Ingresso · Esterno</div>
        </div>
        <div style={{ background: totalFields >= totalMax * 0.7 ? T.green + "30" : T.acc + "30", color: totalFields >= totalMax * 0.7 ? T.green : T.acc, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, fontFamily: FM }}>{totalFields}/{totalMax}</div>
      </div>
      <div style={{ height: 3, background: T.bdr }}>
        <div style={{ height: 3, background: totalFields >= totalMax * 0.7 ? T.green : T.acc, width: `${(totalFields / totalMax) * 100}%`, transition: "width .3s ease", borderRadius: 2 }} />
      </div>

      <div style={{ padding: "8px 16px 100px 16px" }}>

        {/* ═══ TIPOLOGIA ═══ */}
        <Sec icon="🏗️" title="Tipologia e modello" count={tipoCount} open={openSec.tipo} onToggle={() => tog("tipo")} />
        {openSec.tipo && (<div style={{ animation: "fadeIn .2s ease" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Cancelli</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {TIPOLOGIE.map(t => <Chip key={t} label={t} selected={d.tipologia === t} onTap={() => set("tipologia", t)} />)}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Recinzioni / Ringhiere</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {RECINZIONI.map(t => <Chip key={t} label={t} selected={d.tipologia === t} onTap={() => set("tipologia", t)} />)}
          </div>

          {/* Modelli con foto */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase" }}>Modello {d.tipologia ? `· ${modelliVisibili.length}` : ""}</div>
              {d.modello && <div onClick={() => set("modello", null)} style={{ fontSize: 9, color: T.red, cursor: "pointer", fontWeight: 700 }}>✕ Rimuovi</div>}
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
              {modelliVisibili.map(mod => (
                <ModelCard key={mod.id} model={mod} selected={d.modello === mod.id} onTap={() => set("modello", d.modello === mod.id ? null : mod.id)} />
              ))}
              <div style={{ width: 100, minHeight: 130, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, background: T.card }}>
                <span style={{ fontSize: 24, color: T.sub }}>+</span>
                <span style={{ fontSize: 9, color: T.sub, fontWeight: 600 }}>Aggiungi</span>
              </div>
            </div>
          </div>

          <ChipSel label="Stile / Design" options={STILI} value={d.stile} onChange={v => set("stile", v)} />
          <ChipSel label="Materiale" options={MATERIALI} value={d.materiale} onChange={v => set("materiale", v)} />
        </div>)}

        {/* ═══ MISURE ═══ */}
        <Sec icon="📐" title="Misure" count={misureCount} open={openSec.misure} onToggle={() => tog("misure")} />
        {openSec.misure && (<div style={{ animation: "fadeIn .2s ease" }}>
          {isCancello && (<>
            <NumInput label="Larghezza luce passaggio" value={d.larghezza} onChange={v => set("larghezza", v)} placeholder="es. 3500" />
            <NumInput label="Altezza" value={d.altezza} onChange={v => set("altezza", v)} placeholder="es. 1800" />
            {(d.tipologia || "").includes("doppio") && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}><NumInput label="Anta fissa" value={d.antaFissa} onChange={v => set("antaFissa", v)} /></div>
                <div style={{ flex: 1 }}><NumInput label="Anta mobile" value={d.antaMobile} onChange={v => set("antaMobile", v)} /></div>
              </div>
            )}
            {isScorrevole && (
              <NumInput label="Spazio arretramento (corsa)" value={d.corsa} onChange={v => set("corsa", v)} placeholder="Spazio laterale per apertura" />
            )}
          </>)}

          {isRecinzione && (<>
            <NumInput label="Lunghezza totale" value={d.lunghezza} onChange={v => set("lunghezza", v)} placeholder="es. 25000" />
            <NumInput label="Altezza" value={d.altezza} onChange={v => set("altezza", v)} placeholder="es. 1200" />
            <NumInput label="Numero pilastri / campate" value={d.campate} onChange={v => set("campate", v)} unit="pz" placeholder="Auto-calcolo da lunghezza" />
          </>)}

          {!d.tipologia && (
            <div style={{ fontSize: 11, color: T.sub, padding: "16px", textAlign: "center", background: T.card, borderRadius: 10 }}>
              ☝️ Seleziona prima la tipologia
            </div>
          )}

          <ChipSel label="Pendenza terreno" options={["Piano","Leggera (&lt;5°)","Media (5-15°)","Forte (&gt;15°)","A gradoni"]} value={d.pendenza} onChange={v => set("pendenza", v)} small />
          {d.pendenza && d.pendenza !== "Piano" && (
            <div style={{ fontSize: 10, color: T.acc, background: T.acc + "12", padding: "6px 10px", borderRadius: 8, marginBottom: 10 }}>
              ⚠️ Terreno in pendenza — necessario rilievo quote con livella
            </div>
          )}
        </div>)}

        {/* ═══ CONFIG ═══ */}
        <Sec icon="🎨" title="Finitura e chiusura" count={configCount} open={openSec.config} onToggle={() => tog("config")} />
        {openSec.config && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Colore / Finitura" options={COLORI} value={d.colore} onChange={v => set("colore", v)} />
          <ChipSel label="Sistema di aggancio" options={AGGANCIO} value={d.aggancio} onChange={v => set("aggancio", v)} />
          <ChipSel label="Chiusura" options={CHIUSURE} value={d.chiusura} onChange={v => set("chiusura", v)} small />
          <ChipSel label="Fissaggio a terra" options={FISSAGGIO} value={d.fissaggio} onChange={v => set("fissaggio", v)} small />

          {d.fissaggio === "Pilastri nuovi da gettare" && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1 }}><NumInput label="Sezione pilastro" value={d.sezPilastro} onChange={v => set("sezPilastro", v)} placeholder="es. 300" /></div>
              <div style={{ flex: 1 }}><NumInput label="Numero pilastri" value={d.numPilastri} onChange={v => set("numPilastri", v)} unit="pz" /></div>
            </div>
          )}
        </div>)}

        {/* ═══ AUTOMAZIONE ═══ */}
        <Sec icon="⚡" title="Automazione" count={autoCount} open={openSec.auto} onToggle={() => tog("auto")} />
        {openSec.auto && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Tipo automazione" options={AUTOMAZIONE} value={d.automazione} onChange={v => set("automazione", v)} />

          {needAuto && (<>
            <ChipSel label="Tipo motore" options={
              isScorrevole ? MOTORI.filter(m => m.includes("Scorrevole") || m === "Interrato") :
              MOTORI.filter(m => !m.includes("Scorrevole"))
            } value={d.motore} onChange={v => set("motore", v)} small />

            <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Accessori automazione</div>
            {ACCESSORI_AUTO.map(a => (
              <CheckItem key={a} label={a} checked={acc.includes(a)} onToggle={() => togAcc(a)} />
            ))}
          </>)}

          {d.automazione === "Predisposizione automazione" && (
            <div style={{ fontSize: 10, color: T.green, background: T.green + "12", padding: "8px 12px", borderRadius: 8, marginTop: 8 }}>
              💡 Predisporre cavidotto Ø40 + cassetta 503 a pilastro cerniera
            </div>
          )}
        </div>)}

        {/* ═══ NOTE + FOTO ═══ */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Note</div>
          <textarea value={d.note || ""} onChange={e => set("note", e.target.value)} placeholder="Accesso camion, pendenza lato, muretto esistente, distanza corrente elettrica..." style={{
            width: "100%", padding: "12px 14px", fontSize: 12, fontFamily: FF, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box",
          }} />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {["📷 Foto sito","📐 Schizzo","🎤 Vocale","📍 GPS"].map(b => (
            <div key={b} style={{ flex: 1, height: 70, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: T.card }}>
              <span style={{ fontSize: 20 }}>{b.split(" ")[0]}</span>
              <span style={{ fontSize: 8, color: T.sub, fontWeight: 600, marginTop: 2 }}>{b.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>

        {/* ═══ RIEPILOGO ═══ */}
        {totalFields >= 4 && (
          <div style={{ marginTop: 20, background: T.card, borderRadius: 14, border: `1.5px solid ${T.bdr}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: T.topbar, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📋</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Riepilogo {isRecinzione ? "Recinzione" : "Cancello"}</span>
            </div>
            <div style={{ padding: "14px 16px", fontSize: 12, lineHeight: 2, color: T.text }}>
              {d.tipologia && <div><span style={{ color: T.sub }}>Tipo:</span> <strong>{d.tipologia}</strong></div>}
              {d.modello && (() => { const m = MODELLI.find(x => x.id === d.modello); return m ? <div><span style={{ color: T.sub }}>Modello:</span> <strong>{m.nome}</strong></div> : null; })()}
              {d.stile && <div><span style={{ color: T.sub }}>Stile:</span> <strong>{d.stile}</strong></div>}
              {d.materiale && <div><span style={{ color: T.sub }}>Materiale:</span> <strong>{d.materiale}</strong></div>}
              {d.larghezza > 0 && <div><span style={{ color: T.sub }}>Luce:</span> <strong style={{ fontFamily: FM }}>{d.larghezza}×{d.altezza}</strong> mm</div>}
              {d.lunghezza > 0 && <div><span style={{ color: T.sub }}>Lunghezza:</span> <strong style={{ fontFamily: FM }}>{d.lunghezza}</strong> mm × H <strong style={{ fontFamily: FM }}>{d.altezza}</strong></div>}
              {d.colore && <div><span style={{ color: T.sub }}>Colore:</span> <strong>{d.colore}</strong></div>}
              {d.automazione && <div><span style={{ color: T.sub }}>⚡</span> <strong>{d.automazione}</strong> {d.motore ? `— ${d.motore}` : ""}</div>}
              {acc.length > 0 && <div><span style={{ color: T.sub }}>Acc:</span> {acc.join(", ")}</div>}
              {d.chiusura && <div><span style={{ color: T.sub }}>Chiusura:</span> <strong>{d.chiusura}</strong></div>}
              {d.aggancio && <div><span style={{ color: T.sub }}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
              {d.fissaggio && <div><span style={{ color: T.sub }}>Fissaggio:</span> <strong>{d.fissaggio}</strong></div>}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.bdr}`, padding: "12px 16px", display: "flex", gap: 10, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ flex: 1, padding: "14px", borderRadius: 12, background: T.bg, textAlign: "center", fontSize: 13, fontWeight: 700, color: T.sub, cursor: "pointer" }}>← Indietro</div>
        <div style={{ flex: 2, padding: "14px", borderRadius: 12, background: totalFields >= 4 ? T.acc : T.bdr, textAlign: "center", fontSize: 13, fontWeight: 800, color: totalFields >= 4 ? "#fff" : T.sub, cursor: totalFields >= 4 ? "pointer" : "default", transition: "all .2s" }}>✓ Salva {isRecinzione ? "recinzione" : "cancello"}</div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, select:focus, textarea:focus { border-color: ${T.acc} !important; box-shadow: 0 0 0 3px ${T.acc}20; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
