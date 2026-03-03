// ═══════════════════════════════════════════════════════════════════════
// MASTRO ERP — CATALOGO COMPLETO v3.0
// Struttura prodotti GENERICA — ogni azienda personalizza con i suoi fornitori
// 12 settori, ~200 opzioni di default, campi misura completi
// ═══════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────
// SETTORI v3 — Lista completa con icone e descrizioni
// ─────────────────────────────────────────────────────────────────────

export const SETTORI_V3 = [
  { id: "serramenti",   nome: "Finestre e Serramenti",        icon: "🪟", desc: "Finestre, balconi, scorrevoli, alzanti, fissi",                     tipN: 27, attivo: true },
  { id: "porte",        nome: "Porte",                        icon: "🚪", desc: "Porte interne, blindate, scorrevoli, sezionali",                   tipN: 8,  attivo: true },
  { id: "persiane",     nome: "Persiane e Scuri",             icon: "🫒", desc: "Persiane in alluminio, legno, PVC, scuri",                        tipN: 6,  attivo: true },
  { id: "tapparelle",   nome: "Tapparelle e Avvolgibili",     icon: "⬇️", desc: "Tapparelle, cassonetti, motorizzazioni",                          tipN: 7,  attivo: true },
  { id: "zanzariere",   nome: "Zanzariere",                   icon: "🦟", desc: "Laterali, verticali, plissé, battenti, magnetiche",               tipN: 7,  attivo: true },
  { id: "tendesole",    nome: "Tende da Sole",                icon: "☀️", desc: "Bracci, caduta, cappottine, pergole, ZIP, veneziane",              tipN: 9,  attivo: false },
  { id: "tendeinterne", nome: "Tende da Interno",             icon: "🪞", desc: "Rullo, pacchetto, veneziane, plissé, bastoni, binari",            tipN: 10, attivo: false },
  { id: "boxdoccia",    nome: "Box Doccia",                   icon: "🚿", desc: "Nicchia, angolare, walk-in, semicircolare, vasca",                tipN: 7,  attivo: false },
  { id: "cancelli",     nome: "Cancelli e Recinzioni",        icon: "🚧", desc: "Battenti, scorrevoli, recinzioni, ringhiere, automazioni",        tipN: 6,  attivo: false },
  { id: "ufficio",      nome: "Arredamento Ufficio",          icon: "🏢", desc: "Pareti divisorie, scrivanie, sedute, armadi, reception",          tipN: 8,  attivo: false },
  { id: "arredocasa",   nome: "Arredamento Casa",             icon: "🛋", desc: "Soggiorni, camere, armadi, librerie, complementi",                tipN: 12, attivo: false },
  { id: "complementi",  nome: "Complementi e Outdoor",        icon: "🏠", desc: "Mobili funzionali, bagno, lavanderia, ingresso, outdoor",         tipN: 10, attivo: false },
];


// ═══════════════════════════════════════════════════════════════════════
// MANIGLIERIA — Campi nel vano FINESTRA + PORTA
// ═══════════════════════════════════════════════════════════════════════

// Martelline per finestre
export const MART_TIPO = [
  { id: "mt01", code: "Martellina DK standard" },
  { id: "mt02", code: "Martellina DK con Secustik" },
  { id: "mt03", code: "Martellina DK con chiave" },
  { id: "mt04", code: "Martellina DK con pulsante" },
  { id: "mt05", code: "Martellina DK doppia sicurezza" },
  { id: "mt06", code: "Martellina Kompakt (senza rosetta)" },
  { id: "mt07", code: "Cremonese" },
  { id: "mt08", code: "eManiglia smart" },
  { id: "mt09", code: "Maniglia alzante scorrevole" },
];

export const MART_SERIE_INIT = [
  { id: "ms01", code: "Paris",       materiale: "Ottone" },
  { id: "ms02", code: "Tokyo",       materiale: "Alluminio" },
  { id: "ms03", code: "Amsterdam",   materiale: "Acciaio inox" },
  { id: "ms04", code: "Atlanta",     materiale: "Alluminio" },
  { id: "ms05", code: "Luxembourg",  materiale: "Alluminio" },
  { id: "ms06", code: "New York",    materiale: "Alluminio" },
  { id: "ms07", code: "Toulon",      materiale: "Alluminio" },
  { id: "ms08", code: "Bergamo",     materiale: "Ottone" },
  { id: "ms09", code: "Phoenix",     materiale: "Ottone" },
  { id: "ms10", code: "Santiago",    materiale: "Alluminio" },
  { id: "ms11", code: "Genova",      materiale: "Ottone" },
  { id: "ms12", code: "Bruxelles",   materiale: "Ottone" },
  { id: "ms13", code: "Roissy",      materiale: "Alluminio" },
];

export const MART_MATERIALE = [
  { id: "mm01", code: "Alluminio" },
  { id: "mm02", code: "Acciaio inox" },
  { id: "mm03", code: "Ottone" },
  { id: "mm04", code: "Resina" },
  { id: "mm05", code: "Zinco pressofuso" },
];

