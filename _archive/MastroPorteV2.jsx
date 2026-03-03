import { useState } from "react";

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
const CONTROTELAI = ["Standard legno","Metallo zincato","Scrigno scomparsa","Eclisse scomparsa","Filomuro alu","Esistente","Da definire"];
const CLASSI_EI = ["EI 30","EI 60","EI 90","EI 120"];
const CLASSI_RC = ["RC 2","RC 3","RC 4"];
const MISURE_STD = [{l:600,h:2100,lb:"60×210"},{l:700,h:2100,lb:"70×210"},{l:800,h:2100,lb:"80×210"},{l:900,h:2100,lb:"90×210"},{l:1000,h:2100,lb:"100×210"},{l:1200,h:2100,lb:"120×210"},{l:800,h:2400,lb:"80×240"},{l:900,h:2400,lb:"90×240"}];
const AGGANCIO = ["Frontale a muro","A pavimento (perno)","Su controtelaio","Filomuro (incasso)","Su stipite esistente","A soffitto (binario)"];

// CERNIERE
const CERNIERE_TIPO = ["A scomparsa regolabile","A vista 3D","A molla (chiusura auto)","A bilico (pivot)","Per porta blindata","Per porta REI","Anuba (legno)","A libro"];
const CERNIERE_QTY = ["2 cerniere (≤ 80cm)","3 cerniere (> 80cm)","4 cerniere (H ≥ 240)","2+1 sicurezza (blindata)"];
const CERNIERE_FIN = ["Cromo satinato","Cromo lucido","Nero opaco","Bronzo","Ottone","Bianco","Inox","Coordinata porta"];

// COPRIFILO / CORNICE
const COPRIFILO_TIPO = ["Piatto liscio","Bombato classico","Squadrato moderno","Telescopico (regolabile)","Complanare (filomuro)","Senza coprifilo"];
const COPRIFILO_LARG = ["50mm","60mm","70mm","80mm","90mm","100mm"];
const COPRIFILO_MAT = ["Legno massello","MDF laccato","MDF rivestito","Alluminio","PVC"];

// SOGLIA / BATTUTA
const SOGLIA_TIPO = ["Automatica (a scomparsa)","Fissa a pavimento","A rompigoccia (esterno)","Ribassata (accessibilità)","Nessuna soglia","Esistente"];
const SOGLIA_MAT = ["Alluminio anodizzato","Alluminio verniciato","Acciaio inox","Legno","Ottone","PVC"];
const BATTUTA_TIPO = ["Singola (standard)","Doppia (acustica)","Tripla (blindata)","A battente libero","Magnetica"];
const GUARNIZIONE = ["TPE grigia","TPE nera","Silicone bianco","Silicone grigio","Acustica doppia labbro","Tagliafuoco intumescente"];

// MODELLI PORTA
const MODELLI = [
  { id:"m01", nome:"Liscio Classic",    mat:"Laccato opaco",   shape:"liscio",  bg1:"#d6d3d1", bg2:"#f5f5f4" },
  { id:"m02", nome:"Pantografato Deco", mat:"Laccato opaco",   shape:"panto",   bg1:"#c4b5a8", bg2:"#e7e5e4" },
  { id:"m03", nome:"Vetro Satinato",    mat:"Vetro temperato", shape:"vetro",   bg1:"#93c5fd", bg2:"#dbeafe" },
  { id:"m04", nome:"Rovere Naturale",   mat:"Legno massello",  shape:"legno",   bg1:"#a18072", bg2:"#d6cfc7" },
  { id:"m05", nome:"Noce Canaletto",    mat:"Legno massello",  shape:"legno",   bg1:"#78543e", bg2:"#a18072" },
  { id:"m06", nome:"Dogato Moderno",    mat:"Laminato CPL",    shape:"dogato",  bg1:"#a1a1aa", bg2:"#d4d4d8" },
  { id:"m07", nome:"Minimal Filomuro",  mat:"Laccato opaco",   shape:"filo",    bg1:"#e7e5e4", bg2:"#fafaf9" },
  { id:"m08", nome:"Blindata Classe 3", mat:"Blindata",        shape:"blindata",bg1:"#57534e", bg2:"#78716c" },
  { id:"m09", nome:"REI 60 Hotel",      mat:"EI tagliafuoco",  shape:"rei",     bg1:"#dc2626", bg2:"#fca5a5" },
  { id:"m10", nome:"Scorrevole Glass",  mat:"Vetro temperato", shape:"scorr",   bg1:"#60a5fa", bg2:"#bfdbfe" },
  { id:"m11", nome:"Inciso Decor",      mat:"Laminato HPL",    shape:"inciso",  bg1:"#94a3b8", bg2:"#e2e8f0" },
  { id:"m12", nome:"Light Economica",   mat:"Light",           shape:"liscio",  bg1:"#e5e5e5", bg2:"#f5f5f5" },
];

// HOPPE
const HOPPE_TIPO = ["Su rosetta","Su placca","Maniglione","Scorrevole incasso","Tagliafuoco","Compact System"];
const HOPPE_SERIE = ["Paris","Tokyo","Amsterdam","Atlanta","Milano","Maribor","Brindisi","Seattle","Dublin","Houston","Dallas","Hamburg","Stockholm FS","Paris FS","Singapore","Valencia"];
const HOPPE_MAT = ["Alluminio","Acciaio inox","Ottone","Resina"];
const HOPPE_FIN = ["F1 Argento","F9 Acciaio sat.","Nero satinato","Bronzo","Cromo lucido","Cromo sat.","Bianco 9016","Nero 9005","Titanio"];
const HOPPE_BOCC = ["Tonda Ø52","Quadrata","Ovale","Doppia mappa","WC nottolino","Cieca"];

