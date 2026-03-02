import { useState } from "react";

const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", blue: "#3B7FE0" };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ CATALOGHI ═══
const CONFIGURAZIONI = [
  { id: "nicchia", nome: "Nicchia", desc: "Tra due muri paralleli" },
  { id: "angolare-l", nome: "Angolare L", desc: "Due lati vetro, angolo 90°" },
  { id: "angolare-u", nome: "Angolare U", desc: "Tre lati vetro" },
  { id: "walkin", nome: "Walk-in", desc: "Pannello fisso, ingresso aperto" },
  { id: "semicircolare", nome: "Semicircolare", desc: "Piatto curvo, ante curve" },
  { id: "vasca", nome: "Parete vasca", desc: "Sopra vasca, 1-2 ante" },
  { id: "pentagonale", nome: "Pentagonale", desc: "Piatto pentagonale, angolo tagliato" },
];

const ConfigThumb = ({ id, size = 56 }) => {
  const s = size;
  const thumbs = {
    nicchia: <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="8" width="6" height="40" fill="#ccc"/><rect x="46" y="8" width="6" height="40" fill="#ccc"/><rect x="10" y="10" width="36" height="36" rx="1" fill={T.blue+"10"} stroke={T.blue} strokeWidth="1.5"/><line x1="28" y1="10" x2="28" y2="46" stroke={T.blue+"55"} strokeWidth="1" strokeDasharray="3,2"/><circle cx="26" cy="28" r="2" fill={T.blue}/></svg>,
    "angolare-l": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="4" width="6" height="48" fill="#ccc"/><rect x="4" y="46" width="48" height="6" fill="#ccc"/><rect x="10" y="10" width="36" height="36" rx="1" fill={T.blue+"10"} stroke={T.blue} strokeWidth="1.5"/><line x1="10" y1="28" x2="46" y2="28" stroke={T.blue+"55"} strokeWidth="1" strokeDasharray="3,2"/></svg>,
    "angolare-u": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="4" width="6" height="48" fill="#ccc"/><rect x="10" y="10" width="36" height="36" rx="1" fill={T.blue+"10"} stroke={T.blue} strokeWidth="1.5"/><line x1="28" y1="10" x2="28" y2="46" stroke={T.blue+"44"} strokeWidth="0.8" strokeDasharray="2,2"/><line x1="10" y1="28" x2="46" y2="28" stroke={T.blue+"44"} strokeWidth="0.8" strokeDasharray="2,2"/></svg>,
    walkin: <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="8" width="6" height="40" fill="#ccc"/><rect x="10" y="10" width="20" height="36" rx="1" fill={T.blue+"10"} stroke={T.blue} strokeWidth="1.5"/><path d="M30 10 L30 46" stroke={T.blue} strokeWidth="2"/><line x1="34" y1="28" x2="48" y2="28" stroke={T.blue+"33"} strokeWidth="1" markerEnd="url(#awbd)"/><defs><marker id="awbd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill={T.blue+"55"}/></marker></defs></svg>,
    semicircolare: <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="4" width="6" height="48" fill="#ccc"/><rect x="4" y="46" width="48" height="6" fill="#ccc"/><path d="M10 46 Q10 10 46 10" fill={T.blue+"08"} stroke={T.blue} strokeWidth="1.5"/></svg>,
    vasca: <svg width={s} height={s} viewBox="0 0 56 56"><rect x="8" y="32" width="40" height="18" rx="3" fill="#e8e6e1" stroke="#ccc" strokeWidth="1"/><rect x="12" y="8" width="20" height="24" rx="1" fill={T.blue+"10"} stroke={T.blue} strokeWidth="1.5"/><line x1="22" y1="8" x2="22" y2="32" stroke={T.blue+"55"} strokeWidth="1" strokeDasharray="3,2"/></svg>,
    pentagonale: <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="4" width="6" height="48" fill="#ccc"/><rect x="4" y="46" width="48" height="6" fill="#ccc"/><path d="M10 46 L10 20 L30 10 L46 10" fill={T.blue+"08"} stroke={T.blue} strokeWidth="1.5"/></svg>,
  };
  return thumbs[id] || thumbs.nicchia;
};

