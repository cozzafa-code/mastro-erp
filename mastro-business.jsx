import { useState } from "react";

var C = { bg:"#F8F8FA",w:"#FFF",dk:"#1A1C1E",g:"#8E8E93",lg:"#F2F2F7",ln:"#E5E5EA",bl:"#007AFF",rd:"#FF3B30",or:"#FF9500",gn:"#34C759",pu:"#AF52DE",tl:"#5AC8FA",pk:"#FF2D55" };

// ========== BUSINESS CONFIG (this changes per business type) ==========
// The system auto-configures based on business category
var TEMPLATES = {
  dentista: {
    tipiAppuntamento: ["Controllo","Pulizia","Otturazione","Devitalizzazione","Impianto","Sbiancamento","Ortodonzia","Estrazione","Emergenza"],
    scadenzeAuto: [
      { nome:"Controllo semestrale", ogni:"6 mesi", icon:"🦷" },
      { nome:"Pulizia professionale", ogni:"6 mesi", icon:"🪥" },
      { nome:"Radiografia panoramica", ogni:"24 mesi", icon:"🩻" },
    ],
    docTipi: ["Preventivo","Fattura","Piano trattamento","Radiografia","Consenso informato","Ricetta"],
    campiCliente: ["Nome","Cognome","Tel","Email","Allergie","Note mediche"],
  },
  meccanico: {
    tipiAppuntamento: ["Tagliando","Revisione","Riparazione","Gomme","Diagnosi","Carrozzeria"],
    scadenzeAuto: [
      { nome:"Revisione auto", ogni:"24 mesi", icon:"📋" },
      { nome:"Tagliando", ogni:"12 mesi / 15.000km", icon:"🔧" },
      { nome:"Cambio gomme", ogni:"6 mesi", icon:"🛞" },
    ],
    docTipi: ["Preventivo","Fattura","Report diagnosi","Scheda revisione","Garanzia ricambio"],
    campiCliente: ["Nome","Cognome","Tel","Auto (marca/modello)","Targa","Km attuali"],
  },
  idraulico: {
    tipiAppuntamento: ["Manutenzione caldaia","Riparazione","Installazione","Sopralluogo","Emergenza"],
    scadenzeAuto: [
      { nome:"Manutenzione caldaia", ogni:"12 mesi", icon:"🔥" },
      { nome:"Controllo fumi", ogni:"24 mesi", icon:"💨" },
    ],
    docTipi: ["Preventivo","Fattura","Libretto impianto","Certificazione fumi","DiCo","Garanzia"],
    campiCliente: ["Nome","Cognome","Tel","Indirizzo","Tipo caldaia","Note impianto"],
  },
  serramenti: {
    tipiAppuntamento: ["Sopralluogo","Misure","Posa","Assistenza","Consulenza"],
    scadenzeAuto: [
      { nome:"Manutenzione guarnizioni", ogni:"6 mesi", icon:"🧽" },
      { nome:"Lubrificazione ferramenta", ogni:"12 mesi", icon:"🔧" },
      { nome:"Controllo scarico acqua", ogni:"12 mesi", icon:"💧" },
    ],
    docTipi: ["Preventivo","Contratto","Fattura","Conferma ordine","Certificazione CE","Pratica ENEA","Garanzia"],
    campiCliente: ["Nome","Cognome","Tel","Email","Indirizzo","Note cantiere"],
  },
  elettricista: {
    tipiAppuntamento: ["Sopralluogo","Installazione","Riparazione","Emergenza","Collaudo"],
    scadenzeAuto: [
      { nome:"Verifica impianto", ogni:"60 mesi", icon:"⚡" },
    ],
    docTipi: ["Preventivo","Fattura","DiCo","Schema impianto","Certificato conformità"],
    campiCliente: ["Nome","Cognome","Tel","Indirizzo","Tipo impianto"],
  },
  architetto: {
    tipiAppuntamento: ["Consulenza","Sopralluogo","Presentazione progetto","Direzione lavori"],
    scadenzeAuto: [],
    docTipi: ["Progetto","Computo metrico","CILA/SCIA","Fattura","Rendering","Capitolato"],
    campiCliente: ["Nome","Cognome","Tel","Email","Indirizzo intervento","Budget indicativo"],
  },
};

// Current business = dentist (demo)
var BIZ = {
  nome: "Studio Dr. Mazza",
  logo: "DM",
  colore: "#7C3AED",
  cat: "dentista",
  piano: "Pro · 200 clienti",
};
var TPL = TEMPLATES[BIZ.cat];

// ========== CLIENTI ==========
var CLIENTI = [
  { id:1, nome:"Anna Bianchi", tel:"333 1234567", email:"anna.b@email.it", extra:"Allergia lattice", ultimo:"Set 2025 · Pulizia", prossimo:"5 Mar · Controllo", notaProssimo:"Controllo semestrale", attivo:true },
  { id:2, nome:"Marco Rossi", tel:"339 7654321", email:"m.rossi@email.it", extra:"Nessuna allergia", ultimo:"Gen 2026 · Otturazione", prossimo:"Lug 2026 · Controllo", notaProssimo:"", attivo:true },
  { id:3, nome:"Laura Greco", tel:"328 1112233", email:"l.greco@email.it", extra:"Ansia trattamenti", ultimo:"Dic 2025 · Sbiancamento", prossimo:"Giu 2026 · Pulizia", notaProssimo:"", attivo:true },
  { id:4, nome:"Paolo Ferraro", tel:"347 9988776", email:"p.ferraro@email.it", extra:"Diabete tipo 2", ultimo:"Nov 2025 · Devitalizzazione", prossimo:"5 Mar · Controllo", notaProssimo:"Stesso giorno di Bianchi", attivo:true },
  { id:5, nome:"Giulia Serra", tel:"320 5544332", email:"g.serra@email.it", extra:"", ultimo:"Ago 2025 · Controllo", prossimo:"Feb 2026 · Controllo", notaProssimo:"SCADUTO - richiamare", attivo:false },
];