export const MART_FINITURA = [
  { id: "mf01", code: "F1 Argento naturale" },
  { id: "mf02", code: "F9 Acciaio satinato" },
  { id: "mf03", code: "F96-1-R Nero satinato Resista" },
  { id: "mf04", code: "F4 Bronzo antico" },
  { id: "mf05", code: "Cromo lucido" },
  { id: "mf06", code: "Cromo satinato" },
  { id: "mf07", code: "Bianco RAL 9016" },
  { id: "mf08", code: "Nero RAL 9005" },
  { id: "mf09", code: "Titanio" },
  { id: "mf10", code: "Oro lucido" },
];

export const MART_ROSETTA = [
  { id: "mr01", code: "Ovale" },
  { id: "mr02", code: "Tonda" },
  { id: "mr03", code: "Rettangolare" },
  { id: "mr04", code: "Quadrata" },
  { id: "mr05", code: "Kompakt (senza)" },
];

export const MART_SICUREZZA = [
  { id: "mx01", code: "Standard" },
  { id: "mx02", code: "Secustik (bloccaggio base)" },
  { id: "mx03", code: "SecuForte (disaccoppiamento)" },
  { id: "mx04", code: "SecuDuplex (doppia)" },
  { id: "mx05", code: "Con chiave" },
  { id: "mx06", code: "Con pulsante" },
];

// Guarniture per porte
export const GUAR_TIPO = [
  { id: "gt01", code: "Guarnitura porta interna (su rosetta)" },
  { id: "gt02", code: "Guarnitura porta interna (su placca)" },
  { id: "gt03", code: "Guarnitura porta ingresso (sicurezza)" },
  { id: "gt04", code: "Maniglione diritto" },
  { id: "gt05", code: "Maniglione semicerchio" },
  { id: "gt06", code: "Maniglia scorrevole (kit)" },
  { id: "gt07", code: "Maniglia incasso scorrevole" },
  { id: "gt08", code: "Maniglia tagliafuoco" },
  { id: "gt09", code: "Compact System (maniglia + serratura)" },
  { id: "gt10", code: "Pomolo" },
];

export const GUAR_SERIE_INIT = [
  { id: "gs01", code: "Paris",     per: "interna" },
  { id: "gs02", code: "Tokyo",     per: "interna" },
  { id: "gs03", code: "Amsterdam", per: "interna" },
  { id: "gs04", code: "Atlanta",   per: "interna" },
  { id: "gs05", code: "Milano",    per: "interna" },
  { id: "gs06", code: "Maribor",   per: "interna" },
  { id: "gs07", code: "Brindisi",  per: "interna" },
  { id: "gs08", code: "Seattle",   per: "interna" },
  { id: "gs09", code: "Dublin",    per: "interna" },
  { id: "gs10", code: "Houston",   per: "interna" },
  { id: "gs11", code: "Dallas",    per: "interna" },
  { id: "gs12", code: "Hamburg",   per: "interna" },
  { id: "gs13", code: "Milos",     per: "interna" },
  { id: "gs14", code: "Baden",     per: "interna" },
  { id: "gs15", code: "Singapore", per: "maniglione" },
  { id: "gs16", code: "Valencia",  per: "maniglione" },
  { id: "gs17", code: "Utrecht",   per: "interna" },
  { id: "gs18", code: "Stockholm FS", per: "tagliafuoco" },
  { id: "gs19", code: "Paris FS",     per: "tagliafuoco" },
];

export const GUAR_BOCCHETTA = [
  { id: "gb01", code: "Tonda Ø52" },
  { id: "gb02", code: "Tonda Ø28 mini" },
  { id: "gb03", code: "Quadrata" },
  { id: "gb04", code: "Ovale" },
  { id: "gb05", code: "Doppia mappa" },
  { id: "gb06", code: "WC nottolino" },
  { id: "gb07", code: "Cieca (senza foro)" },
];


// ═══════════════════════════════════════════════════════════════════════
// SERRATURE — Campi nel vano PORTA
// ═══════════════════════════════════════════════════════════════════════

export const SERR_TIPO = [
  { id: "st01", code: "Da infilare standard",      per: "legno" },
  { id: "st02", code: "Da infilare Heavy Duty",    per: "ferro" },
  { id: "st03", code: "Da infilare 4 mandate",     per: "blindata" },
  { id: "st04", code: "Da applicare",              per: "legno" },
  { id: "st05", code: "Ferroglietto",              per: "legno" },
  { id: "st06", code: "Multipunto",                per: "alluminio" },
  { id: "st07", code: "Elettrica",                 per: "cancello" },
  { id: "st08", code: "Elettroserratura infilare", per: "condominio" },
  { id: "st09", code: "Smart / Motorizzata",       per: "blindata" },
  { id: "st10", code: "Antipanico (maniglione)",   per: "emergenza" },
];

