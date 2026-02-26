import { useState } from "react";

var C = { bg:"#F8F8FA",w:"#FFF",dk:"#1A1C1E",g:"#8E8E93",lg:"#F2F2F7",ln:"#E5E5EA",bl:"#007AFF",rd:"#FF3B30",or:"#FF9500",gn:"#34C759",pu:"#AF52DE",tl:"#5AC8FA",pk:"#FF2D55" };

// ========== ALL BUSINESSES WITH REAL DATA ==========
var AZ = {
  wc: {
    id:"wc", nome:"Walter Cozza Serramenti", logo:"WC", colore:"#1A1C1E", cat:"serramenti",
    slogan:"Qualità che dura nel tempo", citta:"Cosenza", tel:"+39 0984 123456",
    rating: 4.8, recensioni: 24, notifiche: 2,
    badge:{ txt:"📦 Ordine in corso", c:C.pu },
    stato:{ fase:"Ordine confermato", progress:57, icon:"📦", consegna:"24 Feb", giorni:5 },
    fasi:["sopralluogo","preventivo","misure","ordine","produzione","posa","completato"],
    fasiData:[
      { l:"Sopralluogo",i:"📍",c:C.bl,data:"3 Feb",done:true,nota:"Rilievo completato. Cassonetto assente salone." },
      { l:"Preventivo",i:"📋",c:C.or,data:"5 Feb",done:true,nota:"€8.450 accettato e firmato." },
      { l:"Misure",i:"📐",c:C.rd,data:"7 Feb",done:true,nota:"Misure definitive confermate." },
      { l:"Ordine",i:"📦",c:C.pu,data:"10 Feb",done:true,nota:"Ordine Schüco SCH-2026-04812." },
      { l:"Produzione",i:"🔧",c:"#EAB308",data:"~17 Feb",done:false,nota:"Stimati 5gg lavorativi." },
      { l:"Posa",i:"🏗️",c:C.tl,data:"~26 Feb",done:false,nota:"Installazione 1 giorno." },
      { l:"Completato",i:"✅",c:C.gn,data:"",done:false,nota:"" },
    ],
    faseIdx: 3,
    dettagli:[
      { v:"Salone",t:"Scorrevole HST",dim:"2400x2200",col:"RAL 7016",uw:"1.1" },
      { v:"Camera",t:"Finestra 2 ante",dim:"1400x1400",col:"RAL 7016",uw:"1.3" },
      { v:"Cameretta",t:"Finestra 1 anta",dim:"1000x1200",col:"RAL 7016",uw:"1.3" },
      { v:"Bagno",t:"Vasistas",dim:"600x600",col:"RAL 9010",uw:"1.4" },
    ],
    pagamenti:{ totale:8450, pagato:2535, saldo:5915, rate:[
      { desc:"Acconto 30%",importo:2535,data:"6 Feb",stato:"pagata" },
      { desc:"Saldo 70% (alla posa)",importo:5915,data:"~26 Feb",stato:"da pagare" },
    ]},
    docs:[
      { nome:"Preventivo CM-0001",data:"5 Feb",stato:"firmato",icon:"📋" },
      { nome:"Contratto fornitura",data:"5 Feb",stato:"firmato",icon:"📝" },
      { nome:"Fattura acconto",data:"6 Feb",stato:"pagata",icon:"🧾" },
      { nome:"Conferma ordine Schüco",data:"10 Feb",stato:null,icon:"📦" },
      { nome:"Fattura saldo",data:"alla posa",stato:"da emettere",icon:"🧾" },
      { nome:"Certificazione CE",data:"dopo posa",stato:"in arrivo",icon:"🏅" },
      { nome:"Pratica ENEA",data:"dopo posa",stato:"da compilare",icon:"🌿" },
      { nome:"Garanzia 10 anni",data:"dopo posa",stato:"in arrivo",icon:"🛡️" },
    ],
    chat:[
      { id:1,dir:"in",da:"Walter Cozza",txt:"Preventivo pronto! €8.450 tutto incluso.",t:"5 Feb" },
      { id:2,dir:"out",da:"Anna",txt:"Va bene, procediamo.",t:"5 Feb" },
      { id:3,dir:"in",da:"Walter Cozza",txt:"Ordine confermato! Consegna ~24 febbraio.",t:"10 Feb" },
      { id:4,dir:"out",da:"Anna",txt:"Quando arrivano? Sono 2 settimane...",t:"19 Feb" },
    ],
    storico:[
      { lavoro:"Sostituzione persiane camera",data:"Mar 2024",importo:1200,voto:5 },
    ],
    problemi:["Non chiude bene","Spiffero / infiltrazione","Vetro rotto","Maniglia rotta","Condensa","Rumore","Altro"],
  },
  idra: {
    id:"idra", nome:"Ferraro Impianti", logo:"FI", colore:"#0891B2", cat:"idraulico",
    slogan:"Impianti termoidraulici", citta:"Rende", tel:"+39 0984 567890",
    rating: 4.6, recensioni: 31, notifiche: 1,
    badge:{ txt:"🔧 Manutenzione 28 Feb", c:C.tl },
    stato:{ fase:"Manutenzione programmata", progress:100, icon:"🔧", consegna:"28 Feb", giorni:9 },
    fasi:["richiesta","sopralluogo","preventivo","lavoro","collaudo","completato"],
    fasiData:[
      { l:"Richiesta",i:"📞",c:C.bl,data:"15 Gen",done:true,nota:"Richiesta manutenzione annuale caldaia." },
      { l:"Appuntamento",i:"📅",c:C.or,data:"28 Feb ore 9",done:false,nota:"Tecnico: Marco Ferraro." },
      { l:"Lavoro",i:"🔧",c:"#EAB308",data:"28 Feb",done:false,nota:"Revisione + pulizia + controllo fumi." },
      { l:"Certificazione",i:"📋",c:C.pu,data:"28 Feb",done:false,nota:"Rilascio bollino blu." },
      { l:"Completato",i:"✅",c:C.gn,data:"",done:false,nota:"" },
    ],
    faseIdx: 0,
    dettagli:[
      { v:"Caldaia",t:"Vaillant ecoTEC plus",dim:"",col:"",uw:"" },
      { v:"Condizionatore",t:"Daikin Emura 12000 BTU",dim:"Soggiorno",col:"",uw:"" },
    ],
    pagamenti:{ totale:180, pagato:0, saldo:180, rate:[
      { desc:"Manutenzione annuale",importo:180,data:"28 Feb",stato:"da pagare" },
    ]},
    docs:[
      { nome:"Libretto impianto caldaia",data:"Feb 2025",stato:"attivo",icon:"📖" },
      { nome:"Certificazione fumi 2025",data:"Mar 2025",stato:"scaduta",icon:"🔥" },
      { nome:"Garanzia condizionatore",data:"Giu 2024",stato:"attiva",icon:"🛡️" },
      { nome:"Fattura manutenzione 2025",data:"Mar 2025",stato:"pagata",icon:"🧾" },
    ],
    chat:[
      { id:1,dir:"in",da:"Ferraro Impianti",txt:"Buongiorno! La certificazione fumi scade a breve. Fissiamo manutenzione?",t:"15 Gen" },
      { id:2,dir:"out",da:"Anna",txt:"Sì grazie, quando avete disponibilità?",t:"15 Gen" },
      { id:3,dir:"in",da:"Ferraro Impianti",txt:"28 febbraio mattina va bene? Tecnico: Marco.",t:"16 Gen" },
      { id:4,dir:"out",da:"Anna",txt:"Perfetto, confermo!",t:"16 Gen" },
    ],
    storico:[
      { lavoro:"Manutenzione caldaia 2025",data:"Mar 2025",importo:180,voto:5 },
      { lavoro:"Installazione condizionatore",data:"Giu 2024",importo:1800,voto:4 },
      { lavoro:"Riparazione perdita bagno",data:"Nov 2023",importo:120,voto:5 },
    ],
    problemi:["Perdita acqua","Caldaia non parte","Termosifone freddo","Scarico lento","Condizionatore non raffredda","Altro"],
  },
  dent: {
    id:"dent", nome:"Studio Dr. Mazza", logo:"DM", colore:"#7C3AED", cat:"dentista",
    slogan:"Il tuo sorriso, la nostra passione", citta:"Cosenza", tel:"+39 0984 234567",
    rating: 4.9, recensioni: 87, notifiche: 0,
    badge:{ txt:"🦷 Controllo 5 Mar", c:C.pu },
    stato:{ fase:"Prossimo appuntamento", progress:100, icon:"🦷", consegna:"5 Mar", giorni:14 },
    fasi:["prenotazione","visita","trattamento","controllo"],
    fasiData:[
      { l:"Prenotazione",i:"📅",c:C.bl,data:"10 Feb",done:true,nota:"Controllo semestrale prenotato." },
      { l:"Visita",i:"🦷",c:C.pu,data:"5 Mar ore 10:30",done:false,nota:"Dr. Mazza - Studio via Roma 8." },
      { l:"Completato",i:"✅",c:C.gn,data:"",done:false,nota:"" },
    ],
    faseIdx: 0,
    dettagli:[],
    pagamenti:{ totale:0, pagato:0, saldo:0, rate:[] },
    docs:[
      { nome:"Panoramica dentale",data:"Set 2025",stato:null,icon:"🩻" },
      { nome:"Piano trattamento ortodonzia",data:"Set 2025",stato:"in corso",icon:"📋" },
      { nome:"Fattura pulizia Set 2025",data:"Set 2025",stato:"pagata",icon:"🧾" },
      { nome:"Prossima fattura",data:"5 Mar",stato:"da emettere",icon:"🧾" },
    ],
    chat:[
      { id:1,dir:"in",da:"Studio Dr. Mazza",txt:"Gentile Anna, è ora del controllo semestrale! Disponibilità il 5 marzo?",t:"10 Feb" },
      { id:2,dir:"out",da:"Anna",txt:"Sì va bene, mattina se possibile.",t:"10 Feb" },
      { id:3,dir:"in",da:"Studio Dr. Mazza",txt:"Perfetto, ore 10:30. Le invio promemoria il giorno prima.",t:"10 Feb" },
    ],
    storico:[
      { lavoro:"Pulizia dentale",data:"Set 2025",importo:80,voto:5 },
      { lavoro:"Otturazione molare",data:"Giu 2025",importo:150,voto:5 },
      { lavoro:"Sbiancamento",data:"Gen 2025",importo:250,voto:4 },
    ],
    problemi:["Mal di denti","Gengive sanguinanti","Dente scheggiato","Sensibilità","Controllo urgente","Altro"],
  },
  elett: {
    id:"elett", nome:"Greco Elettricista", logo:"GE", colore:"#EAB308", cat:"elettricista",
    slogan:"Impianti civili e industriali", citta:"Cosenza", tel:"+39 0984 345678",
    rating: 4.5, recensioni: 15, notifiche: 0,
    badge:null,
    stato:null,
    fasi:[], fasiData:[], faseIdx:-1,
    dettagli:[
      { v:"Impianto elettrico",t:"Livello 2 (standard)",dim:"Appartamento 90mq",col:"",uw:"" },
    ],
    pagamenti:{ totale:0, pagato:0, saldo:0, rate:[] },
    docs:[
      { nome:"DiCo impianto elettrico",data:"Nov 2024",stato:"valida",icon:"⚡" },
      { nome:"Certificato conformità",data:"Nov 2024",stato:"valido",icon:"📋" },
      { nome:"Fattura rifacimento",data:"Nov 2024",stato:"pagata",icon:"🧾" },
      { nome:"Schema impianto",data:"Nov 2024",stato:null,icon:"📐" },
    ],
    chat:[
      { id:1,dir:"in",da:"Greco Elettricista",txt:"Lavoro completato! DiCo e schema impianto nella sezione documenti.",t:"Nov 2024" },
      { id:2,dir:"out",da:"Anna",txt:"Tutto perfetto, grazie!",t:"Nov 2024" },
    ],
    storico:[
      { lavoro:"Rifacimento impianto elettrico",data:"Nov 2024",importo:3200,voto:5 },
      { lavoro:"Installazione citofono smart",data:"Mar 2024",importo:350,voto:4 },
    ],
    problemi:["Presa non funziona","Corto circuito","Interruttore rotto","Blackout parziale","Installazione nuova presa","Altro"],
  },
  auto: {
    id:"auto", nome:"Officina Perri", logo:"OP", colore:"#DC2626", cat:"meccanico",
    slogan:"Assistenza auto multimarca", citta:"Rende", tel:"+39 0984 456789",
    rating: 4.3, recensioni: 42, notifiche: 1,
    badge:{ txt:"⚠️ Revisione scade Apr", c:C.or },
    stato:{ fase:"Revisione in scadenza", progress:100, icon:"⚠️", consegna:"Apr 2026", giorni:40 },
    fasi:[], fasiData:[],faseIdx:-1,
    dettagli:[
      { v:"Auto",t:"Fiat 500X 1.6 MJet",dim:"2021 · 45.000km",col:"Grigio Colosseo",uw:"" },
    ],
    pagamenti:{ totale:0, pagato:0, saldo:0, rate:[] },
    docs:[
      { nome:"Fattura tagliando Dic 2025",data:"Dic 2025",stato:"pagata",icon:"🧾" },
      { nome:"Report diagnosi",data:"Dic 2025",stato:null,icon:"🔍" },
      { nome:"Revisione 2024",data:"Apr 2024",stato:"scadenza Apr 2026",icon:"📋" },
      { nome:"Storico interventi auto",data:"aggiornato",stato:null,icon:"📖" },
    ],
    chat:[
      { id:1,dir:"in",da:"Officina Perri",txt:"La revisione della 500X scade ad aprile. Vuole prenotare?",t:"18 Feb" },
      { id:2,dir:"out",da:"Anna",txt:"Sì, quando avete un buco?",t:"18 Feb" },
    ],
    storico:[
      { lavoro:"Tagliando 45.000km",data:"Dic 2025",importo:280,voto:4 },
      { lavoro:"Sostituzione pastiglie freni",data:"Ago 2025",importo:180,voto:4 },
      { lavoro:"Revisione 2024",data:"Apr 2024",importo:80,voto:5 },
      { lavoro:"Cambio gomme estive",data:"Mar 2024",importo:320,voto:4 },
    ],
    problemi:["Spia motore accesa","Rumore sospetto","Freni","Batteria scarica","Aria condizionata","Pneumatici","Altro"],
  },
  arch: {
    id:"arch", nome:"Arch. De Luca", logo:"DL", colore:"#059669", cat:"architetto",
    slogan:"Progettazione e ristrutturazione", citta:"Cosenza", tel:"+39 0984 567123",
    rating: 4.7, recensioni: 19, notifiche: 3,
    badge:{ txt:"📐 Progetto in corso", c:C.gn },
    stato:{ fase:"Pratica CILA", progress:40, icon:"📐", consegna:"~15 Mar", giorni:24 },
    fasi:["consulenza","progetto","pratica","lavori","fine_lavori"],
    fasiData:[
      { l:"Consulenza",i:"💬",c:C.bl,data:"20 Gen",done:true,nota:"Sopralluogo e brief ristrutturazione bagno." },
      { l:"Progetto",i:"📐",c:C.gn,data:"1 Feb",done:true,nota:"Progetto bagno approvato." },
      { l:"Pratica CILA",i:"📋",c:C.or,data:"in corso",done:false,nota:"CILA presentata al Comune. Attesa conferma." },
      { l:"Lavori",i:"🏗️",c:"#EAB308",data:"~Apr",done:false,nota:"Inizio lavori stimato dopo ok CILA." },
      { l:"Fine lavori",i:"✅",c:C.gn,data:"",done:false,nota:"" },
    ],
    faseIdx: 2,
    dettagli:[],
    pagamenti:{ totale:4500, pagato:1500, saldo:3000, rate:[
      { desc:"Acconto progettazione",importo:1500,data:"1 Feb",stato:"pagata" },
      { desc:"SAL 50% inizio lavori",importo:1500,data:"~Apr",stato:"da pagare" },
      { desc:"Saldo fine lavori",importo:1500,data:"~Mag",stato:"da pagare" },
    ]},
    docs:[
      { nome:"Progetto bagno (PDF)",data:"1 Feb",stato:"approvato",icon:"📐" },
      { nome:"Computo metrico",data:"5 Feb",stato:null,icon:"📊" },
      { nome:"CILA presentata",data:"12 Feb",stato:"in attesa",icon:"📋" },
      { nome:"Fattura acconto",data:"1 Feb",stato:"pagata",icon:"🧾" },
    ],
    chat:[
      { id:1,dir:"in",da:"Arch. De Luca",txt:"Progetto bagno pronto! Lo trova nei documenti.",t:"1 Feb" },
      { id:2,dir:"out",da:"Anna",txt:"Bellissimo! Approvo.",t:"1 Feb" },
      { id:3,dir:"in",da:"Arch. De Luca",txt:"CILA presentata al Comune. Tempi: 2-3 settimane.",t:"12 Feb" },
      { id:4,dir:"in",da:"Arch. De Luca",txt:"Ho ricevuto 2 preventivi da imprese. Li confrontiamo?",t:"19 Feb" },
    ],
    storico:[],
    problemi:["Variante progetto","Ritardo pratica","Dubbio su materiali","Sopralluogo urgente","Altro"],
  },
};

