import { useState } from "react";

const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", r: 14 };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ CATALOGO PERSIANE ═══
const TIPOLOGIE = ["Battente alla fiorentina","Battente alla genovese","Battente alla romana","Scorrevole","Libro","Fissa (schermo solare)"];
const MATERIALI = ["Alluminio","Legno","PVC","Alluminio effetto legno","Ferro battuto"];
const STECCHE = ["Fissa orientabile","Fissa chiusa","Mobile orientabile","Mista (fissa + mobile)","Cieca (piena)"];
const ANTE = ["1 anta","2 ante","3 ante","4 ante"];
const COLORI = ["Bianco RAL 9010","Avorio RAL 1013","Marrone RAL 8017","Verde RAL 6005","Grigio RAL 7016","Antracite RAL 7016S","Grigio chiaro RAL 7035","Testa di moro","Noce","Rovere dorato","Douglas","RAL custom","NCS custom","Effetto legno custom"];
const FERRAMENTA = ["Cardini a muro","Cardini a telaio","Cerniere a scomparsa","Perni regolabili","Cremonese","Spagnoletta","Fermapersiana automatico","Fermapersiana a molla","Gancio a vento"];
const ACCESSORI = ["Asta di manovra","Stecca chiusura","Pomolo interno","Blocco di sicurezza","Zanzariera integrata","Catenaccio alto/basso"];

const MODELLI = [
  { id: "p01", nome: "Fiorentina Classic", tipo: "Battente alla fiorentina", shape: "fiorentina", bg1: "#78543e", bg2: "#a18072" },
  { id: "p02", nome: "Genovese Slim",     tipo: "Battente alla genovese",   shape: "genovese",   bg1: "#57534e", bg2: "#78716c" },
  { id: "p03", nome: "Scorrevole Flat",    tipo: "Scorrevole",              shape: "scorr-pers",  bg1: "#a1a1aa", bg2: "#d4d4d8" },
  { id: "p04", nome: "Libro Compatta",     tipo: "Libro",                   shape: "libro-pers",  bg1: "#94a3b8", bg2: "#e2e8f0" },
  { id: "p05", nome: "Fissa Solare",       tipo: "Fissa (schermo solare)",  shape: "fissa-sol",   bg1: "#b45309", bg2: "#fbbf24" },
  { id: "p06", nome: "Romana Tradizione",  tipo: "Battente alla romana",    shape: "romana",      bg1: "#713f12", bg2: "#92400e" },
  { id: "p07", nome: "Blindata Security",  tipo: "Battente alla fiorentina",shape: "blindata-p",  bg1: "#3f3f46", bg2: "#57534e" },
];
const AGGANCIO_PERS = ["A muro con cardini","A telaio finestra","Su controtelaio","Frontale su cappotto","A pavimento con perno","Incasso a filo muro"];

const MISURE_STD = [{l:600,h:1200,lb:"60×120"},{l:800,h:1200,lb:"80×120"},{l:800,h:1400,lb:"80×140"},{l:1000,h:1400,lb:"100×140"},{l:1200,h:1400,lb:"120×140"},{l:1400,h:1600,lb:"140×160"}];

