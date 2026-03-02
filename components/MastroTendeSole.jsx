import { useState } from "react";

const T = { bg: "#F2F1EC", card: "#FFFFFF", topbar: "#1A1A1C", acc: "#D08008", text: "#1A1A1C", sub: "#8E8E93", bdr: "#E5E4DF", green: "#1A9E73", red: "#DC4444", blue: "#3B7FE0" };
const FF = "'Inter', system-ui, sans-serif";
const FM = "'JetBrains Mono', monospace";

// ═══ CATALOGHI ═══
const TIPOLOGIE = [
  { id: "bracci", nome: "A bracci estensibili", desc: "Classica, bracci articolati" },
  { id: "bracci-cassonetto", nome: "A bracci con cassonetto", desc: "Bracci + cassonetto protettivo" },
  { id: "caduta", nome: "A caduta", desc: "Verticale con guide laterali" },
  { id: "caduta-bracci", nome: "A caduta con braccetti", desc: "Verticale con braccetti a molla" },
  { id: "cappottina", nome: "Cappottina", desc: "Forma curva, vetrine e balconi" },
  { id: "pergotenda", nome: "Pergotenda", desc: "Struttura autoportante, copertura orizzontale" },
  { id: "pergola-bio", nome: "Pergola bioclimatica", desc: "Lamelle orientabili alluminio" },
  { id: "vela", nome: "Vela ombreggiante", desc: "Triangolare/quadrata, tensionata" },
  { id: "zip-ext", nome: "ZIP screen esterno", desc: "Oscurante guidato, antivento" },
];

