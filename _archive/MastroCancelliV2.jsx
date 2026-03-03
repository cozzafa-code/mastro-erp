import { useState } from "react";

const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", blue: "#3B7FE0" };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ CATALOGHI ═══
const TIPOLOGIE = [
  { id: "batt-sing", nome: "Battente singolo", desc: "1 anta, apertura a spinta" },
  { id: "batt-dopp", nome: "Battente doppio", desc: "2 ante simmetriche o asimmetriche" },
  { id: "scorr", nome: "Scorrevole", desc: "Su binario, 1 anta" },
  { id: "scorr-tele", nome: "Scorrevole telescopico", desc: "2+ ante sovrapposte" },
  { id: "pedonale", nome: "Pedonale", desc: "Ingresso persone, anta piccola" },
  { id: "carraio-ped", nome: "Carraio + pedonale", desc: "Combinato veicoli + persone" },
  { id: "rec-pannello", nome: "Recinzione a pannelli", desc: "Pannelli modulari su pali" },
  { id: "ringhiera", nome: "Ringhiera", desc: "Balconi, terrazze, scale" },
  { id: "parapetto", nome: "Parapetto", desc: "Protezione, altezza normativa" },
  { id: "staccionata", nome: "Staccionata", desc: "Giardino, rustico, delimitazione" },
];

const TipoThumb = ({ id, size=56 }) => {
  const s=size;
  const thumbs = {
    "batt-sing": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="46" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="10" y="14" width="36" height="28" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/>{[0,1,2,3,4].map(i=><rect key={i} x={14+i*7} y="16" width="2" height="24" rx="0.5" fill={T.acc+"55"}/>)}<path d="M46 42 Q46 26 32 22" fill="none" stroke={T.acc+"33"} strokeWidth="0.8" strokeDasharray="3,2"/></svg>,
    "batt-dopp": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="46" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="10" y="14" width="16" height="28" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/><rect x="30" y="14" width="16" height="28" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/><line x1="28" y1="14" x2="28" y2="42" stroke={T.acc} strokeWidth="1" strokeDasharray="2,2"/></svg>,
    "scorr": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="46" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="10" y="14" width="30" height="28" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/><line x1="4" y1="44" x2="52" y2="44" stroke={T.acc} strokeWidth="2"/><line x1="20" y1="28" x2="36" y2="28" stroke={T.acc} strokeWidth="1" markerEnd="url(#acg)"/><defs><marker id="acg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill={T.acc}/></marker></defs></svg>,
    "scorr-tele": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="4" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="46" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="10" y="14" width="22" height="28" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/><rect x="14" y="16" width="22" height="24" rx="1" fill="none" stroke={T.acc+"66"} strokeWidth="1"/><line x1="4" y1="44" x2="52" y2="44" stroke={T.acc} strokeWidth="2"/></svg>,
    "pedonale": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="14" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="36" y="10" width="6" height="36" rx="1" fill="#888"/><rect x="20" y="14" width="16" height="28" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/><circle cx="33" cy="28" r="2" fill={T.acc}/></svg>,
    "carraio-ped": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="2" y="10" width="5" height="36" rx="1" fill="#888"/><rect x="28" y="10" width="4" height="36" rx="1" fill="#888"/><rect x="49" y="10" width="5" height="36" rx="1" fill="#888"/><rect x="7" y="14" width="21" height="28" rx="1" fill="none" stroke={T.acc} strokeWidth="1.2"/><line x1="17" y1="14" x2="17" y2="42" stroke={T.acc+"44"} strokeWidth="0.8" strokeDasharray="2,2"/><rect x="32" y="16" width="17" height="24" rx="1" fill="none" stroke={T.acc} strokeWidth="1.2"/></svg>,
    "rec-pannello": <svg width={s} height={s} viewBox="0 0 56 56">{[0,1,2,3].map(i=><rect key={i} x={6+i*14} y="10" width="3" height="36" rx="0.5" fill="#888"/>)}{[0,1,2].map(i=><rect key={`p${i}`} x={9+i*14} y="14" width="11" height="28" rx="1" fill="none" stroke={T.acc} strokeWidth="1"/>)}{[0,1,2].map(i=>[0,1,2].map(j=><line key={`w${i}${j}`} x1={9+i*14} y1={20+j*8} x2={20+i*14} y2={20+j*8} stroke={T.acc+"44"} strokeWidth="0.5"/>))}</svg>,
    "ringhiera": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="6" y="10" width="44" height="3" rx="1" fill={T.acc} /><rect x="6" y="36" width="44" height="3" rx="1" fill={T.acc+"66"}/>{[0,1,2,3,4,5,6].map(i=><rect key={i} x={10+i*6} y="13" width="2" height="23" rx="0.5" fill={T.acc+"77"}/>)}<rect x="4" y="8" width="4" height="36" rx="1" fill="#888"/><rect x="48" y="8" width="4" height="36" rx="1" fill="#888"/></svg>,
    "parapetto": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="6" y="16" width="44" height="4" rx="1" fill={T.acc}/><rect x="6" y="28" width="44" height="3" rx="1" fill={T.acc+"55"}/><rect x="8" y="20" width="40" height="8" rx="1" fill={T.acc+"15"} stroke={T.acc+"33"} strokeWidth="0.5"/><rect x="4" y="14" width="4" height="28" rx="1" fill="#888"/><rect x="48" y="14" width="4" height="28" rx="1" fill="#888"/></svg>,
    "staccionata": <svg width={s} height={s} viewBox="0 0 56 56"><rect x="6" y="22" width="44" height="3" rx="0.5" fill="#a18072"/><rect x="6" y="32" width="44" height="3" rx="0.5" fill="#a18072"/>{[0,1,2,3,4,5].map(i=><path key={i} d={`M${10+i*8} 12 L${14+i*8} 8 L${18+i*8} 12 L${18+i*8} 40 L${10+i*8} 40 Z`} fill="#c4a882" stroke="#a18072" strokeWidth="0.8"/>)}</svg>,
  };
  return thumbs[id]||thumbs["batt-sing"];
};