export const SERR_CILINDRO = [
  { id: "sc01", code: "Cilindro europeo standard" },
  { id: "sc02", code: "Cilindro europeo alta sicurezza" },
  { id: "sc03", code: "Cilindro europeo per pomolo" },
  { id: "sc04", code: "Cilindro fisso (doppia mappa)" },
  { id: "sc05", code: "Cilindro regolabile" },
  { id: "sc06", code: "Cilindro elettronico" },
  { id: "sc07", code: "Senza cilindro (antipanico)" },
];

export const SERR_MISURA_CIL = [
  { id: "scm01", code: "25+25 (50mm)" },
  { id: "scm02", code: "30+30 (60mm)" },
  { id: "scm03", code: "30+40 (70mm)" },
  { id: "scm04", code: "30+50 (80mm)" },
  { id: "scm05", code: "35+35 (70mm)" },
  { id: "scm06", code: "40+40 (80mm)" },
  { id: "scm07", code: "40+50 (90mm)" },
  { id: "scm08", code: "45+50 (95mm)" },
  { id: "scm09", code: "50+50 (100mm)" },
  { id: "scm10", code: "Su misura" },
];

export const SERR_ENTRATA = [
  { id: "se01", code: "40 mm" },
  { id: "se02", code: "50 mm" },
  { id: "se03", code: "60 mm" },
  { id: "se04", code: "70 mm" },
  { id: "se05", code: "80 mm" },
  { id: "se06", code: "Regolabile 50-80" },
];

export const SERR_FINITURA = [
  { id: "sf01", code: "Verniciata" },
  { id: "sf02", code: "Cromata" },
  { id: "sf03", code: "Inox satinato" },
  { id: "sf04", code: "Ottone" },
  { id: "sf05", code: "Nero" },
];

export const SERR_ANTIPANICO = [
  { id: "sa01", code: "Nessuno" },
  { id: "sa02", code: "Maniglione a barra orizzontale (push)" },
  { id: "sa03", code: "Maniglione a leva (touch)" },
  { id: "sa04", code: "Maniglione con serratura" },
  { id: "sa05", code: "Predisposizione" },
];

export const SERR_CHIUDIPORTA = [
  { id: "scp01", code: "Nessuno" },
  { id: "scp02", code: "Chiudiporta a braccio" },
  { id: "scp03", code: "Chiudiporta a slitta (incasso)" },
  { id: "scp04", code: "Chiudiporta a pavimento" },
  { id: "scp05", code: "Chiudiporta elettromagnetico" },
];


// ═══════════════════════════════════════════════════════════════════════
// PORTE INTERNE — Scheda misura completa
// ═══════════════════════════════════════════════════════════════════════

export const PORTE_MATERIALE = [
  { id: "pm01", code: "Legno massello" },
  { id: "pm02", code: "Legno impiallacciato" },
  { id: "pm03", code: "Laccato opaco" },
  { id: "pm04", code: "Laccato lucido" },
  { id: "pm05", code: "Laminato CPL" },
  { id: "pm06", code: "Laminato HPL" },
  { id: "pm07", code: "Vetro temperato" },
  { id: "pm08", code: "Blindata" },
  { id: "pm09", code: "Metallica REI" },
  { id: "pm10", code: "Light (tamburata)" },
  { id: "pm11", code: "EI tagliafuoco" },
];

export const PORTE_APERTURA = [
  { id: "pa01", code: "Battente singola",             cat: "battente" },
  { id: "pa02", code: "Battente doppia",              cat: "battente" },
  { id: "pa03", code: "Ventola singola",              cat: "battente" },
  { id: "pa04", code: "Libro simmetrica",             cat: "libro" },
  { id: "pa05", code: "Libro asimmetrica",            cat: "libro" },
  { id: "pa06", code: "Roto singola",                 cat: "roto" },
  { id: "pa07", code: "Compack 180",                  cat: "roto" },
  { id: "pa08", code: "Scomparsa singola",            cat: "scomparsa" },
  { id: "pa09", code: "Scomparsa doppia",             cat: "scomparsa" },
  { id: "pa10", code: "Esterno muro singola",         cat: "esterno" },
  { id: "pa11", code: "Esterno muro doppia",          cat: "esterno" },
  { id: "pa12", code: "Sovrapposta 2 ante",           cat: "esterno" },
  { id: "pa13", code: "Sovrapposta 4 ante",           cat: "esterno" },
  { id: "pa14", code: "Filomuro battente",            cat: "filomuro" },
  { id: "pa15", code: "Filomuro scorrevole",          cat: "filomuro" },
  { id: "pa16", code: "Tipo armadio",                 cat: "armadio" },
];

export const PORTE_FINITURA = [
  { id: "pf01", code: "Liscio" },
  { id: "pf02", code: "Pantografato" },
  { id: "pf03", code: "Inciso" },
  { id: "pf04", code: "Con vetro" },
  { id: "pf05", code: "Bugnato" },
  { id: "pf06", code: "Dogato orizzontale" },
  { id: "pf07", code: "Dogato verticale" },
  { id: "pf08", code: "Specchiato" },
];

