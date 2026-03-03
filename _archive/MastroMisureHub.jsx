import { useState } from "react";

// ═══ MASTRO DS v1.0 ═══
const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", blue: "#3B7FE0", r: 14 };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ SETTORI DISPONIBILI ═══
const SETTORI = [
  { id: "serramenti", nome: "Serramenti",   icon: "ser",  colore: "#3B7FE0", desc: "Finestre, portefinestre, fissi" },
  { id: "porte",      nome: "Porte",        icon: "por",  colore: "#D08008", desc: "Interne, blindate, EI, scorrevoli" },
  { id: "persiane",   nome: "Persiane",     icon: "per",  colore: "#1A9E73", desc: "Battenti, scorrevoli, libro, fisse" },
  { id: "tapparelle", nome: "Tapparelle",   icon: "tap",  colore: "#7c3aed", desc: "Avvolgibili, blindate, ZIP, cassonetti" },
  { id: "zanzariere", nome: "Zanzariere",   icon: "zan",  colore: "#0891b2", desc: "Avvolgenti, plissettate, battenti" },
  { id: "cancelli",   nome: "Cancelli",     icon: "can",  colore: "#dc2626", desc: "Battenti, scorrevoli, recinzioni" },
  { id: "tendeSole",  nome: "Tende Sole",   icon: "tds",  colore: "#ea580c", desc: "Bracci, caduta, pergotende" },
  { id: "tendeInt",   nome: "Tende Interno",icon: "tdi",  colore: "#be185d", desc: "Rullo, veneziane, plissettate" },
  { id: "boxDoccia",  nome: "Box Doccia",   icon: "box",  colore: "#0d9488", desc: "Nicchia, angolare, walk-in" },
];

// ═══ THUMBNAIL SHAPES per settori ═══
const SectorThumb = ({ id, size = 40 }) => {
  const s = size;
  const shapes = {
    ser: () => <svg width={s} height={s} viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="2" fill="none" stroke="#3B7FE0" strokeWidth="2"/><line x1="20" y1="4" x2="20" y2="36" stroke="#3B7FE0" strokeWidth="1.5"/><line x1="4" y1="20" x2="36" y2="20" stroke="#3B7FE0" strokeWidth="1.5"/><circle cx="18" cy="22" r="1.5" fill="#3B7FE0"/></svg>,
    por: () => <svg width={s} height={s} viewBox="0 0 40 40"><rect x="8" y="2" width="24" height="36" rx="2" fill="none" stroke="#D08008" strokeWidth="2"/><circle cx="27" cy="22" r="2" fill="#D08008"/><rect x="12" y="6" width="16" height="10" rx="1" fill="#D0800822"/></svg>,
    per: () => <svg width={s} height={s} viewBox="0 0 40 40"><rect x="4" y="4" width="14" height="32" rx="1" fill="none" stroke="#1A9E73" strokeWidth="1.5"/><rect x="22" y="4" width="14" height="32" rx="1" fill="none" stroke="#1A9E73" strokeWidth="1.5"/>{[0,1,2,3,4,5].map(i=><line key={i} x1="6" y1={8+i*5} x2="16" y2={8+i*5} stroke="#1A9E7366" strokeWidth="1"/>)}{[0,1,2,3,4,5].map(i=><line key={`r${i}`} x1="24" y1={8+i*5} x2="34" y2={8+i*5} stroke="#1A9E7366" strokeWidth="1"/>)}</svg>,
    tap: () => <svg width={s} height={s} viewBox="0 0 40 40"><rect x="6" y="2" width="28" height="6" rx="2" fill="#7c3aed33" stroke="#7c3aed" strokeWidth="1.5"/>{[0,1,2,3,4,5,6].map(i=><rect key={i} x="8" y={10+i*4} width="24" height="2.5" rx="1" fill={i%2?"#7c3aed44":"#7c3aed22"}/>)}</svg>,
    zan: () => <svg width={s} height={s} viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="2" fill="none" stroke="#0891b2" strokeWidth="1.5"/>{[0,1,2,3,4,5,6,7].map(i=><line key={i} x1="6" y1={7+i*4} x2="34" y2={7+i*4} stroke="#0891b222" strokeWidth="0.5"/>)}{[0,1,2,3,4,5,6,7].map(i=><line key={`v${i}`} x1={7+i*4} y1="6" x2={7+i*4} y2="34" stroke="#0891b222" strokeWidth="0.5"/>)}</svg>,
    can: () => <svg width={s} height={s} viewBox="0 0 40 40"><rect x="2" y="6" width="4" height="28" rx="1" fill="#dc262688"/><rect x="34" y="6" width="4" height="28" rx="1" fill="#dc262688"/>{[0,1,2,3,4].map(i=><rect key={i} x={9+i*5} y="8" width="2.5" height="24" rx="0.5" fill="#dc2626" fillOpacity={0.4+i*0.1}/>)}</svg>,
    tds: () => <svg width={s} height={s} viewBox="0 0 40 40"><path d="M4 8 Q20 2 36 8 L36 24 Q20 18 4 24 Z" fill="#ea580c22" stroke="#ea580c" strokeWidth="1.5"/><line x1="4" y1="24" x2="4" y2="36" stroke="#ea580c" strokeWidth="2"/><line x1="36" y1="24" x2="36" y2="36" stroke="#ea580c" strokeWidth="2"/></svg>,
    tdi: () => <svg width={s} height={s} viewBox="0 0 40 40"><rect x="6" y="2" width="28" height="4" rx="1" fill="#be185d55"/>{[0,1,2,3,4,5,6].map(i=><rect key={i} x="8" y={8+i*4.2} width="24" height="2.8" rx="0.5" fill={i%2?"#be185d33":"#be185d1a"}/>)}</svg>,
    box: () => <svg width={s} height={s} viewBox="0 0 40 40"><path d="M8 36 L8 8 Q8 4 12 4 L28 4 Q32 4 32 8 L32 36" fill="none" stroke="#0d9488" strokeWidth="2"/><line x1="8" y1="36" x2="32" y2="36" stroke="#0d9488" strokeWidth="2"/><rect x="14" y="10" width="12" height="20" rx="1" fill="#0d948811" stroke="#0d948844" strokeWidth="1"/></svg>,
  };
  return (shapes[id] || shapes.ser)();
};