// ═══ COMPONENTS (same pattern) ═══
const Chip = ({ label, selected, onTap, small }) => (
  <div onClick={onTap} style={{ padding: small ? "5px 10px" : "8px 14px", borderRadius: 10, border: `1.5px solid ${selected ? T.acc : T.bdr}`, background: selected ? T.acc + "14" : T.card, fontSize: small ? 11 : 12, fontWeight: selected ? 700 : 500, color: selected ? T.acc : T.text, cursor: "pointer", transition: "all .15s ease", fontFamily: FF, userSelect: "none" }}>{label}</div>
);
const Sec = ({ icon, title, count, open, onToggle }) => (
  <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", cursor: "pointer", borderBottom: `1px solid ${T.bdr}`, marginBottom: open ? 12 : 0, userSelect: "none" }}>
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
      <input type="number" inputMode="numeric" value={value || ""} onChange={e => onChange(parseInt(e.target.value) || 0)} placeholder={placeholder || ""} style={{ flex: 1, padding: "12px 14px", fontSize: 16, fontFamily: FM, fontWeight: 600, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, color: T.text, outline: "none" }} />
      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "8px 10px", borderRadius: 8, fontWeight: 600 }}>{unit}</span>
    </div>
  </div>
);
const ChipSel = ({ label, options, value, onChange, small }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{options.map(o => <Chip key={o} label={o} selected={value === o} onTap={() => onChange(o)} small={small} />)}</div>
  </div>
);
// ═══ PRODUCT THUMBNAIL ═══
const Thumb = ({ shape, bg1, bg2 }) => {
  const slatRow = (y, col) => <div key={y} style={{ position: "absolute", left: "12%", top: `${y}%`, width: "76%", height: "5%", background: col, borderRadius: 1 }} />;
  const shapes = {
    "fiorentina": () => <>{Array.from({length:8},(_,i)=>slatRow(10+i*10, i%2?bg1:bg2))}<div style={{position:"absolute",left:"48%",top:"85%",width:5,height:5,borderRadius:3,background:bg2}}/></>,
    "genovese": () => <><div style={{position:"absolute",left:"8%",top:"5%",width:"38%",height:"88%",border:`1.5px solid ${bg1}40`,borderRadius:2}}/><div style={{position:"absolute",right:"8%",top:"5%",width:"38%",height:"88%",border:`1.5px solid ${bg1}40`,borderRadius:2}}/>{Array.from({length:7},(_,i)=>slatRow(12+i*11, bg2+"aa"))}</>,
    "scorr-pers": () => <><div style={{position:"absolute",left:"5%",top:"5%",width:"90%",height:"88%",border:`1.5px solid ${bg1}40`,borderRadius:2}}/>{Array.from({length:9},(_,i)=>slatRow(10+i*9, i%2?bg1+"77":bg2+"77"))}<div style={{position:"absolute",right:"8%",top:"10%",width:3,height:"78%",background:bg1+"44"}}/></>,
    "libro-pers": () => <>{[0,1,2,3].map(i=><div key={i} style={{position:"absolute",left:`${5+i*24}%`,top:"5%",width:"20%",height:"88%",border:`1px solid ${bg1}50`,borderRadius:1,background:`linear-gradient(180deg,${bg2}33,${bg1}22)`}}/>)}</>,
    "fissa-sol": () => <>{Array.from({length:6},(_,i)=><div key={i} style={{position:"absolute",left:"10%",top:`${10+i*14}%`,width:"80%",height:"8%",background:bg1,borderRadius:1,transform:"skewY(-8deg)"}}/>)}</>,
    "romana": () => <><div style={{position:"absolute",left:"5%",top:"5%",width:"42%",height:"88%",border:`2px solid ${bg1}`,borderRadius:2}}/><div style={{position:"absolute",right:"5%",top:"5%",width:"42%",height:"88%",border:`2px solid ${bg1}`,borderRadius:2}}/>{Array.from({length:6},(_,i)=><div key={i} style={{position:"absolute",left:"10%",top:`${15+i*12}%`,width:"80%",height:"3%",background:bg2}}/>)}</>,
    "blindata-p": () => <><div style={{position:"absolute",left:"8%",top:"5%",width:"84%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:2}}/>{Array.from({length:8},(_,i)=>slatRow(10+i*10,bg1+"44"))}<div style={{position:"absolute",left:"15%",top:"40%",width:6,height:6,background:bg2,borderRadius:1}}/></>,
  };
  return <div style={{ width: "100%", height: 80, background: `linear-gradient(145deg,${bg1}18,${bg2}28)`, position: "relative", overflow: "hidden" }}>{(shapes[shape]||shapes["fiorentina"])()}</div>;
};

const ModelCard = ({ model, selected, onTap }) => (
  <div onClick={onTap} style={{ width: 100, minHeight: 130, borderRadius: 12, border: `2px solid ${selected ? T.acc : T.bdr}`, background: selected ? T.acc + "0a" : T.card, cursor: "pointer", overflow: "hidden", transition: "all .15s ease", flexShrink: 0, boxShadow: selected ? `0 2px 12px ${T.acc}25` : "none" }}>
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
  <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${checked ? T.acc : T.bdr}`, background: checked ? T.acc + "0a" : T.card, cursor: "pointer", marginBottom: 4, userSelect: "none" }}>
    <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? T.acc : T.bdr}`, background: checked ? T.acc : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 800 }}>{checked ? "✓" : ""}</div>
    <span style={{ fontSize: 12, fontWeight: checked ? 600 : 400, color: checked ? T.acc : T.text }}>{label}</span>
  </div>
);