export const PORTE_VETRO_INS = [
  { id: "pvi01", code: "Trasparente" },
  { id: "pvi02", code: "Satinato" },
  { id: "pvi03", code: "Decorato" },
  { id: "pvi04", code: "Laccato" },
  { id: "pvi05", code: "Temperato" },
];

export const PORTE_COLORE = [
  { id: "pc01", code: "Bianco laccato" },
  { id: "pc02", code: "Bianco matrix" },
  { id: "pc03", code: "Grigio RAL 7035" },
  { id: "pc04", code: "Grigio RAL 7016" },
  { id: "pc05", code: "Noce nazionale" },
  { id: "pc06", code: "Noce canaletto" },
  { id: "pc07", code: "Rovere sbiancato" },
  { id: "pc08", code: "Rovere naturale" },
  { id: "pc09", code: "Rovere grigio" },
  { id: "pc10", code: "Wengé" },
  { id: "pc11", code: "Olmo" },
  { id: "pc12", code: "Frassino" },
  { id: "pc13", code: "RAL personalizzato" },
  { id: "pc14", code: "NCS personalizzato" },
];

export const PORTE_SENSO = [
  { id: "ps01", code: "DX spinta" },
  { id: "ps02", code: "DX tirare" },
  { id: "ps03", code: "SX spinta" },
  { id: "ps04", code: "SX tirare" },
];

export const PORTE_CONTROTELAIO = [
  { id: "pct01", code: "Standard legno" },
  { id: "pct02", code: "Metallo zincato" },
  { id: "pct03", code: "Scomparsa (Scrigno/Eclisse)" },
  { id: "pct04", code: "Filomuro alluminio" },
  { id: "pct05", code: "Esistente (adattamento)" },
  { id: "pct06", code: "Da definire" },
];

export const PORTE_CLASSE_EI = [
  { id: "pei01", code: "Non classificata" },
  { id: "pei02", code: "EI 30" },
  { id: "pei03", code: "EI 60" },
  { id: "pei04", code: "EI 90" },
  { id: "pei05", code: "EI 120" },
];

export const PORTE_CLASSE_RC = [
  { id: "prc01", code: "Non classificata" },
  { id: "prc02", code: "RC 2" },
  { id: "prc03", code: "RC 3" },
  { id: "prc04", code: "RC 4" },
];


// ═══════════════════════════════════════════════════════════════════════
// CASSONETTI — Scheda misura arricchita
// ═══════════════════════════════════════════════════════════════════════

export const CASS_MODELLI_INIT = [
  { id: "cm01", code: "IFC 25×25",    hStd: 250, pStd: 250, tipo: "Standard" },
  { id: "cm02", code: "IFC 30×25",    hStd: 300, pStd: 250, tipo: "Standard" },
  { id: "cm03", code: "IFC 30×30",    hStd: 300, pStd: 300, tipo: "Standard" },
  { id: "cm04", code: "IFC 35×30",    hStd: 350, pStd: 300, tipo: "Standard" },
  { id: "cm05", code: "IFM Modulare", hStd: 0,   pStd: 0,   tipo: "Modulare" },
  { id: "cm06", code: "IFCL Ristrutt.",hStd: 0,  pStd: 0,   tipo: "Ristrutturazione" },
  { id: "cm07", code: "ELIO",         hStd: 0,   pStd: 0,   tipo: "Monoblocco" },
  { id: "cm08", code: "ELIO VP",      hStd: 0,   pStd: 0,   tipo: "Monoblocco" },
  { id: "cm09", code: "TF",           hStd: 0,   pStd: 0,   tipo: "Taglio termico" },
  { id: "cm10", code: "KALOS",        hStd: 0,   pStd: 0,   tipo: "Design" },
  { id: "cm11", code: "KALOS NOLAM",  hStd: 0,   pStd: 0,   tipo: "Design" },
];

export const CASS_ISPEZIONE = [
  { id: "ci01", code: "Frontale" },
  { id: "ci02", code: "Soffitto" },
  { id: "ci03", code: "Laterale" },
];

export const CASS_TAPPO = [
  { id: "ct01", code: "Sovrapposto" },
  { id: "ct02", code: "Filo muro" },
  { id: "ct03", code: "Veletta" },
  { id: "ct04", code: "Senza tappo" },
];

export const CASS_SPALLE = [
  { id: "csp01", code: "Guida incassata" },
  { id: "csp02", code: "Guida sporgente" },
  { id: "csp03", code: "Senza spalle" },
];


// ═══════════════════════════════════════════════════════════════════════
// ZANZARIERE — Scheda misura arricchita
// ═══════════════════════════════════════════════════════════════════════

export const ZANZ_CATEGORIE = [
  { id: "zc01", code: "Avvolgente senza bottone",  sigla: "avv_nb" },
  { id: "zc02", code: "Avvolgente con bottone",    sigla: "avv_cb" },
  { id: "zc03", code: "Plissettata",               sigla: "plisse" },
  { id: "zc04", code: "ZIP / Tecnica",             sigla: "zip" },
  { id: "zc05", code: "Incasso",                   sigla: "incas" },
  { id: "zc06", code: "Pannello fisso",            sigla: "pann" },
];

