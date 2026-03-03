"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — VoiceAssistant v1
// IA Nativa: registra, trascrive, decide dove mettere
// "AI decide, utente corregge solo se sbaglia"
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect } from "react";
import { useMastro } from "./MastroContext";
import { FM, ICO, I } from "./mastro-constants";

// ─── KEYWORD PATTERNS ───
const TIME_WORDS = /\b(domani|dopodomani|luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato|domenica|ore\s?\d|alle\s?\d|mattina|pomeriggio|sera|settimana prossima|oggi pomeriggio)\b/i;
const PROBLEM_WORDS = /\b(rotto|marcio|difett|guast|sostitui|danneggi|crepa|infiltr|muffa|condens|spiffero|rumore|bloccat|non (funziona|chiude|apre|si apre))\b/i;
const ACTION_WORDS = /\b(chiamar[ei]|telefonar[ei]|verificar[ei]|controllar[ei]|misura|ordinar[ei]|confermar[ei]|inviar[ei]|spedir[ei]|preparar[ei]|richiamar[ei])\b/i;
const NAVIGATE_WORDS = /\b(vai|apri|mostra|vedi|visualizza)\s+(commess[ae]|ordini?|agenda|messaggi|clienti|impostazioni)\b/i;
const ORDER_WORDS = /\b(ordina|ordine|ordinare)\s+(materiale|profili|vetri|accessori|ferramenta|guarnizioni)\b/i;
const POSITIVE_WORDS = /\b(content[oia]|soddisfatt[oia]|brav[oia]|perfett[oia]|ottim[oia]|felic[ei]|grazie|compliment)\b/i;
const COMMERCIAL_WORDS = /\b(sconto|prezzo|pagament|acconto|saldo|fattura|preventivo|costo|budget|rata|listino|offerta)\b/i;
const VANO_WORDS = /\b(soggiorno|cucina|camera|bagno|ingresso|corridoio|sala|studio|mansarda|cantina|garage|balcone|finestra|portafinestra|porta)\b/i;

function analyzeVoiceNote(text, context) {
  const result = {
    type: null,    // "task" | "event" | "diary" | "problema"
    priority: "media",
    tag: "nota",
    title: text,
    time: null,
    date: null,
    cmId: context.cmId || null,
    cmCode: context.cmCode || null,
    clienteNome: context.clienteNome || null,
    vano: null,
    confidence: 0,
  };

  // Detect vano
  const vanoMatch = text.match(VANO_WORDS);
  if (vanoMatch) result.vano = vanoMatch[0];

  // Detect time → Calendar event
  const timeMatch = text.match(TIME_WORDS);
  if (timeMatch) {
    result.type = "event";
    result.confidence = 0.8;
    result.time = parseTimeHint(timeMatch[0]);
    result.date = parseDateHint(timeMatch[0]);
  }

  // Detect problem → Urgent task/problema
  if (PROBLEM_WORDS.test(text)) {
    result.type = "task";
    result.priority = "alta";
    result.tag = "problema";
    result.confidence = 0.9;
  }

  // Detect action → Task
  if (ACTION_WORDS.test(text) && !result.type) {
    result.type = "task";
    result.confidence = 0.7;
  }

  // Detect positive → Diary
  if (POSITIVE_WORDS.test(text) && !result.type) {
    result.type = "diary";
    result.tag = "positivo";
    result.confidence = 0.6;
  }

  // Detect commercial → Diary
  if (COMMERCIAL_WORDS.test(text) && result.type !== "task") {
    result.type = "diary";
    result.tag = "commerciale";
    result.confidence = 0.7;
  }

  // Detect "ordina materiale" → task with order context
  if (ORDER_WORDS.test(text)) {
    result.type = "task";
    result.tag = "ordine";
    result.priority = "alta";
    result.confidence = 0.85;
    const matMatch = text.match(ORDER_WORDS);
    if (matMatch) result.materiale = matMatch[2];
  }

  // Detect navigation command
  if (NAVIGATE_WORDS.test(text)) {
    result.type = "navigate";
    const navMatch = text.match(NAVIGATE_WORDS);
    if (navMatch) result.navigateTo = navMatch[2].toLowerCase().replace(/[ei]$/, "");
    result.confidence = 0.9;
  }

  // Default: task
  if (!result.type) {
    result.type = "task";
    result.confidence = 0.5;
  }

  // Try to extract cliente name from text — match full name first, then cognome, then nome
  if (!result.clienteNome && context.contatti) {
    const tLow = text.toLowerCase();
    // Pass 1: full name (nome + cognome) — most specific
    for (const c of context.contatti) {
      const full = ((c.nome || "") + " " + (c.cognome || "")).trim().toLowerCase();
      if (full.length > 3 && tLow.includes(full)) {
        result.clienteNome = (c.nome + " " + (c.cognome || "")).trim();
        result.clienteId = c.id;
        break;
      }
    }
    // Pass 2: cognome only (if unique enough, >3 chars)
    if (!result.clienteNome) {
      for (const c of context.contatti) {
        const cognome = (c.cognome || "").toLowerCase();
        if (cognome.length > 3 && tLow.includes(cognome)) {
          result.clienteNome = (c.nome + " " + c.cognome).trim();
          result.clienteId = c.id;
          break;
        }
      }
    }
    // Pass 3: nome only (if >3 chars and not too common)
    if (!result.clienteNome) {
      for (const c of context.contatti) {
        const nome = (c.nome || "").toLowerCase();
        if (nome.length > 3 && tLow.includes(nome)) {
          result.clienteNome = c.nome + (c.cognome ? " " + c.cognome : "");
          result.clienteId = c.id;
          break;
        }
      }
    }
  }
  
  // Match cantiere by client name
  if (result.clienteNome && context.cantieri) {
    const cm = context.cantieri.find(c => 
      c.cliente && c.cliente.toLowerCase().includes(result.clienteNome.toLowerCase().split(" ")[0])
    );
    if (cm) {
      result.cmId = cm.id;
      result.cmCode = cm.code;
    }
  }

  return result;
}