const APERTURE = ["Scorrevole","Battente","Pivot","Saloon","Soffietto","Fisso (walk-in)","Combinata (fisso+battente)"];
const VETRO_TIPO = ["Temperato 6mm","Temperato 8mm","Stratificato 6+6","Temperato extra-chiaro 6mm","Temperato extra-chiaro 8mm"];
const VETRO_FINITURA = ["Trasparente","Satinato integrale","Satinato fascia centrale","Serigrafato","Fumé","Specchiato","Decorato"];
const VETRO_TRATTAMENTO = ["Nessuno","Anticalcare standard","Anticalcare permanente (tipo ClearShield)","Easy-clean nanotecnologico"];
const PROFILI_MAT = ["Alluminio","Acciaio inox","Ottone","Frameless (senza profili)"];
const PROFILI_FIN = ["Cromo lucido","Cromo satinato","Nero opaco","Nero satinato","Oro spazzolato","Bronzo","Rame","Bianco","Gunmetal"];
const PIATTO_TIPO = ["Non incluso","Acrilico (ABS)","Resina (mineralmarmo)","Ceramica","Pietra naturale","Filo pavimento (su misura)"];
const PIATTO_FORMA = ["Rettangolare","Quadrato","Semicircolare","Pentagonale","Angolare simmetrico","Angolare asimmetrico"];
const PIATTO_SCARICO = ["Centrale","Laterale","Lineare (canaletta)","A scomparsa"];
const ACCESSORI = ["Maniglia esterna","Maniglia interna","Portasalviette","Gancio accappatoio","Mensola angolare","Sedile ribaltabile","Barra stabilizzatrice extra","Gocciolatoio magnetico"];
const AGGANCIO = ["A muro (tasselli)","A pavimento (perno)","A soffitto","Su muretto preesistente","A vetro (morsetti)","Incasso profilo"];

const MISURE_NICCHIA = [{l:700,lb:"70"},{l:800,lb:"80"},{l:900,lb:"90"},{l:1000,lb:"100"},{l:1100,lb:"110"},{l:1200,lb:"120"},{l:1400,lb:"140"},{l:1600,lb:"160"},{l:1700,lb:"170"}];

// ═══ UI ═══
const Chip=({label,sel,onTap,small,color})=><div onClick={onTap} style={{padding:small?"5px 10px":"7px 13px",borderRadius:9,border:`1.5px solid ${sel?color||T.acc:T.bdr}`,background:sel?(color||T.acc)+"14":T.card,fontSize:small?10:11,fontWeight:sel?700:500,color:sel?(color||T.acc):T.text,cursor:"pointer",transition:"all .12s",fontFamily:FF,userSelect:"none"}}>{label}</div>;
const ChipSel=({label,options,value,onChange,small,color})=><div style={{marginBottom:12}}><div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{options.map(o=><Chip key={o} label={o} sel={value===o} onTap={()=>onChange(o)} small={small} color={color}/>)}</div></div>;
const ChipMulti=({label,options,value=[],onChange,small})=><div style={{marginBottom:12}}><div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{options.map(o=><Chip key={o} label={o} sel={value.includes(o)} onTap={()=>onChange(value.includes(o)?value.filter(x=>x!==o):[...value,o])} small={small}/>)}</div></div>;
const Sec=({icon,title,count,open,onToggle})=><div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0",cursor:"pointer",borderBottom:`1px solid ${T.bdr}`,marginBottom:open?12:0,userSelect:"none"}}><span style={{fontSize:16}}>{icon}</span><span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>{title}</span>{count>0&&<span style={{fontSize:9,fontWeight:700,background:T.acc+"20",color:T.acc,padding:"2px 8px",borderRadius:20}}>{count}</span>}<span style={{fontSize:11,color:T.sub,transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>▼</span></div>;
const NumInput=({label,value,onChange,unit="mm"})=><div style={{marginBottom:10}}><div style={{fontSize:10,color:T.sub,marginBottom:3,fontWeight:600}}>{label}</div><div style={{display:"flex",alignItems:"center",gap:5}}><input type="number" inputMode="numeric" value={value||""} onChange={e=>onChange(parseInt(e.target.value)||0)} style={{flex:1,padding:"10px 12px",fontSize:15,fontFamily:FM,fontWeight:600,border:`1.5px solid ${T.bdr}`,borderRadius:9,background:T.card,color:T.text,outline:"none"}}/><span style={{fontSize:10,color:T.sub,background:T.bg,padding:"7px 9px",borderRadius:7,fontWeight:600}}>{unit}</span></div></div>;