export const ZANZ_RETE = [
  { id: "zr01", code: "Standard",       sovrapprezzo: 0 },
  { id: "zr02", code: "Antibatterica",  sovrapprezzo: 7.20 },
  { id: "zr03", code: "Antivento",      sovrapprezzo: 0 },
  { id: "zr04", code: "Pet Screen",     sovrapprezzo: 0 },
  { id: "zr05", code: "Antipolline",    sovrapprezzo: 0 },
];

export const ZANZ_LATO = [
  { id: "zl01", code: "DX" },
  { id: "zl02", code: "SX" },
  { id: "zl03", code: "Centrale" },
  { id: "zl04", code: "Alto" },
];


// ═══════════════════════════════════════════════════════════════════════
// TENDE DA SOLE — Scheda misura completa
// ═══════════════════════════════════════════════════════════════════════

export const TDSOLE_CATEGORIE = [
  { id: "ts01", code: "A bracci estensibili",  sigla: "bracci" },
  { id: "ts02", code: "A caduta",              sigla: "caduta" },
  { id: "ts03", code: "Cappottina",            sigla: "cappott" },
  { id: "ts04", code: "Antivento / Guide",     sigla: "antiv" },
  { id: "ts05", code: "Da giardino / Gazebo",  sigla: "giard" },
  { id: "ts06", code: "Pergotenda / Pergola",  sigla: "perg" },
  { id: "ts07", code: "ZIP screen",            sigla: "zip" },
  { id: "ts08", code: "Veneziana esterna",     sigla: "venez" },
];

export const TDSOLE_MONTAGGIO = [
  { id: "tsm01", code: "Parete" },
  { id: "tsm02", code: "Soffitto" },
  { id: "tsm03", code: "A tetto" },
];

export const TDSOLE_COMANDO = [
  { id: "tsc01", code: "Manuale DX" },
  { id: "tsc02", code: "Manuale SX" },
  { id: "tsc03", code: "Motorizzata" },
  { id: "tsc04", code: "Motorizzata radio" },
  { id: "tsc05", code: "Motorizzata radio + sensore" },
];


// ═══════════════════════════════════════════════════════════════════════
// TENDE DA INTERNO — Scheda misura completa
// ═══════════════════════════════════════════════════════════════════════

export const TDINT_CATEGORIE = [
  { id: "ti01", code: "Rullo oscurante" },
  { id: "ti02", code: "Rullo filtrante" },
  { id: "ti03", code: "Rullo termico" },
  { id: "ti04", code: "Pacchetto" },
  { id: "ti05", code: "Pannello giapponese" },
  { id: "ti06", code: "Veneziana legno/PVC/alluminio" },
  { id: "ti07", code: "Plissettata nido d'ape" },
  { id: "ti08", code: "Bastone" },
  { id: "ti09", code: "Binario / Doppio binario" },
  { id: "ti10", code: "Verticale" },
  { id: "ti11", code: "Per lucernario / Tetto" },
  { id: "ti12", code: "Giorno e notte" },
];

export const TDINT_TESSUTO = [
  { id: "tit01", code: "Filtrante" },
  { id: "tit02", code: "Oscurante" },
  { id: "tit03", code: "Termico" },
  { id: "tit04", code: "Voile" },
  { id: "tit05", code: "Lino" },
  { id: "tit06", code: "Tecnico" },
];

export const TDINT_MONTAGGIO = [
  { id: "tim01", code: "Parete" },
  { id: "tim02", code: "Soffitto" },
  { id: "tim03", code: "A vetro" },
  { id: "tim04", code: "In nicchia" },
  { id: "tim05", code: "Al telaio" },
];

export const TDINT_FINITURA = [
  { id: "tif01", code: "Ad anello" },
  { id: "tif02", code: "Piega doppia" },
  { id: "tif03", code: "Matita" },
  { id: "tif04", code: "Onda" },
];


// ═══════════════════════════════════════════════════════════════════════
// BOX DOCCIA — Scheda misura completa
// ═══════════════════════════════════════════════════════════════════════

export const BXDOC_TIPO = [
  { id: "bd01", code: "Nicchia" },
  { id: "bd02", code: "Angolare quadrato" },
  { id: "bd03", code: "Angolare rettangolare" },
  { id: "bd04", code: "Semicircolare" },
  { id: "bd05", code: "Walk-In" },
  { id: "bd06", code: "Vasca" },
  { id: "bd07", code: "Soffietto" },
  { id: "bd08", code: "Pentagonale" },
];

export const BXDOC_APERTURA = [
  { id: "ba01", code: "Scorrevole" },
  { id: "ba02", code: "Battente" },
  { id: "ba03", code: "Soffietto" },
  { id: "ba04", code: "Pivot" },
  { id: "ba05", code: "Walk-in (aperto)" },
  { id: "ba06", code: "Saloon" },
];

