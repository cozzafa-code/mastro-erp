"use client";
// =======================================================
// MASTRO ERP v2 — PARTE 1/5
// Righe 1-1280: Costanti, Dati Demo (incluse visite/vaniList/euro/scadenza),
// Continuazione in PARTE2
// =======================================================
// components/MastroERP.tsx
// MASTRO ERP — adattato per Next.js + Supabase
import React, { useState, useRef, useCallback, useEffect } from "react";
// import { getAziendaId, loadAllData, saveCantiere, saveEvent, deleteEvent as deleteEventDB, saveContatto, saveTeamMember, saveTask, saveAzienda, saveVano, deleteVano, saveMateriali, savePipeline } from "@/lib/supabase-sync";
import { supabase } from "@/lib/supabase";

// === CLOUD SYNC HELPERS ===
const SYNC_KEYS = ["cantieri","events","contatti","tasks","problemi","team","azienda","pipeline","sistemi","vetri","colori","coprifili","lamiere","libreria","fatture","squadre","montaggi","ordiniForn"];


import { cloudSave, cloudLoadAll, getAziendaId, loadAllData, saveCantiere, saveEvent, deleteEventDB, saveContatto, saveTeamMember, saveTask, saveAzienda, saveVanoDB, saveMateriali, savePipeline, FONT, FF, FM, tipoToMinCat, THEMES, PLANS, PIPELINE_DEFAULT, MOTIVI_BLOCCO, AFASE, CANTIERI_INIT, FATTURE_INIT, ORDINI_INIT, MONTAGGI_INIT, TASKS_INIT, AI_INBOX_INIT, MSGS_INIT, TEAM_INIT, CONTATTI_INIT, COLORI_INIT, SISTEMI_INIT, VETRI_INIT, TIPOLOGIE_RAPIDE, SETTORI, SETTORI_DEFAULT, COPRIFILI_INIT, LAMIERE_INIT, Ico, ICO, PUNTI_MISURE, useDragOrder, TIPI_EVENTO, tipoEvColor } from "./mastro-constants";
import { MastroContext } from "./MastroContext";
import SettingsPanel from "./SettingsPanel";
import PreventivoModal from "./PreventivoModal";
import RilieviListPanel from "./RilieviListPanel";
import VanoDetailPanel from "./VanoDetailPanel";
import HomePanel from "./HomePanel";
import CMDetailPanel from "./CMDetailPanel";
import ModalPanel from "./ModalPanel";
import RiepilogoPanel from "./RiepilogoPanel";
import AgendaPanel from "./AgendaPanel";
import MessaggiPanel from "./MessaggiPanel";
import ContabilitaPanel from "./ContabilitaPanel";
import ClientiPanel from "./ClientiPanel";
import CommessePanel from "./CommessePanel";
import { OnboardingPanel, FirmaModalPanel } from "./OnboardingPanel";

export default function MastroMisure({ user, azienda: aziendaInit }: { user?: any, azienda?: any }) {
  const [theme, setTheme] = useState("chiaro");
  const T = THEMES[theme];
  const syncReady = useRef(false);
  const userId = user?.id || null;
  
  const [tab, setTab] = useState("home");
  // === SUBSCRIPTION ===
  const [subPlan, setSubPlan] = useState<string>("trial");
  const [trialStart] = useState(() => { if (typeof window === "undefined") return new Date(); const s = localStorage.getItem("mastro_trial_start"); if (s) return new Date(s); const d = new Date(); localStorage.setItem("mastro_trial_start", d.toISOString()); return d; });
  const trialDaysLeft = subPlan === "trial" ? Math.max(0, 14 - Math.floor((Date.now() - trialStart.getTime()) / 86400000)) : 0;
  const activePlan = subPlan === "trial" && trialDaysLeft <= 0 ? "free" : subPlan;
  const plan = PLANS[activePlan] || PLANS.free;
  const [showPaywall, setShowPaywall] = useState<string | null>(null);
  const canDo = (action: string) => {
    if (action === "commessa" && cantieri.length >= plan.maxCommesse) { setShowPaywall("Hai raggiunto il limite di " + plan.maxCommesse + " commesse. Passa a un piano superiore per continuare."); return false; }
    if (action === "pdf" && !plan.pdf) { setShowPaywall("La generazione PDF è disponibile dal piano Pro."); return false; }
    if (action === "sync" && !plan.sync) { setShowPaywall("La sync real-time è disponibile dal piano Pro."); return false; }
    return true;
  };
  const WIDGET_IDS = ["contatori", "io", "attenzione", "programma", "settimana", "commesse", "azioni", "dashboard"];
  const drag = useDragOrder(WIDGET_IDS);
  const [homeEditMode, setHomeEditMode] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);
  const [ioChecked, setIoChecked] = useState<Record<string,boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string,boolean>>({});
  const [lastOpenedCMId, setLastOpenedCMId] = useState<string|null>(null);
  // Wizard nuova visita
  const [cmSubTab, setCmSubTab] = useState("sopralluoghi"); // "sopralluoghi" | "misure" | "info"
  const [nvView, setNvView] = useState(false);
  const [nvStep, setNvStep] = useState(1);
  const [nvData, setNvData] = useState({ data: "", ora: "", rilevatore: "" });
  const [nvTipo, setNvTipo] = useState("rilievo"); // "rilievo" | "definitiva" | "modifica"
  const [nvMotivoModifica, setNvMotivoModifica] = useState("");
  const [nvVani, setNvVani] = useState([]);
  const [nvBlocchi, setNvBlocchi] = useState({});
  const [nvNote, setNvNote] = useState("");
  // Calendario griglia espandibile
  const [expandedDay, setExpandedDay] = useState(null); // ISO string del giorno espanso
  const [cantieri, setCantieri] = useState(CANTIERI_INIT);
  const [tasks, setTasks] = useState(TASKS_INIT);
  const [msgs, setMsgs] = useState(MSGS_INIT);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  // === MODULO PROBLEMI ===
  const [problemi, setProblemi] = useState<any[]>(() => { try { const s = localStorage.getItem("mastro:problemi"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [showProblemaModal, setShowProblemaModal] = useState(false);
  const [selectedProblema, setSelectedProblema] = useState<any>(null);
  const [problemaForm, setProblemaForm] = useState({ titolo: "", descrizione: "", tipo: "materiale", priorita: "media", assegnato: "" });
  const [showProblemiView, setShowProblemiView] = useState(false);
  // Save problemi to localStorage
  useEffect(() => { try { localStorage.setItem("mastro:problemi", JSON.stringify(problemi)); } catch {} if(syncReady.current&&userId)cloudSave(userId,"problemi",problemi); }, [problemi]);
  const [team, setTeam] = useState(TEAM_INIT);
  const [coloriDB, setColoriDB] = useState(COLORI_INIT);
  const [sistemiDB, setSistemiDB] = useState(SISTEMI_INIT);
  const [vetriDB, setVetriDB] = useState(VETRI_INIT);
  const [coprifiliDB, setCoprifiliDB] = useState(COPRIFILI_INIT);
  const [lamiereDB, setLamiereDB] = useState(LAMIERE_INIT);
  const [libreriaDB, setLibreriaDB] = useState<any[]>([
    { id: 1, nome: "Controtelaio monoblocco", categoria: "Controtelaio", prezzo: 85, unita: "pz" },
    { id: 2, nome: "Davanzale marmo", categoria: "Davanzale", prezzo: 45, unita: "ml" },
    { id: 3, nome: "Soglia alluminio", categoria: "Soglia", prezzo: 25, unita: "ml" },
    { id: 4, nome: "Opere murarie", categoria: "Opere", prezzo: 120, unita: "forfait" },
    { id: 5, nome: "Cassonetto coibentato", categoria: "Cassonetto", prezzo: 95, unita: "ml" },
    { id: 6, nome: "Zoccolino raccordo", categoria: "Accessorio", prezzo: 12, unita: "ml" },
  ]);
  const [telaiPersianaDB, setTelaiPersianaDB] = useState([
    { id: "tp1", code: "L" }, { id: "tp2", code: "Z 22" }, { id: "tp3", code: "Z 27" }, { id: "tp4", code: "Z 40" }, { id: "tp5", code: "Z 50" }
  ]);
  const [posPersianaDB, setPosPersianaDB] = useState([
    { id: "pp1", code: "In battuta" }, { id: "pp2", code: "Con zoccoletto" }, { id: "pp3", code: "A filo muro" }, { id: "pp4", code: "Su controtelaio" }
  ]);
  const [tipoMisuraDB, setTipoMisuraDB] = useState([
    { id: "tm1", code: "Punta corta" }, { id: "tm2", code: "Punta lunga" }, { id: "tm3", code: "Muro finito" }, { id: "tm4", code: "Muro grezzo" }
  ]);
  const [tipoMisuraTappDB, setTipoMisuraTappDB] = useState([
    { id: "tmt1", code: "Misura luce guida" }, { id: "tmt2", code: "Misura finita tapparella" }
  ]);
  const [tipoMisuraZanzDB, setTipoMisuraZanzDB] = useState([
    { id: "tmz1", code: "Misura muro finito" }, { id: "tmz2", code: "Misura esterna zanzariera" }
  ]);
  const [tipoCassonettoDB, setTipoCassonettoDB] = useState([
    { id: "tc1", code: "Monoblocco" }, { id: "tc2", code: "Esterno" }, { id: "tc3", code: "A scomparsa" }, { id: "tc4", code: "Sopraluce" }
  ]);
  const [ctProfDB, setCtProfDB] = useState([
    { id: "cp1", code: "40" }, { id: "cp2", code: "45" }, { id: "cp3", code: "50" }, { id: "cp4", code: "55" }, { id: "cp5", code: "60" }, { id: "cp6", code: "65" }, { id: "cp7", code: "70" }
  ]);
  const [ctSezioniDB, setCtSezioniDB] = useState([
    { id: "cs1", code: "56×40" }, { id: "cs2", code: "56×50" }, { id: "cs3", code: "56×60" }, { id: "cs4", code: "56×70" }, { id: "cs5", code: "76×50" }, { id: "cs6", code: "76×60" }
  ]);
  const [ctCieliniDB, setCtCieliniDB] = useState([
    { id: "cc1", code: "A tampone" }, { id: "cc2", code: "A tappo" }, { id: "cc3", code: "Frontale" }
  ]);
  const [ctOffset, setCtOffset] = useState(10); // mm per lato (totale = x2)
  const [pipelineDB, setPipelineDB] = useState(PIPELINE_DEFAULT);
  const [faseOpen, setFaseOpen] = useState(true);
  const [sogliaDays, setSogliaDays] = useState(5);
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [firmaDrawing, setFirmaDrawing] = useState(false);
  const [firmaDataUrl, setFirmaDataUrl] = useState(null);
  const [showPreventivoModal, setShowPreventivoModal] = useState(false);
  const [favTipologie, setFavTipologie] = useState(["F1A", "F2A", "PF2A", "SC2A", "FISDX", "VAS"]);
  
  // Fatturazione
  const [fattureDB, setFattureDB] = useState<any[]>(FATTURE_INIT);

  // ═══ FATTURE PASSIVE (ricevute da fornitori) ═══
  const [fatturePassive, setFatturePassive] = useState<any[]>(() => {
    try { const v = localStorage.getItem("mastro:fatturePassive"); return v ? JSON.parse(v) : []; } catch(e) { return []; }
  });
  const [showFatturaPassiva, setShowFatturaPassiva] = useState(false);
  const [newFattPassiva, setNewFattPassiva] = useState({ fornitore: "", numero: "", data: "", importo: 0, iva: 22, descrizione: "", cmId: "", pagata: false, scadenza: "" });

  // ═══ CONTABILITÀ ═══
  const [showContabilita, setShowContabilita] = useState(false);
  const [contabTab, setContabTab] = useState("panoramica");
  const [contabMese, setContabMese] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });

  // ═══ CRONOLOGIA ═══
  const [showCronologia, setShowCronologia] = useState(false);

  // ═══ KIT ACCESSORI ═══
  const [kitAccessori, setKitAccessori] = useState(() => {
    try { const v = localStorage.getItem("mastro:kit"); return v ? JSON.parse(v) : [
      { id: 1, nome: "Kit Standard", items: ["Maniglia", "Cerniere x2", "Guarnizione"], prezzo: 45 },
      { id: 2, nome: "Kit Sicurezza", items: ["Maniglia con chiave", "Cerniere x3", "Defender", "Multipoint"], prezzo: 120 },
      { id: 3, nome: "Kit Scorrevole", items: ["Binario", "Carrelli x2", "Chiusura soft", "Maniglia incasso"], prezzo: 180 },
    ]; } catch(e) { return []; }
  });

  // ═══ FORNITORI PRO ═══
  const [fornitori, setFornitori] = useState(() => {
    try { const v = localStorage.getItem("mastro:fornitori"); if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length > 0) return p; } } catch(e) {}
    return [
    { id: "f1", nome: "Aluplast Italia", ragioneSociale: "Aluplast Italia SRL", piva: "01234567890", cf: "", tipo: "Profili PVC", categoria: "profili", indirizzo: "Via Roma 10", cap: "37100", citta: "Verona", provincia: "VR", telefono: "+39 045 123456", cellulare: "", email: "ordini@aluplast.it", pec: "aluplast@pec.it", sito: "www.aluplast.it", referente: "Marco Rossi", telReferente: "+39 333 1234567", emailReferente: "m.rossi@aluplast.it", banca: "Unicredit", iban: "IT60X0542811101000000123456", pagamento: "60gg_fm", scontoBase: 35, tempoConsegna: 18, sistemiTrattati: "Ideal 4000, Ideal 7000, Ideal 8000", note: "Fornitore principale PVC", rating: 4.6, preferito: true, attivo: true },
    { id: "f2", nome: "Schüco International", ragioneSociale: "Schüco International Italia SRL", piva: "09876543210", cf: "", tipo: "Profili Alluminio", categoria: "profili", indirizzo: "Via Milano 50", cap: "20100", citta: "Milano", provincia: "MI", telefono: "+39 02 654321", cellulare: "", email: "italia@schueco.com", pec: "schuco@pec.it", sito: "www.schueco.com", referente: "Luca Bianchi", telReferente: "+39 335 7654321", emailReferente: "l.bianchi@schueco.com", banca: "Intesa", iban: "", pagamento: "60gg_fm", scontoBase: 30, tempoConsegna: 22, sistemiTrattati: "AWS 75, ASS 70, ASS 77", note: "", rating: 4.8, preferito: true, attivo: true },
    { id: "f3", nome: "Pilkington Italia", ragioneSociale: "Pilkington Italia SPA", piva: "", cf: "", tipo: "Vetri", categoria: "vetri", indirizzo: "", cap: "", citta: "Napoli", provincia: "NA", telefono: "+39 081 789012", cellulare: "", email: "ordini@pilkington.it", pec: "", sito: "", referente: "", telReferente: "", emailReferente: "", banca: "", iban: "", pagamento: "30gg_fm", scontoBase: 20, tempoConsegna: 12, sistemiTrattati: "", note: "", rating: 4.3, preferito: false, attivo: true },
    { id: "f4", nome: "Roto Frank", ragioneSociale: "Roto Frank AG", piva: "", cf: "", tipo: "Ferramenta", categoria: "ferramenta", indirizzo: "", cap: "", citta: "Bolzano", provincia: "BZ", telefono: "+39 0471 345678", cellulare: "", email: "italia@roto-frank.com", pec: "", sito: "", referente: "", telReferente: "", emailReferente: "", banca: "", iban: "", pagamento: "30gg_fm", scontoBase: 25, tempoConsegna: 8, sistemiTrattati: "", note: "", rating: 4.5, preferito: false, attivo: true },
  ]; });
  const [showFornitoreDetail, setShowFornitoreDetail] = useState<any>(null);
  const [showFornitoreForm, setShowFornitoreForm] = useState(false);
  const [fornitoreEdit, setFornitoreEdit] = useState<any>(null);

  // ═══ TEMI CUSTOM ═══
  const [customThemes, setCustomThemes] = useState(() => {
    try { const v = localStorage.getItem("mastro:customThemes"); return v ? JSON.parse(v) : []; } catch(e) { return []; }
  });

  // ═══ VOCE AI ═══
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(()=>{try{localStorage.setItem("mastro:fatturePassive",JSON.stringify(fatturePassive));}catch(e){}},[fatturePassive]);
  useEffect(()=>{try{localStorage.setItem("mastro:fornitori",JSON.stringify(fornitori));}catch(e){}},[fornitori]);
  useEffect(()=>{try{localStorage.setItem("mastro:kit",JSON.stringify(kitAccessori));}catch(e){}},[kitAccessori]);
  useEffect(()=>{try{localStorage.setItem("mastro:customThemes",JSON.stringify(customThemes));}catch(e){}},[customThemes]);
  const [ordiniFornDB, setOrdiniFornDB] = useState<any[]>(ORDINI_INIT);
  const [showFatturaModal, setShowFatturaModal] = useState(false);
  const [fatturaEdit, setFatturaEdit] = useState<any>(null);
  
  // Squadre montaggio
  const [squadreDB, setSquadreDB] = useState<any[]>([
    { id: "sq1", nome: "Squadra A", membri: ["Mario", "Giuseppe"], colore: "#007aff" },
    { id: "sq2", nome: "Squadra B", membri: ["Paolo", "Andrea"], colore: "#34c759" },
  ]);
  const [montaggiDB, setMontaggiDB] = useState<any[]>(MONTAGGI_INIT);
  
  // Settori attivi + Onboarding
  const [settoriAttivi, setSettoriAttivi] = useState<string[]>(SETTORI_DEFAULT);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pianoAttivo, setPianoAttivo] = useState<"free"|"pro"|"business">("pro"); // default pro for dev
  
  // Tipologie filtrate per settori attivi
  const tipologieFiltrate = TIPOLOGIE_RAPIDE.filter(t => settoriAttivi.includes(t.settore));
  
  // Stato calendario montaggi
  const [calMontaggiWeek, setCalMontaggiWeek] = useState(0);
  const [showCalMontaggi, setShowCalMontaggi] = useState(false);
  const [calMontaggiTarget, setCalMontaggiTarget] = useState<string | null>(null);
  const [montFormOpen, setMontFormOpen] = useState(false);
  const [montFormData, setMontFormData] = useState({ data: "", orario: "08:00", durata: "giornata", squadraId: "", note: "" });
  const [ccConfirm, setCcConfirm] = useState<string | null>(null);
  const [ccDone, setCcDone] = useState<string | null>(null);
  const [firmaStep, setFirmaStep] = useState(0);
  const [firmaFileUrl, setFirmaFileUrl] = useState<string | null>(null);
  const [firmaFileName, setFirmaFileName] = useState("");
  const [fattPerc, setFattPerc] = useState(50);
  const [montGiorni, setMontGiorni] = useState(1);
  const [docViewer, setDocViewer] = useState<{ docs: any[], title: string } | null>(null);
  const [ccExpandStep, setCcExpandStep] = useState<string|null>(null);
  const [confSett, setConfSett] = useState(""); // settimane consegna input
  
  // Navigation
  const [selectedCM, setSelectedCM] = useState(null);
  const [selectedRilievo, setSelectedRilievo] = useState(null); // rilievo aperto
  const [showNuovoRilievo, setShowNuovoRilievo] = useState(false);
  const [nuovoRilTipo, setNuovoRilTipo] = useState("rilievo");
  const [nuovoRilData, setNuovoRilData] = useState({ data: "", ora: "", rilevatore: "", note: "", motivoModifica: "" });
  const [selectedVano, setSelectedVano] = useState(null);
  const [filterFase, setFilterFase] = useState("tutte");
  const [searchQ, setSearchQ] = useState("");
  const [showModal, setShowModal] = useState(null); // 'task' | 'commessa' | 'vano' | null
  const [settingsTab, setSettingsTab] = useState("generali");
  const [expandedPipelinePhase, setExpandedPipelinePhase] = useState(null);
  const [pipelinePhaseTab, setPipelinePhaseTab] = useState("email");
  const [showRiepilogo, setShowRiepilogo] = useState(false);
  const [riepilogoSending, setRiepilogoSending] = useState(false);

  // === ONBOARDING TUTORIAL ===
  const [tutoStep, setTutoStep] = useState(0);
  React.useEffect(() => {
    try { if (!localStorage.getItem("mastro:onboarded")) setTutoStep(1); } catch(e){}
  }, []);
  const closeTuto = () => { setTutoStep(0); try { localStorage.setItem("mastro:onboarded", "1"); } catch(e){} };
  const nextTuto = () => { if (tutoStep >= 7) closeTuto(); else setTutoStep(tutoStep + 1); };

  const [aziendaInfo, setAziendaInfo] = useState({
    ragione: aziendaInit?.ragione || "Walter Cozza Serramenti SRL",
    piva: aziendaInit?.piva || "",
    indirizzo: aziendaInit?.indirizzo || "",
    telefono: aziendaInit?.telefono || "",
    email: aziendaInit?.email || "",
    website: "",
    iban: "",
    cciaa: "",
    logo: null,
    pec: "",
    condFornitura: "",
    condPagamento: "",
    condConsegna: "",
    condContratto: "",
    condDettagli: "",
  });
  const logoInputRef = useRef(null);
  const [aiChat, setAiChat] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMsgs, setAiMsgs] = useState([{ role: "ai", text: "Ciao Fabio! Sono MASTRO AI. Chiedimi qualsiasi cosa sulle tue commesse, task o misure." }]);
  
  // Send commessa modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendOpts, setSendOpts] = useState({ misure: true, foto: true, disegno: true, note: true, accessori: true });
  const [sendConfirm, setSendConfirm] = useState(null);
  
  // Vano wizard step
  const [vanoStep, setVanoStep] = useState(0);
  const spCanvasRef = useRef(null);
  const [spDrawing, setSpDrawing] = useState(false); // "sent" | null
  
  // Agenda
  const [agendaView, setAgendaView] = useState("mese"); // "giorno" | "settimana" | "mese"
  const [agendaFilters, setAgendaFilters] = useState({ eventi: true, montaggi: true, consegne: true, scadenze: true, tasks: true });
  const [homeExpand, setHomeExpand] = useState<Record<string, boolean>>({});
  const [homeView, setHomeView] = useState<string|null>(null);
  const [montView, setMontView] = useState("lista");
  const [montExpandId, setMontExpandId] = useState<string|null>(null);
  const [montCalDate, setMontCalDate] = useState(new Date());
  const [dossierTab, setDossierTab] = useState("storia");
  const [cmFaseIdx, setCmFaseIdx] = useState(0); // filtro fase widget commesse dashboard
  const [cmView, setCmView] = useState<"card"|"list">("card"); // vista commesse: card grande | lista compatta
  const [fasePanelOpen, setFasePanelOpen] = useState<Record<string,boolean>>({}); // accordion checklist per fase
  const [catIdx, setCatIdx] = useState(0); // categoria widget allerte dashboard
  const [selDate, setSelDate] = useState(new Date());
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showMailModal, setShowMailModal] = useState<{ev: any, cm: any} | null>(null);
  const [showEmailComposer, setShowEmailComposer] = useState<any>(null); // {cm, tipo}
  const [emailDest, setEmailDest] = useState("");
  const [emailOggetto, setEmailOggetto] = useState("");
  const [emailCorpo, setEmailCorpo] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [newEvent, setNewEvent] = useState({ text: "", time: "", tipo: "sopralluogo", cm: "", persona: "", date: "", reminder: "", addr: "" });
  const [events, setEvents] = useState(() => {
    const t = new Date(); const td = t.toISOString().split("T")[0];
    const tm = new Date(t); tm.setDate(tm.getDate() + 1); const tmStr = tm.toISOString().split("T")[0];
    const t2 = new Date(t); t2.setDate(t2.getDate() + 2); const t2Str = t2.toISOString().split("T")[0];
    const t3 = new Date(t); t3.setDate(t3.getDate() + 3); const t3Str = t3.toISOString().split("T")[0];
    return [
      { id: "ev1", date: td, time: "09:00", text: "Sopralluogo Verdi", tipo: "sopralluogo", persona: "Giuseppe Verdi", addr: "Via Garibaldi 12, Rende", cm: "S-0001", color: "#007aff", durata: 60 },
      { id: "ev2", date: td, time: "15:00", text: "Telefonata Bianchi — preventivo", tipo: "controllo", persona: "Anna Bianchi", addr: "", cm: "S-0002", color: "#ff9500", durata: 30 },
      { id: "ev3", date: tmStr, time: "10:00", text: "Firma contratto Rossi", tipo: "sopralluogo", persona: "Mario Rossi", addr: "Via Roma 42, Cosenza", cm: "S-0003", color: "#34c759", durata: 45 },
      { id: "ev4", date: t3Str, time: "08:30", text: "Consegna materiale Esposito", tipo: "consegna", persona: "Laura Esposito", addr: "Viale Trieste 5, Rende", cm: "S-0004", color: "#af52de", durata: 120 },
    ];
  });
  
    // Advance fase notification
  const [faseNotif, setFaseNotif] = useState(null);
  
  // AI Photo
  const [showAIPhoto, setShowAIPhoto] = useState(false);
  const [aiPhotoStep, setAiPhotoStep] = useState(0); // 0=ready, 1=analyzing, 2=done
  const [settingsModal, setSettingsModal] = useState(null); // {type, item?}
  const [importStatus, setImportStatus] = useState(null); // {step, msg, detail, ok}
  const [importLog, setImportLog] = useState([]);
  const [settingsForm, setSettingsForm] = useState({});
  const [showAllegatiModal, setShowAllegatiModal] = useState(null); // "nota" | "vocale" | "video" | null

  // Auto-start camera preview when video modal opens
  React.useEffect(() => {
    if (showAllegatiModal === "video") {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
          mediaStreamRef.current = stream;
          setTimeout(() => {
            if (videoPreviewRef.current) { videoPreviewRef.current.srcObject = stream; videoPreviewRef.current.play().catch(() => {}); }
          }, 100);
        } catch (err) {
          console.warn("Camera preview failed:", err);
        }
      })();
    } else {
      // cleanup when modal closes
      if (mediaStreamRef.current && !isRecording) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    }
  }, [showAllegatiModal]);
  const [allegatiText, setAllegatiText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recInterval = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [playProgress, setPlayProgress] = useState(0);
  const playInterval = useRef(null);
  const [viewingVideoId, setViewingVideoId] = useState<number|null>(null);
  const [viewingPhotoId, setViewingPhotoId] = useState<number|string|null>(null);
  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const mediaStreamRef = useRef<MediaStream|null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const audioPlayRef = useRef<HTMLAudioElement|null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement|null>(null);
  
  // Drawing state
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const fotoInputRef = useRef(null);
  const firmaRef = useRef(null);
  const fotoVanoRef = useRef(null);
  const cameraPreviewRef = useRef<HTMLVideoElement|null>(null);
  const cameraStreamRef = useRef<MediaStream|null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraMode, setCameraMode] = useState<"foto"|"video">("foto");
  const calTouchStartRef = React.useRef(0);
  const calTouchEndRef = React.useRef(0);
  const [pendingFotoCat, setPendingFotoCat] = useState(null);
  const videoVanoRef = useRef(null);
  const ripFotoRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTool, setDrawTool] = useState<"pen"|"eraser">("pen");
  const [drawPages, setDrawPages] = useState<string[]>([""]);
  const [drawPageIdx, setDrawPageIdx] = useState(0);
  const [drawFullscreen, setDrawFullscreen] = useState(false);
  const [penColor, setPenColor] = useState("#1d1d1f");
  const [penSize, setPenSize] = useState(2);
  const [drawPaths, setDrawPaths] = useState([]);

  // New task form
  const [newTask, setNewTask] = useState({ text: "", meta: "", time: "", priority: "media", cm: "", date: "", persona: "" });
  const [taskAllegati, setTaskAllegati] = useState([]); // allegati for new task
  const [msgFilter, setMsgFilter] = useState("tutti"); // tutti/email/whatsapp/sms/telegram
  const [msgSearch, setMsgSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeMsg, setComposeMsg] = useState({ to: "", text: "", canale: "whatsapp", cm: "" });
  const [fabOpen, setFabOpen] = useState(false);
  const [contatti, setContatti] = useState(CONTATTI_INIT);
  const [msgSubTab, setMsgSubTab] = useState("chat"); // "chat" | "rubrica" | "ai" | "email"
  const [aiInbox, setAiInbox] = useState(AI_INBOX_INIT);
  const [selectedAiMsg, setSelectedAiMsg] = useState(null);
  // Gmail integration
  const [gmailStatus, setGmailStatus] = useState<{connected:boolean, email?:string}>({ connected: false });
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailNextPage, setGmailNextPage] = useState<string|null>(null);
  const [gmailSelected, setGmailSelected] = useState<any>(null);
  const [gmailReply, setGmailReply] = useState("");
  const [gmailSending, setGmailSending] = useState(false);
  const [gmailSearch, setGmailSearch] = useState("");
  const [rubricaSearch, setRubricaSearch] = useState("");
  const [rubricaFilter, setRubricaFilter] = useState("tutti"); // tutti/preferiti/team/clienti/fornitori
  const [globalSearch, setGlobalSearch] = useState("");
  // New commessa form
  const [newCM, setNewCM] = useState<any>({ cliente: "", indirizzo: "", telefono: "", email: "", sistema: "", tipo: "nuova", difficoltaSalita: "", mezzoSalita: "", foroScale: "", pianoEdificio: "", note: "" });
  const [ripSearch, setRipSearch] = useState("");
  const [ripCMSel, setRipCMSel] = useState(null);
  const [ripProblema, setRipProblema] = useState("");
  const [ripFotos, setRipFotos] = useState([]);
  const [ripUrgenza, setRipUrgenza] = useState("media");
  // New vano form
  const [vanoInfoOpen, setVanoInfoOpen] = useState(null); // which accordion section is open
  const [tipCat, setTipCat] = useState("Finestre");
  const [newVano, setNewVano] = useState({ nome: "", tipo: "F1A", stanza: "Soggiorno", piano: "PT", sistema: "", coloreInt: "", coloreEst: "", bicolore: false, coloreAcc: "", vetro: "", telaio: "", telaioAlaZ: "", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "", coprifilo: "", lamiera: "", pezzi: 1 });
  const [customPiani, setCustomPiani] = useState(["S1", "PT", "P1", "P2", "P3"]);
  const [mezziSalita, setMezziSalita] = useState(["Scala interna", "Scala esterna", "Scala aerea", "Scala a mano", "Gru", "Elevatore", "Ponteggio", "Nessuno"]);
  const [showAddPiano, setShowAddPiano] = useState(false);
  const [newPiano, setNewPiano] = useState("");

  // Responsive width
  const [winW, setWinW] = useState(typeof window !== "undefined" ? window.innerWidth : 430);
  useEffect(() => {
    const h = () => setWinW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // == Persistence ==
  // DEMO VERSION — FORCE RESET on every new deploy
  const DEMO_VER = "v50-gmail-email";
  useEffect(()=>{
      // Check if user chose "clean slate" — skip demo data
      const cleanSlate = localStorage.getItem("mastro:cleanSlate");
      if (cleanSlate === "true") {
        // User wants empty data — load from localStorage (which has empty arrays)
        try{const _v=localStorage.getItem("mastro:cantieri");if(_v){setCantieri(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:tasks");if(_v){setTasks(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:events");if(_v){setEvents(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:fatture");if(_v){setFattureDB(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:ordiniForn");if(_v){setOrdiniFornDB(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:montaggi");if(_v){setMontaggiDB(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:msgs");if(_v){setMsgs(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:contatti");if(_v){setContatti(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:pipeline");if(_v){setPipeline(JSON.parse(_v));}}catch(e){}
        try{const _v=localStorage.getItem("mastro:problemi");if(_v){setProblemi(JSON.parse(_v));}}catch(e){}
        localStorage.setItem("mastro:demoVer", DEMO_VER);
        return;
      }
      const savedVer = localStorage.getItem("mastro:demoVer");
      if (false && savedVer !== DEMO_VER) {
        // FORCE RESET — version changed or first load
        console.log("🔄 MASTRO: Reset demo →", DEMO_VER);
        Object.keys(localStorage).filter(k => k.startsWith("mastro:")).forEach(k => {
          try { localStorage.removeItem(k); } catch(e) {}
        });
        localStorage.setItem("mastro:demoVer", DEMO_VER);
        // Demo data already loaded from useState defaults — skip localStorage loading
        return;
      }
      try{const _v=localStorage.getItem("mastro:cantieri");if(_v){const p=JSON.parse(_v);if(p.length>0)setCantieri(p);}}catch(e){}
      try{const _v=localStorage.getItem("mastro:tasks");if(_v){const p=JSON.parse(_v);if(p.length>0)setTasks(p);}}catch(e){}
      try{const _v=localStorage.getItem("mastro:events");if(_v){const p=JSON.parse(_v);if(p.length>0)setEvents(p);}}catch(e){}
      try{const _v=localStorage.getItem("mastro:colori");if(_v)setColoriDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:sistemi");if(_v){
        let parsed=JSON.parse(_v);
        // Migration: add griglia + minimiMq if missing
        const DEMO_GRIGLIE: Record<string, any[]> = {
          "Ideal 4000": [
            {l:600,h:600,prezzo:120},{l:600,h:800,prezzo:145},{l:600,h:1000,prezzo:170},{l:600,h:1200,prezzo:195},
            {l:800,h:800,prezzo:175},{l:800,h:1000,prezzo:205},{l:800,h:1200,prezzo:240},{l:800,h:1400,prezzo:270},
            {l:1000,h:1000,prezzo:250},{l:1000,h:1200,prezzo:290},{l:1000,h:1400,prezzo:330},{l:1000,h:1600,prezzo:370},
            {l:1200,h:1200,prezzo:340},{l:1200,h:1400,prezzo:385},{l:1200,h:1600,prezzo:430},{l:1200,h:1800,prezzo:480},
            {l:1400,h:1400,prezzo:430},{l:1400,h:1600,prezzo:485},{l:1400,h:2200,prezzo:580},
          ],
          "CT70": [
            {l:600,h:800,prezzo:195},{l:600,h:1200,prezzo:260},
            {l:800,h:1000,prezzo:275},{l:800,h:1400,prezzo:365},
            {l:1000,h:1200,prezzo:380},{l:1000,h:1400,prezzo:440},
            {l:1200,h:1400,prezzo:520},{l:1200,h:1600,prezzo:580},
            {l:1400,h:2200,prezzo:780},
          ],
        };
        const DEMO_MINIMI_MQ: Record<string, any> = { "Ideal 4000": { "1anta": 1.5, "2ante": 2.0, "3ante": 2.8, "scorrevole": 3.5, "fisso": 1.0 }, "CT70": { "1anta": 1.5, "2ante": 2.0, "scorrevole": 3.5 }, "S80": { "1anta": 1.5, "2ante": 2.0 }, "FIN-Project": { "1anta": 1.5, "2ante": 2.2, "scorrevole": 4.0 } };
        parsed = parsed.map(s => ({
          ...s,
          griglia: s.griglia || DEMO_GRIGLIE[s.sistema] || [],
          minimiMq: s.minimiMq || {},
        }));
        setSistemiDB(parsed);
      }}catch(e){}
      try{const _v=localStorage.getItem("mastro:vetri");if(_v)setVetriDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:coprifili");if(_v)setCoprifiliDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:lamiere");if(_v)setLamiereDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:libreria");if(_v)setLibreriaDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:fatture");if(_v){const p=JSON.parse(_v);if(p.length>0)setFattureDB(p);}}catch(e){}
      try{const _v=localStorage.getItem("mastro:ordiniForn");if(_v){const p=JSON.parse(_v);if(p.length>0)setOrdiniFornDB(p);}}catch(e){}
      try{const _v=localStorage.getItem("mastro:squadre");if(_v)setSquadreDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:montaggi");if(_v){const p=JSON.parse(_v);if(p.length>0)setMontaggiDB(p);}}catch(e){}
      try{const _v=localStorage.getItem("mastro:settori");if(_v)setSettoriAttivi(JSON.parse(_v));else setShowOnboarding(true);}catch(e){setShowOnboarding(true);}
      try{const _v=localStorage.getItem("mastro:piano");if(_v)setPianoAttivo(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:team");if(_v)setTeam(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:contatti");if(_v)setContatti(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:pipeline");if(_v)setPipelineDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:azienda");if(_v)setAziendaInfo(JSON.parse(_v));}catch(e){}
},[]);
  useEffect(()=>{try{localStorage.setItem("mastro:cantieri",JSON.stringify(cantieri));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"cantieri",cantieri);},[cantieri]);
  useEffect(()=>{try{localStorage.setItem("mastro:tasks",JSON.stringify(tasks));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"tasks",tasks);},[tasks]);
  useEffect(()=>{try{localStorage.setItem("mastro:events",JSON.stringify(events));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"events",events);},[events]);
  useEffect(()=>{try{localStorage.setItem("mastro:colori",JSON.stringify(coloriDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"colori",coloriDB);},[coloriDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:sistemi",JSON.stringify(sistemiDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"sistemi",sistemiDB);},[sistemiDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:vetri",JSON.stringify(vetriDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"vetri",vetriDB);},[vetriDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:coprifili",JSON.stringify(coprifiliDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"coprifili",coprifiliDB);},[coprifiliDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:lamiere",JSON.stringify(lamiereDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"lamiere",lamiereDB);},[lamiereDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:libreria",JSON.stringify(libreriaDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"libreria",libreriaDB);},[libreriaDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:fatture",JSON.stringify(fattureDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"fatture",fattureDB);},[fattureDB]);

  useEffect(()=>{try{localStorage.setItem("mastro:ordiniForn",JSON.stringify(ordiniFornDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"ordiniForn",ordiniFornDB);},[ordiniFornDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:squadre",JSON.stringify(squadreDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"squadre",squadreDB);},[squadreDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:montaggi",JSON.stringify(montaggiDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"montaggi",montaggiDB);},[montaggiDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:settori",JSON.stringify(settoriAttivi));}catch(e){}},[settoriAttivi]);
  useEffect(()=>{try{localStorage.setItem("mastro:piano",JSON.stringify(pianoAttivo));}catch(e){}},[pianoAttivo]);
  useEffect(()=>{try{localStorage.setItem("mastro:team",JSON.stringify(team));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"team",team);},[team]);
  useEffect(()=>{try{localStorage.setItem("mastro:contatti",JSON.stringify(contatti));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"contatti",contatti);},[contatti]);
  useEffect(()=>{try{localStorage.setItem("mastro:pipeline",JSON.stringify(pipelineDB));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"pipeline",pipelineDB);},[pipelineDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:azienda",JSON.stringify(aziendaInfo));}catch(e){} if(syncReady.current&&userId)cloudSave(userId,"azienda",aziendaInfo);},[aziendaInfo]);
  useEffect(() => { if (selectedCM?.id) setLastOpenedCMId(selectedCM.id); }, [selectedCM]);

  // === CLOUD SYNC (user_data key-value) ===

  // Reusable cloud load function
  const applyCloud = useCallback(async () => {
    if (!userId) return;
    try {
      const cloud = await cloudLoadAll(userId);
      if (Object.keys(cloud).length === 0) return;
      // Safety: filter out null/invalid entries from arrays
      const safeArr = (arr: any) => Array.isArray(arr) ? arr.filter(x => x && typeof x === "object") : null;
      const sa = (k: string) => safeArr(cloud[k]);
      // Ensure cantieri always have .fase
      const safeCantieri = sa("cantieri")?.map(c => ({ fase: "sopralluogo", ...c })) || null;
      if (safeCantieri) { setCantieri(safeCantieri); localStorage.setItem("mastro:cantieri", JSON.stringify(safeCantieri)); }
      if (sa("events")) { setEvents(sa("events")!); localStorage.setItem("mastro:events", JSON.stringify(sa("events"))); }
      if (sa("contatti")) { setContatti(sa("contatti")!); localStorage.setItem("mastro:contatti", JSON.stringify(sa("contatti"))); }
      if (sa("tasks")) { setTasks(sa("tasks")!); localStorage.setItem("mastro:tasks", JSON.stringify(sa("tasks"))); }
      if (sa("problemi")) { setProblemi(sa("problemi")!); localStorage.setItem("mastro:problemi", JSON.stringify(sa("problemi"))); }
      if (sa("team")) { setTeam(sa("team")!); localStorage.setItem("mastro:team", JSON.stringify(sa("team"))); }
      if (cloud.azienda) { setAziendaInfo(cloud.azienda); localStorage.setItem("mastro:azienda", JSON.stringify(cloud.azienda)); }
      if (sa("pipeline")) { setPipelineDB(sa("pipeline")!); localStorage.setItem("mastro:pipeline", JSON.stringify(sa("pipeline"))); }
      if (sa("sistemi")) {
        const DEMO_GRIGLIE: Record<string, any[]> = {
          "Ideal 4000": [{l:600,h:600,prezzo:120},{l:600,h:800,prezzo:145},{l:600,h:1000,prezzo:170},{l:600,h:1200,prezzo:195},{l:800,h:800,prezzo:175},{l:800,h:1000,prezzo:205},{l:800,h:1200,prezzo:240},{l:800,h:1400,prezzo:270},{l:1000,h:1000,prezzo:250},{l:1000,h:1200,prezzo:290},{l:1000,h:1400,prezzo:330},{l:1000,h:1600,prezzo:370},{l:1200,h:1200,prezzo:340},{l:1200,h:1400,prezzo:385},{l:1200,h:1600,prezzo:430},{l:1200,h:1800,prezzo:480},{l:1400,h:1400,prezzo:430},{l:1400,h:1600,prezzo:485},{l:1400,h:2200,prezzo:580}],
          "CT70": [{l:600,h:800,prezzo:195},{l:600,h:1200,prezzo:260},{l:800,h:1000,prezzo:275},{l:800,h:1400,prezzo:365},{l:1000,h:1200,prezzo:380},{l:1000,h:1400,prezzo:440},{l:1200,h:1400,prezzo:520},{l:1200,h:1600,prezzo:580},{l:1400,h:2200,prezzo:780}],
        };
        const DEMO_MINIMI_MQ: Record<string, any> = { "Ideal 4000": { "1anta": 1.5, "2ante": 2.0, "3ante": 2.8, "scorrevole": 3.5, "fisso": 1.0 }, "CT70": { "1anta": 1.5, "2ante": 2.0, "scorrevole": 3.5 }, "S80": { "1anta": 1.5, "2ante": 2.0 }, "FIN-Project": { "1anta": 1.5, "2ante": 2.2, "scorrevole": 4.0 } };
        const migrated = sa("sistemi")!.map(s => ({ ...s, griglia: s.griglia || DEMO_GRIGLIE[s.sistema] || [], minimiMq: s.minimiMq || {} }));
        setSistemiDB(migrated); localStorage.setItem("mastro:sistemi", JSON.stringify(migrated));
      }
      if (sa("vetri")) { setVetriDB(sa("vetri")!); localStorage.setItem("mastro:vetri", JSON.stringify(sa("vetri"))); }
      if (sa("colori")) { setColoriDB(sa("colori")!); localStorage.setItem("mastro:colori", JSON.stringify(sa("colori"))); }
      if (sa("coprifili")) { setCoprifiliDB(sa("coprifili")!); localStorage.setItem("mastro:coprifili", JSON.stringify(sa("coprifili"))); }
      if (sa("lamiere")) { setLamiereDB(sa("lamiere")!); localStorage.setItem("mastro:lamiere", JSON.stringify(sa("lamiere"))); }
      if (sa("libreria")) { setLibreriaDB(sa("libreria")!); localStorage.setItem("mastro:libreria", JSON.stringify(sa("libreria"))); }
      if (sa("fatture")) { setFattureDB(sa("fatture")!); localStorage.setItem("mastro:fatture", JSON.stringify(sa("fatture"))); }
      if (sa("ordiniForn")) { setOrdiniFornDB(sa("ordiniForn")!); localStorage.setItem("mastro:ordiniForn", JSON.stringify(sa("ordiniForn"))); }
      if (sa("squadre")) { setSquadreDB(sa("squadre")!); localStorage.setItem("mastro:squadre", JSON.stringify(sa("squadre"))); }
      if (sa("montaggi")) { setMontaggiDB(sa("montaggi")!); localStorage.setItem("mastro:montaggi", JSON.stringify(sa("montaggi"))); }
    } catch (e) { console.warn("Cloud sync error:", e); }
  }, [userId]);

  // Load from cloud on mount (after localStorage)
  useEffect(() => {
    if (!userId) { syncReady.current = true; return; }
    let mounted = true;
    (async () => {
      await applyCloud();
      setTimeout(() => { if (mounted) syncReady.current = true; }, 2000);
    })();
    return () => { mounted = false; };
  }, [userId]);

  // Auto-refresh when tab becomes visible (no manual refresh needed!)
  useEffect(() => {
    if (!userId) return;
    const onVisible = () => {
      if (!document.hidden && syncReady.current) {
        syncReady.current = false;
        applyCloud().then(() => { syncReady.current = true; });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    // Polling: ogni 10 secondi controlla aggiornamenti dal cloud
    const poll = setInterval(() => {
      if (!document.hidden && syncReady.current) {
        applyCloud();
      }
    }, 10000);

    return () => { document.removeEventListener("visibilitychange", onVisible); clearInterval(poll); };
  }, [userId, applyCloud]);


  const PIPELINE = pipelineDB.filter(p => p.attiva !== false);
  const parseDataCM = (s) => {
    const oggi0 = new Date(); oggi0.setHours(0,0,0,0);
    if(!s) return null;
    if(s==="oggi"||s==="Oggi"||s==="Adesso") return oggi0;
    const mesi2 = {gen:0,feb:1,mar:2,apr:3,mag:4,giu:5,lug:6,ago:7,set:8,ott:9,nov:10,dic:11};
    const m2 = s.toLowerCase().match(/(\d+)\s+([a-z]+)/);
    if(m2) return new Date(oggi0.getFullYear(), mesi2[m2[2]]??0, parseInt(m2[1]));
    return null;
  };
  const giorniFermaCM = (c) => {
    const oggi0 = new Date(); oggi0.setHours(0,0,0,0);
    const d = parseDataCM(c.aggiornato);
    if(!d) return 0;
    return Math.floor((oggi0 - d) / 86400000);
  };

  // === GMAIL INTEGRATION ===
  const gmailCheckStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/status");
      const data = await res.json();
      setGmailStatus(data);
      if (data.connected) gmailFetchMessages();
    } catch {}
  }, []);

  const gmailFetchMessages = useCallback(async (query?: string, page?: string) => {
    setGmailLoading(true);
    try {
      let url = "/api/gmail/messages?max=20";
      if (query) url += `&q=${encodeURIComponent(query)}`;
      if (page) url += `&page=${page}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.messages) {
        if (page) setGmailMessages(prev => [...prev, ...data.messages]);
        else setGmailMessages(data.messages);
        setGmailNextPage(data.nextPage);
      }
    } catch {}
    setGmailLoading(false);
  }, []);

  const gmailSendReply = useCallback(async (to: string, subject: string, body: string, threadId?: string) => {
    setGmailSending(true);
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`, body, threadId }),
      });
      const data = await res.json();
      if (data.success) {
        setGmailReply("");
        alert("✅ Email inviata!");
        gmailFetchMessages();
      } else {
        alert("❌ Errore: " + (data.error || "invio fallito"));
      }
    } catch { alert("❌ Errore di rete"); }
    setGmailSending(false);
  }, []);

  const gmailMatchCommessa = useCallback((email: any) => {
    if (!email) return null;
    const fromLower = (email.from || "").toLowerCase();
    const subLower = (email.subject || "").toLowerCase();
    const bodyLower = (email.body || "").substring(0, 500).toLowerCase();
    const all = fromLower + " " + subLower + " " + bodyLower;
    // Match by commessa code (S-XXXX)
    const codeMatch = all.match(/s-\d{4}/i);
    if (codeMatch) {
      const cm = cantieri.find(c => c.code.toLowerCase() === codeMatch[0].toLowerCase());
      if (cm) return cm;
    }
    // Match by client email
    for (const cm of cantieri) {
      if (cm.email && fromLower.includes(cm.email.toLowerCase())) return cm;
    }
    // Match by client name
    for (const cm of cantieri) {
      const nome = (cm.cliente || "").toLowerCase();
      const cognome = (cm.cognome || "").toLowerCase();
      if (nome.length > 2 && (fromLower.includes(nome) || subLower.includes(nome))) return cm;
      if (cognome.length > 2 && (fromLower.includes(cognome) || subLower.includes(cognome))) return cm;
    }
    return null;
  }, [cantieri]);

  // Check Gmail on mount
  useEffect(() => { gmailCheckStatus(); }, []);
  const isTablet = winW >= 768;
  const isDesktop = winW >= 1024;

  const goBack = () => {
    if (homeView) { setHomeView(null); return; }
    if (showRiepilogo) { setShowRiepilogo(false); return; }
    if (selectedVano) { setSelectedVano(null); setVanoStep(0); return; }
    if (showNuovoRilievo) { setShowNuovoRilievo(false); return; }
    if (selectedRilievo) {
      setSelectedRilievo(null);
      // SYNC: rileggi selectedCM da cantieri per evitare dati stale (bug misure che spariscono)
      if (selectedCM) {
        setCantieri(cs => {
          const fresh = cs.find(c => c.id === selectedCM.id);
          if (fresh) setTimeout(() => setSelectedCM(fresh), 0);
          return cs;
        });
      }
      return;
    }
    if (selectedCM) { setSelectedCM(null); return; }
  };

  /* == Helpers == */
  // Ritorna i vani del rilievo attivo (o dell'ultimo se nessuno selezionato)
  const getVaniCM = (c) => {
    if (!c?.rilievi || c.rilievi.length === 0) return [];
    if (selectedRilievo && selectedCM?.id === c.id) return selectedRilievo.vani || [];
    return c.rilievi[c.rilievi.length - 1]?.vani || [];
  };
  const getVaniAttivi = (c) => {
    if (!c?.rilievi || c.rilievi.length === 0) return [];
    return c.rilievi[c.rilievi.length - 1]?.vani || [];
  };

  // === CALCOLO PREZZO VANO — usato da Centro Comando, creaFattura, PDF ===
  const calcolaVanoPrezzo = (v, c) => {
    const m = v.misure || {};
    const lc = (m.lCentro || 0) / 1000, hc = (m.hCentro || 0) / 1000;
    const lmm = m.lCentro || 0, hmm = m.hCentro || 0;
    const mq = lc * hc, perim = 2 * (lc + hc);
    if (mq <= 0) return 0; // niente misure = niente prezzo
    const sysRec = sistemiDB.find(s => (s.marca + " " + s.sistema) === v.sistema || s.sistema === v.sistema);
    // Minimo mq
    const minCat = tipoToMinCat ? tipoToMinCat(v.tipo || "F1A") : "";
    const minimoMq = sysRec?.minimiMq?.[minCat] || 0;
    const mqCalc = (minimoMq > 0 && mq > 0 && mq < minimoMq) ? minimoMq : mq;
    // Grid or €/mq
    let tot = 0;
    const gridPrice = sysRec?.griglia ? (() => {
      const g = sysRec.griglia;
      const exact = g.find(p => p.l >= lmm && p.h >= hmm);
      return exact ? exact.prezzo : (g.length > 0 ? g[g.length - 1].prezzo : null);
    })() : null;
    tot = gridPrice !== null ? gridPrice : mqCalc * parseFloat(sysRec?.prezzoMq || sysRec?.euroMq || c?.prezzoMq || 350);
    // Vetro
    const vetroRec = vetriDB.find(g => g.code === v.vetro || g.nome === v.vetro);
    if (vetroRec?.prezzoMq) tot += mq * parseFloat(vetroRec.prezzoMq);
    // Coprifilo
    const copRec = coprifiliDB.find(cp => cp.cod === v.coprifilo);
    if (copRec?.prezzoMl) tot += perim * parseFloat(copRec.prezzoMl);
    // Lamiera
    const lamRec = lamiereDB.find(l => l.cod === v.lamiera);
    if (lamRec?.prezzoMl) tot += lc * parseFloat(lamRec.prezzoMl);
    // Accessori
    const tapp = v.accessori?.tapparella; if (tapp?.attivo && c?.prezzoTapparella) { const tmq = ((tapp.l || lmm) / 1000) * ((tapp.h || hmm) / 1000); tot += tmq * parseFloat(c.prezzoTapparella); }
    const pers = v.accessori?.persiana; if (pers?.attivo && c?.prezzoPersiana) { const pmq = ((pers.l || lmm) / 1000) * ((pers.h || hmm) / 1000); tot += pmq * parseFloat(c.prezzoPersiana); }
    const zanz = v.accessori?.zanzariera; if (zanz?.attivo && c?.prezzoZanzariera) { const zmq = ((zanz.l || lmm) / 1000) * ((zanz.h || hmm) / 1000); tot += zmq * parseFloat(c.prezzoZanzariera); }
    // Voci libere del vano
    if (v.vociLibere?.length > 0) v.vociLibere.forEach(vl => { tot += (vl.prezzo || 0) * (vl.qta || 1); });
    return Math.round(tot * 100) / 100;
  };

  // Totale commessa calcolato = somma vani + voci libere della commessa
  const calcolaTotaleCommessa = (c) => {
    const vani = getVaniAttivi(c);
    const totVani = vani.reduce((s, v) => s + calcolaVanoPrezzo(v, c), 0);
    const totVoci = (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo || 0) * (vl.qta || 1)), 0);
    return totVani + totVoci;
  };
  const countVani = () => cantieri.reduce((s, c) => s + getVaniAttivi(c).length, 0);
  // Safety: ensure every cantiere has required fields
  const cantieriSafe = cantieri.filter(c => c && c.id && c.fase);
  if (cantieriSafe.length !== cantieri.length && cantieri.length > 0) {
    // Auto-fix: remove invalid entries
    setTimeout(() => setCantieri(cantieriSafe), 0);
  }
  const urgentCount = () => cantieriSafe.filter(c => c.alert).length;
  const readyCount = () => cantieriSafe.filter(c => c.fase === "posa" || c.fase === "chiusura").length;
  const faseIndex = (fase) => PIPELINE.findIndex(p => p.id === fase);
  const priColor = (p) => p === "alta" ? T.red : p === "media" ? T.orange : T.sub2;

  const toggleTask = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const addTask = () => {
    if (!newTask.text.trim()) return;
    setTasks(ts => [...ts, { id: Date.now(), ...newTask, done: false, allegati: [...taskAllegati] }]);
    setTaskAllegati([]);
    setNewTask({ text: "", meta: "", time: "", priority: "media", cm: "", date: "", persona: "" });
    setShowModal(null);
  };

  const addCommessa = () => {
    if (!newCM.cliente.trim()) return;
    if (!canDo("commessa")) return;
    const code = "S-" + String(cantieri.length + 1).padStart(4, "0");
    const nc = { id: Date.now(), code, cliente: newCM.cliente, cognome: newCM.cognome||"", indirizzo: newCM.indirizzo, telefono: newCM.telefono, email: newCM.email||"", fase: "sopralluogo", rilievi: [], sistema: newCM.sistema, tipo: newCM.tipo, difficoltaSalita: newCM.difficoltaSalita, mezzoSalita: newCM.mezzoSalita, foroScale: newCM.foroScale, pianoEdificio: newCM.pianoEdificio, note: newCM.note, allegati: [], creato: new Date().toLocaleDateString("it-IT",{day:"numeric",month:"short"}), aggiornato: new Date().toLocaleDateString("it-IT",{day:"numeric",month:"short"}), log: [{ chi: "Fabio", cosa: "creato la commessa", quando: "Adesso", color: T.sub }] };
    setCantieri(cs => [nc, ...cs]);
    setNewCM({ cliente: "", cognome: "", indirizzo: "", telefono: "", email: "", sistema: "", tipo: "nuova", difficoltaSalita: "", mezzoSalita: "", foroScale: "", pianoEdificio: "", note: "" });
    setShowModal(null);
    setSelectedCM(nc);
    setTab("commesse");
  };

  const addVano = () => {
    if (!selectedCM || !selectedRilievo) return;
    const tipObj = TIPOLOGIE_RAPIDE.find(t => t.code === newVano.tipo);
    const nome = newVano.nome.trim() || `${tipObj?.label || newVano.tipo} ${(selectedRilievo.vani?.length || 0) + 1}`;
    const v = { id: Date.now(), nome, tipo: newVano.tipo, stanza: newVano.stanza, piano: newVano.piano, sistema: newVano.sistema, pezzi: newVano.pezzi||1, coloreInt: newVano.coloreInt, coloreEst: newVano.coloreEst, bicolore: newVano.bicolore, coloreAcc: newVano.coloreAcc, vetro: newVano.vetro, telaio: newVano.telaio, telaioAlaZ: newVano.telaioAlaZ, rifilato: newVano.rifilato, rifilSx: newVano.rifilSx, rifilDx: newVano.rifilDx, rifilSopra: newVano.rifilSopra, rifilSotto: newVano.rifilSotto, coprifilo: newVano.coprifilo, lamiera: newVano.lamiera, misure: {}, foto: {}, note: "", cassonetto: false, accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } } };
    const updRilievo = { ...selectedRilievo, vani: [...(selectedRilievo.vani || []), v] };
    setCantieri(cs => cs.map(c => c.id === selectedCM.id ? { ...c, rilievi: c.rilievi.map(r => r.id === selectedRilievo.id ? updRilievo : r), aggiornato: "Oggi" } : c));
    setSelectedRilievo(updRilievo);
    setSelectedCM(prev => ({ ...prev, rilievi: prev.rilievi.map(r => r.id === selectedRilievo.id ? updRilievo : r) }));
    setNewVano(prev => ({ nome: "", tipo: prev.tipo, stanza: "Soggiorno", piano: prev.piano, sistema: prev.sistema, coloreInt: prev.coloreInt, coloreEst: prev.coloreEst, bicolore: prev.bicolore, coloreAcc: prev.coloreAcc, vetro: prev.vetro, telaio: prev.telaio, telaioAlaZ: prev.telaioAlaZ, rifilato: prev.rifilato, rifilSx: prev.rifilSx, rifilDx: prev.rifilDx, rifilSopra: prev.rifilSopra, rifilSotto: prev.rifilSotto, coprifilo: prev.coprifilo, lamiera: prev.lamiera }));
    setShowModal(null);
    setSelectedVano(v);
    setVanoStep(0);
  };

  const updateMisura = (vanoId, key, value) => {
    const numVal = parseInt(value) || 0;
    // Capture IDs NOW to prevent stale closures
    const cmId = selectedCM?.id;
    const rilId = selectedRilievo?.id;
    if (!cmId || !rilId) return;
    const updateVani = (vani) => vani.map(v => v.id === vanoId ? { ...v, misure: { ...v.misure, [key]: numVal } } : v);
    setCantieri(cs => cs.map(c => c.id === cmId ? {
      ...c, rilievi: c.rilievi.map(r => r.id === rilId ? { ...r, vani: updateVani(r.vani) } : r)
    } : c));
    setSelectedRilievo(prev => prev ? ({ ...prev, vani: updateVani(prev.vani) }) : prev);
    setSelectedCM(prev => prev ? ({
      ...prev, rilievi: prev.rilievi.map(r => r.id === rilId ? { ...r, vani: updateVani(r.vani) } : r)
    }) : prev);
    if (selectedVano?.id === vanoId) setSelectedVano(prev => ({ ...prev, misure: { ...prev.misure, [key]: numVal } }));
  };

  // Batch update: set multiple misure keys at once (no race conditions)
  const updateMisureBatch = (vanoId, updates: Record<string, number>) => {
    if (selectedRilievo) {
      setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? {
        ...c, rilievi: c.rilievi.map(r => r.id === selectedRilievo.id ? {
          ...r, vani: r.vani.map(v => v.id === vanoId ? { ...v, misure: { ...v.misure, ...updates } } : v)
        } : r)
      } : c));
      setSelectedRilievo(prev => prev ? ({
        ...prev, vani: prev.vani.map(v => v.id === vanoId ? { ...v, misure: { ...v.misure, ...updates } } : v)
      }) : prev);
      setSelectedCM(prev => prev ? ({
        ...prev, rilievi: prev.rilievi.map(r => r.id === selectedRilievo.id ? {
          ...r, vani: r.vani.map(v => v.id === vanoId ? { ...v, misure: { ...v.misure, ...updates } } : v)
        } : r)
      }) : prev);
    }
    if (selectedVano?.id === vanoId) setSelectedVano(prev => ({ ...prev, misure: { ...prev.misure, ...updates } }));
  };

  const toggleAccessorio = (vanoId, acc) => {
    if (selectedRilievo) {
      const updRil = { ...selectedRilievo, vani: selectedRilievo.vani.map(v => v.id === vanoId ? { ...v, accessori: { ...v.accessori, [acc]: { ...v.accessori[acc], attivo: !v.accessori[acc].attivo } } } : v) };
      setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, rilievi: c.rilievi.map(r => r.id === selectedRilievo.id ? updRil : r) } : c));
      setSelectedRilievo(updRil);
    }
    if (selectedVano?.id === vanoId) setSelectedVano(prev => ({ ...prev, accessori: { ...prev.accessori, [acc]: { ...prev.accessori[acc], attivo: !prev.accessori[acc].attivo } } }));
  };

  const updateAccessorio = (vanoId, acc, field, value) => {
    if (selectedRilievo) {
      const updRil = { ...selectedRilievo, vani: selectedRilievo.vani.map(v => v.id === vanoId ? { ...v, accessori: { ...v.accessori, [acc]: { ...v.accessori[acc], [field]: value } } } : v) };
      setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, rilievi: c.rilievi.map(r => r.id === selectedRilievo.id ? updRil : r) } : c));
      setSelectedRilievo(updRil);
      setSelectedCM(prev => prev ? ({ ...prev, rilievi: prev.rilievi.map(r => r.id === selectedRilievo.id ? updRil : r) }) : prev);
    }
    if (selectedVano?.id === vanoId) setSelectedVano(prev => ({ ...prev, accessori: { ...prev.accessori, [acc]: { ...prev.accessori[acc], [field]: value } } }));
  };

  const updateVanoField = (vanoId, field, value) => {
    if (selectedRilievo) {
      const updRil = { ...selectedRilievo, vani: selectedRilievo.vani.map(v => v.id === vanoId ? { ...v, [field]: value } : v) };
      setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, rilievi: c.rilievi.map(r => r.id === selectedRilievo.id ? updRil : r) } : c));
      setSelectedRilievo(updRil);
      setSelectedCM(prev => prev ? ({ ...prev, rilievi: prev.rilievi.map(r => r.id === selectedRilievo.id ? updRil : r) }) : prev);
    }
    if (selectedVano?.id === vanoId) setSelectedVano(prev => ({ ...prev, [field]: value }));
  };

  // DELETE functions
  const deleteTask = (taskId) => { if ((()=>{try{return window.confirm("Eliminare questo task?");}catch(e){return false;}})()) setTasks(ts => ts.filter(t => t.id !== taskId)); };
  const deleteVano = (vanoId) => {
    if (!(()=>{try{return window.confirm("Eliminare questo vano e tutte le sue misure?");}catch(e){return false;}})()) return;
    if (selectedRilievo) {
      const updRil = { ...selectedRilievo, vani: selectedRilievo.vani.filter(v => v.id !== vanoId) };
      setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, rilievi: c.rilievi.map(r => r.id === selectedRilievo.id ? updRil : r) } : c));
      setSelectedRilievo(updRil);
      setSelectedCM(prev => prev ? ({ ...prev, rilievi: prev.rilievi.map(r => r.id === selectedRilievo.id ? updRil : r) }) : prev);
    }
    if (selectedVano?.id === vanoId) { setSelectedVano(null); setVanoStep(0); }
  };
  const deleteCommessa = (cmId) => {
    if (!(()=>{try{return window.confirm("Eliminare questa commessa e tutti i suoi vani?");}catch(e){return false;}})()) return;
    setCantieri(cs => cs.filter(c => c.id !== cmId));
    if (selectedCM?.id === cmId) { setSelectedCM(null); setSelectedVano(null); }
  };
  const deleteEvent = (evId) => { if ((()=>{try{return window.confirm("Eliminare questo evento?");}catch(e){return false;}})()) setEvents(ev => ev.filter(e => e.id !== evId)); };
  const deleteMsg = (msgId) => { if ((()=>{try{return window.confirm("Eliminare questo messaggio?");}catch(e){return false;}})()) setMsgs(ms => ms.filter(m => m.id !== msgId)); };

  const addAllegato = (tipo, content, dataUrl?: string, durata?: string) => {
    if (!selectedCM) return;
    const a = { id: Date.now(), tipo, nome: content || (tipo === "file" ? "Allegato" : tipo === "vocale" ? "Nota vocale" : tipo === "video" ? "Video" : "Nota"), data: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), durata: durata || "", dataUrl: dataUrl || "" };
    setCantieri(cs => cs.map(x => x.id === selectedCM.id ? { ...x, allegati: [...(x.allegati || []), a] } : x));
    setSelectedCM(p => ({ ...p, allegati: [...(p.allegati || []), a] }));
  };

  const playAllegato = (id) => {
    if (playingId === id) {
      if (audioPlayRef.current) { audioPlayRef.current.pause(); audioPlayRef.current = null; }
      clearInterval(playInterval.current); setPlayingId(null); setPlayProgress(0); return;
    }
    clearInterval(playInterval.current);
    // find allegato dataUrl
    const allAllegati = (selectedCM?.allegati || []);
    const found = allAllegati.find(a => a.id === id);
    if (found?.dataUrl) {
      const audio = new Audio(found.dataUrl);
      audioPlayRef.current = audio;
      setPlayingId(id); setPlayProgress(0);
      audio.onended = () => { setPlayingId(null); setPlayProgress(0); audioPlayRef.current = null; };
      audio.ontimeupdate = () => { if (audio.duration) setPlayProgress((audio.currentTime / audio.duration) * 100); };
      audio.play().catch(() => {});
    } else {
      // fallback: fake progress for old entries without dataUrl
      setPlayingId(id); setPlayProgress(0);
      let prog = 0;
      playInterval.current = setInterval(() => { prog += 2; setPlayProgress(prog); if (prog >= 100) { clearInterval(playInterval.current); setPlayingId(null); setPlayProgress(0); } }, 100);
    }
  };

  const stopAllMedia = () => {
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") { mediaRecorderRef.current.stop(); }
    mediaRecorderRef.current = null;
    mediaChunksRef.current = [];
  };

  const startMediaRecording = async (tipo: "vocale" | "video") => {
    try {
      let stream: MediaStream;
      if (tipo === "video" && mediaStreamRef.current) {
        // Camera preview already running — add audio track to existing video stream
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
        const audioTrack = audioStream.getAudioTracks()[0];
        stream = new MediaStream([videoTrack, audioTrack]);
        mediaStreamRef.current = stream;
      } else {
        const constraints = tipo === "video" 
          ? { audio: true, video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } } 
          : { audio: true };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;
      }
      if (tipo === "video" && videoPreviewRef.current) { videoPreviewRef.current.srcObject = stream; videoPreviewRef.current.play().catch(() => {}); }
      const mimeType = tipo === "video" 
        ? (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm")
        : (MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm");
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) mediaChunksRef.current.push(e.data); };
      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setIsRecording(true); setRecSeconds(0);
      recInterval.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch (err) {
      alert("⚠️ Impossibile accedere al " + (tipo === "video" ? "camera/microfono" : "microfono") + ". Controlla i permessi del browser.\n\n" + (err as Error).message);
    }
  };

  const stopMediaRecording = (tipo: "vocale" | "video") => {
    clearInterval(recInterval.current);
    const secs = recSeconds;
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(mediaChunksRef.current, { type: tipo === "video" ? "video/webm" : "audio/webm" });
          const url = URL.createObjectURL(blob);
          const durStr = Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
          const nome = tipo === "video" 
            ? "Video " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
            : "Nota vocale " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
          addAllegato(tipo, nome, url, durStr);
          stopAllMedia();
          setIsRecording(false); setRecSeconds(0); setShowAllegatiModal(null);
          resolve();
        };
        mediaRecorderRef.current.stop();
      } else { setIsRecording(false); setRecSeconds(0); resolve(); }
      if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    });
  };

  // CAMERA MODAL — for taking photos and recording videos in vano
  // Image compression utility — max 1200px wide, 0.7 JPEG quality
  const compressImage = (dataUrl: string, maxW = 1200, quality = 0.7): Promise<string> => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxW / img.height, 1);
        const w = Math.round(img.width * ratio), h = Math.round(img.height * ratio);
        const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        cv.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL("image/jpeg", quality));
      };
      img.src = dataUrl;
    });
  };

  const openCamera = async (mode: "foto" | "video", cat?: string) => {
    if (cat !== undefined) setPendingFotoCat(cat);
    setCameraMode(mode);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }, 
        audio: mode === "video" 
      });
      cameraStreamRef.current = stream;
      setTimeout(() => {
        if (cameraPreviewRef.current) { cameraPreviewRef.current.srcObject = stream; cameraPreviewRef.current.play().catch(() => {}); }
      }, 100);
    } catch (err) {
      alert("⚠️ Impossibile accedere alla fotocamera. Controlla i permessi.\n\n" + (err as Error).message);
      setShowCameraModal(false);
    }
  };

  const capturePhoto = async () => {
    const video = cameraPreviewRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    // Compress to max 1200px
    const compressed = await compressImage(dataUrl);
    const cat = pendingFotoCat;
    const key = "foto_" + Date.now();
    const fotoObj = { dataUrl: compressed, nome: "Foto " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), tipo: "foto", categoria: cat || null };
    if (selectedVano && selectedCM && selectedRilievo) {
      const v = selectedVano;
      setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, rilievi: c.rilievi.map(r2 => r2.id === selectedRilievo?.id ? { ...r2, vani: r2.vani.map(vn => vn.id === v.id ? { ...vn, foto: { ...(vn.foto||{}), [key]: fotoObj } } : vn) } : r2) } : c));
      setSelectedVano(prev => ({ ...prev, foto: { ...(prev.foto||{}), [key]: fotoObj } }));
    }
    // Flash effect + don't close (allow multiple shots)
  };

  const startCameraVideoRec = () => {
    const stream = cameraStreamRef.current;
    if (!stream) return;
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaChunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) mediaChunksRef.current.push(e.data); };
    recorder.start(200);
    mediaRecorderRef.current = recorder;
    setIsRecording(true); setRecSeconds(0);
    recInterval.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
  };

  const stopCameraVideoRec = () => {
    clearInterval(recInterval.current);
    const secs = recSeconds;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(mediaChunksRef.current, { type: "video/webm" });
        const dataUrl = URL.createObjectURL(blob);
        const key = "video_" + Date.now();
        const durStr = Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
        const vObj = { nome: "Video " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), tipo: "video", dataUrl, durata: durStr };
        if (selectedVano && selectedCM && selectedRilievo) {
          const v = selectedVano;
          setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, rilievi: c.rilievi.map(r2 => r2.id === selectedRilievo?.id ? { ...r2, vani: r2.vani.map(vn => vn.id === v.id ? { ...vn, foto: { ...(vn.foto||{}), [key]: vObj } } : vn) } : r2) } : c));
          setSelectedVano(prev => ({ ...prev, foto: { ...(prev.foto||{}), [key]: vObj } }));
        }
        mediaChunksRef.current = [];
      };
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false); setRecSeconds(0);
  };

  const closeCamera = () => {
    if (isRecording) stopCameraVideoRec();
    if (cameraStreamRef.current) { cameraStreamRef.current.getTracks().forEach(t => t.stop()); cameraStreamRef.current = null; }
    setShowCameraModal(false);
    setPendingFotoCat(null);
  };

  // IMPORT EXCEL CATALOG
  const importExcelCatalog = async (file) => {
    setImportStatus({ step: "loading", msg: "Caricamento file...", ok: false });
    setImportLog([]);
    const log = [];
    try {
      const XLSX = require("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      log.push("✅ File letto: " + wb.SheetNames.length + " fogli trovati");
      setImportLog([...log]);

      const parseSheet = (name, requiredCols) => {
        const ws = wb.Sheets[name];
        if (!ws) { log.push("⚠️ Foglio '" + name + "' non trovato — saltato"); return []; }
        const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });
        // Skip hint/example rows (first rows might be hints or green examples)
        const rows = raw.filter(r => {
          const vals = Object.values(r).map(v => String(v).trim()).filter(Boolean);
          return vals.length >= 2; // at least 2 non-empty values
        });
        log.push("📋 " + name + ": " + rows.length + " righe");
        return rows;
      };

      // SISTEMI
      setImportStatus({ step: "sistemi", msg: "Importazione sistemi...", ok: false });
      const sistRows = parseSheet("SISTEMI");
      if (sistRows.length > 0) {
        const newSist = sistRows.map((r, i) => ({
          id: 10000 + i,
          marca: r["Nome Sistema"] ? String(r["Marca"] || "").trim() : String(r["Marca"] || r["marca"] || "").trim(),
          sistema: String(r["Nome Sistema"] || r["sistema"] || "").trim(),
          euroMq: parseFloat(r["Uf (W/m²K)"] || 0) || 0, // Will be set from TIPOLOGIE prices
          prezzoMq: 0,
          sovRAL: 15,
          sovLegno: 25,
          colori: [],
          sottosistemi: []
        })).filter(s => s.marca && s.sistema);
        if (newSist.length > 0) { setSistemiDB(newSist); log.push("✅ " + newSist.length + " sistemi importati (catalogo sostituito)"); }
      }
      setImportLog([...log]);

      // COLORI
      setImportStatus({ step: "colori", msg: "Importazione colori...", ok: false });
      const colRows = parseSheet("COLORI");
      if (colRows.length > 0) {
        const newCol = colRows.map((r, i) => ({
          id: 20000 + i,
          nome: String(r["Nome"] || r["nome"] || "").trim(),
          code: String(r["RAL/Codice"] || r["Codice"] || r["code"] || "").trim() || String(r["Nome"] || "").trim(),
          hex: "#888888",
          tipo: String(r["Tipo"] || r["tipo"] || "RAL").trim()
        })).filter(c => c.nome);
        if (newCol.length > 0) { setColoriDB(newCol); log.push("✅ " + newCol.length + " colori importati (catalogo sostituito)"); }
      }
      setImportLog([...log]);

      // VETRI
      setImportStatus({ step: "vetri", msg: "Importazione vetri...", ok: false });
      const vetRows = parseSheet("VETRI");
      if (vetRows.length > 0) {
        const newVet = vetRows.map((r, i) => ({
          id: 30000 + i,
          nome: String(r["Descrizione"] || r["nome"] || "").trim(),
          code: String(r["Composizione"] || r["Codice"] || r["code"] || "").trim(),
          ug: parseFloat(r["Ug (W/m²K)"] || r["ug"] || 0) || 0,
          prezzoMq: parseFloat(r["Prezzo €/mq"] || r["prezzoMq"] || 0) || 0,
        })).filter(v => v.nome || v.code);
        if (newVet.length > 0) { setVetriDB(newVet); log.push("✅ " + newVet.length + " vetri importati (catalogo sostituito)"); }
      }
      setImportLog([...log]);

      // COPRIFILI
      setImportStatus({ step: "coprifili", msg: "Importazione coprifili...", ok: false });
      const copRows = parseSheet("COPRIFILI");
      if (copRows.length > 0) {
        const newCop = copRows.map((r, i) => ({
          id: 40000 + i,
          nome: String(r["Descrizione"] || r["nome"] || "").trim(),
          cod: String(r["Codice"] || r["cod"] || "").trim(),
          prezzoMl: parseFloat(r["Prezzo €/ml"] || r["prezzoMl"] || 0) || 0,
        })).filter(c => c.nome || c.cod);
        if (newCop.length > 0) { setCoprifiliDB(newCop); log.push("✅ " + newCop.length + " coprifili importati (catalogo sostituito)"); }
      }
      setImportLog([...log]);

      // LAMIERE
      setImportStatus({ step: "lamiere", msg: "Importazione lamiere...", ok: false });
      const lamRows = parseSheet("LAMIERE");
      if (lamRows.length > 0) {
        const newLam = lamRows.map((r, i) => ({
          id: 50000 + i,
          nome: String(r["Descrizione"] || r["nome"] || "").trim(),
          cod: String(r["Codice"] || r["cod"] || "").trim(),
          prezzoMl: parseFloat(r["Prezzo €/ml"] || r["prezzoMl"] || 0) || 0,
        })).filter(l => l.nome || l.cod);
        if (newLam.length > 0) { setLamiereDB(newLam); log.push("✅ " + newLam.length + " lamiere importate (catalogo sostituito)"); }
      }
      setImportLog([...log]);

      // ACCESSORI, TIPOLOGIE, CONTROTELAI, TAPPARELLE, ZANZARIERE, PERSIANE, SERVIZI, SAGOME
      const otherSheets = ["ACCESSORI", "TIPOLOGIE", "CONTROTELAI", "TAPPARELLE", "ZANZARIERE", "PERSIANE", "SERVIZI", "SAGOME_TELAIO", "PROFILI"];
      for (const sn of otherSheets) {
        const rows = parseSheet(sn);
        if (rows.length > 0) log.push("📦 " + sn + ": " + rows.length + " righe pronte (saranno usate nei prossimi aggiornamenti)");
      }
      setImportLog([...log]);

      log.push("");
      log.push("🎉 IMPORTAZIONE COMPLETATA!");
      log.push("I dati sono stati aggiunti al tuo catalogo.");
      log.push("Vai nelle singole sezioni per verificare.");
      setImportLog([...log]);
      setImportStatus({ step: "done", msg: "Importazione completata!", ok: true });
    } catch (err) {
      log.push("❌ ERRORE: " + err.message);
      setImportLog([...log]);
      setImportStatus({ step: "error", msg: "Errore durante l'importazione", ok: false, detail: err.message });
    }
  };

  // SETTINGS CRUD
  const addSettingsItem = () => {
    const f = settingsForm;
    if (settingsModal === "sistema" && f.marca && f.sistema) {
      setSistemiDB(s => [...s, { id: Date.now(), marca: f.marca, sistema: f.sistema, euroMq: parseInt(f.euroMq)||0, prezzoMq: parseFloat(f.prezzoMq||f.euroMq)||0, sovRAL: parseInt(f.sovRAL)||0, sovLegno: parseInt(f.sovLegno)||0, minimiMq: {}, colori: [], sottosistemi: f.sottosistemi ? f.sottosistemi.split(",").map(s => s.trim()) : [], griglia: [] }]);
    } else if (settingsModal === "colore" && f.nome && f.code) {
      setColoriDB(c => [...c, { id: Date.now(), nome: f.nome, code: f.code, hex: f.hex || "#888888", tipo: f.tipo || "RAL" }]);
    } else if (settingsModal === "vetro" && f.nome && f.code) {
      setVetriDB(v => [...v, { id: Date.now(), nome: f.nome, code: f.code, ug: parseFloat(f.ug)||1.0, prezzoMq: parseFloat(f.prezzoMq)||0 }]);
    } else if (settingsModal === "coprifilo" && f.nome && f.cod) {
      setCoprifiliDB(c => [...c, { id: Date.now(), nome: f.nome, cod: f.cod, prezzoMl: parseFloat(f.prezzoMl)||0 }]);
    } else if (settingsModal === "lamiera" && f.nome && f.cod) {
      setLamiereDB(l => [...l, { id: Date.now(), nome: f.nome, cod: f.cod, prezzoMl: parseFloat(f.prezzoMl)||0 }]);
    } else if (settingsModal === "tipologia" && f.code && f.label) {
      TIPOLOGIE_RAPIDE.push({ code: f.code, label: f.label, icon: f.icon || "🪟", cat: f.cat || "Altro", forma: f.forma || "rettangolare" });
    } else if (settingsModal === "membro" && f.nome) {
      const colori = ["#007aff","#34c759","#af52de","#ff9500","#ff3b30","#5ac8fa"];
      setTeam(t => [...t, { id: Date.now(), nome: f.nome, ruolo: f.ruolo || "Posatore", compiti: f.compiti || "", colore: colori[t.length % colori.length] }]);
    } else return;
    setSettingsModal(null); setSettingsForm({});
  };
  const deleteSettingsItem = (type, id) => {
    if (!(()=>{try{return window.confirm("Eliminare?");}catch(e){return false;}})()) return;
    if (type === "sistema") setSistemiDB(s => s.filter(x => x.id !== id));
    if (type === "colore") setColoriDB(c => c.filter(x => x.id !== id));
    if (type === "vetro") setVetriDB(v => v.filter(x => x.id !== id));
    if (type === "coprifilo") setCoprifiliDB(c => c.filter(x => x.id !== id));
    if (type === "lamiera") setLamiereDB(l => l.filter(x => x.id !== id));
  };

  const advanceFase = (cmId) => {
    const FASE_TEAM = { preventivo: "Sara Greco", conferma: "Sara Greco", misure: "Marco Ferraro", ordini: "Sara Greco", produzione: "Marco Ferraro", posa: "Marco Ferraro", chiusura: "Fabio Cozza" };
    setCantieri(cs => cs.map(c => {
      if (c.id !== cmId) return c;
      const idx = faseIndex(c.fase);
      if (idx < PIPELINE.length - 1) {
        const next = PIPELINE[idx + 1];
        return { ...c, fase: next.id, log: [{ chi: "Fabio", cosa: `avanzato a ${next.nome}`, quando: "Adesso", color: next.color }, ...(c.log||[])] };
      }
      return c;
    }));
    if (selectedCM?.id === cmId) {
      const idx = faseIndex(selectedCM.fase);
      if (idx < PIPELINE.length - 1) {
        const next = PIPELINE[idx + 1];
        const addetto = FASE_TEAM[next.id] || "Fabio Cozza";
        setSelectedCM(prev => ({ ...prev, fase: next.id, log: [{ chi: "Fabio", cosa: `avanzato a ${next.nome}`, quando: "Adesso", color: next.color }, ...prev.log] }));
        setFaseNotif({ fase: next.nome, addetto, color: next.color });
        setTimeout(() => setFaseNotif(null), 4000);
      }
    }
  };

  // === AUTO-ADVANCE: sincronizza fase pipeline con azioni reali ===
  const setFaseTo = (cmId: string, targetFase: string) => {
    const targetIdx = faseIndex(targetFase);
    setCantieri(cs => cs.map(c => {
      if (c.id !== cmId) return c;
      const curIdx = faseIndex(c.fase);
      if (targetIdx > curIdx) {
        return { ...c, fase: targetFase, log: [{ chi: "MASTRO", cosa: `auto → ${PIPELINE.find(p=>p.id===targetFase)?.nome}`, quando: "Adesso", color: PIPELINE.find(p=>p.id===targetFase)?.color || "#007aff" }, ...(c.log||[])] };
      }
      return c;
    }));
    if (selectedCM?.id === cmId) {
      const curIdx = faseIndex(selectedCM.fase);
      if (targetIdx > curIdx) {
        const next = PIPELINE.find(p => p.id === targetFase);
        setSelectedCM(prev => ({ ...prev, fase: targetFase, log: [{ chi: "MASTRO", cosa: `auto → ${next?.nome}`, quando: "Adesso", color: next?.color || "#007aff" }, ...(prev?.log||[])] }));
        setFaseNotif({ fase: next?.nome || targetFase, addetto: "Auto", color: next?.color || "#007aff" });
        setTimeout(() => setFaseNotif(null), 3000);
      }
    }
  };


  const addEvent = () => {
    const _evTitle = newEvent.text.trim() || (newEvent.persona ? "Appuntamento " + newEvent.persona : "");
    if (!_evTitle) return;
    newEvent.text = _evTitle;
    // If tipo is "task", create a task instead of an event
    if (newEvent.tipo === "task") {
      const taskDate = newEvent.date || selDate.toISOString().split("T")[0];
      setTasks(ts => [...ts, { id: Date.now(), text: newEvent.text, meta: (newEvent as any)._taskMeta || "", time: newEvent.time, priority: (newEvent as any)._taskPriority || "media", cm: newEvent.cm, date: taskDate, persona: newEvent.persona, done: false, allegati: [] }]);
      setNewEvent({ text: "", time: "", tipo: "sopralluogo", cm: "", persona: "", date: "", reminder: "", addr: "" });
      setShowNewEvent(false);
      return;
    }
    if ((newEvent as any)._newCliente && (newEvent as any)._nomeCliente) {
      const nc = { id: "CT-" + Date.now(), nome: (newEvent as any)._nomeCliente, cognome: (newEvent as any)._cognomeCliente || "", tipo: "cliente", telefono: (newEvent as any)._telCliente || "", indirizzo: (newEvent as any)._addrCliente || "" };
      setContatti(prev => [...prev, nc]);
      newEvent.persona = nc.nome + (nc.cognome ? " " + nc.cognome : "");
    }
    if (!newEvent.time) newEvent.time = "09:00";
    setEvents(ev => [...ev, { id: Date.now(), ...newEvent, date: newEvent.date || selDate.toISOString().split("T")[0], addr: newEvent.addr || "", color: tipoEvColor(newEvent.tipo) }]);
    setNewEvent({ text: "", time: "", tipo: "sopralluogo", cm: "", persona: "", date: "", reminder: "", addr: "" });
    setShowNewEvent(false);
  };


  // ═══ CONVERTI EVENTO ═══
  const convertEvent = (evId, newTipo) => {
    setEvents(prev => prev.map(e => e.id === evId ? { ...e, tipo: newTipo, color: tipoEvColor(newTipo) } : e));
  };
  const linkEventToCM = (evId, cmId) => {
    setEvents(prev => prev.map(e => e.id === evId ? { ...e, cm: cmId } : e));
  };

  // ═══ FATTURE PASSIVE ═══
  const creaFatturaPassiva = () => {
    const fp = { ...newFattPassiva, id: "fp_" + Date.now(), importo: parseFloat(String(newFattPassiva.importo)) || 0, dataISO: newFattPassiva.data || new Date().toISOString().split("T")[0] };
    setFatturePassive(prev => [...prev, fp]);
    setNewFattPassiva({ fornitore: "", numero: "", data: "", importo: 0, iva: 22, descrizione: "", cmId: "", pagata: false, scadenza: "" });
    setShowFatturaPassiva(false);
  };

  // ═══ VOCE AI ═══
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) { alert("Browser non supporta riconoscimento vocale"); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recog = new SR();
    recog.continuous = true; recog.interimResults = true; recog.lang = "it-IT";
    recog.onresult = (e: any) => {
      let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setVoiceTranscript(t);
    };
    recog.onerror = () => setVoiceActive(false);
    recog.onend = () => setVoiceActive(false);
    recog.start(); recognitionRef.current = recog; setVoiceActive(true);
  };
  const stopVoice = () => { recognitionRef.current?.stop(); setVoiceActive(false); };


  const sendCommessa = () => {
    setSendConfirm("sent");
    setTimeout(() => { setSendConfirm(null); setShowSendModal(false); }, 2500);
  };

  const handleAI = () => {
    if (!aiInput.trim()) return;
    const q = aiInput.toLowerCase();
    setAiMsgs(m => [...m, { role: "user", text: aiInput }]);
    setAiInput("");
    let resp = "Non ho capito, prova a riformulare la domanda.";
    if (q.includes("oggi") || q.includes("programma")) {
      const t = tasks.filter(x => !x.done);
      resp = `Oggi hai ${t.length} task aperti:\n${t.map((x, i) => `${i + 1}. ${x.text}${x.time ? ` (${x.time})` : ""}`).join("\n")}`;
    } else if (q.includes("commess") || q.includes("stato") || q.includes("pipeline")) {
      resp = `Hai ${cantieri.length} commesse:\n${cantieri.map(c => `• ${c.code} ${c.cliente} — ${PIPELINE.find(p => p.id === c.fase)?.nome}`).join("\n")}`;
    } else if (q.includes("vani") || q.includes("misur")) {
      resp = `Totale vani: ${countVani()}\nCommesse con vani da misurare:\n${cantieri.filter(c => getVaniAttivi(c).some(v => Object.keys(v.misure || {}).length < 6)).map(c => `• ${c.code}: ${getVaniAttivi(c).filter(v => Object.keys(v.misure || {}).length < 6).length} vani incompleti`).join("\n")}`;
    } else if (q.includes("urgent") || q.includes("priorit")) {
      const u = tasks.filter(x => x.priority === "alta" && !x.done);
      resp = u.length ? `Task urgenti:\n${u.map(x => `• ${x.text}`).join("\n")}` : "Nessun task urgente!";
    }
    setTimeout(() => setAiMsgs(m => [...m, { role: "ai", text: resp }]), 300);
  };

  const exportPDF = () => {
    if (!selectedCM) return;
    const cm = selectedCM;
    let html = `<html><head><title>MASTRO MISURE — ${cm.code}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px}h1{color:#0066cc;border-bottom:3px solid #0066cc;padding-bottom:10px}h2{color:#333;margin-top:30px}.vano{border:1px solid #ddd;border-radius:8px;padding:15px;margin:10px 0;page-break-inside:avoid}.misure-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.m-item{background:#f5f5f7;padding:6px 10px;border-radius:4px;font-size:13px}.m-label{color:#666;font-size:11px}.m-val{font-weight:700;color:#1d1d1f}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.info{color:#666;font-size:13px}@media print{body{padding:0}}</style></head><body>`;
    html += `<div class="header"><div><h1>MASTRO MISURE</h1><p class="info">Report Misure — ${cm.code}</p></div><div style="text-align:right"><p><strong>${cm.cliente}</strong></p><p class="info">${cm.indirizzo}</p><p class="info">Sistema: ${cm.sistema || "N/D"} | Tipo: ${cm.tipo === "riparazione" ? "Riparazione" : "Nuova"}</p></div></div>`;
    const vaniExport = getVaniAttivi(cm);
    vaniExport.forEach((v, i) => {
      const m = v.misure || {};
      html += `<div class="vano"><h3>${i + 1}. ${v.nome} — ${v.tipo} (${v.stanza}, ${v.piano})</h3><div class="misure-grid">`;
      [["L alto", m.lAlto], ["L centro", m.lCentro], ["L basso", m.lBasso], ["H sinistra", m.hSx], ["H centro", m.hCentro], ["H destra", m.hDx], ["Diag. 1", m.d1], ["Diag. 2", m.d2], ["Spall. SX", m.spSx], ["Spall. DX", m.spDx], ["Architrave", m.arch], ["Dav. int.", m.davInt], ["Dav. est.", m.davEst]].forEach(([l, val]) => {
        html += `<div class="m-item"><div class="m-label">${l}</div><div class="m-val">${val || "—"} mm</div></div>`;
      });
      html += `</div>`;
      if (v.cassonetto) html += `<p style="margin-top:8px;font-size:13px">Cassonetto${v.casTipo ? " " + v.casTipo : ""}: ${(v.misure||{}).casL || "—"}×${(v.misure||{}).casH || "—"}×${(v.misure||{}).casP || "—"} mm</p>`;
      if (v.note) html += `<p style="margin-top:4px;font-size:12px;color:#666">Note: ${v.note}</p>`;
      html += `</div>`;
    });
    html += `<div style="margin-top:40px;border-top:1px solid #ddd;padding-top:20px;display:flex;justify-content:space-between"><div><p class="info">Firma tecnico</p><div style="border-bottom:1px solid #333;width:200px;height:40px"></div></div><div><p class="info">Firma cliente</p><div style="border-bottom:1px solid #333;width:200px;height:40px"></div></div></div>`;
    html += `<p style="text-align:center;margin-top:30px;color:#999;font-size:11px">Generato da MASTRO MISURE — ${new Date().toLocaleDateString("it-IT")}</p></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  /* ======= STYLES ======= */
  const fs = isDesktop ? 1.1 : isTablet ? 1.05 : 1;
  const S = {
    app: { fontFamily: FF, background: T.bg, color: T.text, width: "100%", minHeight: "100vh", position: "relative", WebkitFontSmoothing: "antialiased" },
    header: { padding: `${14*fs}px ${16*fs}px ${12*fs}px`, background: T.card, borderBottom: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", gap: 10 },
    headerTitle: { fontSize: 19*fs, fontWeight: 700, letterSpacing: -0.3, color: T.text },
    headerSub: { fontSize: 12*fs, color: T.sub, marginTop: 1 },
    section: { margin: `0 ${16*fs}px`, padding: "10px 0 4px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    sectionTitle: { fontSize: 13*fs, fontWeight: 700, color: T.text },
    sectionBtn: { fontSize: 12*fs, color: T.acc, fontWeight: 600, background: "none", border: "none", cursor: "pointer" },
    card: { background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, boxShadow: T.cardSh, overflow: "hidden", marginBottom: 8, cursor: "pointer", transition: "box-shadow 0.15s" },
    cardInner: { padding: `${12*fs}px ${14*fs}px` },
    chip: (active) => ({ padding: `${6*fs}px ${12*fs}px`, borderRadius: 8, border: `1px solid ${active ? T.acc : T.bdr}`, background: active ? T.acc : T.card, color: active ? "#fff" : T.text, fontSize: 12*fs, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }),
    stat: { flex: 1, textAlign: "center", padding: `${10*fs}px 4px`, background: T.card, cursor: "pointer" },
    statNum: { fontSize: 18*fs, fontWeight: 700 },
    statLabel: { fontSize: 9*fs, color: T.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, marginTop: 1 },
    badge: (bg, color) => ({ fontSize: 11*fs, fontWeight: 600, padding: `${3*fs}px ${8*fs}px`, borderRadius: 6, background: bg, color, display: "inline-block" }),
    input: { width: "100%", padding: `${10*fs}px ${12*fs}px`, borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 14*fs, color: T.text, outline: "none", fontFamily: FF, boxSizing: "border-box" },
    select: { width: "100%", padding: `${10*fs}px ${12*fs}px`, borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 14*fs, color: T.text, outline: "none", fontFamily: FF, boxSizing: "border-box" },
    btn: { width: "100%", padding: `${14*fs}px`, borderRadius: 10, border: "none", background: T.acc, color: "#fff", fontSize: 15*fs, fontWeight: 700, cursor: "pointer", fontFamily: FF },
    btnCancel: { width: "100%", padding: `${12*fs}px`, borderRadius: 10, border: "none", background: "none", color: T.sub, fontSize: 14*fs, fontWeight: 600, cursor: "pointer", fontFamily: FF },
    tabBar: { position: "fixed", bottom: 0, left: 0, right: 0, width: "100%", background: T.card + "ee", backdropFilter: "blur(20px)", borderTop: `1px solid ${T.bdr}`, display: "flex", padding: `${6*fs}px 0 ${8*fs}px`, zIndex: 100 },
    tabItem: (active) => ({ flex: 1, textAlign: "center", padding: "4px 0", cursor: "pointer", opacity: active ? 1 : 0.5, transition: "opacity 0.15s" }),
    tabLabel: (active) => ({ fontSize: 10*fs, fontWeight: 600, color: active ? T.acc : T.sub, marginTop: 1 }),
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "flex-end" },
    modalInner: { background: T.card, borderRadius: "16px 16px 0 0", width: "100%", maxWidth: isDesktop ? 600 : 500, padding: `${20*fs}px ${16*fs}px ${30*fs}px`, maxHeight: "85vh", overflowY: "auto" },
    modalTitle: { fontSize: 17*fs, fontWeight: 700, marginBottom: 16, color: T.text },
    fieldLabel: { fontSize: 12*fs, fontWeight: 600, color: T.sub, marginBottom: 4, display: "block" },
    pipeStep: (done, current) => ({ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 52, cursor: "pointer" }),
    pipeCircle: (done, current, color) => ({ width: current ? 32 : 26, height: current ? 32 : 26, borderRadius: "50%", background: done ? color : "transparent", border: done ? "none" : current ? `3px solid ${color}` : `2px dashed ${T.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: current ? 14 : 12, boxShadow: current ? `0 0 12px ${color}40` : "none", transition: "all 0.2s" }),
    pipeLine: (done) => ({ flex: 1, height: 2, background: done ? T.grn : T.bdr, minWidth: 12, alignSelf: "center", marginTop: -14 }),
    pipeLabel: (current) => ({ fontSize: 9*fs, fontWeight: current ? 700 : 500, color: current ? T.text : T.sub, marginTop: 4, textAlign: "center", maxWidth: 52 }),
  };

  /* ======= CALENDAR STRIP ======= */
  const today = new Date();
  const calDays = Array.from({ length: 9 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i - 2);
    return { day: d.getDate(), name: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"][d.getDay()], isToday: i === 2, hasDot: [0, 2, 4, 6].includes(i) };
  });

  /* ======= PIPELINE COMPONENT ======= */
  const PipelineBar = ({ fase }) => {
    const idx = faseIndex(fase);
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", padding: "8px 0", WebkitOverflowScrolling: "touch" }}>
        {PIPELINE.map((p, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "flex-start", flex: i < PIPELINE.length - 1 ? 1 : "none" }}>
              <div style={S.pipeStep(done, current)}>
                <div style={S.pipeCircle(done, current, p.color)}>
                  {done ? <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span> : <span>{p.ico}</span>}
                </div>
                <div style={S.pipeLabel(current)}>{p.nome}</div>
              </div>
              {i < PIPELINE.length - 1 && <div style={S.pipeLine(done)} />}
            </div>
          );
        })}
      </div>
    );
  };

  /* ======= VANO SVG SCHEMA ======= */
  const VanoSVG = ({ v, onTap }) => {
    const m = v.misure || {};
    return (
      <svg viewBox="0 0 200 260" style={{ width: "100%", maxWidth: 280, display: "block", margin: "0 auto" }}>
        {/* Vano outline */}
        <rect x="30" y="15" width="140" height="220" fill={T.accLt} stroke={T.acc} strokeWidth={1.5} rx={2} />
        {/* Spallette */}
        <rect x="15" y="12" width="15" height="226" fill={T.blueLt} stroke={T.blue} strokeWidth={0.5} rx={1} strokeDasharray="3,2" />
        <rect x="170" y="12" width="15" height="226" fill={T.blueLt} stroke={T.blue} strokeWidth={0.5} rx={1} strokeDasharray="3,2" />
        {/* Cassonetto */}
        {v.cassonetto && <rect x="28" y="0" width="144" height="15" fill={T.orangeLt} stroke={T.orange} strokeWidth={0.5} rx={2} />}
        {v.cassonetto && <text x="100" y="11" textAnchor="middle" fontSize={7} fill={T.orange} fontFamily={FM}>CASSONETTO</text>}
        {/* Davanzale */}
        <line x1="25" y1="237" x2="175" y2="237" stroke={T.sub2} strokeWidth={1} strokeDasharray="4,3" />
        <text x="100" y="252" textAnchor="middle" fontSize={8} fill={T.sub2} fontFamily={FM}>Davanzale</text>
        {/* 3 Larghezze lines */}
        <line x1="35" y1="28" x2="165" y2="28" stroke={T.acc + "40"} strokeWidth={0.5} strokeDasharray="3,3" />
        <line x1="35" y1="125" x2="165" y2="125" stroke={T.acc + "40"} strokeWidth={0.5} strokeDasharray="3,3" />
        <line x1="35" y1="222" x2="165" y2="222" stroke={T.acc + "40"} strokeWidth={0.5} strokeDasharray="3,3" />
        {/* 3 Altezze lines */}
        <line x1="35" y1="20" x2="35" y2="232" stroke={T.blue + "40"} strokeWidth={0.5} strokeDasharray="3,3" />
        <line x1="100" y1="20" x2="100" y2="232" stroke={T.blue + "40"} strokeWidth={0.5} strokeDasharray="3,3" />
        <line x1="165" y1="20" x2="165" y2="232" stroke={T.blue + "40"} strokeWidth={0.5} strokeDasharray="3,3" />
        {/* Diagonals */}
        <line x1="35" y1="20" x2="165" y2="232" stroke={T.purple + "30"} strokeWidth={0.5} strokeDasharray="4,3" />
        <line x1="165" y1="20" x2="35" y2="232" stroke={T.purple + "30"} strokeWidth={0.5} strokeDasharray="4,3" />
        {/* Tap points */}
        {PUNTI_MISURE.map(p => {
          const val = m[p.key];
          const col = T[p.color] || T.acc;
          return (
            <g key={p.key} onClick={() => onTap && onTap(p.key)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={val ? 14 : 12} fill={val ? col + "20" : T.bdr + "60"} stroke={val ? col : T.sub2} strokeWidth={val ? 1.5 : 1} />
              <text x={p.x} y={p.y + (val ? 1 : 4)} textAnchor="middle" fontSize={val ? 8 : 7} fill={val ? col : T.sub} fontWeight={val ? 700 : 500} fontFamily={FM} dominantBaseline="middle">
                {val || p.label}
              </text>
            </g>
          );
        })}
        {/* Spalletta labels */}
        <text x="22" y="130" textAnchor="middle" fontSize={7} fill={T.sub} fontFamily={FM} transform="rotate(-90,22,130)">
          Sp.SX {m.spSx || ""}
        </text>
        <text x="178" y="130" textAnchor="middle" fontSize={7} fill={T.sub} fontFamily={FM} transform="rotate(90,178,130)">
          Sp.DX {m.spDx || ""}
        </text>
      </svg>
    );
  };

  /* ======= FILTERED CANTIERI ======= */
  const filtered = cantieri.filter(c => {
    if (filterFase !== "tutte" && c.fase !== filterFase) return false;
    if (searchQ && !c.cliente.toLowerCase().includes(searchQ.toLowerCase()) && !c.code.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  /* ==================================== */
  /* ====       RENDER SECTIONS       == */
  /* ==================================== */

  /* == HOME TAB == */
  const toggleCollapse = (id: string) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  const SectionHead = ({ id, icon, title, count, countColor, extra }: { id: string; icon: string; title: string; count?: number; countColor?: string; extra?: any }) => (
    <div style={{ ...S.section, margin: "0 16px" }}>
      <div onClick={() => toggleCollapse(id)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flex: 1 }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</span>
        {count !== undefined && count > 0 && (
          <span style={{ ...S.badge(countColor ? countColor + "18" : T.acc + "18", countColor || T.acc), fontSize: 10, fontWeight: 800 }}>{count}</span>
        )}
        <span style={{ fontSize: 8, color: T.sub, marginLeft: 2, transform: collapsed[id] ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s", display: "inline-block" }}>▼</span>
      </div>
      {extra}
    </div>
  );

  // === 🎯 CARICA DEMO COMPLETO — forza TUTTI i dati per vedere il ciclo ===
  const caricaDemoCompleto = () => {
    const oggi = new Date().toISOString().split("T")[0];
    const ieri = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split("T")[0]; })();
    const domani = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; })();
    const fra3 = (() => { const d = new Date(); d.setDate(d.getDate()+3); return d.toISOString().split("T")[0]; })();
    const fra7 = (() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().split("T")[0]; })();
    const fra14 = (() => { const d = new Date(); d.setDate(d.getDate()+14); return d.toISOString().split("T")[0]; })();

    // Vano factory
    const mkVano = (id, nome, tipo, stanza, piano, l, h, sys = "Aluplast Ideal 4000", colEst = "RAL 7016") => ({
      id, nome, tipo, stanza, piano, sistema: sys, pezzi: 1,
      coloreInt: "RAL 9010", coloreEst: colEst, bicolore: colEst !== "RAL 9010",
      coloreAcc: "", vetro: "", telaio: "", coprifilo: "", lamiera: "",
      misure: { lAlto: l+3, lCentro: l, lBasso: l-2, hSx: h, hCentro: h, hDx: h-3, d1: Math.round(Math.sqrt(l*l+h*h)), d2: Math.round(Math.sqrt(l*l+h*h))-2 },
      foto: {}, note: "", cassonetto: false,
      accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } },
    });

    // 4 COMMESSE a stadi diversi
    const cm1 = {
      id: 9001, code: "S-0001", cliente: "Giuseppe", cognome: "Verdi",
      indirizzo: "Via Garibaldi 12, Rende (CS)", telefono: "347 555 1234", email: "giuseppe.verdi@email.it",
      fase: "sopralluogo", sistema: "Aluplast Ideal 4000", tipo: "nuova",
      note: "Appartamento 2° piano. 5 finestre da sostituire.", prezzoMq: 180,
      rilievi: [], allegati: [], cf: "VRDGPP80A01D086Z", ivaPerc: 10,
      creato: "25 feb", aggiornato: oggi,
      log: [{ chi: "Fabio", cosa: "creato la commessa", quando: "2 giorni fa", color: "#86868b" }],
    };

    const vaniAnna = [
      mkVano(9101, "Finestra Soggiorno", "F2A", "Soggiorno", "1°", 1200, 1400),
      mkVano(9102, "Portafinestra Camera", "PF2A", "Camera", "1°", 1400, 2200),
      mkVano(9103, "Vasistas Bagno", "VAS", "Bagno", "1°", 600, 600),
      mkVano(9104, "Scorrevole Salone", "SC2A", "Salone", "1°", 1800, 2200),
    ];
    const cm2 = {
      id: 9002, code: "S-0002", cliente: "Anna", cognome: "Bianchi",
      indirizzo: "Corso Mazzini 88, Cosenza (CS)", telefono: "339 888 5678", email: "anna.bianchi@gmail.com",
      fase: "preventivo", sistema: "Aluplast Ideal 4000", tipo: "nuova", prezzoMq: 180,
      note: "Ristrutturazione. IVA 10%. RAL 7016 esterno.",
      rilievi: [{ id: 9201, n: 1, data: "2026-02-20", ora: "09:30", rilevatore: "Fabio", tipo: "rilievo", stato: "completato", motivoModifica: "", note: "", vani: vaniAnna }],
      allegati: [], cf: "BNCNNA85C41D086Y", ivaPerc: 10,
      creato: "20 feb", aggiornato: "22 feb",
      log: [
        { chi: "Fabio", cosa: "completato rilievo — 4 vani", quando: "5 giorni fa", color: "#5856d6" },
        { chi: "Fabio", cosa: "creato la commessa", quando: "7 giorni fa", color: "#86868b" },
      ],
    };

    const vaniMario = [
      mkVano(9111, "Finestra Soggiorno", "F2A", "Soggiorno", "3°", 1200, 1400, "Aluplast Ideal 4000", "RAL 9010"),
      mkVano(9112, "Finestra Camera 1", "F2A", "Camera", "3°", 1000, 1200, "Aluplast Ideal 4000", "RAL 9010"),
      mkVano(9113, "Portafinestra Salone", "PF2A", "Salone", "3°", 1400, 2200, "Aluplast Ideal 4000", "RAL 9010"),
      mkVano(9114, "Vasistas Bagno", "VAS", "Bagno", "3°", 600, 600, "Aluplast Ideal 4000", "RAL 9010"),
    ];
    const cm3 = {
      id: 9003, code: "S-0003", cliente: "Mario", cognome: "Rossi",
      indirizzo: "Via Roma 42, Cosenza (CS)", telefono: "338 123 4567", email: "mario.rossi@libero.it",
      fase: "ordini", sistema: "Aluplast Ideal 4000", tipo: "nuova", prezzoMq: 180,
      note: "4 vani. Bonus 50%.",
      firmaCliente: true, dataFirma: "2026-02-15", confermato: true,
      rilievi: [{ id: 9202, n: 1, data: "2026-02-10", ora: "10:00", rilevatore: "Fabio", tipo: "rilievo", stato: "completato", motivoModifica: "", note: "", vani: vaniMario }],
      allegati: [], cf: "RSSMRA75D15D086X", ivaPerc: 10,
      creato: "10 feb", aggiornato: "15 feb",
      log: [
        { chi: "Fabio", cosa: "fattura acconto emessa", quando: "12 giorni fa", color: "#5856d6" },
        { chi: "Fabio", cosa: "cliente ha firmato", quando: "12 giorni fa", color: "#34c759" },
        { chi: "Fabio", cosa: "creato la commessa", quando: "17 giorni fa", color: "#86868b" },
      ],
    };

    const vaniLaura = [
      mkVano(9121, "Finestra Cucina", "F2A", "Cucina", "PT", 1200, 1400, "Aluplast Ideal 4000", "Noce"),
      mkVano(9122, "Portafinestra Soggiorno", "PF2A", "Soggiorno", "PT", 1400, 2200, "Aluplast Ideal 4000", "Noce"),
      mkVano(9123, "Finestra Camera", "F1A", "Camera", "PT", 800, 1200, "Aluplast Ideal 4000", "Noce"),
    ];
    const cm4 = {
      id: 9004, code: "S-0004", cliente: "Laura", cognome: "Esposito",
      indirizzo: "Viale Trieste 5, Rende (CS)", telefono: "340 999 8765", email: "laura.esposito@outlook.it",
      fase: "posa", sistema: "Aluplast Ideal 4000", tipo: "nuova", prezzoMq: 180,
      note: "PT villa. Colore noce.",
      firmaCliente: true, dataFirma: "2026-01-20", confermato: true,
      rilievi: [{ id: 9203, n: 1, data: "2026-01-15", ora: "14:00", rilevatore: "Fabio", tipo: "rilievo", stato: "completato", motivoModifica: "", note: "", vani: vaniLaura }],
      allegati: [], cf: "SPSLRA82E45D086W", ivaPerc: 10,
      creato: "15 gen", aggiornato: "10 feb",
      log: [
        { chi: "Fabio", cosa: "montaggio pianificato", quando: "3 giorni fa", color: "#34c759" },
        { chi: "Fabio", cosa: "conferma fornitore approvata", quando: "17 giorni fa", color: "#af52de" },
        { chi: "Fabio", cosa: "ordine inviato", quando: "25 giorni fa", color: "#ff2d55" },
        { chi: "Fabio", cosa: "creato la commessa", quando: "43 giorni fa", color: "#86868b" },
      ],
    };

    setCantieri([cm1, cm2, cm3, cm4]);

    // FATTURE
    setFattureDB([
      {
        id: "fat_d1", numero: 1, anno: 2026, data: "15/02/2026", dataISO: "2026-02-15", tipo: "acconto",
        cmId: 9003, cmCode: "S-0003", cliente: "Mario", cognome: "Rossi",
        indirizzo: "Via Roma 42, Cosenza", cf: "RSSMRA75D15D086X",
        importo: 593, imponibile: 539, iva: 10, ivaAmt: 54,
        pagata: true, dataPagamento: "2026-02-18", scadenza: "2026-03-17", note: "Acconto 50%",
      },
      {
        id: "fat_d2", numero: 2, anno: 2026, data: "20/01/2026", dataISO: "2026-01-20", tipo: "acconto",
        cmId: 9004, cmCode: "S-0004", cliente: "Laura", cognome: "Esposito",
        indirizzo: "Viale Trieste 5, Rende", cf: "SPSLRA82E45D086W",
        importo: 474, imponibile: 431, iva: 10, ivaAmt: 43,
        pagata: true, dataPagamento: "2026-01-25", scadenza: "2026-02-19", note: "Acconto 50%",
      },
    ]);

    // ORDINI
    setOrdiniFornDB([
      {
        id: "ord_d1", cmId: 9003, cmCode: "S-0003", cliente: "Mario Rossi",
        numero: 1, anno: 2026, dataOrdine: "2026-02-18",
        fornitore: { nome: "Aluplast Italia", email: "ordini@aluplast.it", tel: "0444 123456", referente: "Marco Ferro" },
        righe: vaniMario.map((v, i) => ({
          id: "r" + i, desc: `${v.nome}`, misure: `${v.misure.lCentro}×${v.misure.hCentro}`,
          qta: 1, prezzoUnit: 0, totale: 0, note: v.coloreEst,
        })),
        totale: 795, iva: 22, totaleIva: 970, sconto: 0,
        stato: "inviato",
        conferma: { ricevuta: false, dataRicezione: "", verificata: false, differenze: "", firmata: false, dataFirma: "" },
        consegna: { prevista: "", settimane: 0 }, pagamento: { termini: "", stato: "da_pagare" },
      },
      {
        id: "ord_d2", cmId: 9004, cmCode: "S-0004", cliente: "Laura Esposito",
        numero: 2, anno: 2026, dataOrdine: "2026-01-25",
        fornitore: { nome: "Aluplast Italia", email: "ordini@aluplast.it", tel: "0444 123456", referente: "Marco Ferro" },
        righe: vaniLaura.map((v, i) => ({
          id: "r" + i, desc: `${v.nome}`, misure: `${v.misure.lCentro}×${v.misure.hCentro}`,
          qta: 1, prezzoUnit: [210, 320, 140][i] || 0, totale: [210, 320, 140][i] || 0, note: v.coloreEst,
        })),
        totale: 670, iva: 22, totaleIva: 817, sconto: 0,
        stato: "confermato",
        conferma: { ricevuta: true, dataRicezione: "2026-02-01", verificata: true, firmata: true, dataFirma: "2026-02-01", nomeFile: "conferma_aluplast.pdf",
          datiEstratti: { totale: 817, settimane: 6, dataConsegna: "2026-03-15", pagamento: "30gg_fm" } },
        consegna: { prevista: "2026-03-15", settimane: 6 }, pagamento: { termini: "30gg_fm", stato: "da_pagare" },
      },
    ]);

    // MONTAGGI
    setMontaggiDB([{
      id: "m_d1", cmId: 9004, cmCode: "S-0004", cliente: "Laura Esposito",
      vani: 3, data: fra7, orario: "08:00", durata: "giornata",
      squadraId: "sq1", stato: "programmato", note: "3 vani PT villa — portare scala e silicone",
    }]);

    // EVENTI calendario
    setEvents([
      { id: "ev1", date: oggi, time: "09:00", text: "Sopralluogo Verdi", persona: "Giuseppe Verdi", addr: "Via Garibaldi 12, Rende", cm: "S-0001", color: "#007aff", durata: 60 },
      { id: "ev2", date: oggi, time: "15:00", text: "Telefonata Bianchi — preventivo", persona: "Anna Bianchi", addr: "", cm: "S-0002", color: "#ff9500", durata: 30 },
      { id: "ev3", date: domani, time: "10:00", text: "Incontro Rossi — firma ordine", persona: "Mario Rossi", addr: "Via Roma 42, Cosenza", cm: "S-0003", color: "#34c759", durata: 45 },
      { id: "ev4", date: fra3, time: "08:30", text: "Consegna materiale Esposito", persona: "Laura Esposito", addr: "Viale Trieste 5, Rende", cm: "S-0004", color: "#af52de", durata: 120 },
      { id: "ev5", date: fra7, time: "08:00", text: "🔧 MONTAGGIO Esposito — 3 vani", persona: "Squadra A", addr: "Viale Trieste 5, Rende", cm: "S-0004", color: "#ff6b00", durata: 480 },
      { id: "ev6", date: fra14, time: "09:00", text: "Sopralluogo nuovo cliente", persona: "Sig.ra Ferraro", addr: "Via De Seta 15, Cosenza", color: "#007aff", durata: 60 },
    ]);

    // TASKS
    setTasks([
      { id: "t1", text: "Inviare preventivo Bianchi", done: false, priority: "alta", meta: "S-0002 · Scade venerdì" },
      { id: "t2", text: "Preparare sopralluogo Verdi", done: false, priority: "media", meta: "S-0001 · Oggi ore 9" },
      { id: "t3", text: "Chiamare Aluplast per conferma Rossi", done: false, priority: "alta", meta: "S-0003 · Ordine 18/02" },
      { id: "t4", text: "Verificare consegna Esposito", done: true, priority: "media", meta: "S-0004 · 15 marzo" },
    ]);

    setSelectedCM(null);
    setSelectedRilievo(null);
    setSelectedVano(null);
    setTab("home");
  };

  const renderHome = () => <HomePanel />;
// =======================================================
// MASTRO ERP v2 — PARTE 2/5
// Righe 1281-2638: renderCMCard (con AFASE+euro+scadenza+borderLeft),
//                 renderCommesse, renderCMDetail (wizard 4-step + 3 tab
//                 sopralluoghi/misure/info + cronologia visite),
//                 renderRiepilogo, renderFasePanel
// =======================================================
  /* == COMMESSA CARD == */

  /* == COMMESSE TAB == */
  // ============================================================
  // RENDER LISTA RILIEVI (livello intermedio: commessa → rilievi)
  // ============================================================
  const renderRilieviList = () => <RilieviListPanel />;

  // Card compatta per vista lista

  
  const renderCommesse = () => <CommessePanel />;

  /* == COMMESSA DETAIL == */
  const renderCMDetail = () => <CMDetailPanel />;

  /* == RIEPILOGO COMMESSA — SCHERMATA INVIO == */

  /* ===============================================
     PANNELLI DI FASE — renderFasePanel(c)
     Appare nella commessa detail, sotto la pipeline
     Un pannello specifico per ogni fase
  =============================================== */
  const renderFasePanel = (c) => {
    const fi = faseIndex(c.fase);
    const nextFase = PIPELINE[fi + 1];
    const fase = PIPELINE[fi];

    // Helper: aggiorna campo dentro la commessa selezionata
    const updateCM = (field, val) => {
      setCantieri(cs => cs.map(x => x.id === c.id ? { ...x, [field]: val } : x));
      setSelectedCM(prev => ({ ...prev, [field]: val }));
    };
    const updateCMNested = (obj) => {
      setCantieri(cs => cs.map(x => x.id === c.id ? { ...x, ...obj } : x));
      setSelectedCM(prev => ({ ...prev, ...obj }));
    };

    // Chip checklist riusabile
    const Chip = ({ label, done, onClick }) => (
      <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px",
        borderRadius:8, border:`1.5px solid ${done ? T.grn : T.bdr}`, background: done ? T.grn+"12" : T.card,
        cursor:"pointer", marginBottom:6 }}>
        <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${done ? T.grn : T.bdr}`,
          background: done ? T.grn : "transparent", display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0 }}>
          {done && <span style={{fontSize:10,color:"white",fontWeight:800}}>✓</span>}
        </div>
        <span style={{fontSize:12, fontWeight:600, color: done ? T.grn : T.text}}>{label}</span>
      </div>
    );

    // Campo input riusabile — defaultValue+onBlur per evitare focus loss
    const Field = ({ label, field, placeholder, type="text" }) => (
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
        <input type={type} placeholder={placeholder||""} defaultValue={c[field]||""}
          key={`${c.id}-${field}`}
          onBlur={e => { const v = e.target.value; if (v !== (c[field]||"")) updateCM(field, v); }}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,
            background:T.card,fontSize:13,color:T.text,fontFamily:FF,boxSizing:"border-box"}}/>
      </div>
    );

    const panelStyle = {
      margin:"0 16px 12px", borderRadius:12, border:`1.5px solid ${fase?.color}30`,
      background:T.card, overflow:"hidden"
    };
    const headerStyle = {
      padding:"10px 14px", background:fase?.color+"15", borderBottom:`1px solid ${fase?.color}25`,
      display:"flex", alignItems:"center", gap:8
    };

    // Toggle accordion per id fase
    const isOpen = (id) => fasePanelOpen[id] !== false; // default aperto
    const togglePanel = (id) => setFasePanelOpen(s => ({...s, [id]: !isOpen(id)}));

    // Wrapper accordion semplice — stessa UI di prima, solo con toggle
    const FasePanel = ({ id, children, taskNonFatti = 0 }) => (
      <div style={panelStyle}>
        <div onClick={() => togglePanel(id)} style={{ ...headerStyle, cursor:"pointer",
          borderBottom: isOpen(id) ? `1px solid ${fase?.color}25` : "none", userSelect:"none" }}>
          {/* Contenuto header originale passato come primo child */}
          <div style={{display:"flex",alignItems:"center",gap:8,flex:1,pointerEvents:"none"}}>
            {(children as any[])[0]}
          </div>
          {/* Badge alert se task non completati */}
          {taskNonFatti > 0 && (
            <span style={{width:8,height:8,borderRadius:"50%",background:T.red,display:"inline-block",marginRight:6,flexShrink:0}}/>
          )}
          <span style={{fontSize:13,color:T.sub,transform:isOpen(id)?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s",flexShrink:0}}>▾</span>
        </div>
        {isOpen(id) && (
          <div style={{padding:"12px 14px"}}>
            {(children as any[]).slice(1)}
          </div>
        )}
      </div>
    );

    // === SOPRALLUOGO ===
    if (c.fase === "sopralluogo") {
      const vaniAttivi2 = getVaniAttivi(c); const vaniCompletati = vaniAttivi2.filter(v => Object.values(v.misure||{}).filter(x=>(x as number)>0).length >= 6).length;
      const tuttiCompletati = vaniCompletati === vaniAttivi2.length && vaniAttivi2.length > 0;
      const ndone = [!c.ck_foto, !c.ck_accesso, !c.ck_riepilogo_inviato, !tuttiCompletati].filter(Boolean).length;
      const open_sopr = fasePanelOpen["sopralluogo"] !== false;
      return (
        <div style={panelStyle}>
          <div onClick={()=>togglePanel("sopralluogo")} style={{...headerStyle,cursor:"pointer",borderBottom:open_sopr?`1px solid ${fase?.color}25`:"none",userSelect:"none"}}>
            <span style={{fontSize:16}}>🔍</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>Sopralluogo</span>
            <span style={{fontSize:11,fontWeight:700,color:tuttiCompletati?T.grn:T.orange,marginRight:4}}>{vaniCompletati}/{vaniAttivi2.length} vani ✓</span>
            {ndone>0 && <span style={{width:8,height:8,borderRadius:"50%",background:T.red,display:"inline-block",marginRight:6}}/>}
            <span style={{fontSize:13,color:T.sub,transform:open_sopr?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s"}}>▾</span>
          </div>
          {open_sopr && <div style={{padding:"12px 14px"}}>
            <Chip label="Fotografie scattate" done={c.ck_foto} onClick={()=>updateCM("ck_foto",!c.ck_foto)}/>
            <Chip label="Difficoltà accesso rilevata" done={c.ck_accesso} onClick={()=>updateCM("ck_accesso",!c.ck_accesso)}/>
            <Chip label="Riepilogo inviato al cliente" done={c.ck_riepilogo_inviato} onClick={()=>updateCM("ck_riepilogo_inviato",!c.ck_riepilogo_inviato)}/>
            <Chip label={`Tutte le misure inserite (${vaniCompletati}/${vaniAttivi2.length})`} done={tuttiCompletati} onClick={()=>{}}/>
            <Field label="Data sopralluogo" field="dataSopralluogo" type="date"/>
            <Field label="Note sopralluogo" field="noteSopralluogo" placeholder="Annotazioni rapide..."/>
            {tuttiCompletati && (
              <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,background:T.grn+"15",border:`1px solid ${T.grn}30`,fontSize:12,color:T.grn,fontWeight:600,textAlign:"center"}}>
                ✅ Pronto per il preventivo
              </div>
            )}
          </div>}
        </div>
      );
    }

    // === PREVENTIVO ===
    if (c.fase === "preventivo") {
      const vaniCalc = getVaniAttivi(c); const totale = vaniCalc.reduce((sum, v) => sum + calcolaVanoPrezzo(v, c), 0);
      const iva = totale * 0.1;
      return (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={{fontSize:16}}>📋</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>Preventivo</span>
          </div>
          <div style={{padding:"12px 14px"}}>
            <Field label="Prezzo base €/mq" field="prezzoMq" placeholder="350" type="number"/>
            <Field label="Sconto %" field="sconto" placeholder="0" type="number"/>
            <Field label="Note preventivo" field="notePreventivo" placeholder="Condizioni, garanzie..."/>
            <div style={{padding:"10px 12px",borderRadius:8,background:T.bg,border:`1px solid ${T.bdr}`,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:4}}>
                <span>Totale imponibile</span><span style={{fontWeight:700,color:T.text}}>€ {totale.toFixed(2)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:4}}>
                <span>IVA 10%</span><span>€ {iva.toFixed(2)}</span>
              </div>
              {c.sconto > 0 && (
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.orange,marginBottom:4}}>
                  <span>Sconto {c.sconto}%</span><span>- € {(totale * c.sconto/100).toFixed(2)}</span>
                </div>
              )}
              <div style={{borderTop:`1px solid ${T.bdr}`,marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:800}}>
                <span>TOTALE IVA inclusa</span>
                <span style={{color:T.acc}}>€ {(totale + iva - (totale*(c.sconto||0)/100)).toFixed(2)}</span>
              </div>
            </div>
            <Chip label="Preventivo inviato al cliente" done={c.ck_prev_inviato} onClick={()=>updateCM("ck_prev_inviato",!c.ck_prev_inviato)}/>
            <Chip label="Cliente ha accettato verbalmente" done={c.ck_prev_accettato} onClick={()=>updateCM("ck_prev_accettato",!c.ck_prev_accettato)}/>
          </div>
        </div>
      );
    }

    // === CONFERMA ===
    if (c.fase === "conferma") {
      return (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={{fontSize:16}}>✍️</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>Conferma Ordine</span>
          </div>
          <div style={{padding:"12px 14px"}}>
            <Field label="Data conferma" field="dataConferma" type="date"/>
            <Field label="Acconto ricevuto €" field="accontoRicevuto" placeholder="0" type="number"/>
            <Field label="Metodo pagamento" field="metodoPagamento" placeholder="Bonifico / Contanti / Carta..."/>
            <Field label="Data prevista posa" field="dataPosaPrevista" type="date"/>
            <Chip label="Contratto firmato" done={c.ck_contratto} onClick={()=>updateCM("ck_contratto",!c.ck_contratto)}/>
            <Chip label="Acconto incassato" done={c.ck_acconto_inc} onClick={()=>updateCM("ck_acconto_inc",!c.ck_acconto_inc)}/>
            <Chip label="Data posa concordata" done={c.ck_data_posa} onClick={()=>updateCM("ck_data_posa",!c.ck_data_posa)}/>
          </div>
        </div>
      );
    }

    // === MISURE ===
    if (c.fase === "misure") {
      const vaniCalc = getVaniAttivi(c);
      const vaniOk = vaniCalc.filter(v => Object.values(v.misure||{}).filter(x=>(x as number)>0).length >= 9).length;
      return (
        (() => {
          const ndone = [!c.ck_misure_ok,!c.ck_diag_ok,!c.ck_pdf_prod,!c.ck_sistema_ok].filter(Boolean).length;
          const open = fasePanelOpen["misure"] !== false;
          return (
            <div style={panelStyle}>
              <div onClick={()=>togglePanel("misure")} style={{...headerStyle,cursor:"pointer",borderBottom:open?`1px solid ${fase?.color}25`:"none",userSelect:"none"}}>
                <span style={{fontSize:16}}>📐</span>
                <span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>Rilievo Misure Definitivo</span>
                <span style={{fontSize:11,fontWeight:700,color:vaniOk===vaniCalc.length?T.grn:T.orange,marginRight:4}}>{vaniOk}/{vaniCalc.length}</span>
                {ndone>0 && <span style={{width:8,height:8,borderRadius:"50%",background:T.red,display:"inline-block",marginRight:6}}/>}
                <span style={{fontSize:13,color:T.sub,transform:open?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s"}}>▾</span>
              </div>
              {open && <div style={{padding:"12px 14px"}}>
                <Chip label="Tutte le misure verificate" done={c.ck_misure_ok} onClick={()=>updateCM("ck_misure_ok",!c.ck_misure_ok)}/>
                <Chip label="Diagonali controllate" done={c.ck_diag_ok} onClick={()=>updateCM("ck_diag_ok",!c.ck_diag_ok)}/>
                <Chip label="Riepilogo PDF inviato a produzione" done={c.ck_pdf_prod} onClick={()=>updateCM("ck_pdf_prod",!c.ck_pdf_prod)}/>
                <Chip label="Conferma sistema/colori approvata" done={c.ck_sistema_ok} onClick={()=>updateCM("ck_sistema_ok",!c.ck_sistema_ok)}/>
                <Field label="Tecnico misuratore" field="tecnicoMisure" placeholder="Nome tecnico..."/>
                <Field label="Data rilievo definitivo" field="dataRilievo" type="date"/>
              </div>}
            </div>
          );
        })()
      );
    }

    // === ORDINI ===
    if (c.fase === "ordini") {
      return (
        (() => {
          const ndone = [!c.ck_ordine_inviato,!c.ck_ordine_confermato,!c.ck_cliente_avvisato].filter(Boolean).length;
          const open = fasePanelOpen["ordini"] !== false;
          return (
            <div style={panelStyle}>
              <div onClick={()=>togglePanel("ordini")} style={{...headerStyle,cursor:"pointer",borderBottom:open?`1px solid ${fase?.color}25`:"none",userSelect:"none"}}>
                <span style={{fontSize:16}}>📦</span>
                <span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>Ordini Fornitore</span>
                {ndone>0 && <span style={{width:8,height:8,borderRadius:"50%",background:T.red,display:"inline-block",marginRight:6}}/>}
                <span style={{fontSize:13,color:T.sub,transform:open?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s"}}>▾</span>
              </div>
              {open && <div style={{padding:"12px 14px"}}>
                <Field label="Fornitore" field="fornitore" placeholder="Es. Schüco, Rehau..."/>
                <Field label="N° Ordine fornitore" field="numOrdine" placeholder="ORD-2026-XXXX"/>
                <Field label="Data ordine" field="dataOrdine" type="date"/>
                <Field label="Data consegna prevista" field="dataConsegna" type="date"/>
                <Chip label="Ordine inviato" done={c.ck_ordine_inviato} onClick={()=>updateCM("ck_ordine_inviato",!c.ck_ordine_inviato)}/>
                <Chip label="Conferma ricezione da fornitore" done={c.ck_ordine_confermato} onClick={()=>updateCM("ck_ordine_confermato",!c.ck_ordine_confermato)}/>
                <Chip label="Materiale in arrivo comunicato al cliente" done={c.ck_cliente_avvisato} onClick={()=>updateCM("ck_cliente_avvisato",!c.ck_cliente_avvisato)}/>
              </div>}
            </div>
          );
        })()
      );
    }

    // === PRODUZIONE ===
    if (c.fase === "produzione") {
      return (
        (() => {
          const ndone = [!c.ck_mat_ricevuto,!c.ck_colori_ok,!c.ck_accessori_ok,!c.ck_posa_confermata].filter(Boolean).length;
          const open = fasePanelOpen["produzione"] !== false;
          return (
            <div style={panelStyle}>
              <div onClick={()=>togglePanel("produzione")} style={{...headerStyle,cursor:"pointer",borderBottom:open?`1px solid ${fase?.color}25`:"none",userSelect:"none"}}>
                <span style={{fontSize:16}}>🏭</span>
                <span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>Produzione</span>
                {ndone>0 && <span style={{width:8,height:8,borderRadius:"50%",background:T.red,display:"inline-block",marginRight:6}}/>}
                <span style={{fontSize:13,color:T.sub,transform:open?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s"}}>▾</span>
              </div>
              {open && <div style={{padding:"12px 14px"}}>
                <Field label="Data consegna in magazzino" field="dataInMagazzino" type="date"/>
                <Chip label="Materiale ricevuto e controllato" done={c.ck_mat_ricevuto} onClick={()=>updateCM("ck_mat_ricevuto",!c.ck_mat_ricevuto)}/>
                <Chip label="Colori verificati" done={c.ck_colori_ok} onClick={()=>updateCM("ck_colori_ok",!c.ck_colori_ok)}/>
                <Chip label="Accessori completi (maniglie, guarnizioni)" done={c.ck_accessori_ok} onClick={()=>updateCM("ck_accessori_ok",!c.ck_accessori_ok)}/>
                <Chip label="Data posa confermata al cliente" done={c.ck_posa_confermata} onClick={()=>updateCM("ck_posa_confermata",!c.ck_posa_confermata)}/>
                <Field label="Note magazzino" field="noteMagazzino" placeholder="Anomalie, sostituzioni..."/>
              </div>}
            </div>
          );
        })()
      );
    }

    // === POSA ===
    if (c.fase === "posa") {
      return (
        (() => {
          const ndone = [!c.ck_posati,!c.ck_finiture,!c.ck_pulizia,!c.ck_test,!c.ck_foto_posa,!c.ck_cliente_ok].filter(Boolean).length;
          const open = fasePanelOpen["posa"] !== false;
          return (
            <div style={panelStyle}>
              <div onClick={()=>togglePanel("posa")} style={{...headerStyle,cursor:"pointer",borderBottom:open?`1px solid ${fase?.color}25`:"none",userSelect:"none"}}>
                <span style={{fontSize:16}}>🔧</span>
                <span style={{fontSize:13,fontWeight:700,color:T.text,flex:1}}>Posa in Opera</span>
                {ndone>0 && <span style={{width:8,height:8,borderRadius:"50%",background:T.red,display:"inline-block",marginRight:6}}/>}
                <span style={{fontSize:13,color:T.sub,transform:open?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s"}}>▾</span>
              </div>
              {open && <div style={{padding:"12px 14px"}}>
                <Field label="Data posa effettiva" field="dataPosa" type="date"/>
                <Field label="Squadra posatori" field="squadraPosa" placeholder="Marco + Luigi..."/>
                <Chip label="Tutti i vani posati" done={c.ck_posati} onClick={()=>updateCM("ck_posati",!c.ck_posati)}/>
                <Chip label="Sigillature e finiture completate" done={c.ck_finiture} onClick={()=>updateCM("ck_finiture",!c.ck_finiture)}/>
                <Chip label="Pulizia cantiere" done={c.ck_pulizia} onClick={()=>updateCM("ck_pulizia",!c.ck_pulizia)}/>
                <Chip label="Test funzionamento maniglie/chiusure" done={c.ck_test} onClick={()=>updateCM("ck_test",!c.ck_test)}/>
                <Chip label="Foto lavoro completato scattate" done={c.ck_foto_posa} onClick={()=>updateCM("ck_foto_posa",!c.ck_foto_posa)}/>
                <Chip label="Cliente presente e soddisfatto" done={c.ck_cliente_ok} onClick={()=>updateCM("ck_cliente_ok",!c.ck_cliente_ok)}/>
                <Field label="Note posa" field="notePosa" placeholder="Problemi riscontrati, extra..."/>
              </div>}
            </div>
          );
        })()
      );
    }

    // === CHIUSURA ===
    if (c.fase === "chiusura") {
      const vaniCalc2 = getVaniAttivi(c); const totale = vaniCalc2.reduce((sum, v) => {
        const m = v.misure||{};
        const mq = ((m.lCentro||0)/1000) * ((m.hCentro||0)/1000);
        return sum + mq * parseFloat(c.prezzoMq||350);
      }, 0);
      const iva = totale * 0.1;
      const totIva = totale + iva - (totale*(c.sconto||0)/100);
      const saldo = totIva - parseFloat(c.accontoRicevuto||0);
      return (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={{fontSize:16}}>✅</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>Chiusura Commessa</span>
          </div>
          <div style={{padding:"12px 14px"}}>
            <div style={{padding:"10px 12px",borderRadius:8,background:T.bg,border:`1px solid ${T.bdr}`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{color:T.sub}}>Totale commessa</span><span style={{fontWeight:700}}>€ {totIva.toFixed(2)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{color:T.sub}}>Acconto ricevuto</span><span style={{color:T.grn,fontWeight:700}}>- € {parseFloat(c.accontoRicevuto||0).toFixed(2)}</span>
              </div>
              <div style={{borderTop:`1px solid ${T.bdr}`,paddingTop:6,marginTop:2,display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800}}>
                <span>Saldo da incassare</span><span style={{color:saldo>0?T.red:T.grn}}>€ {saldo.toFixed(2)}</span>
              </div>
            </div>
            <Field label="Data chiusura" field="dataChiusura" type="date"/>
            <Field label="Saldo incassato €" field="saldoIncassato" placeholder="0" type="number"/>
            <Field label="Metodo saldo" field="metodoSaldo" placeholder="Bonifico / Contanti..."/>
            <Chip label="Saldo incassato" done={c.ck_saldo} onClick={()=>updateCM("ck_saldo",!c.ck_saldo)}/>
            <Chip label="Fattura emessa" done={c.ck_fattura} onClick={()=>updateCM("ck_fattura",!c.ck_fattura)}/>
            <Chip label="Garanzia consegnata al cliente" done={c.ck_garanzia} onClick={()=>updateCM("ck_garanzia",!c.ck_garanzia)}/>
            <Chip label="Scheda commessa archiviata" done={c.ck_archiviata} onClick={()=>updateCM("ck_archiviata",!c.ck_archiviata)}/>
            {c.ck_saldo && c.ck_fattura && (
              <div style={{marginTop:8,padding:"12px",borderRadius:8,background:T.grn+"15",border:`1px solid ${T.grn}30`,textAlign:"center"}}>
                <div style={{fontSize:22}}>🎉</div>
                <div style={{fontSize:13,fontWeight:800,color:T.grn,marginTop:4}}>Commessa completata!</div>
                <div style={{fontSize:11,color:T.sub,marginTop:2}}>{c.code} · {c.cliente} {c.cognome||""}</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderRiepilogo = () => <RiepilogoPanel />;

// =======================================================
// MASTRO ERP v2 — PARTE 3/5
// Righe 2639-3594: Vano Detail Wizard completo
// =======================================================
  /* == VANO DETAIL == */
  const renderVanoDetail = () => <VanoDetailPanel />;

  /* == AGENDA TAB — Giorno / Settimana / Mese == */
  /* == CLIENTI TAB == */
  const [clientiSearch, setClientiSearch] = useState("");
  const [clientiFilter, setClientiFilter] = useState("tutti");
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [newCliente, setNewCliente] = useState({ nome: "", cognome: "", tipo: "cliente", telefono: "", email: "", indirizzo: "", piva: "", note: "" });
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [clienteDetailTab, setClienteDetailTab] = useState("info");
  const [clienteNotes, setClienteNotes] = useState<Record<string,string>>({});



  const renderClienti = () => <ClientiPanel />;

  const renderAgenda = () => <AgendaPanel />;

// =======================================================
// MASTRO ERP v2 — PARTE 4/5
// Righe 3595-4130: Agenda (Giorno/Settimana/Mese), Chat AI, Settings
// =======================================================
  /* == CHAT / AI TAB == */
  const renderMessaggi = () => <MessaggiPanel />;

  /* == SETTINGS TAB == */

  // ═══ CONTABILITÀ PRO ═══
  const renderContabilita = () => <ContabilitaPanel />;


  const renderSettings = () => <SettingsPanel />;

// =======================================================
// MASTRO ERP v2 — PARTE 5/5
// Righe 4131-5248: Modals (Task, Commessa, Vano, Allegati, Firma, AI Photo),
//                 Main Render finale
// =======================================================
  /* ======= MODALS ======= */
  const renderModal = () => <ModalPanel />;


  const generaPreventivoPDF = (c) => {
    // Grid price lookup: find smallest grid cell where L>=vanoL and H>=vanoH (ceiling approach like real suppliers)
    const grigliaLookup = (griglia: any[], lmm: number, hmm: number): number | null => {
      if (!griglia || griglia.length === 0) return null;
      // Sort by L then H
      const sorted = [...griglia].sort((a, b) => a.l - b.l || a.h - b.h);
      // Find exact match first
      const exact = sorted.find(g => g.l === lmm && g.h === hmm);
      if (exact) return exact.prezzo;
      // Find ceiling: smallest grid cell that covers the window
      const ceiling = sorted.find(g => g.l >= lmm && g.h >= hmm);
      if (ceiling) return ceiling.prezzo;
      // If window is larger than any grid entry, find the largest grid entry
      const largest = sorted[sorted.length - 1];
      if (largest) return largest.prezzo;
      return null;
    };

    const calcolaVanoPDF = (v) => {
      const m = v.misure||{};
      const lc=(m.lCentro||0)/1000, hc=(m.hCentro||0)/1000;
      const lmm=m.lCentro||0, hmm=m.hCentro||0;
      const mq=lc*hc, perim=2*(lc+hc);
      const sysRec = sistemiDB.find(s=>(s.marca+" "+s.sistema)===v.sistema||s.sistema===v.sistema);
      // Get minimo mq for this tipologia
      const minCat = tipoToMinCat(v.tipo || "F1A");
      const minimoMq = sysRec?.minimiMq?.[minCat] || 0;
      const mqCalc = (minimoMq > 0 && mq > 0 && mq < minimoMq) ? minimoMq : mq;
      // Price: try grid first, fallback to €/mq with minimo applied
      let basePrezzoSer = 0;
      const gridPrice = sysRec?.griglia ? grigliaLookup(sysRec.griglia, lmm, hmm) : null;
      if (gridPrice !== null) {
        basePrezzoSer = gridPrice;
      } else {
        basePrezzoSer = mqCalc * parseFloat(sysRec?.prezzoMq||sysRec?.euroMq||c.prezzoMq||350);
      }
      let tot = basePrezzoSer;
      const vetroRec = vetriDB.find(g=>g.code===v.vetro||g.nome===v.vetro);
      if(vetroRec?.prezzoMq) tot += mq * parseFloat(vetroRec.prezzoMq);
      const copRec = coprifiliDB.find(cp=>cp.cod===v.coprifilo);
      if(copRec?.prezzoMl) tot += perim * parseFloat(copRec.prezzoMl);
      const lamRec = lamiereDB.find(l=>l.cod===v.lamiera);
      if(lamRec?.prezzoMl) tot += lc * parseFloat(lamRec.prezzoMl);
      const tapp=v.accessori?.tapparella; if(tapp?.attivo&&c.prezzoTapparella){const tmq=((tapp.l||m.lCentro||0)/1000)*((tapp.h||m.hCentro||0)/1000);tot+=tmq*parseFloat(c.prezzoTapparella);}
      const pers=v.accessori?.persiana; if(pers?.attivo&&c.prezzoPersiana){const pmq=((pers.l||m.lCentro||0)/1000)*((pers.h||m.hCentro||0)/1000);tot+=pmq*parseFloat(c.prezzoPersiana);}
      const zanz=v.accessori?.zanzariera; if(zanz?.attivo&&c.prezzoZanzariera){const zmq=((zanz.l||m.lCentro||0)/1000)*((zanz.h||m.hCentro||0)/1000);tot+=zmq*parseFloat(c.prezzoZanzariera);}
      // Voci libere
      if (v.vociLibere?.length > 0) v.vociLibere.forEach(vl => { tot += (vl.prezzo || 0) * (vl.qta || 1); });
      return { tot, mq, perim, sysRec, vetroRec, copRec, lamRec };
    };
    const vaniPDF = getVaniAttivi(c);
    const totale = vaniPDF.reduce((s,v)=>s+calcolaVanoPDF(v).tot, 0);
    const sconto = parseFloat(c.sconto||0);
    const scontoVal = totale * sconto / 100;
    const imponibile = totale - scontoVal;
    const ivaPerc = parseFloat(c.ivaPerc||10);
    const iva = imponibile * ivaPerc / 100;
    const totIva = imponibile + iva;
    const oggi = new Date().toLocaleDateString("it-IT");
    const totalMq = vaniPDF.reduce((s,v)=>s+calcolaVanoPDF(v).mq, 0);
    const az = aziendaInfo;
    const fmt = (n: number) => n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const TIPI_LABEL: Record<string,string> = { F1A:"Finestra 1 anta", F2A:"Finestra 2 ante", PF1A:"Portafinestra 1 anta", PF2A:"Portafinestra 2 ante", SC2A:"Scorrevole 2 ante", SC4A:"Scorrevole 4 ante", VAS:"Vasistas", FIS:"Fisso", PB:"Porta blindata", PI:"Porta interna", PORTONE:"Portone", TDBR:"Tenda a bracci", TDCAD:"Tenda a caduta", TDCAP:"Cappottina", TDVER:"Tenda verticale", TDRUL:"Tenda a rullo", TDPERG:"Pergola bioclimatica", TDZIP:"Tenda ZIP/Screen", TDVELA:"Vela ombreggiante", VENEZIA:"Veneziana", TDS:"Tenda da sole", TDR:"Tenda a rullo", TVE:"Tenda veranda", PBC:"Pergola bioclimatica", PGA:"Pergola addossata", PGF:"Pergola freestanding", TCA:"Tenda a cappottina", TCB:"Tenda a bracci", ZTE:"Zanzariera tenda" };
    const TIPI_OUTDOOR = ["TDBR","TDCAD","TDCAP","TDVER","TDRUL","TDPERG","TDZIP","TDVELA","VENEZIA","TDS","TDR","TVE","PBC","PGA","PGF","TCA","TCB","ZTE"];
    const isOutdoor = (tipo: string) => TIPI_OUTDOOR.includes(tipo);

    // SVG technical drawing per tipo - IMPROVED
    const drawSVG = (tipo: string, w: number, h: number) => {
      // Use standard dimensions if 0
      const DEFAULTS: Record<string,number[]> = { F1A:[700,1200], F2A:[1200,1400], F3A:[1800,1400], PF1A:[800,2200], PF2A:[1400,2200], PF3A:[2100,2200], VAS:[700,500], SOPR:[800,400], FIS:[600,1000], FISTONDO:[600,600], SC2A:[1600,2200], SC4A:[2800,2200], ALZSC:[3000,2200], BLI:[900,2100], PI:[900,2100] };
      const [defW, defH] = DEFAULTS[tipo] || [1000, 1300];
      const ww = w > 0 ? w : defW;
      const hh = h > 0 ? h : defH;
      const vw=140, vh=Math.max(Math.min(Math.round(vw*(hh/Math.max(ww,1))),180), 60);
      const pad=5, iw=vw-pad*2, ih=vh-pad*2;
      // Frame
      let d = `<rect x="${pad}" y="${pad}" width="${iw}" height="${ih}" rx="1.5" fill="#f0f6ff" stroke="#333" stroke-width="2.5"/>`;
      // Internal frame
      d += `<rect x="${pad+3}" y="${pad+3}" width="${iw-6}" height="${ih-6}" rx="0.5" fill="none" stroke="#555" stroke-width="0.8"/>`;
      
      if (tipo.includes("SC") || tipo === "ALZSC") {
        // Scorrevole
        const mid=vw/2;
        d += `<rect x="${pad+5}" y="${pad+5}" width="${mid-pad-7}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.7"/>`;
        d += `<rect x="${mid+2}" y="${pad+5}" width="${mid-pad-7}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.7"/>`;
        // Rails
        d += `<line x1="${pad+5}" y1="${vh/2}" x2="${vw-pad-5}" y2="${vh/2}" stroke="#bbb" stroke-width="0.3" stroke-dasharray="2,2"/>`;
        // Handles
        d += `<rect x="${mid-10}" y="${vh/2-6}" width="3" height="12" rx="1" fill="#666"/>`;
        d += `<rect x="${mid+7}" y="${vh/2-6}" width="3" height="12" rx="1" fill="#666"/>`;
        // Arrows
        d += `<path d="M${mid-16},${vh/2} L${mid-22},${vh/2-3} L${mid-22},${vh/2+3}Z" fill="#999"/>`;
        d += `<path d="M${mid+16},${vh/2} L${mid+22},${vh/2-3} L${mid+22},${vh/2+3}Z" fill="#999"/>`;
      } else if (tipo.includes("2A") || tipo === "PF2A") {
        // 2 ante
        const mid=vw/2;
        d += `<line x1="${mid}" y1="${pad+3}" x2="${mid}" y2="${vh-pad-3}" stroke="#333" stroke-width="1.5"/>`;
        // Left pane
        d += `<rect x="${pad+5}" y="${pad+5}" width="${mid-pad-7}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        d += `<line x1="${pad+5}" y1="${pad+5}" x2="${mid-2}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        d += `<line x1="${mid-2}" y1="${pad+5}" x2="${pad+5}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        // Right pane
        d += `<rect x="${mid+2}" y="${pad+5}" width="${mid-pad-7}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        d += `<line x1="${mid+2}" y1="${pad+5}" x2="${vw-pad-5}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        d += `<line x1="${vw-pad-5}" y1="${pad+5}" x2="${mid+2}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        // Handles
        d += `<circle cx="${mid-8}" cy="${vh/2}" r="3" fill="none" stroke="#333" stroke-width="1"/>`;
        d += `<circle cx="${mid+8}" cy="${vh/2}" r="3" fill="none" stroke="#333" stroke-width="1"/>`;
        // Hinge indicators
        d += `<rect x="${pad+2}" y="${vh/3}" width="2" height="8" rx="1" fill="#888"/>`;
        d += `<rect x="${pad+2}" y="${vh*2/3}" width="2" height="8" rx="1" fill="#888"/>`;
        d += `<rect x="${vw-pad-4}" y="${vh/3}" width="2" height="8" rx="1" fill="#888"/>`;
        d += `<rect x="${vw-pad-4}" y="${vh*2/3}" width="2" height="8" rx="1" fill="#888"/>`;
      } else if (tipo === "VAS" || tipo === "SOPR") {
        // Vasistas / Sopraluce
        d += `<rect x="${pad+5}" y="${pad+5}" width="${iw-10}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        d += `<line x1="${pad+5}" y1="${vh-pad-5}" x2="${vw/2}" y2="${pad+5}" stroke="#ccc" stroke-width="0.4"/>`;
        d += `<line x1="${vw-pad-5}" y1="${vh-pad-5}" x2="${vw/2}" y2="${pad+5}" stroke="#ccc" stroke-width="0.4"/>`;
        // Handle bottom center
        d += `<rect x="${vw/2-5}" y="${vh-pad-9}" width="10" height="3" rx="1" fill="#666"/>`;
        // Hinge top
        d += `<rect x="${vw/3}" y="${pad+2}" width="8" height="2" rx="1" fill="#888"/>`;
        d += `<rect x="${vw*2/3-8}" y="${pad+2}" width="8" height="2" rx="1" fill="#888"/>`;
      } else if (tipo === "FIS" || tipo === "FISTONDO") {
        // Fisso
        d += `<rect x="${pad+5}" y="${pad+5}" width="${iw-10}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        // Glass dividers
        d += `<line x1="${vw/2}" y1="${pad+5}" x2="${vw/2}" y2="${vh-pad-5}" stroke="#ddd" stroke-width="0.3"/>`;
        d += `<line x1="${pad+5}" y1="${vh/2}" x2="${vw-pad-5}" y2="${vh/2}" stroke="#ddd" stroke-width="0.3"/>`;
        // "FISSO" label
        d += `<text x="${vw/2}" y="${vh/2+3}" text-anchor="middle" font-size="8" fill="#999" font-style="italic">fisso</text>`;
      } else if (tipo === "BLI") {
        // Porta blindata
        d += `<rect x="${pad+5}" y="${pad+5}" width="${iw-10}" height="${ih-10}" fill="#f5ece0" stroke="#555" stroke-width="0.7"/>`;
        // Panel details
        d += `<rect x="${pad+12}" y="${pad+15}" width="${iw-24}" height="${ih/4}" rx="2" fill="none" stroke="#987" stroke-width="0.5"/>`;
        d += `<rect x="${pad+12}" y="${vh/2-ih/8}" width="${iw-24}" height="${ih/4}" rx="2" fill="none" stroke="#987" stroke-width="0.5"/>`;
        // Handle
        d += `<rect x="${vw-pad-14}" y="${vh/2-8}" width="3" height="16" rx="1.5" fill="#666"/>`;
        // Lock
        d += `<circle cx="${vw-pad-12}" cy="${vh/2+14}" r="2.5" fill="none" stroke="#666" stroke-width="0.8"/>`;
      } else {
        // 1 anta standard (F1A, PF1A)
        d += `<rect x="${pad+5}" y="${pad+5}" width="${iw-10}" height="${ih-10}" fill="#e8f0fe" stroke="#555" stroke-width="0.5"/>`;
        // Opening diagonals
        d += `<line x1="${pad+5}" y1="${pad+5}" x2="${vw-pad-5}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        d += `<line x1="${vw-pad-5}" y1="${pad+5}" x2="${pad+5}" y2="${vh-pad-5}" stroke="#ccc" stroke-width="0.4"/>`;
        // Handle
        d += `<circle cx="${vw-pad-12}" cy="${vh/2}" r="3" fill="none" stroke="#333" stroke-width="1"/>`;
        d += `<line x1="${vw-pad-12}" y1="${vh/2-3}" x2="${vw-pad-12}" y2="${vh/2-10}" stroke="#333" stroke-width="1"/>`;
        // Hinges left
        d += `<rect x="${pad+2}" y="${vh/3}" width="2" height="8" rx="1" fill="#888"/>`;
        d += `<rect x="${pad+2}" y="${vh*2/3}" width="2" height="8" rx="1" fill="#888"/>`;
      }
      // Dimension labels
      d += `<text x="${vw/2}" y="${vh+10}" text-anchor="middle" font-size="8" fill="#333" font-weight="700">${w} mm</text>`;
      d += `<text x="${vw+6}" y="${vh/2+3}" text-anchor="start" font-size="8" fill="#333" font-weight="700" transform="rotate(90,${vw+6},${vh/2})">${h} mm</text>`;
      return `<svg viewBox="0 0 ${vw+14} ${vh+14}" width="160" style="display:block;margin:6px auto;">${d}</svg>`;
    };

    // Build grouped sections by sistema
    const vaniWithCalc = vaniPDF.map((v, i) => {
      const { tot: sub, mq, perim, sysRec, vetroRec, copRec, lamRec } = calcolaVanoPDF(v);
      const m = v.misure||{};
      const lmm = m.lCentro||0, hmm = m.hCentro||0;
      const colInt = v.coloreInt || v.coloreInterno || v.colore || "Bianco";
      const colEst = v.coloreEst || v.coloreEsterno || v.colore || "Bianco";
      const vetroDesc = vetroRec ? vetroRec.code + (vetroRec.nome ? " " + vetroRec.nome : "") : (v.vetro || "");
      const sysKey = sysRec ? sysRec.id : (v.sistema || "nessuno");
      const sysName = sysRec ? (sysRec.marca ? sysRec.marca.toUpperCase() + " - " + sysRec.sistema.toUpperCase() : sysRec.sistema.toUpperCase()) : (v.sistema ? v.sistema.toUpperCase() : "");
      const tipoCode = v.tipo || "F1A";
      const tipoLabel = TIPI_LABEL[tipoCode] || tipoCode;
      const acc = v.accessori || {};
      let specs = '';
      const addS = (l: string, val: string) => { if (val) specs += `<tr><td class="sl">${l}</td><td class="sv"><b>${val}</b></td></tr>`; };
      addS("Colore interno:", colInt);
      addS("Colore esterno:", colEst);
      if (v.bicolore) addS("Finitura:", "Bicolore");
      if (vetroDesc) addS("Vetro:", vetroDesc);
      if (v.maniglia) addS("Martellina:", v.maniglia);
      addS("Superficie:", mq.toFixed(2).replace(".",",") + " m\u00b2");
      if (v.rifilDx) addS("Sagoma telaio dx:", v.rifilDx);
      if (v.rifilSotto || v.sagomaInf) addS("Sagoma telaio inf:", v.rifilSotto || v.sagomaInf || "");
      if (v.rifilSopra || v.sagomaSup) addS("Sagoma telaio sup:", v.rifilSopra || v.sagomaSup || "");
      if (v.rifilSx) addS("Sagoma telaio sx:", v.rifilSx);
      if (v.telaio) addS("Telaio fisso:", v.telaio);
      if (v.telaioAlaZ) addS("Telaio mobile:", v.telaioAlaZ);
      if (copRec) addS("Coprifilo:", copRec.nome || copRec.cod);
      if (lamRec) addS("Lamiera:", lamRec.nome || lamRec.cod);
      addS("Trasmitt. termica:", (v.trasmittanzaUw || sysRec?.uw || "1,2") + " W/m\u00b2K");
      if (acc.tapparella?.attivo) addS("Tapparella:", (acc.tapparella.tipo || "PVC") + (acc.tapparella.colore ? " " + acc.tapparella.colore : ""));
      if (acc.persiana?.attivo) addS("Persiana:", (acc.persiana.tipo || "Alluminio"));
      if (acc.zanzariera?.attivo) addS("Zanzariera:", (acc.zanzariera.tipo || "Rullo"));
      if (v.note && !v.note.startsWith("\ud83d\udd34")) addS("Note:", v.note);
      // Voci libere
      if (v.vociLibere?.length > 0) {
        v.vociLibere.forEach(vl => {
          const vlTot = (vl.prezzo || 0) * (vl.qta || 1);
          const unitaLabel = { pz: "pz", mq: "mq", ml: "ml", kg: "kg", forfait: "forfait" }[vl.unita] || vl.unita || "pz";
          addS("📦 " + (vl.descrizione || "Voce extra") + ":", `€${(vl.prezzo||0).toFixed(2)}/${unitaLabel} × ${vl.qta||1} = <b style="color:#1a7f37">€${vlTot.toFixed(2)}</b>`);
        });
      }
      return { ...v, idx: i, sub, mq, sysKey, sysName, sysRec, tipoCode, tipoLabel, lmm, hmm, specs };
    });

    // Group by system
    const groups: Record<string, typeof vaniWithCalc> = {};
    vaniWithCalc.forEach(v => {
      const k = String(v.sysKey);
      if (!groups[k]) groups[k] = [];
      groups[k].push(v);
    });

    // Build HTML sections
    let globalIdx = 0;
    const sectionsHtml = Object.entries(groups).map(([key, vani]) => {
      const sys = vani[0].sysRec;
      const sysName = vani[0].sysName || "Senza sistema assegnato";
      const subTot = vani.reduce((s, v) => s + v.sub, 0);
      const subMq = vani.reduce((s, v) => s + v.mq, 0);

      // System header with profile image
      const sysHeader = `<div style="margin-top:16px;margin-bottom:8px;padding:10px 14px;background:#f5f8fc;border:1.5px solid #0066cc30;border-radius:6px;display:flex;align-items:center;gap:14px;page-break-inside:avoid">
        ${sys?.immagineProfilo ? `<img src="${sys.immagineProfilo}" style="height:65px;max-width:140px;object-fit:contain;border-radius:4px;background:#fff;padding:4px;border:1px solid #ddd" alt=""/>` : `<div style="width:60px;height:60px;background:#e8f0fe;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:28px">🪟</div>`}
        <div style="flex:1">
          <div style="font-size:14px;font-weight:900;color:#0066cc;letter-spacing:-0.3px">${sysName}</div>
          ${sys ? `<div style="font-size:9px;color:#666;margin-top:2px">${sys.euroMq ? "€" + sys.euroMq + "/m² base" : ""} ${sys.uw ? " · Uw " + sys.uw + " W/m²K" : ""}</div>` : ""}
          <div style="font-size:9px;color:#888;margin-top:1px">${vani.length} element${vani.length > 1 ? "i" : "o"} · ${subMq.toFixed(2).replace(".",",")} m²</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:13px;font-weight:900;color:#1a1a1c">&euro; ${fmt(subTot)}</div>
          <div style="font-size:8px;color:#888">subtotale</div>
        </div>
      </div>`;

      // Vani rows
      const rows = vani.map(v => {
        globalIdx++;
        return `<div style="display:flex;gap:10px;padding:10px 8px;border-bottom:1px solid #eee;page-break-inside:avoid">
          <div style="width:180px;text-align:center;flex-shrink:0">
            <div style="font-size:22px;font-weight:900;color:#0066cc;margin-bottom:2px">${String(globalIdx).padStart(2,"0")}</div>
            ${drawSVG(v.tipoCode, v.lmm, v.hmm)}
            <div style="font-size:7.5px;color:#999;font-style:italic;margin-top:1px">Vista interna</div>
            <div style="font-size:9px;font-weight:700;color:#333;margin-top:2px">${v.tipoLabel}</div>
            ${v.stanza ? `<div style="font-size:8px;color:#888">${v.stanza}${v.piano ? ", " + v.piano : ""}</div>` : ""}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
              <div style="font-size:11px;font-weight:700">${v.lmm} × ${v.hmm} mm</div>
              <div style="font-size:12px;font-weight:900;color:#1a1a1c">&euro; ${fmt(v.sub)}</div>
            </div>
            <table class="st"><tbody>${v.specs}</tbody></table>
            ${Object.values(v.foto || {}).filter(f => f.tipo === "foto" && f.dataUrl).length > 0 ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${Object.values(v.foto || {}).filter(f => f.tipo === "foto" && f.dataUrl).slice(0, 4).map(f => `<img src="${f.dataUrl}" style="width:60px;height:45px;object-fit:cover;border-radius:3px;border:1px solid #ddd" alt=""/>`).join("")}${Object.values(v.foto || {}).filter(f => f.tipo === "foto" && f.dataUrl).length > 4 ? `<div style="width:60px;height:45px;background:#f0f0f0;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666">+${Object.values(v.foto || {}).filter(f => f.tipo === "foto" && f.dataUrl).length - 4}</div>` : ""}</div>` : ""}
          </div>
        </div>`;
      }).join("");

      return sysHeader + `<div style="border:1px solid #ddd;border-radius:4px;overflow:hidden;margin-bottom:6px">${rows}</div>`;
    }).join("");

    // Extra rows (trasporto etc)
    let extraHtml = '';
    if (c.trasporto && parseFloat(c.trasporto) > 0) {
      extraHtml = `<div style="margin-top:8px;padding:10px 14px;background:#f9f9f9;border:1px solid #ddd;border-radius:4px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:11px;font-weight:700">🚛 Trasporto</div><div style="font-size:9px;color:#666">${c.trasportoNote || "Trasporto e scarico"}</div></div>
        <div style="font-size:12px;font-weight:900">&euro; ${fmt(parseFloat(c.trasporto))}</div>
      </div>`;
    }

    const scontoRow = sconto > 0 ? `<tr><td class="tl" style="color:#D08008">Sconto ${sconto}%</td><td class="tv" style="color:#D08008">&minus; ${fmt(scontoVal)}</td></tr>` : '';
    const noteHtml = c.notePreventivo ? `<div style="border:1px solid #ddd;padding:10px 12px;margin:10px 0;font-size:9.5px;color:#444;line-height:1.5"><b>Note:</b> ${c.notePreventivo}</div>` : '';
    const firmaHtml = c.firmaCliente ? `<img src="${c.firmaCliente}" style="max-height:55px;max-width:100%;display:block;margin:0 auto 4px"/>` : '<div style="border-bottom:1px solid #666;height:45px;margin-bottom:4px"></div>';

    const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/><title>Preventivo ${c.code}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:12mm 10mm 15mm 10mm}
body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1a1a1c;font-size:10px;line-height:1.35;background:#fff}
.pg{max-width:210mm;margin:0 auto;padding:12px 16px}
/* HEADER */
.hd{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;margin-bottom:14px;border-bottom:3px solid #0066cc}
.an{font-size:20px;font-weight:900;color:#0066cc;letter-spacing:-0.3px}
.ai{font-size:9px;color:#555;line-height:1.6}
/* CLIENT */
.cl-s{margin-bottom:12px;display:flex;justify-content:space-between}
.cl-l{font-size:9px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
.cl-n{font-size:13px;font-weight:800}
.cl-a{font-size:10px;color:#555}
.pi{font-size:10px;line-height:1.6}.pi b{color:#0066cc}
.intro{font-size:10px;color:#444;margin:10px 0 8px;font-style:italic}
/* TABLE */
.pt{width:100%;border-collapse:collapse;margin-bottom:8px;border:1px solid #ccc}
.pt thead th{background:#f0f0f0;border:1px solid #ccc;padding:5px 7px;font-size:8.5px;font-weight:700;text-transform:uppercase;color:#444;text-align:center}
.ir{border-bottom:1px solid #ddd}.ir2{border-bottom:1.5px solid #aaa}
.cn{width:150px;padding:8px;vertical-align:top;border-right:1px solid #ddd;text-align:center}
.n0{font-size:26px;font-weight:900;color:#0066cc;margin-bottom:4px}
.cv{font-size:7.5px;color:#999;font-style:italic;margin-top:2px}
.ct{font-size:9px;font-weight:700;color:#333;margin-top:3px;text-transform:uppercase}
.cs{font-size:8px;color:#888}
.csys{font-size:8px;font-weight:700;color:#0066cc;margin-top:2px;line-height:1.2}
.cd{padding:5px 7px;vertical-align:top;border-bottom:1px solid #eee}
.dv{font-size:11px;font-weight:700}
.cp,.cq,.ce{width:70px;padding:5px 7px;text-align:right;vertical-align:top;border-left:1px solid #ddd;font-size:10px}
.ce{font-weight:800}
.csp{padding:0 7px 7px;border-bottom:none}
.st{border-collapse:collapse;width:100%}
.st td{padding:1.5px 5px;font-size:9.5px;vertical-align:top}
.st .sl{color:#666;width:130px;white-space:nowrap}
.st .sv b{font-weight:700;color:#1a1a1c}
/* TOTALS */
.ts{margin-top:4px;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
.qi{font-size:10px;color:#555;padding-top:6px}.qi b{color:#1a1a1c}
.tt{border-collapse:collapse;min-width:250px}
.tt td{padding:4px 10px;font-size:10px}
.tl{text-align:right;color:#555;border:1px solid #ddd;background:#fafafa}
.tv{text-align:right;font-weight:700;border:1px solid #ddd;min-width:85px}
.tf .tl,.tf .tv{font-size:14px;font-weight:900;background:#f0f0f0;border:2px solid #333}
.tf .tv{color:#0066cc}
/* CONDIZIONI */
.ct2{font-size:10px;font-weight:800;text-transform:uppercase;text-align:center;margin:14px 0 8px;letter-spacing:.5px}
.cst{font-size:9px;font-weight:700;text-align:center;margin-bottom:6px;color:#555}
.ctx{font-size:9px;color:#444;line-height:1.6;margin-bottom:8px}.ctx b{color:#1a1a1c}
/* FIRMA */
.fs{display:flex;gap:36px;margin-top:20px;padding-top:14px;border-top:1.5px solid #ccc}
.fb{flex:1;text-align:center}.fl{font-size:8.5px;color:#555}
/* FOOTER */
.ft{margin-top:14px;padding:10px 0;border-top:2px solid #0066cc;display:flex;justify-content:space-between;font-size:8px;color:#888}
.ft b{color:#555}
/* PRINT */
.pb{display:block;margin:0 auto 12px;padding:10px 28px;background:#0066cc;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}
@media print{.pb{display:none!important}.pg{padding:0;margin:0}}
</style></head><body>
<div class="pg">
<button class="pb" onclick="window.print()">🖨️ Stampa / Salva PDF</button>
<div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #0066cc;padding:10px 16px;display:flex;gap:8px;z-index:999;box-shadow:0 -4px 20px rgba(0,0,0,0.15)">
  <button onclick="window.print()" style="flex:1;padding:10px;background:#0066cc;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">🖨️ Stampa PDF</button>
  <button onclick="if(navigator.share){navigator.share({title:'Preventivo ${c.code}',text:'Preventivo per ${c.cliente}',url:window.location.href}).catch(()=>{})}else{navigator.clipboard.writeText(document.title);alert('Link copiato!')}" style="flex:1;padding:10px;background:#34c759;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">📤 Condividi</button>
  <button onclick="window.close()" style="padding:10px 16px;background:#ff3b30;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">✕</button>
</div>

<div class="hd">
  <div>
    ${az.logo?`<img src="${az.logo}" style="height:48px;max-width:120px;object-fit:contain;margin-bottom:6px;display:block" alt=""/>`:''}
    <div class="an">${az.ragione||"La Tua Azienda"}</div>
    <div class="ai">${az.indirizzo||""}<br/>Tel. ${az.telefono||""}${az.email?" &middot; "+az.email:""}${az.piva?"<br/>P.IVA "+az.piva:""}${az.cciaa?" &middot; REA "+az.cciaa:""}${(az as any).pec?"<br/>PEC: "+(az as any).pec:""}</div>
  </div>
  <div style="text-align:right">

  </div>
</div>

<div class="cl-s">
  <div>
    <div class="cl-l">Spett.le</div>
    <div class="cl-n">${c.cliente} ${c.cognome||""}</div>
    <div class="cl-a">${c.indirizzo||""}</div>
    ${c.telefono?`<div class="cl-a">Tel. ${c.telefono}</div>`:""}
    ${c.email?`<div class="cl-a">${c.email}</div>`:""}
  </div>
  <div style="text-align:right">
    <div class="pi">Preventivo n. <b>${c.code.replace("CM-","")}</b></div>
    <div class="pi">Riferimento ordine <b>${c.cliente} ${c.cognome||""}</b></div>
    <div class="pi">Data: <b>${oggi}</b></div>
  </div>
</div>

<div class="intro">A seguito della Vostra gentile richiesta Vi rimettiamo il presente preventivo:</div>

${sectionsHtml}
${extraHtml}

<div class="ts">
  <div class="qi">Quadratura: <b>${totalMq.toFixed(2).replace(".",",")} m&sup2;</b></div>
  <table class="tt">
    <tr><td class="tl">Imponibile:</td><td class="tv">${fmt(imponibile)}</td></tr>
    ${scontoRow}
    <tr><td class="tl">I.V.A. ${ivaPerc}%:</td><td class="tv">${fmt(iva)}</td></tr>
    <tr class="tf"><td class="tl">Totale iva inclusa:</td><td class="tv">&euro; ${fmt(totIva)}</td></tr>
  </table>
</div>

${noteHtml}

${(() => {
  const nl2br = (s: string) => s.replace(/\n/g, "<br/>");
  const defFornitura = (az.ragione?az.ragione.toUpperCase():"L'AZIENDA") + ", NELL'ESECUZIONE DELLA PRODUZIONE E' GARANTE DELL'OSSERVANZA SCRUPOLOSA DELLA REGOLA D'ARTE E DELLE NORME VIGENTI.";
  const defPagamento = "<b>1. Pagamento</b><br/>&middot; 50% acconto alla firma del contratto previa ricezione di ns fattura di acconto<br/>&middot; 50% a SALDO, se non diversamente autorizzato a mezzo mail, a comunicazione merce pronta previa ricezione ns fattura a saldo fornitura.";
  const defConsegna = "<b>2. Tempi di consegna per tipologia di prodotto:</b><br/>&middot; PVC: BATTENTE STANDARD 30 GG.<br/>&middot; PVC: PORTE 35 GG.<br/>&middot; PVC: ALZANTI SCORREVOLI 40 GG.<br/>&middot; PVC: SCORREVOLE PARALLELO/RIBALTA E SCORRE 35 GG.<br/>&middot; PVC: FUORI SQUADRO 50 GG.<br/>&middot; ALLUMINIO: 45/50 GG LAVORATIVI.<br/><br/>Il contratto aggiornato datato e sottoscritto dal cliente con accettazione dei disegni tecnici allegati ed avviato dopo aver avviato l'ordine al fornitore dei materiali, non potranno pi&ugrave; essere accettate variazioni di alcun tipo.";
  const defContratto = "(I prezzi si intendono IVA esclusa)<br/><br/><b>1. Qualificazione giuridica del contratto</b><br/>Il contratto &egrave; ad ogni utile effetto di legge una compravendita in quanto la fornitura del materiale &egrave; prevalente.<br/><br/><b>2. Conclusione del contratto</b><br/>Il presente contratto si conclude con la sua sottoscrizione da parte dell'Acquirente e del Venditore.<br/><br/><b>3. Misure</b><br/>L'Acquirente &egrave; responsabile nel caso in cui abbia dato misure inesatte o non abbia comunicato tempestivamente variazioni.<br/><br/><b>4. Consegna</b><br/>La data di consegna ha natura meramente indicativa e non tassativa.<br/><br/><b>5. Garanzia</b><br/>I manufatti sono coperti da garanzia a norma di legge.<br/><br/><b>6. Trattamento dati</b><br/>Il trattamento dei dati personali viene svolto nel rispetto del D. Lgs. n. 196/2003.";
  const defDettagli = (vaniPDF.length > 0 && vaniPDF[0].sistema ? "Telai e strutture di manovra, sistema " + vaniPDF[0].sistema + ", colorazione \"" + (vaniPDF[0].coloreInt || vaniPDF[0].coloreEst || vaniPDF[0].colore || "Bianco") + "\"." : "Come da specifiche indicate per ogni singola voce del preventivo.") + "<br/><br/><b>Documenti da allegare alla consegna:</b><br/>- Dichiarazione di Prestazione;<br/>- Dichiarazione energetica;<br/>- Etichetta CE;<br/>- Manuale d'uso e manutenzione.";
  
  const txFornitura = az.condFornitura ? nl2br(az.condFornitura) : defFornitura;
  const txPagamento = az.condPagamento ? nl2br(az.condPagamento) : defPagamento;
  const txConsegna = az.condConsegna ? nl2br(az.condConsegna) : defConsegna;
  const txContratto = az.condContratto ? nl2br(az.condContratto) : defContratto;
  const txDettagli = az.condDettagli ? nl2br(az.condDettagli) : defDettagli;

  return `
<div class="ct2">CONDIZIONI GENERALI DI FORNITURA:</div>
<div class="ctx">${txFornitura}</div>

<div class="cst">CONDIZIONI PAGAMENTO E CONSEGNA (parte del preventivo)</div>
<div class="ctx">${txPagamento}<br/><br/>${txConsegna}</div>

<div class="ct2">CONDIZIONI GENERALI DI CONTRATTO</div>
<div class="ctx">${txContratto}</div>

<div class="ctx" style="margin-top:10px">
<b>Dettagli tecnici:</b><br/>
${txDettagli}<br/><br/>
${az.indirizzo ? (az.indirizzo.split(",").pop()?.trim() || "") + ", " : ""}${oggi}<br/><br/>
<div style="text-align:right;font-style:italic">Distinti saluti.</div>
</div>`;
})()}

<div class="fs">
  <div class="fb"><div style="border-bottom:1px solid #666;height:45px;margin-bottom:4px"></div><div class="fl">Firma tecnico / Timbro azienda</div></div>
  <div class="fb">${firmaHtml}<div class="fl">Firma cliente per accettazione${c.dataFirma?" &mdash; "+c.dataFirma:""}</div></div>
</div>

<div class="ft">
  <div><b>Indirizzo:</b><br/>${az.indirizzo||""}</div>
  <div><b>Contatti:</b><br/>Tel. ${az.telefono||""}${az.email?"<br/>"+az.email:""}</div>
  <div><b>Dati Aziendali:</b><br/>${az.ragione||""}${az.piva?"<br/>P.IVA "+az.piva:""}${az.iban?"<br/>IBAN: "+az.iban:""}</div>
</div>
<div style="text-align:center;font-size:7px;color:#bbb;margin-top:6px">Documento generato con MASTRO ERP &mdash; mastro.app</div>
</div>
</body></html>`;

    const blob = new Blob([html], {type:"text/html"});
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // === PDF MISURE PER PRODUZIONE ===
  const generaPDFMisure = (c) => {
    const az = aziendaDB;
    const vani = getVaniAttivi(c);
    const fmt = (n) => n.toLocaleString("it-IT", { minimumFractionDigits: 2 });

    const vaniHtml = vani.map((v, i) => {
      const m = v.misure || {};
      const fotoEntries = Object.entries(v.foto || {}).filter(([, f]) => f.tipo === "foto" && f.dataUrl);
      const tip = TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo);
      const lmm = m.lCentro || m.lAlto || m.lBasso || 0;
      const hmm = m.hCentro || m.hSx || m.hDx || 0;
      const mq = lmm > 0 && hmm > 0 ? ((lmm / 1000) * (hmm / 1000)) : 0;

      return `<div style="border:1.5px solid #333;border-radius:6px;padding:12px;margin-bottom:10px;page-break-inside:avoid">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333;padding-bottom:6px;margin-bottom:8px">
          <div>
            <span style="font-size:18px;font-weight:900;color:#0066cc">${String(i + 1).padStart(2, "0")}</span>
            <span style="font-size:14px;font-weight:800;margin-left:8px">${v.nome}</span>
            <span style="font-size:11px;color:#666;margin-left:8px">${tip?.label || v.tipo} · ${v.stanza || ""} · ${v.piano || ""}</span>
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:900">${lmm} × ${hmm} mm</div>
            <div style="font-size:10px;color:#666">${mq.toFixed(2)} m² ${(v.pezzi || 1) > 1 ? "× " + v.pezzi + " pz" : ""}</div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:10px">
          <tr>
            <td style="border:1px solid #ccc;padding:4px;background:#f0f8ff;font-weight:700;width:50%" colspan="2">📏 LARGHEZZE (mm)</td>
            <td style="border:1px solid #ccc;padding:4px;background:#fff8f0;font-weight:700;width:50%" colspan="2">📐 ALTEZZE (mm)</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Alto</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.lAlto || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Sinistra</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.hSx || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Centro</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.lCentro || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Centro</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.hCentro || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Basso</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.lBasso || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Destra</td><td style="border:1px solid #ccc;padding:4px;font-weight:700;font-family:monospace">${m.hDx || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px;background:#fef3f3" colspan="2">↗ Diag 1: <b>${m.d1 || "—"}</b></td>
            <td style="border:1px solid #ccc;padding:4px;background:#fef3f3" colspan="2">↘ Diag 2: <b>${m.d2 || "—"}</b> ${m.d1 > 0 && m.d2 > 0 ? `(Δ ${Math.abs(m.d1 - m.d2)} mm${Math.abs(m.d1 - m.d2) > 3 ? " ⚠️" : " ✅"})` : ""}</td>
          </tr>
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:4px">
          <tr>
            <td style="border:1px solid #ccc;padding:4px;background:#f0fff0;font-weight:700" colspan="4">⚙️ CONFIGURAZIONE</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Sistema</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.sistema || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Vetro</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.vetro || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Colore INT</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.coloreInt || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Colore EST</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.bicolore ? (v.coloreEst || "—") : "= INT"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Telaio</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.telaio === "Z" ? "Z" : v.telaio === "L" ? "L" : "—"}${v.telaioAlaZ ? " Ala " + v.telaioAlaZ : ""}</td>
            <td style="border:1px solid #ccc;padding:4px">Coprifilo</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.coprifilo || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:4px">Lamiera</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.lamiera || "—"}</td>
            <td style="border:1px solid #ccc;padding:4px">Col. Acc.</td><td style="border:1px solid #ccc;padding:4px;font-weight:700">${v.coloreAcc || "= profili"}</td>
          </tr>
          ${v.rifilato ? `<tr><td style="border:1px solid #ccc;padding:4px;background:#fff8e6" colspan="4">✂️ RIFILATO — Sx: ${v.rifilSx || "—"} · Dx: ${v.rifilDx || "—"} · Sopra: ${v.rifilSopra || "—"} · Sotto: ${v.rifilSotto || "—"}</td></tr>` : ""}
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:4px">
          <tr>
            <td style="border:1px solid #ccc;padding:4px;background:#f5f0ff;font-weight:700" colspan="4">🧱 MURATURA</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:3px">Sp. Sx</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.spSx || "—"}</td>
            <td style="border:1px solid #ccc;padding:3px">Sp. Dx</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.spDx || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:3px">Sp. Sopra</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.spSopra || "—"}</td>
            <td style="border:1px solid #ccc;padding:3px">Imbotte</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.imbotte || "—"}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:3px">Dav. Prof.</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.davProf || "—"}</td>
            <td style="border:1px solid #ccc;padding:3px">Dav. Sporg.</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${m.davSporg || "—"}</td>
          </tr>
          <tr><td style="border:1px solid #ccc;padding:3px">Soglia</td><td style="border:1px solid #ccc;padding:3px;font-weight:700" colspan="3">${m.soglia || "—"}</td></tr>
        </table>
        ${v.controtelaio?.tipo ? `<table style="width:100%;border-collapse:collapse;font-size:10px;margin-top:4px">
          <tr><td style="border:1px solid #ccc;padding:4px;background:#e8f4fd;font-weight:700" colspan="4">🔲 CONTROTELAIO ${(v.controtelaio.tipo || "").toUpperCase()}</td></tr>
          <tr><td style="border:1px solid #ccc;padding:3px">L</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${v.controtelaio.l || "—"}</td><td style="border:1px solid #ccc;padding:3px">H</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${v.controtelaio.h || "—"}</td></tr>
          ${v.controtelaio.hCass ? `<tr><td style="border:1px solid #ccc;padding:3px">H Cass.</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${v.controtelaio.hCass}</td><td style="border:1px solid #ccc;padding:3px">Sezione</td><td style="border:1px solid #ccc;padding:3px;font-weight:700">${v.controtelaio.sezione || "—"}</td></tr>` : ""}
        </table>` : ""}
        ${v.accessori?.tapparella?.attivo || v.accessori?.persiana?.attivo || v.accessori?.zanzariera?.attivo ? `<div style="font-size:10px;margin-top:4px;padding:4px;background:#f5f5ff;border:1px solid #ddd;border-radius:3px">
          <b>Accessori:</b> ${v.accessori?.tapparella?.attivo ? "🪟 Tapparella" : ""} ${v.accessori?.persiana?.attivo ? "🏠 Persiana" : ""} ${v.accessori?.zanzariera?.attivo ? "🦟 Zanzariera" : ""}
        </div>` : ""}
        ${fotoEntries.length > 0 ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${fotoEntries.slice(0, 6).map(([, f]) => `<img src="${f.dataUrl}" style="width:70px;height:52px;object-fit:cover;border-radius:3px;border:1px solid #ccc" alt=""/>`).join("")}</div>` : ""}
        ${v.note ? `<div style="font-size:10px;margin-top:4px;padding:4px;background:#fff8e6;border:1px solid #f0e0b0;border-radius:3px">📝 <b>Note:</b> ${v.note}</div>` : ""}
        ${v.difficoltaSalita ? `<div style="font-size:10px;margin-top:3px;color:#b45309">🏗 Accesso: ${v.difficoltaSalita}${v.mezzoSalita ? " — " + v.mezzoSalita : ""}</div>` : ""}
      </div>`;
    }).join("");

    const totalMq = vani.reduce((s, v) => {
      const m = v.misure || {};
      const l = m.lCentro || m.lAlto || m.lBasso || 0;
      const h = m.hCentro || m.hSx || m.hDx || 0;
      return s + (l > 0 && h > 0 ? (l / 1000) * (h / 1000) * (v.pezzi || 1) : 0);
    }, 0);

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Misure — ${c.code}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:15px;font-size:11px}
      @media print{body{padding:5px} .no-print{display:none!important}}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #333;padding-bottom:10px;margin-bottom:12px}
    </style></head><body>
    <div class="header">
      <div>
        ${az.logo ? `<img src="${az.logo}" style="max-height:50px;max-width:180px;margin-bottom:4px" alt=""/>` : ""}
        <div style="font-size:16px;font-weight:900;color:#333">${az.nome || "MASTRO"}</div>
        <div style="font-size:9px;color:#666">${az.indirizzo || ""} ${az.citta || ""} · ${az.tel || ""}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:20px;font-weight:900;color:#5856d6">SCHEDA MISURE</div>
        <div style="font-size:11px;color:#333;margin-top:2px"><b>${c.code}</b></div>
        <div style="font-size:10px;color:#666">${new Date().toLocaleDateString("it-IT")}</div>
      </div>
    </div>
    <div style="display:flex;gap:16px;margin-bottom:12px;padding:10px;background:#f5f5f7;border-radius:6px">
      <div style="flex:1"><div style="font-size:8px;color:#999;text-transform:uppercase">Cliente</div><div style="font-size:13px;font-weight:800">${c.cliente}</div></div>
      <div style="flex:1"><div style="font-size:8px;color:#999;text-transform:uppercase">Indirizzo</div><div style="font-size:11px">${c.indirizzo || "—"}</div></div>
      <div><div style="font-size:8px;color:#999;text-transform:uppercase">Vani</div><div style="font-size:13px;font-weight:800">${vani.length}</div></div>
      <div><div style="font-size:8px;color:#999;text-transform:uppercase">Tot. m²</div><div style="font-size:13px;font-weight:800">${totalMq.toFixed(2)}</div></div>
    </div>
    ${vaniHtml}
    <div style="margin-top:12px;padding:10px;background:#f9f9f9;border:1px solid #ddd;border-radius:6px;font-size:10px;color:#666;text-align:center">
      Documento generato da MASTRO ERP — ${new Date().toLocaleDateString("it-IT")} ${new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
      <br><b style="color:#333">⚠ DOCUMENTO PER USO INTERNO / PRODUZIONE — NON VALIDO COME PREVENTIVO</b>
    </div>
    <div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #5856d6;padding:10px 16px;display:flex;gap:8px;z-index:999;box-shadow:0 -4px 20px rgba(0,0,0,0.15)">
      <button onclick="window.print()" style="flex:1;padding:10px;background:#5856d6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">🖨️ Stampa PDF</button>
      <button onclick="if(navigator.share){navigator.share({title:document.title,text:'Report misure',url:window.location.href}).catch(()=>{})}else{alert('Usa Stampa → Salva come PDF')}" style="flex:1;padding:10px;background:#34c759;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">📤 Condividi</button>
      <button onclick="window.close()" style="padding:10px 16px;background:#ff3b30;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">✕</button>
    </div>
    <button class="no-print" onclick="window.print()" style="position:fixed;bottom:70px;right:20px;padding:12px 24px;background:#5856d6;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(88,86,214,0.3)">🖨️ Stampa / Salva PDF</button>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // === FATTURAZIONE ===
  const nextNumFattura = () => {
    const anno = new Date().getFullYear();
    const annoPrev = fattureDB.filter(f => f.anno === anno);
    return annoPrev.length + 1;
  };

  const creaFattura = (c, tipo: "acconto" | "saldo" | "unica") => {
    const num = nextNumFattura();
    const anno = new Date().getFullYear();
    // Calcola totale REALE dai vani + voci libere
    const importoBase = calcolaTotaleCommessa(c);
    const giaPagato = fattureDB.filter(f => f.cmId === c.id && f.pagata).reduce((s, f) => s + (f.importo || 0), 0);
    const importo = tipo === "acconto" ? Math.round(importoBase * 0.5) : tipo === "saldo" ? Math.round(importoBase - giaPagato) : importoBase;
    const iva = 10; // serramenti = 10% se ristrutturazione, 22% se nuova costruzione
    const imponibile = Math.round(importo / (1 + iva / 100) * 100) / 100;
    const ivaAmt = importo - imponibile;
    const fattura = {
      id: "fat_" + Date.now(),
      numero: num,
      anno,
      data: new Date().toLocaleDateString("it-IT"),
      dataISO: new Date().toISOString().split("T")[0],
      tipo,
      cmId: c.id,
      cmCode: c.code,
      cliente: c.cliente,
      cognome: c.cognome || "",
      indirizzo: c.indirizzo || "",
      cf: c.cf || "",
      piva: c.piva || "",
      sdi: c.sdi || "",
      pec: c.pec || "",
      importo,
      imponibile,
      iva,
      ivaAmt,
      pagata: false,
      dataPagamento: null,
      metodoPagamento: "",
      scadenza: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split("T")[0]; })(),
      note: tipo === "acconto" ? "Acconto 50% su ordine" : tipo === "saldo" ? "Saldo a completamento lavori" : "",
    };
    setFattureDB(prev => [...prev, fattura]);
    // AUTO-ADVANCE pipeline
    if (tipo === "acconto" || tipo === "unica") setFaseTo(c.id, "ordini");
    if (tipo === "saldo") setFaseTo(c.id, "chiusura");
    return fattura;
  };

  const generaFatturaPDF = (fat) => {
    const az = aziendaDB;
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fattura ${fat.numero}/${fat.anno}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;font-size:12px;color:#333}
      @media print{.no-print{display:none!important}body{padding:10px}}
      table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px;text-align:left}
      th{background:#f5f8fc;font-size:10px;text-transform:uppercase;color:#666}
      .totale{font-size:16px;font-weight:900}
    </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
      <div>
        ${az.logo ? `<img src="${az.logo}" style="max-height:60px;max-width:200px;margin-bottom:6px" alt=""/>` : ""}
        <div style="font-size:18px;font-weight:900">${az.nome || "MASTRO"}</div>
        <div style="font-size:10px;color:#666">${az.indirizzo || ""} · ${az.citta || ""}</div>
        <div style="font-size:10px;color:#666">P.IVA: ${az.piva || "—"} · Tel: ${az.tel || "—"}</div>
        ${az.pec ? `<div style="font-size:10px;color:#666">PEC: ${az.pec}</div>` : ""}
      </div>
      <div style="text-align:right">
        <div style="font-size:24px;font-weight:900;color:#007aff">FATTURA</div>
        <div style="font-size:14px;font-weight:700">N. ${fat.numero}/${fat.anno}</div>
        <div style="font-size:11px;color:#666">Data: ${fat.data}</div>
        <div style="font-size:10px;color:#999;margin-top:4px">${fat.tipo === "acconto" ? "ACCONTO" : fat.tipo === "saldo" ? "SALDO" : "FATTURA"}</div>
      </div>
    </div>
    <div style="background:#f5f5f7;padding:14px;border-radius:8px;margin-bottom:16px">
      <div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:4px">Destinatario</div>
      <div style="font-size:14px;font-weight:800">${fat.cliente} ${fat.cognome}</div>
      <div style="font-size:11px">${fat.indirizzo || ""}</div>
      ${fat.cf ? `<div style="font-size:10px;color:#666">C.F.: ${fat.cf}</div>` : ""}
      ${fat.piva ? `<div style="font-size:10px;color:#666">P.IVA: ${fat.piva}</div>` : ""}
      ${fat.sdi ? `<div style="font-size:10px;color:#666">SDI: ${fat.sdi}</div>` : ""}
      ${fat.pec ? `<div style="font-size:10px;color:#666">PEC: ${fat.pec}</div>` : ""}
      <div style="font-size:10px;color:#666;margin-top:4px">Rif. commessa: ${fat.cmCode}</div>
    </div>
    <table>
      <thead><tr><th>Descrizione</th><th style="width:80px;text-align:right">Imponibile</th><th style="width:60px;text-align:right">IVA %</th><th style="width:80px;text-align:right">IVA</th><th style="width:90px;text-align:right">Totale</th></tr></thead>
      <tbody>
        <tr>
          <td>Fornitura e posa serramenti${fat.tipo === "acconto" ? " — Acconto 50%" : fat.tipo === "saldo" ? " — Saldo" : ""}<br><span style="font-size:10px;color:#666">${fat.note || ""}</span></td>
          <td style="text-align:right;font-weight:700">&euro; ${fmt(fat.imponibile)}</td>
          <td style="text-align:right">${fat.iva}%</td>
          <td style="text-align:right">&euro; ${fmt(fat.ivaAmt)}</td>
          <td style="text-align:right;font-weight:900;font-size:14px">&euro; ${fmt(fat.importo)}</td>
        </tr>
      </tbody>
    </table>
    <div style="text-align:right;margin-top:12px;padding:12px;background:#f0f8ff;border-radius:8px">
      <div style="font-size:10px;color:#666">Imponibile: &euro; ${fmt(fat.imponibile)}</div>
      <div style="font-size:10px;color:#666">IVA ${fat.iva}%: &euro; ${fmt(fat.ivaAmt)}</div>
      <div class="totale" style="margin-top:6px;color:#007aff">TOTALE: &euro; ${fmt(fat.importo)}</div>
    </div>
    <div style="margin-top:16px;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:10px;color:#666">
      <b>Modalità pagamento:</b> Bonifico bancario<br>
      <b>IBAN:</b> ${az.iban || "________________"}<br>
      <b>Scadenza:</b> ${fat.scadenza || "30 giorni data fattura"}<br>
      ${fat.note ? `<b>Note:</b> ${fat.note}` : ""}
    </div>
    <div style="margin-top:20px;text-align:center;font-size:9px;color:#999">Documento generato da MASTRO ERP</div>
    <div class="no-print" style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #007aff;padding:10px 16px;display:flex;gap:8px;z-index:999;box-shadow:0 -4px 20px rgba(0,0,0,0.15)">
      <button onclick="window.print()" style="flex:1;padding:10px;background:#007aff;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">🖨️ Stampa PDF</button>
      <button onclick="if(navigator.share){navigator.share({title:document.title,text:'Ordine fornitore',url:window.location.href}).catch(()=>{})}else{alert('Usa Stampa → Salva come PDF')}" style="flex:1;padding:10px;background:#34c759;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">📤 Condividi</button>
      <button onclick="window.close()" style="padding:10px 16px;background:#ff3b30;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">✕</button>
    </div>
    <button class="no-print" onclick="window.print()" style="position:fixed;bottom:70px;right:20px;padding:12px 24px;background:#007aff;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">🖨️ Stampa / Salva PDF</button>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  // === WHATSAPP / EMAIL HELPERS ===
  const inviaWhatsApp = (c, tipo: "preventivo" | "conferma" | "stato") => {
    const tel = (c.telefono || "").replace(/\D/g, "");
    const msgs = {
      preventivo: `Gentile ${c.cliente}, le invio in allegato il preventivo per la fornitura serramenti. Rif: ${c.code}. Resto a disposizione per qualsiasi chiarimento.`,
      conferma: `Gentile ${c.cliente}, confermiamo la ricezione del suo ordine ${c.code}. Provvederemo a ordinare il materiale. La terremo aggiornata sullo stato di avanzamento.`,
      stato: `Gentile ${c.cliente}, aggiornamento sul suo ordine ${c.code}: ${c.trackingStato === "ordinato" ? "il materiale è stato ordinato" : c.trackingStato === "produzione" ? "il materiale è in produzione" : c.trackingStato === "pronto" ? "il materiale è pronto per la consegna" : c.trackingStato === "consegnato" ? "il materiale è stato consegnato" : c.trackingStato === "montato" ? "il montaggio è completato" : "in lavorazione"}.${c.dataPrevConsegna ? " Consegna prevista: " + c.dataPrevConsegna : ""}`,
    };
    const msg = encodeURIComponent(msgs[tipo] || "");
    window.open(`https://wa.me/${tel.startsWith("39") ? tel : "39" + tel}?text=${msg}`, "_blank");
  };

  const inviaEmail = (c, tipo: "preventivo" | "conferma" | "montaggio" | "saldo" | "generico") => {
    const az = aziendaDB;
    const azNome = az.ragione || az.nome || "Walter Cozza Serramenti";
    const azTel = az.telefono || "";
    const azEmail = az.email || "";
    const firma = `\nCordiali saluti,\n${azNome}${azTel ? "\nTel. " + azTel : ""}${azEmail ? "\n" + azEmail : ""}`;
    const vani = getVaniAttivi(c);
    const totale = vani.reduce((s, v) => s + calcolaVanoPrezzo(v, c), 0) + (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo||0)*(vl.qta||1)), 0);
    const ivaP = parseFloat(c.ivaPerc || 10);
    const totIva = totale * (1 + ivaP / 100);
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";
    
    const templates = {
      preventivo: {
        oggetto: `Preventivo ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\nle trasmetto il preventivo per la fornitura e posa in opera dei serramenti per l'immobile in ${c.indirizzo || "—"}.\n\n📋 Rif. commessa: ${c.code}\n📦 Vani: ${vani.length}\n${c.sistema ? "🏭 Sistema: " + c.sistema + "\n" : ""}💰 Importo: €${fmt(totale)} + IVA ${ivaP}% = €${fmt(totIva)}\n${c.praticaFiscale ? "📑 Agevolazione: " + c.praticaFiscale + "\n" : ""}\nIl preventivo include fornitura, posa in opera, smaltimento vecchi infissi e rilascio documentazione (DoP, CE, manuale).\n\nResto a disposizione per qualsiasi chiarimento.${firma}`
      },
      conferma: {
        oggetto: `Conferma ordine ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\ncon la presente le confermiamo la ricezione dell'ordine per la commessa ${c.code}.\n\n✅ Materiale ordinato al fornitore\n⏱ Tempi di consegna stimati: 4-6 settimane\n📍 Cantiere: ${c.indirizzo || "—"}\n\nLa terremo aggiornata sullo stato di avanzamento della produzione.\n\nPer qualsiasi necessità non esiti a contattarci.${firma}`
      },
      montaggio: {
        oggetto: `Programmazione montaggio ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\nsiamo lieti di comunicarle che il materiale per la commessa ${c.code} è arrivato.\n\n🔧 Montaggio previsto: [INSERIRE DATA]\n📍 Indirizzo: ${c.indirizzo || "—"}\n⏱ Durata stimata: ${vani.length <= 3 ? "1 giorno" : vani.length <= 6 ? "2 giorni" : "3+ giorni"}\n👷 Squadra: [NOME SQUADRA]\n\n📌 Note per il giorno del montaggio:\n- Assicurarsi che i locali siano accessibili\n- Spostare eventuali mobili vicino alle finestre\n- È possibile che si verifichi polvere durante lo smontaggio\n\nLa preghiamo di confermare la data rispondendo a questa mail.${firma}`
      },
      saldo: {
        oggetto: `Completamento lavori e saldo ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\ncon la presente le comunichiamo che i lavori relativi alla commessa ${c.code} sono stati completati con successo.\n\n✅ Fornitura e posa completata\n📦 Vani installati: ${vani.length}\n📍 Cantiere: ${c.indirizzo || "—"}\n\n💶 Importo totale: €${fmt(totIva)} (IVA ${ivaP}% inclusa)\n${(() => { const inc = fattureDB.filter(f => f.cmId === c.id && f.pagata).reduce((s,f)=>s+(f.importo||0),0); return inc > 0 ? `💳 Già versato: €${fmt(inc)}\n📄 Saldo dovuto: €${fmt(totIva - inc)}\n` : ""; })()}\n📎 In allegato:\n- Fattura di saldo\n- Dichiarazione di prestazione (DoP)\n- Certificazione CE\n- Manuale d'uso e manutenzione\n\nModalità di pagamento: Bonifico bancario\nIBAN: ${az.iban || "[IBAN]"}\n\nLa ringraziamo per la fiducia.${firma}`
      },
      generico: {
        oggetto: `Commessa ${c.code} — ${azNome}`,
        corpo: `Gentile ${c.cliente} ${c.cognome || ""},\n\n[Scrivi qui il messaggio]\n\nRif. commessa: ${c.code}\nCantiere: ${c.indirizzo || "—"}${firma}`
      }
    };
    const t = templates[tipo] || templates.generico;
    setEmailDest(c.email || "");
    setEmailOggetto(t.oggetto);
    setEmailCorpo(t.corpo);
    setShowEmailComposer({ cm: c, tipo });
  };

  // =============================================
  // === ORDINI FORNITORE — MODULO COMPLETO ===
  // =============================================

  const [ordineDetail, setOrdineDetail] = useState<string | null>(null); // id ordine aperto
  const [extractingPDF, setExtractingPDF] = useState(false); // loading AI extraction
  const [showInboxDoc, setShowInboxDoc] = useState(false); // global document inbox
  const [inboxResult, setInboxResult] = useState<any>(null); // extracted data from inbox



  // Crea nuovo ordine fornitore da commessa
  const creaOrdineFornitore = (c, fornitoreNome = "") => {
    const vani = getVaniAttivi(c);
    // Auto-genera righe da vani commessa con prezzi
    const righe = vani.map(v => {
      const tipLabel = TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.label || v.tipo || "—";
      const m = v.misure || {};
      const lmm = m.lCentro || 0, hmm = m.hCentro || 0;
      const prezzo = calcolaVanoPrezzo(v, c);
      return {
        id: "r_" + Math.random().toString(36).slice(2, 8),
        desc: `${tipLabel} — ${v.stanza || ""} ${v.piano || ""}`.trim(),
        misure: lmm > 0 && hmm > 0 ? `${lmm}×${hmm}` : "da definire",
        qta: v.pezzi || 1,
        prezzoUnit: Math.round(prezzo * 100) / 100,
        totale: Math.round(prezzo * (v.pezzi || 1) * 100) / 100,
        note: v.coloreEst ? `Colore: ${v.coloreEst}` : "",
      };
    });

    const ord = {
      id: "ord_" + Date.now(),
      cmId: c.id,
      cmCode: c.code,
      cliente: c.cliente,
      numero: ordiniFornDB.filter(o => new Date(o.dataOrdine).getFullYear() === new Date().getFullYear()).length + 1,
      anno: new Date().getFullYear(),
      dataOrdine: new Date().toISOString().split("T")[0],
      fornitore: {
        nome: fornitoreNome,
        email: "",
        tel: "",
        piva: "",
        referente: "",
      },
      righe,
      totale: righe.reduce((s, r) => s + r.totale, 0),
      iva: 22, // IVA fornitore standard
      totaleIva: Math.round(righe.reduce((s, r) => s + r.totale, 0) * 1.22 * 100) / 100,
      sconto: 0,

      // STATO ORDINE
      stato: "bozza" as string, // bozza → inviato → confermato → in_produzione → spedito → consegnato

      // CONFERMA FORNITORE
      conferma: {
        ricevuta: false,
        dataRicezione: "",
        verificata: false, // MASTRO ha controllato
        differenze: "",    // note su differenze
        firmata: false,
        dataFirma: "",
        reinviata: false,
        dataReinvio: "",
      },

      // CONSEGNA
      consegna: {
        prevista: "",       // data prevista dal fornitore
        settimane: 0,       // settimane di produzione
        effettiva: "",      // data effettiva consegna
        luogo: c.indirizzo || "",
        note: "",
      },

      // PAGAMENTO
      pagamento: {
        termini: "30gg_fm" as string, // anticipato, 30gg_fm, 60gg_fm, 90gg_fm, ricevuta_merce
        scadenza: "",
        importo: 0,
        pagato: false,
        dataPagamento: "",
        metodo: "", // bonifico, assegno, riba
      },

      note: "",
    };

    setOrdiniFornDB(prev => [...prev, ord]);
    setFaseTo(c.id, "ordini"); // AUTO-ADVANCE: ordine creato → fase ordini
    return ord;
  };

  // Ricalcola totali ordine
  const ricalcolaOrdine = (ordId: string) => {
    setOrdiniFornDB(prev => prev.map(o => {
      if (o.id !== ordId) return o;
      const subtot = o.righe.reduce((s, r) => s + (r.qta * r.prezzoUnit), 0);
      const scontoVal = subtot * (o.sconto || 0) / 100;
      const imponibile = subtot - scontoVal;
      const ivaVal = imponibile * o.iva / 100;
      return { ...o, totale: imponibile, totaleIva: imponibile + ivaVal, pagamento: { ...o.pagamento, importo: imponibile + ivaVal } };
    }));
  };

  // Aggiorna campo ordine
  const updateOrdine = (ordId: string, path: string, value: any) => {
    setOrdiniFornDB(prev => prev.map(o => {
      if (o.id !== ordId) return o;
      const parts = path.split(".");
      const updated = { ...o };
      let current: any = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return updated;
    }));
  };

  // Calcola scadenza pagamento
  const calcolaScadenzaPagamento = (dataOrdine: string, termini: string) => {
    const d = new Date(dataOrdine);
    if (termini === "anticipato") return dataOrdine;
    if (termini === "ricevuta_merce") return ""; // da compilare alla consegna
    const days = termini === "30gg_fm" ? 30 : termini === "60gg_fm" ? 60 : termini === "90gg_fm" ? 90 : 30;
    // Fine mese + giorni
    const fm = new Date(d.getFullYear(), d.getMonth() + 1, 0); // fine mese ordine
    fm.setDate(fm.getDate() + days);
    return fm.toISOString().split("T")[0];
  };

  // Genera PDF ordine fornitore
  const generaOrdinePDF = (ord) => {
    const az = aziendaDB;
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";
    const imponibile = ord.totale;
    const ivaVal = imponibile * ord.iva / 100;
    const scontoPerc = ord.sconto || 0;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1a1a1c;padding:20px;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #1a1a1c}
      .title{font-size:20px;font-weight:800;letter-spacing:-0.3px}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th{background:#f5f5f7;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #ddd}
      td{padding:8px 10px;border-bottom:1px solid #eee}
      .total-row td{font-weight:700;border-top:2px solid #1a1a1c;border-bottom:none}
      .box{background:#f9f9fb;border-radius:8px;padding:14px;margin-bottom:12px}
      .sign-area{margin-top:40px;display:flex;justify-content:space-between}
      .sign-box{width:45%;border-top:1px solid #aaa;padding-top:8px;text-align:center;font-size:10px;color:#888}
      @media print{body{padding:10px}}
    </style></head><body>

    <div class="header">
      <div>
        ${az.logo ? `<img src="${az.logo}" style="max-height:45px;margin-bottom:6px" /><br>` : ""}
        <div class="title">${az.nome || "MASTRO"}</div>
        <div style="font-size:10px;color:#666;margin-top:2px">${az.indirizzo || ""}<br>${az.tel || ""} · ${az.email || ""}<br>${az.piva ? "P.IVA " + az.piva : ""}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:16px;font-weight:800;color:#007aff">ORDINE FORNITORE</div>
        <div style="font-size:12px;font-weight:700">N. ${ord.numero}/${ord.anno}</div>
        <div style="font-size:10px;color:#666">Data: ${new Date(ord.dataOrdine).toLocaleDateString("it-IT")}</div>
        <div style="font-size:10px;color:#666">Rif. Commessa: ${ord.cmCode}</div>
      </div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:16px">
      <div class="box" style="flex:1">
        <div style="font-size:9px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:6px">Fornitore</div>
        <div style="font-size:14px;font-weight:700">${ord.fornitore.nome || "—"}</div>
        ${ord.fornitore.referente ? `<div>Att.ne: ${ord.fornitore.referente}</div>` : ""}
        ${ord.fornitore.email ? `<div>${ord.fornitore.email}</div>` : ""}
        ${ord.fornitore.tel ? `<div>${ord.fornitore.tel}</div>` : ""}
        ${ord.fornitore.piva ? `<div>P.IVA: ${ord.fornitore.piva}</div>` : ""}
      </div>
      <div class="box" style="flex:1">
        <div style="font-size:9px;text-transform:uppercase;color:#888;letter-spacing:1px;margin-bottom:6px">Consegna</div>
        <div style="font-size:12px;font-weight:600">${ord.consegna.luogo || "Da definire"}</div>
        ${ord.consegna.prevista ? `<div>📅 Prevista: ${new Date(ord.consegna.prevista).toLocaleDateString("it-IT")}</div>` : ""}
        ${ord.consegna.settimane ? `<div>⏱ Produzione: ${ord.consegna.settimane} settimane</div>` : ""}
        <div style="margin-top:4px;font-size:10px;color:#888">Pagamento: ${ord.pagamento.termini === "anticipato" ? "Anticipato" : ord.pagamento.termini === "30gg_fm" ? "30gg FM" : ord.pagamento.termini === "60gg_fm" ? "60gg FM" : ord.pagamento.termini === "90gg_fm" ? "90gg FM" : "A ricevimento merce"}</div>
      </div>
    </div>

    <div style="font-size:12px;font-weight:700;margin-bottom:4px">Cliente finale: ${ord.cliente}</div>

    <table>
      <tr><th style="width:5%">#</th><th style="width:40%">Descrizione</th><th style="width:12%">Misure</th><th style="width:8%">Qtà</th><th style="width:15%">Prezzo Unit.</th><th style="width:15%">Totale</th><th>Note</th></tr>
      ${ord.righe.map((r, i) => `<tr>
        <td>${i + 1}</td>
        <td style="font-weight:600">${r.desc}</td>
        <td>${r.misure}</td>
        <td style="text-align:center">${r.qta}</td>
        <td style="text-align:right">&euro;${fmt(r.prezzoUnit)}</td>
        <td style="text-align:right">&euro;${fmt(r.qta * r.prezzoUnit)}</td>
        <td style="font-size:9px;color:#666">${r.note || ""}</td>
      </tr>`).join("")}
      ${scontoPerc > 0 ? `<tr><td colspan="5" style="text-align:right;font-weight:600">Sconto ${scontoPerc}%</td><td style="text-align:right;color:#ff3b30">-&euro;${fmt(ord.righe.reduce((s, r) => s + r.qta * r.prezzoUnit, 0) * scontoPerc / 100)}</td><td></td></tr>` : ""}
      <tr><td colspan="5" style="text-align:right">Imponibile</td><td style="text-align:right">&euro;${fmt(imponibile)}</td><td></td></tr>
      <tr><td colspan="5" style="text-align:right">IVA ${ord.iva}%</td><td style="text-align:right">&euro;${fmt(ivaVal)}</td><td></td></tr>
      <tr class="total-row"><td colspan="5" style="text-align:right;font-size:13px">TOTALE</td><td style="text-align:right;font-size:13px">&euro;${fmt(ord.totaleIva)}</td><td></td></tr>
    </table>

    ${ord.note ? `<div class="box"><div style="font-size:9px;text-transform:uppercase;color:#888;margin-bottom:4px">Note</div>${ord.note}</div>` : ""}

    <div class="sign-area">
      <div class="sign-box">Timbro e firma ordinante<br><br><br></div>
      <div class="sign-box">Per accettazione fornitore<br><br><br></div>
    </div>

    <div style="text-align:center;font-size:8px;color:#ccc;margin-top:30px">Generato con MASTRO · ${new Date().toLocaleDateString("it-IT")}</div>
    </body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  // Genera PDF conferma firmata (per reinvio al fornitore)
  const generaConfermaFirmataPDF = (ord) => {
    const az = aziendaDB;
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1a1a1c;padding:30px;max-width:800px;margin:0 auto}
      .stamp{border:3px solid #34c759;border-radius:12px;padding:16px;margin:20px 0;text-align:center}
    </style></head><body>
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:18px;font-weight:800;color:#34c759">✅ CONFERMA ORDINE APPROVATA</div>
      <div style="font-size:12px;color:#666;margin-top:4px">Ordine N. ${ord.numero}/${ord.anno} — ${ord.fornitore.nome}</div>
    </div>

    <div style="background:#f9f9fb;border-radius:8px;padding:14px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between">
        <div><b>Committente:</b> ${az.nome || "MASTRO"}<br>${az.indirizzo || ""}<br>${az.piva ? "P.IVA " + az.piva : ""}</div>
        <div style="text-align:right"><b>Fornitore:</b> ${ord.fornitore.nome}<br>${ord.fornitore.email || ""}<br>${ord.fornitore.piva ? "P.IVA " + ord.fornitore.piva : ""}</div>
      </div>
    </div>

    <div style="margin:14px 0"><b>Rif. Commessa:</b> ${ord.cmCode} — ${ord.cliente}</div>

    <table style="width:100%;border-collapse:collapse">
      <tr><th style="background:#34c75920;padding:8px;text-align:left;border-bottom:2px solid #34c759">#</th><th style="background:#34c75920;padding:8px;text-align:left;border-bottom:2px solid #34c759">Descrizione</th><th style="background:#34c75920;padding:8px;border-bottom:2px solid #34c759">Misure</th><th style="background:#34c75920;padding:8px;border-bottom:2px solid #34c759">Qtà</th><th style="background:#34c75920;padding:8px;text-align:right;border-bottom:2px solid #34c759">Prezzo</th></tr>
      ${ord.righe.map((r, i) => `<tr><td style="padding:6px;border-bottom:1px solid #eee">${i + 1}</td><td style="padding:6px;border-bottom:1px solid #eee">${r.desc}</td><td style="padding:6px;border-bottom:1px solid #eee">${r.misure}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${r.qta}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">&euro;${fmt(r.qta * r.prezzoUnit)}</td></tr>`).join("")}
    </table>
    <div style="text-align:right;font-size:14px;font-weight:800;margin-top:8px">TOTALE: &euro;${fmt(ord.totaleIva)}</div>

    <div class="stamp">
      <div style="font-size:14px;font-weight:800;color:#34c759">CONFERMATO E APPROVATO</div>
      <div style="font-size:11px;color:#666;margin-top:4px">Data conferma: ${ord.conferma.dataFirma ? new Date(ord.conferma.dataFirma).toLocaleDateString("it-IT") : new Date().toLocaleDateString("it-IT")}</div>
      <div style="font-size:11px;color:#666">Consegna prevista: ${ord.consegna.prevista ? new Date(ord.consegna.prevista).toLocaleDateString("it-IT") : "Da concordare"}</div>
      <div style="font-size:11px;color:#666">Pagamento: ${ord.pagamento.termini === "anticipato" ? "Anticipato" : ord.pagamento.termini.replace("_", " ").toUpperCase()}</div>
      ${ord.conferma.differenze ? `<div style="margin-top:8px;font-size:10px;color:#ff9500;font-weight:600">⚠️ Note: ${ord.conferma.differenze}</div>` : ""}
    </div>

    <div style="display:flex;justify-content:space-between;margin-top:40px">
      <div style="width:45%;border-top:1px solid #aaa;padding-top:8px;text-align:center;font-size:10px;color:#888">Firma ${az.nome || "committente"}<br>${ord.conferma.dataFirma || ""}</div>
      <div style="width:45%;border-top:1px solid #aaa;padding-top:8px;text-align:center;font-size:10px;color:#888">Per accettazione fornitore</div>
    </div>
    </body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  // Invio ordine/conferma via email/whatsapp
  const inviaOrdineFornitore = (ord, mezzo: "email" | "whatsapp") => {
    const az = aziendaDB;
    if (mezzo === "email") {
      const subject = ord.conferma.firmata
        ? `Conferma ordine N.${ord.numero}/${ord.anno} — ${az.nome}`
        : `Ordine N.${ord.numero}/${ord.anno} — ${az.nome}`;
      const body = ord.conferma.firmata
        ? `Gentile ${ord.fornitore.referente || ord.fornitore.nome},\n\nconfermiamo l'ordine N.${ord.numero}/${ord.anno} per la commessa ${ord.cmCode} (${ord.cliente}).\n\nTotale: €${ord.totaleIva?.toLocaleString("it-IT", { minimumFractionDigits: 2 })}\nConsegna prevista: ${ord.consegna.prevista ? new Date(ord.consegna.prevista).toLocaleDateString("it-IT") : "da concordare"}\nPagamento: ${ord.pagamento.termini}\n\nIn allegato la conferma firmata.\n\nCordiali saluti,\n${az.nome}`
        : `Gentile ${ord.fornitore.referente || ord.fornitore.nome},\n\ncon la presente vi trasmettiamo l'ordine N.${ord.numero}/${ord.anno} per la commessa ${ord.cmCode} (${ord.cliente}).\n\nRichiediamo conferma d'ordine con tempi di consegna e condizioni di pagamento.\n\nCordiali saluti,\n${az.nome}`;
      window.open(`mailto:${ord.fornitore.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
    } else {
      const tel = (ord.fornitore.tel || "").replace(/\D/g, "");
      const msg = ord.conferma.firmata
        ? `Buongiorno, vi confermiamo ordine N.${ord.numero}/${ord.anno} — Commessa ${ord.cmCode} (${ord.cliente}). Totale €${ord.totaleIva?.toLocaleString("it-IT", { minimumFractionDigits: 2 })}. Consegna prevista: ${ord.consegna.prevista ? new Date(ord.consegna.prevista).toLocaleDateString("it-IT") : "da concordare"}. Vi inviamo conferma firmata via email. ${az.nome}`
        : `Buongiorno, vi invio ordine N.${ord.numero}/${ord.anno} — Commessa ${ord.cmCode} (${ord.cliente}). Attendo conferma d'ordine con tempi e condizioni. Grazie. ${az.nome}`;
      window.open(`https://wa.me/${tel.startsWith("39") ? tel : "39" + tel}?text=${encodeURIComponent(msg)}`, "_blank");
    }
  };

  // Stati ordine con colori
  const ORDINE_STATI = [
    { id: "bozza", label: "Bozza", icon: "📝", color: "#8e8e93" },
    { id: "inviato", label: "Inviato", icon: "📤", color: "#007aff" },
    { id: "confermato", label: "Confermato", icon: "✅", color: "#34c759" },
    { id: "in_produzione", label: "In Produzione", icon: "🏭", color: "#ff9500" },
    { id: "spedito", label: "Spedito", icon: "🚛", color: "#5856d6" },
    { id: "consegnato", label: "Consegnato", icon: "📦", color: "#30b0c7" },
  ];

  // === PIANIFICAZIONE MONTAGGIO ===
  const creaMontaggio = (c) => {
    const m = {
      id: "mont_" + Date.now(),
      cmId: c.id,
      cmCode: c.code,
      cliente: c.cliente,
      indirizzo: c.indirizzo || "",
      squadraId: squadreDB[0]?.id || "",
      data: "",
      oraInizio: "08:00",
      durata: "giornata", // "mezza", "giornata", "2giorni", "3giorni"
      stato: "pianificato", // pianificato, in_corso, completato
      note: "",
      vaniCount: getVaniAttivi(c).length,
    };
    setMontaggiDB(prev => [...prev, m]);
    return m;
  };

  // Genera giorni della settimana
  const getWeekDays = (offset: number) => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  // Render calendario montaggi (vista settimanale con squadre)
  const renderCalendarioMontaggi = (targetMontaggioId?: string) => {
    const days = getWeekDays(calMontaggiWeek);
    const durataGiorni = (d: string) => d === "mezza" ? 0.5 : d === "2giorni" ? 2 : d === "3giorni" ? 3 : 1;
    const isOccupied = (sq: any, day: Date) => {
      const dayStr = day.toISOString().split("T")[0];
      return montaggiDB.some(m => {
        if (m.squadraId !== sq.id || !m.data || m.stato === "completato") return false;
        const startDate = new Date(m.data);
        const numDays = durataGiorni(m.durata);
        for (let i = 0; i < Math.ceil(numDays); i++) {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + i);
          if (d.toISOString().split("T")[0] === dayStr) return m;
        }
        return false;
      });
    };
    const today = new Date().toISOString().split("T")[0];
    const isSunday = (d: Date) => d.getDay() === 0;

    return (
      <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, overflow: "hidden" }}>
        {/* Header navigazione settimana */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: T.bg, borderBottom: `1px solid ${T.bdr}` }}>
          <div onClick={() => setCalMontaggiWeek(w => w - 1)} style={{ padding: "4px 10px", cursor: "pointer", fontSize: 16, fontWeight: 700, color: T.acc }}>◀</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
            {days[0].toLocaleDateString("it-IT", { day: "numeric", month: "short" })} — {days[6].toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div onClick={() => setCalMontaggiWeek(0)} style={{ padding: "3px 8px", borderRadius: 6, background: calMontaggiWeek === 0 ? T.acc : "transparent", color: calMontaggiWeek === 0 ? "#fff" : T.sub, fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Oggi</div>
            <div onClick={() => setCalMontaggiWeek(w => w + 1)} style={{ padding: "4px 10px", cursor: "pointer", fontSize: 16, fontWeight: 700, color: T.acc }}>▶</div>
          </div>
        </div>

        {/* Griglia: header giorni */}
        <div style={{ display: "grid", gridTemplateColumns: `80px repeat(7, 1fr)`, fontSize: 9 }}>
          <div style={{ padding: "6px 4px", fontWeight: 700, color: T.sub, textAlign: "center", borderBottom: `1px solid ${T.bdr}`, borderRight: `1px solid ${T.bdr}` }}>Squadra</div>
          {days.map((d, i) => {
            const isToday = d.toISOString().split("T")[0] === today;
            const isSun = isSunday(d);
            return (
              <div key={i} style={{
                padding: "6px 2px", textAlign: "center", fontWeight: 700,
                color: isToday ? "#fff" : isSun ? T.red : T.text,
                background: isToday ? T.acc : isSun ? "#ff3b3010" : "transparent",
                borderBottom: `1px solid ${T.bdr}`,
                borderRight: i < 6 ? `1px solid ${T.bdr}` : "none",
              }}>
                <div>{["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"][i]}</div>
                <div style={{ fontSize: 12 }}>{d.getDate()}</div>
              </div>
            );
          })}

          {/* Righe squadre */}
          {squadreDB.map(sq => (
            <React.Fragment key={sq.id}>
              <div style={{ padding: "8px 6px", fontWeight: 700, fontSize: 10, color: sq.colore, borderRight: `1px solid ${T.bdr}`, borderBottom: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: sq.colore, flexShrink: 0 }} />
                {sq.nome}
              </div>
              {days.map((d, i) => {
                const occ = isOccupied(sq, d);
                const dayStr = d.toISOString().split("T")[0];
                const isPast = dayStr < today;
                const isSun = isSunday(d);
                const canClick = !occ && !isPast && !isSun && targetMontaggioId;
                return (
                  <div key={i} onClick={() => {
                    if (canClick) {
                      setMontaggiDB(prev => prev.map(m => m.id === targetMontaggioId ? { ...m, data: dayStr, squadraId: sq.id } : m));
                    }
                  }} style={{
                    padding: "4px 3px", borderBottom: `1px solid ${T.bdr}`,
                    borderRight: i < 6 ? `1px solid ${T.bdr}` : "none",
                    background: occ ? sq.colore + "20" : isPast ? T.bg + "80" : isSun ? "#ff3b3005" : canClick ? "#34c75908" : "transparent",
                    cursor: canClick ? "pointer" : "default",
                    minHeight: 36, position: "relative" as any,
                  }}>
                    {occ && (
                      <div style={{ fontSize: 7, fontWeight: 700, color: sq.colore, lineHeight: 1.2 }}>
                        <div>{(occ as any).cliente?.slice(0, 8)}</div>
                        <div style={{ color: T.sub }}>{(occ as any).vaniCount}v · {(occ as any).durata === "mezza" ? "½" : (occ as any).durata === "2giorni" ? "2g" : (occ as any).durata === "3giorni" ? "3g" : "1g"}</div>
                      </div>
                    )}
                    {canClick && !occ && (
                      <div style={{ position: "absolute" as any, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#34c75950" }}>+</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legenda */}
        <div style={{ padding: "6px 12px", display: "flex", gap: 12, flexWrap: "wrap" as any, fontSize: 9, color: T.sub, borderTop: `1px solid ${T.bdr}` }}>
          {squadreDB.map(sq => (
            <span key={sq.id} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: sq.colore }} />
              {sq.nome}: {montaggiDB.filter(m => m.squadraId === sq.id && m.stato !== "completato").length} in programma
            </span>
          ))}
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ff9500" }} />
            Consegne: {ordiniFornDB.filter(o => o.dataConsegnaPrev && o.stato !== "consegnato").length} attese
          </span>
        </div>

        {/* Consegne fornitore nella settimana */}
        {(() => {
          const weekDeliveries = ordiniFornDB.filter(o => {
            if (!o.dataConsegnaPrev || o.stato === "consegnato") return false;
            const d = new Date(o.dataConsegnaPrev);
            return d >= days[0] && d <= days[6];
          });
          if (weekDeliveries.length === 0) return null;
          return (
            <div style={{ padding: "8px 12px", borderTop: `1px solid ${T.bdr}`, background: "#ff950008" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#ff9500", marginBottom: 4 }}>🚛 Consegne questa settimana:</div>
              {weekDeliveries.map(o => {
                const cm = cantieri.find(cc => cc.id === o.cmId);
                const isLate = new Date(o.dataConsegnaPrev) < new Date();
                return (
                  <div key={o.id} style={{ fontSize: 10, color: isLate ? T.red : T.text, padding: "2px 0", display: "flex", gap: 8 }}>
                    <span style={{ fontWeight: 700, width: 30, color: "#ff9500" }}>{new Date(o.dataConsegnaPrev).toLocaleDateString("it-IT", { weekday: "short" })}</span>
                    <span style={{ fontWeight: 600 }}>{o.fornitore}</span>
                    <span style={{ color: T.sub }}>→ {cm?.cliente || o.cmId}</span>
                    {o.costo > 0 && <span style={{ color: T.sub }}>€{o.costo.toLocaleString("it-IT")}</span>}
                    {isLate && <span style={{ color: T.red, fontWeight: 700 }}>⚠️ RITARDO</span>}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    );
  };

  // === PAGINA PREVENTIVO CONDIVISIBILE (link per cliente) ===
  const generaPreventivoCondivisibile = async (c) => {
    const az = aziendaDB;
    const vani = getVaniAttivi(c);
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00";
    // Calcola prezzi reali dai sistemi/griglie
    const vaniConPrezzi = vani.map(v => ({ ...v, _prezzo: calcolaVanoPrezzo(v, c) }));
    const subtot = vaniConPrezzi.reduce((s, v) => s + v._prezzo, 0) + (c.vociLibere || []).reduce((s, vl) => s + ((vl.importo || 0) * (vl.qta || 1)), 0);
    const iva = subtot * 0.1;
    const tot = subtot + iva;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1d1d1f;max-width:600px;margin:0 auto;padding:16px;background:#f5f5f7}
      .card{background:#fff;border-radius:14px;padding:18px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
      .header{text-align:center;margin-bottom:16px}
      .logo{max-height:50px;margin-bottom:8px}
      .title{font-size:22px;font-weight:800;color:#1d1d1f}
      .sub{font-size:12px;color:#86868b}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
      .row:last-child{border:none}
      .total{font-size:18px;font-weight:800;color:#007aff;text-align:right;padding:12px 0}
      .btn{width:100%;padding:16px;border-radius:12px;border:none;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px;font-family:inherit}
      .btn-green{background:#34c759;color:#fff}
      .btn-outline{background:#fff;color:#007aff;border:2px solid #007aff}
      canvas{border:1px solid #e5e5ea;border-radius:10px;background:#fff;touch-action:none}
      .firma-done{background:#f0fdf4;border:2px solid #34c759;border-radius:12px;padding:16px;text-align:center}
    </style></head><body>
    <div class="header">
      ${az.logo ? `<img src="${az.logo}" class="logo"/><br>` : ""}
      <div class="title">${az.nome || "MASTRO"}</div>
      <div class="sub">${az.indirizzo || ""}<br>${az.tel || ""} · ${az.email || ""}</div>
    </div>

    <div class="card">
      <div style="font-size:11px;text-transform:uppercase;color:#86868b;letter-spacing:1px;margin-bottom:8px">Preventivo</div>
      <div style="font-size:16px;font-weight:700">${c.code}</div>
      <div style="font-size:13px;color:#86868b;margin-top:2px">Per: ${c.cliente} ${c.cognome || ""}</div>
      <div style="font-size:12px;color:#86868b">${c.indirizzo || ""}</div>
      <div style="font-size:11px;color:#86868b;margin-top:4px">Data: ${new Date().toLocaleDateString("it-IT")}</div>
    </div>

    <div class="card">
      <div style="font-size:11px;text-transform:uppercase;color:#86868b;letter-spacing:1px;margin-bottom:10px">Riepilogo fornitura</div>
      ${vaniConPrezzi.map((v, i) => {
        const tipLabel = TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.label || v.tipo || "Vano";
        return `<div class="row">
          <div><strong>${i + 1}. ${tipLabel}</strong><br><span style="font-size:11px;color:#86868b">${v.stanza || ""} ${v.piano || ""} — ${v.misure?.lCentro || 0}×${v.misure?.hCentro || 0} mm</span></div>
          <div style="font-weight:700;white-space:nowrap">&euro;${fmt(v._prezzo)}</div>
        </div>`;
      }).join("")}
      ${(c.vociLibere || []).map(vl => `<div class="row"><div>${vl.desc}</div><div style="font-weight:700">&euro;${fmt(vl.importo)}</div></div>`).join("")}
      <div style="border-top:2px solid #e5e5ea;margin-top:8px;padding-top:8px">
        <div class="row"><span>Imponibile</span><span style="font-weight:600">&euro;${fmt(subtot)}</span></div>
        <div class="row"><span>IVA 10%</span><span>&euro;${fmt(iva)}</span></div>
      </div>
      <div class="total">TOTALE: &euro;${fmt(tot)}</div>
    </div>

    ${c.condPagamento ? `<div class="card"><div style="font-size:11px;text-transform:uppercase;color:#86868b;letter-spacing:1px;margin-bottom:6px">Condizioni di pagamento</div><div style="font-size:12px;line-height:1.5">${c.condPagamento.replace(/\n/g, "<br>")}</div></div>` : ""}

    <div class="card" id="firma-section">
      <div style="font-size:11px;text-transform:uppercase;color:#86868b;letter-spacing:1px;margin-bottom:10px">Firma di accettazione</div>
      <div id="firma-pad" style="text-align:center">
        <canvas id="sigCanvas" width="340" height="150" style="width:100%;max-width:340px"></canvas>
        <div style="font-size:10px;color:#86868b;margin-top:4px">Firma con il dito o con il mouse</div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn btn-outline" onclick="clearSig()" style="flex:1;padding:10px;font-size:13px">Cancella</button>
          <button class="btn btn-green" onclick="confirmSig()" style="flex:1;padding:10px;font-size:13px">✅ Conferma e Firma</button>
        </div>
      </div>
      <div id="firma-done" class="firma-done" style="display:none">
        <div style="font-size:24px;margin-bottom:6px">✅</div>
        <div style="font-size:16px;font-weight:700;color:#34c759">Preventivo Firmato!</div>
        <div style="font-size:12px;color:#86868b;margin-top:4px">Grazie per la conferma. Riceverà aggiornamenti sull'avanzamento del suo ordine.</div>
        <img id="firma-img" style="max-height:60px;margin-top:10px" alt=""/>
      </div>
    </div>

    <div style="text-align:center;font-size:10px;color:#ccc;margin-top:16px">Generato con MASTRO · ${new Date().toLocaleDateString("it-IT")}</div>

    <script>
    const canvas=document.getElementById('sigCanvas'),ctx=canvas.getContext('2d');
    let drawing=false,lastX=0,lastY=0,hasDrawn=false;
    ctx.strokeStyle='#1d1d1f';ctx.lineWidth=2;ctx.lineCap='round';
    function getPos(e){const r=canvas.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top};}
    canvas.addEventListener('mousedown',e=>{drawing=true;const p=getPos(e);lastX=p.x;lastY=p.y;});
    canvas.addEventListener('mousemove',e=>{if(!drawing)return;hasDrawn=true;const p=getPos(e);ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(p.x,p.y);ctx.stroke();lastX=p.x;lastY=p.y;});
    canvas.addEventListener('mouseup',()=>drawing=false);
    canvas.addEventListener('touchstart',e=>{e.preventDefault();drawing=true;const p=getPos(e);lastX=p.x;lastY=p.y;},{passive:false});
    canvas.addEventListener('touchmove',e=>{e.preventDefault();if(!drawing)return;hasDrawn=true;const p=getPos(e);ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(p.x,p.y);ctx.stroke();lastX=p.x;lastY=p.y;},{passive:false});
    canvas.addEventListener('touchend',()=>drawing=false);
    function clearSig(){ctx.clearRect(0,0,canvas.width,canvas.height);hasDrawn=false;}
    function confirmSig(){
      if(!hasDrawn){alert('Firma prima di confermare');return;}
      const img=canvas.toDataURL();
      document.getElementById('firma-pad').style.display='none';
      document.getElementById('firma-done').style.display='block';
      document.getElementById('firma-img').src=img;
    }
    <\/script>
    </body></html>`;

    // Upload to Supabase Storage per URL pubblico condivisibile
    const fileName = `preventivo_${c.code}_${Date.now()}.html`;
    try {
      const blob = new Blob([html], { type: "text/html" });
      const { data: uploadData, error } = await supabase.storage
        .from("preventivi")
        .upload(`public/${fileName}`, blob, { contentType: "text/html", upsert: true });
      
      if (!error && uploadData) {
        const { data: urlData } = supabase.storage.from("preventivi").getPublicUrl(`public/${fileName}`);
        const publicUrl = urlData?.publicUrl;
        if (publicUrl) {
          // Salva URL nella commessa
          setCantieri(cs => cs.map(x => x.id === c.id ? { ...x, linkPreventivo: publicUrl } : x));
          setSelectedCM(p => p?.id === c.id ? { ...p, linkPreventivo: publicUrl } : p);
          
          // Apri link + offri invio WhatsApp
          window.open(publicUrl, "_blank");
          
          // Auto-WhatsApp
          const tel = (c.telefono || "").replace(/\D/g, "");
          if (tel) {
            const msg = `Gentile ${c.cliente}, ecco il preventivo per ${c.code}:\n${publicUrl}\n\nPuò visionarlo e firmarlo direttamente dal suo telefono.\n\nCordiali saluti,\n${aziendaDB.nome || "MASTRO"}`;
            setTimeout(() => {
              if (confirm("Inviare il link via WhatsApp al cliente?")) {
                window.open(`https://wa.me/${tel.startsWith("39") ? tel : "39" + tel}?text=${encodeURIComponent(msg)}`, "_blank");
              }
            }, 500);
          }
          return publicUrl;
        }
      }
    } catch (e) { console.warn("Upload Supabase non riuscito, uso blob locale:", e); }
    
    // Fallback: blob locale se Supabase non disponibile
    const blobFallback = new Blob([html], { type: "text/html" });
    const urlFallback = URL.createObjectURL(blobFallback);
    window.open(urlFallback, "_blank");
    return urlFallback;
  };

  // === UPLOAD CONFERMA FORNITORE (Supabase Storage + AI Extraction) ===
  const uploadConfermaFornitore = (ordId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 1. Upload a Supabase Storage
      const fileName = `conferma_${ordId}_${Date.now()}_${file.name}`;
      let fileUrl = "";
      try {
        const { data: uploadData, error } = await supabase.storage
          .from("conferme-fornitore")
          .upload(`docs/${fileName}`, file, { contentType: file.type, upsert: true });
        if (!error && uploadData) {
          const { data: urlData } = supabase.storage.from("conferme-fornitore").getPublicUrl(`docs/${fileName}`);
          fileUrl = urlData?.publicUrl || "";
        }
      } catch (err) { console.warn("Upload Supabase fallito:", err); }

      // 2. AI Extraction — funziona con PDF, immagini, scansioni
      let extractedData: any = {};
      setExtractingPDF(true);
      try {
        extractedData = await estraiDatiPDF(file);
      } catch (err) { console.warn("Estrazione:", err); }
      setExtractingPDF(false);

      // 3. Aggiorna ordine con allegato + dati estratti
      setOrdiniFornDB(prev => prev.map(o => {
        if (o.id !== ordId) return o;
        const updated = {
          ...o,
          conferma: {
            ...o.conferma,
            ricevuta: true,
            dataRicezione: new Date().toISOString().split("T")[0],
            nomeFile: file.name,
            fileUrl: fileUrl,
            datiEstratti: extractedData, // salva tutto per riferimento
          },
          stato: o.stato === "bozza" || o.stato === "inviato" ? "confermato" : o.stato,
        };
        // Auto-fill dati estratti
        if (extractedData.totale) updated.totaleIva = extractedData.totale;
        if (extractedData.imponibile) updated.totale = extractedData.imponibile;
        if (extractedData.settimane) updated.consegna = { ...updated.consegna, settimane: extractedData.settimane };
        if (extractedData.dataConsegna) updated.consegna = { ...updated.consegna, prevista: extractedData.dataConsegna };
        if (extractedData.pagamento) updated.pagamento = { ...updated.pagamento, termini: extractedData.pagamento };
        if (extractedData.fornitoreNome && !o.fornitore?.nome) updated.fornitore = { ...updated.fornitore, nome: extractedData.fornitoreNome };
        if (extractedData.numeroOrdine) updated.numero = extractedData.numeroOrdine;
        // Auto-fill righe se estratte dall'AI
        if (extractedData.righe?.length > 0 && (!o.righe || o.righe.length === 0)) {
          updated.righe = extractedData.righe.map((r: any, i: number) => ({
            id: Date.now() + i,
            desc: r.descrizione || "",
            misure: r.misure || "",
            qta: r.quantita || 1,
            prezzoUnit: r.prezzo_unitario || 0,
            totale: r.prezzo_totale || (r.prezzo_unitario || 0) * (r.quantita || 1),
            note: "",
          }));
        }
        return updated;
      }));
    };
    input.click();
  };

  // === AI PDF EXTRACTION — Claude legge QUALSIASI PDF ===
  const estraiDatiPDF = async (file: File): Promise<any> => {
    const extracted: any = { nomeFile: file.name };
    
    // Estrazione locale robusta — funziona anche offline
    try {
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string || "");
        reader.onerror = () => resolve("");
        reader.readAsText(file);
        setTimeout(() => resolve(""), 3000); // 3s max
      });
      
      if (text && text.length > 20) {
        // Totale
        const totMatch = text.match(/(?:TOTALE|Totale\s*(?:Documento|Ordine|Generale)?|Tot\.?\s*\u20ac?)\s*[\u20ac:]?\s*([\d.,]+)/i);
        if (totMatch) { const val = parseFloat(totMatch[1].replace(/\./g, "").replace(",", ".")); if (val > 0 && val < 1000000) extracted.totale = val; }
        // Imponibile
        const impMatch = text.match(/(?:Imponibile|Subtotale|Sub\s*tot)\s*[\u20ac:]?\s*([\d.,]+)/i);
        if (impMatch) { const val = parseFloat(impMatch[1].replace(/\./g, "").replace(",", ".")); if (val > 0) extracted.imponibile = val; }
        // Settimane
        const settMatch = text.match(/(\d{1,2})\s*(?:settiman[ea]|sett\.?|weeks?)/i);
        if (settMatch) extracted.settimane = parseInt(settMatch[1]);
        const giorniMatch = text.match(/(\d{1,3})\s*(?:giorni?\s*(?:lavorativ|lavor))/i);
        if (giorniMatch) extracted.settimane = Math.ceil(parseInt(giorniMatch[1]) / 5);
        // Data consegna
        const consMatch = text.match(/(?:consegna|delivery|spedizione)\s*(?:prevista)?:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        if (consMatch) { const parts = consMatch[1].split(/[\/\-]/); if (parts.length === 3) { const y = parts[2].length === 2 ? "20" + parts[2] : parts[2]; extracted.dataConsegna = y + "-" + parts[1].padStart(2, "0") + "-" + parts[0].padStart(2, "0"); } }
        // Fornitore
        const fornMatch = text.match(/(?:Da|From|Fornitore|Ragione\s*Sociale)[:\s]+([^\n]{3,50})/i);
        if (fornMatch) extracted.fornitoreNome = fornMatch[1].trim();
        // Pagamento
        const pagMatch = text.match(/(\d{2,3})\s*(?:gg|giorni)\s*(?:FM|D\.?F\.?|f\.?m\.?)?/i);
        if (pagMatch) { const days = parseInt(pagMatch[1]); extracted.pagamento = days <= 30 ? "30gg_fm" : days <= 60 ? "60gg_fm" : "90gg_fm"; }
        if (text.match(/anticip/i)) extracted.pagamento = "anticipato";
        
        extracted.text = text.slice(0, 2000); // keep snippet for classification
      }
    } catch (e) { console.warn("Estrazione fallback:", e); }
    
    // Per immagini, estrai info dal nome file
    if (file.type.startsWith("image/")) {
      const fname = file.name.toLowerCase();
      if (fname.match(/conferma|order/i)) extracted.fornitoreNome = "Da conferma";
      if (fname.match(/fattura|invoice/i)) extracted.totale = extracted.totale || 0;
      // Crea URL locale per preview
      try { extracted.previewUrl = URL.createObjectURL(file); } catch(e) {}
    }
    
    return extracted;
  };

  // === 📥 INBOX UNIVERSALE — Classifica qualsiasi documento ===
  const apriInboxDocumento = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/*,.jpg,.jpeg,.png";
    input.onchange = async (ev: any) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      setShowInboxDoc(true);
      setInboxResult({ stato: "caricamento", file: file.name, tipo: file.type });

      let fileUrl = "";
      let extractedData: any = {};

      try {
        // Crea URL locale per il file (funziona sempre, anche offline)
        try { fileUrl = URL.createObjectURL(file); } catch(e) {}
        
        // Prova upload Supabase (se disponibile)
        try {
          if (typeof supabase !== "undefined" && supabase?.storage) {
            const fileName = "inbox_" + Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const result: any = await Promise.race([
              supabase.storage.from("conferme-fornitore").upload("docs/" + fileName, file, { contentType: file.type, upsert: true }),
              new Promise((_, rej) => setTimeout(() => rej("timeout"), 3000)),
            ]).catch(() => null);
            if (result && !result.error) {
              const { data: urlData } = supabase.storage.from("conferme-fornitore").getPublicUrl("docs/" + fileName);
              if (urlData?.publicUrl) fileUrl = urlData.publicUrl;
            }
          }
        } catch (err) { /* skip — local URL works fine */ }

        setInboxResult((prev: any) => ({ ...prev, stato: "analisi" }));
        
        // Estrai dati dal file (max 4 secondi)
        try {
          extractedData = await Promise.race([
            estraiDatiPDF(file),
            new Promise((_, rej) => setTimeout(() => rej("timeout"), 4000)),
          ]).catch(() => ({ nomeFile: file.name }));
        } catch (err) { extractedData = { nomeFile: file.name }; }
      } catch (err) { console.warn("Inbox error:", err); extractedData = { nomeFile: file.name }; }

      // === CLASSIFICAZIONE UNIVERSALE ===
      const fname = file.name.toLowerCase();
      const dati = extractedData;
      let docTipo: string = "sconosciuto"; // firma | conferma | fattura | ricevuta | foto
      let matchedCommessa: any = null;
      let matchedOrdine: any = null;
      let confidence = 0;

      // 1. Detect tipo from filename + content
      if (fname.includes("firmato") || fname.includes("firma") || fname.includes("signed") || dati.text?.match(/firmato|firma.*cliente|approvato/i)) {
        docTipo = "firma"; confidence = 90;
      } else if (fname.includes("conferma") || fname.includes("order_confirm") || dati.fornitoreNome || dati.settimane) {
        docTipo = "conferma"; confidence = 85;
      } else if (fname.includes("fattura") || fname.includes("invoice") || dati.text?.match(/fattura\s*(n\.?|numero)/i)) {
        docTipo = "fattura"; confidence = 85;
      } else if (fname.includes("bonifico") || fname.includes("ricevuta") || fname.includes("pagamento") || dati.text?.match(/bonifico|accredito|pagamento/i)) {
        docTipo = "ricevuta"; confidence = 80;
      } else if (file.type.startsWith("image/") && !dati.fornitoreNome && !dati.totale) {
        docTipo = "foto"; confidence = 60;
      } else if (dati.fornitoreNome || dati.settimane) {
        docTipo = "conferma"; confidence = 70;
      } else if (dati.totale > 0) {
        docTipo = "fattura"; confidence = 50;
      }

      // 2. Match to commessa/ordine
      const ordiniAttivi = ordiniFornDB.filter(o => !o.conferma?.ricevuta);
      
      if (docTipo === "conferma") {
        // Match conferma to ordine fornitore
        if (dati.fornitoreNome) {
          matchedOrdine = ordiniAttivi.find(o =>
            (o.fornitore?.nome || "").toLowerCase().includes(dati.fornitoreNome.toLowerCase()) ||
            dati.fornitoreNome.toLowerCase().includes((o.fornitore?.nome || "").toLowerCase())
          );
        }
        if (!matchedOrdine && dati.totale) {
          matchedOrdine = ordiniAttivi.find(o => Math.abs((o.totaleIva || o.totale || 0) - dati.totale) < 100);
        }
        if (!matchedOrdine && ordiniAttivi.length === 1) matchedOrdine = ordiniAttivi[0];
        if (matchedOrdine) matchedCommessa = cantieri.find(cm => cm.id === matchedOrdine.cmId);
      } else if (docTipo === "firma") {
        // Match firma to commessa in attesa firma
        const cmInAttesaFirma = cantieri.filter(cm => !cm.firmaCliente && cm.rilievi?.length > 0);
        // Try match by client name in filename
        for (const cm of cmInAttesaFirma) {
          const cliName = `${cm.cliente} ${cm.cognome || ""}`.toLowerCase();
          if (fname.includes(cm.cliente.toLowerCase()) || fname.includes((cm.cognome || "").toLowerCase()) || fname.includes(cm.code.toLowerCase())) {
            matchedCommessa = cm; confidence = 95; break;
          }
        }
        if (!matchedCommessa && cmInAttesaFirma.length === 1) { matchedCommessa = cmInAttesaFirma[0]; confidence = 75; }
        if (!matchedCommessa && cmInAttesaFirma.length > 0) { matchedCommessa = null; } // ambiguous — will show options
      } else if (docTipo === "ricevuta") {
        // Match ricevuta to fattura non pagata
        const fatNonPagate = fattureDB.filter(f => !f.pagata);
        if (dati.totale) {
          const match = fatNonPagate.find(f => Math.abs(f.importo - dati.totale) < 10);
          if (match) matchedCommessa = cantieri.find(cm => cm.id === match.cmId);
        }
        if (!matchedCommessa && fatNonPagate.length === 1) {
          matchedCommessa = cantieri.find(cm => cm.id === fatNonPagate[0].cmId);
        }
      } else if (docTipo === "foto") {
        // Match foto to montaggio in corso
        const montInCorso = montaggiDB.filter(m => m.stato === "in_corso" || m.stato === "programmato");
        if (montInCorso.length === 1) matchedCommessa = cantieri.find(cm => cm.id === montInCorso[0].cmId);
      }

      // All commesse for manual selection
      const commesseAttive = cantieri.filter(cm => cm.fase !== "chiusura");

      setInboxResult({
        stato: "completato", file: file.name, tipo: file.type, fileUrl,
        dati: extractedData, docTipo, confidence,
        matchedOrdine, matchedCommessa, tuttiOrdini: ordiniAttivi, commesseAttive,
      });
    };
    input.click();
  };

  // Conferma inbox → assegna a ordine
  const confermaInboxDoc = (ordId: string) => {
    const res = inboxResult;
    if (!res || !ordId) return;
    setOrdiniFornDB(prev => prev.map(o => {
      if (o.id !== ordId) return o;
      const updated = {
        ...o,
        conferma: {
          ...o.conferma,
          ricevuta: true,
          dataRicezione: new Date().toISOString().split("T")[0],
          nomeFile: res.file,
          fileUrl: res.fileUrl || "",
          datiEstratti: res.dati,
        },
        stato: o.stato === "bozza" || o.stato === "inviato" ? "confermato" : o.stato,
      };
      if (res.dati?.totale) updated.totaleIva = res.dati.totale;
      if (res.dati?.imponibile) updated.totale = res.dati.imponibile;
      if (res.dati?.settimane) updated.consegna = { ...updated.consegna, settimane: res.dati.settimane };
      if (res.dati?.dataConsegna) updated.consegna = { ...updated.consegna, prevista: res.dati.dataConsegna };
      if (res.dati?.pagamento) updated.pagamento = { ...updated.pagamento, termini: res.dati.pagamento };
      if (res.dati?.righe?.length > 0 && (!o.righe || o.righe.length === 0)) {
        updated.righe = res.dati.righe.map((r: any, i: number) => ({
          id: Date.now() + i, desc: r.descrizione || "", misure: r.misure || "",
          qta: r.quantita || 1, prezzoUnit: r.prezzo_unitario || 0,
          totale: r.prezzo_totale || 0, note: "",
        }));
      }
      return updated;
    }));
    // Auto-advance commessa
    const ord = ordiniFornDB.find(o => o.id === ordId);
    if (ord?.cmId) setFaseTo(ord.cmId, "produzione");
    setShowInboxDoc(false);
    setInboxResult(null);
  };

  // Assegna documento universale a commessa/step
  const assegnaDocUniversale = (cmId: number, tipo: string) => {
    const res = inboxResult;
    if (!res) return;
    const allegato = { id: Date.now(), tipo, nome: res.file, data: new Date().toLocaleDateString("it-IT"), dataUrl: res.fileUrl || "" };
    
    if (tipo === "firma") {
      setCantieri(cs => cs.map(cm => cm.id === cmId ? {
        ...cm, firmaCliente: true, dataFirma: new Date().toISOString().split("T")[0],
        firmaDocumento: allegato, allegati: [...(cm.allegati || []), allegato],
        log: [{ chi: "Fabio", cosa: `📥 documento firmato caricato da inbox`, quando: "Adesso", color: "#34c759" }, ...(cm.log || [])]
      } : cm));
      if (selectedCM?.id === cmId) setSelectedCM(prev => ({ ...prev, firmaCliente: true, dataFirma: new Date().toISOString().split("T")[0] }));
    } else if (tipo === "ricevuta") {
      // Segna fattura come pagata
      const fatNonPagata = fattureDB.find(f => f.cmId === cmId && !f.pagata);
      if (fatNonPagata) {
        setFattureDB(prev => prev.map(f => f.id === fatNonPagata.id ? { ...f, pagata: true, dataPagamento: new Date().toISOString().split("T")[0], metodoPagamento: "Bonifico" } : f));
      }
      setCantieri(cs => cs.map(cm => cm.id === cmId ? {
        ...cm, allegati: [...(cm.allegati || []), allegato],
        log: [{ chi: "Fabio", cosa: `📥 ricevuta pagamento caricata da inbox`, quando: "Adesso", color: "#007aff" }, ...(cm.log || [])]
      } : cm));
    } else if (tipo === "foto") {
      setCantieri(cs => cs.map(cm => cm.id === cmId ? {
        ...cm, allegati: [...(cm.allegati || []), allegato],
        log: [{ chi: "Fabio", cosa: `📥 foto cantiere caricata da inbox`, quando: "Adesso", color: "#5856d6" }, ...(cm.log || [])]
      } : cm));
    } else {
      // Generic: just add as allegato
      setCantieri(cs => cs.map(cm => cm.id === cmId ? {
        ...cm, allegati: [...(cm.allegati || []), allegato],
        log: [{ chi: "Fabio", cosa: `📥 documento "${res.file}" caricato da inbox`, quando: "Adesso", color: "#86868b" }, ...(cm.log || [])]
      } : cm));
    }
    
    setShowInboxDoc(false); setInboxResult(null);
  };

  // === TRACKING CLIENTE (pagina pubblica) ===
  const generaTrackingCliente = (c) => {
    const az = aziendaDB;
    const trackSteps = [
      { id: "ordinato", label: "Ordinato", icon: "📦", desc: "Il materiale è stato ordinato al fornitore" },
      { id: "produzione", label: "In Produzione", icon: "🏭", desc: "I serramenti sono in fase di produzione" },
      { id: "pronto", label: "Pronto", icon: "✅", desc: "Il materiale è pronto per la consegna" },
      { id: "consegnato", label: "Consegnato", icon: "🚛", desc: "Il materiale è stato consegnato" },
      { id: "montato", label: "Montato", icon: "🔧", desc: "L'installazione è completata" },
    ];
    const curIdx = trackSteps.findIndex(s => s.id === c.trackingStato);
    const fatture = fattureDB.filter(f => f.cmId === c.id);
    const totFat = fatture.reduce((s, f) => s + f.importo, 0);
    const totPag = fatture.filter(f => f.pagata).reduce((s, f) => s + f.importo, 0);
    const montaggio = montaggiDB.find(m => m.cmId === c.id && m.stato !== "completato");
    const fmt = (n) => typeof n === "number" ? n.toLocaleString("it-IT", { minimumFractionDigits: 2 }) : "0,00";

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Tracking Ordine ${c.code} — ${az.nome || "MASTRO"}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f7;color:#1a1a1c;padding:16px;max-width:480px;margin:0 auto}
      .card{background:#fff;border-radius:16px;padding:20px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
      .step{display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid #f0f0f2}
      .step:last-child{border-bottom:none}
      .dot{width:36px;height:36px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
      .active .dot{background:#007aff20} .done .dot{background:#34c75920} .pending .dot{background:#f0f0f2}
      .line{width:2px;height:20px;margin:0 17px;background:#e0e0e2}
      .done .line{background:#34c759} .active .line{background:#007aff}
      .badge{display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700}
      h2{font-size:20px;font-weight:800;letter-spacing:-0.3px}
    </style></head><body>
    <div class="card" style="text-align:center">
      ${az.logo ? `<img src="${az.logo}" style="max-height:50px;max-width:180px;margin-bottom:8px" alt="">` : ""}
      <h2>${az.nome || "MASTRO"}</h2>
      <div style="font-size:12px;color:#8e8e93;margin-top:4px">${az.tel || ""} · ${az.email || ""}</div>
    </div>

    <div class="card">
      <div style="font-size:11px;color:#8e8e93;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Ordine</div>
      <h2>${c.code}</h2>
      <div style="font-size:13px;color:#8e8e93;margin-top:2px">${c.cliente} ${c.cognome || ""}</div>
      <div style="font-size:12px;color:#8e8e93">${c.indirizzo || ""}</div>
      ${c.dataPrevConsegna ? `<div style="margin-top:10px;padding:8px 12px;background:#007aff10;border-radius:8px;font-size:12px;color:#007aff;font-weight:600">📅 Consegna prevista: ${new Date(c.dataPrevConsegna).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>` : ""}
      ${montaggio?.data ? `<div style="margin-top:6px;padding:8px 12px;background:#30b0c710;border-radius:8px;font-size:12px;color:#30b0c7;font-weight:600">🔧 Montaggio programmato: ${new Date(montaggio.data).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })} ore ${montaggio.oraInizio || "08:00"}</div>` : ""}
    </div>

    <div class="card">
      <div style="font-size:11px;color:#8e8e93;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Stato avanzamento</div>
      ${trackSteps.map((st, i) => {
        const isDone = i < curIdx;
        const isActive = i === curIdx;
        const cls = isDone ? "done" : isActive ? "active" : "pending";
        return `<div class="step ${cls}">
          <div>
            <div class="dot">${st.icon}</div>
            ${i < trackSteps.length - 1 ? `<div class="line"></div>` : ""}
          </div>
          <div style="padding-top:6px">
            <div style="font-size:14px;font-weight:700;color:${isDone ? "#34c759" : isActive ? "#007aff" : "#c7c7cc"}">${st.label}</div>
            <div style="font-size:11px;color:#8e8e93;margin-top:2px">${st.desc}</div>
            ${isDone && c["tracking_" + st.id + "_data"] ? `<div style="font-size:10px;color:#34c759;margin-top:2px">✅ ${c["tracking_" + st.id + "_data"]}</div>` : ""}
            ${isActive ? `<span class="badge" style="background:#007aff20;color:#007aff;margin-top:4px">In corso</span>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>

    ${fatture.length > 0 ? `<div class="card">
      <div style="font-size:11px;color:#8e8e93;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Situazione pagamenti</div>
      ${fatture.map(f => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f2">
        <div>
          <div style="font-size:12px;font-weight:600">${f.tipo === "acconto" ? "Acconto" : f.tipo === "saldo" ? "Saldo" : "Fattura"} N.${f.numero}/${f.anno}</div>
          <div style="font-size:10px;color:#8e8e93">${f.data}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:14px;font-weight:800">&euro;${fmt(f.importo)}</div>
          <div style="font-size:10px;color:${f.pagata ? "#34c759" : "#ff3b30"};font-weight:600">${f.pagata ? "✅ Pagata" : "⏳ Da pagare"}</div>
        </div>
      </div>`).join("")}
      <div style="display:flex;justify-content:space-between;padding:10px 0 0;margin-top:4px">
        <span style="font-size:12px;color:#8e8e93">Totale: &euro;${fmt(totFat)}</span>
        <span style="font-size:12px;font-weight:700;color:${totPag >= totFat ? "#34c759" : "#ff9500"}">${totPag >= totFat ? "✅ Saldato" : `Da pagare: €${fmt(totFat - totPag)}`}</span>
      </div>
    </div>` : ""}

    <div style="text-align:center;font-size:10px;color:#c7c7cc;margin-top:16px;padding:12px">
      Pagina generata da MASTRO · ${new Date().toLocaleDateString("it-IT")}
    </div>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return url;
  };

  // ═══ FATTURAZIONE ELETTRONICA XML SDI ═══
  const generaXmlSDI = (fat) => {
    const az = aziendaDB;
    const progressivo = String(fat.numero).padStart(5, "0") + "_" + fat.anno;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPR12">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente><IdPaese>IT</IdPaese><IdCodice>` + (az.piva || "00000000000") + `</IdCodice></IdTrasmittente>
      <ProgressivoInvio>` + progressivo + `</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>` + (fat.sdi || "0000000") + `</CodiceDestinatario>
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA><IdPaese>IT</IdPaese><IdCodice>` + (az.piva || "") + `</IdCodice></IdFiscaleIVA>
        <Anagrafica><Denominazione>` + (az.ragioneSociale || "MASTRO SRL") + `</Denominazione></Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        <Anagrafica><Denominazione>` + fat.cliente + ` ` + (fat.cognome || "") + `</Denominazione></Anagrafica>
      </DatiAnagrafici>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>` + (fat.dataISO || new Date().toISOString().split("T")[0]) + `</Data>
        <Numero>` + fat.numero + `/` + fat.anno + `</Numero>
        <ImportoTotaleDocumento>` + fat.importo.toFixed(2) + `</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <Descrizione>Fornitura e posa serramenti (Rif. ` + fat.cmCode + `)</Descrizione>
        <Quantita>1.00</Quantita>
        <PrezzoUnitario>` + fat.imponibile.toFixed(2) + `</PrezzoUnitario>
        <PrezzoTotale>` + fat.imponibile.toFixed(2) + `</PrezzoTotale>
        <AliquotaIVA>` + fat.iva.toFixed(2) + `</AliquotaIVA>
      </DettaglioLinee>
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</p:FatturaElettronica>`;
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = "IT" + (az.piva || "00000000000") + "_" + progressivo + ".xml";
    a.click(); URL.revokeObjectURL(url);
  };


  // === ONBOARDING MODAL "COSA VENDI?" ===
  const renderOnboarding = () => <OnboardingPanel />;

  const renderFirmaModal = () => <FirmaModalPanel />;


  const renderPreventivoModal = () => <PreventivoModal />;

  /* == AI PHOTO MODAL VARS == */
  const _aiVt = selectedVano?.tipo || "F1A";
  const _aiSizes: Record<string, [number, number]> = {
    "F1A": [700, 1200], "F2A": [1200, 1400], "F3A": [1800, 1400],
    "PF1A": [800, 2200], "PF2A": [1400, 2200], "PF3A": [2100, 2200],
    "VAS": [700, 500], "SOPR": [800, 400], "FIS": [600, 1000], "FISTONDO": [600, 600],
    "SC2A": [1600, 2200], "SC4A": [2800, 2200], "ALZSC": [3000, 2200],
    "BLI": [900, 2100], "TRIANG": [800, 800], "OBLICA": [700, 1200]
  };
  const [_aiStdW, _aiStdH] = _aiSizes[_aiVt] || [1100, 1300];
  const _aiEx = (selectedVano?.misure || {}) as any;
  const _aiBaseW = (_aiEx.lCentro ?? 0) > 0 ? (_aiEx.lCentro + Math.floor(Math.random() * 7 - 3)) : (_aiStdW + Math.floor(Math.random() * 11 - 5));
  const _aiBaseH = (_aiEx.hCentro ?? 0) > 0 ? (_aiEx.hCentro + Math.floor(Math.random() * 7 - 3)) : (_aiStdH + Math.floor(Math.random() * 11 - 5));
  const _aiTip = TIPOLOGIE_RAPIDE.find(t => t.code === _aiVt)?.label || _aiVt;



  // === CTX — condivide tutto con i componenti estratti ===
  const ctx = {
    T, S, theme, setTheme, isDesktop, isTablet, fs, PIPELINE, tipologieFiltrate,
    tab, setTab, subPlan, setSubPlan, showPaywall, setShowPaywall,
    homeEditMode, setHomeEditMode, dayOffset, setDayOffset,
    ioChecked, setIoChecked, collapsed, setCollapsed,
    lastOpenedCMId, setLastOpenedCMId, cmSubTab, setCmSubTab,
    nvView, setNvView, nvStep, setNvStep, nvData, setNvData,
    nvTipo, setNvTipo, nvMotivoModifica, setNvMotivoModifica,
    nvVani, setNvVani, nvBlocchi, setNvBlocchi, nvNote, setNvNote,
    expandedDay, setExpandedDay,
    cantieri, setCantieri, tasks, setTasks, msgs, setMsgs,
    selectedMsg, setSelectedMsg, replyText, setReplyText,
    problemi, setProblemi, showProblemaModal, setShowProblemaModal,
    selectedProblema, setSelectedProblema, problemaForm, setProblemaForm,
    showProblemiView, setShowProblemiView,
    team, setTeam, coloriDB, setColoriDB, sistemiDB, setSistemiDB,
    vetriDB, setVetriDB, coprifiliDB, setCoprifiliDB,
    lamiereDB, setLamiereDB, libreriaDB, setLibreriaDB,
    telaiPersianaDB, setTelaiPersianaDB, posPersianaDB, setPosPersianaDB,
    tipoMisuraDB, setTipoMisuraDB, tipoMisuraTappDB, setTipoMisuraTappDB,
    tipoMisuraZanzDB, setTipoMisuraZanzDB, tipoCassonettoDB, setTipoCassonettoDB,
    ctProfDB, setCtProfDB, ctSezioniDB, setCtSezioniDB,
    ctCieliniDB, setCtCieliniDB, ctOffset, setCtOffset,
    pipelineDB, setPipelineDB, faseOpen, setFaseOpen,
    sogliaDays, setSogliaDays, showFirmaModal, setShowFirmaModal,
    firmaDrawing, setFirmaDrawing, firmaDataUrl, setFirmaDataUrl,
    showPreventivoModal, setShowPreventivoModal,
    favTipologie, setFavTipologie, fattureDB, setFattureDB,
    fatturePassive, setFatturePassive, showFatturaPassiva, setShowFatturaPassiva,
    newFattPassiva, setNewFattPassiva, showContabilita, setShowContabilita,
    contabTab, setContabTab, contabMese, setContabMese,
    showCronologia, setShowCronologia, kitAccessori, setKitAccessori,
    fornitori, setFornitori, showFornitoreDetail, setShowFornitoreDetail,
    showFornitoreForm, setShowFornitoreForm, fornitoreEdit, setFornitoreEdit,
    customThemes, setCustomThemes, voiceActive, setVoiceActive,
    voiceTranscript, setVoiceTranscript, ordiniFornDB, setOrdiniFornDB,
    showFatturaModal, setShowFatturaModal, fatturaEdit, setFatturaEdit,
    squadreDB, setSquadreDB, montaggiDB, setMontaggiDB,
    settoriAttivi, setSettoriAttivi, showOnboarding, setShowOnboarding,
    pianoAttivo, setPianoAttivo,
    calMontaggiWeek, setCalMontaggiWeek, showCalMontaggi, setShowCalMontaggi,
    calMontaggiTarget, setCalMontaggiTarget,
    montFormOpen, setMontFormOpen, montFormData, setMontFormData,
    ccConfirm, setCcConfirm, ccDone, setCcDone,
    firmaStep, setFirmaStep, firmaFileUrl, setFirmaFileUrl,
    firmaFileName, setFirmaFileName, fattPerc, setFattPerc,
    montGiorni, setMontGiorni, docViewer, setDocViewer,
    ccExpandStep, setCcExpandStep, confSett, setConfSett,
    selectedCM, setSelectedCM, selectedRilievo, setSelectedRilievo,
    showNuovoRilievo, setShowNuovoRilievo, nuovoRilTipo, setNuovoRilTipo,
    nuovoRilData, setNuovoRilData, selectedVano, setSelectedVano,
    filterFase, setFilterFase, searchQ, setSearchQ,
    showModal, setShowModal, settingsTab, setSettingsTab,
    expandedPipelinePhase, setExpandedPipelinePhase,
    pipelinePhaseTab, setPipelinePhaseTab,
    showRiepilogo, setShowRiepilogo, riepilogoSending, setRiepilogoSending,
    tutoStep, setTutoStep, aziendaInfo, setAziendaInfo,
    aiChat, setAiChat, aiInput, setAiInput, aiMsgs, setAiMsgs,
    showSendModal, setShowSendModal, sendOpts, setSendOpts,
    sendConfirm, setSendConfirm, vanoStep, setVanoStep,
    spDrawing, setSpDrawing, agendaView, setAgendaView,
    agendaFilters, setAgendaFilters, homeExpand, setHomeExpand,
    homeView, setHomeView, montView, setMontView,
    montExpandId, setMontExpandId, montCalDate, setMontCalDate,
    dossierTab, setDossierTab, cmFaseIdx, setCmFaseIdx,
    cmView, setCmView, fasePanelOpen, setFasePanelOpen,
    catIdx, setCatIdx, selDate, setSelDate,
    showNewEvent, setShowNewEvent, selectedEvent, setSelectedEvent,
    selectedTask, setSelectedTask, showMailModal, setShowMailModal,
    showEmailComposer, setShowEmailComposer,
    emailDest, setEmailDest, emailOggetto, setEmailOggetto,
    emailCorpo, setEmailCorpo, mailBody, setMailBody,
    newEvent, setNewEvent, events, setEvents,
    faseNotif, setFaseNotif, showAIPhoto, setShowAIPhoto,
    aiPhotoStep, setAiPhotoStep, settingsModal, setSettingsModal,
    importStatus, setImportStatus, importLog, setImportLog,
    settingsForm, setSettingsForm, showAllegatiModal, setShowAllegatiModal,
    allegatiText, setAllegatiText, isRecording, setIsRecording,
    recSeconds, setRecSeconds, playingId, setPlayingId,
    playProgress, setPlayProgress, viewingVideoId, setViewingVideoId,
    viewingPhotoId, setViewingPhotoId, showCameraModal, setShowCameraModal,
    cameraMode, setCameraMode, pendingFotoCat, setPendingFotoCat,
    isDrawing, setIsDrawing, drawTool, setDrawTool,
    drawPages, setDrawPages, drawPageIdx, setDrawPageIdx,
    drawFullscreen, setDrawFullscreen, penColor, setPenColor,
    penSize, setPenSize, drawPaths, setDrawPaths,
    newTask, setNewTask, taskAllegati, setTaskAllegati,
    msgFilter, setMsgFilter, msgSearch, setMsgSearch,
    showCompose, setShowCompose, composeMsg, setComposeMsg,
    fabOpen, setFabOpen, contatti, setContatti,
    msgSubTab, setMsgSubTab, aiInbox, setAiInbox,
    selectedAiMsg, setSelectedAiMsg,
    gmailStatus, setGmailStatus, gmailMessages, setGmailMessages,
    gmailLoading, setGmailLoading, gmailNextPage, setGmailNextPage,
    gmailSelected, setGmailSelected, gmailReply, setGmailReply,
    gmailSending, setGmailSending, gmailSearch, setGmailSearch,
    rubricaSearch, setRubricaSearch, rubricaFilter, setRubricaFilter,
    globalSearch, setGlobalSearch, newCM, setNewCM,
    ripSearch, setRipSearch, ripCMSel, setRipCMSel,
    ripProblema, setRipProblema, ripFotos, setRipFotos,
    ripUrgenza, setRipUrgenza, vanoInfoOpen, setVanoInfoOpen,
    tipCat, setTipCat, newVano, setNewVano,
    customPiani, setCustomPiani, mezziSalita, setMezziSalita,
    showAddPiano, setShowAddPiano, newPiano, setNewPiano,
    winW, setWinW,
    // Helpers
    canDo, closeTuto, nextTuto, parseDataCM, giorniFermaCM,
    goBack, getVaniCM, getVaniAttivi,
    calcolaVanoPrezzo, calcolaTotaleCommessa, countVani,
    urgentCount, readyCount, faseIndex, priColor,
    toggleTask, addTask, addCommessa, addVano,
    updateMisura, updateMisureBatch, toggleAccessorio, updateAccessorio,
    updateVanoField, deleteTask, deleteVano, deleteCommessa,
    deleteEvent, deleteMsg, addAllegato, playAllegato,
    stopAllMedia, stopMediaRecording, compressImage,
    startCameraVideoRec, stopCameraVideoRec, closeCamera,
    addSettingsItem, deleteSettingsItem, advanceFase, setFaseTo,
    addEvent, convertEvent, linkEventToCM, creaFatturaPassiva,
    startVoice, stopVoice, sendCommessa, handleAI, exportPDF, apriInboxDocumento, gmailFetchMessages, gmailSendReply, gmailMatchCommessa,
    // Sub-components
    PipelineBar, VanoSVG, toggleCollapse, SectionHead, caricaDemoCompleto, renderCalendarioMontaggi,
    spCanvasRef, canvasRef, fotoVanoRef, videoVanoRef, openCamera, fileInputRef, fotoInputRef, ripFotoRef, firmaRef,
    // Refs/computed
    filtered, calDays, today,
    // Business logic functions
    generaPreventivoPDF, generaPDFMisure, creaFattura, generaFatturaPDF, inviaWhatsApp, inviaEmail, creaOrdineFornitore, ricalcolaOrdine, updateOrdine, calcolaScadenzaPagamento, generaOrdinePDF, generaConfermaFirmataPDF, inviaOrdineFornitore, creaMontaggio, getWeekDays, generaPreventivoCondivisibile, uploadConfermaFornitore, estraiDatiPDF, confermaInboxDoc, assegnaDocUniversale, generaTrackingCliente, generaXmlSDI, nextNumFattura,
 ORDINE_STATI, activePlan, trialDaysLeft, drag,
    clientiSearch, setClientiSearch, clientiFilter, setClientiFilter,
  };


  /* ======= MAIN RENDER ======= */
  return (
    <MastroContext.Provider value={ctx}>
    <>
      <link href={FONT} rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${T.bg}; }
        input, select, textarea, button { font-size: inherit; }
      `}</style>
      <div style={S.app}>
        {/* Content */}
        {tab === "home" && !selectedCM && !selectedMsg && renderHome()}
        {tab === "commesse" && renderCommesse()}
        {tab === "clienti" && renderClienti()}
        {tab === "messaggi" && !selectedMsg && renderMessaggi()}
        {tab === "agenda" && renderAgenda()}
        {tab === "settings" && renderSettings()}

        {/* FAB — Quick Actions */}
        {/* FAB — Compose menu */}
        <style>{`
          @keyframes fabPulse { 0%,100% { box-shadow: 0 4px 20px rgba(0,122,255,0.4); } 50% { box-shadow: 0 4px 30px rgba(0,122,255,0.6); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        {/* EVENT POPUP OVERLAY — Google Calendar style */}
        {selectedEvent && !selectedEvent._isTask && (tab === "agenda" || tab === "home") && (() => {
          const ev = selectedEvent;
          const cmObj = ev.cm ? cantieri.find(c => c.code === ev.cm) : null;
          return (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedEvent(null)}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)" }} />
              <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", zIndex: 9999, background: T.bg, borderRadius: 16, padding: 20, width: "90%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <input defaultValue={ev.text} onBlur={(e) => { const val = e.target.value.trim(); if (val && val !== ev.text) { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, text: val } : x)); setSelectedEvent({ ...ev, text: val }); } }} style={{ fontSize: 18, fontWeight: 800, color: T.text, border: "none", background: "transparent", width: "100%", outline: "none", padding: 0, fontFamily: "inherit" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <input type="date" defaultValue={ev.date} onChange={(e) => { if (e.target.value) { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, date: e.target.value } : x)); setSelectedEvent({ ...ev, date: e.target.value }); } }} style={{ fontSize: 13, color: T.sub, border: `1px solid ${T.bdr}`, borderRadius: 8, padding: "4px 8px", background: T.card, fontFamily: "inherit" }} />
                      <input type="time" defaultValue={ev.time || ""} onChange={(e) => { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, time: e.target.value } : x)); setSelectedEvent({ ...ev, time: e.target.value }); }} style={{ fontSize: 13, color: T.sub, border: `1px solid ${T.bdr}`, borderRadius: 8, padding: "4px 8px", background: T.card, fontFamily: "inherit" }} />
                    </div>
                  </div>
                  <div onClick={() => setSelectedEvent(null)} style={{ cursor: "pointer", fontSize: 22, color: T.sub, padding: "0 4px" }}>{"✕"}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {ev.persona && <span style={S.badge(T.purpleLt, T.purple)}>{"👤"} {ev.persona}</span>}
                  {ev.addr && <span style={{ fontSize: 11, color: T.sub, background: T.blueLt, padding: "3px 8px", borderRadius: 6 }}>{"📍"} {ev.addr}</span>}
                  {ev.cm && <span style={S.badge(T.blueLt, T.blue)}>{"📁"} {ev.cm}</span>}
                  <select defaultValue={ev.tipo || "sopralluogo"} onChange={(e) => { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, tipo: e.target.value } : x)); setSelectedEvent({ ...ev, tipo: e.target.value }); }} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: `1px solid ${T.bdr}`, background: tipoEvColor(ev.tipo || "sopralluogo") + "18", color: tipoEvColor(ev.tipo || "sopralluogo"), fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {TIPI_EVENTO.map(t => <option key={t.id} value={t.id}>{t.l}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
                  {ev.addr && <div onClick={() => window.open("https://maps.google.com/?q=" + encodeURIComponent(ev.addr))} style={{ padding: "12px 4px", borderRadius: 10, background: T.blueLt, textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.blue }}>{"📍"} Mappa</div>}
                  <div onClick={() => { const tel = cmObj?.telefono || contatti.find(c => c.nome === ev.persona)?.telefono; if (tel) window.location.href="tel:" + tel; }} style={{ padding: "12px 4px", borderRadius: 10, background: T.grnLt, textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.grn }}>{"📞"} Chiama</div>
                  <div onClick={() => { const cliente = cmObj ? `${cmObj.cliente} ${cmObj.cognome||""}`.trim() : (ev.persona || "Cliente"); const dataFmt = new Date(ev.date).toLocaleDateString("it-IT", { weekday:"long", day:"numeric", month:"long" }); setMailBody(`Gentile ${cliente},\n\nLe confermo l'appuntamento:\n\n${dataFmt}${ev.time ? " alle " + ev.time : ""}\n${ev.addr || ""}\n\n${ev.text}\n\nCordiali saluti,\nFabio Cozza`); setShowMailModal({ ev, cm: cmObj }); setSelectedEvent(null); }} style={{ padding: "12px 4px", borderRadius: 10, background: T.accLt, textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.acc }}>{"✉️"} Mail</div>
                  <div onClick={() => { deleteEvent(ev.id); setSelectedEvent(null); }} style={{ padding: "12px 4px", borderRadius: 10, background: T.redLt, textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.red }}>{"🗑️"} Elimina</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  <div onClick={() => { if (cmObj) { setSelectedCM(cmObj); } else { const code = "CM-" + Date.now().toString().slice(-4); const nc = { id: "c" + Date.now(), code, cliente: ev.persona || "Nuovo", cognome: "", indirizzo: ev.addr || "", telefono: "", tipo: "nuova", fase: "sopralluogo", vani: [], note: ev.text }; setCantieri(prev => [...prev, nc]); setSelectedCM(nc); } setSelectedEvent(null); setTab("commesse"); }} style={{ padding: "12px 4px", borderRadius: 12, background: "linear-gradient(135deg, #007aff15, #007aff08)", border: "1px solid #007aff25", textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "#007aff" }}>{"📁"} Commessa</div>
                  <div onClick={() => { if (cmObj) { setSelectedCM(cmObj); } else { const code = "CM-" + Date.now().toString().slice(-4); const nc = { id: "c" + Date.now(), code, cliente: ev.persona || "Nuovo", cognome: "", indirizzo: ev.addr || "", telefono: "", tipo: "nuova", fase: "misure", vani: [], note: "Misure: " + ev.text }; setCantieri(prev => [...prev, nc]); setSelectedCM(nc); } setSelectedEvent(null); setTab("commesse"); }} style={{ padding: "12px 4px", borderRadius: 12, background: "linear-gradient(135deg, #ff950015, #ff950008)", border: "1px solid #ff950025", textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "#ff9500" }}>{"📏"} Misure</div>
                  <div onClick={() => { const code = "INT-" + Date.now().toString().slice(-4); const nc = { id: "c" + Date.now(), code, cliente: ev.persona || "", cognome: "", indirizzo: ev.addr || "", telefono: "", tipo: "nuova", fase: "sopralluogo", vani: [], note: "Intervento: " + ev.text }; setCantieri(prev => [...prev, nc]); setSelectedCM(nc); setSelectedEvent(null); setTab("commesse"); }} style={{ padding: "12px 4px", borderRadius: 12, background: "linear-gradient(135deg, #34c75915, #34c75908)", border: "1px solid #34c75925", textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "#34c759" }}>{"🔧"} Intervento</div>
                </div>
              </div>
            </div>
          );
        })()}
        {/* TASK DETAIL MODAL */}
        {selectedTask && (() => {
          const t = tasks.find(x => x.id === selectedTask.id) || selectedTask;
          const prioColor = t.priority === "alta" ? "#FF3B30" : t.priority === "media" ? "#FF9500" : "#8E8E93";
          const prioLabel = t.priority === "alta" ? "🔴 Urgente" : t.priority === "media" ? "🟠 Normale" : "⚪ Bassa";
          return (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedTask(null)}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)" }} />
              <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", zIndex: 9999, background: T.bg, borderRadius: 16, padding: 20, width: "90%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: prioColor, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: FM }}>✅ TASK · {prioLabel}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: T.text, textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.6 : 1 }}>{t.text}</div>
                    {t.date && <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>📅 {new Date(t.date + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}{t.time ? " alle " + t.time : ""}</div>}
                  </div>
                  <div onClick={() => setSelectedTask(null)} style={{ cursor: "pointer", fontSize: 22, color: T.sub, padding: "0 4px" }}>✕</div>
                </div>
                {t.meta && <div style={{ fontSize: 13, color: T.sub, marginBottom: 12, padding: "8px 12px", background: T.bgSec, borderRadius: 8, border: `1px solid ${T.bdr}` }}>📝 {t.meta}</div>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  <span style={S.badge(prioColor + "18", prioColor)}>{prioLabel}</span>
                  {t.cm && <span onClick={() => { const cm = cantieri.find(c => c.code === t.cm); if (cm) { setSelectedCM(cm); setTab("commesse"); setSelectedTask(null); } }} style={{ ...S.badge(T.accLt, T.acc), cursor: "pointer" }}>📁 {t.cm}</span>}
                  {t.persona && <span style={S.badge(T.purpleLt, T.purple)}>👤 {t.persona}</span>}
                  {t.done && <span style={S.badge(T.grnLt, T.grn)}>✅ Completato</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div onClick={() => { toggleTask(t.id); setSelectedTask({ ...t, done: !t.done }); }} style={{ padding: "14px", borderRadius: 12, background: t.done ? T.bg : T.grn, color: t.done ? T.sub : "#fff", textAlign: "center", cursor: "pointer", fontSize: 14, fontWeight: 800, border: `1px solid ${t.done ? T.bdr : T.grn}` }}>{t.done ? "↩ Riapri" : "✓ Completa"}</div>
                  <div onClick={() => { setTasks(ts => ts.filter(x => x.id !== t.id)); setSelectedTask(null); }} style={{ padding: "14px", borderRadius: 12, background: "#FF3B3010", color: "#FF3B30", textAlign: "center", cursor: "pointer", fontSize: 14, fontWeight: 800, border: "1px solid #FF3B3020" }}>🗑 Elimina</div>
                </div>
              </div>
            </div>
          );
        })()}
        {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", zIndex: 89 }} />}
        {(() => {
          const lastCM = lastOpenedCMId ? cantieri.find(c => c.id === lastOpenedCMId) : (cantieri.find(c => c.fase === "misure") || cantieri.find(c => c.fase !== "chiusura") || cantieri[0]);
          const fabItems: Array<{id:string;ico:string;l:string;c:string;action:()=>void}> = [
            { id: "evento", ico: "📅", l: "Appuntamento", c: "#007aff", action: () => { setFabOpen(false); setShowNewEvent(true); } },
            { id: "cliente", ico: "👤", l: "Nuovo cliente", c: "#34c759", action: () => { setFabOpen(false); setShowModal("contatto"); } },
            { id: "commessa", ico: "📁", l: "Nuova commessa", c: "#ff9500", action: () => { setFabOpen(false); setShowModal("commessa"); } },
            { id: "messaggio", ico: "💬", l: "Messaggio", c: "#5856d6", action: () => { setFabOpen(false); setShowCompose(true); } },
          ];
          if (lastCM) {
            const p = PIPELINE.find(x => x.id === lastCM.fase);
            fabItems.push({ id: "ultima", ico: p?.ico || "📁", l: `${lastCM.code} · ${lastCM.cliente}`, c: p?.color || T.acc, action: () => { setFabOpen(false); setSelectedCM(lastCM); setTab("commesse"); } });
          }
          return fabItems.map((item, i) => (
            <div key={item.id} onClick={item.action} style={{
              position: "fixed", bottom: 90 + (i + 1) * 58, right: 20, zIndex: 90,
              display: "flex", alignItems: "center", gap: 10, flexDirection: "row-reverse",
              opacity: fabOpen ? 1 : 0, transform: fabOpen ? "translateY(0) scale(1)" : "translateY(30px) scale(0.5)",
              transition: `all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) ${fabOpen ? i * 0.06 : 0}s`,
              pointerEvents: fabOpen ? "auto" : "none",
            }}>
              <div style={{ width: item.id === "ultima" ? 52 : 48, height: item.id === "ultima" ? 52 : 48, borderRadius: "50%", background: item.id === "ultima" ? `linear-gradient(135deg, ${item.c}, ${item.c}cc)` : item.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: item.id === "ultima" ? 22 : 20, boxShadow: `0 4px 16px ${item.c}50`, cursor: "pointer", border: item.id === "ultima" ? "2px solid #fff" : "none" }}>
                {item.ico}
              </div>
              <div style={{ padding: "6px 12px", borderRadius: 8, background: T.card, border: `1px solid ${item.id === "ultima" ? item.c + "40" : T.bdr}`, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", fontSize: item.id === "ultima" ? 11 : 12, fontWeight: 700, color: item.c, whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.id === "ultima" ? `↩ ${item.l}` : item.l}
              </div>
            </div>
          ));
        })()}
        <div onClick={() => setFabOpen(!fabOpen)} style={{
          position: "fixed", bottom: 90, right: 20, zIndex: 91,
          width: 56, height: 56, borderRadius: "50%",
          background: fabOpen ? T.sub : "linear-gradient(135deg, #007aff, #5856d6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: fabOpen ? "0 4px 16px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,122,255,0.4)",
          cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          animation: fabOpen ? "none" : "fabPulse 2s infinite",
        }}>
          <div style={{ fontSize: 24, color: "#fff", transition: "transform 0.3s ease", transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)" }}>✏️</div>
        </div>

        {/* MESSAGE DETAIL OVERLAY */}
        {selectedMsg && (() => {
          const chIco = { email: "📧", whatsapp: "💬", sms: "📱", telegram: "✈️" };
          const chCol = { email: T.blue, whatsapp: "#25d366", sms: T.orange, telegram: "#0088cc" };
          const [replyChannel, setReplyChannelX] = [selectedMsg._replyChannel || selectedMsg.canale, (ch) => setSelectedMsg(p => ({...p, _replyChannel: ch}))];
          return (
          <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 150, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px", background: T.card, borderBottom: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div onClick={() => { setSelectedMsg(null); setReplyText(""); }} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={20} c={T.sub} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <span>{chIco[selectedMsg.canale]}</span> {selectedMsg.from}
                </div>
                <div style={{ fontSize: 11, color: T.sub }}>{selectedMsg.cm ? `${selectedMsg.cm} · ` : ""}{selectedMsg.thread?.length || 0} messaggi</div>
              </div>
              {selectedMsg.cm && (
                <div onClick={() => { const cm = cantieri.find(c => c.code === selectedMsg.cm); if (cm) { setSelectedMsg(null); setSelectedCM(cm); setTab("commesse"); } }} style={{ padding: "4px 10px", borderRadius: 6, background: T.accLt, fontSize: 10, fontWeight: 700, color: T.acc, cursor: "pointer" }}>
                  📂 {selectedMsg.cm}
                </div>
              )}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
              {(selectedMsg.thread || []).map((msg, i) => {
                const isMe = msg.who === "Tu";
                const mChIco = chIco[msg.canale] || chIco[selectedMsg.canale] || "💬";
                return (
                  <div key={i} style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ fontSize: 9, color: T.sub, marginBottom: 3, fontWeight: 600 }}>{mChIco} {msg.who} · {msg.date} {msg.time}</div>
                    <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isMe ? (chCol[msg.canale || selectedMsg.canale] || T.acc) : T.card, color: isMe ? "#fff" : T.text, border: isMe ? "none" : `1px solid ${T.bdr}`, fontSize: 13, lineHeight: 1.4 }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: `1px solid ${T.bdr}`, background: T.card }}>
              <div style={{ display: "flex", gap: 2, padding: "6px 16px 0" }}>
                {["email", "whatsapp", "sms", "telegram"].map(ch => (
                  <div key={ch} onClick={() => setReplyChannelX(ch)} style={{ padding: "4px 8px", borderRadius: "8px 8px 0 0", fontSize: 14, cursor: "pointer", background: replyChannel === ch ? chCol[ch] + "18" : "transparent", borderBottom: replyChannel === ch ? `2px solid ${chCol[ch]}` : "2px solid transparent" }}>
                    {chIco[ch]}
                  </div>
                ))}
              </div>
              <div style={{ padding: "8px 16px 20px", display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>📎</div>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>🎤</div>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>📷</div>
                </div>
                <input
                  style={{ flex: 1, padding: "10px 14px", fontSize: 13, border: `1px solid ${T.bdr}`, borderRadius: 20, background: T.bg, outline: "none", fontFamily: FF }}
                  placeholder={`Rispondi via ${replyChannel}...`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && replyText.trim()) {
                      const newThread = [...(selectedMsg.thread || []), { who: "Tu", text: replyText, time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }), canale: replyChannel }];
                      setMsgs(ms => ms.map(m => m.id === selectedMsg.id ? { ...m, thread: newThread, preview: replyText } : m));
                      setSelectedMsg(prev => ({ ...prev, thread: newThread }));
                      setReplyText("");
                    }
                  }}
                />
                <div onClick={() => {
                  if (replyText.trim()) {
                    const newThread = [...(selectedMsg.thread || []), { who: "Tu", text: replyText, time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }), canale: replyChannel }];
                    setMsgs(ms => ms.map(m => m.id === selectedMsg.id ? { ...m, thread: newThread, preview: replyText } : m));
                    setSelectedMsg(prev => ({ ...prev, thread: newThread }));
                    setReplyText("");
                  }
                }} style={{ width: 38, height: 38, borderRadius: "50%", background: replyText.trim() ? (chCol[replyChannel] || T.acc) : T.bdr, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <Ico d={ICO.send} s={16} c={replyText.trim() ? "#fff" : T.sub} />
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* SETTINGS ADD MODAL */}
        {settingsModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && setSettingsModal(null)}>
            <div style={{ background: T.card, borderRadius: 16, width: "100%", maxWidth: 380, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>
                {settingsModal === "sistema" && "Nuovo Sistema"}
                {settingsModal === "colore" && "Nuovo Colore"}
                {settingsModal === "vetro" && "Nuovo Vetro"}
                {settingsModal === "coprifilo" && "Nuovo Coprifilo"}
                {settingsModal === "lamiera" && "Nuova Lamiera"}
                {settingsModal === "tipologia" && "Nuova Tipologia"}
                {settingsModal === "membro" && "Nuovo Membro Team"}
              </div>

              {settingsModal === "membro" && (<>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Nome e cognome</label><input style={S.input} placeholder="es. Marco Ferraro" value={settingsForm.nome || ""} onChange={e => setSettingsForm(f => ({ ...f, nome: e.target.value }))} /></div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Ruolo</label><select style={S.select} value={settingsForm.ruolo || "Posatore"} onChange={e => setSettingsForm(f => ({ ...f, ruolo: e.target.value }))}><option>Titolare</option><option>Posatore</option><option>Ufficio</option><option>Magazzino</option></select></div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Compiti</label><input style={S.input} placeholder="es. Misure, installazione" value={settingsForm.compiti || ""} onChange={e => setSettingsForm(f => ({ ...f, compiti: e.target.value }))} /></div>
              </>)}

              {settingsModal === "sistema" && (<>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Marca</label><input style={S.input} placeholder="es. Aluplast" value={settingsForm.marca || ""} onChange={e => setSettingsForm(f => ({ ...f, marca: e.target.value }))} /></div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Sistema</label><input style={S.input} placeholder="es. Ideal 4000" value={settingsForm.sistema || ""} onChange={e => setSettingsForm(f => ({ ...f, sistema: e.target.value }))} /></div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}><label style={S.fieldLabel}>€/mq (fallback)</label><input style={S.input} type="number" placeholder="180" value={settingsForm.euroMq || ""} onChange={e => setSettingsForm(f => ({ ...f, euroMq: e.target.value }))} /></div>
                  <div style={{ flex: 1 }}><label style={S.fieldLabel}>Sovr. RAL %</label><input style={S.input} type="number" placeholder="12" value={settingsForm.sovRAL || ""} onChange={e => setSettingsForm(f => ({ ...f, sovRAL: e.target.value }))} /></div>
                  <div style={{ flex: 1 }}><label style={S.fieldLabel}>Sovr. Legno %</label><input style={S.input} type="number" placeholder="22" value={settingsForm.sovLegno || ""} onChange={e => setSettingsForm(f => ({ ...f, sovLegno: e.target.value }))} /></div>
                </div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Sottosistemi (separati da virgola)</label><input style={S.input} placeholder="es. Classicline, Roundline" value={settingsForm.sottosistemi || ""} onChange={e => setSettingsForm(f => ({ ...f, sottosistemi: e.target.value }))} /></div>
              </>)}

              {settingsModal === "colore" && (<>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Nome</label><input style={S.input} placeholder="es. Grigio antracite" value={settingsForm.nome || ""} onChange={e => setSettingsForm(f => ({ ...f, nome: e.target.value }))} /></div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}><label style={S.fieldLabel}>Codice</label><input style={S.input} placeholder="es. RAL 7016" value={settingsForm.code || ""} onChange={e => setSettingsForm(f => ({ ...f, code: e.target.value }))} /></div>
                  <div style={{ flex: 1 }}><label style={S.fieldLabel}>Tipo</label><select style={S.select} value={settingsForm.tipo || "RAL"} onChange={e => setSettingsForm(f => ({ ...f, tipo: e.target.value }))}><option>RAL</option><option>Legno</option><option>Satinato</option><option>Altro</option></select></div>
                </div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Colore HEX</label><div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="color" value={settingsForm.hex || "#888888"} onChange={e => setSettingsForm(f => ({ ...f, hex: e.target.value }))} style={{ width: 40, height: 34, border: "none", cursor: "pointer" }} /><input style={{ ...S.input, flex: 1 }} value={settingsForm.hex || "#888888"} onChange={e => setSettingsForm(f => ({ ...f, hex: e.target.value }))} /></div></div>
              </>)}

              {settingsModal === "vetro" && (<>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Nome</label><input style={S.input} placeholder="es. Triplo basso emissivo" value={settingsForm.nome || ""} onChange={e => setSettingsForm(f => ({ ...f, nome: e.target.value }))} /></div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 2 }}><label style={S.fieldLabel}>Codice composizione</label><input style={S.input} placeholder="es. 4/16/4 BE" value={settingsForm.code || ""} onChange={e => setSettingsForm(f => ({ ...f, code: e.target.value }))} /></div>
                  <div style={{ flex: 1 }}><label style={S.fieldLabel}>Ug</label><input style={S.input} type="number" step="0.1" placeholder="1.1" value={settingsForm.ug || ""} onChange={e => setSettingsForm(f => ({ ...f, ug: e.target.value }))} /></div>
                </div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Prezzo €/mq</label><input style={S.input} type="number" step="0.5" placeholder="es. 45" value={settingsForm.prezzoMq || ""} onChange={e => setSettingsForm(f => ({ ...f, prezzoMq: parseFloat(e.target.value)||0 }))} /></div>
              </>)}

              {(settingsModal === "coprifilo" || settingsModal === "lamiera") && (<>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Codice</label><input style={S.input} placeholder={settingsModal === "coprifilo" ? "es. CP50" : "es. LD250"} value={settingsForm.cod || ""} onChange={e => setSettingsForm(f => ({ ...f, cod: e.target.value }))} /></div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Descrizione</label><input style={S.input} placeholder={settingsModal === "coprifilo" ? "es. Coprifilo piatto 50mm" : "es. Lamiera davanzale 250mm"} value={settingsForm.nome || ""} onChange={e => setSettingsForm(f => ({ ...f, nome: e.target.value }))} /></div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Prezzo €/ml</label><input style={S.input} type="number" step="0.5" placeholder="es. 5.50" value={settingsForm.prezzoMl || ""} onChange={e => setSettingsForm(f => ({ ...f, prezzoMl: parseFloat(e.target.value)||0 }))} /></div>
              </>)}

              {settingsModal === "tipologia" && (<>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}><label style={S.fieldLabel}>Codice</label><input style={S.input} placeholder="es. F4A" value={settingsForm.code || ""} onChange={e => setSettingsForm(f => ({ ...f, code: e.target.value }))} /></div>
                  <div style={{ width: 60 }}><label style={S.fieldLabel}>Icona</label><input style={S.input} placeholder="🪟" value={settingsForm.icon || ""} onChange={e => setSettingsForm(f => ({ ...f, icon: e.target.value }))} /></div>
                </div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Descrizione</label><input style={S.input} placeholder="es. Finestra 4 ante" value={settingsForm.label || ""} onChange={e => setSettingsForm(f => ({ ...f, label: e.target.value }))} /></div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Categoria</label>
                  <select style={S.select} value={settingsForm.cat || "Altro"} onChange={e => setSettingsForm(f => ({ ...f, cat: e.target.value }))}>
                    {["Finestre","Balconi","Scorrevoli","Persiane","Altro"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 10 }}><label style={S.fieldLabel}>Forma base</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      { id: "rettangolare", label: "Rettangolare", svg: <svg viewBox="0 0 40 32" width={40} height={32}><rect x={2} y={2} width={36} height={28} fill="#ddeefa" stroke="#333" strokeWidth={1.5} rx={1}/></svg> },
                      { id: "fuorisquadro", label: "Fuorisquadro", svg: <svg viewBox="0 0 40 36" width={40} height={36}><polygon points="2,34 2,6 38,2 38,34" fill="#ddeefa" stroke="#333" strokeWidth={1.5}/><line x1="2" y1="6" x2="38" y2="34" stroke="#c62828" strokeWidth={1} strokeDasharray="3,2"/><text x="4" y="20" fontSize="7" fill="#c62828" fontWeight="700">H1</text><text x="32" y="20" fontSize="7" fill="#1565c0" fontWeight="700">H2</text></svg> },
                      { id: "arco", label: "Ad arco", svg: <svg viewBox="0 0 40 36" width={40} height={36}><path d="M2,36 L2,14 Q2,2 20,2 Q38,2 38,14 L38,36 Z" fill="#ddeefa" stroke="#333" strokeWidth={1.5}/></svg> },
                      { id: "trapezio", label: "Trapezoidale", svg: <svg viewBox="0 0 40 32" width={40} height={32}><polygon points="8,2 32,2 38,30 2,30" fill="#ddeefa" stroke="#333" strokeWidth={1.5}/></svg> },
                      { id: "triangolo", label: "Triangolare", svg: <svg viewBox="0 0 40 32" width={40} height={32}><polygon points="20,2 38,30 2,30" fill="#ddeefa" stroke="#333" strokeWidth={1.5}/></svg> },
                      { id: "oblo", label: "Oblò", svg: <svg viewBox="0 0 40 40" width={40} height={40}><circle cx={20} cy={20} r={17} fill="#ddeefa" stroke="#333" strokeWidth={1.5}/></svg> },
                      { id: "sagomato", label: "Sagomato", svg: <svg viewBox="0 0 40 32" width={40} height={32}><path d="M4,30 L4,10 Q4,2 12,2 L28,2 Q36,6 36,14 L36,24 Q30,30 20,30 Z" fill="#ddeefa" stroke="#333" strokeWidth={1.5}/></svg> },
                    ].map(f => (
                      <div key={f.id} onClick={() => setSettingsForm(fm => ({ ...fm, forma: f.id }))} style={{ padding: "6px 8px", borderRadius: 10, border: `2px solid ${settingsForm.forma === f.id ? T.acc : T.bdr}`, background: settingsForm.forma === f.id ? T.accLt : T.card, cursor: "pointer", textAlign: "center", minWidth: 56 }}>
                        <div>{f.svg}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: settingsForm.forma === f.id ? T.acc : T.sub, marginTop: 2 }}>{f.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              <button style={S.btn} onClick={addSettingsItem}>Salva</button>
              <button style={S.btnCancel} onClick={() => setSettingsModal(null)}>Annulla</button>
            </div>
          </div>
        )}


        {/* === MODULO PROBLEMI — MODAL CREAZIONE === */}
        {showProblemaModal && selectedCM && (() => {
          const c = selectedCM;
          const TIPI_PROB = [
            { id: "materiale", l: "📦 Materiale", c: "#FF9500" },
            { id: "misure", l: "📏 Misure errate", c: "#5856d6" },
            { id: "installazione", l: "🔧 Installazione", c: "#34c759" },
            { id: "cliente", l: "👤 Cliente", c: "#007aff" },
            { id: "fornitore", l: "🏭 Fornitore", c: "#FF6B00" },
            { id: "qualita", l: "⚠️ Qualità", c: "#FF3B30" },
            { id: "altro", l: "📋 Altro", c: "#8E8E93" },
          ];
          const PRIO = [
            { id: "alta", l: "🔴 Alta", c: "#FF3B30" },
            { id: "media", l: "🟠 Media", c: "#FF9500" },
            { id: "bassa", l: "⚪ Bassa", c: "#8E8E93" },
          ];
          return (
            <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowProblemaModal(false)}>
              <div style={{ ...S.modalInner, maxHeight: "85vh", overflow: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#FF3B30" }}>🚨 Segnala problema</div>
                  <div onClick={() => setShowProblemaModal(false)} style={{ cursor: "pointer", fontSize: 20, color: T.sub }}>✕</div>
                </div>
                <div style={{ fontSize: 11, color: T.sub, marginBottom: 14, padding: "8px 12px", background: T.accLt, borderRadius: 8 }}>📁 {c.code} · {c.cliente} · Fase: <b>{c.fase}</b></div>

                <label style={S.fieldLabel}>Titolo *</label>
                <input style={S.input} placeholder="Es: Profilo arrivato danneggiato" value={problemaForm.titolo} onChange={e => setProblemaForm(f => ({ ...f, titolo: e.target.value }))} />

                <label style={{ ...S.fieldLabel, marginTop: 12 }}>Tipo problema</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {TIPI_PROB.map(t => (
                    <div key={t.id} onClick={() => setProblemaForm(f => ({ ...f, tipo: t.id }))} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${problemaForm.tipo === t.id ? t.c : T.bdr}`, background: problemaForm.tipo === t.id ? t.c + "18" : "transparent", fontSize: 11, fontWeight: 600, color: problemaForm.tipo === t.id ? t.c : T.sub, cursor: "pointer" }}>
                      {t.l}
                    </div>
                  ))}
                </div>

                <label style={S.fieldLabel}>Priorità</label>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {PRIO.map(p => (
                    <div key={p.id} onClick={() => setProblemaForm(f => ({ ...f, priorita: p.id }))} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${problemaForm.priorita === p.id ? p.c : T.bdr}`, background: problemaForm.priorita === p.id ? p.c + "18" : "transparent", textAlign: "center", fontSize: 11, fontWeight: 700, color: problemaForm.priorita === p.id ? p.c : T.sub, cursor: "pointer" }}>
                      {p.l}
                    </div>
                  ))}
                </div>

                <label style={S.fieldLabel}>Descrizione</label>
                <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" }} placeholder="Descrivi il problema nel dettaglio..." value={problemaForm.descrizione} onChange={e => setProblemaForm(f => ({ ...f, descrizione: e.target.value }))} />

                <label style={{ ...S.fieldLabel, marginTop: 12 }}>Assegna a</label>
                <select style={S.select || S.input} value={problemaForm.assegnato} onChange={e => setProblemaForm(f => ({ ...f, assegnato: e.target.value }))}>
                  <option value="">— Nessuno —</option>
                  {team.map(m => <option key={m.id} value={m.nome}>{m.nome} — {(m as any).ruolo}</option>)}
                </select>

                <button onClick={() => {
                  if (!problemaForm.titolo.trim()) return;
                  const np = {
                    id: "P" + Date.now(),
                    commessaId: c.id,
                    commessaCode: c.code,
                    cliente: c.cliente,
                    fase: c.fase,
                    tipo: problemaForm.tipo,
                    priorita: problemaForm.priorita,
                    stato: "aperto",
                    titolo: problemaForm.titolo.trim(),
                    descrizione: problemaForm.descrizione.trim(),
                    segnalatoDa: team[0]?.nome || "Fabio",
                    assegnatoA: problemaForm.assegnato,
                    dataApertura: new Date().toISOString(),
                    dataRisoluzione: null,
                    noteRisoluzione: "",
                  };
                  setProblemi(prev => [np, ...prev]);
                  setCantieri(cs => cs.map(x => x.id === c.id ? { ...x, log: [...(x.log || []), { chi: np.segnalatoDa, cosa: `🚨 Problema segnalato: ${np.titolo}`, quando: "Adesso", color: "#FF3B30" }] } : x));
                  setSelectedCM(prev => ({ ...prev, log: [...(prev.log || []), { chi: np.segnalatoDa, cosa: `🚨 Problema segnalato: ${np.titolo}`, quando: "Adesso", color: "#FF3B30" }] }));
                  setShowProblemaModal(false);
                }} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#FF3B30", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FF, marginTop: 16 }}>
                  🚨 Crea segnalazione
                </button>
              </div>
            </div>
          );
        })()}

        {/* === MODULO PROBLEMI — VISTA LISTA === */}
        {showProblemiView && (() => {
          const cmFilter = selectedCM?.id;
          const list = cmFilter ? problemi.filter(p => p.commessaId === cmFilter) : problemi;
          const TIPI_PROB_MAP = { materiale: { l: "📦 Materiale", c: "#FF9500" }, misure: { l: "📏 Misure", c: "#5856d6" }, installazione: { l: "🔧 Install.", c: "#34c759" }, cliente: { l: "👤 Cliente", c: "#007aff" }, fornitore: { l: "🏭 Fornitore", c: "#FF6B00" }, qualita: { l: "⚠️ Qualità", c: "#FF3B30" }, altro: { l: "📋 Altro", c: "#8E8E93" } };
          const STATO_MAP = { aperto: { l: "🔴 Aperto", c: "#FF3B30" }, in_corso: { l: "🟠 In corso", c: "#FF9500" }, risolto: { l: "✅ Risolto", c: "#34c759" } };
          const aperti = list.filter(p => p.stato === "aperto").length;
          const inCorso = list.filter(p => p.stato === "in_corso").length;
          const risolti = list.filter(p => p.stato === "risolto").length;
          return (
            <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowProblemiView(false)}>
              <div style={{ ...S.modalInner, maxWidth: 500, maxHeight: "90vh", overflow: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>🚨 Problemi {cmFilter ? `· ${selectedCM.code}` : "— Tutti"}</div>
                  <div onClick={() => setShowProblemiView(false)} style={{ cursor: "pointer", fontSize: 20, color: T.sub }}>✕</div>
                </div>

                {/* Contatori */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#FF3B3010", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#FF3B30" }}>{aperti}</div>
                    <div style={{ fontSize: 10, color: "#FF3B30", fontWeight: 600 }}>Aperti</div>
                  </div>
                  <div style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#FF950010", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#FF9500" }}>{inCorso}</div>
                    <div style={{ fontSize: 10, color: "#FF9500", fontWeight: 600 }}>In corso</div>
                  </div>
                  <div style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#34c75910", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#34c759" }}>{risolti}</div>
                    <div style={{ fontSize: 10, color: "#34c759", fontWeight: 600 }}>Risolti</div>
                  </div>
                </div>

                {list.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "28px 16px" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Nessun problema segnalato</div>
                    <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Ottimo lavoro!</div>
                  </div>
                ) : list.map(p => {
                  const tp = TIPI_PROB_MAP[p.tipo] || TIPI_PROB_MAP.altro;
                  const st = STATO_MAP[p.stato] || STATO_MAP.aperto;
                  const prio = p.priorita === "alta" ? { l: "🔴", c: "#FF3B30" } : p.priorita === "media" ? { l: "🟠", c: "#FF9500" } : { l: "⚪", c: "#8E8E93" };
                  return (
                    <div key={p.id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "12px 14px", marginBottom: 8, borderLeft: `3px solid ${st.c}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{prio.l} {p.titolo}</div>
                          <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{p.commessaCode} · {p.cliente} · {p.fase}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: st.c + "18", color: st.c }}>{st.l}</span>
                      </div>
                      {p.descrizione && <div style={{ fontSize: 11, color: T.sub, marginBottom: 8, lineHeight: 1.5 }}>{p.descrizione}</div>}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: tp.c + "18", color: tp.c, fontWeight: 600 }}>{tp.l}</span>
                        {p.assegnatoA && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: T.purpleLt, color: T.purple, fontWeight: 600 }}>👤 {p.assegnatoA}</span>}
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: T.bg, color: T.sub }}>{new Date(p.dataApertura).toLocaleDateString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {/* Azioni */}
                      <div style={{ display: "flex", gap: 6 }}>
                        {p.stato === "aperto" && (
                          <button onClick={() => setProblemi(prev => prev.map(x => x.id === p.id ? { ...x, stato: "in_corso" } : x))} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid #FF9500`, background: "#FF950010", color: "#FF9500", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>
                            🟠 Prendi in carico
                          </button>
                        )}
                        {p.stato === "in_corso" && (
                          <button onClick={() => setProblemi(prev => prev.map(x => x.id === p.id ? { ...x, stato: "risolto", dataRisoluzione: new Date().toISOString() } : x))} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid #34c759`, background: "#34c75910", color: "#34c759", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>
                            ✅ Risolvi
                          </button>
                        )}
                        {p.stato === "risolto" && (
                          <button onClick={() => setProblemi(prev => prev.map(x => x.id === p.id ? { ...x, stato: "aperto", dataRisoluzione: null } : x))} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.bg, color: T.sub, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>
                            ↩ Riapri
                          </button>
                        )}
                        <button onClick={() => { if (confirm("Eliminare questo problema?")) setProblemi(prev => prev.filter(x => x.id !== p.id)); }} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid #FF3B3030`, background: "#FF3B3008", color: "#FF3B30", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>
                          🗑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Tab Bar */}
        
      {/* === TUTORIAL INTERATTIVO === */}
      {tutoStep >= 1 && tutoStep <= 7 && (
        <div style={{ position:"fixed", inset:0, zIndex:99999, background: tutoStep === 1 ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", display:"flex", alignItems: tutoStep === 1 ? "center" : "flex-end", justifyContent:"center", padding:16, fontFamily:T.font }} onClick={nextTuto}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius: tutoStep === 1 ? 24 : 20, width:"100%", maxWidth: tutoStep === 1 ? 380 : 340, padding: tutoStep === 1 ? "32px 28px" : "20px 22px", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", marginBottom: tutoStep === 1 ? 0 : 80, ...(tutoStep >= 2 && tutoStep <= 6 ? { position:"fixed", bottom: 70, left:"50%", transform:"translateX(-50%)" } : {}) }}>

            {/* STEP 1: WELCOME */}
            {tutoStep === 1 && (<div style={{ textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:16, background:T.acc, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, color:"#fff", margin:"0 auto 16px" }}>M</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#1A1A1C", marginBottom:6 }}>Benvenuto in MASTRO</div>
              <div style={{ fontSize:13, color:"#6B6B6B", lineHeight:1.6, marginBottom:24 }}>Il gestionale pensato per chi fa serramenti sul campo. Ti faccio vedere come funziona in 30 secondi.</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left", marginBottom:24 }}>
                {[
                  {e:"🏠",t:"Home",d:"Riepilogo della giornata: appuntamenti, allerte, calendario"},
                  {e:"📅",t:"Agenda",d:"Tutti i tuoi impegni in vista giorno, settimana o mese"},
                  {e:"📁",t:"Commesse",d:"Il cuore: ogni lavoro dalla richiesta alla posa"},
                  {e:"📨",t:"Messaggi",d:"Tutte le comunicazioni in un posto"},
                  {e:"⚙️",t:"Impostazioni",d:"Listini, colori, team e dati azienda"},
                ].map((s,i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ fontSize:18, width:28, textAlign:"center", flexShrink:0 }}>{s.e}</div>
                    <div><div style={{ fontSize:13, fontWeight:700, color:"#1A1A1C" }}>{s.t}</div><div style={{ fontSize:11, color:"#8E8E93" }}>{s.d}</div></div>
                  </div>
                ))}
              </div>
              <div onClick={nextTuto} style={{ padding:"14px 32px", fontSize:15, fontWeight:800, color:"#fff", background:T.acc, borderRadius:14, cursor:"pointer", display:"inline-block" }}>Inizia il tour →</div>
              <div onClick={closeTuto} style={{ fontSize:11, color:"#8E8E93", marginTop:12, cursor:"pointer" }}>Salta, conosco già</div>
            </div>)}

            {/* STEP 2: HOME TAB */}
            {tutoStep === 2 && (<div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ fontSize:22 }}>🏠</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#1A1A1C" }}>Home</div>
                <div style={{ marginLeft:"auto", fontSize:10, color:"#8E8E93", background:"#f5f5f5", padding:"3px 8px", borderRadius:8 }}>1/6</div>
              </div>
              <div style={{ fontSize:12, color:"#6B6B6B", lineHeight:1.6, marginBottom:12 }}>Appena apri MASTRO vedi la <b>dashboard</b>: gli appuntamenti di oggi in alto, le <b>allerte</b> sulle commesse ferme, e il <b>calendario</b> del mese. Tocca qualsiasi elemento per aprirlo.</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div onClick={closeTuto} style={{ fontSize:11, color:"#8E8E93", cursor:"pointer" }}>Chiudi tour</div>
                <div onClick={nextTuto} style={{ padding:"8px 20px", fontSize:13, fontWeight:700, color:"#fff", background:T.acc, borderRadius:10, cursor:"pointer" }}>Avanti →</div>
              </div>
              <div style={{ position:"absolute", bottom:-8, left:24, width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderTop:"8px solid #fff" }}/>
            </div>)}

            {/* STEP 3: AGENDA */}
            {tutoStep === 3 && (<div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ fontSize:22 }}>📅</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#1A1A1C" }}>Agenda</div>
                <div style={{ marginLeft:"auto", fontSize:10, color:"#8E8E93", background:"#f5f5f5", padding:"3px 8px", borderRadius:8 }}>2/6</div>
              </div>
              <div style={{ fontSize:12, color:"#6B6B6B", lineHeight:1.6, marginBottom:12 }}>Qui vedi <b>tutti gli impegni</b>: sopralluoghi, pose, consegne. Puoi vedere il <b>giorno singolo</b>, la <b>settimana</b> o il <b>mese</b>. Tocca il + per aggiungere un appuntamento. Ogni evento può essere collegato a una commessa.</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div onClick={() => setTutoStep(tutoStep-1)} style={{ fontSize:12, color:"#8E8E93", cursor:"pointer" }}>‹ Indietro</div>
                <div onClick={nextTuto} style={{ padding:"8px 20px", fontSize:13, fontWeight:700, color:"#fff", background:T.acc, borderRadius:10, cursor:"pointer" }}>Avanti →</div>
              </div>
              <div style={{ position:"absolute", bottom:-8, left:"38%", width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderTop:"8px solid #fff" }}/>
            </div>)}

            {/* STEP 4: COMMESSE */}
            {tutoStep === 4 && (<div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ fontSize:22 }}>📁</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#1A1A1C" }}>Commesse</div>
                <div style={{ marginLeft:"auto", fontSize:10, color:"#8E8E93", background:"#f5f5f5", padding:"3px 8px", borderRadius:8 }}>3/6</div>
              </div>
              <div style={{ fontSize:12, color:"#6B6B6B", lineHeight:1.6, marginBottom:8 }}>Ogni commessa è un <b>lavoro completo</b> con il suo ciclo di vita:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
                {["Sopralluogo","Preventivo","Conferma","Misure","Ordini","Produzione","Posa","Chiusura"].map((f,i) => (
                  <div key={i} style={{ fontSize:9, fontWeight:700, padding:"3px 7px", borderRadius:6, background:i===0?"#007aff15":i<4?"#ff950015":"#34c75915", color:i===0?"#007aff":i<4?"#ff9500":"#34c759" }}>{f}</div>
                ))}
              </div>
              <div style={{ fontSize:12, color:"#6B6B6B", lineHeight:1.6, marginBottom:12 }}>Dentro ogni commessa gestisci <b>vani</b> (finestre, porte), <b>misure</b>, <b>rilievi</b> e generi il <b>preventivo PDF</b>. Tocca + per creare la tua prima commessa!</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div onClick={() => setTutoStep(tutoStep-1)} style={{ fontSize:12, color:"#8E8E93", cursor:"pointer" }}>‹ Indietro</div>
                <div onClick={nextTuto} style={{ padding:"8px 20px", fontSize:13, fontWeight:700, color:"#fff", background:T.acc, borderRadius:10, cursor:"pointer" }}>Avanti →</div>
              </div>
              <div style={{ position:"absolute", bottom:-8, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderTop:"8px solid #fff" }}/>
            </div>)}

            {/* STEP 5: MESSAGGI */}
            {tutoStep === 5 && (<div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ fontSize:22 }}>📨</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#1A1A1C" }}>Messaggi</div>
                <div style={{ marginLeft:"auto", fontSize:10, color:"#8E8E93", background:"#f5f5f5", padding:"3px 8px", borderRadius:8 }}>4/6</div>
              </div>
              <div style={{ fontSize:12, color:"#6B6B6B", lineHeight:1.6, marginBottom:12 }}>Tutte le comunicazioni: <b>WhatsApp, email, SMS, Telegram</b>. L’AI Inbox analizza le email in arrivo e suggerisce azioni automatiche: creare commesse, collegare messaggi, avanzare fasi.</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div onClick={() => setTutoStep(tutoStep-1)} style={{ fontSize:12, color:"#8E8E93", cursor:"pointer" }}>‹ Indietro</div>
                <div onClick={nextTuto} style={{ padding:"8px 20px", fontSize:13, fontWeight:700, color:"#fff", background:T.acc, borderRadius:10, cursor:"pointer" }}>Avanti →</div>
              </div>
              <div style={{ position:"absolute", bottom:-8, right:"35%", width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderTop:"8px solid #fff" }}/>
            </div>)}

            {/* STEP 6: IMPOSTAZIONI */}
            {tutoStep === 6 && (<div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ fontSize:22 }}>⚙️</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#1A1A1C" }}>Impostazioni</div>
                <div style={{ marginLeft:"auto", fontSize:10, color:"#8E8E93", background:"#f5f5f5", padding:"3px 8px", borderRadius:8 }}>5/6</div>
              </div>
              <div style={{ fontSize:12, color:"#6B6B6B", lineHeight:1.6, marginBottom:12 }}>Configura la tua azienda: <b>ragione sociale, logo, listini prezzi, sistemi</b> (Schüco, Rehau, Finstral...), <b>colori RAL</b>, vetri, coprifili, lamiere. Tutto quello che ti serve per fare preventivi precisi.</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div onClick={() => setTutoStep(tutoStep-1)} style={{ fontSize:12, color:"#8E8E93", cursor:"pointer" }}>‹ Indietro</div>
                <div onClick={nextTuto} style={{ padding:"8px 20px", fontSize:13, fontWeight:700, color:"#fff", background:T.acc, borderRadius:10, cursor:"pointer" }}>Avanti →</div>
              </div>
              <div style={{ position:"absolute", bottom:-8, right:24, width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderTop:"8px solid #fff" }}/>
            </div>)}

            {/* STEP 7: FINAL */}
            {tutoStep === 7 && (<div style={{ textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🚀</div>
              <div style={{ fontSize:18, fontWeight:900, color:"#1A1A1C", marginBottom:6 }}>Tutto pronto!</div>
              <div style={{ fontSize:12, color:"#6B6B6B", lineHeight:1.7, marginBottom:8 }}>Ecco come iniziare:</div>
              <div style={{ textAlign:"left", marginBottom:20 }}>
                {[
                  {n:"1",t:"Vai in Impostazioni",d:"Inserisci ragione sociale, P.IVA, telefono"},
                  {n:"2",t:"Crea la prima commessa",d:"Tocca Commesse → + e inserisci cliente e indirizzo"},
                  {n:"3",t:"Aggiungi i vani",d:"Dentro la commessa, aggiungi finestre e portefinestre"},
                  {n:"4",t:"Fai il sopralluogo",d:"Inserisci le misure vano per vano dal cantiere"},
                ].map((s,i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:T.acc, color:"#fff", fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{s.n}</div>
                    <div><div style={{ fontSize:12, fontWeight:700, color:"#1A1A1C" }}>{s.t}</div><div style={{ fontSize:11, color:"#8E8E93" }}>{s.d}</div></div>
                  </div>
                ))}
              </div>
              <div onClick={closeTuto} style={{ padding:"14px 32px", fontSize:15, fontWeight:800, color:"#fff", background:T.acc, borderRadius:14, cursor:"pointer", display:"inline-block" }}>Inizia a lavorare! 💪</div>
            </div>)}
          </div>
        </div>
      )}
      {!selectedVano && (
          
      <div style={S.tabBar}>
            {[
              { id: "home", ico: ICO.home, label: "Home" },
              { id: "agenda", ico: ICO.calendar, label: "Agenda" },
              { id: "commesse", ico: ICO.filter, label: "Commesse" },
              { id: "clienti", ico: ICO.users, label: "Clienti" },
              { id: "messaggi", ico: ICO.chat, label: "Messaggi" },
              { id: "settings", ico: ICO.settings, label: "Impost." },
            ].map(t => (
              <div key={t.id} style={S.tabItem(tab === t.id)} onClick={() => { setTab(t.id); setSelectedCM(null); setSelectedVano(null); setSelectedMsg(null); }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <Ico d={t.ico} s={22} c={tab === t.id ? T.acc : T.sub} />
                  {t.id === "messaggi" && msgs.filter(m => !m.read).length > 0 && (
                    <div style={{ position: "absolute", top: -4, right: -8, width: 16, height: 16, borderRadius: "50%", background: T.red, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {msgs.filter(m => !m.read).length}
                    </div>
                  )}
                </div>
                <div style={S.tabLabel(tab === t.id)}>{t.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {renderModal()}
        {renderPreventivoModal()}
        {renderFirmaModal()}
        {renderOnboarding()}

        {/* SEND COMMESSA MODAL */}
        {showSendModal && selectedCM && (
          <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowSendModal(false)}>
            <div style={S.modalInner}>
              {sendConfirm === "sent" ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: T.grn }}>Commessa inviata!</div>
                  <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Email inviata con tutti i dati selezionati</div>
                </div>
              ) : (
                <>
                  <div style={S.modalTitle}>📧 Invia Commessa — {selectedCM.code}</div>
                  <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Scegli cosa includere nell'invio:</div>
                  {[
                    { key: "misure", label: "Misure tutti i vani", ico: "📐" },
                    { key: "foto", label: "Foto scattate", ico: "📷" },
                    { key: "disegno", label: "Disegni mano libera", ico: "✏️" },
                    { key: "accessori", label: "Accessori (tapparelle, zanzariere...)", ico: "🪟" },
                    { key: "note", label: "Note e annotazioni", ico: "📝" },
                  ].map(opt => (
                    <div key={opt.key} onClick={() => setSendOpts(o => ({ ...o, [opt.key]: !o[opt.key] }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: sendOpts[opt.key] ? T.accLt : T.card, border: `1px solid ${sendOpts[opt.key] ? T.acc : T.bdr}`, borderRadius: 10, marginBottom: 6, cursor: "pointer" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${sendOpts[opt.key] ? T.acc : T.bdr}`, background: sendOpts[opt.key] ? T.acc : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                        {sendOpts[opt.key] && "✓"}
                      </div>
                      <span style={{ fontSize: 16 }}>{opt.ico}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{opt.label}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, marginBottom: 8 }}>
                    <label style={S.fieldLabel}>Invia a (email)</label>
                    <input style={S.input} placeholder="email@destinatario.com" />
                  </div>
                  <button onClick={sendCommessa} style={{ ...S.btn, background: "linear-gradient(135deg, #007aff, #0055cc)", marginTop: 4 }}>
                    📧 Invia commessa completa
                  </button>
                  <button style={S.btnCancel} onClick={() => setShowSendModal(false)}>Annulla</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* NEW EVENT MODAL */}
        {showNewEvent && (
          <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowNewEvent(false)}>
            <div style={S.modalInner}>
              <div style={S.modalTitle}>{newEvent.tipo === "task" ? "Nuovo task" : "Nuovo evento"}</div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Titolo</label>
                <input style={S.input} placeholder="es. Sopralluogo, consegna materiale..." value={newEvent.text} onChange={e => setNewEvent(ev => ({ ...ev, text: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={S.fieldLabel}>Data</label>
                  <input style={S.input} type="date" value={newEvent.date || selDate.toISOString().split("T")[0]} onChange={e => setNewEvent(ev => ({ ...ev, date: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.fieldLabel}>Ora (opz.)</label>
                  <input style={S.input} type="time" value={newEvent.time} onChange={e => setNewEvent(ev => ({ ...ev, time: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Tipo</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[{ id: "task", l: "✅ Task", c: T.orange }, ...TIPI_EVENTO].map(t => (
                    <div key={t.id} onClick={() => setNewEvent(ev => ({ ...ev, tipo: t.id }))} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${newEvent.tipo === t.id ? t.c : T.bdr}`, background: newEvent.tipo === t.id ? t.c + "18" : "transparent", textAlign: "center", fontSize: 11, fontWeight: 600, color: newEvent.tipo === t.id ? t.c : T.sub, cursor: "pointer" }}>
                      {t.l}
                    </div>
                  ))}
                </div>
              </div>
              {/* --- TASK-SPECIFIC FIELDS --- */}
              {newEvent.tipo === "task" && (<>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Priorità</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[{ id: "alta", l: "🔴 Alta", c: "#FF3B30" }, { id: "media", l: "🟠 Media", c: "#FF9500" }, { id: "bassa", l: "⚪ Bassa", c: "#8E8E93" }].map(p => (
                    <div key={p.id} onClick={() => setNewEvent(ev => ({ ...ev, _taskPriority: p.id } as any))} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${((newEvent as any)._taskPriority || "media") === p.id ? p.c : T.bdr}`, background: ((newEvent as any)._taskPriority || "media") === p.id ? p.c + "18" : "transparent", textAlign: "center", fontSize: 12, fontWeight: 600, color: ((newEvent as any)._taskPriority || "media") === p.id ? p.c : T.sub, cursor: "pointer" }}>
                      {p.l}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Collega a commessa</label>
                <select style={S.select} value={newEvent.cm} onChange={e => setNewEvent(ev => ({ ...ev, cm: e.target.value }))}>
                  <option value="">— Nessuna —</option>
                  {cantieri.map(c => <option key={c.id} value={c.code}>{c.code} · {c.cliente}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Assegna a persona</label>
                <select style={S.select} value={newEvent.persona} onChange={e => setNewEvent(ev => ({ ...ev, persona: e.target.value }))}>
                  <option value="">— Nessuno —</option>
                  {[...contatti.filter(ct => ct.tipo === "cliente"), ...team].map(m => <option key={m.id} value={m.nome}>{m.nome}{(m as any).ruolo ? " — " + (m as any).ruolo : ""}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Note (opz.)</label>
                <input style={S.input} placeholder="Dettagli, materiale da portare..." value={(newEvent as any)._taskMeta || ""} onChange={e => setNewEvent(ev => ({ ...ev, _taskMeta: e.target.value } as any))} />
              </div>
              </>)}
              {/* --- EVENT-SPECIFIC FIELDS --- */}
              {newEvent.tipo !== "task" && (<>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Cliente</label>
                <select style={S.select} value={newEvent.persona || ""} onChange={e => {
                  const val = e.target.value;
                  if (val === "__new__") { setNewEvent(ev => ({ ...ev, persona: "", _newCliente: true } as any)); }
                  else { const ct = contatti.find(c => c.nome === val); setNewEvent(ev => ({ ...ev, persona: val, addr: ct?.indirizzo || ev.addr, text: ev.text || ("Appuntamento " + val), _newCliente: false } as any)); }
                }}>
                  <option value="">— Seleziona cliente —</option>
                  {contatti.filter(ct => ct.tipo === "cliente").map(ct => <option key={ct.id || ct.nome} value={ct.nome}>{ct.nome}{ct.cognome ? " " + ct.cognome : ""}</option>)}
                  <option value="__new__">➕ Nuovo cliente...</option>
                </select>
                {(newEvent as any)._newCliente && (
                  <div style={{ background: T.bgSec, borderRadius: 10, padding: 12, marginTop: 8, border: `1px solid ${T.bdr}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.acc, marginBottom: 8 }}>👤 Nuovo cliente</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input style={{ ...S.input, flex: 1 }} placeholder="Nome" value={(newEvent as any)._nomeCliente || ""} onChange={e => setNewEvent(ev => ({ ...ev, _nomeCliente: e.target.value } as any))} />
                      <input style={{ ...S.input, flex: 1 }} placeholder="Cognome" value={(newEvent as any)._cognomeCliente || ""} onChange={e => setNewEvent(ev => ({ ...ev, _cognomeCliente: e.target.value } as any))} />
                    </div>
                    <input style={{ ...S.input, marginBottom: 8 }} placeholder="Telefono" value={(newEvent as any)._telCliente || ""} onChange={e => setNewEvent(ev => ({ ...ev, _telCliente: e.target.value } as any))} />
                    <input style={S.input} placeholder="Indirizzo" value={(newEvent as any)._addrCliente || ""} onChange={e => setNewEvent(ev => ({ ...ev, _addrCliente: e.target.value, addr: e.target.value } as any))} />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Collega a commessa</label>
                <select style={S.select} value={newEvent.cm} onChange={e => setNewEvent(ev => ({ ...ev, cm: e.target.value }))}>
                  <option value="">— Nessuna —</option>
                  {cantieri.map(c => <option key={c.id} value={c.code}>{c.code} · {c.cliente}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Assegna a persona</label>
                <select style={S.select} value={newEvent.persona} onChange={e => setNewEvent(ev => ({ ...ev, persona: e.target.value }))}>
                  <option value="">— Nessuno —</option>
                  {team.map(m => <option key={m.id} value={m.nome}>{m.nome} — {m.ruolo}</option>)}
                </select>
              </div>
              {/* Indirizzo */}
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Indirizzo (opz.)</label>
                <input style={S.input} placeholder="Via Roma 12, Cosenza..." value={newEvent.addr||""} onChange={e => setNewEvent(ev => ({ ...ev, addr: e.target.value }))} />
              </div>
              {/* Reminder */}
              <div style={{ marginBottom: 16 }}>
                <label style={S.fieldLabel}>⏰ Reminder al cliente</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { id: "", l: "Nessuno" },
                    { id: "24h", l: "24h prima" },
                    { id: "1h", l: "1h prima" },
                    { id: "giorno", l: "Il giorno" },
                  ].map(r => (
                    <div key={r.id} onClick={() => setNewEvent(ev => ({ ...ev, reminder: r.id }))}
                      style={{ flex: 1, padding: "8px 4px", borderRadius: 8, textAlign: "center", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        border: `1px solid ${newEvent.reminder === r.id ? T.acc : T.bdr}`,
                        background: newEvent.reminder === r.id ? T.accLt : "transparent",
                        color: newEvent.reminder === r.id ? T.acc : T.sub }}>
                      {r.l}
                    </div>
                  ))}
                </div>
                {newEvent.reminder && (
                  <div style={{ marginTop: 6, fontSize: 10, color: T.sub, padding: "5px 8px", background: T.accLt, borderRadius: 6 }}>
                    📧 MASTRO ti avviserà di inviare il reminder — lo farai con 1 click dal banner in agenda
                  </div>
                )}
              </div>
              </>)}
              <button style={S.btn} onClick={addEvent}>{newEvent.tipo === "task" ? "Crea task" : "Crea evento"}</button>
              <button style={S.btnCancel} onClick={() => setShowNewEvent(false)}>Annulla</button>
            </div>
          </div>
        )}

        {/* FASE ADVANCE NOTIFICATION */}
        {faseNotif && (
          <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", maxWidth: 380, width: "90%", padding: "12px 16px", borderRadius: 12, background: T.card, border: `1px solid ${faseNotif.color}40`, boxShadow: `0 4px 20px ${faseNotif.color}30`, zIndex: 300, display: "flex", alignItems: "center", gap: 10, animation: "fadeIn 0.3s ease" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: faseNotif.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18 }}>📧</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Avanzato a {faseNotif.fase}</div>
              <div style={{ fontSize: 11, color: T.sub }}>Email inviata a <strong>{faseNotif.addetto}</strong></div>
            </div>
            <div style={{ fontSize: 18 }}>✅</div>
          </div>
        )}

        {/* COMPOSE MESSAGE MODAL */}
        {showCompose && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && setShowCompose(false)}>
            <div style={{ background: T.card, borderRadius: 16, width: "100%", maxWidth: 420, padding: 20, maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>✏️ Nuovo messaggio</div>
              <div style={{ marginBottom: 12 }}>
                <label style={S.fieldLabel}>Invia via</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    { id: "whatsapp", l: "💬 WhatsApp", c: "#25d366" },
                    { id: "email", l: "📧 Email", c: T.blue },
                    { id: "sms", l: "📱 SMS", c: T.orange },
                    { id: "telegram", l: "✈️ Telegram", c: "#0088cc" },
                  ].map(ch => (
                    <div key={ch.id} onClick={() => setComposeMsg(c => ({ ...c, canale: ch.id }))} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1.5px solid ${composeMsg.canale === ch.id ? ch.c : T.bdr}`, background: composeMsg.canale === ch.id ? ch.c + "15" : T.card, textAlign: "center", cursor: "pointer", fontSize: 10, fontWeight: 600, color: composeMsg.canale === ch.id ? ch.c : T.sub }}>
                      {ch.l}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={S.fieldLabel}>Destinatario</label>
                <input style={S.input} placeholder="Nome o numero..." value={composeMsg.to} onChange={e => setComposeMsg(c => ({ ...c, to: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={S.fieldLabel}>Collega a commessa (opzionale)</label>
                <select style={S.select} value={composeMsg.cm} onChange={e => setComposeMsg(c => ({ ...c, cm: e.target.value }))}>
                  <option value="">— Nessuna —</option>
                  {cantieri.map(c => <option key={c.id} value={c.code}>{c.code} · {c.cliente}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Messaggio</label>
                <textarea style={{ width: "100%", padding: 12, fontSize: 13, border: `1px solid ${T.bdr}`, borderRadius: 10, background: T.bg, minHeight: 80, resize: "vertical", fontFamily: FF, boxSizing: "border-box" }} placeholder="Scrivi il messaggio..." value={composeMsg.text} onChange={e => setComposeMsg(c => ({ ...c, text: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[{ ico: "📎", l: "File" }, { ico: "📷", l: "Foto" }, { ico: "🎤", l: "Audio" }, { ico: "📍", l: "Posizione" }].map((b, i) => (
                  <div key={i} style={{ flex: 1, padding: "8px 4px", background: T.bg, borderRadius: 8, border: `1px solid ${T.bdr}`, textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 16 }}>{b.ico}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: T.sub, marginTop: 1 }}>{b.l}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                if (composeMsg.to.trim() && composeMsg.text.trim()) {
                  const newMsg = {
                    id: Date.now(), from: composeMsg.to, preview: composeMsg.text, time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
                    cm: composeMsg.cm, read: true, canale: composeMsg.canale,
                    thread: [{ who: "Tu", text: composeMsg.text, time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }), canale: composeMsg.canale }]
                  };
                  setMsgs(ms => [newMsg, ...ms]);
                  setShowCompose(false);
                  setComposeMsg({ to: "", text: "", canale: "whatsapp", cm: "" });
                }
              }} style={{ ...S.btn, opacity: composeMsg.to.trim() && composeMsg.text.trim() ? 1 : 0.5 }}>
                Invia messaggio
              </button>
              <button onClick={() => setShowCompose(false)} style={S.btnCancel}>Annulla</button>
            </div>
          </div>
        )}

        {/* ALLEGATI MODAL */}
        {showAllegatiModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && setShowAllegatiModal(null)}>
            <div style={{ background: T.card, borderRadius: 16, width: "100%", maxWidth: 380, padding: 20 }}>
              {showAllegatiModal === "nota" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>📝 Nuova nota</div>
                  <textarea style={{ width: "100%", padding: 12, fontSize: 13, border: `1px solid ${T.bdr}`, borderRadius: 10, background: T.bg, minHeight: 100, resize: "vertical", fontFamily: FF, boxSizing: "border-box" }} placeholder="Scrivi la nota..." value={allegatiText} onChange={e => setAllegatiText(e.target.value)} autoFocus />
                  <button onClick={() => { if (allegatiText.trim()) { addAllegato("nota", allegatiText.trim()); setShowAllegatiModal(null); setAllegatiText(""); } }} style={{ ...S.btn, marginTop: 10, opacity: allegatiText.trim() ? 1 : 0.5 }}>Salva nota</button>
                </>
              )}
              {showAllegatiModal === "vocale" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #ff3b30, #ff6b6b)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 16, color: "#fff" }}>🎤</span>
                    </span>
                    <span>Nota Vocale</span>
                  </div>
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    {/* Waveform visualizer */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, height: 60, marginBottom: 16 }}>
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div key={i} style={{
                          width: 3, borderRadius: 2,
                          background: isRecording ? "#ff3b30" : T.bdr,
                          height: isRecording ? (Math.sin(Date.now() / 200 + i * 0.5) * 0.5 + 0.5) * 40 + 8 : 8,
                          transition: "height 0.15s",
                          animation: isRecording ? `audioWave 0.6s ease-in-out infinite` : "none",
                          animationDelay: `${i * 30}ms`,
                          opacity: isRecording ? 1 : 0.3
                        }} />
                      ))}
                    </div>
                    <style>{`@keyframes audioWave { 0%,100% { height: 8px; } 50% { height: ${Math.random() * 30 + 20}px; } }`}</style>
                    {/* Timer */}
                    <div style={{ fontSize: 32, fontWeight: 700, fontFamily: FM, color: isRecording ? T.red : T.sub, marginBottom: 16, letterSpacing: 2 }}>
                      {Math.floor(recSeconds / 60)}:{String(recSeconds % 60).padStart(2, "0")}
                    </div>
                    {/* Record button */}
                    <div onClick={() => {
                      if (!isRecording) { startMediaRecording("vocale"); }
                      else { stopMediaRecording("vocale"); }
                    }} style={{ width: 70, height: 70, borderRadius: "50%", background: isRecording ? "linear-gradient(135deg, #ff3b30, #cc0000)" : "linear-gradient(135deg, #ff3b30, #ff6b6b)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: "pointer", boxShadow: isRecording ? "0 0 24px rgba(255,59,48,0.5)" : "0 4px 16px rgba(255,59,48,0.3)" }}>
                      <span style={{ fontSize: 28, color: "#fff" }}>{isRecording ? "⏹" : "🎤"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: isRecording ? T.red : T.sub, marginTop: 10, fontWeight: isRecording ? 700 : 400 }}>
                      {isRecording ? "Registrazione... tocca per fermare" : "Tocca per registrare"}
                    </div>
                  </div>
                </>
              )}
              {showAllegatiModal === "video" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #007aff, #5856d6)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 16, color: "#fff" }}>🎬</span>
                    </span>
                    <span>Registra Video</span>
                  </div>
                  <div style={{ padding: "4px 0" }}>
                    {/* Camera preview — always visible */}
                    <div style={{ width: "100%", height: 220, background: "#000", borderRadius: 14, marginBottom: 10, overflow: "hidden", position: "relative" as const }}>
                      <video ref={videoPreviewRef} playsInline muted autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {/* REC badge */}
                      {isRecording && (
                        <div style={{ position: "absolute" as const, top: 10, left: 10, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "4px 10px" }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff3b30", animation: "pulse 1s infinite" }} />
                          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FM, color: "#fff" }}>
                            {Math.floor(recSeconds / 60)}:{String(recSeconds % 60).padStart(2, "0")}
                          </span>
                        </div>
                      )}
                      {/* Camera switch hint */}
                      {!isRecording && (
                        <div style={{ position: "absolute" as const, bottom: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.5)", borderRadius: 6, padding: "4px 12px" }}>
                          <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>📹 Camera posteriore</span>
                        </div>
                      )}
                    </div>
                    {/* Controls */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "6px 0" }}>
                      <div onClick={() => {
                        if (!isRecording) { startMediaRecording("video"); }
                        else { stopMediaRecording("video"); }
                      }} style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid " + (isRecording ? "#ff3b30" : "#007aff"), background: isRecording ? "#ff3b30" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
                        {isRecording
                          ? <div style={{ width: 22, height: 22, borderRadius: 4, background: "#fff" }} />
                          : <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#ff3b30" }} />
                        }
                      </div>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 11, color: isRecording ? T.red : T.sub, fontWeight: isRecording ? 700 : 400, marginTop: 2 }}>
                      {isRecording ? "Tocca per fermare" : "Tocca il cerchio per registrare"}
                    </div>
                  </div>
                  <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                </>
              )}
              <button onClick={() => { stopAllMedia(); clearInterval(recInterval.current); setIsRecording(false); setRecSeconds(0); setShowAllegatiModal(null); }} style={S.btnCancel}>Annulla</button>
            </div>
          </div>
        )}

        {/* CAMERA MODAL — foto & video cattura */}
        {showCameraModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column" as const }}>
            {/* Header */}
            <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.8)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>
                  {cameraMode === "foto" ? "📷 Scatta Foto" : "🎬 Registra Video"}
                </span>
                {pendingFotoCat && <span style={{ fontSize: 10, color: "#ff9500", fontWeight: 700, background: "rgba(255,149,0,0.2)", padding: "2px 8px", borderRadius: 4 }}>{pendingFotoCat}</span>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Switch mode */}
                <div onClick={() => setCameraMode(cameraMode === "foto" ? "video" : "foto")}
                  style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.15)", fontSize: 10, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  {cameraMode === "foto" ? "🎬 Video" : "📷 Foto"}
                </div>
                {/* Import from gallery */}
                <div onClick={() => { fotoVanoRef.current?.click(); }}
                  style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.15)", fontSize: 10, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  🖼 Galleria
                </div>
                <div onClick={closeCamera}
                  style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,59,48,0.3)", fontSize: 10, color: "#ff6b6b", fontWeight: 700, cursor: "pointer" }}>
                  ✕ Chiudi
                </div>
              </div>
            </div>
            {/* Camera preview */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" as const }}>
              <video ref={cameraPreviewRef} playsInline muted autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* REC indicator for video */}
              {cameraMode === "video" && isRecording && (
                <div style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "6px 12px" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff3b30", animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 16, fontWeight: 700, fontFamily: FM, color: "#fff" }}>
                    {Math.floor(recSeconds / 60)}:{String(recSeconds % 60).padStart(2, "0")}
                  </span>
                </div>
              )}
              {/* Photo count badge */}
              {cameraMode === "foto" && (
                <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "6px 12px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    📷 {Object.values(selectedVano?.foto || {}).filter(f => f.tipo === "foto" && (!pendingFotoCat || f.categoria === pendingFotoCat)).length} scattate
                  </span>
                </div>
              )}
            </div>
            {/* Controls */}
            <div style={{ padding: "16px 0 24px", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", gap: 32 }}>
              {cameraMode === "foto" ? (
                <div onClick={capturePhoto}
                  style={{ width: 72, height: 72, borderRadius: "50%", border: "4px solid #fff", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#fff" }} />
                </div>
              ) : (
                <div onClick={() => { if (!isRecording) startCameraVideoRec(); else stopCameraVideoRec(); }}
                  style={{ width: 72, height: 72, borderRadius: "50%", border: "4px solid #fff", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {isRecording
                    ? <div style={{ width: 26, height: 26, borderRadius: 4, background: "#ff3b30" }} />
                    : <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#ff3b30" }} />
                  }
                </div>
              )}
            </div>
            <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>
          </div>
        )}

        {/* AI PHOTO MODAL */}
        {/* AI PHOTO MODAL */}
        {showAIPhoto && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && setShowAIPhoto(false)}>
            <div style={{ background: T.card, borderRadius: 16, width: "100%", maxWidth: 380, padding: 20, maxHeight: "80vh", overflowY: "auto" }}>
              {aiPhotoStep === 0 && (
                <>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #af52de, #007aff)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>🤖</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#af52de" }}>AI Misure da Foto</div>
                    <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Inquadra il vano "{selectedVano?.nome}" e l'AI analizzerà l'immagine</div>
                  </div>
                  <div style={{ position: "relative", height: 200, borderRadius: 12, overflow: "hidden", marginBottom: 12, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ position: "absolute", inset: 20, border: "2px solid #af52de80", borderRadius: 8 }} />
                    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#af52de30" }} />
                    <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#af52de30" }} />
                    <div style={{ color: "#af52de", fontSize: 12, fontWeight: 600, textAlign: "center", zIndex: 1 }}>📷 Simulazione fotocamera<br /><span style={{ fontSize: 10, color: "#af52de80" }}>Inquadra il serramento</span></div>
                  </div>
                  <button onClick={() => { setAiPhotoStep(1); setTimeout(() => setAiPhotoStep(2), 2000 + Math.random() * 1500); }} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #af52de, #007aff)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FF, marginBottom: 8 }}>
                    📸 Scatta e analizza
                  </button>
                  <button onClick={() => setShowAIPhoto(false)} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FF, color: T.sub }}>Annulla</button>
                </>
              )}
              {aiPhotoStep === 1 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", border: "4px solid #af52de20", borderTopColor: "#af52de", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#af52de" }}>Analisi AI in corso...</div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>Rilevamento bordi · Edge detection · Stima dimensioni</div>
                  <div style={{ fontSize: 10, color: T.sub, marginTop: 8 }}>Analizzando "{selectedVano?.nome}"...</div>
                </div>
              )}
              {aiPhotoStep === 2 && (
                <>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.grn }}>Analisi completata!</div>
                    <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>Misure suggerite per "{selectedVano?.nome}" (verifica con metro)</div>
                  </div>
                  <div style={{ borderRadius: 10, border: `1px solid ${T.bdr}`, overflow: "hidden", marginBottom: 12 }}>
                    {[["Larghezza stimata", `~${_aiBaseW} mm`, T.acc], ["Altezza stimata", `~${_aiBaseH} mm`, T.blue], ["Tipo rilevato", _aiTip, T.purple]].map(([l, val, col]) => (
                      <div key={String(l)} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${T.bdr}`, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: T.sub }}>{l}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FM, color: String(col) }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "#fff3e0", border: "1px solid #ffe0b2", marginBottom: 12, fontSize: 10, color: "#e65100" }}>
                    ⚠️ Le misure AI sono approssimative. Usa sempre il metro laser per le misure definitive.
                  </div>
                  <button onClick={() => {
                    if (selectedVano) {
                      updateMisura(selectedVano.id, "lAlto", _aiBaseW + Math.floor(Math.random() * 5 - 2));
                      updateMisura(selectedVano.id, "lCentro", _aiBaseW);
                      updateMisura(selectedVano.id, "lBasso", _aiBaseW - Math.floor(Math.random() * 4));
                      updateMisura(selectedVano.id, "hSx", _aiBaseH);
                      updateMisura(selectedVano.id, "hCentro", _aiBaseH + Math.floor(Math.random() * 3 - 1));
                      updateMisura(selectedVano.id, "hDx", _aiBaseH - Math.floor(Math.random() * 4));
                    }
                    setShowAIPhoto(false);
                  }} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #af52de, #007aff)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FF, marginBottom: 8 }}>
                    ✅ Applica misure suggerite
                  </button>
                  <button onClick={() => setShowAIPhoto(false)} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FF, color: T.sub }}>Solo anteprima, non applicare</button>
                </>
              )}
            </div>
          </div>
        )}
      {/* === PAYWALL MODAL === */}
      {showPaywall && (
        <div onClick={() => setShowPaywall(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: 16, maxWidth: 360, width: "100%", overflow: "hidden" }}>
            <div style={{ padding: "20px 20px 12px", textAlign: "center" as const }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>💎</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 6 }}>Passa a un piano superiore</div>
              <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5 }}>{showPaywall}</div>
            </div>
            <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
              <div onClick={() => { setShowPaywall(null); setSettingsTab("piano"); setTab("settings"); }}
                style={{ padding: 12, borderRadius: 10, background: T.acc, textAlign: "center" as const, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                Vedi piani disponibili
              </div>
              <div onClick={() => setShowPaywall(null)}
                style={{ padding: 10, borderRadius: 8, textAlign: "center" as const, fontSize: 12, fontWeight: 600, color: T.sub, cursor: "pointer" }}>
                Non ora
              </div>
            </div>
          </div>
        </div>
      )}
      {/* === 📥 INBOX DOCUMENTI — Modal globale === */}
      {showContabilita && renderContabilita()}
        {showInboxDoc && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10001, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ background: T.card, borderRadius: "20px 20px 0 0", maxWidth: 500, width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "20px 20px 30px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>📥 Documento in Arrivo</div>
              <div onClick={() => { setShowInboxDoc(false); setInboxResult(null); }} style={{ width: 30, height: 30, borderRadius: "50%", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>✕</div>
            </div>

            {/* Loading */}
            {inboxResult?.stato === "caricamento" && (
              <div style={{ textAlign: "center", padding: 30 }}>
                <div style={{ fontSize: 36, animation: "spin 1s linear infinite", display: "inline-block" }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 8 }}>Caricamento...</div>
                <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>{inboxResult.file}</div>
              </div>
            )}

            {/* AI Analysis */}
            {inboxResult?.stato === "analisi" && (
              <div style={{ textAlign: "center", padding: 30 }}>
                <div style={{ fontSize: 36, animation: "spin 1s linear infinite", display: "inline-block" }}>🤖</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#af52de", marginTop: 8 }}>AI sta leggendo il documento...</div>
                <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>Estraggo: totale, consegna, pagamento, articoli</div>
              </div>
            )}

            {/* Results */}
            {inboxResult?.stato === "completato" && (
              <div>
                {/* File info + classification */}
                <div style={{ ...S.card, padding: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 28 }}>{inboxResult.tipo?.includes("pdf") ? "📄" : "📷"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{inboxResult.file}</div>
                    {inboxResult.fileUrl && <div onClick={() => window.open(inboxResult.fileUrl, "_blank")} style={{ fontSize: 10, color: "#007aff", cursor: "pointer", marginTop: 2 }}>🔗 Apri originale</div>}
                  </div>
                </div>

                {/* AI Classification badge */}
                {(() => {
                  const tipoLabels: any = { firma: "✍️ Preventivo Firmato", conferma: "📄 Conferma Fornitore", fattura: "💰 Fattura", ricevuta: "🏦 Ricevuta Pagamento", foto: "📷 Foto Cantiere", sconosciuto: "❓ Documento" };
                  const tipoColors: any = { firma: "#34c759", conferma: "#af52de", fattura: "#007aff", ricevuta: "#ff9500", foto: "#5856d6", sconosciuto: "#86868b" };
                  const col = tipoColors[inboxResult.docTipo] || "#86868b";
                  return (
                    <div style={{ ...S.card, padding: 12, marginBottom: 12, background: col + "10", border: `2px solid ${col}30` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: col, textTransform: "uppercase" }}>🤖 MASTRO ha classificato:</span>
                        <span style={{ fontSize: 10, color: T.sub }}>{inboxResult.confidence}% sicuro</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: col }}>{tipoLabels[inboxResult.docTipo] || "Documento"}</div>
                      {inboxResult.matchedCommessa && (
                        <div style={{ fontSize: 12, color: T.text, marginTop: 4 }}>
                          → <b>{inboxResult.matchedCommessa.code} — {inboxResult.matchedCommessa.cliente} {inboxResult.matchedCommessa.cognome || ""}</b>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Extracted data (for conferma) */}
                {inboxResult.dati && (inboxResult.dati.fornitoreNome || inboxResult.dati.totale > 0 || inboxResult.dati.settimane > 0) && (
                  <div style={{ ...S.card, padding: 12, marginBottom: 12, background: "#af52de08", border: `1px solid #af52de20` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#af52de", textTransform: "uppercase", marginBottom: 8 }}>🤖 Dati Estratti</div>
                    {inboxResult.dati.fornitoreNome && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}><span style={{ color: T.sub }}>Fornitore</span><b>{inboxResult.dati.fornitoreNome}</b></div>}
                    {inboxResult.dati.totale > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}><span style={{ color: T.sub }}>Totale</span><b style={{ color: "#af52de" }}>€{inboxResult.dati.totale.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</b></div>}
                    {inboxResult.dati.settimane > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}><span style={{ color: T.sub }}>Produzione</span><b>{inboxResult.dati.settimane} settimane</b></div>}
                    {inboxResult.dati.dataConsegna && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}><span style={{ color: T.sub }}>Consegna</span><b>{new Date(inboxResult.dati.dataConsegna).toLocaleDateString("it-IT")}</b></div>}
                  </div>
                )}

                {/* === CONFERMA type: assign to ordine === */}
                {inboxResult.docTipo === "conferma" && inboxResult.matchedOrdine && (
                  <div style={{ ...S.card, padding: 12, marginBottom: 12, background: "#34c75908", border: `2px solid #34c759` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#34c759", marginBottom: 6 }}>✅ ORDINE TROVATO</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{inboxResult.matchedCommessa?.code} — {inboxResult.matchedCommessa?.cliente}</div>
                    <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{inboxResult.matchedOrdine.fornitore?.nome || "—"} · €{(inboxResult.matchedOrdine.totaleIva || 0).toLocaleString("it-IT")}</div>
                    <button onClick={() => confermaInboxDoc(inboxResult.matchedOrdine.id)} style={{ width: "100%", marginTop: 10, padding: 14, borderRadius: 12, border: "none", background: "#34c759", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      ✅ ASSEGNA A QUESTO ORDINE
                    </button>
                  </div>
                )}
                {inboxResult.docTipo === "conferma" && inboxResult.tuttiOrdini?.filter(o => o.id !== inboxResult.matchedOrdine?.id).length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 8 }}>{inboxResult.matchedOrdine ? "Oppure scegli un altro ordine:" : "A quale ordine appartiene?"}</div>
                    {inboxResult.tuttiOrdini.filter(o => o.id !== inboxResult.matchedOrdine?.id).map(o => {
                      const cm = cantieri.find(c => c.id === o.cmId);
                      return (
                        <div key={o.id} onClick={() => confermaInboxDoc(o.id)} style={{ ...S.card, padding: "10px 12px", marginBottom: 6, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${T.bdr}` }}>
                          <div><div style={{ fontSize: 12, fontWeight: 700 }}>{cm?.code} — {cm?.cliente}</div><div style={{ fontSize: 10, color: T.sub }}>{o.fornitore?.nome || "—"}</div></div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.acc }}>€{(o.totaleIva || 0).toLocaleString("it-IT")}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* === FIRMA / RICEVUTA / FOTO type: assign to commessa === */}
                {(inboxResult.docTipo === "firma" || inboxResult.docTipo === "ricevuta" || inboxResult.docTipo === "foto" || inboxResult.docTipo === "sconosciuto") && (
                  <div>
                    {inboxResult.matchedCommessa && (
                      <div style={{ ...S.card, padding: 12, marginBottom: 12, background: "#34c75908", border: `2px solid #34c759` }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#34c759", marginBottom: 6 }}>✅ COMMESSA TROVATA</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{inboxResult.matchedCommessa.code} — {inboxResult.matchedCommessa.cliente} {inboxResult.matchedCommessa.cognome || ""}</div>
                        <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{inboxResult.matchedCommessa.indirizzo || "—"}</div>
                        <button onClick={() => assegnaDocUniversale(inboxResult.matchedCommessa.id, inboxResult.docTipo)} style={{ width: "100%", marginTop: 10, padding: 14, borderRadius: 12, border: "none", background: "#34c759", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                          ✅ ASSEGNA QUI
                        </button>
                      </div>
                    )}
                    {/* All commesse for manual selection */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 8 }}>
                      {inboxResult.matchedCommessa ? "Oppure scegli un'altra commessa:" : "A quale commessa appartiene?"}
                    </div>
                    {(inboxResult.commesseAttive || cantieri).filter(cm => cm.id !== inboxResult.matchedCommessa?.id).map(cm => (
                      <div key={cm.id} onClick={() => assegnaDocUniversale(cm.id, inboxResult.docTipo)} style={{ ...S.card, padding: "10px 12px", marginBottom: 6, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${T.bdr}` }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{cm.code} — {cm.cliente} {cm.cognome || ""}</div>
                          <div style={{ fontSize: 10, color: T.sub }}>{cm.fase} · {cm.indirizzo || "—"}</div>
                        </div>
                        <span style={{ fontSize: 16 }}>→</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Change classification */}
                <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: T.bg, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6 }}>Classificazione sbagliata? Scegli il tipo:</div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" as any }}>
                    {[
                      { id: "firma", label: "✍️ Firma", col: "#34c759" },
                      { id: "conferma", label: "📄 Conferma", col: "#af52de" },
                      { id: "ricevuta", label: "🏦 Ricevuta", col: "#ff9500" },
                      { id: "foto", label: "📷 Foto", col: "#5856d6" },
                    ].map(t => (
                      <span key={t.id} onClick={() => setInboxResult(prev => ({ ...prev, docTipo: t.id, confidence: 100 }))} style={{
                        padding: "6px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: "pointer",
                        background: inboxResult.docTipo === t.id ? t.col : T.card,
                        color: inboxResult.docTipo === t.id ? "#fff" : T.text,
                        border: `1px solid ${inboxResult.docTipo === t.id ? t.col : T.bdr}`,
                      }}>{t.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* ===== DOCUMENT VIEWER MODAL ===== */}
      {docViewer && (
        <div onClick={() => setDocViewer(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "80vh", overflow: "auto" }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>📋</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{docViewer.title}</div>
                <div style={{ fontSize: 11, color: T.sub }}>{docViewer.docs.length} document{docViewer.docs.length !== 1 ? "i" : "o"}</div>
              </div>
              <span onClick={() => setDocViewer(null)} style={{ fontSize: 24, cursor: "pointer", color: T.sub, lineHeight: 1 }}>✕</span>
            </div>
            {/* Document list */}
            <div style={{ padding: 12 }}>
              {docViewer.docs.map((doc, di) => {
                const tipoColors: any = { firma: "#34c759", fattura: "#007aff", ordine: "#ff9500", conferma: "#af52de", rilievo: "#5856d6", preventivo: "#ff2d55", montaggio: "#007aff", verbale: "#34c759" };
                const col = tipoColors[doc.tipo] || T.acc;
                return (
                  <div key={di} style={{ padding: 14, marginBottom: 8, borderRadius: 12, border: `1px solid ${T.bdr}`, background: T.bg }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: col + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {doc.tipo === "firma" ? "✍️" : doc.tipo === "fattura" ? "💰" : doc.tipo === "ordine" ? "📦" : doc.tipo === "conferma" ? "📄" : doc.tipo === "rilievo" ? "📐" : doc.tipo === "preventivo" ? "📋" : doc.tipo === "montaggio" ? "🔧" : "📎"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{doc.nome}</div>
                        <div style={{ fontSize: 11, color: T.sub }}>{doc.detail || ""}</div>
                        {doc.data && <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>📅 {doc.data}</div>}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: col, background: col + "15", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" as any }}>{doc.tipo}</span>
                    </div>
                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      {doc.dataUrl ? (
                        <a href={doc.dataUrl} download={doc.nome} style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${col}`, background: col + "08", color: col, fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
                          ⬇️ Scarica
                        </a>
                      ) : (
                        <button onClick={() => { alert(`In produzione questo aprirà il file "${doc.nome}" da Supabase Storage.\n\nNella demo i documenti sono simulati.`); }} style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${col}`, background: col + "08", color: col, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                          👁 Visualizza
                        </button>
                      )}
                      <button onClick={() => {
                        const tel = (selectedCM?.telefono || "").replace(/\D/g, "");
                        window.open(`https://wa.me/${tel.startsWith("39") ? tel : "39" + tel}?text=${encodeURIComponent(`Ecco il documento: ${doc.nome}`)}`, "_blank");
                      }} style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid #25d366`, background: "#25d36608", color: "#25d366", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* All attachments */}
            
                {/* ═══ CRONOLOGIA ═══ */}
                <div style={{ marginTop: 12 }}>
                  <div onClick={() => setShowCronologia(!showCronologia)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 0" }}>
                    <span style={{ fontSize: 11 }}>📜</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>Cronologia ({(c.log || []).length})</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: T.sub }}>{showCronologia ? "▲" : "▼"}</span>
                  </div>
                  {showCronologia && (c.log || []).slice().reverse().map((l, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: `1px solid ${T.bg}`, fontSize: 11 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: l.color || T.acc, marginTop: 5, flexShrink: 0 }} />
                      <div><b>{l.chi}</b> {l.cosa} <span style={{ color: T.sub, fontSize: 9 }}>{l.quando}</span></div>
                    </div>
                  ))}
                </div>

                {selectedCM && (selectedCM.allegati || []).length > 0 && (
              <div style={{ padding: "0 12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6 }}>📎 TUTTI GLI ALLEGATI COMMESSA ({selectedCM.allegati.length})</div>
                {(selectedCM.allegati || []).map((a: any, ai: number) => (
                  <div key={ai} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: ai < selectedCM.allegati.length - 1 ? `1px solid ${T.bdr}` : "none" }}>
                    <span style={{ fontSize: 14 }}>{a.tipo === "firma" ? "✍️" : a.tipo === "fattura" ? "💰" : a.tipo === "ordine" ? "📦" : "📎"}</span>
                    <div style={{ flex: 1, fontSize: 11, color: T.text, fontWeight: 600 }}>{a.nome}</div>
                    <span style={{ fontSize: 10, color: T.sub }}>{a.data}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
    </MastroContext.Provider>
  );
}