function parseTimeHint(hint) {
  const oreMatch = hint.match(/ore?\s?(\d{1,2})/i);
  if (oreMatch) return oreMatch[1].padStart(2, "0") + ":00";
  if (/mattina/i.test(hint)) return "09:00";
  if (/pomeriggio/i.test(hint)) return "15:00";
  if (/sera/i.test(hint)) return "19:00";
  return "09:00";
}

function parseDateHint(hint) {
  const d = new Date();
  if (/domani/i.test(hint)) { d.setDate(d.getDate() + 1); }
  else if (/dopodomani/i.test(hint)) { d.setDate(d.getDate() + 2); }
  else if (/settimana prossima/i.test(hint)) { d.setDate(d.getDate() + 7); }
  else {
    const days = { "lunedi": 1, "lunedì": 1, "martedi": 2, "martedì": 2, "mercoledi": 3, "mercoledì": 3, "giovedi": 4, "giovedì": 4, "venerdi": 5, "venerdì": 5, "sabato": 6, "domenica": 0 };
    for (const [name, dow] of Object.entries(days)) {
      if (hint.toLowerCase().includes(name)) {
        const curr = d.getDay();
        let diff = dow - curr;
        if (diff <= 0) diff += 7;
        d.setDate(d.getDate() + diff);
        break;
      }
    }
  }
  return d.toISOString().split("T")[0];
}

// ═══ WAVEFORM VISUALIZER ═══
function Waveform({ active, color }) {
  const [bars, setBars] = useState(Array(7).fill(3));
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setBars(prev => prev.map((_, i) => 3 + Math.sin(Date.now() / 200 + i * 1.2) * 12 + Math.random() * 8));
    }, 80);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 4, height: h, borderRadius: 2, background: color || "#DC4444", transition: "height 0.08s ease" }} />
      ))}
    </div>
  );
}

