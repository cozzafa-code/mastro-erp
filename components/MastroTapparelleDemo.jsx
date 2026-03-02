import { useState } from "react";

const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", r: 14 };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ CATALOGO TAPPARELLE ═══
const TIPOLOGIE = ["Avvolgibile tradizionale","Avvolgibile coibentata","Blindata / Antieffrazione","Frangisole orientabile","Micro-forate","Solare integrata","ZIP screen"];
const MATERIALI_TAPP = ["PVC","Alluminio coibentato","Alluminio estruso","Acciaio blindato","Legno"];
const STECCHE_TIPO = ["Mini 9mm (39mm)","Maxi 14mm (55mm)","Coibentata alta densità","Microforata","Blindata 16mm"];
const COLORI = ["Bianco RAL 9010","Avorio RAL 1013","Marrone RAL 8017","Grigio RAL 7016","Antracite RAL 7016S","Verde RAL 6005","Testa di moro","Effetto legno noce","Effetto legno rovere","RAL custom"];
const GUIDE = ["Guide standard 30mm","Guide standard 40mm","Guide rinforzate antivento","Guide ZIP laterali","Guide a scomparsa","Guide per cappotto termico"];
const MANOVRA = ["Cinghia 14mm","Cinghia 22mm","Molla a frizione","Verricello (argano)","Asta/Palo","Motorizzata tubo Ø35","Motorizzata tubo Ø45","Motorizzata tubo Ø60","Motorizzata radio","Motorizzata WiFi/App"];

// CASSONETTI — catalogo completo
const CASSONETTI = [
  { id: "cs01", nome: "IFC 25×25",     dim: "25×25cm", tipo: "Frontale ispezionabile",  shape: "cass-std", bg1: "#a1a1aa", bg2: "#d4d4d8" },
  { id: "cs02", nome: "IFC 30×25",     dim: "30×25cm", tipo: "Frontale ispezionabile",  shape: "cass-std", bg1: "#a1a1aa", bg2: "#d4d4d8" },
  { id: "cs03", nome: "IFC 30×30",     dim: "30×30cm", tipo: "Frontale ispezionabile",  shape: "cass-big", bg1: "#78716c", bg2: "#a1a1aa" },
  { id: "cs04", nome: "IFC 35×30",     dim: "35×30cm", tipo: "Frontale ispezionabile",  shape: "cass-big", bg1: "#78716c", bg2: "#a1a1aa" },
  { id: "cs05", nome: "IFM Modulare",  dim: "Variabile",tipo: "Frontale modulare",      shape: "cass-mod", bg1: "#57534e", bg2: "#78716c" },
  { id: "cs06", nome: "IFCL Ristrutt", dim: "Variabile",tipo: "Ristrutturazione",       shape: "cass-rist",bg1: "#92400e", bg2: "#b45309" },
  { id: "cs07", nome: "ELIO",          dim: "Compatto", tipo: "Monoblocco termoisolato", shape: "cass-mono",bg1: "#b45309", bg2: "#fbbf24" },
  { id: "cs08", nome: "VP",            dim: "Standard", tipo: "Monoblocco versatile",    shape: "cass-mono",bg1: "#94a3b8", bg2: "#e2e8f0" },
  { id: "cs09", nome: "TF",            dim: "Compatto", tipo: "Cassonetto a soffitto",   shape: "cass-soff",bg1: "#d6d3d1", bg2: "#f5f5f4" },
  { id: "cs10", nome: "KALOS",         dim: "Premium",  tipo: "Finitura pregiata",       shape: "cass-prem",bg1: "#a18072", bg2: "#d6cfc7" },
  { id: "cs11", nome: "NOLAM",         dim: "Standard", tipo: "Senza lamiera esterna",   shape: "cass-std", bg1: "#d6d3d1", bg2: "#fafaf9" },
];
const ISPEZIONE = ["Frontale","Inferiore","Laterale"];
const TAPPO = ["Standard","Antisfilamento","Con guarnizione","Con isolamento"];
const SPALLE = ["Standard","Rinforzate","Con taglio termico"];