// ========== AGENDA ==========
var AGENDA = [
  { id:1, data:"Mer 5 Mar", ora:"09:00", durata:"30 min", cliente:"Anna Bianchi", tipo:"Controllo", nota:"Controllo semestrale", stato:"confermato" },
  { id:2, data:"Mer 5 Mar", ora:"09:45", cliente:"Paolo Ferraro", tipo:"Controllo", durata:"30 min", nota:"Controllo post-devitalizzazione", stato:"confermato" },
  { id:3, data:"Mer 5 Mar", ora:"10:30", cliente:"—", tipo:"", durata:"", nota:"", stato:"libero" },
  { id:4, data:"Mer 5 Mar", ora:"11:15", cliente:"Marco Rossi", tipo:"Pulizia", durata:"45 min", nota:"", stato:"da confermare" },
  { id:5, data:"Gio 6 Mar", ora:"09:00", cliente:"Nuovo paziente", tipo:"Prima visita", durata:"60 min", nota:"Referral da Anna Bianchi", stato:"confermato" },
  { id:6, data:"Gio 6 Mar", ora:"10:15", cliente:"Laura Greco", tipo:"Controllo ortodonzia", durata:"30 min", nota:"", stato:"confermato" },
];

// ========== SCADENZE CLIENTI ==========
var SCADENZE_CLIENTI = [
  { cliente:"Giulia Serra", scadenza:"Controllo semestrale", scade:"Feb 2026", stato:"scaduto", gg:-15 },
  { cliente:"Anna Bianchi", scadenza:"Controllo semestrale", scade:"5 Mar", stato:"prossimo", gg:14 },
  { cliente:"Paolo Ferraro", scadenza:"Controllo post-trattamento", scade:"5 Mar", stato:"prossimo", gg:14 },
  { cliente:"Marco Rossi", scadenza:"Pulizia professionale", scade:"Lug 2026", stato:"ok", gg:130 },
  { cliente:"Laura Greco", scadenza:"Pulizia professionale", scade:"Giu 2026", stato:"ok", gg:100 },
];