// ═══ MAIN COMPONENT ═══
export default function VoiceAssistant({ onClose }) {
  const {
    T, S, toast,
    selectedCM, cantieri, contatti, events, tasks,
    setTasks, setEvents, setContatti,
    setTab, setSelectedCM,
  } = useMastro();

  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const recognitionRef = useRef(null);

  // ─── Start Speech Recognition ───
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast("Il browser non supporta il riconoscimento vocale", "red");
      return;
    }

    const recognition = new SR();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      let final = "", interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(final + interim);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      if (e.error === "not-allowed") toast("Microfono non autorizzato", "red");
    };

    recognition.onend = () => {
      // Don't restart, we handle stop manually
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setTranscript("");
    setResult(null);
  };

  // ─── Stop & Process ───
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);

    if (!transcript.trim()) {
      toast("Nessun audio rilevato", "orange");
      return;
    }

    setProcessing(true);

    // Build context
    const context = {
      cmId: selectedCM?.id || null,
      cmCode: selectedCM?.code || null,
      clienteNome: selectedCM?.cliente || null,
      contatti,
      cantieri,
    };

    // Analyze
    const analysis = analyzeVoiceNote(transcript, context);
    setResult(analysis);

    // Execute action
    setTimeout(() => {
      executeAction(analysis);
      setProcessing(false);
    }, 600);
  };

  // ─── Execute the AI decision ───
  const executeAction = (r) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("it-IT", { day: "numeric", month: "short" });

    if (r.type === "event") {
      const newEvent = {
        id: "EV-" + Date.now(),
        text: r.title,
        date: r.date || now.toISOString().split("T")[0],
        time: r.time || "09:00",
        tipo: "altro",
        persona: r.clienteNome || "",
        color: T.acc,
        cmId: r.cmId,
      };
      setEvents(prev => [...prev, newEvent]);
      toast("Evento creato: " + r.title.slice(0, 40), "green");
    }

    else if (r.type === "task") {
      const newTask = {
        id: "TK-" + Date.now(),
        text: r.title,
        done: false,
        priority: r.priority,
        meta: r.cmCode ? r.cmCode + (r.vano ? " · " + r.vano : "") : (r.clienteNome || ""),
        cmId: r.cmId,
        createdAt: now.toISOString(),
      };
      setTasks(prev => [...prev, newTask]);
      const priLabel = r.priority === "alta" ? " (URGENTE)" : "";
      const tagLabel = r.tag === "ordine" ? " 📦" : "";
      toast("Task creata" + priLabel + tagLabel + ": " + r.title.slice(0, 40), r.priority === "alta" ? "error" : "success", () => {
        setTab("agenda");
        onClose();
      });
      // If we found a commessa, auto-navigate
      if (r.cmId && r.tag === "ordine") {
        const cm = cantieri.find(c => c.id === r.cmId);
        if (cm) {
          setTimeout(() => {
            setSelectedCM(cm);
            setTab("commesse");
          }, 1500);
        }
      }
    }

    else if (r.type === "navigate") {
      const tabMap = { "commess": "commesse", "ordini": "commesse", "ordine": "commesse", "agenda": "agenda", "messagg": "messaggi", "client": "clienti", "impostazion": "impostazioni" };
      const targetTab = Object.entries(tabMap).find(([k]) => (r.navigateTo || "").includes(k));
      if (targetTab) {
        setTab(targetTab[1]);
        toast("Apro " + targetTab[1], "success");
      }
      // If client found, open their commessa
      if (r.cmId) {
        const cm = cantieri.find(c => c.id === r.cmId);
        if (cm) {
          setSelectedCM(cm);
          setTab("commesse");
          toast("Apro commessa " + cm.code + " — " + cm.cliente, "success");
        }
      }
      setTimeout(() => onClose(), 800);
      return;
    }

    else if (r.type === "diary") {
      // Add to client diary if we know the client
      if (r.clienteNome) {
        const cliente = contatti.find(c =>
          (c.nome + " " + (c.cognome || "")).trim().toLowerCase() === r.clienteNome.toLowerCase() ||
          c.nome.toLowerCase() === r.clienteNome.toLowerCase()
        );
        if (cliente) {
          const entry = { id: "D-" + Date.now(), data: dateStr, testo: r.title, tag: r.tag };
          const updatedDiario = [entry, ...(cliente.diario || [])];
          setContatti(prev => prev.map(x => x.id === cliente.id ? { ...x, diario: updatedDiario } : x));
          toast("Diario " + cliente.nome + ": " + r.title.slice(0, 30), "green");
          return;
        }
      }
      // Fallback: create task instead
      const newTask = { id: "TK-" + Date.now(), text: r.title, done: false, priority: "media", meta: r.clienteNome || "Nota vocale", cmId: r.cmId, createdAt: now.toISOString() };
      setTasks(prev => [...prev, newTask]);
      toast("Nota salvata come task: " + r.title.slice(0, 40), "green");
    }
  };

  // ─── Type labels ───
  const typeLabel = { task: "Task", event: "Evento", diary: "Diario", problema: "Problema", navigate: "Navigazione" };
  const typeColor = { task: T.acc, event: T.blue || "#3B7FE0", diary: "#6B7280", problema: T.red, navigate: "#1A9E73" };
  const tagColors2 = { ordine: "#E8A020", problema: T.red, positivo: "#1A9E73", commerciale: T.blue || "#3B7FE0" };
  const tagColors = { nota: "#6B7280", attenzione: "#E8A020", positivo: T.grn || "#0D7C6B", commerciale: T.blue || "#3B7FE0", problema: T.red };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>

      {/* Close */}
      <div onClick={() => { if (recognitionRef.current) recognitionRef.current.stop(); onClose(); }}
        style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <I d={ICO.x} s={18} c="rgba(255,255,255,0.6)" />
      </div>

      {/* Status */}
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
        {recording ? "Sto ascoltando..." : processing ? "Analizzo..." : result ? "Fatto!" : "Premi per parlare"}
      </div>

      {/* Waveform / Mic button */}
      {!recording && !processing && !result && (
        <div onClick={startRecording}
          style={{ width: 80, height: 80, borderRadius: 40, background: T.red || "#DC4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 0 30px rgba(220,68,68,0.4)" }}>
          <I d={ICO.mic} s={32} c="#fff" />
        </div>
      )}

      {recording && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Waveform active={true} color="#DC4444" />
          <div onClick={stopRecording}
            style={{ width: 64, height: 64, borderRadius: 32, background: "#DC4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 0 30px rgba(220,68,68,0.5)" }}>
            <div style={{ width: 20, height: 20, borderRadius: 3, background: "#fff" }} />
          </div>
        </div>
      )}

      {processing && (
        <div style={{ width: 64, height: 64, borderRadius: 32, background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1s infinite" }}>
          <I d={ICO.sparkles} s={28} c="#fff" />
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div style={{ marginTop: 24, maxWidth: 320, textAlign: "center" }}>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>
            "{transcript}"
          </div>
        </div>
      )}

      {/* Result */}
      {result && !processing && (
        <div style={{ marginTop: 24, background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, maxWidth: 320, width: "100%" }}>
          {/* Type badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ padding: "3px 10px", borderRadius: 6, background: (typeColor[result.type] || T.acc) + "30", color: typeColor[result.type] || T.acc, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
              {typeLabel[result.type] || result.type}
            </span>
            {result.priority === "alta" && (
              <span style={{ padding: "3px 8px", borderRadius: 6, background: T.red + "30", color: T.red, fontSize: 10, fontWeight: 700 }}>URGENTE</span>
            )}
            {result.tag !== "nota" && (
              <span style={{ padding: "3px 8px", borderRadius: 6, background: (tagColors[result.tag] || "#666") + "30", color: tagColors[result.tag] || "#666", fontSize: 10, fontWeight: 700 }}>
                {result.tag}
              </span>
            )}
          </div>

          {/* Details */}
          {result.cmCode && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>📂 {result.cmCode}</div>
          )}
          {result.clienteNome && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>👤 {result.clienteNome}</div>
          )}
          {result.vano && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>🪟 Vano: {result.vano}</div>
          )}
          {result.type === "event" && result.date && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>📅 {result.date} {result.time && "· " + result.time}</div>
          )}

          {/* Confidence */}
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }}>
              <div style={{ height: 3, borderRadius: 2, background: result.confidence > 0.7 ? "#10B981" : result.confidence > 0.5 ? "#E8A020" : T.red, width: (result.confidence * 100) + "%", transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{Math.round(result.confidence * 100)}%</span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <div onClick={() => { if (recognitionRef.current) recognitionRef.current.stop(); onClose(); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: T.acc, color: "#fff", textAlign: "center", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              OK
            </div>
            <div onClick={() => { setResult(null); setTranscript(""); setProcessing(false); }}
              style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", textAlign: "center", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Riprova
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