// CISA
const CISA_TIPO = ["Da infilare standard","Da infilare 4 mandate","Da applicare","Multipunto","Elettrica","Smart DOMO","Antipanico"];
const CISA_CIL = ["Europeo standard","RS5 alta sicurezza","Per pomolo","Fisso doppia mappa","Elettronico"];
const CISA_MIS_CIL = ["30+30","30+40","30+50","35+35","40+40","40+50","50+50","Su misura"];
const CISA_ENTRATA = ["40mm","50mm","60mm","70mm","80mm"];
const CISA_ANTIPAN = ["Barra push Alpha","Leva touch Fast","Con serratura"];
const CISA_CHIUDIP = ["Nessuno","A braccio standard","A slitta incasso","A pavimento","Elettromagnetico"];

// ═══ UI COMPONENTS ═══
const Chip = ({ label, sel, color, onTap, small }) => (
  <div onClick={onTap} style={{
    padding: small ? "5px 10px" : "7px 13px", borderRadius: 9,
    border: `1.5px solid ${sel ? color||T.acc : T.bdr}`,
    background: sel ? (color||T.acc)+"14" : T.card,
    fontSize: small ? 10 : 11, fontWeight: sel ? 700 : 500,
    color: sel ? (color||T.acc) : T.text, cursor: "pointer",
    transition: "all .12s", fontFamily: FF, userSelect: "none",
  }}>{label}</div>
);
const ChipSel = ({ label, options, value, onChange, color, small }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{options.map(o => <Chip key={o} label={o} sel={value===o} color={color} onTap={() => onChange(o)} small={small} />)}</div>
  </div>
);
const Sec = ({ icon, title, color, count, open, onToggle }) => (
  <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", cursor: "pointer", borderBottom: `1px solid ${T.bdr}`, marginBottom: open ? 12 : 0, userSelect: "none" }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: color||T.text, flex: 1 }}>{title}</span>
    {count > 0 && <span style={{ fontSize: 9, fontWeight: 700, background: (color||T.acc)+"20", color: color||T.acc, padding: "2px 8px", borderRadius: 20 }}>{count}</span>}
    <span style={{ fontSize: 11, color: T.sub, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>▼</span>
  </div>
);
const NumInput = ({ label, value, onChange, unit="mm" }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 10, color: T.sub, marginBottom: 3, fontWeight: 600 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <input type="number" inputMode="numeric" value={value||""} onChange={e => onChange(parseInt(e.target.value)||0)} style={{ flex: 1, padding: "10px 12px", fontSize: 15, fontFamily: FM, fontWeight: 600, border: `1.5px solid ${T.bdr}`, borderRadius: 9, background: T.card, color: T.text, outline: "none" }} />
      <span style={{ fontSize: 10, color: T.sub, background: T.bg, padding: "7px 9px", borderRadius: 7, fontWeight: 600 }}>{unit}</span>
    </div>
  </div>
);
const Sel = ({ label, value, onChange, options, groups }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 10, color: T.sub, marginBottom: 3, fontWeight: 600 }}>{label}</div>
    <select value={value||""} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 12, fontFamily: FF, fontWeight: 600, border: `1.5px solid ${T.bdr}`, borderRadius: 9, background: T.card, color: T.text, WebkitAppearance: "none", outline: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32 }}>
      <option value="">— Seleziona —</option>
      {groups ? Object.entries(groups).map(([g,items]) => <optgroup key={g} label={g}>{items.map(i => <option key={i} value={i}>{i}</option>)}</optgroup>) : options?.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ═══ DOOR DRAWING (SVG) ═══
const DoorDrawing = ({ d }) => {
  const W = 150, H = 210, OX = 35, OY = 15;
  const hasV = d.finitura === "Con vetro";
  const isDopp = (d.apertura||"").includes("doppia") || (d.apertura||"").includes("2 ante");
  const isScorr = (d.apertura||"").includes("Scomparsa") || (d.apertura||"").includes("Esterno muro");
  const isLibro = (d.apertura||"").includes("Libro");
  const sensoR = (d.senso||"").includes("DX");
  const larg = d.larghezza || "—";
  const alt = d.altezza || "—";
  const spes = d.spessoreMuro || "—";
  const hasCopri = d.coprifTipo && d.coprifTipo !== "Senza coprifilo" && d.coprifTipo !== "Complanare (filomuro)";
  const hasSoglia = d.sogliaTipo && d.sogliaTipo !== "Nessuna soglia";
  const nCern = (d.cernQty||"").includes("4") ? 4 : (d.cernQty||"").includes("3") ? 3 : 2;

  return (
    <div style={{ background: T.card, borderRadius: 12, border: `1.5px solid ${T.bdr}`, padding: "14px 10px 8px", marginBottom: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, textAlign: "center" }}>Vista frontale</div>
      <svg width="100%" viewBox={`0 0 ${W+70} ${H+50}`} style={{ maxHeight: 250 }}>
        {/* Muro */}
        <rect x={OX-10} y={OY-5} width={W+20} height={H+12} rx="2" fill="#e8e6e1" stroke="#ccc" strokeWidth="0.8" />

        {/* Coprifilo */}
        {hasCopri && <>
          <rect x={OX-7} y={OY-3} width="6" height={H+8} rx="1" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="0.5" />
          <rect x={OX+W+1} y={OY-3} width="6" height={H+8} rx="1" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="0.5" />
          <rect x={OX-7} y={OY-6} width={W+14} height="5" rx="1" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="0.5" />
        </>}

        {/* Vano porta */}
        <rect x={OX} y={OY} width={W} height={H} rx="1" fill="#faf9f6" stroke={T.acc} strokeWidth="2" />

        {isDopp ? <>
          <line x1={OX+W/2} y1={OY} x2={OX+W/2} y2={OY+H} stroke={T.acc} strokeWidth="1.5" strokeDasharray="4,3" />
          <rect x={OX+W/2-10} y={OY+H*0.47} width="7" height="14" rx="3" fill={T.acc} />
          <rect x={OX+W/2+3} y={OY+H*0.47} width="7" height="14" rx="3" fill={T.acc} />
          {hasV && <>
            <rect x={OX+12} y={OY+25} width={W/2-22} height={H*0.42} rx="2" fill={T.blue+"15"} stroke={T.blue+"40"} strokeWidth="0.8" />
            <rect x={OX+W/2+10} y={OY+25} width={W/2-22} height={H*0.42} rx="2" fill={T.blue+"15"} stroke={T.blue+"40"} strokeWidth="0.8" />
          </>}
          {Array.from({length:nCern},(_,i)=>{const py=OY+H*((i+1)/(nCern+1)); return <rect key={`cl${i}`} x={OX} y={py-5} width="4" height="10" rx="1.5" fill="#78716c" stroke="#57534e" strokeWidth="0.4"/>})}
          {Array.from({length:nCern},(_,i)=>{const py=OY+H*((i+1)/(nCern+1)); return <rect key={`cr${i}`} x={OX+W-4} y={py-5} width="4" height="10" rx="1.5" fill="#78716c" stroke="#57534e" strokeWidth="0.4"/>})}
        </> : isScorr ? <>
          <rect x={OX+4} y={OY+4} width={W-8} height={H-8} rx="1" fill="none" stroke={T.acc+"50"} strokeWidth="0.8" strokeDasharray="5,3" />
          <line x1={OX} y1={OY+H+3} x2={OX+W} y2={OY+H+3} stroke={T.acc} strokeWidth="2.5" />
          <line x1={OX+W*0.3} y1={OY+H/2} x2={OX+W*0.7} y2={OY+H/2} stroke={T.acc} strokeWidth="1.2" markerEnd="url(#arrD)" />
          <defs><marker id="arrD" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill={T.acc}/></marker></defs>
          {hasV && <rect x={OX+15} y={OY+20} width={W-30} height={H*0.5} rx="2" fill={T.blue+"15"} stroke={T.blue+"40"} strokeWidth="0.8" />}
        </> : isLibro ? <>
          <line x1={OX+W/2} y1={OY} x2={OX+W/2} y2={OY+H} stroke={T.acc+"60"} strokeWidth="1" strokeDasharray="3,3" />
          <line x1={OX+W*0.25} y1={OY} x2={OX+W*0.25} y2={OY+H} stroke={T.acc+"40"} strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1={OX+W*0.75} y1={OY} x2={OX+W*0.75} y2={OY+H} stroke={T.acc+"40"} strokeWidth="0.8" strokeDasharray="2,2" />
          <rect x={OX+W/2-3} y={OY+H*0.47} width="6" height="12" rx="2.5" fill={T.acc} />
        </> : <>
          {/* Battente singola */}
          <path d={sensoR
            ? `M${OX+W} ${OY+H} Q${OX+W} ${OY+H-W*0.55} ${OX+W-W*0.45} ${OY+H-W*0.45}`
            : `M${OX} ${OY+H} Q${OX} ${OY+H-W*0.55} ${OX+W*0.45} ${OY+H-W*0.45}`
          } fill="none" stroke={T.acc+"30"} strokeWidth="0.8" strokeDasharray="4,4" />
          <rect x={sensoR?OX+6:OX+W-14} y={OY+H*0.45} width="7" height="16" rx="3" fill={T.acc} />
          {hasV && <rect x={OX+18} y={OY+20} width={W-36} height={H*0.42} rx="2" fill={T.blue+"15"} stroke={T.blue+"40"} strokeWidth="0.8" />}
          {/* Cerniere */}
          {Array.from({length:nCern},(_,i)=>{
            const py = OY+H*((i+1)/(nCern+1));
            return <rect key={`c${i}`} x={sensoR?OX+W-3:OX-1} y={py-5} width="4" height="10" rx="1.5" fill="#78716c" stroke="#57534e" strokeWidth="0.4"/>;
          })}
        </>}

        {/* Soglia */}
        {hasSoglia && <rect x={OX-2} y={OY+H} width={W+4} height="4" rx="1" fill={d.sogliaTipo?.includes("Automatica")?T.acc+"40":"#a1a1aa50"} stroke="#78716c" strokeWidth="0.4" />}

        {/* Quota larghezza */}
        <line x1={OX} y1={OY+H+22} x2={OX+W} y2={OY+H+22} stroke={T.sub} strokeWidth="0.5" />
        <line x1={OX} y1={OY+H+18} x2={OX} y2={OY+H+26} stroke={T.sub} strokeWidth="0.5" />
        <line x1={OX+W} y1={OY+H+18} x2={OX+W} y2={OY+H+26} stroke={T.sub} strokeWidth="0.5" />
        <text x={OX+W/2} y={OY+H+30} textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>

        {/* Quota altezza */}
        <line x1={OX+W+16} y1={OY} x2={OX+W+16} y2={OY+H} stroke={T.sub} strokeWidth="0.5" />
        <line x1={OX+W+12} y1={OY} x2={OX+W+20} y2={OY} stroke={T.sub} strokeWidth="0.5" />
        <line x1={OX+W+12} y1={OY+H} x2={OX+W+20} y2={OY+H} stroke={T.sub} strokeWidth="0.5" />
        <text x={OX+W+28} y={OY+H/2+3} textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc} transform={`rotate(-90,${OX+W+28},${OY+H/2+3})`}>{alt}</text>

        {/* Spessore */}
        <text x={OX+W/2} y={OY+H+42} textAnchor="middle" fontSize="8" fill={T.sub}>muro {spes} mm</text>
      </svg>

      {/* Legenda */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 2 }}>
        {[
          d.apertura && { c: T.acc, l: d.apertura },
          d.senso && { c: T.acc, l: d.senso },
          hasV && { c: T.blue, l: "Vetro" },
          hasSoglia && { c: "#78716c", l: "Soglia" },
          hasCopri && { c: "#a8a29e", l: "Coprifilo" },
        ].filter(Boolean).map((x,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:3 }}>
            <div style={{ width:6, height:6, borderRadius:3, background:x.c }} />
            <span style={{ fontSize:8, color:T.sub }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══ PRODUCT THUMBNAIL ═══
const Thumb = ({ shape, bg1, bg2 }) => {
  const S = {
    liscio:()=><div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:3}}><div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    panto:()=><div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:bg2,borderRadius:3,border:`1.5px solid ${bg1}55`}}>{[20,40,60].map(y=><div key={y} style={{position:"absolute",left:"15%",top:`${y}%`,width:"70%",height:2,background:bg1+"44"}}/>)}<div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    vetro:()=><div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",border:`2px solid ${bg1}`,borderRadius:3}}><div style={{position:"absolute",left:"15%",top:"10%",width:"70%",height:"55%",background:`linear-gradient(135deg,${bg1}33,${bg2})`,borderRadius:2}}/><div style={{position:"absolute",right:"15%",top:"75%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    legno:()=><div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:3}}>{Array.from({length:5},(_,i)=><div key={i} style={{position:"absolute",left:0,top:`${i*20}%`,width:"100%",height:1,background:bg1+"33"}}/>)}<div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg2}}/></div>,
    dogato:()=><div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:bg2,borderRadius:3}}>{Array.from({length:8},(_,i)=><div key={i} style={{position:"absolute",left:0,top:`${5+i*12}%`,width:"100%",height:4,background:bg1+"44"}}/>)}<div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
    filo:()=><><div style={{position:"absolute",left:"15%",top:"3%",width:"70%",height:"92%",background:bg2,borderRadius:1}}/><div style={{position:"absolute",left:"23%",top:"5%",width:"54%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`}}/></>,
    blindata:()=><div style={{position:"absolute",left:"18%",top:"5%",width:"64%",height:"88%",background:`linear-gradient(180deg,${bg1},${bg2})`,borderRadius:3,border:`2px solid ${bg1}`}}>{[30,50,70].map(y=><div key={y} style={{position:"absolute",right:"12%",top:`${y}%`,width:6,height:6,borderRadius:3,background:bg2}}/>)}</div>,
    rei:()=><div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:`linear-gradient(180deg,${bg1}44,${bg2})`,borderRadius:3,border:`2px solid ${bg1}`}}><div style={{position:"absolute",left:"25%",top:"35%",width:"50%",height:"25%",border:`2px solid ${bg1}`,borderRadius:2}}/></div>,
    scorr:()=><><div style={{position:"absolute",left:"10%",top:"5%",width:"55%",height:"88%",background:`linear-gradient(135deg,${bg1}44,${bg2})`,borderRadius:3,border:`1.5px solid ${bg1}55`}}/><div style={{position:"absolute",left:"5%",top:"90%",width:"90%",height:3,background:bg1,borderRadius:1}}/></>,
    inciso:()=><div style={{position:"absolute",left:"20%",top:"5%",width:"60%",height:"88%",background:bg2,borderRadius:3}}>{[20,45,70].map(y=><div key={y} style={{position:"absolute",left:"20%",top:`${y}%`,width:"60%",height:8,border:`1px solid ${bg1}55`,borderRadius:2}}/>)}<div style={{position:"absolute",right:"15%",top:"48%",width:5,height:5,borderRadius:3,background:bg1}}/></div>,
  };
  return <div style={{width:"100%",height:80,background:`linear-gradient(145deg,${bg1}15,${bg2}25)`,position:"relative",overflow:"hidden"}}>{(S[shape]||S.liscio)()}</div>;
};
const ModelCard = ({ m, sel, onTap }) => (
  <div onClick={onTap} style={{width:96,minHeight:120,borderRadius:11,border:`2px solid ${sel?T.acc:T.bdr}`,background:sel?T.acc+"0a":T.card,cursor:"pointer",overflow:"hidden",transition:"all .12s",flexShrink:0,boxShadow:sel?`0 2px 10px ${T.acc}25`:"none"}}>
    <div style={{position:"relative"}}><Thumb shape={m.shape} bg1={m.bg1} bg2={m.bg2}/>{sel&&<div style={{position:"absolute",top:3,right:3,width:16,height:16,borderRadius:8,background:T.acc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800}}>✓</div>}</div>
    <div style={{padding:"5px 6px"}}><div style={{fontSize:9,fontWeight:700,color:sel?T.acc:T.text,lineHeight:1.2}}>{m.nome}</div><div style={{fontSize:7,color:T.sub,marginTop:1}}>{m.mat}</div></div>
  </div>
);

