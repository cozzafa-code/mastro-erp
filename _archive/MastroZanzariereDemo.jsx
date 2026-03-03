import { useState } from "react";

const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", r: 14 };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ CATALOGO ZANZARIERE ═══
const CATEGORIE = ["Avvolgente verticale","Avvolgente laterale","Avvolgente con bottone","Plissettata verticale","Plissettata laterale","ZIP verticale","Incasso controtelaio","Pannello fisso","Battente 1 anta","Battente 2 ante","Scorrevole su binario"];
const RETI = [
  { nome: "Standard 18×16", desc: "Fibra di vetro grigia, la più comune", prezzo: "" },
  { nome: "Antibatterica", desc: "Trattamento antimicrobico, +€7.20/mq", prezzo: "+€7.20/mq" },
  { nome: "Antivento", desc: "Rete rinforzata con fili in acciaio", prezzo: "+€4.50/mq" },
  { nome: "Pet Screen", desc: "Resistente a graffi animali, spessore maggiore", prezzo: "+€12.00/mq" },
  { nome: "Antipolline", desc: "Maglia extra-fine per allergie", prezzo: "+€9.80/mq" },
  { nome: "Trasparente HD", desc: "Alta visibilità, quasi invisibile", prezzo: "+€6.00/mq" },
];
const APERTURE = ["DX → SX","SX → DX","Centrale (2 ante)","Basso → Alto"];
const COLORI = ["Bianco RAL 9010","Avorio RAL 1013","Marrone RAL 8017","Grigio RAL 7016","Antracite","Testa di moro","Bronzo","Effetto legno noce","Effetto legno rovere","RAL custom"];
const GUIDE = ["Guida standard","Guida con spazzolino","Guida magnetica","Guida ZIP","Senza guida (solo plissettata)"];
const MANOVRA = ["Manuale con molla","Manuale con catenella","Manuale con asta","Motorizzata","Magnetica a sfioramento"];
const PROFILO = ["Tondo Ø32","Tondo Ø42","Squadrato 35×35","Squadrato 45×45","Slim 25×35","Incasso"];

const MODELLI = [
  { id: "z01", nome: "Avvolgente Classic",  tipo: "Avvolgente verticale",  shape: "avv-v",   bg1: "#a1a1aa", bg2: "#e5e5e5" },
  { id: "z02", nome: "Laterale 1 anta",     tipo: "Avvolgente laterale",   shape: "avv-l",   bg1: "#a1a1aa", bg2: "#d4d4d8" },
  { id: "z03", nome: "Plissé Vertigo",      tipo: "Plissettata verticale", shape: "plisse-v",bg1: "#94a3b8", bg2: "#e2e8f0" },
  { id: "z04", nome: "Plissé Slide",        tipo: "Plissettata laterale",  shape: "plisse-l",bg1: "#6b7280", bg2: "#d1d5db" },
  { id: "z05", nome: "ZIP Antivento",       tipo: "ZIP verticale",         shape: "zip-z",   bg1: "#3f3f46", bg2: "#71717a" },
  { id: "z06", nome: "Incasso Filomuro",    tipo: "Incasso controtelaio",  shape: "incasso", bg1: "#d6d3d1", bg2: "#fafaf9" },
  { id: "z07", nome: "Battente Swing",      tipo: "Battente 1 anta",       shape: "batt-z",  bg1: "#78716c", bg2: "#a8a29e" },
  { id: "z08", nome: "Scorrevole XL",       tipo: "Scorrevole su binario", shape: "scorr-z", bg1: "#71717a", bg2: "#a1a1aa" },
];
const AGGANCIO_ZANZ = ["Frontale a muro","A pavimento","A soffitto","Su controtelaio","Su serramento (clip)","Incasso a filo"];
const MISURE_STD = [{l:600,h:1200,lb:"60×120"},{l:800,h:1200,lb:"80×120"},{l:800,h:1400,lb:"80×140"},{l:1000,h:1400,lb:"100×140"},{l:1200,h:1400,lb:"120×140"},{l:1400,h:2200,lb:"140×220"},{l:1800,h:2200,lb:"180×220"},{l:2400,h:2200,lb:"240×220"}];