const MATERIALI = ["Ferro zincato verniciato","Alluminio","Acciaio inox 304","Acciaio inox 316","COR-TEN","Ferro battuto","WPC composito","Legno trattato"];
const TAMPONAMENTO = ["Doghe orizzontali","Doghe verticali","Lamelle orientabili","Pannello cieco","Grigliato","Rete elettrosaldata","Tubolare verticale","Tubolare orizzontale","Misto (basso cieco + alto aperto)","Vetro (temperato/stratificato)"];
const AUTOMAZIONE = ["Manuale","Predisposizione cavidotto","Motore interrato 230V","Motore interrato 24V","Motore a cremagliera","Motore a catena","Motore solare","Motore a batteria"];
const AUTO_ACC = ["Telecomando 2 canali","Telecomando 4 canali","Tastierino numerico","Lettore badge/chiave","Fotocellule coppia","Lampeggiante","Antenna esterna","Costa sensibile","Selettore a chiave","Modulo WiFi/App","Batteria tampone"];
const PILASTRI = ["Esistenti (non toccare)","Nuovi in muratura","Nuovi in acciaio","Nuovi prefabbricati","Rivestimento su esistenti"];
const PILASTRI_DIM = ["20×20 cm","25×25 cm","30×30 cm","35×35 cm","40×40 cm","Tondo Ø20","Tondo Ø25","Su misura"];
const AGGANCIO = ["A pavimento con piastra","Interrato con fondazione","Su muretto esistente","Frontale a muro","Su pilastro con cardini","Tasselli chimici"];
const FINITURE = ["Zincatura a caldo","Verniciatura a polvere","Corten naturale","Verniciatura a liquido","Anodizzazione (alluminio)","Impregnante (legno)"];
const COLORI = ["Nero RAL 9005","Antracite RAL 7016","Grigio RAL 7035","Bianco RAL 9010","Marrone RAL 8017","Verde RAL 6005","Corten effect","Effetto legno","RAL custom"];