// ========== COMPONENTS ==========
function BizHeader({onNav,activeTab}){
  return(
    <div style={{background:C.w,borderBottom:"1px solid "+C.ln}}>
      <div style={{padding:"12px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:10,background:BIZ.colore,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{BIZ.logo}</span></div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.dk}}>{BIZ.nome}</div>
              <div style={{fontSize:10,color:C.g}}>{BIZ.piano}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:9,color:C.g}}>powered by</span>
            <div style={{width:14,height:14,borderRadius:3,background:C.dk,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>M</span></div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",overflowX:"auto"}}>
        {["dash","ai","agenda","clienti","scadenze","invio"].map(function(t){
          var labels={dash:"📊 Home",ai:"🤖 Agente",agenda:"📅 Agenda",clienti:"👥 Clienti",scadenze:"⏰ Scadenze",invio:"📤 Invia"};
          var active=activeTab===t;
          return(<div key={t} onClick={function(){onNav(t);}} style={{padding:"10px 14px",cursor:"pointer",borderBottom:active?"2px solid "+BIZ.colore:"2px solid transparent",fontSize:12,fontWeight:active?700:400,color:active?BIZ.colore:C.g,whiteSpace:"nowrap",flexShrink:0}}>{labels[t]}</div>);
        })}
      </div>
    </div>
  );
}

// ========== DASHBOARD ==========
function Dashboard(){
  var scaduti=SCADENZE_CLIENTI.filter(function(s){return s.stato==="scaduto";}).length;
  var prossimi=SCADENZE_CLIENTI.filter(function(s){return s.stato==="prossimo";}).length;
  var oggi=AGENDA.filter(function(a){return a.data==="Mer 5 Mar"&&a.stato!=="libero";}).length;
  var daConf=AGENDA.filter(function(a){return a.stato==="da confermare";}).length;

  return(<div style={{padding:"12px 16px 20px"}}>
    {/* Quick stats */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
      <div style={{background:C.w,borderRadius:14,padding:"14px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <div style={{fontSize:28,fontWeight:800,color:C.dk}}>{CLIENTI.length}</div>
        <div style={{fontSize:11,color:C.g}}>Clienti attivi</div>
      </div>
      <div style={{background:C.w,borderRadius:14,padding:"14px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <div style={{fontSize:28,fontWeight:800,color:BIZ.colore}}>{oggi}</div>
        <div style={{fontSize:11,color:C.g}}>Appuntamenti oggi</div>
      </div>
      <div style={{background:scaduti>0?C.rd+"08":C.w,borderRadius:14,padding:"14px",boxShadow:"0 1px 4px rgba(0,0,0,.04)",border:scaduti>0?"1px solid "+C.rd+"20":"none"}}>
        <div style={{fontSize:28,fontWeight:800,color:scaduti>0?C.rd:C.dk}}>{scaduti}</div>
        <div style={{fontSize:11,color:scaduti>0?C.rd:C.g}}>Scadenze passate</div>
      </div>
      <div style={{background:daConf>0?C.or+"08":C.w,borderRadius:14,padding:"14px",boxShadow:"0 1px 4px rgba(0,0,0,.04)",border:daConf>0?"1px solid "+C.or+"20":"none"}}>
        <div style={{fontSize:28,fontWeight:800,color:daConf>0?C.or:C.dk}}>{daConf}</div>
        <div style={{fontSize:11,color:daConf>0?C.or:C.g}}>Da confermare</div>
      </div>
    </div>

    {/* Alerts */}
    {scaduti>0&&<div style={{background:C.rd+"08",border:"1px solid "+C.rd+"20",borderRadius:14,padding:"14px",marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:700,color:C.rd}}>{"⚠️ "+scaduti+" scadenz"+(scaduti===1?"a":"e")+" passata!"}</div>
      <div style={{fontSize:12,color:C.dk,marginTop:4}}>{"Giulia Serra — Controllo scaduto da 15gg"}</div>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button style={{padding:"8px 16px",borderRadius:10,border:"none",background:C.rd,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>{"📩 Invia promemoria"}</button>
        <button style={{padding:"8px 16px",borderRadius:10,border:"1px solid "+C.ln,background:C.w,color:C.dk,fontSize:12,fontWeight:600,cursor:"pointer"}}>{"📞 Chiama"}</button>
      </div>
    </div>}

    {/* Prossimi oggi */}
    <div style={{fontSize:14,fontWeight:700,color:C.dk,marginBottom:8}}>{"📅 Oggi · Mer 5 Mar"}</div>
    {AGENDA.filter(function(a){return a.data==="Mer 5 Mar";}).map(function(a){
      var sc=a.stato==="confermato"?C.gn:a.stato==="da confermare"?C.or:C.lg;
      return(<div key={a.id} style={{background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:6,display:"flex",gap:12,alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,.03)",borderLeft:a.stato==="libero"?"3px solid "+C.ln:"3px solid "+sc}}>
        <div style={{width:50,textAlign:"center",flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:800,color:C.dk}}>{a.ora}</div>
          {a.durata&&<div style={{fontSize:9,color:C.g}}>{a.durata}</div>}
        </div>
        <div style={{flex:1}}>
          {a.stato==="libero"?<div style={{fontSize:14,color:C.g,fontStyle:"italic"}}>Slot libero</div>:
          <div><div style={{fontSize:14,fontWeight:600,color:C.dk}}>{a.cliente}</div><div style={{fontSize:12,color:BIZ.colore,marginTop:2}}>{a.tipo}</div>{a.nota&&<div style={{fontSize:11,color:C.g,marginTop:2}}>{a.nota}</div>}</div>}
        </div>
        {a.stato==="da confermare"&&<span style={{fontSize:9,fontWeight:700,color:C.or,background:C.or+"12",padding:"3px 8px",borderRadius:6}}>da confermare</span>}
        {a.stato==="confermato"&&<span style={{fontSize:9,fontWeight:700,color:C.gn,background:C.gn+"12",padding:"3px 8px",borderRadius:6}}>{"✓ ok"}</span>}
      </div>);
    })}

    {/* Quick actions */}
    <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <div style={{background:BIZ.colore,borderRadius:14,padding:"14px",cursor:"pointer",color:"#fff"}}>
        <span style={{fontSize:22}}>{"➕"}</span>
        <div style={{fontSize:13,fontWeight:700,marginTop:6}}>Nuovo appuntamento</div>
      </div>
      <div style={{background:C.w,borderRadius:14,padding:"14px",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <span style={{fontSize:22}}>{"📩"}</span>
        <div style={{fontSize:13,fontWeight:700,color:C.dk,marginTop:6}}>Invia a tutti</div>
      </div>
    </div>
  </div>);
}

// ========== AGENDA ==========
function AgendaScreen(){
  var _giorno=useState("Mer 5 Mar");var giorno=_giorno[0];var setGiorno=_giorno[1];
  var giorni=["Mer 5 Mar","Gio 6 Mar","Ven 7 Mar"];
  var slots=AGENDA.filter(function(a){return a.data===giorno;});

  return(<div style={{padding:"12px 16px 20px"}}>
    {/* Day picker */}
    <div style={{display:"flex",gap:6,marginBottom:12}}>
      {giorni.map(function(g){var active=giorno===g;var n=AGENDA.filter(function(a){return a.data===g&&a.stato!=="libero";}).length;return(<div key={g} onClick={function(){setGiorno(g);}} style={{flex:1,padding:"10px 8px",borderRadius:12,cursor:"pointer",background:active?BIZ.colore:C.w,textAlign:"center",boxShadow:active?"none":"0 1px 3px rgba(0,0,0,.03)"}}>
        <div style={{fontSize:12,fontWeight:700,color:active?"#fff":C.dk}}>{g.split(" ")[0]+" "+g.split(" ")[1]}</div>
        <div style={{fontSize:10,color:active?"rgba(255,255,255,.7)":C.g,marginTop:2}}>{n+" appunt."}</div>
      </div>);})}
    </div>

    {/* Time slots */}
    {slots.map(function(a){
      var sc=a.stato==="confermato"?C.gn:a.stato==="da confermare"?C.or:C.lg;
      return(<div key={a.id} style={{background:C.w,borderRadius:14,padding:"14px 16px",marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,.04)",borderLeft:"4px solid "+sc}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div><div style={{fontSize:18,fontWeight:800,color:C.dk}}>{a.ora}</div>{a.durata&&<div style={{fontSize:10,color:C.g}}>{a.durata}</div>}</div>
          </div>
          {a.stato!=="libero"&&<span style={{fontSize:9,fontWeight:700,color:sc==="undefined"?C.g:sc,background:sc+"12",padding:"3px 8px",borderRadius:6}}>{a.stato}</span>}
        </div>
        {a.stato==="libero"?
          <div style={{marginTop:8,textAlign:"center",padding:"12px",border:"2px dashed "+C.ln,borderRadius:10,cursor:"pointer"}}><span style={{fontSize:14,color:C.g}}>{"+ Aggiungi appuntamento"}</span></div>
        :
          <div style={{marginTop:8}}>
            <div style={{fontSize:15,fontWeight:700,color:C.dk}}>{a.cliente}</div>
            <div style={{fontSize:13,color:BIZ.colore,marginTop:2}}>{a.tipo}</div>
            {a.nota&&<div style={{fontSize:12,color:C.g,marginTop:2}}>{a.nota}</div>}
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <button style={{padding:"6px 14px",borderRadius:8,border:"none",background:C.gn+"12",color:C.gn,fontSize:11,fontWeight:600,cursor:"pointer"}}>{"✓ Completato"}</button>
              <button style={{padding:"6px 14px",borderRadius:8,border:"none",background:C.bl+"12",color:C.bl,fontSize:11,fontWeight:600,cursor:"pointer"}}>{"💬 Messaggio"}</button>
              <button style={{padding:"6px 14px",borderRadius:8,border:"none",background:C.rd+"12",color:C.rd,fontSize:11,fontWeight:600,cursor:"pointer"}}>{"✕ Annulla"}</button>
            </div>
          </div>
        }
      </div>);
    })}

    {slots.length===0&&<div style={{textAlign:"center",padding:"30px"}}><span style={{fontSize:40}}>{"📅"}</span><div style={{fontSize:14,color:C.g,marginTop:8}}>Nessun appuntamento</div></div>}

    <button style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:BIZ.colore,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:12}}>{"+ Nuovo appuntamento"}</button>
  </div>);
}

// ========== CLIENTI ==========
function ClientiScreen(){
  var _search=useState("");var search=_search[0];var setSearch=_search[1];
  var _sel=useState(null);var sel=_sel[0];var setSel=_sel[1];
  var shown=CLIENTI.filter(function(c){return !search||c.nome.toLowerCase().indexOf(search.toLowerCase())>=0;});

  if(sel){
    return(<div style={{padding:"12px 16px 20px"}}>
      <span onClick={function(){setSel(null);}} style={{fontSize:15,color:C.bl,cursor:"pointer"}}>{"< Lista clienti"}</span>
      <div style={{background:C.w,borderRadius:16,padding:"16px",marginTop:12,boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:52,height:52,borderRadius:26,background:BIZ.colore+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:BIZ.colore}}>{sel.nome.charAt(0)}</div>
          <div><div style={{fontSize:18,fontWeight:800,color:C.dk}}>{sel.nome}</div><div style={{fontSize:12,color:C.g}}>{sel.tel+" · "+sel.email}</div></div>
        </div>
        {sel.extra&&<div style={{background:C.or+"08",borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,color:C.or,fontWeight:600}}>{"⚕️ "+sel.extra}</div>}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <button style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:BIZ.colore,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>{"📅 Appuntamento"}</button>
          <button style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:C.gn+"12",color:C.gn,fontSize:12,fontWeight:600,cursor:"pointer"}}>{"💬 Messaggio"}</button>
          <button style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:C.bl+"12",color:C.bl,fontSize:12,fontWeight:600,cursor:"pointer"}}>{"📄 Documento"}</button>
        </div>
        <div style={{borderTop:"1px solid "+C.ln,paddingTop:10}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:13}}><span style={{color:C.g}}>Ultimo</span><span style={{color:C.dk,fontWeight:600}}>{sel.ultimo}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:13}}><span style={{color:C.g}}>Prossimo</span><span style={{color:BIZ.colore,fontWeight:600}}>{sel.prossimo}</span></div>
          {sel.notaProssimo&&<div style={{fontSize:11,color:sel.notaProssimo.indexOf("SCADUTO")>=0?C.rd:C.g,marginTop:4}}>{sel.notaProssimo}</div>}
        </div>
      </div>
    </div>);
  }

  return(<div style={{padding:"12px 16px 20px"}}>
    <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Cerca cliente..." style={{width:"100%",border:"none",outline:"none",fontSize:14,padding:"12px 14px",background:C.w,borderRadius:12,fontFamily:"inherit",boxShadow:"0 1px 3px rgba(0,0,0,.03)",marginBottom:10}} />

    {shown.map(function(c){
      var isScaduto=c.notaProssimo&&c.notaProssimo.indexOf("SCADUTO")>=0;
      return(<div key={c.id} onClick={function(){setSel(c);}} style={{background:C.w,borderRadius:14,padding:"14px",marginBottom:6,display:"flex",gap:12,alignItems:"center",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.03)",borderLeft:isScaduto?"3px solid "+C.rd:"none"}}>
        <div style={{width:42,height:42,borderRadius:21,background:BIZ.colore+"12",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:600,color:BIZ.colore}}>{c.nome.charAt(0)}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:C.dk}}>{c.nome}</div>
          <div style={{fontSize:11,color:C.g,marginTop:2}}>{"Prossimo: "+c.prossimo}</div>
          {isScaduto&&<span style={{fontSize:9,fontWeight:700,color:C.rd,background:C.rd+"12",padding:"1px 6px",borderRadius:4}}>SCADUTO</span>}
        </div>
        <span style={{color:C.ln}}>{"›"}</span>
      </div>);
    })}

    <button style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:BIZ.colore,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:10}}>{"+ Nuovo cliente"}</button>
  </div>);
}

// ========== SCADENZE ==========
function ScadenzeScreen(){
  var scaduti=SCADENZE_CLIENTI.filter(function(s){return s.stato==="scaduto";});
  var prossimi=SCADENZE_CLIENTI.filter(function(s){return s.stato==="prossimo";});
  var ok=SCADENZE_CLIENTI.filter(function(s){return s.stato==="ok";});

  return(<div style={{padding:"12px 16px 20px"}}>
    {/* Auto-reminders config */}
    <div style={{background:C.w,borderRadius:14,padding:"14px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:14,fontWeight:700,color:C.dk}}>{"⚡ Promemoria automatici"}</div>
        <div style={{width:44,height:24,borderRadius:12,background:C.gn,padding:2,cursor:"pointer"}}><div style={{width:20,height:20,borderRadius:10,background:"#fff",marginLeft:20}} /></div>
      </div>
      <div style={{fontSize:12,color:C.g,marginBottom:10}}>MASTRO invia automaticamente promemoria ai clienti quando una scadenza si avvicina</div>
      {TPL.scadenzeAuto.map(function(s,i){return(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+C.ln}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{s.icon}</span><div><div style={{fontSize:13,fontWeight:600,color:C.dk}}>{s.nome}</div><div style={{fontSize:10,color:C.g}}>{"Ogni "+s.ogni}</div></div></div>
        <div style={{width:36,height:20,borderRadius:10,background:C.gn,padding:2,cursor:"pointer"}}><div style={{width:16,height:16,borderRadius:8,background:"#fff",marginLeft:16}} /></div>
      </div>);})}
    </div>

    {/* Scadute */}
    {scaduti.length>0&&<div style={{marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:700,color:C.rd,marginBottom:6}}>{"🔴 SCADUTE · "+scaduti.length}</div>
      {scaduti.map(function(s,i){return(<div key={i} style={{background:C.rd+"06",border:"1px solid "+C.rd+"15",borderRadius:12,padding:"12px 14px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:14,fontWeight:600,color:C.dk}}>{s.cliente}</div><div style={{fontSize:12,color:C.rd,marginTop:2}}>{s.scadenza+" · scaduto da "+Math.abs(s.gg)+"gg"}</div></div>
        <button style={{padding:"6px 14px",borderRadius:8,border:"none",background:C.rd,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>{"📩 Invia"}</button>
      </div>);})}
    </div>}

    {/* Prossime */}
    {prossimi.length>0&&<div style={{marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:700,color:C.or,marginBottom:6}}>{"🟡 PROSSIME · "+prossimi.length}</div>
      {prossimi.map(function(s,i){return(<div key={i} style={{background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}>
        <div><div style={{fontSize:14,fontWeight:600,color:C.dk}}>{s.cliente}</div><div style={{fontSize:12,color:C.or,marginTop:2}}>{s.scadenza+" · tra "+s.gg+"gg"}</div></div>
        <span style={{fontSize:12,fontWeight:600,color:C.or}}>{s.scade}</span>
      </div>);})}
    </div>}

    {/* OK */}
    {ok.length>0&&<div>
      <div style={{fontSize:12,fontWeight:700,color:C.gn,marginBottom:6}}>{"🟢 IN REGOLA · "+ok.length}</div>
      {ok.map(function(s,i){return(<div key={i} style={{background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 3px rgba(0,0,0,.03)",opacity:.7}}>
        <div><div style={{fontSize:14,fontWeight:600,color:C.dk}}>{s.cliente}</div><div style={{fontSize:12,color:C.gn,marginTop:2}}>{s.scadenza}</div></div>
        <span style={{fontSize:12,color:C.g}}>{s.scade}</span>
      </div>);})}
    </div>}
  </div>);
}

// ========== INVIO RAPIDO ==========
function InvioScreen(){
  var _tipo=useState("promemoria");var tipo=_tipo[0];var setTipo=_tipo[1];
  var _dest=useState("tutti");var dest=_dest[0];var setDest=_dest[1];

  return(<div style={{padding:"12px 16px 20px"}}>
    <div style={{fontSize:16,fontWeight:700,color:C.dk,marginBottom:12}}>Invio rapido</div>

    {/* Tipo invio */}
    <div style={{display:"flex",gap:6,marginBottom:12}}>
      {[{id:"promemoria",l:"⏰ Promemoria",c:C.or},{id:"messaggio",l:"💬 Messaggio",c:C.bl},{id:"documento",l:"📄 Documento",c:C.pu}].map(function(t){var active=tipo===t.id;return(<div key={t.id} onClick={function(){setTipo(t.id);}} style={{flex:1,padding:"12px 8px",borderRadius:12,cursor:"pointer",textAlign:"center",background:active?t.c:C.w,color:active?"#fff":C.dk,fontSize:11,fontWeight:600,boxShadow:active?"none":"0 1px 3px rgba(0,0,0,.03)"}}>{t.l}</div>);})}
    </div>

    {/* Destinatari */}
    <div style={{background:C.w,borderRadius:14,padding:"14px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.g,marginBottom:8}}>A CHI</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[{id:"tutti",l:"Tutti ("+CLIENTI.length+")"},{id:"scaduti",l:"Scaduti (1)"},{id:"prossimi",l:"Prossimi (2)"},{id:"scegli",l:"Scegli..."}].map(function(d){var active=dest===d.id;return(<div key={d.id} onClick={function(){setDest(d.id);}} style={{padding:"8px 14px",borderRadius:10,cursor:"pointer",background:active?BIZ.colore:C.lg,color:active?"#fff":C.dk,fontSize:12,fontWeight:600}}>{d.l}</div>);})}
      </div>
    </div>

    {/* Template messaggi */}
    {tipo==="promemoria"&&<div style={{background:C.w,borderRadius:14,padding:"14px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.g,marginBottom:8}}>MODELLO</div>
      {["È ora del controllo semestrale! Prenota il tuo appuntamento.","Promemoria: il tuo appuntamento è domani alle {ora}.","Mancano 30 giorni alla prossima {scadenza}. Prenota!"].map(function(t,i){return(<div key={i} style={{padding:"10px 12px",borderRadius:10,marginBottom:6,background:C.lg,fontSize:13,color:C.dk,lineHeight:1.4,cursor:"pointer",border:"1px solid transparent"}}>{t}</div>);})}
      <div style={{marginTop:4}}><textarea placeholder="O scrivi il tuo messaggio..." rows={2} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+C.ln,fontSize:13,fontFamily:"inherit",resize:"none",background:C.bg}} /></div>
    </div>}

    {tipo==="documento"&&<div style={{background:C.w,borderRadius:14,padding:"14px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.g,marginBottom:8}}>TIPO DOCUMENTO</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {TPL.docTipi.map(function(d,i){return(<div key={i} style={{padding:"8px 14px",borderRadius:10,background:C.lg,fontSize:12,fontWeight:600,color:C.dk,cursor:"pointer"}}>{d}</div>);})}
      </div>
      <div style={{marginTop:10,border:"2px dashed "+C.ln,borderRadius:10,padding:"16px",textAlign:"center",cursor:"pointer"}}><span style={{fontSize:24}}>{"📎"}</span><div style={{fontSize:12,color:C.g,marginTop:4}}>Allega file (PDF, foto)</div></div>
    </div>}

    {tipo==="messaggio"&&<div style={{background:C.w,borderRadius:14,padding:"14px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.g,marginBottom:8}}>MESSAGGIO</div>
      <textarea placeholder="Scrivi il tuo messaggio..." rows={4} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+C.ln,fontSize:14,fontFamily:"inherit",resize:"none",background:C.bg}} />
      <div style={{marginTop:6,display:"flex",gap:6}}>
        <button style={{padding:"6px 12px",borderRadius:8,border:"1px solid "+C.ln,background:C.w,fontSize:11,cursor:"pointer"}}>{"📎 Allega"}</button>
        <button style={{padding:"6px 12px",borderRadius:8,border:"1px solid "+C.ln,background:C.w,fontSize:11,cursor:"pointer"}}>{"📷 Foto"}</button>
      </div>
    </div>}

    {/* Preview */}
    <div style={{background:C.dk+"08",borderRadius:14,padding:"14px",marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:700,color:C.g,marginBottom:6}}>ANTEPRIMA</div>
      <div style={{background:C.w,borderRadius:10,padding:"12px",fontSize:13,color:C.dk,lineHeight:1.5}}>
        <div style={{fontWeight:700,color:BIZ.colore,marginBottom:4}}>{BIZ.nome}</div>
        {tipo==="promemoria"&&"È ora del controllo semestrale! Prenota il tuo appuntamento."}
        {tipo==="messaggio"&&<span style={{color:C.g,fontStyle:"italic"}}>Il tuo messaggio apparirà qui...</span>}
        {tipo==="documento"&&"Ti inviamo il documento. Lo trovi nella sezione Documenti dell'app."}
      </div>
      <div style={{fontSize:10,color:C.g,marginTop:4}}>{"Verrà inviato via MASTRO (gratis) · "+CLIENTI.length+" destinatari"}</div>
    </div>

    <button style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:BIZ.colore,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>
      {"📤 Invia a "+(dest==="tutti"?CLIENTI.length:dest==="scaduti"?"1":dest==="prossimi"?"2":"...")+" client"+(dest==="scaduti"?"e":"i")}
    </button>
  </div>);
}

// ========== AI AGENT ==========
function AgenteScreen(){
  var _mode=useState("auto");var mode=_mode[0];var setMode=_mode[1];
  var _chatInput=useState("");var chatInput=_chatInput[0];var setChatInput=_chatInput[1];
  var _msgs=useState([
    { id:1,dir:"ai",txt:"Buongiorno Dr. Mazza! Ho analizzato la situazione dei suoi pazienti. Ecco cosa ho fatto stanotte:",t:"07:00",tipo:"report" },
    { id:2,dir:"ai",txt:"📩 Inviato promemoria automatico ad Anna Bianchi e Paolo Ferraro per il controllo del 5 marzo. Entrambi hanno confermato ✓",t:"07:01",tipo:"azione" },
    { id:3,dir:"ai",txt:"⚠️ ATTENZIONE: Giulia Serra ha il controllo scaduto da 15 giorni. Le ho mandato un messaggio gentile ieri ma non ha risposto. Suggerisco di chiamarla.",t:"07:02",tipo:"alert" },
    { id:4,dir:"ai",txt:"📅 Ho notato che Marco Rossi (mercoledì ore 11:15) non ha ancora confermato. Gli mando un promemoria stamattina?",t:"07:03",tipo:"domanda" },
    { id:5,dir:"biz",txt:"Sì mandagli il promemoria, grazie",t:"07:15" },
    { id:6,dir:"ai",txt:"Fatto! ✓ Promemoria inviato a Marco Rossi. Gli ho scritto: \"Gentile Marco, le ricordiamo l'appuntamento di mercoledì 5 alle 11:15 per la pulizia. Confermi?\" Lo monitoro e la avviso appena risponde.",t:"07:15",tipo:"azione" },
    { id:7,dir:"ai",txt:"💡 SUGGERIMENTO: Ho lo slot delle 10:30 di mercoledì libero. La signora Giulia Serra (scadenza passata) abita a 5 min dallo studio. Vuole che le proponga quell'orario?",t:"07:20",tipo:"suggerimento" },
    { id:8,dir:"biz",txt:"Ottima idea, proponiglielo tu",t:"07:25" },
    { id:9,dir:"ai",txt:"Perfetto! Ho scritto a Giulia Serra: \"Gentile Giulia, abbiamo uno slot disponibile mercoledì 5 marzo alle 10:30. È passato un po' dal suo ultimo controllo, le farebbe comodo?\" La tengo aggiornata!",t:"07:25",tipo:"azione" },
    { id:10,dir:"ai",txt:"📊 REPORT SETTIMANALE: Questa settimana ha 6 appuntamenti, 2 scadenze da gestire, 0 cancellazioni. Tasso di conferma: 83%. La media del settore è 71% — sta andando benissimo!",t:"07:30",tipo:"report" },
  ]);
  var msgs=_msgs[0];var setMsgs=_msgs[1];

  // AI autopilot actions log
  var AUTOPILOT = [
    { id:1, azione:"Promemoria 24h prima", desc:"Invia automaticamente promemoria il giorno prima dell'appuntamento", attivo:true, esecuzioni:47 },
    { id:2, azione:"Recall scadenze", desc:"Contatta pazienti quando scade un controllo periodico", attivo:true, esecuzioni:12 },
    { id:3, azione:"Conferma appuntamento", desc:"Chiede conferma 48h prima e propone orari alternativi se cancella", attivo:true, esecuzioni:31 },
    { id:4, azione:"Slot liberi → suggerimenti", desc:"Se uno slot si libera, propone a pazienti con scadenze vicine", attivo:true, esecuzioni:5 },
    { id:5, azione:"Post-visita follow-up", desc:"Messaggio di follow-up 48h dopo il trattamento", attivo:false, esecuzioni:0 },
    { id:6, azione:"Auguri compleanno", desc:"Invia auguri automatici con promemoria check-up", attivo:false, esecuzioni:0 },
  ];

  var _autopilot=useState(function(){var m={};AUTOPILOT.forEach(function(a){m[a.id]=a.attivo;});return m;});
  var apState=_autopilot[0];var setApState=_autopilot[1];
  var toggleAp=function(id){setApState(function(prev){var n={};for(var k in prev)n[k]=prev[k];n[id]=!n[id];return n;});};

  var TIPO_STYLE={
    report:{bg:C.bl+"08",border:C.bl+"20",icon:"📊"},
    azione:{bg:C.gn+"08",border:C.gn+"20",icon:"✅"},
    alert:{bg:C.rd+"08",border:C.rd+"20",icon:"⚠️"},
    domanda:{bg:C.or+"08",border:C.or+"20",icon:"❓"},
    suggerimento:{bg:C.pu+"08",border:C.pu+"20",icon:"💡"},
  };

  var sendMsg=function(){
    if(!chatInput.trim())return;
    var newId=msgs.length+1;
    var newMsgs=msgs.concat([{id:newId,dir:"biz",txt:chatInput,t:"ora"}]);
    // Simulate AI response
    var risposta="Ci penso io! Sto elaborando la sua richiesta...";
    if(chatInput.toLowerCase().indexOf("cancel")>=0) risposta="Capito. Cancello l'appuntamento e contatto il paziente per riprogrammare. Vuole che proponga un'alternativa?";
    else if(chatInput.toLowerCase().indexOf("spost")>=0) risposta="Ok! Ho controllato la disponibilità. Posso spostare alle 15:00 dello stesso giorno o alle 9:00 di giovedì. Quale preferisce?";
    else if(chatInput.toLowerCase().indexOf("quanti")>=0||chatInput.toLowerCase().indexOf("stat")>=0) risposta="📊 Questo mese: 22 appuntamenti completati, 3 cancellati (14% canc.), €3.400 fatturato, 2 nuovi pazienti da referral. Tasso conferma 86% (+3% vs mese scorso).";
    else if(chatInput.toLowerCase().indexOf("liber")>=0||chatInput.toLowerCase().indexOf("slot")>=0) risposta="📅 Slot liberi questa settimana: Mer 10:30, Ven 11:00, Ven 15:30. Vuole che proponga uno di questi a pazienti con scadenze vicine?";
    else if(chatInput.toLowerCase().indexOf("domani")>=0) risposta="📅 Domani ha 4 appuntamenti: 9:00 Bianchi (controllo), 9:45 Ferraro (controllo), 11:15 Rossi (pulizia, da confermare), 14:00 Nuovo paziente. Tutti i promemoria sono già stati inviati.";

    newMsgs=newMsgs.concat([{id:newId+1,dir:"ai",txt:risposta,t:"ora",tipo:"azione"}]);
    setMsgs(newMsgs);
    setChatInput("");
  };

  return(<div style={{display:"flex",flexDirection:"column",minHeight:"calc(100vh - 95px)"}}>
    {/* Mode toggle */}
    <div style={{padding:"10px 16px",display:"flex",gap:6,background:C.w,borderBottom:"1px solid "+C.ln}}>
      {[{id:"auto",l:"💬 Chat"},{id:"autopilot",l:"⚡ Autopilot"},{id:"log",l:"📋 Log"}].map(function(m){var active=mode===m.id;return(<div key={m.id} onClick={function(){setMode(m.id);}} style={{flex:1,textAlign:"center",padding:"8px",borderRadius:10,cursor:"pointer",background:active?BIZ.colore:C.lg,color:active?"#fff":C.dk,fontSize:12,fontWeight:600}}>{m.l}</div>);})}
    </div>

    {/* CHAT MODE */}
    {mode==="auto"&&(<>
      <div style={{flex:1,padding:"12px 16px",overflowY:"auto",background:C.bg}}>
        {/* AI avatar intro */}
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,"+BIZ.colore+","+C.pu+")",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:28}}>{"🤖"}</span></div>
          <div style={{fontSize:15,fontWeight:700,color:C.dk,marginTop:8}}>MASTRO Agente</div>
          <div style={{fontSize:11,color:C.g}}>Il suo assistente AI personale</div>
          <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:6}}>
            <span style={{fontSize:8,fontWeight:700,color:C.gn,background:C.gn+"12",padding:"2px 8px",borderRadius:10}}>● ATTIVO 24/7</span>
            <span style={{fontSize:8,fontWeight:700,color:C.bl,background:C.bl+"12",padding:"2px 8px",borderRadius:10}}>95 azioni questo mese</span>
          </div>
        </div>

        {/* Messages */}
        {msgs.map(function(m){
          var isAi=m.dir==="ai";
          var ts=m.tipo?TIPO_STYLE[m.tipo]:null;
          return(<div key={m.id} style={{display:"flex",justifyContent:isAi?"flex-start":"flex-end",marginBottom:8}}>
            {isAi&&<div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,"+BIZ.colore+","+C.pu+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,marginRight:8,marginTop:2}}>{"🤖"}</div>}
            <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:isAi?"4px 16px 16px 16px":"16px 16px 4px 16px",background:isAi?C.w:BIZ.colore,color:isAi?C.dk:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:isAi&&ts?"1px solid "+ts.border:"none",backgroundColor:isAi&&ts?ts.bg:isAi?C.w:BIZ.colore}}>
              <div style={{fontSize:14,lineHeight:1.5}}>{m.txt}</div>
              <div style={{fontSize:9,color:isAi?C.g:"rgba(255,255,255,.5)",marginTop:4,textAlign:"right"}}>{m.t}</div>
            </div>
          </div>);
        })}
      </div>

      {/* Quick actions + input */}
      <div style={{background:C.w,borderTop:"1px solid "+C.ln,padding:"8px 16px 16px"}}>
        <div style={{display:"flex",gap:6,marginBottom:8,overflowX:"auto",paddingBottom:4}}>
          {["Com'è domani?","Slot liberi?","Statistiche mese","Chi ha scadenze?"].map(function(q,i){return(<div key={i} onClick={function(){setChatInput(q);}} style={{padding:"6px 12px",borderRadius:18,background:C.lg,fontSize:11,fontWeight:600,color:C.dk,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{q}</div>);})}
        </div>
        <div style={{display:"flex",gap:6}}>
          <input value={chatInput} onChange={function(e){setChatInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")sendMsg();}} placeholder="Chiedi all'agente..." style={{flex:1,border:"1px solid "+C.ln,outline:"none",fontSize:14,padding:"10px 14px",background:C.lg,borderRadius:22,fontFamily:"inherit"}} />
          <button onClick={sendMsg} style={{width:44,height:44,borderRadius:22,border:"none",background:"linear-gradient(135deg,"+BIZ.colore+","+C.pu+")",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16,color:"#fff"}}>{"↑"}</span></button>
        </div>
      </div>
    </>)}

    {/* AUTOPILOT MODE */}
    {mode==="autopilot"&&(<div style={{flex:1,padding:"12px 16px",overflowY:"auto"}}>
      <div style={{background:"linear-gradient(135deg,"+BIZ.colore+"10,"+C.pu+"10)",borderRadius:16,padding:"16px",marginBottom:12,border:"1px solid "+BIZ.colore+"20"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:C.dk}}>{"⚡ Modalità Autopilot"}</div>
            <div style={{fontSize:12,color:C.g,marginTop:2}}>L'agente lavora in autonomia 24/7</div>
          </div>
          <div style={{width:50,height:28,borderRadius:14,background:C.gn,padding:2,cursor:"pointer"}}><div style={{width:24,height:24,borderRadius:12,background:"#fff",marginLeft:22}} /></div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <div style={{flex:1,background:C.w,borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:BIZ.colore}}>95</div><div style={{fontSize:9,color:C.g}}>Azioni mese</div></div>
          <div style={{flex:1,background:C.w,borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.gn}}>12h</div><div style={{fontSize:9,color:C.g}}>Tempo risparmiato</div></div>
          <div style={{flex:1,background:C.w,borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.or}}>86%</div><div style={{fontSize:9,color:C.g}}>Tasso conferma</div></div>
        </div>
      </div>

      <div style={{fontSize:14,fontWeight:700,color:C.dk,marginBottom:8}}>Azioni automatiche</div>
      <div style={{fontSize:11,color:C.g,marginBottom:10}}>Attiva/disattiva cosa può fare l'agente in autonomia</div>

      {AUTOPILOT.map(function(a){var on=apState[a.id];return(<div key={a.id} style={{background:C.w,borderRadius:14,padding:"14px",marginBottom:8,boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{flex:1,marginRight:10}}>
            <div style={{fontSize:14,fontWeight:600,color:C.dk}}>{a.azione}</div>
            <div style={{fontSize:11,color:C.g,marginTop:3,lineHeight:1.4}}>{a.desc}</div>
            {a.esecuzioni>0&&<div style={{fontSize:10,color:BIZ.colore,marginTop:4,fontWeight:600}}>{a.esecuzioni+" esecuzioni"}</div>}
          </div>
          <div onClick={function(){toggleAp(a.id);}} style={{width:44,height:24,borderRadius:12,background:on?C.gn:C.ln,padding:2,cursor:"pointer",flexShrink:0}}><div style={{width:20,height:20,borderRadius:10,background:"#fff",marginLeft:on?20:0,transition:"margin-left .2s"}} /></div>
        </div>
      </div>);})}

      <div style={{background:C.or+"08",borderRadius:14,padding:"14px",marginTop:8,border:"1px solid "+C.or+"20"}}>
        <div style={{fontSize:12,fontWeight:700,color:C.or}}>{"💡 Suggerimento"}</div>
        <div style={{fontSize:12,color:C.dk,marginTop:4,lineHeight:1.5}}>Attivando "Post-visita follow-up" e "Auguri compleanno" il tasso di ritorno dei pazienti aumenta mediamente del 23%.</div>
      </div>
    </div>)}

    {/* LOG MODE */}
    {mode==="log"&&(<div style={{flex:1,padding:"12px 16px",overflowY:"auto"}}>
      <div style={{fontSize:14,fontWeight:700,color:C.dk,marginBottom:10}}>Ultime azioni dell'agente</div>
      {[
        { t:"Oggi 07:25", a:"Proposto slot 10:30 a Giulia Serra (scadenza passata)", tipo:"suggerimento", stato:"inviato" },
        { t:"Oggi 07:15", a:"Inviato promemoria conferma a Marco Rossi (mer 11:15)", tipo:"azione", stato:"inviato" },
        { t:"Oggi 07:01", a:"Promemoria automatico a Bianchi + Ferraro per 5 marzo", tipo:"azione", stato:"confermato" },
        { t:"Ieri 18:00", a:"Messaggio recall a Giulia Serra (scadenza controllo)", tipo:"azione", stato:"nessuna risposta" },
        { t:"Ieri 09:00", a:"Report settimanale generato e inviato a Dr. Mazza", tipo:"report", stato:"letto" },
        { t:"Lun 16:00", a:"Slot cancellato da Verdi → proposto a 2 pazienti con scadenze", tipo:"suggerimento", stato:"1 accettato" },
        { t:"Lun 08:00", a:"Conferma automatica ricevuta da Anna Bianchi per mer 5", tipo:"azione", stato:"confermato" },
        { t:"Dom 10:00", a:"Analisi scadenze settimanali: 1 scaduta, 2 prossime, 2 ok", tipo:"report", stato:"completato" },
        { t:"Sab 14:00", a:"Auguri compleanno inviati a Laura Greco", tipo:"azione", stato:"letto" },
      ].map(function(l,i){
        var ts=TIPO_STYLE[l.tipo]||TIPO_STYLE.azione;
        var stCol=l.stato==="confermato"||l.stato==="letto"||l.stato==="completato"||l.stato==="1 accettato"?C.gn:l.stato==="nessuna risposta"?C.or:C.bl;
        return(<div key={i} style={{background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:6,boxShadow:"0 1px 3px rgba(0,0,0,.03)",borderLeft:"3px solid "+(ts.border||C.bl)}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.dk,lineHeight:1.4}}>{l.a}</div></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
            <span style={{fontSize:10,color:C.g}}>{l.t}</span>
            <span style={{fontSize:9,fontWeight:700,color:stCol,background:stCol+"12",padding:"2px 8px",borderRadius:6}}>{l.stato}</span>
          </div>
        </div>);
      })}
    </div>)}
  </div>);
}

// ========== MAIN ==========
export default function App(){
  var _tab=useState("dash");var tab=_tab[0];var setTab=_tab[1];

  return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",background:C.bg}}>
    <BizHeader activeTab={tab} onNav={setTab} />
    {tab==="dash"&&<Dashboard />}
    {tab==="ai"&&<AgenteScreen />}
    {tab==="agenda"&&<AgendaScreen />}
    {tab==="clienti"&&<ClientiScreen />}
    {tab==="scadenze"&&<ScadenzeScreen />}
    {tab==="invio"&&<InvioScreen />}
  </div>);
}