// ═══ COMPONENTS ═══
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
  const mesh = (x,y,w,h,col) => <div key={`${x}${y}`} style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:`${w}%`,height:`${h}%`,background:col}} />;
  const shapes = {
    "avv-v": () => <><div style={{position:"absolute",left:"10%",top:"5%",width:"80%",height:6,background:bg1,borderRadius:2}}/><div style={{position:"absolute",left:"12%",top:"12%",width:"76%",height:"78%",background:`repeating-linear-gradient(0deg,${bg2}33 0px,${bg2}33 2px,transparent 2px,transparent 4px)`,border:`1px solid ${bg1}44`,borderRadius:1}}/></>,
    "avv-l": () => <><div style={{position:"absolute",left:"5%",top:"8%",width:6,height:"82%",background:bg1,borderRadius:2}}/><div style={{position:"absolute",left:"10%",top:"10%",width:"82%",height:"78%",background:`repeating-linear-gradient(90deg,${bg2}33 0px,${bg2}33 2px,transparent 2px,transparent 4px)`,border:`1px solid ${bg1}44`,borderRadius:1}}/></>,
    "plisse-v": () => <><div style={{position:"absolute",left:"10%",top:"5%",width:"80%",height:5,background:bg1,borderRadius:2}}/>{Array.from({length:12},(_,i)=><div key={i} style={{position:"absolute",left:"12%",top:`${12+i*7}%`,width:"76%",height:2,background:i%2?bg1+"55":bg2+"55"}}/>)}</>,
    "plisse-l": () => <><div style={{position:"absolute",left:"5%",top:"8%",width:5,height:"82%",background:bg1,borderRadius:2}}/>{Array.from({length:10},(_,i)=><div key={i} style={{position:"absolute",left:`${10+i*8.5}%`,top:"10%",width:2,height:"78%",background:i%2?bg1+"55":bg2+"55"}}/>)}</>,
    "zip-z": () => <><div style={{position:"absolute",left:"8%",top:"5%",width:"84%",height:"88%",background:bg1+"22",border:`2px solid ${bg1}`,borderRadius:2}}/><div style={{position:"absolute",left:"8%",top:"5%",width:4,height:"88%",background:bg2}}/><div style={{position:"absolute",right:"8%",top:"5%",width:4,height:"88%",background:bg2}}/><div style={{position:"absolute",left:"15%",top:"12%",width:"70%",height:"72%",background:`repeating-linear-gradient(0deg,${bg2}22 0px,${bg2}22 2px,transparent 2px,transparent 4px)`}}/></>,
    "incasso": () => <><div style={{position:"absolute",left:"5%",top:"5%",width:"20%",height:"88%",background:bg2+"44",borderRadius:2}}/><div style={{position:"absolute",left:"28%",top:"8%",width:"64%",height:"82%",background:`repeating-linear-gradient(0deg,${bg1}22 0px,${bg1}22 2px,transparent 2px,transparent 4px)`,borderRadius:1,border:`1px solid ${bg1}33`}}/></>,
    "batt-z": () => <><div style={{position:"absolute",left:"15%",top:"5%",width:"70%",height:"88%",border:`2px solid ${bg1}`,borderRadius:2}}/><div style={{position:"absolute",left:"18%",top:"10%",width:"64%",height:"78%",background:`repeating-linear-gradient(0deg,${bg2}33 0px,${bg2}33 2px,transparent 2px,transparent 4px)`}}/><div style={{position:"absolute",left:"18%",top:"45%",width:5,height:5,borderRadius:3,background:bg1}}/></>,
    "scorr-z": () => <><div style={{position:"absolute",left:"5%",top:"88%",width:"90%",height:4,background:bg1,borderRadius:1}}/><div style={{position:"absolute",left:"5%",top:"8%",width:"42%",height:"80%",background:`repeating-linear-gradient(0deg,${bg1}22 0px,${bg1}22 2px,transparent 2px,transparent 4px)`,border:`1px solid ${bg1}44`,borderRadius:1}}/><div style={{position:"absolute",right:"5%",top:"8%",width:"42%",height:"80%",background:`repeating-linear-gradient(0deg,${bg2}22 0px,${bg2}22 2px,transparent 2px,transparent 4px)`,border:`1px solid ${bg2}44`,borderRadius:1}}/></>,
  };
  return <div style={{ width: "100%", height: 80, background: `linear-gradient(145deg,${bg1}12,${bg2}20)`, position: "relative", overflow: "hidden" }}>{(shapes[shape]||shapes["avv-v"])()}</div>;
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