// ═══ UI ═══
const Chip=({label,sel,onTap,small,color})=><div onClick={onTap} style={{padding:small?"5px 10px":"7px 13px",borderRadius:9,border:`1.5px solid ${sel?color||T.acc:T.bdr}`,background:sel?(color||T.acc)+"14":T.card,fontSize:small?10:11,fontWeight:sel?700:500,color:sel?(color||T.acc):T.text,cursor:"pointer",transition:"all .12s",fontFamily:FF,userSelect:"none"}}>{label}</div>;
const ChipSel=({label,options,value,onChange,small,color})=><div style={{marginBottom:12}}><div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{options.map(o=><Chip key={o} label={o} sel={value===o} onTap={()=>onChange(o)} small={small} color={color}/>)}</div></div>;
const ChipMulti=({label,options,value=[],onChange,small})=><div style={{marginBottom:12}}><div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{options.map(o=><Chip key={o} label={o} sel={value.includes(o)} onTap={()=>onChange(value.includes(o)?value.filter(x=>x!==o):[...value,o])} small={small}/>)}</div></div>;
const Sec=({icon,title,count,open,onToggle})=><div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0",cursor:"pointer",borderBottom:`1px solid ${T.bdr}`,marginBottom:open?12:0,userSelect:"none"}}><span style={{fontSize:16}}>{icon}</span><span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>{title}</span>{count>0&&<span style={{fontSize:9,fontWeight:700,background:T.acc+"20",color:T.acc,padding:"2px 8px",borderRadius:20}}>{count}</span>}<span style={{fontSize:11,color:T.sub,transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>▼</span></div>;
const NumInput=({label,value,onChange,unit="mm"})=><div style={{marginBottom:10}}><div style={{fontSize:10,color:T.sub,marginBottom:3,fontWeight:600}}>{label}</div><div style={{display:"flex",alignItems:"center",gap:5}}><input type="number" inputMode="numeric" value={value||""} onChange={e=>onChange(parseInt(e.target.value)||0)} style={{flex:1,padding:"10px 12px",fontSize:15,fontFamily:FM,fontWeight:600,border:`1.5px solid ${T.bdr}`,borderRadius:9,background:T.card,color:T.text,outline:"none"}}/><span style={{fontSize:10,color:T.sub,background:T.bg,padding:"7px 9px",borderRadius:7,fontWeight:600}}>{unit}</span></div></div>;