// ═══ MINI FORM COMPONENTS ═══
const Chip = ({ label, selected, onTap, small, color }) => (
  <div onClick={onTap} style={{
    padding: small ? "5px 10px" : "8px 14px", borderRadius: 10,
    border: `1.5px solid ${selected ? (color||T.acc) : T.bdr}`,
    background: selected ? (color||T.acc) + "14" : T.card,
    fontSize: small ? 11 : 12, fontWeight: selected ? 700 : 500,
    color: selected ? (color||T.acc) : T.text, cursor: "pointer",
    transition: "all .15s ease", fontFamily: FF, userSelect: "none",
  }}>{label}</div>
);
const NumInput = ({ label, value, onChange, unit = "mm", placeholder }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 11, color: T.sub, marginBottom: 4, fontWeight: 600 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="number" inputMode="numeric" value={value || ""} onChange={e => onChange(parseInt(e.target.value) || 0)} placeholder={placeholder || ""} style={{ flex: 1, padding: "10px 12px", fontSize: 15, fontFamily: FM, fontWeight: 600, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, color: T.text, outline: "none" }} />
      <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "8px 10px", borderRadius: 8, fontWeight: 600 }}>{unit}</span>
    </div>
  </div>
);
const ChipSel = ({ label, options, value, onChange, small, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{options.map(o => <Chip key={o} label={o} selected={value === o} onTap={() => onChange(o)} small={small} color={color} />)}</div>
  </div>
);
const Sec = ({ icon, title, count, open, onToggle, color }) => (
  <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", cursor: "pointer", borderBottom: `1px solid ${T.bdr}`, marginBottom: open ? 12 : 0, userSelect: "none" }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: T.text, flex: 1 }}>{title}</span>
    {count > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: (color||T.acc) + "20", color: color||T.acc, padding: "2px 8px", borderRadius: 20 }}>{count}</span>}
    <span style={{ fontSize: 11, color: T.sub, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>▼</span>
  </div>
);

// ═══ INLINE SECTOR FORMS ═══
// Ogni form è una versione compatta delle demo. In produzione saranno import da componenti separati.

const FormSerramenti = ({ data, setData, color }) => {
  const d = data, set = (k,v) => setData({...d, [k]: v});
  const [op, setOp] = useState({ tipo: true, mis: true, conf: false });
  return (<>
    <Sec icon="🪟" title="Tipologia" count={[d.tipologia,d.sistema].filter(Boolean).length} open={op.tipo} onToggle={()=>setOp({...op,tipo:!op.tipo})} color={color} />
    {op.tipo && <><ChipSel label="Tipologia" options={["Finestra 1 anta","Finestra 2 ante","Portafinestra 1 anta","Portafinestra 2 ante","Vasistas","Bilico","Scorrevole","Alzante scorrevole","Fisso"]} value={d.tipologia} onChange={v=>set("tipologia",v)} color={color} />
    <ChipSel label="Sistema profilo" options={["Aluplast Ideal 4000","Aluplast Ideal 7000","Rehau Synego","Rehau Geneo","Schüco CT70","Schüco LivIng"]} value={d.sistema} onChange={v=>set("sistema",v)} color={color} small /></>}
    <Sec icon="📐" title="Misure" count={[d.larghezza,d.altezza].filter(Boolean).length} open={op.mis} onToggle={()=>setOp({...op,mis:!op.mis})} color={color} />
    {op.mis && <><div style={{display:"flex",gap:8}}><div style={{flex:1}}><NumInput label="Larghezza luce" value={d.larghezza} onChange={v=>set("larghezza",v)} /></div><div style={{flex:1}}><NumInput label="Altezza luce" value={d.altezza} onChange={v=>set("altezza",v)} /></div></div>
    <NumInput label="Profondità muro" value={d.profMuro} onChange={v=>set("profMuro",v)} /></>}
    <Sec icon="⚙️" title="Configurazione" count={[d.colore,d.vetro,d.apertura].filter(Boolean).length} open={op.conf} onToggle={()=>setOp({...op,conf:!op.conf})} color={color} />
    {op.conf && <><ChipSel label="Apertura" options={["Battente DX","Battente SX","Anta-ribalta DX","Anta-ribalta SX","Vasistas","Scorrevole"]} value={d.apertura} onChange={v=>set("apertura",v)} color={color} small />
    <ChipSel label="Vetro" options={["4/16/4 BE","4/18/4 BE","4/16/4/16/4 Triplo","Stratificato 33.1","Stratificato 44.2"]} value={d.vetro} onChange={v=>set("vetro",v)} color={color} small />
    <ChipSel label="Colore" options={["Bianco","Bianco/Pellicolato","Noce","Rovere dorato","Antracite RAL 7016","Grigio RAL 7001","RAL custom"]} value={d.colore} onChange={v=>set("colore",v)} color={color} small /></>}
  </>);
};

const FormPorte = ({ data, setData, color }) => {
  const d = data, set = (k,v) => setData({...d, [k]: v});
  const [op, setOp] = useState({ tipo: true, mis: true, conf: false, hoppe: false, cisa: false });
  return (<>
    <Sec icon="🚪" title="Tipologia" count={[d.materiale,d.apertura].filter(Boolean).length} open={op.tipo} onToggle={()=>setOp({...op,tipo:!op.tipo})} color={color} />
    {op.tipo && <><ChipSel label="Materiale" options={["Legno massello","Laccato opaco","Laminato CPL","Laminato HPL","Vetro temperato","Blindata","EI tagliafuoco","Light"]} value={d.materiale} onChange={v=>set("materiale",v)} color={color} />
    <ChipSel label="Apertura" options={["Battente","Scorrevole scomparsa","Scorrevole esterno","Libro","Roto-traslante","Filomuro"]} value={d.apertura} onChange={v=>set("apertura",v)} color={color} small /></>}
    <Sec icon="📐" title="Misure" count={[d.larghezza,d.altezza].filter(Boolean).length} open={op.mis} onToggle={()=>setOp({...op,mis:!op.mis})} color={color} />
    {op.mis && <><div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
      {[{l:700,h:2100,lb:"70×210"},{l:800,h:2100,lb:"80×210"},{l:900,h:2100,lb:"90×210"},{l:800,h:2400,lb:"80×240"},{l:900,h:2400,lb:"90×240"}].map(m=><Chip key={m.lb} label={m.lb} selected={d.larghezza===m.l&&d.altezza===m.h} onTap={()=>{set("larghezza",m.l);set("altezza",m.h)}} color={color} />)}
    </div>
    <div style={{display:"flex",gap:8}}><div style={{flex:1}}><NumInput label="Larghezza" value={d.larghezza} onChange={v=>set("larghezza",v)} /></div><div style={{flex:1}}><NumInput label="Altezza" value={d.altezza} onChange={v=>set("altezza",v)} /></div></div>
    <NumInput label="Spessore muro" value={d.spessoreMuro} onChange={v=>set("spessoreMuro",v)} /></>}
    <Sec icon="🔑" title="HOPPE Maniglieria" count={[d.hoppeGuarn,d.hoppeSerie].filter(Boolean).length} open={op.hoppe} onToggle={()=>setOp({...op,hoppe:!op.hoppe})} color={color} />
    {op.hoppe && <><ChipSel label="Guarnitura" options={["Su rosetta","Su placca","Maniglione","Scorrevole","Tagliafuoco"]} value={d.hoppeGuarn} onChange={v=>set("hoppeGuarn",v)} color={color} small />
    <ChipSel label="Serie" options={["Paris","Amsterdam","Tokyo","Atlanta","Milano","Singapore","Dallas"]} value={d.hoppeSerie} onChange={v=>set("hoppeSerie",v)} color={color} small /></>}
    <Sec icon="🔒" title="CISA Serratura" count={[d.cisaTipo,d.cisaCilindro].filter(Boolean).length} open={op.cisa} onToggle={()=>setOp({...op,cisa:!op.cisa})} color={color} />
    {op.cisa && <><ChipSel label="Tipo" options={["Da infilare standard","Da infilare 4 mandate","Multipunto","Elettroserratura","Smart DOMO"]} value={d.cisaTipo} onChange={v=>set("cisaTipo",v)} color={color} small />
    <ChipSel label="Cilindro" options={["Europeo standard","RS5 alta sicurezza","Pomolo","Fisso","Elettronico"]} value={d.cisaCilindro} onChange={v=>set("cisaCilindro",v)} color={color} small /></>}
  </>);
};

const FormPersiane = ({ data, setData, color }) => {
  const d = data, set = (k,v) => setData({...d, [k]: v});
  const [op, setOp] = useState({ tipo: true, mis: true });
  return (<>
    <Sec icon="🪟" title="Tipologia" count={[d.tipologia,d.materiale].filter(Boolean).length} open={op.tipo} onToggle={()=>setOp({...op,tipo:!op.tipo})} color={color} />
    {op.tipo && <><ChipSel label="Tipologia" options={["Battente fiorentina","Battente genovese","Battente romana","Scorrevole","Libro","Fissa solare"]} value={d.tipologia} onChange={v=>set("tipologia",v)} color={color} />
    <ChipSel label="Materiale" options={["Alluminio","Legno","PVC","Alluminio effetto legno","Ferro battuto"]} value={d.materiale} onChange={v=>set("materiale",v)} color={color} small />
    <ChipSel label="Aggancio" options={["A muro con cardini","A telaio finestra","Su controtelaio","Frontale su cappotto","A pavimento con perno","Incasso filo muro"]} value={d.aggancio} onChange={v=>set("aggancio",v)} color={color} small /></>}
    <Sec icon="📐" title="Misure" count={[d.larghezza,d.altezza].filter(Boolean).length} open={op.mis} onToggle={()=>setOp({...op,mis:!op.mis})} color={color} />
    {op.mis && <div style={{display:"flex",gap:8}}><div style={{flex:1}}><NumInput label="Larghezza" value={d.larghezza} onChange={v=>set("larghezza",v)} /></div><div style={{flex:1}}><NumInput label="Altezza" value={d.altezza} onChange={v=>set("altezza",v)} /></div></div>}
  </>);
};

const FormTapparelle = ({ data, setData, color }) => {
  const d = data, set = (k,v) => setData({...d, [k]: v});
  const [op, setOp] = useState({ tipo: true, mis: true, cass: false });
  return (<>
    <Sec icon="🔲" title="Tipologia" count={[d.tipologia,d.materiale].filter(Boolean).length} open={op.tipo} onToggle={()=>setOp({...op,tipo:!op.tipo})} color={color} />
    {op.tipo && <><ChipSel label="Tipologia" options={["Avvolgibile tradizionale","Avvolgibile coibentata","Blindata","Frangisole orientabile","ZIP screen","Solare integrata"]} value={d.tipologia} onChange={v=>set("tipologia",v)} color={color} />
    <ChipSel label="Materiale" options={["PVC","Alluminio coibentato","Alluminio estruso","Acciaio blindato"]} value={d.materiale} onChange={v=>set("materiale",v)} color={color} small />
    <ChipSel label="Manovra" options={["Cinghia 14mm","Cinghia 22mm","Molla","Verricello","Motorizzata Ø45","Motorizzata radio","WiFi/App"]} value={d.manovra} onChange={v=>set("manovra",v)} color={color} small />
    <ChipSel label="Aggancio" options={["Frontale a muro","A pavimento","Su cassonetto esistente","Su controtelaio","Incasso a filo","Retro-serramento"]} value={d.aggancio} onChange={v=>set("aggancio",v)} color={color} small /></>}
    <Sec icon="📐" title="Misure" count={[d.larghezza,d.altezza].filter(Boolean).length} open={op.mis} onToggle={()=>setOp({...op,mis:!op.mis})} color={color} />
    {op.mis && <div style={{display:"flex",gap:8}}><div style={{flex:1}}><NumInput label="Larghezza" value={d.larghezza} onChange={v=>set("larghezza",v)} /></div><div style={{flex:1}}><NumInput label="Altezza caduta" value={d.altezza} onChange={v=>set("altezza",v)} /></div></div>}
    <Sec icon="📦" title="Cassonetto" count={[d.cassonetto].filter(Boolean).length} open={op.cass} onToggle={()=>setOp({...op,cass:!op.cass})} color={color} />
    {op.cass && <ChipSel label="Modello" options={["IFC 25×25","IFC 30×25","IFC 30×30","IFC 35×30","IFM Modulare","IFCL Ristrutt","ELIO","VP","TF","KALOS","NOLAM"]} value={d.cassonetto} onChange={v=>set("cassonetto",v)} color={color} small />}
  </>);
};

const FormZanzariere = ({ data, setData, color }) => {
  const d = data, set = (k,v) => setData({...d, [k]: v});
  const [op, setOp] = useState({ tipo: true, mis: true });
  return (<>
    <Sec icon="🦟" title="Categoria" count={[d.categoria,d.rete].filter(Boolean).length} open={op.tipo} onToggle={()=>setOp({...op,tipo:!op.tipo})} color={color} />
    {op.tipo && <><ChipSel label="Categoria" options={["Avvolgente verticale","Avvolgente laterale","Plissettata verticale","Plissettata laterale","ZIP verticale","Incasso controtelaio","Battente","Scorrevole"]} value={d.categoria} onChange={v=>set("categoria",v)} color={color} />
    <ChipSel label="Tipo rete" options={["Standard 18×16","Antibatterica","Antivento","Pet Screen","Antipolline","Trasparente HD"]} value={d.rete} onChange={v=>set("rete",v)} color={color} small />
    <ChipSel label="Aggancio" options={["Frontale a muro","A pavimento","A soffitto","Su controtelaio","Su serramento (clip)","Incasso a filo"]} value={d.aggancio} onChange={v=>set("aggancio",v)} color={color} small /></>}
    <Sec icon="📐" title="Misure" count={[d.larghezza,d.altezza].filter(Boolean).length} open={op.mis} onToggle={()=>setOp({...op,mis:!op.mis})} color={color} />
    {op.mis && <div style={{display:"flex",gap:8}}><div style={{flex:1}}><NumInput label="Larghezza luce" value={d.larghezza} onChange={v=>set("larghezza",v)} /></div><div style={{flex:1}}><NumInput label="Altezza luce" value={d.altezza} onChange={v=>set("altezza",v)} /></div></div>}
  </>);
};

const FormCancelli = ({ data, setData, color }) => {
  const d = data, set = (k,v) => setData({...d, [k]: v});
  const [op, setOp] = useState({ tipo: true, mis: true, auto: false });
  return (<>
    <Sec icon="🏗️" title="Tipologia" count={[d.tipologia,d.materiale].filter(Boolean).length} open={op.tipo} onToggle={()=>setOp({...op,tipo:!op.tipo})} color={color} />
    {op.tipo && <><ChipSel label="Tipo" options={["Battente singolo","Battente doppio","Scorrevole","Pedonale","Recinzione pannello","Ringhiera"]} value={d.tipologia} onChange={v=>set("tipologia",v)} color={color} />
    <ChipSel label="Materiale" options={["Ferro zincato verniciato","Alluminio","Acciaio inox","COR-TEN","Ferro battuto"]} value={d.materiale} onChange={v=>set("materiale",v)} color={color} small />
    <ChipSel label="Aggancio" options={["A pavimento","Frontale a muro","Su pilastro","Su muretto","A soffitto (pensilina)","Incasso a filo"]} value={d.aggancio} onChange={v=>set("aggancio",v)} color={color} small /></>}
    <Sec icon="📐" title="Misure" count={[d.larghezza,d.altezza].filter(Boolean).length} open={op.mis} onToggle={()=>setOp({...op,mis:!op.mis})} color={color} />
    {op.mis && <div style={{display:"flex",gap:8}}><div style={{flex:1}}><NumInput label={d.tipologia?.includes("Recinzione")?"Lunghezza":"Larghezza luce"} value={d.larghezza} onChange={v=>set("larghezza",v)} /></div><div style={{flex:1}}><NumInput label="Altezza" value={d.altezza} onChange={v=>set("altezza",v)} /></div></div>}
    <Sec icon="⚡" title="Automazione" count={[d.automazione].filter(Boolean).length} open={op.auto} onToggle={()=>setOp({...op,auto:!op.auto})} color={color} />
    {op.auto && <ChipSel label="Automazione" options={["Manuale","Predisposizione","Motore 230V","Motore solare","Motore a batteria"]} value={d.automazione} onChange={v=>set("automazione",v)} color={color} />}
  </>);
};

// Placeholder forms per settori non ancora completi
const FormPlaceholder = ({ nome, color }) => (
  <div style={{ padding: 24, textAlign: "center", background: color+"0a", borderRadius: 12, border: `1.5px dashed ${color}44` }}>
    <div style={{ fontSize: 14, fontWeight: 700, color }}>{nome}</div>
    <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>Scheda misura in costruzione</div>
    <div style={{ fontSize: 10, color: T.sub, marginTop: 8 }}>La demo completa è nel file separato</div>
  </div>
);

const FORMS = {
  serramenti: FormSerramenti,
  porte: FormPorte,
  persiane: FormPersiane,
  tapparelle: FormTapparelle,
  zanzariere: FormZanzariere,
  cancelli: FormCancelli,
  tendeSole: ({ color }) => <FormPlaceholder nome="Tende da Sole" color={color} />,
  tendeInt: ({ color }) => <FormPlaceholder nome="Tende da Interno" color={color} />,
  boxDoccia: ({ color }) => <FormPlaceholder nome="Box Doccia" color={color} />,
};

// ═══ MAIN HUB ═══
export default function MastroMisureHub() {
  const [view, setView] = useState("hub"); // hub | form
  const [activeSectors, setActiveSectors] = useState(["serramenti","porte","persiane","tapparelle","zanzariere","cancelli"]);
  const [currentSector, setCurrentSector] = useState(null);
  const [sectorData, setSectorData] = useState({});
  const [vano, setVano] = useState({ nome: "F1", ambiente: "Soggiorno", piano: "Piano Terra" });
  const [note, setNote] = useState("");

  const getSectorData = (id) => sectorData[id] || {};
  const setSectorDataById = (id, data) => setSectorData(prev => ({ ...prev, [id]: data }));
  const countFields = (data) => Object.values(data || {}).filter(v => v && v !== 0).length;
  const totalFields = activeSectors.reduce((acc, id) => acc + countFields(getSectorData(id)), 0);

  const openSector = (s) => { setCurrentSector(s); setView("form"); };
  const backToHub = () => { setView("hub"); setCurrentSector(null); };

  const sectorInfo = currentSector ? SETTORI.find(s => s.id === currentSector) : null;

  // ═══ SECTOR FORM VIEW ═══
  if (view === "form" && sectorInfo) {
    const FormComp = FORMS[currentSector];
    const data = getSectorData(currentSector);
    const fields = countFields(data);
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: FF }}>
        {/* Topbar settore */}
        <div style={{ background: T.topbar, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 99 }}>
          <div onClick={backToHub} style={{ width: 32, height: 32, borderRadius: 8, background: "#ffffff15", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#fff" }}>←</div>
          <SectorThumb id={sectorInfo.icon} size={28} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{sectorInfo.nome}</div>
            <div style={{ fontSize: 10, color: "#999" }}>Vano {vano.nome} · {vano.ambiente}</div>
          </div>
          <div style={{ background: fields >= 4 ? T.green+"30" : sectorInfo.colore+"30", color: fields >= 4 ? T.green : sectorInfo.colore, padding: "3px 10px", borderRadius: 16, fontSize: 11, fontWeight: 800, fontFamily: FM }}>{fields}</div>
        </div>

        <div style={{ padding: "8px 16px 100px 16px" }}>
          <FormComp data={data} setData={(d) => setSectorDataById(currentSector, d)} color={sectorInfo.colore} />

          {/* Note + foto */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Note {sectorInfo.nome}</div>
            <textarea value={data.note || ""} onChange={e => setSectorDataById(currentSector, {...data, note: e.target.value})} placeholder={`Note specifiche per ${sectorInfo.nome.toLowerCase()}...`} style={{ width: "100%", padding: "10px 12px", fontSize: 12, fontFamily: FF, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, minHeight: 50, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            {["📷 Foto","📐 Schizzo","🎤 Vocale"].map(b => (
              <div key={b} style={{ flex: 1, height: 56, borderRadius: 10, border: `2px dashed ${T.bdr}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: T.card }}>
                <span style={{ fontSize: 16 }}>{b.split(" ")[0]}</span><span style={{ fontSize: 8, color: T.sub, fontWeight: 600 }}>{b.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.bdr}`, padding: "10px 16px", display: "flex", gap: 10, maxWidth: 480, margin: "0 auto" }}>
          <div onClick={backToHub} style={{ flex: 1, padding: "12px", borderRadius: 12, background: T.bg, textAlign: "center", fontSize: 13, fontWeight: 700, color: T.sub, cursor: "pointer" }}>← Hub vano</div>
          <div style={{ flex: 2, padding: "12px", borderRadius: 12, background: fields >= 2 ? sectorInfo.colore : T.bdr, textAlign: "center", fontSize: 13, fontWeight: 800, color: fields >= 2 ? "#fff" : T.sub, cursor: fields >= 2 ? "pointer" : "default", transition: "all .2s" }}>✓ Salva {sectorInfo.nome.toLowerCase()}</div>
        </div>

        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } input:focus, select:focus, textarea:focus { border-color: ${sectorInfo.colore} !important; box-shadow: 0 0 0 3px ${sectorInfo.colore}20; } * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }`}</style>
      </div>
    );
  }

  // ═══ HUB VIEW ═══
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: FF }}>
      {/* Topbar */}
      <div style={{ background: T.topbar, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 99 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#ffffff15", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#fff" }}>←</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>MASTRO MISURE</div>
          <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Rossi Mario · Via Roma 15, Cosenza</div>
        </div>
        <div style={{ background: T.acc + "30", color: T.acc, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, fontFamily: FM }}>{totalFields}</div>
      </div>

      <div style={{ padding: "12px 16px 100px 16px" }}>

        {/* VANO HEADER */}
        <div style={{ background: T.card, borderRadius: 14, border: `1.5px solid ${T.bdr}`, padding: "16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>Vano {vano.nome}</div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{vano.ambiente} · {vano.piano}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {activeSectors.slice(0, 4).map(id => {
                const s = SETTORI.find(x => x.id === id);
                const f = countFields(getSectorData(id));
                return <div key={id} style={{ width: 28, height: 28, borderRadius: 7, background: f > 0 ? s.colore+"20" : T.bg, border: `1.5px solid ${f > 0 ? s.colore : T.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {f > 0 ? <span style={{ fontSize: 9, fontWeight: 800, color: s.colore, fontFamily: FM }}>{f}</span> : <span style={{ fontSize: 8, color: T.sub }}>·</span>}
                </div>;
              })}
              {activeSectors.length > 4 && <div style={{ width: 28, height: 28, borderRadius: 7, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.sub, fontWeight: 700 }}>+{activeSectors.length - 4}</div>}
            </div>
          </div>

          {/* Progress globale */}
          <div style={{ height: 4, background: T.bdr, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: 4, background: totalFields >= 10 ? T.green : T.acc, width: `${Math.min((totalFields / 20) * 100, 100)}%`, transition: "width .3s ease" }} />
          </div>
        </div>

        {/* SETTORI GRID */}
        <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, paddingLeft: 4 }}>Cosa stai misurando?</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SETTORI.filter(s => activeSectors.includes(s.id)).map(s => {
            const fields = countFields(getSectorData(s.id));
            const hasData = fields > 0;
            return (
              <div key={s.id} onClick={() => openSector(s.id)} style={{
                background: T.card, borderRadius: 14, border: `1.5px solid ${hasData ? s.colore+"44" : T.bdr}`,
                padding: "14px 16px", cursor: "pointer", transition: "all .15s ease",
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: hasData ? `0 2px 8px ${s.colore}15` : "none",
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: s.colore+"0c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <SectorThumb id={s.icon} size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: hasData ? s.colore : T.text }}>{s.nome}</div>
                  <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>{s.desc}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {hasData ? (
                    <div style={{ background: s.colore+"20", color: s.colore, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800, fontFamily: FM }}>{fields}</div>
                  ) : (
                    <div style={{ background: T.bg, color: T.sub, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600 }}>Apri</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SETTORI DISATTIVI */}
        {SETTORI.filter(s => !activeSectors.includes(s.id)).length > 0 && (<>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginTop: 20, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, paddingLeft: 4 }}>Settori disattivi · tap per attivare</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SETTORI.filter(s => !activeSectors.includes(s.id)).map(s => (
              <div key={s.id} onClick={() => setActiveSectors([...activeSectors, s.id])} style={{
                padding: "8px 14px", borderRadius: 10, border: `1.5px dashed ${T.bdr}`,
                background: T.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 10, color: T.sub }}>+</span>
                <span style={{ fontSize: 11, color: T.sub, fontWeight: 600 }}>{s.nome}</span>
              </div>
            ))}
          </div>
        </>)}

        {/* NOTE GLOBALI */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Note generali vano</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Cappotto termico, altezza da terra, ostacoli, accesso..." style={{
            width: "100%", padding: "12px 14px", fontSize: 12, fontFamily: FF, border: `1.5px solid ${T.bdr}`, borderRadius: 10, background: T.card, minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box",
          }} />
        </div>

        {/* RIEPILOGO VELOCE */}
        {totalFields >= 3 && (
          <div style={{ marginTop: 16, background: T.card, borderRadius: 14, border: `1.5px solid ${T.bdr}`, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", background: T.topbar, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12 }}>📋</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Riepilogo Vano {vano.nome}</span>
              <span style={{ fontSize: 10, color: "#999", marginLeft: "auto", fontFamily: FM }}>{totalFields} campi</span>
            </div>
            <div style={{ padding: "12px 16px" }}>
              {activeSectors.map(id => {
                const s = SETTORI.find(x => x.id === id);
                const data = getSectorData(id);
                const fields = countFields(data);
                if (fields === 0) return null;
                return (
                  <div key={id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${T.bdr}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: s.colore }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.colore }}>{s.nome}</span>
                      <span style={{ fontSize: 9, color: T.sub, fontFamily: FM, marginLeft: "auto" }}>{fields} campi</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.text, lineHeight: 1.7, paddingLeft: 14 }}>
                      {Object.entries(data).filter(([k,v]) => v && v !== 0 && k !== "note").map(([k,v]) => (
                        <span key={k} style={{ marginRight: 8 }}>
                          <span style={{ color: T.sub, fontSize: 9 }}>{k}: </span>
                          <strong style={{ fontFamily: typeof v === "number" ? FM : FF, fontSize: 11 }}>{v}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.bdr}`, padding: "10px 16px", display: "flex", gap: 10, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ flex: 1, padding: "12px", borderRadius: 12, background: T.bg, textAlign: "center", fontSize: 13, fontWeight: 700, color: T.sub, cursor: "pointer" }}>← Commessa</div>
        <div style={{ flex: 2, padding: "12px", borderRadius: 12, background: totalFields >= 3 ? T.acc : T.bdr, textAlign: "center", fontSize: 13, fontWeight: 800, color: totalFields >= 3 ? "#fff" : T.sub, cursor: totalFields >= 3 ? "pointer" : "default", transition: "all .2s" }}>✓ Salva vano {vano.nome}</div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } input:focus, select:focus, textarea:focus { border-color: ${T.acc} !important; box-shadow: 0 0 0 3px ${T.acc}20; } * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}