// ═══ SVG DRAWING ═══
const DocciaDraw = ({ d }) => {
  const cfg = d.config || "";
  const larg = d.larghezza || "—";
  const prof = d.profondita || "—";
  const alt = d.altezza || "—";
  const isWalkin = cfg === "walkin";
  const isVasca = cfg === "vasca";
  const isAng = cfg.includes("angolare") || cfg === "pentagonale" || cfg === "semicircolare";

  return (
    <div style={{background:T.card,borderRadius:12,border:`1.5px solid ${T.bdr}`,padding:"14px 10px 8px",marginBottom:14}}>
      <div style={{fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8,textAlign:"center"}}>Vista pianta</div>
      <svg width="100%" viewBox="0 0 220 180" style={{maxHeight:200}}>
        {cfg==="nicchia"&&<>
          <rect x="20" y="20" width="12" height="120" fill="#ddd" stroke="#bbb" strokeWidth="0.8"/>
          <rect x="188" y="20" width="12" height="120" fill="#ddd" stroke="#bbb" strokeWidth="0.8"/>
          <rect x="20" y="132" width="180" height="12" fill="#ddd" stroke="#bbb" strokeWidth="0.8"/>
          <rect x="32" y="30" width="156" height="102" rx="2" fill={T.blue+"08"} stroke={T.blue} strokeWidth="1.5"/>
          <line x1="110" y1="30" x2="110" y2="132" stroke={T.blue+"44"} strokeWidth="1" strokeDasharray="4,3"/>
          <rect x="108" y="60" width="4" height="12" rx="2" fill={T.blue}/>
          <line x1="32" y1="155" x2="188" y2="155" stroke={T.sub} strokeWidth="0.5"/><text x="110" y="168" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
        </>}
        {cfg==="angolare-l"&&<>
          <rect x="20" y="20" width="12" height="140" fill="#ddd" stroke="#bbb" strokeWidth="0.8"/>
          <rect x="20" y="148" width="180" height="12" fill="#ddd" stroke="#bbb" strokeWidth="0.8"/>
          <rect x="32" y="30" width="140" height="118" rx="2" fill={T.blue+"08"} stroke={T.blue} strokeWidth="1.5"/>
          <line x1="32" y1="90" x2="172" y2="90" stroke={T.blue+"44"} strokeWidth="1" strokeDasharray="4,3"/>
          <line x1="32" y1="155" x2="172" y2="155" stroke={T.sub} strokeWidth="0.5"/><text x="102" y="168" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
          <line x1="185" y1="30" x2="185" y2="148" stroke={T.sub} strokeWidth="0.5"/><text x="200" y="92" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc} transform="rotate(-90,200,92)">{prof}</text>
        </>}
        {cfg==="walkin"&&<>
          <rect x="20" y="20" width="12" height="140" fill="#ddd" stroke="#bbb" strokeWidth="0.8"/>
          <rect x="20" y="148" width="180" height="12" fill="#ddd" stroke="#bbb" strokeWidth="0.8"/>
          <rect x="32" y="30" width="80" height="118" rx="2" fill={T.blue+"08"} stroke={T.blue} strokeWidth="2"/>
          <line x1="116" y1="85" x2="170" y2="85" stroke={T.blue+"33"} strokeWidth="1" markerEnd="url(#awd)"/>
          <defs><marker id="awd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill={T.blue+"55"}/></marker></defs>
          <text x="145" y="80" textAnchor="middle" fontSize="8" fill={T.sub}>ingresso</text>
          <line x1="32" y1="168" x2="112" y2="168" stroke={T.sub} strokeWidth="0.5"/><text x="72" y="178" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
        </>}
        {cfg==="vasca"&&<>
          <rect x="30" y="60" width="160" height="80" rx="8" fill="#e8e6e1" stroke="#ccc" strokeWidth="1"/>
          <text x="110" y="108" textAnchor="middle" fontSize="9" fill={T.sub}>vasca</text>
          <rect x="40" y="20" width="80" height="40" rx="2" fill={T.blue+"10"} stroke={T.blue} strokeWidth="1.5"/>
          <line x1="80" y1="20" x2="80" y2="60" stroke={T.blue+"44"} strokeWidth="1" strokeDasharray="3,2"/>
          <line x1="40" y1="155" x2="120" y2="155" stroke={T.sub} strokeWidth="0.5"/><text x="80" y="168" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
        </>}
        {!cfg&&<text x="110" y="90" textAnchor="middle" fontSize="11" fill={T.sub}>Seleziona configurazione</text>}
        {cfg&&cfg!=="nicchia"&&cfg!=="angolare-l"&&cfg!=="walkin"&&cfg!=="vasca"&&<>
          <rect x="30" y="20" width="160" height="120" rx="2" fill={T.blue+"08"} stroke={T.blue} strokeWidth="1.5"/>
          <line x1="30" y1="155" x2="190" y2="155" stroke={T.sub} strokeWidth="0.5"/><text x="110" y="168" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
        </>}
        <text x="110" y="12" textAnchor="middle" fontSize="8" fill={T.sub}>H: {alt} mm</text>
      </svg>
    </div>
  );
};