// ═══ SVG DRAWING ═══
const CancelloDraw = ({ d }) => {
  const tipo = d.tipologia||"";
  const larg = d.larghezza||"—";
  const alt = d.altezza||"—";
  const isScorr = tipo.includes("scorr");
  const isDopp = tipo.includes("dopp") || tipo==="carraio-ped";
  const isRec = tipo.includes("rec")||tipo==="ringhiera"||tipo==="parapetto"||tipo==="staccionata";
  const hasPendenza = d.pendenza && d.pendenza > 0;

  return (
    <div style={{background:T.card,borderRadius:12,border:`1.5px solid ${T.bdr}`,padding:"14px 10px 8px",marginBottom:14}}>
      <div style={{fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8,textAlign:"center"}}>Vista frontale</div>
      <svg width="100%" viewBox="0 0 240 150" style={{maxHeight:180}}>
        {/* Terreno */}
        <line x1="0" y1={hasPendenza?128:120} x2="240" y2="120" stroke="#a1a1aa" strokeWidth="1.5"/>

        {isRec ? <>
          {/* Recinzione */}
          {[0,1,2,3,4].map(i=><rect key={i} x={20+i*50} y="30" width="6" height="90" rx="1" fill="#888" stroke="#666" strokeWidth="0.5"/>)}
          {[0,1,2,3].map(i=><rect key={`p${i}`} x={26+i*50} y="40" width="44" height="70" rx="1" fill="none" stroke={T.acc} strokeWidth="1.2"/>)}
          {[0,1,2,3].map(i=>[0,1,2,3].map(j=><line key={`w${i}${j}`} x1={28+i*50} y1={48+j*16} x2={68+i*50} y2={48+j*16} stroke={T.acc+"33"} strokeWidth="0.5"/>))}
          <line x1="20" y1="135" x2="220" y2="135" stroke={T.sub} strokeWidth="0.5"/>
          <text x="120" y="146" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>Lung. {larg}</text>
        </> : <>
          {/* Pilastri */}
          <rect x="20" y="20" width="14" height="100" rx="2" fill="#999" stroke="#777" strokeWidth="0.8"/>
          <rect x="206" y="20" width="14" height="100" rx="2" fill="#999" stroke="#777" strokeWidth="0.8"/>

          {isDopp ? <>
            {/* Doppio */}
            <rect x="34" y="32" width="80" height="85" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/>
            <rect x="126" y="32" width="80" height="85" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/>
            <line x1="120" y1="32" x2="120" y2="117" stroke={T.acc} strokeWidth="1.5" strokeDasharray="4,3"/>
            {/* Doghe */}
            {[0,1,2,3,4,5].map(i=><><line key={`dl${i}`} x1="38" y1={38+i*13} x2="110" y2={38+i*13} stroke={T.acc+"33"} strokeWidth="0.5"/><line key={`dr${i}`} x1="130" y1={38+i*13} x2="202" y2={38+i*13} stroke={T.acc+"33"} strokeWidth="0.5"/></>)}
          </> : isScorr ? <>
            {/* Scorrevole */}
            <rect x="34" y="32" width="140" height="85" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/>
            <line x1="20" y1="119" x2="220" y2="119" stroke={T.acc} strokeWidth="2.5"/>
            {/* Freccia */}
            <line x1="80" y1="74" x2="180" y2="74" stroke={T.acc} strokeWidth="1.5" markerEnd="url(#acgd)"/>
            <defs><marker id="acgd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill={T.acc}/></marker></defs>
            {[0,1,2,3,4,5].map(i=><line key={i} x1="38" y1={38+i*13} x2="170" y2={38+i*13} stroke={T.acc+"33"} strokeWidth="0.5"/>)}
          </> : <>
            {/* Singolo battente */}
            <rect x="34" y="32" width="172" height="85" rx="1" fill="none" stroke={T.acc} strokeWidth="1.5"/>
            <path d="M34 117 Q34 60 100 50" fill="none" stroke={T.acc+"33"} strokeWidth="0.8" strokeDasharray="4,3"/>
            {[0,1,2,3,4,5].map(i=><line key={i} x1="38" y1={38+i*13} x2="202" y2={38+i*13} stroke={T.acc+"33"} strokeWidth="0.5"/>)}
            <circle cx="196" cy="74" r="3" fill={T.acc}/>
          </>}

          {/* Quote */}
          <line x1="34" y1="132" x2="206" y2="132" stroke={T.sub} strokeWidth="0.5"/>
          <line x1="34" y1="128" x2="34" y2="136" stroke={T.sub} strokeWidth="0.5"/>
          <line x1="206" y1="128" x2="206" y2="136" stroke={T.sub} strokeWidth="0.5"/>
          <text x="120" y="144" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>

          <line x1="222" y1="32" x2="222" y2="117" stroke={T.sub} strokeWidth="0.5"/>
          <line x1="218" y1="32" x2="226" y2="32" stroke={T.sub} strokeWidth="0.5"/>
          <line x1="218" y1="117" x2="226" y2="117" stroke={T.sub} strokeWidth="0.5"/>
          <text x="234" y="78" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc} transform="rotate(-90,234,78)">{alt}</text>
        </>}

        {!tipo && <text x="120" y="75" textAnchor="middle" fontSize="11" fill={T.sub}>Seleziona tipologia</text>}

        {hasPendenza && <text x="200" y="112" fontSize="8" fill={T.red}>↗ {d.pendenza}°</text>}
      </svg>
    </div>
  );
};