var AZ_LIST = [AZ.wc, AZ.idra, AZ.dent, AZ.elett, AZ.auto, AZ.arch];

// Smart activity tracking - determines sort order + visual indicators
var ATTIVITA = {
  wc:   { ts:20, label:"Nuovo messaggio", tempo:"2 ore fa", attivo:true, movimento:"msg" },
  arch: { ts:18, label:"Documenti aggiornati", tempo:"ieri", attivo:true, movimento:"doc" },
  auto: { ts:16, label:"Revisione in scadenza", tempo:"ieri", attivo:true, movimento:"alert" },
  idra: { ts:14, label:"Appuntamento confermato", tempo:"3 gg fa", attivo:true, movimento:"cal" },
  dent: { ts:10, label:"Promemoria inviato", tempo:"1 sett fa", attivo:false, movimento:"cal" },
  elett:{ ts:2,  label:"Nessun aggiornamento", tempo:"3 mesi fa", attivo:false, movimento:null },
};
// Sort: active businesses with recent movements first
var AZ_SORTED = AZ_LIST.slice().sort(function(a,b){ return ATTIVITA[b.id].ts - ATTIVITA[a.id].ts; });
var CATEGORIE = [{id:"tutti",l:"Tutti",i:"⭐"},{id:"casa",l:"Casa",i:"🏠"},{id:"salute",l:"Salute",i:"❤️"},{id:"auto",l:"Auto",i:"🚗"}];
var CAT_MAP = {serramenti:"casa",idraulico:"casa",elettricista:"casa",architetto:"casa",dentista:"salute",meccanico:"auto"};