export default function MastroPersianeDemo() {
  const [d, setD] = useState({});
  const [ferr, setFerr] = useState([]);
  const [accs, setAccs] = useState([]);
  const [openSec, setOpenSec] = useState({ tipo: true, misure: true, config: false, ferr: false });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const tog = (s) => setOpenSec(prev => ({ ...prev, [s]: !prev[s] }));

  const tipoCount = [d.modello, d.tipologia, d.materiale].filter(Boolean).length;
  const misureCount = [d.larghezza, d.altezza].filter(Boolean).length;
  const configCount = [d.stecche, d.ante, d.colore, d.aggancio].filter(Boolean).length;
  const ferrCount = Math.min(ferr.length, 2);
  const totalFields = tipoCount + misureCount + configCount + ferrCount;
  const totalMax = 11;

  const modelliVisibili = d.tipologia ? MODELLI.filter(m => m.tipo === d.tipologia) : MODELLI;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: FF }}>
      <div style={{ background: T.topbar, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 99 }}>
        <span style={{ fontSize: 20 }}>🪟</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Presa Misure — Persiana</div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Vano F1 · Camera</div>
        </div>
        <div style={{ background: totalFields >= totalMax * 0.7 ? T.green + "30" : T.acc + "30", color: totalFields >= totalMax * 0.7 ? T.green : T.acc, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, fontFamily: FM }}>{totalFields}/{totalMax}</div>
      </div>
      <div style={{ height: 3, background: T.bdr }}><div style={{ height: 3, background: totalFields >= totalMax * 0.7 ? T.green : T.acc, width: `${(totalFields / totalMax) * 100}%`, transition: "width .3s ease", borderRadius: 2 }} /></div>

      <div style={{ padding: "8px 16px 100px 16px" }}>
        <Sec icon="🪟" title="Tipologia e modello" count={tipoCount} open={openSec.tipo} onToggle={() => tog("tipo")} />
        {openSec.tipo && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Tipologia" options={TIPOLOGIE} value={d.tipologia} onChange={v => set("tipologia", v)} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase" }}>Modello {d.tipologia ? `· ${modelliVisibili.length}` : ""}</div>
              {d.modello && <div onClick={() => set("modello", null)} style={{ fontSize: 9, color: T.red, cursor: "pointer", fontWeight: 700 }}>✕ Rimuovi</div>}
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
              {modelliVisibili.map(mod => <ModelCard key={mod.id} model={mod} selected={d.modello === mod.id} onTap={() => set("modello", d.modello === mod.id ? null : mod.id)} />)}
              <div style={{ width: 100, minHeight: 130, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, background: T.card }}>
                <span style={{ fontSize: 24, color: T.sub }}>+</span><span style={{ fontSize: 9, color: T.sub, fontWeight: 600 }}>Aggiungi</span>
              </div>
            </div>
          </div>
          <ChipSel label="Materiale" options={MATERIALI} value={d.materiale} onChange={v => set("materiale", v)} />
        </div>)}

        <Sec icon="📐" title="Misure" count={misureCount} open={openSec.misure} onToggle={() => tog("misure")} />
        {openSec.misure && (<div style={{ animation: "fadeIn .2s ease" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Misura rapida</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {MISURE_STD.map(ms => <Chip key={ms.lb} label={ms.lb} selected={d.larghezza === ms.l && d.altezza === ms.h} onTap={() => { set("larghezza", ms.l); set("altezza", ms.h); }} />)}
          </div>
          <NumInput label="Larghezza vano" value={d.larghezza} onChange={v => set("larghezza", v)} />
          <NumInput label="Altezza vano" value={d.altezza} onChange={v => set("altezza", v)} />
          <NumInput label="Profondità spalletta" value={d.profSpall} onChange={v => set("profSpall", v)} placeholder="Spazio per alloggio anta" />
        </div>)}

        <Sec icon="🎨" title="Configurazione" count={configCount} open={openSec.config} onToggle={() => tog("config")} />
        {openSec.config && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Tipo stecche" options={STECCHE} value={d.stecche} onChange={v => set("stecche", v)} />
          <ChipSel label="Numero ante" options={ANTE} value={d.ante} onChange={v => set("ante", v)} small />
          <ChipSel label="Colore" options={COLORI} value={d.colore} onChange={v => set("colore", v)} small />
          <ChipSel label="Sistema di aggancio" options={AGGANCIO_PERS} value={d.aggancio} onChange={v => set("aggancio", v)} />
        </div>)}

        <Sec icon="🔧" title="Ferramenta e accessori" count={ferrCount} open={openSec.ferr} onToggle={() => tog("ferr")} />
        {openSec.ferr && (<div style={{ animation: "fadeIn .2s ease" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Ferramenta</div>
          {FERRAMENTA.map(f => <CheckItem key={f} label={f} checked={ferr.includes(f)} onToggle={() => setFerr(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f])} />)}
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, marginTop: 12, textTransform: "uppercase" }}>Accessori</div>
          {ACCESSORI.map(a => <CheckItem key={a} label={a} checked={accs.includes(a)} onToggle={() => setAccs(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a])} />)}
        </div>)}

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Note</div>
          <textarea value={d.note || ""} onChange={e => set("note", e.target.value)} placeholder="Muro irregolare, cappotto, distanza finestra..." style={{ width: "100%", padding: "12px 14px", fontSize: 12, fontFamily: FF, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {["📷 Foto","📐 Schizzo","🎤 Vocale"].map(b => (
            <div key={b} style={{ flex: 1, height: 70, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: T.card }}>
              <span style={{ fontSize: 20 }}>{b.split(" ")[0]}</span><span style={{ fontSize: 9, color: T.sub, fontWeight: 600, marginTop: 2 }}>{b.split(" ")[1]}</span>
            </div>
          ))}
        </div>

        {totalFields >= 4 && (
          <div style={{ marginTop: 20, background: T.card, borderRadius: 14, border: `1.5px solid ${T.bdr}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: T.topbar, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📋</span><span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Riepilogo Persiana</span>
            </div>
            <div style={{ padding: "14px 16px", fontSize: 12, lineHeight: 2, color: T.text }}>
              {d.tipologia && <div><span style={{ color: T.sub }}>Tipo:</span> <strong>{d.tipologia}</strong></div>}
              {d.modello && (() => { const m = MODELLI.find(x => x.id === d.modello); return m ? <div><span style={{ color: T.sub }}>Modello:</span> <strong>{m.nome}</strong></div> : null; })()}
              {d.materiale && <div><span style={{ color: T.sub }}>Materiale:</span> <strong>{d.materiale}</strong></div>}
              {d.larghezza > 0 && <div><span style={{ color: T.sub }}>Misure:</span> <strong style={{ fontFamily: FM }}>{d.larghezza}×{d.altezza}</strong> mm</div>}
              {d.stecche && <div><span style={{ color: T.sub }}>Stecche:</span> <strong>{d.stecche}</strong></div>}
              {d.ante && <div><span style={{ color: T.sub }}>Ante:</span> <strong>{d.ante}</strong></div>}
              {d.colore && <div><span style={{ color: T.sub }}>Colore:</span> <strong>{d.colore}</strong></div>}
              {d.aggancio && <div><span style={{ color: T.sub }}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
              {ferr.length > 0 && <div><span style={{ color: T.sub }}>Ferramenta:</span> {ferr.join(", ")}</div>}
              {accs.length > 0 && <div><span style={{ color: T.sub }}>Accessori:</span> {accs.join(", ")}</div>}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.bdr}`, padding: "12px 16px", display: "flex", gap: 10, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ flex: 1, padding: "14px", borderRadius: 12, background: T.bg, textAlign: "center", fontSize: 13, fontWeight: 700, color: T.sub }}>← Indietro</div>
        <div style={{ flex: 2, padding: "14px", borderRadius: 12, background: totalFields >= 4 ? T.acc : T.bdr, textAlign: "center", fontSize: 13, fontWeight: 800, color: totalFields >= 4 ? "#fff" : T.sub, transition: "all .2s" }}>✓ Salva persiana</div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } input:focus, select:focus, textarea:focus { border-color: ${T.acc} !important; box-shadow: 0 0 0 3px ${T.acc}20; } * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}