export const BXDOC_VETRO = [
  { id: "bv01", code: "Cristallo 6mm trasparente" },
  { id: "bv02", code: "Cristallo 6mm satinato" },
  { id: "bv03", code: "Cristallo 8mm trasparente" },
  { id: "bv04", code: "Cristallo 8mm satinato" },
  { id: "bv05", code: "Cristallo 8mm fumé" },
];

export const BXDOC_PROFILO = [
  { id: "bp01", code: "Cromo" },
  { id: "bp02", code: "Nero" },
  { id: "bp03", code: "Bianco" },
  { id: "bp04", code: "Bronzo" },
  { id: "bp05", code: "Oro" },
  { id: "bp06", code: "Frameless (senza profilo)" },
];


// ═══════════════════════════════════════════════════════════════════════
// CANCELLI E RECINZIONI — Scheda misura completa
// ═══════════════════════════════════════════════════════════════════════

export const CANC_TIPO = [
  { id: "ck01", code: "Battente singolo" },
  { id: "ck02", code: "Battente doppio" },
  { id: "ck03", code: "Scorrevole" },
  { id: "ck04", code: "Pedonale" },
  { id: "ck05", code: "Recinzione" },
  { id: "ck06", code: "Ringhiera" },
];

export const CANC_SISTEMA = [
  { id: "cks01", code: "Doghe privacy",     moduli: true },
  { id: "cks02", code: "Ferro battuto",     moduli: true },
  { id: "cks03", code: "Per terreni inclinati", moduli: true },
  { id: "cks04", code: "Taglio laser",      moduli: false },
  { id: "cks05", code: "Su misura",         moduli: false },
  { id: "cks06", code: "Rete metallica",    moduli: true },
  { id: "cks07", code: "Paletti e cavi",    moduli: true },
];

export const CANC_AUTOMAZIONE = [
  { id: "cka01", code: "Manuale" },
  { id: "cka02", code: "Predisposizione motore" },
  { id: "cka03", code: "Motorizzato 230V" },
  { id: "cka04", code: "Motorizzato solare" },
  { id: "cka05", code: "Motorizzato con batteria" },
];


// ═══════════════════════════════════════════════════════════════════════
// ARREDAMENTO UFFICIO — Scheda misura
// ═══════════════════════════════════════════════════════════════════════

export const UFF_AMBIENTE = [
  { id: "ua01", code: "Ufficio singolo" },
  { id: "ua02", code: "Ufficio doppio" },
  { id: "ua03", code: "Open space" },
  { id: "ua04", code: "Sala riunioni" },
  { id: "ua05", code: "Reception" },
  { id: "ua06", code: "Archivio" },
  { id: "ua07", code: "Break room" },
  { id: "ua08", code: "Phone booth" },
];

export const UFF_PARETE_TIPO = [
  { id: "up01", code: "Vetro singolo" },
  { id: "up02", code: "Vetro doppio" },
  { id: "up03", code: "Cieca melamminica" },
  { id: "up04", code: "Cieca laccata" },
  { id: "up05", code: "Mista (vetro + cieca)" },
  { id: "up06", code: "Attrezzata (con scaffali)" },
  { id: "up07", code: "Mobile" },
  { id: "up08", code: "Acustica" },
];

export const UFF_PARETE_VETRO = [
  { id: "upv01", code: "Trasparente" },
  { id: "upv02", code: "Satinato" },
  { id: "upv03", code: "Decorato / Pellicola" },
  { id: "upv04", code: "Smart glass (commutabile)" },
];

export const UFF_SCRIVANIA_TIPO = [
  { id: "us01", code: "Lineare" },
  { id: "us02", code: "Angolare (L)" },
  { id: "us03", code: "Regolabile altezza (sit-stand)" },
  { id: "us04", code: "Bench (condivisa)" },
  { id: "us05", code: "Direzionale" },
  { id: "us06", code: "Reception desk" },
];

export const UFF_SEDUTA_TIPO = [
  { id: "use01", code: "Operativa ergonomica" },
  { id: "use02", code: "Direzionale" },
  { id: "use03", code: "Visitatore / Attesa" },
  { id: "use04", code: "Sgabello" },
  { id: "use05", code: "Poltroncina riunioni" },
  { id: "use06", code: "Divano attesa" },
];

export const UFF_ARMADIO_TIPO = [
  { id: "uarm01", code: "Ante battenti" },
  { id: "uarm02", code: "Ante scorrevoli" },
  { id: "uarm03", code: "A giorno" },
  { id: "uarm04", code: "Cassettiera" },
  { id: "uarm05", code: "Armadietto spogliatoio" },
  { id: "uarm06", code: "Schedario" },
];


// ═══════════════════════════════════════════════════════════════════════
// ARREDAMENTO CASA — Scheda misura
// ═══════════════════════════════════════════════════════════════════════

export const CASA_AMBIENTE = [
  { id: "ca01", code: "Soggiorno" },
  { id: "ca02", code: "Camera matrimoniale" },
  { id: "ca03", code: "Cameretta" },
  { id: "ca04", code: "Cucina" },
  { id: "ca05", code: "Ingresso" },
  { id: "ca06", code: "Studio" },
  { id: "ca07", code: "Bagno" },
  { id: "ca08", code: "Lavanderia" },
  { id: "ca09", code: "Corridoio" },
  { id: "ca10", code: "Mansarda" },
];