// Thumbnails CSS per tipologia
const TipoThumb = ({ id, size = 64 }) => {
  const s = size;
  const thumbs = {
    "bracci": <svg width={s} height={s} viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="6" rx="2" fill={T.acc+"44"} stroke={T.acc} strokeWidth="1"/><path d="M12 14 Q18 28 32 30" fill="none" stroke={T.acc} strokeWidth="1.5"/><path d="M52 14 Q46 28 32 30" fill="none" stroke={T.acc} strokeWidth="1.5"/><path d="M8 14 Q32 20 56 14 L56 30 Q32 24 8 30 Z" fill={T.acc+"18"} stroke={T.acc+"44"} strokeWidth="0.5"/></svg>,
    "bracci-cassonetto": <svg width={s} height={s} viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="10" rx="3" fill={T.acc+"33"} stroke={T.acc} strokeWidth="1"/><path d="M10 16 Q16 30 32 32" fill="none" stroke={T.acc} strokeWidth="1.5"/><path d="M54 16 Q48 30 32 32" fill="none" stroke={T.acc} strokeWidth="1.5"/><path d="M6 16 Q32 22 58 16 L58 32 Q32 26 6 32 Z" fill={T.acc+"18"} stroke={T.acc+"44"} strokeWidth="0.5"/></svg>,
    "caduta": <svg width={s} height={s} viewBox="0 0 64 64"><rect x="12" y="6" width="40" height="5" rx="1.5" fill={T.acc+"44"} stroke={T.acc} strokeWidth="1"/><rect x="14" y="11" width="36" height="40" rx="1" fill={T.acc+"12"} stroke={T.acc+"44"} strokeWidth="0.8"/><line x1="14" y1="51" x2="50" y2="51" stroke={T.acc} strokeWidth="2"/></svg>,
    "caduta-bracci": <svg width={s} height={s} viewBox="0 0 64 64"><rect x="12" y="6" width="40" height="5" rx="1.5" fill={T.acc+"44"} stroke={T.acc} strokeWidth="1"/><rect x="14" y="11" width="36" height="32" rx="1" fill={T.acc+"12"} stroke={T.acc+"44"} strokeWidth="0.8"/><line x1="14" y1="43" x2="14" y2="52" stroke={T.acc} strokeWidth="1.5"/><line x1="50" y1="43" x2="50" y2="52" stroke={T.acc} strokeWidth="1.5"/></svg>,
    "cappottina": <svg width={s} height={s} viewBox="0 0 64 64"><path d="M10 36 Q32 4 54 36" fill={T.acc+"18"} stroke={T.acc} strokeWidth="1.5"/><line x1="10" y1="36" x2="10" y2="54" stroke={T.acc} strokeWidth="1.5"/><line x1="54" y1="36" x2="54" y2="54" stroke={T.acc} strokeWidth="1.5"/></svg>,
    "pergotenda": <svg width={s} height={s} viewBox="0 0 64 64"><rect x="8" y="10" width="48" height="3" rx="1" fill={T.acc+"44"} stroke={T.acc} strokeWidth="0.8"/><line x1="10" y1="13" x2="10" y2="54" stroke={T.acc} strokeWidth="2"/><line x1="54" y1="13" x2="54" y2="54" stroke={T.acc} strokeWidth="2"/>{[0,1,2,3].map(i=><rect key={i} x={14+i*10} y="10" width="6" height="3" rx="0.5" fill={T.acc+"33"}/>)}<path d="M10 13 Q32 18 54 13" fill={T.acc+"0c"} stroke={T.acc+"33"} strokeWidth="0.5"/></svg>,
    "pergola-bio": <svg width={s} height={s} viewBox="0 0 64 64"><line x1="10" y1="14" x2="10" y2="54" stroke={T.acc} strokeWidth="2"/><line x1="54" y1="14" x2="54" y2="54" stroke={T.acc} strokeWidth="2"/><rect x="8" y="12" width="48" height="4" rx="1" fill={T.acc+"33"} stroke={T.acc} strokeWidth="0.8"/>{[0,1,2,3,4,5].map(i=><rect key={i} x="12" y={18+i*5} width="40" height="2" rx="0.5" fill={T.acc+"44"} transform={`rotate(${15},32,${19+i*5})`}/>)}</svg>,
    "vela": <svg width={s} height={s} viewBox="0 0 64 64"><path d="M10 14 L54 10 L40 52 Z" fill={T.acc+"15"} stroke={T.acc} strokeWidth="1.5"/><circle cx="10" cy="14" r="2.5" fill={T.acc}/><circle cx="54" cy="10" r="2.5" fill={T.acc}/><circle cx="40" cy="52" r="2.5" fill={T.acc}/></svg>,
    "zip-ext": <svg width={s} height={s} viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="6" rx="2" fill={T.acc+"33"} stroke={T.acc} strokeWidth="1"/><rect x="12" y="12" width="40" height="38" rx="1" fill={T.acc+"0c"} stroke={T.acc+"55"} strokeWidth="0.8"/><rect x="10" y="12" width="3" height="38" rx="0.5" fill={T.acc+"44"/><rect x="51" y="12" width="3" height="38" rx="0.5" fill={T.acc+"44"/><line x1="12" y1="50" x2="52" y2="50" stroke={T.acc} strokeWidth="2"/></svg>,
  };
  return thumbs[id] || thumbs.bracci;
};

const TESSUTI_TIPO = ["Acrilico tinto massa","Poliestere spalmato","PVC microforato","Soltis 92 (screen)","Soltis 86 (blackout)","Dickson Orchestra","Tempotest Parà"];
const TESSUTI_COLORE = ["Bianco","Avorio","Beige","Grigio chiaro","Grigio scuro","Tortora","Sabbia","Bordeaux","Blu navy","Verde bosco","Arancione","Rosso","Rigato classico","Rigato moderno","Fantasia","Da campionario"];
const STRUTTURA_MAT = ["Alluminio verniciato","Alluminio anodizzato","Acciaio zincato verniciato","Legno lamellare"];
const STRUTTURA_COL = ["Bianco RAL 9010","Avorio RAL 1013","Grigio RAL 7035","Antracite RAL 7016","Marrone RAL 8017","Nero RAL 9005","Corten effect","Effetto legno","RAL custom"];
const COMANDO = ["Arganello manuale","Manovella (asta)","Motore tubolare Ø45","Motore tubolare Ø60","Motore radio Somfy","Motore radio Nice","Motore WiFi/App","Motore solare"];
const MONTAGGIO = ["Parete frontale","Parete sotto trave","Soffitto","Tetto (staffe inclinate)","Dentro nicchia","Su cassonetto tapparella"];
const CASSONETTO_TIPO = ["Nessuno (aperto)","Semicassonetto","Cassonetto integrale","Cassonetto a scomparsa"];
const SENSORI = ["Nessuno","Sensore vento","Sensore sole","Sensore vento+sole","Sensore vento+sole+pioggia","Stazione meteo completa"];
const ACCESSORI = ["Telecomando mono","Telecomando multi","Timer programmabile","Centralina domotica","Led integrato barra","Led integrato cassonetto","Volant frontale","Volant con guide"];
const AGGANCIO = ["Frontale a muro","A soffitto diretto","Su staffa regolabile","Dentro nicchia","Su trave legno","Su struttura acciaio"];

const MISURE_RAPIDE_BRACCI = [{l:300,s:200,lb:"300×200"},{l:400,s:250,lb:"400×250"},{l:500,s:300,lb:"500×300"},{l:600,s:350,lb:"600×350"},{l:400,s:200,lb:"400×200"}];
const MISURE_RAPIDE_CADUTA = [{l:100,h:200,lb:"100×200"},{l:150,h:200,lb:"150×200"},{l:200,h:250,lb:"200×250"},{l:250,h:300,lb:"250×300"},{l:300,h:300,lb:"300×300"}];

// ═══ UI ═══
const Chip = ({label,sel,onTap,small,color})=><div onClick={onTap} style={{padding:small?"5px 10px":"7px 13px",borderRadius:9,border:`1.5px solid ${sel?color||T.acc:T.bdr}`,background:sel?(color||T.acc)+"14":T.card,fontSize:small?10:11,fontWeight:sel?700:500,color:sel?(color||T.acc):T.text,cursor:"pointer",transition:"all .12s",fontFamily:FF,userSelect:"none"}}>{label}</div>;
const ChipSel = ({label,options,value,onChange,small,color})=><div style={{marginBottom:12}}><div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{options.map(o=><Chip key={o} label={o} sel={value===o} onTap={()=>onChange(o)} small={small} color={color}/>)}</div></div>;
const ChipMulti = ({label,options,value=[],onChange,small})=><div style={{marginBottom:12}}><div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{options.map(o=><Chip key={o} label={o} sel={value.includes(o)} onTap={()=>onChange(value.includes(o)?value.filter(x=>x!==o):[...value,o])} small={small}/>)}</div></div>;
const Sec = ({icon,title,count,open,onToggle})=><div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0",cursor:"pointer",borderBottom:`1px solid ${T.bdr}`,marginBottom:open?12:0,userSelect:"none"}}><span style={{fontSize:16}}>{icon}</span><span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>{title}</span>{count>0&&<span style={{fontSize:9,fontWeight:700,background:T.acc+"20",color:T.acc,padding:"2px 8px",borderRadius:20}}>{count}</span>}<span style={{fontSize:11,color:T.sub,transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}>▼</span></div>;
const NumInput = ({label,value,onChange,unit="mm"})=><div style={{marginBottom:10}}><div style={{fontSize:10,color:T.sub,marginBottom:3,fontWeight:600}}>{label}</div><div style={{display:"flex",alignItems:"center",gap:5}}><input type="number" inputMode="numeric" value={value||""} onChange={e=>onChange(parseInt(e.target.value)||0)} style={{flex:1,padding:"10px 12px",fontSize:15,fontFamily:FM,fontWeight:600,border:`1.5px solid ${T.bdr}`,borderRadius:9,background:T.card,color:T.text,outline:"none"}}/><span style={{fontSize:10,color:T.sub,background:T.bg,padding:"7px 9px",borderRadius:7,fontWeight:600}}>{unit}</span></div></div>;

// ═══ SVG DRAWING ═══
const TendaDrawing = ({ d }) => {
  const tipo = d.tipologia || "";
  const isBracci = tipo.includes("bracci");
  const isCaduta = tipo.includes("caduta") || tipo.includes("zip");
  const isCappottina = tipo === "cappottina";
  const isPergola = tipo.includes("pergol") || tipo.includes("pergotenda");
  const isVela = tipo === "vela";
  const larg = d.larghezza || "—";
  const sporg = d.sporgenza || "—";
  const alt = d.altezza || "—";
  const hasCass = d.cassonetto && d.cassonetto !== "Nessuno (aperto)";

  return (
    <div style={{background:T.card,borderRadius:12,border:`1.5px solid ${T.bdr}`,padding:"14px 10px 8px",marginBottom:14}}>
      <div style={{fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8,textAlign:"center"}}>
        Vista {isBracci||isPergola?"laterale":"frontale"}
      </div>
      <svg width="100%" viewBox="0 0 240 160" style={{maxHeight:200}}>
        {isBracci && <>
          {/* Muro */}
          <rect x="10" y="10" width="18" height="130" fill="#e8e6e1" stroke="#ccc" strokeWidth="0.8"/>
          {/* Cassonetto */}
          {hasCass && <rect x="28" y="18" width="30" height="16" rx="4" fill={T.acc+"22"} stroke={T.acc} strokeWidth="1"/>}
          {/* Rullo */}
          <rect x="28" y={hasCass?22:20} width="8" height="8" rx="4" fill={T.acc+"44"} stroke={T.acc} strokeWidth="0.8"/>
          {/* Telo */}
          <path d={`M36 ${hasCass?26:24} Q120 20 200 ${hasCass?34:32} L200 44 Q120 38 36 44 Z`} fill={T.acc+"15"} stroke={T.acc+"55"} strokeWidth="0.8"/>
          {/* Bracci */}
          <path d={`M38 38 Q90 60 190 42`} fill="none" stroke={T.acc} strokeWidth="1.5"/>
          <path d={`M38 42 Q90 80 190 46`} fill="none" stroke={T.acc+"88"} strokeWidth="1"/>
          {/* Barra frontale */}
          <rect x="190" y="30" width="6" height="20" rx="2" fill={T.acc+"44"} stroke={T.acc} strokeWidth="0.8"/>
          {/* Quote */}
          <line x1="36" y1="80" x2="196" y2="80" stroke={T.sub} strokeWidth="0.5"/><line x1="36" y1="76" x2="36" y2="84" stroke={T.sub} strokeWidth="0.5"/><line x1="196" y1="76" x2="196" y2="84" stroke={T.sub} strokeWidth="0.5"/>
          <text x="116" y="92" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>Sporg. {sporg}</text>
          {/* Larghezza — sotto, vista prospettica */}
          <text x="116" y="110" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>Larg. {larg}</text>
          <text x="116" y="122" textAnchor="middle" fontSize="8" fill={T.sub}>(vista laterale)</text>
        </>}

        {isCaduta && <>
          {/* Muro */}
          <rect x="30" y="5" width="180" height="10" rx="2" fill="#e8e6e1" stroke="#ccc" strokeWidth="0.8"/>
          {/* Cassonetto */}
          {hasCass && <rect x="40" y="15" width="160" height="14" rx="3" fill={T.acc+"22"} stroke={T.acc} strokeWidth="1"/>}
          {/* Telo */}
          <rect x="45" y={hasCass?29:18} width="150" height="90" rx="1" fill={T.acc+"0c"} stroke={T.acc+"44"} strokeWidth="0.8"/>
          {/* Guide laterali */}
          {tipo.includes("zip") && <><rect x="42" y={hasCass?29:18} width="4" height="92" rx="1" fill={T.acc+"33"}/><rect x="194" y={hasCass?29:18} width="4" height="92" rx="1" fill={T.acc+"33"}/></>}
          {/* Barra basso */}
          <rect x="43" y={hasCass?118:107} width="154" height="4" rx="1.5" fill={T.acc+"55"} stroke={T.acc} strokeWidth="0.8"/>
          {/* Braccetti */}
          {tipo.includes("braccetti") && <><line x1="45" y1={hasCass?119:108} x2="35" y2={hasCass?130:120} stroke={T.acc} strokeWidth="1.5"/><line x1="195" y1={hasCass?119:108} x2="205" y2={hasCass?130:120} stroke={T.acc} strokeWidth="1.5"/></>}
          {/* Quote larghezza */}
          <line x1="45" y1="138" x2="195" y2="138" stroke={T.sub} strokeWidth="0.5"/><line x1="45" y1="134" x2="45" y2="142" stroke={T.sub} strokeWidth="0.5"/><line x1="195" y1="134" x2="195" y2="142" stroke={T.sub} strokeWidth="0.5"/>
          <text x="120" y="150" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
          {/* Quota altezza */}
          <line x1="215" y1={hasCass?29:18} x2="215" y2={hasCass?120:109} stroke={T.sub} strokeWidth="0.5"/><line x1="211" y1={hasCass?29:18} x2="219" y2={hasCass?29:18} stroke={T.sub} strokeWidth="0.5"/><line x1="211" y1={hasCass?120:109} x2="219" y2={hasCass?120:109} stroke={T.sub} strokeWidth="0.5"/>
          <text x="228" y={hasCass?78:67} textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc} transform={`rotate(-90,228,${hasCass?78:67})`}>{alt}</text>
        </>}

        {isCappottina && <>
          <rect x="40" y="5" width="160" height="8" rx="2" fill="#e8e6e1" stroke="#ccc" strokeWidth="0.8"/>
          <path d="M45 13 Q120 -20 195 13 L195 80 Q120 50 45 80 Z" fill={T.acc+"15"} stroke={T.acc} strokeWidth="1.5"/>
          <line x1="45" y1="80" x2="45" y2="130" stroke={T.acc} strokeWidth="1.5"/>
          <line x1="195" y1="80" x2="195" y2="130" stroke={T.acc} strokeWidth="1.5"/>
          <line x1="45" y1="138" x2="195" y2="138" stroke={T.sub} strokeWidth="0.5"/>
          <text x="120" y="150" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
        </>}

        {isPergola && <>
          <line x1="30" y1="25" x2="30" y2="140" stroke={T.acc} strokeWidth="2.5"/>
          <line x1="210" y1="25" x2="210" y2="140" stroke={T.acc} strokeWidth="2.5"/>
          <rect x="28" y="22" width="184" height="6" rx="1.5" fill={T.acc+"33"} stroke={T.acc} strokeWidth="1"/>
          {[0,1,2,3,4,5,6].map(i=><rect key={i} x="34" y={32+i*10} width="172" height="3" rx="0.5" fill={T.acc+"33"} transform={`rotate(${tipo.includes("bio")?12:0},120,${33+i*10})`}/>)}
          <line x1="30" y1="118" x2="210" y2="118" stroke={T.sub} strokeWidth="0.5"/>
          <text x="120" y="130" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
          <text x="120" y="142" textAnchor="middle" fontSize="8" fill={T.sub}>Sporg. {sporg}</text>
        </>}

        {isVela && <>
          <path d="M30 30 L210 20 L150 130 Z" fill={T.acc+"12"} stroke={T.acc} strokeWidth="1.5"/>
          <circle cx="30" cy="30" r="4" fill={T.acc}/>
          <circle cx="210" cy="20" r="4" fill={T.acc}/>
          <circle cx="150" cy="130" r="4" fill={T.acc}/>
          <text x="120" y="150" textAnchor="middle" fontSize="9" fontFamily={FM} fontWeight="700" fill={T.acc}>{larg}</text>
        </>}

        {!tipo && <text x="120" y="80" textAnchor="middle" fontSize="11" fill={T.sub}>Seleziona una tipologia</text>}
      </svg>
    </div>
  );
};

// ═══ MAIN ═══
export default function MastroTendeSole() {
  const [d, setD] = useState({});
  const [sec, setSec] = useState({ tipo:true, mis:true, tess:false, strut:false, cmd:false, mont:false });
  const set = (k,v) => setD(p=>({...p,[k]:v}));
  const tog = (s) => setSec(p=>({...p,[s]:!p[s]}));

  const isBracci = (d.tipologia||"").includes("bracci");
  const isCaduta = (d.tipologia||"").includes("caduta") || (d.tipologia||"").includes("zip");
  const isPergola = (d.tipologia||"").includes("pergol");

  const tipoC = [d.tipologia].filter(Boolean).length;
  const misC = [d.larghezza,d.sporgenza||d.altezza].filter(Boolean).length;
  const tessC = [d.tessutoTipo,d.tessutoColore].filter(Boolean).length;
  const strutC = [d.strutMat,d.strutCol].filter(Boolean).length;
  const cmdC = [d.comando,d.sensore].filter(Boolean).length;
  const montC = [d.montaggio,d.aggancio,d.cassonetto].filter(Boolean).length;
  const total = tipoC+misC+tessC+strutC+cmdC+montC;
  const totalMax = 16;

  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:T.bg,fontFamily:FF}}>
      {/* TOPBAR */}
      <div style={{background:T.topbar,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:99}}>
        <div style={{width:30,height:30,borderRadius:7,background:"#ffffff15",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,color:"#fff"}}>←</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800,color:"#fff",letterSpacing:-0.3}}>Tende da Sole — Presa Misure</div>
          <div style={{fontSize:10,color:"#888"}}>Vano TS1 · Terrazzo</div>
        </div>
        <div style={{background:total>=totalMax*0.5?T.green+"30":T.acc+"30",color:total>=totalMax*0.5?T.green:T.acc,padding:"3px 10px",borderRadius:16,fontSize:11,fontWeight:800,fontFamily:FM}}>{total}/{totalMax}</div>
      </div>
      <div style={{height:3,background:T.bdr}}><div style={{height:3,background:total>=totalMax*0.5?T.green:T.acc,width:`${(total/totalMax)*100}%`,transition:"width .3s",borderRadius:2}}/></div>

      <div style={{padding:"8px 16px 100px"}}>

        {/* DISEGNO */}
        {d.tipologia && <TendaDrawing d={d} />}

        {/* ═══ TIPOLOGIA ═══ */}
        <Sec icon="☀️" title="Tipologia tenda" count={tipoC} open={sec.tipo} onToggle={()=>tog("tipo")} />
        {sec.tipo && <div style={{animation:"fadeIn .2s"}}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {TIPOLOGIE.map(t=>(
              <div key={t.id} onClick={()=>set("tipologia",t.id===d.tipologia?null:t.id)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,
                border:`1.5px solid ${d.tipologia===t.id?T.acc:T.bdr}`,
                background:d.tipologia===t.id?T.acc+"0a":T.card,cursor:"pointer",transition:"all .12s",
              }}>
                <div style={{width:52,height:52,borderRadius:8,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <TipoThumb id={t.id} size={48}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:d.tipologia===t.id?T.acc:T.text}}>{t.nome}</div>
                  <div style={{fontSize:9,color:T.sub,marginTop:1}}>{t.desc}</div>
                </div>
                {d.tipologia===t.id&&<div style={{width:18,height:18,borderRadius:9,background:T.acc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:800}}>✓</div>}
              </div>
            ))}
          </div>
        </div>}

        {/* ═══ MISURE ═══ */}
        <Sec icon="📐" title="Misure" count={misC} open={sec.mis} onToggle={()=>tog("mis")} />
        {sec.mis && <div style={{animation:"fadeIn .2s"}}>
          {isBracci && <>
            <div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase"}}>Misura rapida</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
              {MISURE_RAPIDE_BRACCI.map(ms=><Chip key={ms.lb} label={ms.lb} sel={d.larghezza===ms.l&&d.sporgenza===ms.s} onTap={()=>{set("larghezza",ms.l);set("sporgenza",ms.s)}} small/>)}
            </div>
          </>}
          {isCaduta && <>
            <div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase"}}>Misura rapida</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
              {MISURE_RAPIDE_CADUTA.map(ms=><Chip key={ms.lb} label={ms.lb} sel={d.larghezza===ms.l&&d.altezza===ms.h} onTap={()=>{set("larghezza",ms.l);set("altezza",ms.h)}} small/>)}
            </div>
          </>}
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}><NumInput label="Larghezza" value={d.larghezza} onChange={v=>set("larghezza",v)}/></div>
            <div style={{flex:1}}><NumInput label={isBracci||isPergola?"Sporgenza/Proiezione":"Altezza caduta"} value={isBracci||isPergola?d.sporgenza:d.altezza} onChange={v=>set(isBracci||isPergola?"sporgenza":"altezza",v)}/></div>
          </div>
          <NumInput label="Altezza montaggio da terra" value={d.hMontaggio} onChange={v=>set("hMontaggio",v)}/>
          {d.larghezza>600&&isBracci&&<div style={{fontSize:10,color:T.red,background:T.red+"12",border:`1px solid ${T.red}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>⚠ Larghezza {">"} 600cm: valutare giunta telo o doppia tenda</div>}
        </div>}

        {/* ═══ TESSUTO ═══ */}
        <Sec icon="🧵" title="Tessuto e telo" count={tessC} open={sec.tess} onToggle={()=>tog("tess")} />
        {sec.tess && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo tessuto" options={TESSUTI_TIPO} value={d.tessutoTipo} onChange={v=>set("tessutoTipo",v)}/>
          <ChipSel label="Colore/Pattern" options={TESSUTI_COLORE} value={d.tessutoColore} onChange={v=>set("tessutoColore",v)} small/>
          {(d.tipologia||"").includes("caduta")&&<ChipSel label="Trasparenza" options={["Filtrante (vista esterna)","Oscurante","Microforato 5%","Microforato 10%","Blackout totale"]} value={d.trasparenza} onChange={v=>set("trasparenza",v)} small/>}
          <ChipSel label="Volant" options={["Nessuno","Dritto 20cm","Dritto 30cm","Ondulato","Con guide laterali"]} value={d.volant} onChange={v=>set("volant",v)} small/>
        </div>}

        {/* ═══ STRUTTURA ═══ */}
        <Sec icon="🔧" title="Struttura e finitura" count={strutC} open={sec.strut} onToggle={()=>tog("strut")} />
        {sec.strut && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Materiale struttura" options={STRUTTURA_MAT} value={d.strutMat} onChange={v=>set("strutMat",v)}/>
          <ChipSel label="Colore struttura" options={STRUTTURA_COL} value={d.strutCol} onChange={v=>set("strutCol",v)} small/>
          <ChipSel label="Cassonetto" options={CASSONETTO_TIPO} value={d.cassonetto} onChange={v=>set("cassonetto",v)}/>
          {d.cassonetto==="Cassonetto a scomparsa"&&<div style={{fontSize:10,color:T.green,background:T.green+"12",border:`1px solid ${T.green}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>✓ Cassonetto a scomparsa: telo completamente protetto, estetica minimale</div>}
        </div>}

        {/* ═══ COMANDO ═══ */}
        <Sec icon="⚡" title="Comando e automazione" count={cmdC} open={sec.cmd} onToggle={()=>tog("cmd")} />
        {sec.cmd && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Tipo comando" options={COMANDO} value={d.comando} onChange={v=>set("comando",v)}/>
          <ChipSel label="Sensori" options={SENSORI} value={d.sensore} onChange={v=>set("sensore",v)}/>
          <ChipMulti label="Accessori" options={ACCESSORI} value={d.accessori} onChange={v=>set("accessori",v)} small/>
          {(d.comando||"").includes("WiFi")&&<div style={{fontSize:10,color:T.blue,background:T.blue+"12",border:`1px solid ${T.blue}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>📡 WiFi: compatibile Alexa, Google Home, Apple HomeKit tramite gateway</div>}
          {(d.comando||"").includes("solare")&&<div style={{fontSize:10,color:T.green,background:T.green+"12",border:`1px solid ${T.green}30`,padding:"8px 10px",borderRadius:9,marginBottom:12}}>☀️ Motore solare: nessun cablaggio elettrico necessario</div>}
        </div>}

        {/* ═══ MONTAGGIO ═══ */}
        <Sec icon="🔨" title="Montaggio e aggancio" count={montC} open={sec.mont} onToggle={()=>tog("mont")} />
        {sec.mont && <div style={{animation:"fadeIn .2s"}}>
          <ChipSel label="Posizione montaggio" options={MONTAGGIO} value={d.montaggio} onChange={v=>set("montaggio",v)}/>
          <ChipSel label="Sistema aggancio" options={AGGANCIO} value={d.aggancio} onChange={v=>set("aggancio",v)}/>
          {d.montaggio==="Tetto (staffe inclinate)"&&<NumInput label="Inclinazione tetto" value={d.inclinazione} onChange={v=>set("inclinazione",v)} unit="°"/>}
        </div>}

        {/* ═══ NOTE + FOTO ═══ */}
        <div style={{marginTop:16}}>
          <div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:5,textTransform:"uppercase"}}>Note</div>
          <textarea value={d.note||""} onChange={e=>set("note",e.target.value)} placeholder="Esposizione solare, ostacoli sopra, cablaggio esistente, tipo facciata..." style={{width:"100%",padding:"10px 12px",fontSize:11,fontFamily:FF,border:`1.5px solid ${T.bdr}`,borderRadius:9,background:T.card,minHeight:50,resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginTop:10,display:"flex",gap:6}}>
          {["📷 Foto facciata","📐 Schizzo","🎤 Vocale"].map(b=><div key={b} style={{flex:1,height:56,borderRadius:10,border:`2px dashed ${T.bdr}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:T.card}}><span style={{fontSize:16}}>{b.split(" ")[0]}</span><span style={{fontSize:8,color:T.sub,fontWeight:600}}>{b.split(" ").slice(1).join(" ")}</span></div>)}
        </div>

        {/* ═══ RIEPILOGO ═══ */}
        {total>=5&&<div style={{marginTop:20,background:T.card,borderRadius:12,border:`1.5px solid ${T.bdr}`,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:T.topbar,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12}}>📋</span><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>Riepilogo Tenda da Sole</span>
            <span style={{fontSize:9,color:"#888",marginLeft:"auto",fontFamily:FM}}>{total} campi</span>
          </div>
          <div style={{padding:"12px 14px",fontSize:11,lineHeight:2,color:T.text}}>
            {d.tipologia&&<div><span style={{color:T.sub}}>Tipologia:</span> <strong>{TIPOLOGIE.find(t=>t.id===d.tipologia)?.nome}</strong></div>}
            {d.larghezza>0&&<div><span style={{color:T.sub}}>Larghezza:</span> <strong style={{fontFamily:FM}}>{d.larghezza}</strong> mm {d.sporgenza>0&&<span style={{color:T.sub}}>· Sporg. <strong style={{fontFamily:FM}}>{d.sporgenza}</strong></span>}{d.altezza>0&&<span style={{color:T.sub}}>· Alt. <strong style={{fontFamily:FM}}>{d.altezza}</strong></span>}</div>}
            {d.hMontaggio>0&&<div><span style={{color:T.sub}}>H montaggio:</span> <strong style={{fontFamily:FM}}>{d.hMontaggio}</strong> mm</div>}
            {d.tessutoTipo&&<div><span style={{color:T.sub}}>Tessuto:</span> <strong>{d.tessutoTipo}</strong> {d.tessutoColore&&<span style={{color:T.sub}}>· {d.tessutoColore}</span>}</div>}
            {d.strutMat&&<div><span style={{color:T.sub}}>Struttura:</span> <strong>{d.strutMat}</strong> {d.strutCol&&<span style={{color:T.sub}}>· {d.strutCol}</span>}</div>}
            {d.cassonetto&&d.cassonetto!=="Nessuno (aperto)"&&<div><span style={{color:T.sub}}>Cassonetto:</span> <strong>{d.cassonetto}</strong></div>}
            {d.comando&&<div><span style={{color:T.sub}}>Comando:</span> <strong>{d.comando}</strong></div>}
            {d.sensore&&d.sensore!=="Nessuno"&&<div><span style={{color:T.sub}}>Sensore:</span> <strong>{d.sensore}</strong></div>}
            {d.accessori?.length>0&&<div><span style={{color:T.sub}}>Accessori:</span> <strong>{d.accessori.join(", ")}</strong></div>}
            {d.montaggio&&<div><span style={{color:T.sub}}>Montaggio:</span> <strong>{d.montaggio}</strong></div>}
            {d.aggancio&&<div><span style={{color:T.sub}}>Aggancio:</span> <strong>{d.aggancio}</strong></div>}
          </div>
        </div>}
      </div>

      {/* BOTTOM */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.card,borderTop:`1px solid ${T.bdr}`,padding:"10px 16px",display:"flex",gap:8,maxWidth:480,margin:"0 auto"}}>
        <div style={{flex:1,padding:"12px",borderRadius:10,background:T.bg,textAlign:"center",fontSize:12,fontWeight:700,color:T.sub,cursor:"pointer"}}>← Indietro</div>
        <div style={{flex:2,padding:"12px",borderRadius:10,background:total>=5?T.acc:T.bdr,textAlign:"center",fontSize:12,fontWeight:800,color:total>=5?"#fff":T.sub,cursor:total>=5?"pointer":"default",transition:"all .2s"}}>✓ Salva tenda · {total}/{totalMax}</div>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}input:focus,select:focus,textarea:focus{border-color:${T.acc}!important;box-shadow:0 0 0 3px ${T.acc}20}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