// ========== UNIFIED NOTIFICATIONS ==========
var NOTIFICHE = [
  { id:1, az:"wc", txt:"Ordine confermato! Codice Schüco: SCH-2026-04812", t:"10 Feb", icon:"📦", letta:true },
  { id:2, az:"wc", txt:"Consegna prevista 24 febbraio. Ti terremo aggiornato!", t:"12 Feb", icon:"🚚", letta:false },
  { id:3, az:"idra", txt:"Promemoria: manutenzione caldaia 28 febbraio ore 9", t:"18 Feb", icon:"🔧", letta:false },
  { id:4, az:"auto", txt:"La revisione della tua 500X scade ad aprile", t:"18 Feb", icon:"⚠️", letta:false },
  { id:5, az:"arch", txt:"CILA presentata al Comune. Tempi: 2-3 settimane", t:"12 Feb", icon:"📋", letta:true },
  { id:6, az:"arch", txt:"2 preventivi imprese ricevuti - confrontiamo?", t:"19 Feb", icon:"📐", letta:false },
  { id:7, az:"arch", txt:"Fattura acconto progettazione disponibile", t:"1 Feb", icon:"🧾", letta:true },
  { id:8, az:"dent", txt:"Appuntamento confermato: 5 marzo ore 10:30", t:"10 Feb", icon:"🦷", letta:true },
];

// ========== CALENDARIO SCADENZE ==========
var SCADENZE = [
  { data:"24 Feb", az:"wc", txt:"Consegna serramenti", c:C.pu, icon:"📦" },
  { data:"26 Feb", az:"wc", txt:"Posa serramenti", c:C.tl, icon:"🏗️" },
  { data:"28 Feb", az:"idra", txt:"Manutenzione caldaia", c:"#0891B2", icon:"🔧" },
  { data:"5 Mar", az:"dent", txt:"Controllo dentale", c:"#7C3AED", icon:"🦷" },
  { data:"~15 Mar", az:"arch", txt:"Risposta CILA Comune", c:"#059669", icon:"📋" },
  { data:"Apr 2026", az:"auto", txt:"Scadenza revisione auto", c:C.rd, icon:"⚠️" },
  { data:"~Apr", az:"arch", txt:"Inizio lavori bagno", c:"#059669", icon:"🏗️" },
  { data:"Ago 2026", az:"wc", txt:"Manutenzione serramenti (guarnizioni)", c:C.bl, icon:"🧽" },
];