export const CASA_GIORNO_EL = [
  { id: "cge01", code: "Parete attrezzata / Porta TV" },
  { id: "cge02", code: "Libreria" },
  { id: "cge03", code: "Madia / Credenza" },
  { id: "cge04", code: "Tavolo" },
  { id: "cge05", code: "Sedie" },
  { id: "cge06", code: "Divano" },
  { id: "cge07", code: "Poltrona" },
  { id: "cge08", code: "Tavolino" },
  { id: "cge09", code: "Mensole" },
  { id: "cge10", code: "Vetrina" },
];

export const CASA_NOTTE_EL = [
  { id: "cne01", code: "Letto matrimoniale" },
  { id: "cne02", code: "Letto singolo" },
  { id: "cne03", code: "Letto a castello" },
  { id: "cne04", code: "Letto contenitore" },
  { id: "cne05", code: "Armadio ante battenti" },
  { id: "cne06", code: "Armadio ante scorrevoli" },
  { id: "cne07", code: "Cabina armadio (walk-in)" },
  { id: "cne08", code: "Comodino" },
  { id: "cne09", code: "Cassettiera / Comò" },
  { id: "cne10", code: "Specchiera" },
  { id: "cne11", code: "Scrivania cameretta" },
];

export const CASA_TAVOLO_FORMA = [
  { id: "ctf01", code: "Rettangolare" },
  { id: "ctf02", code: "Quadrato" },
  { id: "ctf03", code: "Rotondo" },
  { id: "ctf04", code: "Ovale" },
  { id: "ctf05", code: "Allungabile rettangolare" },
  { id: "ctf06", code: "Allungabile rotondo" },
];

export const CASA_ARMADIO_INTERNO = [
  { id: "cai01", code: "Ripiani" },
  { id: "cai02", code: "Cassetti" },
  { id: "cai03", code: "Barra appendiabiti" },
  { id: "cai04", code: "Doppia barra (corto+corto)" },
  { id: "cai05", code: "Portapantaloni" },
  { id: "cai06", code: "Portascarpe" },
  { id: "cai07", code: "Specchio interno" },
  { id: "cai08", code: "Illuminazione LED" },
];


// ═══════════════════════════════════════════════════════════════════════
// COMPLEMENTI & OUTDOOR — Scheda misura
// ═══════════════════════════════════════════════════════════════════════

export const COMPL_CATEGORIA = [
  { id: "co01", code: "Mobile bagno" },
  { id: "co02", code: "Mobile lavanderia" },
  { id: "co03", code: "Scarpiera" },
  { id: "co04", code: "Mobile ingresso" },
  { id: "co05", code: "Armadio multiuso / Ripostiglio" },
  { id: "co06", code: "Libreria / Scaffale" },
  { id: "co07", code: "Scrivania / Postazione" },
  { id: "co08", code: "Set esterno (tavolo + sedie)" },
  { id: "co09", code: "Armadio esterno" },
  { id: "co10", code: "Casetta da giardino" },
  { id: "co11", code: "Gazebo / Pergola" },
  { id: "co12", code: "Fioriera / Vaso" },
];

export const COMPL_MATERIALE = [
  { id: "coma01", code: "Legno nobilitato / Melaminico" },
  { id: "coma02", code: "Legno massello" },
  { id: "coma03", code: "MDF laccato" },
  { id: "coma04", code: "Metallo" },
  { id: "coma05", code: "Polipropilene (outdoor)" },
  { id: "coma06", code: "Rattan / Polyrattan" },
  { id: "coma07", code: "Vetro" },
  { id: "coma08", code: "Ceramica" },
];


// ═══════════════════════════════════════════════════════════════════════
// TIPOLOGIE RAPIDE — Aggiunta per i nuovi settori
// ═══════════════════════════════════════════════════════════════════════