export default function MastroZanzariereDemo() {
  const [d, setD] = useState({});
  const [openSec, setOpenSec] = useState({ tipo: true, misure: true, rete: false, config: false });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const tog = (s) => setOpenSec(prev => ({ ...prev, [s]: !prev[s] }));

  const tipoCount = [d.modello, d.categoria, d.apertura].filter(Boolean).length;
  const misureCount = [d.larghezza, d.altezza].filter(Boolean).length;
  const reteCount = [d.rete].filter(Boolean).length;
  const configCount = [d.colore, d.guida, d.manovra, d.profilo, d.aggancio].filter(Boolean).length;
  const totalFields = tipoCount + misureCount + reteCount + configCount;
  const totalMax = 11;

  const modelliVisibili = d.categoria ? MODELLI.filter(m => m.tipo === d.categoria) : MODELLI;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: FF }}>
      <div style={{ background: T.topbar, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 99 }}>
        <span style={{ fontSize: 20 }}>🦟</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Presa Misure — Zanzariera</div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Vano F1 · Soggiorno</div>
        </div>
        <div style={{ background: totalFields >= totalMax * 0.7 ? T.green + "30" : T.acc + "30", color: totalFields >= totalMax * 0.7 ? T.green : T.acc, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, fontFamily: FM }}>{totalFields}/{totalMax}</div>
      </div>
      <div style={{ height: 3, background: T.bdr }}><div style={{ height: 3, background: totalFields >= totalMax * 0.7 ? T.green : T.acc, width: `${(totalFields / totalMax) * 100}%`, transition: "width .3s ease" }} /></div>

      <div style={{ padding: "8px 16px 100px 16px" }}>
        {/* TIPOLOGIA */}
        <Sec icon="🦟" title="Categoria e modello" count={tipoCount} open={openSec.tipo} onToggle={() => tog("tipo")} />
        {openSec.tipo && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Categoria" options={CATEGORIE} value={d.categoria} onChange={v => set("categoria", v)} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase" }}>Modello {d.categoria ? `· ${modelliVisibili.length}` : ""}</div>
              {d.modello && <div onClick={() => set("modello", null)} style={{ fontSize: 9, color: T.red, cursor: "pointer", fontWeight: 700 }}>✕ Rimuovi</div>}
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
              {modelliVisibili.map(mod => <ModelCard key={mod.id} model={mod} selected={d.modello === mod.id} onTap={() => set("modello", d.modello === mod.id ? null : mod.id)} />)}
              <div style={{ width: 100, minHeight: 130, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, background: T.card }}><span style={{ fontSize: 24, color: T.sub }}>+</span><span style={{ fontSize: 9, color: T.sub, fontWeight: 600 }}>Aggiungi</span></div>
            </div>
          </div>
          <ChipSel label="Lato apertura" options={APERTURE} value={d.apertura} onChange={v => set("apertura", v)} small />
        </div>)}

        {/* MISURE */}
        <Sec icon="📐" title="Misure" count={misureCount} open={openSec.misure} onToggle={() => tog("misure")} />
        {openSec.misure && (<div style={{ animation: "fadeIn .2s ease" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Misura rapida</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {MISURE_STD.map(ms => <Chip key={ms.lb} label={ms.lb} selected={d.larghezza === ms.l && d.altezza === ms.h} onTap={() => { set("larghezza", ms.l); set("altezza", ms.h); }} />)}
          </div>
          <NumInput label="Larghezza luce" value={d.larghezza} onChange={v => set("larghezza", v)} />
          <NumInput label="Altezza luce" value={d.altezza} onChange={v => set("altezza", v)} />
          <NumInput label="Profondità incasso" value={d.profIncasso} onChange={v => set("profIncasso", v)} placeholder="Solo per modelli a incasso" />
          {d.larghezza > 1800 && (d.categoria || "").includes("verticale") && (
            <div style={{ fontSize: 10, color: T.acc, background: T.acc + "12", padding: "6px 10px", borderRadius: 8, marginBottom: 10 }}>
              ⚠️ Larghezza &gt;1800mm — valutare soluzione a 2 ante o scorrevole
            </div>
          )}
        </div>)}

        {/* RETE */}
        <Sec icon="🔬" title="Tipo rete" count={reteCount} open={openSec.rete} onToggle={() => tog("rete")} />
        {openSec.rete && (<div style={{ animation: "fadeIn .2s ease" }}>
          {RETI.map(r => (
            <div key={r.nome} onClick={() => set("rete", r.nome)} style={{
              padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${d.rete === r.nome ? T.acc : T.bdr}`,
              background: d.rete === r.nome ? T.acc + "0a" : T.card, cursor: "pointer", marginBottom: 6,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: d.rete === r.nome ? 700 : 500, color: d.rete === r.nome ? T.acc : T.text }}>{r.nome}</span>
                {r.prezzo && <span style={{ fontSize: 10, fontWeight: 700, color: T.acc, background: T.acc + "15", padding: "2px 8px", borderRadius: 8 }}>{r.prezzo}</span>}
              </div>
              <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>{r.desc}</div>
            </div>
          ))}
        </div>)}

        {/* CONFIG */}
        <Sec icon="⚙️" title="Profilo, guide e finitura" count={configCount} open={openSec.config} onToggle={() => tog("config")} />
        {openSec.config && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Profilo telaio" options={PROFILO} value={d.profilo} onChange={v => set("profilo", v)} small />
          <ChipSel label="Sistema di aggancio" options={AGGANCIO_ZANZ} value={d.aggancio} onChange={v => set("aggancio", v)} />
          <ChipSel label="Guide laterali" options={GUIDE} value={d.guida} onChange={v => set("guida", v)} small />
          <ChipSel label="Manovra" options={MANOVRA} value={d.manovra} onChange={v => set("manovra", v)} small />
          <ChipSel label="Colore profilo" options={COLORI} value={d.colore} onChange={v => set("colore", v)} small />
        </div>)}

        {/* NOTE + FOTO */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Note</div>
          <textarea value={d.note || ""} onChange={e => set("note", e.target.value)} placeholder="Montaggio su infisso, davanzale sporgente, tapparella esistente..." style={{ width: "100%", padding: "12px 14px", fontSize: 12, fontFamily: FF, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {["📷 Foto","📐 Schizzo","🎤 Vocale"].map(b => (
            <div key={b} style={{ flex: 1, height: 70, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: T.card }}>
              <span style={{ fontSize: 20 }}>{b.split(" ")[0]}</span><span style={{ fontSize: 9, color: T.sub, fontWeight: 600, marginTop: 2 }}>{b.split(" ")[1]}</span>
            </div>
          ))}
        </div>

        {/* RIEPILOGO */}
        {totalFields >= 4 && (
          <div style={{ marginTop: 20, background: T.card, borderRadius: 14, border: `1.5px solid ${T.bdr}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: T.topbar, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📋</span><span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Riepilogo Zanzariera</span>
            </div>
            <div style={{ padding: "14px 16px", fontSize: 12, lineHeight: 2, color: T.text }}>
              {d.categoria && <div><span style={{ color: T.sub }}>Categoria:</span> <strong>{d.categoria}</strong></div>}
              {d.modello && (() => { const m = MODELLI.find(x => x.id === d.modello); return m ? <div><span style={{ color: T.sub }}>Modello:</span> <strong>{m.nome}</strong></div> : null; })()}
              {d.apertura && <div><span style={{ color: T.sub }}>Apertura:</span> <strong>{d.apertura}</strong></div>}
              {d.larghezza > 0 && <div><span style={{ color: T.sub }}>Misure:</span> <strong style={{ fontFamily: FM }}>{d.larghezza}×{d.altezza}</strong> mm</div>}
              {d.rete && <div><span style={{ color: T.sub }}>Rete:</span> <strong>{d.rete}</strong></div>}
              {d.profilo && <div><span style={{ color: T.sub }}>Profilo:</span> <strong>{d.profilo}</strong></div>}
              {d.aggancio && <div><span style={{ color: T.sub }}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
              {d.guida && <div><span style={{ color: T.sub }}>Guide:</span> <strong>{d.guida}</strong></div>}
              {d.manovra && <div><span style={{ color: T.sub }}>Manovra:</span> <strong>{d.manovra}</strong></div>}
              {d.colore && <div><span style={{ color: T.sub }}>Colore:</span> <strong>{d.colore}</strong></div>}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.bdr}`, padding: "12px 16px", display: "flex", gap: 10, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ flex: 1, padding: "14px", borderRadius: 12, background: T.bg, textAlign: "center", fontSize: 13, fontWeight: 700, color: T.sub }}>← Indietro</div>
        <div style={{ flex: 2, padding: "14px", borderRadius: 12, background: totalFields >= 4 ? T.acc : T.bdr, textAlign: "center", fontSize: 13, fontWeight: 800, color: totalFields >= 4 ? "#fff" : T.sub, transition: "all .2s" }}>✓ Salva zanzariera</div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } input:focus, select:focus, textarea:focus { border-color: ${T.acc} !important; box-shadow: 0 0 0 3px ${T.acc}20; } * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}