// ========== REFERRAL DATA ==========
var REFERRAL = { codice:"ANNA-2026", invitati:2, sconto_dato:400, sconto_ottenuto:200,
  lista:[
    { nome:"Maria R.", az:"wc", stato:"completato", sconto:100 },
    { nome:"Giuseppe L.", az:"wc", stato:"in corso", sconto:100 },
  ]
};

function PoweredBy(){return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px 0"}}><span style={{fontSize:9,color:C.g}}>powered by</span><div style={{width:14,height:14,borderRadius:3,background:C.dk,display:"inline-flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>M</span></div><span style={{fontSize:9,fontWeight:800,color:C.dk,letterSpacing:1.5}}>MASTRO</span></div>);}

// ========== HOME ==========
function HomeScreen({onNav,onOpen}){
  var _c=useState("tutti");var cat=_c[0];var setCat=_c[1];
  var tot=0;AZ_LIST.forEach(function(a){tot+=a.notifiche;});
  var withBadge=AZ_LIST.filter(function(a){return a.badge;});

  // Smart filter + sort
  var filtered=AZ_SORTED.filter(function(a){if(cat==="tutti")return true;return CAT_MAP[a.cat]===cat;});
  var attive=filtered.filter(function(a){return ATTIVITA[a.id].attivo;});
  var quiete=filtered.filter(function(a){return !ATTIVITA[a.id].attivo;});
  var nextScad=SCADENZE[0];
  var MOV_ICON={msg:"💬",doc:"📄",alert:"⚠️",cal:"📅"};

  return(<div>
    <div style={{background:C.w,padding:"12px 16px 14px",borderBottom:"1px solid "+C.ln}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:C.dk,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>M</span></div>
          <div><div style={{fontSize:11,fontWeight:800,color:C.dk,letterSpacing:2.5,lineHeight:1}}>MASTRO</div><div style={{fontSize:13,fontWeight:300,color:C.dk,marginTop:1}}>cliente</div></div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div onClick={function(){onNav("notifiche");}} style={{position:"relative",cursor:"pointer"}}><span style={{fontSize:22}}>{"🔔"}</span>{tot>0&&<div style={{position:"absolute",top:-4,right:-4,minWidth:18,height:18,borderRadius:9,background:C.rd,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{tot}</div>}</div>
          <div onClick={function(){onNav("profilo");}} style={{width:32,height:32,borderRadius:16,background:C.pk+"15",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><span style={{fontSize:14,fontWeight:700,color:C.pk}}>A</span></div>
        </div>
      </div>
      <div style={{marginTop:14}}><div style={{fontSize:26,fontWeight:700,color:C.dk}}>{"Buongiorno Anna"}</div><div style={{fontSize:13,color:C.g,marginTop:2}}>{AZ_LIST.length+" aziende · "+tot+" notifiche"}</div></div>
    </div>

    {/* Next deadline banner */}
    <div onClick={function(){onNav("calendario");}} style={{margin:"10px 16px",background:"linear-gradient(135deg,"+nextScad.c+","+nextScad.c+"CC)",borderRadius:14,padding:"14px 16px",cursor:"pointer",color:"#fff"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:10,fontWeight:600,opacity:.8}}>PROSSIMA SCADENZA</div><div style={{fontSize:16,fontWeight:800,marginTop:2}}>{nextScad.icon+" "+nextScad.txt}</div><div style={{fontSize:12,opacity:.8,marginTop:2}}>{nextScad.data+" · "+AZ[nextScad.az].nome.split(" ")[0]}</div></div>
        <div style={{fontSize:11,opacity:.7}}>{"Vedi tutte ›"}</div>
      </div>
    </div>

    {/* In evidenza */}
    {withBadge.length>0&&(<div style={{padding:"4px 16px 0"}}><div style={{fontSize:11,fontWeight:700,color:C.g,letterSpacing:.5,marginBottom:8}}>IN EVIDENZA</div><div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
      {withBadge.map(function(a){return(<div key={a.id} onClick={function(){onOpen(a);}} style={{minWidth:200,background:a.badge.c+"08",border:"1px solid "+a.badge.c+"20",borderRadius:14,padding:"12px 14px",cursor:"pointer",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,borderRadius:7,background:a.colore,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:9,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{a.logo}</span></div><span style={{fontSize:12,fontWeight:700,color:C.dk}}>{a.nome.split(" ")[0]}</span></div>
        <div style={{fontSize:12,fontWeight:600,color:a.badge.c,marginTop:6}}>{a.badge.txt}</div>
      </div>);})}
    </div></div>)}

    {/* Categories */}
    <div style={{padding:"12px 16px 0",display:"flex",gap:8}}>
      {CATEGORIE.map(function(c){var a=cat===c.id;return(<div key={c.id} onClick={function(){setCat(c.id);}} style={{padding:"7px 14px",borderRadius:20,cursor:"pointer",background:a?C.dk:C.lg,color:a?"#fff":C.dk,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12}}>{c.i}</span><span>{c.l}</span></div>);})}
    </div>

    {/* Business list */}
    <div style={{padding:"10px 16px 100px"}}>
      {/* ACTIVE businesses */}
      {attive.length>0&&<div style={{fontSize:11,fontWeight:700,color:C.dk,letterSpacing:.5,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:6,height:6,borderRadius:3,background:C.gn}} />
        {"ATTIVE · "+attive.length}
      </div>}
      {attive.map(function(a){var act=ATTIVITA[a.id];var mi=MOV_ICON[act.movimento]||"";return(<div key={a.id} onClick={function(){onOpen(a);}} style={{background:C.w,borderRadius:16,padding:"14px 16px",marginBottom:8,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.06)",display:"flex",gap:14,alignItems:"center",borderLeft:"3px solid "+a.colore}}>
        <div style={{width:50,height:50,borderRadius:14,background:a.colore,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}><span style={{fontSize:15,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{a.logo}</span>{a.notifiche>0&&<div style={{position:"absolute",top:-3,right:-3,minWidth:16,height:16,borderRadius:8,background:C.rd,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{a.notifiche}</div>}
          <div style={{position:"absolute",bottom:-1,right:-1,width:12,height:12,borderRadius:6,background:C.gn,border:"2px solid "+C.w}} />
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:15,fontWeight:700,color:C.dk}}>{a.nome}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}><span style={{fontSize:11,color:C.or}}>{"★ "+a.rating}</span><span style={{fontSize:11,color:C.g}}>{"("+a.recensioni+")"}</span></div>
          {/* Activity indicator */}
          <div style={{marginTop:5,display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:10}}>{mi}</span>
            <span style={{fontSize:11,fontWeight:600,color:C.dk}}>{act.label}</span>
            <span style={{fontSize:10,color:C.g}}>{"· "+act.tempo}</span>
          </div>
        </div>
        <span style={{fontSize:14,color:C.ln}}>{"›"}</span>
      </div>);})}

      {/* QUIET businesses */}
      {quiete.length>0&&<div style={{fontSize:11,fontWeight:700,color:C.g,letterSpacing:.5,marginTop:8,marginBottom:6}}>
        {"TUTTO TRANQUILLO · "+quiete.length}
      </div>}
      {quiete.map(function(a){var act=ATTIVITA[a.id];return(<div key={a.id} onClick={function(){onOpen(a);}} style={{background:C.w,borderRadius:16,padding:"14px 16px",marginBottom:8,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.03)",display:"flex",gap:14,alignItems:"center",opacity:.85}}>
        <div style={{width:50,height:50,borderRadius:14,background:a.colore+"CC",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:15,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{a.logo}</span></div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:700,color:C.dk}}>{a.nome}</div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}><span style={{fontSize:11,color:C.or}}>{"★ "+a.rating}</span><span style={{fontSize:11,color:C.g}}>{act.label+" · "+act.tempo}</span></div>
        </div>
        <span style={{fontSize:14,color:C.ln}}>{"›"}</span>
      </div>);})}

      <div style={{border:"2px dashed "+C.ln,borderRadius:16,padding:"18px",textAlign:"center",cursor:"pointer"}}><span style={{fontSize:28}}>{"+"}</span><div style={{fontSize:13,fontWeight:600,color:C.g,marginTop:4}}>Aggiungi azienda</div><div style={{fontSize:11,color:C.ln,marginTop:2}}>Scansiona QR o cerca per nome</div></div>
      <PoweredBy />
    </div>
  </div>);
}

// ========== NOTIFICHE ==========
function NotificheScreen({onBack}){
  return(<div style={{background:C.bg,minHeight:"100vh"}}>
    <div style={{background:C.w,padding:"14px 16px",borderBottom:"1px solid "+C.ln}}><span onClick={onBack} style={{fontSize:15,color:C.bl,cursor:"pointer"}}>{"< Indietro"}</span><div style={{fontSize:22,fontWeight:800,color:C.dk,marginTop:10}}>Notifiche</div></div>
    <div style={{padding:"8px 16px 100px"}}>
      {NOTIFICHE.map(function(n){var az=AZ[n.az];return(<div key={n.id} style={{background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:6,display:"flex",gap:12,alignItems:"flex-start",boxShadow:"0 1px 3px rgba(0,0,0,.03)",opacity:n.letta?.7:1}}>
        <div style={{width:36,height:36,borderRadius:10,background:az.colore,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{az.logo}</span></div>
        <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:600,color:C.dk}}>{az.nome.split(" ")[0]}</span><span style={{fontSize:10,color:C.g}}>{n.t}</span></div><div style={{fontSize:13,color:C.dk,marginTop:3,lineHeight:1.4}}>{n.icon+" "+n.txt}</div></div>
        {!n.letta&&<div style={{width:8,height:8,borderRadius:4,background:C.bl,flexShrink:0,marginTop:4}}/>}
      </div>);})}
    </div>
  </div>);
}

// ========== CALENDARIO ==========
function CalendarioScreen({onBack}){
  return(<div style={{background:C.bg,minHeight:"100vh"}}>
    <div style={{background:C.w,padding:"14px 16px",borderBottom:"1px solid "+C.ln}}><span onClick={onBack} style={{fontSize:15,color:C.bl,cursor:"pointer"}}>{"< Indietro"}</span><div style={{fontSize:22,fontWeight:800,color:C.dk,marginTop:10}}>Scadenze</div><div style={{fontSize:13,color:C.g}}>{SCADENZE.length+" prossime scadenze"}</div></div>
    <div style={{padding:"12px 16px 100px"}}>
      {SCADENZE.map(function(s,i){var az=AZ[s.az];return(<div key={i} style={{display:"flex",gap:12,marginBottom:4}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:24}}>
          <div style={{width:12,height:12,borderRadius:6,background:s.c,flexShrink:0}}/>
          {i<SCADENZE.length-1&&<div style={{width:2,flex:1,background:C.ln,minHeight:30}}/>}
        </div>
        <div style={{flex:1,background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:4,boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:C.dk}}>{s.icon+" "+s.txt}</span>
          </div>
          <div style={{display:"flex",gap:6,marginTop:4,alignItems:"center"}}>
            <div style={{width:18,height:18,borderRadius:5,background:az.colore,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:7,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{az.logo}</span></div>
            <span style={{fontSize:11,color:C.g}}>{az.nome.split(" ")[0]}</span>
            <span style={{fontSize:11,fontWeight:700,color:s.c,marginLeft:"auto"}}>{s.data}</span>
          </div>
        </div>
      </div>);})}
    </div>
  </div>);
}

// ========== PROFILO ==========
function ProfiloScreen({onBack,onNav}){
  return(<div style={{background:C.bg,minHeight:"100vh"}}>
    <div style={{background:C.w,padding:"14px 16px",borderBottom:"1px solid "+C.ln}}><span onClick={onBack} style={{fontSize:15,color:C.bl,cursor:"pointer"}}>{"< Indietro"}</span></div>
    <div style={{background:C.w,padding:"20px 16px",textAlign:"center",borderBottom:"1px solid "+C.ln}}>
      <div style={{width:72,height:72,borderRadius:36,background:C.pk+"15",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:28,fontWeight:700,color:C.pk}}>AB</span></div>
      <div style={{fontSize:20,fontWeight:800,color:C.dk,marginTop:10}}>Anna Bianchi</div>
      <div style={{fontSize:13,color:C.g}}>{"Viale Europa 42, Rende (CS)"}</div>
      <div style={{fontSize:12,color:C.g,marginTop:2}}>{"anna.bianchi@email.it · +39 333 1234567"}</div>
    </div>

    {/* QR Code */}
    <div style={{margin:"12px 16px",background:C.w,borderRadius:14,padding:"16px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:700,color:C.dk,marginBottom:10}}>Il mio QR MASTRO</div>
      <div style={{width:140,height:140,margin:"0 auto",background:C.dk,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:4}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,padding:12}}>
          {Array.from({length:49}).map(function(_,i){return <div key={i} style={{width:8,height:8,borderRadius:1,background:Math.random()>.45?"#fff":"transparent"}} />;})}
        </div>
      </div>
      <div style={{fontSize:11,color:C.g,marginTop:8}}>Le aziende scansionano per aggiungerti</div>
      <div style={{fontSize:13,fontWeight:700,color:C.bl,marginTop:4,cursor:"pointer"}}>Condividi QR</div>
    </div>

    {/* Stats */}
    <div style={{padding:"0 16px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
      <div style={{background:C.w,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.dk}}>{AZ_LIST.length}</div><div style={{fontSize:10,color:C.g}}>Aziende</div></div>
      <div style={{background:C.w,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.gn}}>{"€"+REFERRAL.sconto_ottenuto}</div><div style={{fontSize:10,color:C.g}}>Risparmiato</div></div>
      <div style={{background:C.w,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.or}}>{REFERRAL.invitati}</div><div style={{fontSize:10,color:C.g}}>Invitati</div></div>
    </div>

    {/* Referral */}
    <div onClick={function(){onNav("referral");}} style={{margin:"12px 16px",background:"linear-gradient(135deg,"+C.pk+","+C.pu+")",borderRadius:14,padding:"16px",cursor:"pointer",color:"#fff"}}>
      <div style={{fontSize:15,fontWeight:800}}>{"🎁 Invita un amico"}</div>
      <div style={{fontSize:12,opacity:.9,marginTop:4}}>{"Guadagna €100 per ogni amico che usa MASTRO"}</div>
      <div style={{marginTop:8,background:"rgba(255,255,255,.2)",borderRadius:8,padding:"8px 12px",display:"inline-block"}}><span style={{fontSize:13,fontWeight:700,letterSpacing:1}}>{"Codice: "+REFERRAL.codice}</span></div>
    </div>

    {/* Menu */}
    <div style={{padding:"0 16px 100px"}}>
      {[{l:"Le mie recensioni",i:"⭐",sub:"Valuta le aziende"},{l:"Metodi di pagamento",i:"💳",sub:"Carte e conti"},{l:"Impostazioni",i:"⚙️",sub:"Privacy, notifiche"},{l:"Aiuto",i:"❓",sub:"FAQ e supporto"}].map(function(m,i){return(<div key={i} style={{background:C.w,borderRadius:12,padding:"14px",marginBottom:6,display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}><span style={{fontSize:22}}>{m.i}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:C.dk}}>{m.l}</div><div style={{fontSize:11,color:C.g}}>{m.sub}</div></div><span style={{color:C.ln}}>{"›"}</span></div>);})}
      <PoweredBy />
    </div>
  </div>);
}

// ========== REFERRAL ==========
function ReferralScreen({onBack}){
  return(<div style={{background:C.bg,minHeight:"100vh"}}>
    <div style={{background:C.w,padding:"14px 16px",borderBottom:"1px solid "+C.ln}}><span onClick={onBack} style={{fontSize:15,color:C.bl,cursor:"pointer"}}>{"< Indietro"}</span><div style={{fontSize:22,fontWeight:800,color:C.dk,marginTop:10}}>{"🎁 Invita e guadagna"}</div></div>
    <div style={{margin:"12px 16px",background:"linear-gradient(135deg,"+C.pk+","+C.pu+")",borderRadius:16,padding:"20px",color:"#fff",textAlign:"center"}}>
      <div style={{fontSize:14,opacity:.9}}>Il tuo codice</div>
      <div style={{fontSize:28,fontWeight:800,letterSpacing:2,marginTop:4}}>{REFERRAL.codice}</div>
      <div style={{fontSize:12,opacity:.8,marginTop:8}}>€100 di sconto per te e per chi inviti</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
        <button style={{padding:"8px 20px",borderRadius:20,border:"none",background:"rgba(255,255,255,.25)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>{"📋 Copia"}</button>
        <button style={{padding:"8px 20px",borderRadius:20,border:"none",background:"#fff",color:C.pk,fontSize:12,fontWeight:600,cursor:"pointer"}}>{"📤 Condividi"}</button>
      </div>
    </div>
    <div style={{padding:"0 16px"}}>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{flex:1,background:C.w,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:C.dk}}>{REFERRAL.invitati}</div><div style={{fontSize:10,color:C.g}}>Invitati</div></div>
        <div style={{flex:1,background:C.w,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:C.gn}}>{"€"+REFERRAL.sconto_ottenuto}</div><div style={{fontSize:10,color:C.g}}>Guadagnato</div></div>
        <div style={{flex:1,background:C.w,borderRadius:12,padding:"12px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:C.or}}>{"€"+REFERRAL.sconto_dato}</div><div style={{fontSize:10,color:C.g}}>Regalato</div></div>
      </div>
      <div style={{fontSize:13,fontWeight:700,color:C.dk,marginBottom:8}}>I tuoi inviti</div>
      {REFERRAL.lista.map(function(r,i){return(<div key={i} style={{background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:18,background:C.lg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600,color:C.dk}}>{r.nome.charAt(0)}</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.dk}}>{r.nome}</div><div style={{fontSize:11,color:C.g}}>{"via "+AZ[r.az].nome.split(" ")[0]}</div></div>
        <div style={{textAlign:"right"}}><span style={{fontSize:9,fontWeight:700,color:r.stato==="completato"?C.gn:C.or,background:(r.stato==="completato"?C.gn:C.or)+"12",padding:"2px 8px",borderRadius:6}}>{r.stato}</span><div style={{fontSize:11,fontWeight:700,color:C.gn,marginTop:3}}>{"€"+r.sconto}</div></div>
      </div>);})}
    </div>
  </div>);
}

// ========== AZIENDA DETAIL ==========
function AziendaDetail({azienda,onBack}){
  var _t=useState("home");var tab=_t[0];var setTab=_t[1];
  var _rev=useState(0);var revStars=_rev[0];var setRevStars=_rev[1];
  var a=azienda;

  return(<div style={{background:C.bg,minHeight:"100vh"}}>
    <div style={{background:C.w,padding:"14px 16px 0",borderBottom:"1px solid "+C.ln}}>
      <span onClick={onBack} style={{fontSize:15,color:C.bl,cursor:"pointer"}}>{"< Le mie aziende"}</span>
      <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12}}>
        <div style={{width:48,height:48,borderRadius:14,background:a.colore,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{a.logo}</span></div>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,color:C.dk}}>{a.nome}</div>
          <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,color:C.or}}>{"★ "+a.rating}</span><span style={{fontSize:11,color:C.g}}>{"("+a.recensioni+" recensioni)"}</span></div>
        </div>
      </div>
      <div style={{display:"flex",marginTop:14,overflowX:"auto"}}>
        {["home","docs","chat","pagamenti","storico","help"].map(function(t){var active=tab===t;var labels={home:"Home",docs:"Documenti",chat:"Messaggi",pagamenti:"€ Pag.",storico:"Storico",help:"Assistenza"};return(<div key={t} onClick={function(){setTab(t);}} style={{padding:"10px 12px",cursor:"pointer",borderBottom:active?"2px solid "+a.colore:"2px solid transparent",fontSize:11,fontWeight:active?700:400,color:active?a.colore:C.g,whiteSpace:"nowrap",flexShrink:0}}>{labels[t]}</div>);})}
      </div>
    </div>

    {/* HOME */}
    {tab==="home"&&(<div style={{padding:"12px 16px 100px"}}>
      {a.stato&&(<div style={{background:C.w,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,.05)",marginBottom:12}}>
        <div style={{background:"linear-gradient(135deg,"+a.badge.c+","+a.badge.c+"CC)",padding:"16px 18px",color:"#fff"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:10,fontWeight:600,opacity:.8}}>STATO</div><div style={{fontSize:18,fontWeight:800,marginTop:2}}>{a.stato.icon+" "+a.stato.fase}</div></div>
            {a.stato.giorni>0&&<div style={{textAlign:"right"}}><div style={{background:"rgba(255,255,255,.2)",padding:"6px 12px",borderRadius:10}}><div style={{fontSize:20,fontWeight:800,lineHeight:1}}>{a.stato.giorni}</div><div style={{fontSize:8,fontWeight:600}}>GIORNI</div></div></div>}
          </div>
          {a.fasiData.length>0&&<div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>{a.fasiData.map(function(f,i){return <div key={i} style={{width:7,height:7,borderRadius:4,background:i<=a.faseIdx?"#fff":"rgba(255,255,255,.3)"}} />;})}</div>}
        </div>
        {a.stato.consegna&&<div style={{padding:"10px 18px",fontSize:12,color:C.g}}><span style={{fontWeight:600,color:C.dk}}>{a.stato.consegna}</span>{" · "+a.nome.split(" ")[0]}</div>}
      </div>)}

      {/* Timeline */}
      {a.fasiData.length>0&&<div style={{marginBottom:12}}>
        {a.fasiData.map(function(s,i){var isCurr=i===a.faseIdx;var isLast=i===a.fasiData.length-1;return(<div key={i} style={{display:"flex",gap:10}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:22}}>
            <div style={{width:isCurr?22:14,height:isCurr?22:14,borderRadius:isCurr?7:7,background:s.done?s.c:isCurr?s.c:C.ln,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isCurr?11:7,boxShadow:isCurr?"0 0 0 3px "+s.c+"25":"none"}}>{(s.done||isCurr)?s.i:""}</div>
            {!isLast&&<div style={{width:2,flex:1,background:s.done?s.c:C.ln,minHeight:16}} />}
          </div>
          <div style={{flex:1,paddingBottom:10}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:600,color:s.done||isCurr?C.dk:C.g}}>{s.l}</span><span style={{fontSize:10,color:C.g}}>{s.data}</span></div>{(s.done||isCurr)&&s.nota&&<div style={{fontSize:11,color:C.g,marginTop:2}}>{s.nota}</div>}</div>
        </div>);})}
      </div>}

      {/* Dettagli */}
      {a.dettagli.length>0&&<div>
        <div style={{fontSize:14,fontWeight:700,color:C.dk,marginBottom:6}}>{a.cat==="serramenti"?"I miei serramenti":a.cat==="meccanico"?"Il mio veicolo":a.cat==="idraulico"?"I miei impianti":"Dettagli"}</div>
        {a.dettagli.map(function(d,i){return(<div key={i} style={{background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}>
          <div><div style={{fontSize:14,fontWeight:600,color:C.dk}}>{d.v}</div><div style={{fontSize:11,color:C.g}}>{[d.t,d.col].filter(Boolean).join(" · ")}</div></div>
          <div style={{textAlign:"right"}}>{d.dim&&<div style={{fontSize:12,fontWeight:600,color:C.dk}}>{d.dim}</div>}{d.uw&&<div style={{fontSize:10,color:C.gn,fontWeight:600}}>{"Uw "+d.uw}</div>}</div>
        </div>);})}
      </div>}

      {!a.stato&&a.dettagli.length===0&&<div style={{textAlign:"center",padding:"30px"}}><span style={{fontSize:40}}>{"✅"}</span><div style={{fontSize:14,color:C.g,marginTop:8}}>Nessun lavoro in corso</div></div>}
    </div>)}

    {/* DOCS */}
    {tab==="docs"&&(<div style={{padding:"12px 16px 100px"}}>
      {a.docs.map(function(d,i){var sc=d.stato==="firmato"||d.stato==="approvato"||d.stato==="valida"||d.stato==="valido"||d.stato==="attivo"||d.stato==="attiva"?C.bl:d.stato==="pagata"?C.gn:d.stato==="da emettere"||d.stato==="da pagare"?C.or:d.stato==="da compilare"||d.stato==="in attesa"||d.stato==="in corso"?C.pu:d.stato==="scaduta"||d.stato&&d.stato.indexOf("scadenza")>=0?C.rd:C.g;return(<div key={i} style={{background:C.w,borderRadius:12,padding:"12px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}><span style={{fontSize:24}}>{d.icon}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.dk}}>{d.nome}</div><div style={{fontSize:11,color:C.g,marginTop:2}}>{d.data}</div></div>{d.stato&&<span style={{fontSize:9,fontWeight:700,color:sc,background:sc+"12",padding:"2px 8px",borderRadius:6}}>{d.stato}</span>}</div>);})}
    </div>)}

    {/* CHAT */}
    {tab==="chat"&&(<div style={{display:"flex",flexDirection:"column",minHeight:"calc(100vh - 160px)"}}>
      <div style={{flex:1,padding:"12px 16px",background:"#F0F1F3"}}>
        {a.chat.map(function(m){var out=m.dir==="out";return(<div key={m.id} style={{display:"flex",justifyContent:out?"flex-end":"flex-start",marginBottom:8}}><div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:out?"16px 16px 4px 16px":"16px 16px 16px 4px",background:out?C.dk:C.w,color:out?"#fff":C.dk,boxShadow:"0 .5px 2px rgba(0,0,0,.06)"}}>{!out&&<div style={{fontSize:11,fontWeight:700,color:a.colore,marginBottom:3}}>{m.da}</div>}<div style={{fontSize:14,lineHeight:1.5}}>{m.txt}</div><div style={{fontSize:10,color:out?"rgba(255,255,255,.5)":C.g,marginTop:3,textAlign:"right"}}>{m.t}</div></div></div>);})}
      </div>
      <div style={{background:C.w,borderTop:"1px solid "+C.ln,padding:"10px 16px 20px"}}>
        <div style={{display:"flex",gap:6}}><div style={{flex:1,background:C.lg,borderRadius:22,padding:"10px 16px",display:"flex",alignItems:"center",gap:6}}><span>{"📎"}</span><input placeholder="Messaggio..." style={{border:"none",outline:"none",fontSize:14,flex:1,fontFamily:"inherit",background:"transparent"}} /><span>{"📷"}</span></div><button style={{width:44,height:44,borderRadius:10,border:"none",background:a.colore,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"Georgia,serif"}}>{a.logo.charAt(0)}</span></button></div>
        <div style={{textAlign:"center",marginTop:4}}><span style={{fontSize:8,color:C.gn,fontWeight:700,background:C.gn+"12",padding:"1px 8px",borderRadius:10}}>MESSAGGI GRATUITI VIA MASTRO</span></div>
      </div>
    </div>)}

    {/* PAGAMENTI */}
    {tab==="pagamenti"&&(<div style={{padding:"12px 16px 100px"}}>
      {a.pagamenti.totale>0?<div>
        <div style={{background:C.w,borderRadius:14,padding:"14px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{textAlign:"center",flex:1}}><div style={{fontSize:9,color:C.g}}>Totale</div><div style={{fontSize:16,fontWeight:800,color:C.dk}}>{"€"+a.pagamenti.totale.toLocaleString()}</div></div>
            <div style={{textAlign:"center",flex:1}}><div style={{fontSize:9,color:C.g}}>Pagato</div><div style={{fontSize:16,fontWeight:800,color:C.gn}}>{"€"+a.pagamenti.pagato.toLocaleString()}</div></div>
            <div style={{textAlign:"center",flex:1}}><div style={{fontSize:9,color:C.g}}>Saldo</div><div style={{fontSize:16,fontWeight:800,color:C.or}}>{"€"+a.pagamenti.saldo.toLocaleString()}</div></div>
          </div>
          <div style={{marginTop:10,background:C.lg,borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:Math.round(a.pagamenti.pagato/a.pagamenti.totale*100)+"%",height:"100%",borderRadius:4,background:C.gn}} /></div>
          <div style={{fontSize:10,color:C.g,marginTop:4,textAlign:"right"}}>{Math.round(a.pagamenti.pagato/a.pagamenti.totale*100)+"% pagato"}</div>
        </div>
        <div style={{fontSize:14,fontWeight:700,color:C.dk,marginBottom:8}}>Rate</div>
        {a.pagamenti.rate.map(function(r,i){var sc=r.stato==="pagata"?C.gn:C.or;return(<div key={i} style={{background:C.w,borderRadius:12,padding:"14px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}>
          <div><div style={{fontSize:14,fontWeight:600,color:C.dk}}>{r.desc}</div><div style={{fontSize:11,color:C.g,marginTop:2}}>{r.data}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,color:C.dk}}>{"€"+r.importo.toLocaleString()}</div><span style={{fontSize:9,fontWeight:700,color:sc,background:sc+"12",padding:"2px 8px",borderRadius:6}}>{r.stato}</span></div>
        </div>);})}
      </div>:<div style={{textAlign:"center",padding:"30px"}}><span style={{fontSize:40}}>{"💳"}</span><div style={{fontSize:14,color:C.g,marginTop:8}}>Nessun pagamento in sospeso</div></div>}
    </div>)}

    {/* STORICO */}
    {tab==="storico"&&(<div style={{padding:"12px 16px 100px"}}>
      {a.storico.length>0?a.storico.map(function(s,i){return(<div key={i} style={{background:C.w,borderRadius:12,padding:"14px",marginBottom:8,boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:14,fontWeight:700,color:C.dk}}>{s.lavoro}</div><div style={{fontSize:12,color:C.g,marginTop:2}}>{s.data}</div></div>
          <div style={{fontSize:15,fontWeight:800,color:C.dk}}>{"€"+s.importo.toLocaleString()}</div>
        </div>
        {/* Star rating */}
        <div style={{marginTop:8,display:"flex",gap:2}}>
          {[1,2,3,4,5].map(function(star){return <span key={star} style={{fontSize:16,color:star<=s.voto?C.or:C.ln}}>{"★"}</span>;})}
          <span style={{fontSize:11,color:C.g,marginLeft:4}}>{s.voto+"/5"}</span>
        </div>
      </div>);}):
      <div style={{textAlign:"center",padding:"30px"}}><span style={{fontSize:40}}>{"📜"}</span><div style={{fontSize:14,color:C.g,marginTop:8}}>Nessun lavoro passato</div></div>}

      {/* Leave a review */}
      <div style={{background:C.w,borderRadius:14,padding:"16px",marginTop:8,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.dk,marginBottom:8}}>{"Lascia una recensione"}</div>
        <div style={{display:"flex",gap:4,marginBottom:10}}>
          {[1,2,3,4,5].map(function(star){return <span key={star} onClick={function(){setRevStars(star);}} style={{fontSize:28,cursor:"pointer",color:star<=revStars?C.or:C.ln}}>{"★"}</span>;})}
        </div>
        <textarea placeholder="Come ti sei trovato/a?" rows={2} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+C.ln,fontSize:14,fontFamily:"inherit",resize:"none",background:C.lg}} />
        <button style={{width:"100%",marginTop:8,padding:"12px",borderRadius:12,border:"none",background:a.colore,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",opacity:revStars>0?1:.4}}>{"Pubblica recensione"}</button>
      </div>
    </div>)}

    {/* HELP */}
    {tab==="help"&&(<div style={{padding:"16px 16px 100px"}}>
      {/* Quick contact */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{flex:1,background:C.w,borderRadius:12,padding:"14px",textAlign:"center",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}><span style={{fontSize:22}}>{"📞"}</span><div style={{fontSize:11,fontWeight:600,color:C.dk,marginTop:4}}>Chiama</div></div>
        <div style={{flex:1,background:C.w,borderRadius:12,padding:"14px",textAlign:"center",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}><span style={{fontSize:22}}>{"💬"}</span><div style={{fontSize:11,fontWeight:600,color:C.dk,marginTop:4}}>Chat</div></div>
        <div style={{flex:1,background:C.w,borderRadius:12,padding:"14px",textAlign:"center",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.03)"}}><span style={{fontSize:22}}>{"📍"}</span><div style={{fontSize:11,fontWeight:600,color:C.dk,marginTop:4}}>Posizione</div></div>
      </div>
      {/* Form */}
      <div style={{background:C.w,borderRadius:14,padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <div style={{fontSize:15,fontWeight:700,color:C.dk,marginBottom:12}}>Richiedi intervento</div>
        <div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:C.g,marginBottom:4}}>PROBLEMA</div><select style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+C.ln,fontSize:14,fontFamily:"inherit",background:C.lg}}><option>Seleziona...</option>{a.problemi.map(function(p,i){return <option key={i}>{p}</option>;})}</select></div>
        <div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:C.g,marginBottom:4}}>DESCRIZIONE</div><textarea placeholder="Descrivi il problema..." rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid "+C.ln,fontSize:14,fontFamily:"inherit",resize:"none",background:C.lg}} /></div>
        <div style={{border:"2px dashed "+C.ln,borderRadius:12,padding:"18px",textAlign:"center",cursor:"pointer",marginBottom:16}}><span style={{fontSize:28}}>{"📸"}</span><div style={{fontSize:12,color:C.g,marginTop:4}}>Aggiungi foto</div></div>
        <button style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:a.colore,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>{"Invia richiesta"}</button>
      </div>
    </div>)}
  </div>);
}

// ========== MAIN ==========
export default function App(){
  var _s=useState("home");var scr=_s[0];var setScr=_s[1];
  var _a=useState(null);var selAz=_a[0];var setSelAz=_a[1];

  var go=function(s){setScr(s);};
  var back=function(){setScr("home");setSelAz(null);};

  if(scr==="detail"&&selAz)return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",background:C.bg}}><AziendaDetail azienda={selAz} onBack={back} /></div>);
  if(scr==="notifiche")return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",background:C.bg}}><NotificheScreen onBack={back} /></div>);
  if(scr==="calendario")return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",background:C.bg}}><CalendarioScreen onBack={back} /></div>);
  if(scr==="profilo")return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",background:C.bg}}><ProfiloScreen onBack={back} onNav={go} /></div>);
  if(scr==="referral")return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",background:C.bg}}><ReferralScreen onBack={back} /></div>);

  return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",background:C.bg}}>
    <HomeScreen onNav={go} onOpen={function(a){setSelAz(a);setScr("detail");}} />
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.w,borderTop:"1px solid "+C.ln,display:"flex",padding:"6px 0 22px",zIndex:100}}>
      {[{id:"home",i:"🏠",l:"Home"},{id:"calendario",i:"📅",l:"Scadenze"},{id:"notifiche",i:"🔔",l:"Notifiche"},{id:"profilo",i:"👤",l:"Profilo"}].map(function(item){var active=scr===item.id||scr==="home"&&item.id==="home";return(<div key={item.id} onClick={function(){go(item.id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer"}}><span style={{fontSize:22}}>{item.i}</span><span style={{fontSize:10,fontWeight:active?600:400,color:active?C.bl:C.g}}>{item.l}</span></div>);})}
    </div>
  </div>);
}