// ═══ MAIN ═══
export default function MastroPorteV2() {
  const [d, setD] = useState({});
  const [sec, setSec] = useState({ mis:true, porta:true, cern:false, copri:false, soglia:false, hoppe:false, cisa:false });
  const set = (k,v) => setD(p=>({...p,[k]:v}));
  const tog = (s) => setSec(p=>({...p,[s]:!p[s]}));

  const misC = [d.larghezza,d.altezza,d.spessoreMuro].filter(Boolean).length;
  const portaC = [d.modello,d.materiale,d.apertura,d.senso,d.finitura,d.colore,d.controtelaio,d.aggancio].filter(Boolean).length;
  const cernC = [d.cernTipo,d.cernQty,d.cernFin].filter(Boolean).length;
  const copriC = [d.coprifTipo,d.coprifLarg,d.coprifMat].filter(Boolean).length;
  const sogliaC = [d.sogliaTipo,d.sogliaMat,d.battuta,d.guarnizione].filter(Boolean).length;
  const hoppeC = [d.hTipo,d.hSerie,d.hMat,d.hFin].filter(Boolean).length;
  const cisaC = [d.cTipo,d.cCil,d.cEntrata].filter(Boolean).length;
  const total = misC+portaC+cernC+copriC+sogliaC+hoppeC+cisaC;
  const totalMax = 25;

  const needEI = d.materiale==="EI tagliafuoco"||d.materiale==="Metallica REI";
  const needRC = d.materiale==="Blindata";
  const modelliVis = d.materiale ? MODELLI.filter(m=>m.mat===d.materiale) : MODELLI;
  const selMod = (m) => { set("modello",m.id===d.modello?null:m.id); if(m.id!==d.modello) set("materiale",m.mat); };

  return (
    <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:T.bg, fontFamily:FF }}>
      {/* TOPBAR */}
      <div style={{ background:T.topbar, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:99 }}>
        <div style={{width:30,height:30,borderRadius:7,background:"#ffffff15",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,color:"#fff"}}>←</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:-0.3}}>Porte — Presa Misure</div>
          <div style={{fontSize:10,color:"#888"}}>Vano P1 · Soggiorno</div>
        </div>
        <div style={{background:total>=totalMax*0.5?T.green+"30":T.acc+"30",color:total>=totalMax*0.5?T.green:T.acc,padding:"3px 10px",borderRadius:16,fontSize:11,fontWeight:800,fontFamily:FM}}>{total}/{totalMax}</div>
      </div>
      <div style={{height:3,background:T.bdr}}><div style={{height:3,background:total>=totalMax*0.5?T.green:T.acc,width:`${(total/totalMax)*100}%`,transition:"width .3s",borderRadius:2}}/></div>

      <div style={{ padding:"8px 16px 100px" }}>

        {/* DISEGNO */}
        {(d.larghezza||d.apertura||d.finitura||d.coprifTipo||d.sogliaTipo) && <DoorDrawing d={d} />}

        {/* ═══ MISURE ═══ */}
        <Sec icon="📐" title="Misure vano" color={T.acc} count={misC} open={sec.mis} onToggle={()=>tog("mis")} />
        {sec.mis && <div style={{animation:"fadeIn .2s"}}>
          <div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase"}}>Misura rapida</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
            {MISURE_STD.map(ms=><Chip key={ms.lb} label={ms.lb} sel={d.larghezza===ms.l&&d.altezza===ms.h} color={T.acc} onTap={()=>{set("larghezza",ms.l);set("altezza",ms.h)}} small/>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><NumInput label="Larghezza luce" value={d.larghezza} onChange={v=>set("larghezza",v)}/></div>
            <div style={{flex:1}}><NumInput label="Altezza luce" value={d.altezza} onChange={v=>set("altezza",v)}/></div>
          </div>
          <NumInput label="Spessore muro" value={d.spessoreMuro} onChange={v=>set("spessoreMuro",v)}/>
        </div>}

        {/* ═══ PORTA ═══ */}
        <Sec icon="🚪" title="Configurazione porta" color={T.acc} count={portaC} open={sec.porta} onToggle={()=>tog("porta")} />
        {sec.porta && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Materiale / Linea" options={MATERIALI} value={d.materiale} onChange={v=>{set("materiale",v);set("modello",null)}} color={T.acc}/>

          <div style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase"}}>Modello {d.materiale?`· ${modelliVis.length}`:""}</div>
              {d.modello&&<div onClick={()=>set("modello",null)} style={{fontSize:8,color:T.red,cursor:"pointer",fontWeight:700}}>✕ Reset</div>}
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
              {modelliVis.map(m=><ModelCard key={m.id} m={m} sel={d.modello===m.id} onTap={()=>selMod(m)}/>)}
              <div style={{width:96,minHeight:120,borderRadius:11,border:`2px dashed ${T.bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,background:T.card}}>
                <span style={{fontSize:20,color:T.sub}}>+</span><span style={{fontSize:8,color:T.sub,fontWeight:600}}>Aggiungi</span>
              </div>
            </div>
          </div>

          <Sel label="Sistema apertura" value={d.apertura} onChange={v=>set("apertura",v)} groups={APERTURE}/>
          <ChipSel label="Senso" options={SENSI} value={d.senso} onChange={v=>set("senso",v)} color={T.acc}/>
          <ChipSel label="Finitura" options={FINITURE} value={d.finitura} onChange={v=>set("finitura",v)} color={T.acc} small/>
          {d.finitura==="Con vetro"&&<ChipSel label="Vetro inserto" options={VETRI_INS} value={d.vetroIns} onChange={v=>set("vetroIns",v)} color={T.blue} small/>}
          <Sel label="Colore / Essenza" value={d.colore} onChange={v=>set("colore",v)} options={COLORI}/>
          <ChipSel label="Controtelaio" options={CONTROTELAI} value={d.controtelaio} onChange={v=>set("controtelaio",v)} color={T.acc} small/>
          <ChipSel label="Sistema aggancio" options={AGGANCIO} value={d.aggancio} onChange={v=>set("aggancio",v)}/>

          {needEI&&<><ChipSel label="🔥 Classe EI" options={CLASSI_EI} value={d.classeEI} onChange={v=>set("classeEI",v)} color={T.red}/>
            <div style={{fontSize:10,color:T.green,background:T.green+"12",border:`1px solid ${T.green}30`,padding:"8px 10px",borderRadius:9,marginBottom:12,lineHeight:1.5}}>🔥 EN 1634 — Resistenza fuoco {d.classeEI||"..."} min</div></>}
          {needRC&&<><ChipSel label="🛡 Classe RC" options={CLASSI_RC} value={d.classeRC} onChange={v=>set("classeRC",v)} color={T.acc}/>
            <div style={{fontSize:10,color:T.acc,background:T.acc+"12",border:`1px solid ${T.acc}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>🛡 Blindata — Pannelli coordinabili</div></>}
        </div>}

        {/* ═══ CERNIERE ═══ */}
        <Sec icon="🔩" title="Cerniere e ferramenta" color={T.acc} count={cernC} open={sec.cern} onToggle={()=>tog("cern")} />
        {sec.cern && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo cerniera" options={needRC?["Per porta blindata"]:needEI?["Per porta REI"]:CERNIERE_TIPO} value={d.cernTipo} onChange={v=>set("cernTipo",v)} color={T.acc}/>
          <ChipSel label="Quantità" options={CERNIERE_QTY} value={d.cernQty} onChange={v=>set("cernQty",v)} color={T.acc} small/>
          <ChipSel label="Finitura cerniere" options={CERNIERE_FIN} value={d.cernFin} onChange={v=>set("cernFin",v)} color={T.acc} small/>
          {d.cernTipo&&<div style={{background:T.acc+"0c",border:`1px solid ${T.acc}25`,borderRadius:9,padding:"8px 10px",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.acc}}>{d.cernTipo}</div>
            <div style={{fontSize:9,color:T.sub,marginTop:2}}>{[d.cernQty,d.cernFin].filter(Boolean).join(" · ")}</div>
          </div>}
        </div>}

        {/* ═══ COPRIFILO ═══ */}
        <Sec icon="🪵" title="Coprifilo e cornice" color={T.acc} count={copriC} open={sec.copri} onToggle={()=>tog("copri")} />
        {sec.copri && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo coprifilo" options={COPRIFILO_TIPO} value={d.coprifTipo} onChange={v=>set("coprifTipo",v)} color={T.acc}/>
          {d.coprifTipo&&d.coprifTipo!=="Senza coprifilo"&&d.coprifTipo!=="Complanare (filomuro)"&&<>
            <ChipSel label="Larghezza" options={COPRIFILO_LARG} value={d.coprifLarg} onChange={v=>set("coprifLarg",v)} color={T.acc} small/>
            <ChipSel label="Materiale coprifilo" options={COPRIFILO_MAT} value={d.coprifMat} onChange={v=>set("coprifMat",v)} color={T.acc} small/>
          </>}
          {d.coprifTipo==="Telescopico (regolabile)"&&<div style={{fontSize:10,color:T.blue,background:T.blue+"12",border:`1px solid ${T.blue}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>📐 Telescopico: regolabile ±20mm per muri fuori squadro</div>}
        </div>}

        {/* ═══ SOGLIA / BATTUTA ═══ */}
        <Sec icon="🧱" title="Soglia, battuta e guarnizione" color={T.acc} count={sogliaC} open={sec.soglia} onToggle={()=>tog("soglia")} />
        {sec.soglia && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo soglia" options={SOGLIA_TIPO} value={d.sogliaTipo} onChange={v=>set("sogliaTipo",v)} color={T.acc}/>
          {d.sogliaTipo&&d.sogliaTipo!=="Nessuna soglia"&&d.sogliaTipo!=="Esistente"&&<ChipSel label="Materiale soglia" options={SOGLIA_MAT} value={d.sogliaMat} onChange={v=>set("sogliaMat",v)} color={T.acc} small/>}
          <ChipSel label="Battuta anta" options={BATTUTA_TIPO} value={d.battuta} onChange={v=>set("battuta",v)} color={T.acc}/>
          <ChipSel label="Guarnizione" options={GUARNIZIONE} value={d.guarnizione} onChange={v=>set("guarnizione",v)} color={T.acc} small/>
          {d.sogliaTipo==="Automatica (a scomparsa)"&&<div style={{fontSize:10,color:T.green,background:T.green+"12",border:`1px solid ${T.green}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>✓ Soglia automatica: si abbassa alla chiusura, nessun gradino visibile</div>}
          {needEI&&d.guarnizione&&d.guarnizione!=="Tagliafuoco intumescente"&&<div style={{fontSize:10,color:T.red,background:T.red+"12",border:`1px solid ${T.red}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>⚠ Porta EI: consigliata guarnizione tagliafuoco intumescente!</div>}
        </div>}

        {/* ═══ HOPPE ═══ */}
        <Sec icon="🔑" title="Maniglieria HOPPE" color={T.acc} count={hoppeC} open={sec.hoppe} onToggle={()=>tog("hoppe")} />
        {sec.hoppe && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo guarnitura" options={HOPPE_TIPO} value={d.hTipo} onChange={v=>set("hTipo",v)} color={T.acc}/>
          <Sel label="Serie / Modello" value={d.hSerie} onChange={v=>set("hSerie",v)} options={
            d.hTipo==="Tagliafuoco"?HOPPE_SERIE.filter(s=>s.includes("FS")):
            d.hTipo==="Maniglione"?["Singapore","Valencia","Dallas"]:
            d.hTipo==="Scorrevole incasso"?["Kit M463 standard","Kit M463 con nottolino"]:
            HOPPE_SERIE.filter(s=>!s.includes("FS"))
          }/>
          <ChipSel label="Materiale" options={HOPPE_MAT} value={d.hMat} onChange={v=>set("hMat",v)} color={T.acc} small/>
          <ChipSel label="Finitura" options={HOPPE_FIN} value={d.hFin} onChange={v=>set("hFin",v)} color={T.acc} small/>
          {(d.hTipo==="Su rosetta"||d.hTipo==="Su placca"||d.hTipo==="Tagliafuoco")&&<ChipSel label="Bocchetta" options={HOPPE_BOCC} value={d.hBocc} onChange={v=>set("hBocc",v)} color={T.acc} small/>}
          {d.hSerie&&<div style={{background:T.acc+"0c",border:`1px solid ${T.acc}25`,borderRadius:9,padding:"8px 10px",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.acc}}>{d.hTipo||"Guarnitura"} — {d.hSerie}</div>
            <div style={{fontSize:9,color:T.sub,marginTop:2}}>{[d.hMat,d.hFin,d.hBocc].filter(Boolean).join(" · ")}</div>
          </div>}
        </div>}

        {/* ═══ CISA ═══ */}
        <Sec icon="🔒" title="Serratura CISA" color={T.acc} count={cisaC} open={sec.cisa} onToggle={()=>tog("cisa")} />
        {sec.cisa && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo serratura" options={needRC?["Da infilare 4 mandate","Multipunto","Smart DOMO","Elettrica"]:needEI?["Da infilare standard","Antipanico"]:CISA_TIPO} value={d.cTipo} onChange={v=>set("cTipo",v)} color={T.acc}/>
          <ChipSel label="Cilindro" options={CISA_CIL} value={d.cCil} onChange={v=>set("cCil",v)} color={T.acc} small/>
          {d.cCil&&d.cCil!=="Elettronico"&&<ChipSel label="Misura cilindro" options={CISA_MIS_CIL} value={d.cMisCil} onChange={v=>set("cMisCil",v)} color={T.acc} small/>}
          <ChipSel label="Entrata" options={CISA_ENTRATA} value={d.cEntrata} onChange={v=>set("cEntrata",v)} color={T.acc} small/>
          {d.cTipo==="Antipanico"&&<ChipSel label="Maniglione antipanico" options={CISA_ANTIPAN} value={d.cAntip} onChange={v=>set("cAntip",v)} color={T.red}/>}
          <ChipSel label="Chiudiporta" options={CISA_CHIUDIP} value={d.cChiudip} onChange={v=>set("cChiudip",v)} color={T.acc} small/>
          <Sel label="Versione" value={d.cVers} onChange={v=>set("cVers",v)} options={["Destra","Sinistra","Reversibile"]}/>
          {d.cTipo&&<div style={{background:T.acc+"0c",border:`1px solid ${T.acc}25`,borderRadius:9,padding:"8px 10px",marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:T.acc}}>{d.cTipo}</div>
            <div style={{fontSize:9,color:T.sub,marginTop:2}}>{[d.cCil,d.cMisCil,d.cEntrata,d.cChiudip!=="Nessuno"?d.cChiudip:null].filter(Boolean).join(" · ")}</div>
          </div>}
        </div>}

        {/* ═══ NOTE + FOTO ═══ */}
        <div style={{marginTop:16}}>
          <div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase"}}>Note</div>
          <textarea value={d.note||""} onChange={e=>set("note",e.target.value)} placeholder="Coprifilo da coordinare, soglia da incassare, muro curvo, prese vicine..." style={{width:"100%",padding:"10px 12px",fontSize:11,fontFamily:FF,border:`1.5px solid ${T.bdr}`,borderRadius:9,background:T.card,minHeight:50,resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginTop:10,display:"flex",gap:6}}>
          {["📷 Foto vano","📐 Schizzo","🎤 Vocale"].map(b=><div key={b} style={{flex:1,height:56,borderRadius:10,border:`2px dashed ${T.bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:T.card}}><span style={{fontSize:16}}>{b.split(" ")[0]}</span><span style={{fontSize:8,color:T.sub,fontWeight:600}}>{b.split(" ").slice(1).join(" ")}</span></div>)}
        </div>

        {/* ═══ RIEPILOGO ═══ */}
        {total>=6&&<div style={{marginTop:20,background:T.card,borderRadius:12,border:`1.5px solid ${T.bdr}`,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:T.topbar,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12}}>📋</span><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>Riepilogo Porta</span>
            <span style={{fontSize:9,color:"#888",marginLeft:"auto",fontFamily:FM}}>{total} campi</span>
          </div>
          <div style={{padding:"12px 14px",fontSize:11,lineHeight:2,color:T.text}}>
            {d.modello&&(()=>{const m=MODELLI.find(x=>x.id===d.modello);return m?<div><span style={{color:T.sub}}>Modello:</span> <strong>{m.nome}</strong></div>:null})()}
            {d.materiale&&<div><span style={{color:T.sub}}>Materiale:</span> <strong>{d.materiale}</strong></div>}
            {d.apertura&&<div><span style={{color:T.sub}}>Apertura:</span> <strong>{d.apertura}</strong> {d.senso&&<span style={{color:T.sub}}>({d.senso})</span>}</div>}
            {d.larghezza>0&&d.altezza>0&&<div><span style={{color:T.sub}}>Misure:</span> <strong style={{fontFamily:FM}}>{d.larghezza}×{d.altezza}</strong> mm {d.spessoreMuro>0&&<span style={{color:T.sub}}>· muro {d.spessoreMuro}</span>}</div>}
            {d.finitura&&<div><span style={{color:T.sub}}>Finitura:</span> <strong>{d.finitura}</strong>{d.vetroIns?` — ${d.vetroIns}`:""}</div>}
            {d.colore&&<div><span style={{color:T.sub}}>Colore:</span> <strong>{d.colore}</strong></div>}
            {d.controtelaio&&<div><span style={{color:T.sub}}>Controtelaio:</span> <strong>{d.controtelaio}</strong></div>}
            {d.aggancio&&<div><span style={{color:T.sub}}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
            {d.cernTipo&&<div><span style={{color:T.sub}}>Cerniere:</span> <strong>{d.cernTipo}</strong> {d.cernQty&&<span style={{color:T.sub}}>· {d.cernQty.split(" ")[0]}</span>} {d.cernFin&&<span style={{color:T.sub}}>· {d.cernFin}</span>}</div>}
            {d.coprifTipo&&d.coprifTipo!=="Senza coprifilo"&&<div><span style={{color:T.sub}}>Coprifilo:</span> <strong>{d.coprifTipo}</strong> {d.coprifLarg&&<span style={{color:T.sub}}>{d.coprifLarg}</span>} {d.coprifMat&&<span style={{color:T.sub}}>· {d.coprifMat}</span>}</div>}
            {d.sogliaTipo&&d.sogliaTipo!=="Nessuna soglia"&&<div><span style={{color:T.sub}}>Soglia:</span> <strong>{d.sogliaTipo}</strong> {d.sogliaMat&&<span style={{color:T.sub}}>· {d.sogliaMat}</span>}</div>}
            {d.battuta&&<div><span style={{color:T.sub}}>Battuta:</span> <strong>{d.battuta}</strong></div>}
            {d.guarnizione&&<div><span style={{color:T.sub}}>Guarnizione:</span> <strong>{d.guarnizione}</strong></div>}
            {d.classeEI&&<div><span style={{color:T.red}}>🔥 {d.classeEI}</span></div>}
            {d.classeRC&&<div><span style={{color:T.acc}}>🛡 {d.classeRC}</span></div>}
            {d.hSerie&&<div><span style={{color:T.acc}}>🔑 {d.hTipo} {d.hSerie}</span> <span style={{color:T.sub}}>{d.hMat} {d.hFin}</span></div>}
            {d.cTipo&&<div><span style={{color:T.acc}}>🔒 {d.cTipo}</span> <span style={{color:T.sub}}>{d.cCil} {d.cEntrata}</span></div>}
            {d.cChiudip&&d.cChiudip!=="Nessuno"&&<div><span style={{color:T.acc}}>🚪 Chiudiporta: {d.cChiudip}</span></div>}
          </div>
        </div>}
      </div>

      {/* BOTTOM */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.card,borderTop:`1px solid ${T.bdr}`,padding:"10px 16px",display:"flex",gap:8,maxWidth:480,margin:"0 auto"}}>
        <div style={{flex:1,padding:"12px",borderRadius:10,background:T.bg,textAlign:"center",fontSize:12,fontWeight:700,color:T.sub,cursor:"pointer"}}>← Indietro</div>
        <div style={{flex:2,padding:"12px",borderRadius:10,background:total>=6?T.acc:T.bdr,textAlign:"center",fontSize:12,fontWeight:800,color:total>=6?"#fff":T.sub,cursor:total>=6?"pointer":"default",transition:"all .2s"}}>✓ Salva porta · {total}/{totalMax}</div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}input:focus,select:focus,textarea:focus{border-color:${T.acc}!important;box-shadow:0 0 0 3px ${T.acc}20}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px!important}`}</style>
    </div>
  );
}