// ═══ MAIN ═══
export default function MastroCancelliV2() {
  const [d,setD]=useState({});
  const [sec,setSec]=useState({tipo:true,mis:true,config:false,auto:false,pil:false,mont:false});
  const set=(k,v)=>setD(p=>({...p,[k]:v}));
  const tog=(s)=>setSec(p=>({...p,[s]:!p[s]}));

  const isRec=(d.tipologia||"").includes("rec")||(d.tipologia||"")==="ringhiera"||(d.tipologia||"")==="parapetto"||(d.tipologia||"")==="staccionata";
  const isGate=!isRec&&!!d.tipologia;

  const tipoC=[d.tipologia,d.materiale].filter(Boolean).length;
  const misC=[d.larghezza,d.altezza].filter(Boolean).length;
  const confC=[d.tamponamento,d.finitura,d.colore].filter(Boolean).length;
  const autoC=[d.automazione,...(d.autoAcc||[])].filter(Boolean).length;
  const pilC=[d.pilastri,d.pilDim].filter(Boolean).length;
  const montC=[d.aggancio].filter(Boolean).length;
  const total=tipoC+misC+confC+autoC+pilC+montC;
  const totalMax=16;

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:T.bg,fontFamily:FF}}>
      <div style={{background:T.topbar,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:99}}>
        <div style={{width:30,height:30,borderRadius:7,background:"#ffffff15",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,color:"#fff"}}>←</div>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:-0.3}}>Cancelli — Presa Misure</div><div style={{fontSize:10,color:"#888"}}>Ingresso · Rossi Mario</div></div>
        <div style={{background:total>=totalMax*0.5?T.green+"30":T.acc+"30",color:total>=totalMax*0.5?T.green:T.acc,padding:"3px 10px",borderRadius:16,fontSize:11,fontWeight:800,fontFamily:FM}}>{total}/{totalMax}</div>
      </div>
      <div style={{height:3,background:T.bdr}}><div style={{height:3,background:total>=totalMax*0.5?T.green:T.acc,width:`${(total/totalMax)*100}%`,transition:"width .3s",borderRadius:2}}/></div>

      <div style={{padding:"8px 16px 100px"}}>

        {d.tipologia&&<CancelloDraw d={d}/>}

        {/* TIPOLOGIA */}
        <Sec icon="🏗️" title="Tipologia" count={tipoC} open={sec.tipo} onToggle={()=>tog("tipo")}/>
        {sec.tipo&&<div style={{animation:"fadeIn .2s"}}>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
            {TIPOLOGIE.map(t=>(
              <div key={t.id} onClick={()=>set("tipologia",t.id===d.tipologia?null:t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,border:`1.5px solid ${d.tipologia===t.id?T.acc:T.bdr}`,background:d.tipologia===t.id?T.acc+"0a":T.card,cursor:"pointer",transition:"all .12s"}}>
                <div style={{width:48,height:48,borderRadius:7,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><TipoThumb id={t.id} size={44}/></div>
                <div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:d.tipologia===t.id?T.acc:T.text}}>{t.nome}</div><div style={{fontSize:9,color:T.sub}}>{t.desc}</div></div>
                {d.tipologia===t.id&&<div style={{width:16,height:16,borderRadius:8,background:T.acc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800}}>✓</div>}
              </div>
            ))}
          </div>
          <ChipSel label="Materiale" options={MATERIALI} value={d.materiale} onChange={v=>set("materiale",v)}/>
        </div>}

        {/* MISURE */}
        <Sec icon="📐" title="Misure" count={misC} open={sec.mis} onToggle={()=>tog("mis")}/>
        {sec.mis&&<div style={{animation:"fadeIn .2s"}}>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><NumInput label={isRec?"Lunghezza totale":"Larghezza luce"} value={d.larghezza} onChange={v=>set("larghezza",v)}/></div>
            <div style={{flex:1}}><NumInput label="Altezza" value={d.altezza} onChange={v=>set("altezza",v)}/></div>
          </div>
          {(d.tipologia||"")==="carraio-ped"&&<div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><NumInput label="Largh. carraio" value={d.largCarraio} onChange={v=>set("largCarraio",v)}/></div>
            <div style={{flex:1}}><NumInput label="Largh. pedonale" value={d.largPed} onChange={v=>set("largPed",v)}/></div>
          </div>}
          {(d.tipologia||"").includes("dopp")&&<div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><NumInput label="Anta SX" value={d.antaSx} onChange={v=>set("antaSx",v)}/></div>
            <div style={{flex:1}}><NumInput label="Anta DX" value={d.antaDx} onChange={v=>set("antaDx",v)}/></div>
          </div>}
          <NumInput label="Pendenza terreno" value={d.pendenza} onChange={v=>set("pendenza",v)} unit="°"/>
          {d.pendenza>5&&<div style={{fontSize:10,color:T.red,background:T.red+"12",border:`1px solid ${T.red}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>⚠ Pendenza {">"} 5°: necessario cancello con compensazione dislivello</div>}
          {isRec&&<NumInput label="N° pannelli/campate" value={d.nPannelli} onChange={v=>set("nPannelli",v)} unit="pz"/>}
        </div>}

        {/* CONFIGURAZIONE */}
        <Sec icon="⚙️" title="Design e finitura" count={confC} open={sec.config} onToggle={()=>tog("config")}/>
        {sec.config&&<div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tamponamento" options={TAMPONAMENTO} value={d.tamponamento} onChange={v=>set("tamponamento",v)}/>
          <ChipSel label="Finitura" options={FINITURE} value={d.finitura} onChange={v=>set("finitura",v)}/>
          <ChipSel label="Colore" options={COLORI} value={d.colore} onChange={v=>set("colore",v)} small/>
          {(d.materiale||"")==="COR-TEN"&&<div style={{fontSize:10,color:T.acc,background:T.acc+"12",border:`1px solid ${T.acc}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>🟫 COR-TEN: ossidazione naturale 6-12 mesi. Macchia durante ossidazione.</div>}
        </div>}

        {/* AUTOMAZIONE */}
        {isGate&&<><Sec icon="⚡" title="Automazione" count={autoC} open={sec.auto} onToggle={()=>tog("auto")}/>
        {sec.auto&&<div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo automazione" options={AUTOMAZIONE} value={d.automazione} onChange={v=>set("automazione",v)}/>
          {d.automazione&&d.automazione!=="Manuale"&&d.automazione!=="Predisposizione cavidotto"&&<ChipMulti label="Accessori automazione" options={AUTO_ACC} value={d.autoAcc} onChange={v=>set("autoAcc",v)} small/>}
          {d.automazione==="Predisposizione cavidotto"&&<div style={{fontSize:10,color:T.acc,background:T.acc+"12",border:`1px solid ${T.acc}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>⚡ Predisposizione: cavidotto Ø40mm + cassetta 503 ai pilastri + alimentazione 230V</div>}
          {d.automazione&&d.automazione.includes("solare")&&<div style={{fontSize:10,color:T.green,background:T.green+"12",border:`1px solid ${T.green}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>☀️ Solare: nessun cablaggio, pannello su pilastro, batteria integrata</div>}
        </div>}</>}

        {/* PILASTRI */}
        <Sec icon="🧱" title="Pilastri e supporti" count={pilC} open={sec.pil} onToggle={()=>tog("pil")}/>
        {sec.pil&&<div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Pilastri" options={PILASTRI} value={d.pilastri} onChange={v=>set("pilastri",v)}/>
          {d.pilastri&&d.pilastri!=="Esistenti (non toccare)"&&<ChipSel label="Dimensione pilastri" options={PILASTRI_DIM} value={d.pilDim} onChange={v=>set("pilDim",v)} small/>}
          {isRec&&<NumInput label="Interasse pali" value={d.interasse} onChange={v=>set("interasse",v)}/>}
        </div>}

        {/* MONTAGGIO */}
        <Sec icon="🔨" title="Montaggio e aggancio" count={montC} open={sec.mont} onToggle={()=>tog("mont")}/>
        {sec.mont&&<div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Sistema aggancio" options={AGGANCIO} value={d.aggancio} onChange={v=>set("aggancio",v)}/>
        </div>}

        {/* NOTE + FOTO */}
        <div style={{marginTop:16}}>
          <div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase"}}>Note</div>
          <textarea value={d.note||""} onChange={e=>set("note",e.target.value)} placeholder="Dislivello terreno, ostacoli, passaggio cavi, accesso cantiere..." style={{width:"100%",padding:"10px 12px",fontSize:11,fontFamily:FF,border:`1.5px solid ${T.bdr}`,borderRadius:9,background:T.card,minHeight:50,resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginTop:10,display:"flex",gap:6}}>
          {["📷 Foto ingresso","📐 Schizzo","🎤 Vocale"].map(b=><div key={b} style={{flex:1,height:56,borderRadius:10,border:`2px dashed ${T.bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:T.card}}><span style={{fontSize:16}}>{b.split(" ")[0]}</span><span style={{fontSize:8,color:T.sub,fontWeight:600}}>{b.split(" ").slice(1).join(" ")}</span></div>)}
        </div>

        {/* RIEPILOGO */}
        {total>=5&&<div style={{marginTop:20,background:T.card,borderRadius:12,border:`1.5px solid ${T.bdr}`,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:T.topbar,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12}}>📋</span><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>Riepilogo {isRec?"Recinzione":"Cancello"}</span><span style={{fontSize:9,color:"#888",marginLeft:"auto",fontFamily:FM}}>{total}</span></div>
          <div style={{padding:"12px 14px",fontSize:11,lineHeight:2,color:T.text}}>
            {d.tipologia&&<div><span style={{color:T.sub}}>Tipo:</span> <strong>{TIPOLOGIE.find(t=>t.id===d.tipologia)?.nome}</strong></div>}
            {d.materiale&&<div><span style={{color:T.sub}}>Materiale:</span> <strong>{d.materiale}</strong></div>}
            {d.larghezza>0&&<div><span style={{color:T.sub}}>{isRec?"Lunghezza":"Larghezza"}:</span> <strong style={{fontFamily:FM}}>{d.larghezza}</strong> mm · H <strong style={{fontFamily:FM}}>{d.altezza||"—"}</strong></div>}
            {d.tamponamento&&<div><span style={{color:T.sub}}>Tamponamento:</span> <strong>{d.tamponamento}</strong></div>}
            {d.finitura&&<div><span style={{color:T.sub}}>Finitura:</span> <strong>{d.finitura}</strong> {d.colore&&<span style={{color:T.sub}}>· {d.colore}</span>}</div>}
            {d.automazione&&d.automazione!=="Manuale"&&<div><span style={{color:T.sub}}>Automazione:</span> <strong>{d.automazione}</strong></div>}
            {d.autoAcc?.length>0&&<div><span style={{color:T.sub}}>Acc. auto:</span> <strong>{d.autoAcc.join(", ")}</strong></div>}
            {d.pilastri&&<div><span style={{color:T.sub}}>Pilastri:</span> <strong>{d.pilastri}</strong> {d.pilDim&&<span style={{color:T.sub}}>· {d.pilDim}</span>}</div>}
            {d.aggancio&&<div><span style={{color:T.sub}}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
            {d.pendenza>0&&<div><span style={{color:T.red}}>↗ Pendenza: {d.pendenza}°</span></div>}
          </div>
        </div>}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.card,borderTop:`1px solid ${T.bdr}`,padding:"10px 16px",display:"flex",gap:8,maxWidth:480,margin:"0 auto"}}>
        <div style={{flex:1,padding:"12px",borderRadius:10,background:T.bg,textAlign:"center",fontSize:12,fontWeight:700,color:T.sub,cursor:"pointer"}}>← Indietro</div>
        <div style={{flex:2,padding:"12px",borderRadius:10,background:total>=5?T.acc:T.bdr,textAlign:"center",fontSize:12,fontWeight:800,color:total>=5?"#fff":T.sub,cursor:total>=5?"pointer":"default",transition:"all .2s"}}>✓ Salva {isRec?"recinzione":"cancello"} · {total}/{totalMax}</div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}input:focus,select:focus,textarea:focus{border-color:${T.acc}!important;box-shadow:0 0 0 3px ${T.acc}20}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