// ═══ MAIN ═══
export default function MastroBoxDoccia() {
  const [d,setD]=useState({});
  const [sec,setSec]=useState({config:true,mis:true,vetro:false,profili:false,piatto:false,acc:false});
  const set=(k,v)=>setD(p=>({...p,[k]:v}));
  const tog=(s)=>setSec(p=>({...p,[s]:!p[s]}));

  const isAng=(d.config||"").includes("angolare")||(d.config||"")==="pentagonale";

  const confC=[d.config,d.apertura].filter(Boolean).length;
  const misC=[d.larghezza,d.altezza].filter(Boolean).length+(isAng&&d.profondita?1:0);
  const vetroC=[d.vetroTipo,d.vetroFin,d.vetroTratt].filter(Boolean).length;
  const profC=[d.profilMat,d.profilFin].filter(Boolean).length;
  const piatC=[d.piattoTipo,d.piattoForma].filter(Boolean).length;
  const accC=[d.aggancio,...(d.accessori||[])].filter(Boolean).length;
  const total=confC+misC+vetroC+profC+piatC+accC;
  const totalMax=18;

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:T.bg,fontFamily:FF}}>
      <div style={{background:T.topbar,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:99}}>
        <div style={{width:30,height:30,borderRadius:7,background:"#ffffff15",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,color:"#fff"}}>←</div>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:-0.3}}>Box Doccia — Presa Misure</div><div style={{fontSize:10,color:"#888"}}>Vano BD1 · Bagno</div></div>
        <div style={{background:total>=totalMax*0.5?T.green+"30":T.acc+"30",color:total>=totalMax*0.5?T.green:T.acc,padding:"3px 10px",borderRadius:16,fontSize:11,fontWeight:800,fontFamily:FM}}>{total}/{totalMax}</div>
      </div>
      <div style={{height:3,background:T.bdr}}><div style={{height:3,background:total>=totalMax*0.5?T.green:T.acc,width:`${(total/totalMax)*100}%`,transition:"width .3s",borderRadius:2}}/></div>

      <div style={{padding:"8px 16px 100px"}}>

        {d.config&&<DocciaDraw d={d}/>}

        {/* CONFIGURAZIONE */}
        <Sec icon="🚿" title="Configurazione" count={confC} open={sec.config} onToggle={()=>tog("config")}/>
        {sec.config&&<div style={{animation:"fadeIn .2s"}}>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
            {CONFIGURAZIONI.map(c=>(
              <div key={c.id} onClick={()=>set("config",c.id===d.config?null:c.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,border:`1.5px solid ${d.config===c.id?T.acc:T.bdr}`,background:d.config===c.id?T.acc+"0a":T.card,cursor:"pointer",transition:"all .12s"}}>
                <div style={{width:52,height:52,borderRadius:8,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><ConfigThumb id={c.id}/></div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:d.config===c.id?T.acc:T.text}}>{c.nome}</div><div style={{fontSize:9,color:T.sub,marginTop:1}}>{c.desc}</div></div>
                {d.config===c.id&&<div style={{width:18,height:18,borderRadius:9,background:T.acc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:800}}>✓</div>}
              </div>
            ))}
          </div>
          <ChipSel label="Tipo apertura" options={d.config==="walkin"?["Fisso (walk-in)"]:APERTURE} value={d.apertura} onChange={v=>set("apertura",v)}/>
          {d.config==="vasca"&&<ChipSel label="Ante parete vasca" options={["1 anta fissa","1 anta mobile","2 ante (fisso+mobile)","Soffietto"]} value={d.anteVasca} onChange={v=>set("anteVasca",v)} small/>}
        </div>}

        {/* MISURE */}
        <Sec icon="📐" title="Misure" count={misC} open={sec.mis} onToggle={()=>tog("mis")}/>
        {sec.mis&&<div style={{animation:"fadeIn .2s"}}>
          {d.config==="nicchia"&&<><div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase"}}>Larghezza nicchia (cm)</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>{MISURE_NICCHIA.map(ms=><Chip key={ms.lb} label={ms.lb} sel={d.larghezza===ms.l} onTap={()=>set("larghezza",ms.l)} small/>)}</div></>}
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><NumInput label={d.config==="nicchia"?"Larghezza nicchia":"Larghezza ingresso"} value={d.larghezza} onChange={v=>set("larghezza",v)}/></div>
            {isAng&&<div style={{flex:1}}><NumInput label="Profondità (lato corto)" value={d.profondita} onChange={v=>set("profondita",v)}/></div>}
          </div>
          <NumInput label="Altezza box" value={d.altezza} onChange={v=>set("altezza",v)}/>
          <ChipSel label="Riducibile" options={["No","Sì, taglio laterale","Sì, taglio altezza","Sì, entrambi"]} value={d.riducibile} onChange={v=>set("riducibile",v)} small/>
          {d.riducibile&&d.riducibile!=="No"&&<div style={{fontSize:10,color:T.blue,background:T.blue+"12",border:`1px solid ${T.blue}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>📐 Profili riducibili: taglio in cantiere per adattamento ±20mm</div>}
        </div>}

        {/* VETRO */}
        <Sec icon="🪟" title="Vetro" count={vetroC} open={sec.vetro} onToggle={()=>tog("vetro")}/>
        {sec.vetro&&<div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo vetro" options={VETRO_TIPO} value={d.vetroTipo} onChange={v=>set("vetroTipo",v)}/>
          <ChipSel label="Finitura vetro" options={VETRO_FINITURA} value={d.vetroFin} onChange={v=>set("vetroFin",v)} small/>
          <ChipSel label="Trattamento" options={VETRO_TRATTAMENTO} value={d.vetroTratt} onChange={v=>set("vetroTratt",v)} small/>
          {d.vetroTratt&&d.vetroTratt.includes("permanente")&&<div style={{fontSize:10,color:T.green,background:T.green+"12",border:`1px solid ${T.green}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>✓ Trattamento permanente: protezione anti-calcare garantita 10 anni</div>}
        </div>}

        {/* PROFILI */}
        <Sec icon="🔧" title="Profili e ferramenta" count={profC} open={sec.profili} onToggle={()=>tog("profili")}/>
        {sec.profili&&<div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Materiale profili" options={PROFILI_MAT} value={d.profilMat} onChange={v=>set("profilMat",v)}/>
          {d.profilMat!=="Frameless (senza profili)"&&<ChipSel label="Finitura profili" options={PROFILI_FIN} value={d.profilFin} onChange={v=>set("profilFin",v)} small/>}
          {d.profilMat==="Frameless (senza profili)"&&<div style={{fontSize:10,color:T.acc,background:T.acc+"12",border:`1px solid ${T.acc}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>✨ Frameless: vetro temperato 8mm minimo, morsetti puntuali, estetica minimale</div>}
        </div>}

        {/* PIATTO DOCCIA */}
        <Sec icon="🧱" title="Piatto doccia" count={piatC} open={sec.piatto} onToggle={()=>tog("piatto")}/>
        {sec.piatto&&<div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo piatto" options={PIATTO_TIPO} value={d.piattoTipo} onChange={v=>set("piattoTipo",v)}/>
          {d.piattoTipo&&d.piattoTipo!=="Non incluso"&&<>
            <ChipSel label="Forma" options={PIATTO_FORMA} value={d.piattoForma} onChange={v=>set("piattoForma",v)} small/>
            <ChipSel label="Scarico" options={PIATTO_SCARICO} value={d.piattoScarico} onChange={v=>set("piattoScarico",v)} small/>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1}}><NumInput label="Larghezza piatto" value={d.piattoL} onChange={v=>set("piattoL",v)}/></div>
              <div style={{flex:1}}><NumInput label="Profondità piatto" value={d.piattoP} onChange={v=>set("piattoP",v)}/></div>
            </div>
          </>}
        </div>}

        {/* ACCESSORI */}
        <Sec icon="🔨" title="Accessori e montaggio" count={accC} open={sec.acc} onToggle={()=>tog("acc")}/>
        {sec.acc&&<div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Sistema aggancio" options={AGGANCIO} value={d.aggancio} onChange={v=>set("aggancio",v)}/>
          <ChipMulti label="Accessori" options={ACCESSORI} value={d.accessori} onChange={v=>set("accessori",v)} small/>
        </div>}

        {/* NOTE + FOTO */}
        <div style={{marginTop:16}}>
          <div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase"}}>Note</div>
          <textarea value={d.note||""} onChange={e=>set("note",e.target.value)} placeholder="Tubazioni esistenti, piastrelle da proteggere, accesso difficile..." style={{width:"100%",padding:"10px 12px",fontSize:11,fontFamily:FF,border:`1.5px solid ${T.bdr}`,borderRadius:9,background:T.card,minHeight:50,resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginTop:10,display:"flex",gap:6}}>
          {["📷 Foto bagno","📐 Schizzo","🎤 Vocale"].map(b=><div key={b} style={{flex:1,height:56,borderRadius:10,border:`2px dashed ${T.bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:T.card}}><span style={{fontSize:16}}>{b.split(" ")[0]}</span><span style={{fontSize:8,color:T.sub,fontWeight:600}}>{b.split(" ").slice(1).join(" ")}</span></div>)}
        </div>

        {/* RIEPILOGO */}
        {total>=5&&<div style={{marginTop:20,background:T.card,borderRadius:12,border:`1.5px solid ${T.bdr}`,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:T.topbar,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12}}>📋</span><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>Riepilogo Box Doccia</span><span style={{fontSize:9,color:"#888",marginLeft:"auto",fontFamily:FM}}>{total}</span></div>
          <div style={{padding:"12px 14px",fontSize:11,lineHeight:2,color:T.text}}>
            {d.config&&<div><span style={{color:T.sub}}>Config:</span> <strong>{CONFIGURAZIONI.find(c=>c.id===d.config)?.nome}</strong></div>}
            {d.apertura&&<div><span style={{color:T.sub}}>Apertura:</span> <strong>{d.apertura}</strong></div>}
            {d.larghezza>0&&<div><span style={{color:T.sub}}>Misure:</span> <strong style={{fontFamily:FM}}>{d.larghezza}{d.profondita?`×${d.profondita}`:""}</strong> mm · H <strong style={{fontFamily:FM}}>{d.altezza||"—"}</strong></div>}
            {d.vetroTipo&&<div><span style={{color:T.sub}}>Vetro:</span> <strong>{d.vetroTipo}</strong> {d.vetroFin&&<span style={{color:T.sub}}>· {d.vetroFin}</span>}</div>}
            {d.profilMat&&<div><span style={{color:T.sub}}>Profili:</span> <strong>{d.profilMat}</strong> {d.profilFin&&<span style={{color:T.sub}}>· {d.profilFin}</span>}</div>}
            {d.piattoTipo&&d.piattoTipo!=="Non incluso"&&<div><span style={{color:T.sub}}>Piatto:</span> <strong>{d.piattoTipo}</strong> {d.piattoForma&&<span style={{color:T.sub}}>· {d.piattoForma}</span>}</div>}
            {d.aggancio&&<div><span style={{color:T.sub}}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
          </div>
        </div>}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.card,borderTop:`1px solid ${T.bdr}`,padding:"10px 16px",display:"flex",gap:8,maxWidth:480,margin:"0 auto"}}>
        <div style={{flex:1,padding:"12px",borderRadius:10,background:T.bg,textAlign:"center",fontSize:12,fontWeight:700,color:T.sub,cursor:"pointer"}}>← Indietro</div>
        <div style={{flex:2,padding:"12px",borderRadius:10,background:total>=5?T.acc:T.bdr,textAlign:"center",fontSize:12,fontWeight:800,color:total>=5?"#fff":T.sub,cursor:total>=5?"pointer":"default",transition:"all .2s"}}>✓ Salva box doccia · {total}/{totalMax}</div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}input:focus,select:focus,textarea:focus{border-color:${T.acc}!important;box-shadow:0 0 0 3px ${T.acc}20}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