const MODELLI = [
  { id: "t01", nome: "Coibentata Standard", tipo: "Avvolgibile coibentata", shape: "coib",    bg1: "#a1a1aa", bg2: "#d4d4d8" },
  { id: "t02", nome: "Mini PVC",            tipo: "Avvolgibile tradizionale",shape: "mini",   bg1: "#d6d3d1", bg2: "#f5f5f4" },
  { id: "t03", nome: "Blindata RC2",        tipo: "Blindata / Antieffrazione",shape: "blind-t",bg1: "#57534e", bg2: "#78716c" },
  { id: "t04", nome: "Frangisole Alu",      tipo: "Frangisole orientabile", shape: "frangi",  bg1: "#92400e", bg2: "#fbbf24" },
  { id: "t05", nome: "ZIP Screen",          tipo: "ZIP screen",             shape: "zip",     bg1: "#27272a", bg2: "#44403c" },
  { id: "t06", nome: "Solare Smart",        tipo: "Solare integrata",       shape: "solare",  bg1: "#1d4ed8", bg2: "#93c5fd" },
];
const AGGANCIO_TAPP = ["Frontale a muro","A pavimento","Su cassonetto esistente","Su controtelaio","Incasso a filo","Retro-serramento"];
const MISURE_STD = [{l:600,h:1200,lb:"60×120"},{l:800,h:1200,lb:"80×120"},{l:800,h:1400,lb:"80×140"},{l:1000,h:1400,lb:"100×140"},{l:1200,h:1400,lb:"120×140"},{l:1400,h:1600,lb:"140×160"},{l:1800,h:2200,lb:"180×220"}];

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
  const row = (y, col, w=76, l=12) => <div key={y} style={{ position: "absolute", left: `${l}%`, top: `${y}%`, width: `${w}%`, height: "4%", background: col, borderRadius: 1 }} />;
  const shapes = {
    "coib": () => <>{Array.from({length:9},(_,i)=>row(8+i*9.5, i%2?bg1:bg2))}<div style={{position:"absolute",left:"40%",top:"3%",width:"20%",height:"5%",background:bg1,borderRadius:2}}/></>,
    "mini": () => <>{Array.from({length:11},(_,i)=>row(5+i*8, i%2?bg1+"88":bg2))}</>,
    "blind-t": () => <><div style={{position:"absolute",left:"8%",top:"5%",width:"84%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:2}}/>{Array.from({length:8},(_,i)=>row(10+i*10,bg1+"55"))}</>,
    "frangi": () => <>{Array.from({length:6},(_,i)=><div key={i} style={{position:"absolute",left:"12%",top:`${10+i*14}%`,width:"76%",height:"7%",background:bg1,borderRadius:1,transform:"rotateX(45deg)"}}/>)}</>,
    "zip": () => <><div style={{position:"absolute",left:"5%",top:"5%",width:"90%",height:"88%",background:bg1,borderRadius:2}}/><div style={{position:"absolute",left:"5%",top:"5%",width:3,height:"88%",background:bg2}}/><div style={{position:"absolute",right:"5%",top:"5%",width:3,height:"88%",background:bg2}}/>{Array.from({length:10},(_,i)=>row(8+i*8.5,bg2+"33",86,7))}</>,
    "solare": () => <>{Array.from({length:8},(_,i)=>row(10+i*10, bg1+"66"))}<div style={{position:"absolute",right:"12%",top:"3%",width:12,height:8,background:bg2,borderRadius:2}}/><div style={{position:"absolute",right:"15%",top:"1%",width:6,height:4,background:bg2+"88",borderRadius:1}}/></>,
    "cass-std": () => <><div style={{position:"absolute",left:"10%",top:"15%",width:"80%",height:"65%",border:`2px solid ${bg1}`,borderRadius:3,background:bg2+"22"}}/><div style={{position:"absolute",left:"15%",top:"70%",width:"70%",height:3,background:bg1}}/></>,
    "cass-big": () => <><div style={{position:"absolute",left:"8%",top:"10%",width:"84%",height:"75%",border:`2px solid ${bg1}`,borderRadius:3,background:bg2+"22"}}/><div style={{position:"absolute",left:"13%",top:"75%",width:"74%",height:3,background:bg1}}/><div style={{position:"absolute",left:"13%",top:"20%",width:"74%",height:2,background:bg1+"44"}}/></>,
    "cass-mod": () => <><div style={{position:"absolute",left:"5%",top:"12%",width:"42%",height:"72%",border:`2px solid ${bg1}`,borderRadius:2,background:bg2+"15"}}/><div style={{position:"absolute",right:"5%",top:"12%",width:"42%",height:"72%",border:`2px solid ${bg1}`,borderRadius:2,background:bg2+"15"}}/></>,
    "cass-rist": () => <><div style={{position:"absolute",left:"10%",top:"10%",width:"80%",height:"75%",border:`2px dashed ${bg1}`,borderRadius:3,background:bg2+"11"}}/><div style={{position:"absolute",left:"35%",top:"35%",width:"30%",height:"30%",border:`2px solid ${bg1}`,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:3,height:"60%",background:bg1,transform:"rotate(45deg)"}}/></div></>,
    "cass-mono": () => <><div style={{position:"absolute",left:"8%",top:"8%",width:"84%",height:"80%",background:`linear-gradient(180deg,${bg1}33,${bg2}44)`,borderRadius:4,border:`2px solid ${bg1}55`}}/><div style={{position:"absolute",left:"15%",top:"75%",width:"70%",height:3,background:bg1}}/></>,
    "cass-soff": () => <><div style={{position:"absolute",left:"5%",top:"5%",width:"90%",height:"25%",background:bg1+"44",borderRadius:"3px 3px 0 0"}}/><div style={{position:"absolute",left:"5%",top:"30%",width:"90%",height:"60%",border:`1.5px solid ${bg2}`,borderRadius:"0 0 3px 3px",background:bg2+"11"}}/></>,
    "cass-prem": () => <><div style={{position:"absolute",left:"8%",top:"10%",width:"84%",height:"75%",background:`linear-gradient(135deg,${bg1}44,${bg2}55)`,borderRadius:4,border:`1.5px solid ${bg1}66`}}/>{Array.from({length:3},(_,i)=><div key={i} style={{position:"absolute",left:"15%",top:`${25+i*18}%`,width:"70%",height:2,background:bg1+"33"}}/>)}</>,
  };
  return <div style={{ width: "100%", height: 80, background: `linear-gradient(145deg,${bg1}15,${bg2}25)`, position: "relative", overflow: "hidden" }}>{(shapes[shape]||shapes["coib"])()}</div>;
};

const ModelCard = ({ model, selected, onTap }) => (
  <div onClick={onTap} style={{ width: 100, minHeight: 130, borderRadius: 12, border: `2px solid ${selected ? T.acc : T.bdr}`, background: selected ? T.acc + "0a" : T.card, cursor: "pointer", overflow: "hidden", transition: "all .15s ease", flexShrink: 0, boxShadow: selected ? `0 2px 12px ${T.acc}25` : "none" }}>
    <div style={{ position: "relative" }}>
      <Thumb shape={model.shape} bg1={model.bg1} bg2={model.bg2} />
      {selected && <div style={{ position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 9, background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 800, zIndex: 2 }}>✓</div>}
    </div>
    <div style={{ padding: "6px 8px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: selected ? T.acc : T.text, lineHeight: 1.3 }}>{model.nome}</div>
      <div style={{ fontSize: 8, color: T.sub, marginTop: 2 }}>{model.dim || model.tipo}</div>
    </div>
  </div>
);

export default function MastroTapparelleDemo() {
  const [d, setD] = useState({});
  const [openSec, setOpenSec] = useState({ tipo: true, misure: true, cass: false, guide: false });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const tog = (s) => setOpenSec(prev => ({ ...prev, [s]: !prev[s] }));

  const tipoCount = [d.modello, d.tipologia, d.materiale].filter(Boolean).length;
  const misureCount = [d.larghezza, d.altezza].filter(Boolean).length;
  const cassCount = [d.cassonetto, d.ispezione].filter(Boolean).length;
  const guideCount = [d.guida, d.manovra, d.colore, d.aggancio].filter(Boolean).length;
  const totalFields = tipoCount + misureCount + cassCount + guideCount;
  const totalMax = 12;

  const modelliVisibili = d.tipologia ? MODELLI.filter(m => m.tipo === d.tipologia) : MODELLI;
  const isMotorizzata = (d.manovra || "").includes("Motor");

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: FF }}>
      <div style={{ background: T.topbar, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 99 }}>
        <span style={{ fontSize: 20 }}>🔲</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Presa Misure — Tapparella</div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Vano F1 · Soggiorno</div>
        </div>
        <div style={{ background: totalFields >= totalMax * 0.7 ? T.green + "30" : T.acc + "30", color: totalFields >= totalMax * 0.7 ? T.green : T.acc, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, fontFamily: FM }}>{totalFields}/{totalMax}</div>
      </div>
      <div style={{ height: 3, background: T.bdr }}><div style={{ height: 3, background: totalFields >= totalMax * 0.7 ? T.green : T.acc, width: `${(totalFields / totalMax) * 100}%`, transition: "width .3s ease" }} /></div>

      <div style={{ padding: "8px 16px 100px 16px" }}>
        {/* TIPOLOGIA */}
        <Sec icon="🔲" title="Tipologia e modello" count={tipoCount} open={openSec.tipo} onToggle={() => tog("tipo")} />
        {openSec.tipo && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Tipologia" options={TIPOLOGIE} value={d.tipologia} onChange={v => set("tipologia", v)} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase" }}>Modello {d.tipologia ? `· ${modelliVisibili.length}` : ""}</div>
              {d.modello && <div onClick={() => set("modello", null)} style={{ fontSize: 9, color: T.red, cursor: "pointer", fontWeight: 700 }}>✕ Rimuovi</div>}
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
              {modelliVisibili.map(mod => <ModelCard key={mod.id} model={mod} selected={d.modello === mod.id} onTap={() => set("modello", d.modello === mod.id ? null : mod.id)} />)}
              <div style={{ width: 100, minHeight: 130, borderRadius: 12, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, background: T.card }}><span style={{ fontSize: 24, color: T.sub }}>+</span><span style={{ fontSize: 9, color: T.sub, fontWeight: 600 }}>Aggiungi</span></div>
            </div>
          </div>
          <ChipSel label="Materiale tapparella" options={MATERIALI_TAPP} value={d.materiale} onChange={v => set("materiale", v)} />
          <ChipSel label="Tipo stecca" options={STECCHE_TIPO} value={d.stecca} onChange={v => set("stecca", v)} small />
        </div>)}

        {/* MISURE */}
        <Sec icon="📐" title="Misure" count={misureCount} open={openSec.misure} onToggle={() => tog("misure")} />
        {openSec.misure && (<div style={{ animation: "fadeIn .2s ease" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Misura rapida</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
            {MISURE_STD.map(ms => <Chip key={ms.lb} label={ms.lb} selected={d.larghezza === ms.l && d.altezza === ms.h} onTap={() => { set("larghezza", ms.l); set("altezza", ms.h); }} />)}
          </div>
          <NumInput label="Larghezza vano" value={d.larghezza} onChange={v => set("larghezza", v)} />
          <NumInput label="Altezza caduta" value={d.altezza} onChange={v => set("altezza", v)} />
        </div>)}

        {/* CASSONETTO */}
        <Sec icon="📦" title="Cassonetto" count={cassCount} open={openSec.cass} onToggle={() => tog("cass")} />
        {openSec.cass && (<div style={{ animation: "fadeIn .2s ease" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 8, textTransform: "uppercase" }}>Modello cassonetto</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
            {CASSONETTI.map(cs => <ModelCard key={cs.id} model={cs} selected={d.cassonetto === cs.id} onTap={() => set("cassonetto", d.cassonetto === cs.id ? null : cs.id)} />)}
          </div>
          {d.cassonetto && (() => { const c = CASSONETTI.find(x => x.id === d.cassonetto); return c ? (
            <div style={{ background: T.acc + "0c", border: "1px solid " + T.acc + "25", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.acc }}>{c.nome} — {c.dim}</div>
              <div style={{ fontSize: 10, color: T.sub }}>{c.tipo}</div>
            </div>
          ) : null; })()}
          <ChipSel label="Ispezione" options={ISPEZIONE} value={d.ispezione} onChange={v => set("ispezione", v)} small />
          <ChipSel label="Tappo" options={TAPPO} value={d.tappo} onChange={v => set("tappo", v)} small />
          <ChipSel label="Spalle" options={SPALLE} value={d.spalle} onChange={v => set("spalle", v)} small />
          <NumInput label="Larghezza cassonetto" value={d.largCass} onChange={v => set("largCass", v)} placeholder="Se diversa dal vano" />
        </div>)}

        {/* GUIDE + MANOVRA */}
        <Sec icon="⚙️" title="Guide, manovra e finitura" count={guideCount} open={openSec.guide} onToggle={() => tog("guide")} />
        {openSec.guide && (<div style={{ animation: "fadeIn .2s ease" }}>
          <ChipSel label="Guide laterali" options={GUIDE} value={d.guida} onChange={v => set("guida", v)} small />
          <ChipSel label="Sistema di aggancio" options={AGGANCIO_TAPP} value={d.aggancio} onChange={v => set("aggancio", v)} />
          <ChipSel label="Manovra / Comando" options={MANOVRA} value={d.manovra} onChange={v => set("manovra", v)} />
          {isMotorizzata && (
            <div style={{ fontSize: 10, color: T.green, background: T.green + "12", padding: "8px 12px", borderRadius: 8, marginBottom: 10 }}>
              💡 Verificare alimentazione elettrica nel cassonetto — predisporre tubo Ø20
            </div>
          )}
          <ChipSel label="Colore" options={COLORI} value={d.colore} onChange={v => set("colore", v)} small />
        </div>)}

        {/* NOTE + FOTO */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Note</div>
          <textarea value={d.note || ""} onChange={e => set("note", e.target.value)} placeholder="Cassonetto incassato, cappotto, posizione cinghia..." style={{ width: "100%", padding: "12px 14px", fontSize: 12, fontFamily: FF, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
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
              <span style={{ fontSize: 14 }}>📋</span><span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Riepilogo Tapparella</span>
            </div>
            <div style={{ padding: "14px 16px", fontSize: 12, lineHeight: 2, color: T.text }}>
              {d.tipologia && <div><span style={{ color: T.sub }}>Tipo:</span> <strong>{d.tipologia}</strong></div>}
              {d.modello && (() => { const m = MODELLI.find(x => x.id === d.modello); return m ? <div><span style={{ color: T.sub }}>Modello:</span> <strong>{m.nome}</strong></div> : null; })()}
              {d.materiale && <div><span style={{ color: T.sub }}>Materiale:</span> <strong>{d.materiale}</strong></div>}
              {d.stecca && <div><span style={{ color: T.sub }}>Stecca:</span> <strong>{d.stecca}</strong></div>}
              {d.larghezza > 0 && <div><span style={{ color: T.sub }}>Misure:</span> <strong style={{ fontFamily: FM }}>{d.larghezza}×{d.altezza}</strong> mm</div>}
              {d.cassonetto && (() => { const c = CASSONETTI.find(x => x.id === d.cassonetto); return c ? <div><span style={{ color: T.sub }}>📦 Cassonetto:</span> <strong>{c.nome}</strong> ({c.dim})</div> : null; })()}
              {d.guida && <div><span style={{ color: T.sub }}>Guide:</span> <strong>{d.guida}</strong></div>}
              {d.aggancio && <div><span style={{ color: T.sub }}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
              {d.manovra && <div><span style={{ color: T.sub }}>Manovra:</span> <strong>{d.manovra}</strong></div>}
              {d.colore && <div><span style={{ color: T.sub }}>Colore:</span> <strong>{d.colore}</strong></div>}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.bdr}`, padding: "12px 16px", display: "flex", gap: 10, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ flex: 1, padding: "14px", borderRadius: 12, background: T.bg, textAlign: "center", fontSize: 13, fontWeight: 700, color: T.sub }}>← Indietro</div>
        <div style={{ flex: 2, padding: "14px", borderRadius: 12, background: totalFields >= 4 ? T.acc : T.bdr, textAlign: "center", fontSize: 13, fontWeight: 800, color: totalFields >= 4 ? "#fff" : T.sub, transition: "all .2s" }}>✓ Salva tapparella</div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } input:focus, select:focus, textarea:focus { border-color: ${T.acc} !important; box-shadow: 0 0 0 3px ${T.acc}20; } * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}