export const TIPOLOGIE_NUOVE = [
  // Porte (settore: porte)
  { id: "tp01", nome: "Porta battente",        settore: "porte" },
  { id: "tp02", nome: "Porta scorrevole",       settore: "porte" },
  { id: "tp03", nome: "Porta libro",            settore: "porte" },
  { id: "tp04", nome: "Porta filomuro",         settore: "porte" },
  { id: "tp05", nome: "Porta blindata",         settore: "porte" },
  { id: "tp06", nome: "Porta REI",              settore: "porte" },
  { id: "tp07", nome: "Porta vetro",            settore: "porte" },
  { id: "tp08", nome: "Portone ingresso",       settore: "porte" },
  // Tende sole
  { id: "tp09", nome: "Tenda a bracci",         settore: "tendesole" },
  { id: "tp10", nome: "Tenda a caduta",         settore: "tendesole" },
  { id: "tp11", nome: "Cappottina",             settore: "tendesole" },
  { id: "tp12", nome: "Pergotenda",             settore: "tendesole" },
  // Tende interne
  { id: "tp13", nome: "Rullo",                  settore: "tendeinterne" },
  { id: "tp14", nome: "Veneziana",              settore: "tendeinterne" },
  { id: "tp15", nome: "Plissettata",            settore: "tendeinterne" },
  { id: "tp16", nome: "Tenda a pacchetto",      settore: "tendeinterne" },
  // Box doccia
  { id: "tp17", nome: "Box doccia nicchia",      settore: "boxdoccia" },
  { id: "tp18", nome: "Box doccia angolare",     settore: "boxdoccia" },
  { id: "tp19", nome: "Walk-in",                 settore: "boxdoccia" },
  // Cancelli
  { id: "tp20", nome: "Cancello battente",       settore: "cancelli" },
  { id: "tp21", nome: "Cancello scorrevole",     settore: "cancelli" },
  { id: "tp22", nome: "Recinzione",              settore: "cancelli" },
  // Ufficio
  { id: "tp23", nome: "Parete divisoria",        settore: "ufficio" },
  { id: "tp24", nome: "Postazione lavoro",       settore: "ufficio" },
  { id: "tp25", nome: "Sala riunioni",           settore: "ufficio" },
  { id: "tp26", nome: "Reception",               settore: "ufficio" },
  // Arredo casa
  { id: "tp27", nome: "Soggiorno",               settore: "arredocasa" },
  { id: "tp28", nome: "Camera matrimoniale",     settore: "arredocasa" },
  { id: "tp29", nome: "Cameretta",               settore: "arredocasa" },
  { id: "tp30", nome: "Cucina",                  settore: "arredocasa" },
  { id: "tp31", nome: "Armadio su misura",        settore: "arredocasa" },
  // Complementi
  { id: "tp32", nome: "Mobile bagno",             settore: "complementi" },
  { id: "tp33", nome: "Arredo esterno",            settore: "complementi" },
  { id: "tp34", nome: "Mobile ingresso",           settore: "complementi" },
  { id: "tp35", nome: "Lavanderia",                settore: "complementi" },
];


// ═══════════════════════════════════════════════════════════════════════
// ACCESSORI META — Mappa completa settore → campi vano
// ═══════════════════════════════════════════════════════════════════════

export const SETTORE_CAMPI = {
  serramenti: {
    misure: ["larghezzaMuro", "altezzaMuro", "profonditaMuro", "battuta", "tipoMuro", "squadratura", "soglia", "davanzale", "posizione"],
    config: ["sistema", "nAnte", "apertura", "vetro", "colore", "coprifilo", "lamiera", "controtelaio"],
    accessori: ["martellina", "tapparella", "cassonetto", "zanzariera", "persiana"],
  },
  porte: {
    misure: ["larghezzaVano", "altezzaVano", "spessoreMuro"],
    config: ["materiale", "apertura", "senso", "finitura", "vetroInserto", "colore", "controtelaio", "classeEI", "classeRC"],
    accessori: ["maniglia", "serratura", "chiudiporta"],
  },
  persiane: {
    misure: ["larghezza", "altezza"],
    config: ["materiale", "tipo", "nAnte", "colore"],
    accessori: [],
  },
  tapparelle: {
    misure: ["larghezza", "altezza"],
    config: ["materiale", "motorizzata", "colore"],
    accessori: ["cassonetto"],
  },
  zanzariere: {
    misure: ["larghezza", "altezza", "profTelaio"],
    config: ["categoria", "modello", "rete", "lato", "colore"],
    accessori: [],
  },
  tendesole: {
    misure: ["larghezza", "sporgenza", "altezzaInstallazione"],
    config: ["categoria", "montaggio", "comando", "coloreTelo", "coloreStruttura"],
    accessori: [],
  },
  tendeinterne: {
    misure: ["larghezza", "altezza", "profTelaio"],
    config: ["categoria", "tessuto", "montaggio", "finitura", "latoComando"],
    accessori: [],
  },
  boxdoccia: {
    misure: ["larghezza", "profondita", "altezza"],
    config: ["tipo", "apertura", "vetro", "profilo"],
    accessori: ["piattodoccia"],
  },
  cancelli: {
    misure: ["larghezza", "altezza", "lunghezzaTotale", "nModuli", "pendenza"],
    config: ["tipo", "sistema", "automazione", "coloreRAL"],
    accessori: ["serratura", "fotocellule", "lampeggiante"],
  },
  ufficio: {
    misure: ["largAmbiente", "profAmbiente", "altSoffitto"],
    config: ["tipoAmbiente"],
    elementi: ["pareti", "scrivanie", "sedute", "armadi"],
  },
  arredocasa: {
    misure: ["largAmbiente", "profAmbiente", "altSoffitto"],
    config: ["tipoAmbiente", "stile"],
    elementi: ["giorno", "notte", "complementi"],
  },
  complementi: {
    misure: ["largSpazio", "altSpazio", "profSpazio"],
    config: ["categoria", "materiale", "colore"],
    accessori: [],
  },
};
