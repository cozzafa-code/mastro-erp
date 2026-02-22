"use client";
// @ts-nocheck
// components/MastroERP.tsx
// MASTRO ERP — adattato per Next.js + Supabase
'use client'
import { useState, useRef, useCallback, useEffect } from "react";

/* ═══════════════════════════════════════════════════════
   MASTRO MISURE — v15 COMPLETE REBUILD
   Tutte le feature recuperate + design Apple chiaro
   ═══════════════════════════════════════════════════════ */

const FONT = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;600&display=swap";
const FF = "'Plus Jakarta Sans',sans-serif";
const FM = "'JetBrains Mono',monospace";

/* ── TEMI ── */
const THEMES = {
  chiaro: {
    name: "Chiaro", emoji: "☀️",
    bg: "#f5f5f7", bg2: "#ffffff", card: "#ffffff", card2: "#f8f8fa",
    bdr: "#e5e5ea", bdrL: "#d1d1d6", text: "#1d1d1f", sub: "#86868b", sub2: "#aeaeb2",
    acc: "#0066cc", accD: "#0055aa", accLt: "rgba(0,102,204,0.08)", accBg: "linear-gradient(135deg,#0066cc,#0055aa)",
    grn: "#34c759", grnLt: "rgba(52,199,89,0.08)",
    red: "#ff3b30", redLt: "rgba(255,59,48,0.08)",
    orange: "#ff9500", orangeLt: "rgba(255,149,0,0.08)",
    blue: "#007aff", blueLt: "rgba(0,122,255,0.08)",
    purple: "#af52de", purpleLt: "rgba(175,82,222,0.08)",
    cyan: "#32ade6", cyanLt: "rgba(50,173,230,0.08)",
    cardSh: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    cardShH: "0 4px 12px rgba(0,0,0,0.08)",
    r: 12, r2: 16
  },
  scuro: {
    name: "Scuro", emoji: "🌙",
    bg: "#000000", bg2: "#1c1c1e", card: "#1c1c1e", card2: "#2c2c2e",
    bdr: "#38383a", bdrL: "#48484a", text: "#f2f2f7", sub: "#8e8e93", sub2: "#636366",
    acc: "#0a84ff", accD: "#0070e0", accLt: "rgba(10,132,255,0.12)", accBg: "linear-gradient(135deg,#0a84ff,#0070e0)",
    grn: "#30d158", grnLt: "rgba(48,209,88,0.12)",
    red: "#ff453a", redLt: "rgba(255,69,58,0.12)",
    orange: "#ff9f0a", orangeLt: "rgba(255,159,10,0.12)",
    blue: "#0a84ff", blueLt: "rgba(10,132,255,0.12)",
    purple: "#bf5af2", purpleLt: "rgba(191,90,242,0.12)",
    cyan: "#64d2ff", cyanLt: "rgba(100,210,255,0.12)",
    cardSh: "0 1px 3px rgba(0,0,0,0.3)",
    cardShH: "0 4px 12px rgba(0,0,0,0.4)",
    r: 12, r2: 16
  },
  oceano: {
    name: "Oceano", emoji: "🌊",
    bg: "#0f1923", bg2: "#162231", card: "#1a2a3a", card2: "#1f3040",
    bdr: "#2a3f55", bdrL: "#345070", text: "#e8ecf0", sub: "#7a90a5", sub2: "#4a6070",
    acc: "#4fc3f7", accD: "#29b6f6", accLt: "rgba(79,195,247,0.12)", accBg: "linear-gradient(135deg,#4fc3f7,#29b6f6)",
    grn: "#66bb6a", grnLt: "rgba(102,187,106,0.12)",
    red: "#ef5350", redLt: "rgba(239,83,80,0.12)",
    orange: "#ffa726", orangeLt: "rgba(255,167,38,0.12)",
    blue: "#42a5f5", blueLt: "rgba(66,165,245,0.12)",
    purple: "#ab47bc", purpleLt: "rgba(171,71,188,0.12)",
    cyan: "#26c6da", cyanLt: "rgba(38,198,218,0.12)",
    cardSh: "0 1px 3px rgba(0,0,0,0.25)",
    cardShH: "0 4px 12px rgba(0,0,0,0.35)",
    r: 12, r2: 16
  }
};

/* ── PIPELINE 7+1 FASI ── */
const PIPELINE_DEFAULT = [
  { id: "sopralluogo", nome: "Sopralluogo", ico: "🔍", color: "#007aff", attiva: true },
  { id: "preventivo", nome: "Preventivo", ico: "📋", color: "#ff9500", attiva: true },
  { id: "conferma", nome: "Conferma", ico: "✍️", color: "#af52de", attiva: true },
  { id: "misure", nome: "Misure", ico: "📐", color: "#5856d6", attiva: true },
  { id: "ordini", nome: "Ordini", ico: "📦", color: "#ff2d55", attiva: true },
  { id: "produzione", nome: "Produzione", ico: "🏭", color: "#ff9500", attiva: true },
  { id: "posa", nome: "Posa", ico: "🔧", color: "#34c759", attiva: true },
  { id: "chiusura", nome: "Chiusura", ico: "✅", color: "#30b0c7", attiva: true },
];

/* ── DATI DEMO ── */
const CANTIERI_INIT = [
  { id: 1, code: "S-0004", cliente: "Fabio", cognome: "Cozza", indirizzo: "Via Gabriele Barrio 12, Cosenza", fase: "sopralluogo",
    sistema: "Schüco CT70", tipo: "nuova", telefono: "338 1234567",
    difficoltaSalita: "media", mezzoSalita: "Scala interna", pianoEdificio: "P2 — 2° Piano", foroScale: "80×200",
    note: "Attenzione: muro portante in soggiorno. Portare spessimetro.",
    allegati: [], creato: "15 Feb", aggiornato: "oggi",
    vani: [
      { id: 1, nome: "Cucina", tipo: "F2A", stanza: "Cucina", piano: "PT",
        sistema: "Schüco CT70", vetro: "4/16/4 Basso-emissivo", coloreInt: "RAL 9010", coloreEst: "RAL 9010", bicolore: false, coloreAcc: "RAL 9010",
        telaio: "Z", telaioAlaZ: "35", rifilato: true, rifilSx: "10", rifilDx: "10", rifilSopra: "5", rifilSotto: "0",
        coprifilo: "CP40", lamiera: "LD200",
        misure: { lAlto: 1202, lCentro: 1198, lBasso: 1195, hSx: 1402, hCentro: 1400, hDx: 1398, d1: 1825, d2: 1823, spSx: 120, spDx: 115, spSopra: 80, imbotte: 180, davInt: 200, davEst: 50, davProf: 200, davSporg: 40, soglia: 0 },
        cassonetto: true, casH: 250, casP: 300,
        accessori: { tapparella: { attivo: true, colore: "RAL 9010", l: 1240, h: 1650 }, persiana: { attivo: false }, zanzariera: { attivo: true, colore: "RAL 9010", l: 1180, h: 1370 } },
        foto: {}, note: "Muro portante lato sinistro — spalletta ridotta di 5mm rispetto destra" },
      { id: 2, nome: "Salone PF", tipo: "PF2A", stanza: "Soggiorno", piano: "PT",
        sistema: "Schüco CT70", vetro: "6/16/6", coloreInt: "RAL 9010", coloreEst: "RAL 7016", bicolore: true, coloreAcc: "Come profili",
        telaio: "L", telaioAlaZ: "", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "",
        coprifilo: "CP50", lamiera: "LD250",
        misure: { lAlto: 1405, lCentro: 1402, lBasso: 1400, hSx: 2202, hCentro: 2200, hDx: 2198, d1: 2616, d2: 2626, spSx: 150, spDx: 150, spSopra: 90, imbotte: 200, davInt: 0, davEst: 0, davProf: 0, davSporg: 0, soglia: 15 },
        cassonetto: false, casH: 0, casP: 0,
        accessori: { tapparella: { attivo: true, colore: "RAL 7016", l: 1440, h: 2450 }, persiana: { attivo: true, l: 1402, h: 2200, colore: "RAL 7016" }, zanzariera: { attivo: true, colore: "RAL 9010", l: 1390, h: 2190 } },
        foto: {}, note: "Fuori squadra 10mm — verificare architrave. Soglia esistente da mantenere h=15mm" },
      { id: 3, nome: "Camera F1A", tipo: "F1A", stanza: "Camera", piano: "P1",
        sistema: "Schüco CT70", vetro: "4/16/4 Basso-emissivo", coloreInt: "RAL 9010", coloreEst: "RAL 9010", bicolore: false, coloreAcc: "RAL 9010",
        telaio: "Z", telaioAlaZ: "35", rifilato: true, rifilSx: "8", rifilDx: "8", rifilSopra: "5", rifilSotto: "0",
        coprifilo: "CP40", lamiera: "LD200",
        misure: { lAlto: 900, lCentro: 898, lBasso: 900, hSx: 1202, hCentro: 1200, hDx: 1200, d1: 1505, d2: 1504, spSx: 100, spDx: 100, spSopra: 75, imbotte: 160, davInt: 180, davEst: 40, davProf: 180, davSporg: 35, soglia: 0 },
        cassonetto: true, casH: 220, casP: 280,
        accessori: { tapparella: { attivo: true, colore: "RAL 9010", l: 935, h: 1420 }, persiana: { attivo: false }, zanzariera: { attivo: true, colore: "RAL 9010", l: 880, h: 1170 } },
        foto: {}, note: "" },
      { id: 4, nome: "Bagno VAS", tipo: "VAS", stanza: "Bagno", piano: "P1",
        sistema: "Schüco CT70", vetro: "Acidato", coloreInt: "RAL 9010", coloreEst: "RAL 9010", bicolore: false, coloreAcc: "RAL 9010",
        telaio: "Z", telaioAlaZ: "35", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "",
        coprifilo: "CP40", lamiera: "",
        misure: { lAlto: 702, lCentro: 700, lBasso: 700, hSx: 502, hCentro: 500, hDx: 500, d1: 862, d2: 861, spSx: 95, spDx: 95, spSopra: 70, imbotte: 150, davInt: 150, davEst: 30, davProf: 150, davSporg: 25, soglia: 0 },
        cassonetto: false, casH: 0, casP: 0,
        accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } },
        foto: {}, note: "Vetro acidato per privacy" },
      { id: 5, nome: "Salone SC2A", tipo: "SC2A", stanza: "Soggiorno", piano: "PT",
        sistema: "Schüco ASS80", vetro: "6/16/6", coloreInt: "RAL 9010", coloreEst: "RAL 7016", bicolore: true, coloreAcc: "Come profili",
        telaio: "", telaioAlaZ: "", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "",
        coprifilo: "", lamiera: "",
        misure: { lAlto: 2402, lCentro: 2400, lBasso: 2398, hSx: 2202, hCentro: 2200, hDx: 2200, d1: 3204, d2: 3202, spSx: 160, spDx: 160, spSopra: 100, imbotte: 220, davInt: 0, davEst: 0, davProf: 0, davSporg: 0, soglia: 20 },
        cassonetto: false, casH: 0, casP: 0,
        accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: true, colore: "RAL 9010", l: 2390, h: 2190 } },
        foto: {}, note: "Alzante scorrevole — verificare spazio binario a pavimento min 30mm" },
    ],
    log: [
      { chi: "Fabio", cosa: "completato vano Bagno VAS", quando: "Oggi, 11:45", color: "#007aff" },
      { chi: "Fabio", cosa: "completato misure Salone SC2A", quando: "Oggi, 11:20", color: "#007aff" },
      { chi: "Fabio", cosa: "completato misure Camera F1A", quando: "Oggi, 10:50", color: "#34c759" },
      { chi: "Fabio", cosa: "completato misure Salone PF — ATTENZIONE fuori squadra 10mm", quando: "Oggi, 10:10", color: "#ff3b30" },
      { chi: "Fabio", cosa: "completato misure Cucina F2A", quando: "Oggi, 09:30", color: "#34c759" },
      { chi: "Fabio", cosa: "iniziato sopralluogo", quando: "Oggi, 09:00", color: "#ff9500" },
    ]
  },
  { id: 2, code: "CM-0002", cliente: "Teresa", cognome: "Bruno", indirizzo: "Via Roma 45, Rende", fase: "ordini",
    sistema: "Rehau S80", tipo: "nuova", telefono: "347 9876543",
    difficoltaSalita: "facile", mezzoSalita: "Scala a mano", pianoEdificio: "P1 — 1° Piano", foroScale: "85×200",
    note: "Cliente preferisce colori chiari. Confermare campioni RAL prima dell'ordine.",
    allegati: [], creato: "10 Feb", aggiornato: "16 Feb",
    vani: [
      { id: 1, nome: "Bagno VAS", tipo: "VAS", stanza: "Bagno", piano: "P1",
        sistema: "Rehau S80", vetro: "Acidato Privacy", coloreInt: "RAL 9010", coloreEst: "RAL 9010", bicolore: false, coloreAcc: "RAL 9010",
        telaio: "Z", telaioAlaZ: "30", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "",
        coprifilo: "CP40", lamiera: "",
        misure: { lAlto: 702, lCentro: 700, lBasso: 700, hSx: 502, hCentro: 500, hDx: 500, d1: 862, d2: 861, spSx: 90, spDx: 90, spSopra: 65, imbotte: 140, davInt: 140, davEst: 25, davProf: 140, davSporg: 20, soglia: 0 },
        cassonetto: false, casH: 0, casP: 0,
        accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } },
        foto: {}, note: "Vetro acidato per privacy" },
      { id: 2, nome: "Studio F2A", tipo: "F2A", stanza: "Studio", piano: "PT",
        sistema: "Rehau S80", vetro: "4/16/4 Low-E", coloreInt: "RAL 9010", coloreEst: "RAL 9010", bicolore: false, coloreAcc: "RAL 9010",
        telaio: "Z", telaioAlaZ: "35", rifilato: true, rifilSx: "12", rifilDx: "12", rifilSopra: "8", rifilSotto: "0",
        coprifilo: "CP40", lamiera: "LD200",
        misure: { lAlto: 1002, lCentro: 998, lBasso: 1000, hSx: 1202, hCentro: 1200, hDx: 1198, d1: 1562, d2: 1561, spSx: 110, spDx: 108, spSopra: 75, imbotte: 165, davInt: 190, davEst: 45, davProf: 190, davSporg: 38, soglia: 0 },
        cassonetto: true, casH: 230, casP: 280,
        accessori: { tapparella: { attivo: true, colore: "RAL 7016", l: 1038, h: 1430 }, persiana: { attivo: false }, zanzariera: { attivo: true, colore: "RAL 9010", l: 975, h: 1170 } },
        foto: {}, note: "Doppio vetro richiesto — verificare U value < 1.0" },
      { id: 3, nome: "Ingresso BLI", tipo: "BLI", stanza: "Ingresso", piano: "PT",
        sistema: "Schüco ADS75", vetro: "Blindato P4", coloreInt: "RAL 9010", coloreEst: "RAL 7016", bicolore: true, coloreAcc: "RAL 7016",
        telaio: "L", telaioAlaZ: "", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "",
        coprifilo: "CP60", lamiera: "LD300",
        misure: { lAlto: 902, lCentro: 900, lBasso: 900, hSx: 2102, hCentro: 2100, hDx: 2100, d1: 2287, d2: 2286, spSx: 130, spDx: 130, spSopra: 90, imbotte: 180, davInt: 0, davEst: 0, davProf: 0, davSporg: 0, soglia: 20 },
        cassonetto: false, casH: 0, casP: 0,
        accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } },
        foto: {}, note: "Porta blindata classe 4 — soglia piatta h=20mm" },
      { id: 4, nome: "Cameretta SC2A", tipo: "SC2A", stanza: "Camera", piano: "P1",
        sistema: "Rehau S80", vetro: "4/16/4 Low-E", coloreInt: "RAL 9010", coloreEst: "RAL 9010", bicolore: false, coloreAcc: "RAL 9010",
        telaio: "", telaioAlaZ: "", rifilato: true, rifilSx: "10", rifilDx: "10", rifilSopra: "5", rifilSotto: "0",
        coprifilo: "CP40", lamiera: "LD200",
        misure: { lAlto: 1602, lCentro: 1600, lBasso: 1598, hSx: 1402, hCentro: 1400, hDx: 1400, d1: 2136, d2: 2135, spSx: 120, spDx: 120, spSopra: 80, imbotte: 170, davInt: 180, davEst: 40, davProf: 180, davSporg: 35, soglia: 0 },
        cassonetto: false, casH: 0, casP: 0,
        accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: true, colore: "RAL 9010", l: 1585, h: 1380 } },
        foto: {}, note: "Scorrevole 2 ante — verificare guide a pavimento" },
    ],
    log: [
      { chi: "Fabio", cosa: "avanzato a Ordine", quando: "16 Feb, 11:00", color: "#ff2d55" },
      { chi: "Fabio", cosa: "completato tutte le misure", quando: "15 Feb, 16:30", color: "#34c759" },
      { chi: "Fabio", cosa: "creato la commessa", quando: "10 Feb, 08:00", color: "#86868b" },
    ]},
  { id: 3, code: "CM-0003", cliente: "Mario Ferraro", indirizzo: "Via Gabriele Barrio, Cosenza", fase: "sopralluogo", vani: [
    { id: 1, nome: "Sala", tipo: "Scorrevole", stanza: "Soggiorno", piano: "PT", misure: {}, foto: {}, note: "", accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } } },
  ], sistema: "", tipo: "riparazione", telefono: "", mezzoSalita: "", allegati: [], creato: "12 Feb", aggiornato: "12 Feb", alert: "Sopralluogo oggi", log: [] },
  { id: 4, code: "CM-0001", cliente: "Antonio Rossi", indirizzo: "Via G. Barrio, 8", fase: "sopralluogo", vani: [], sistema: "", tipo: "nuova", telefono: "333 7654321", mezzoSalita: "", allegati: [], creato: "8 Feb", aggiornato: "8 Feb", alert: "Nessun vano inserito", log: [] },
];

const TASKS_INIT = [
  { id: 1, text: "Sopralluogo Via G. Barrio", meta: "Portare metro laser + modulo", time: "09:00", priority: "alta", cm: "CM-0003", done: false },
  { id: 2, text: "Inserire misure vani CM-0001", meta: "Cliente aspetta preventivo", time: "", priority: "media", cm: "CM-0001", done: false },
  { id: 3, text: "Chiamare fornitore Schüco", meta: "Confermare data consegna ordine", time: "15:00", priority: "bassa", cm: "CM-0002", done: false },
  { id: 4, text: "Comprare viti inox 5x60", meta: "Brico — fatto", time: "08:00", priority: "bassa", cm: "", done: true },
];

const MSGS_INIT = [
  { id: 1, from: "Fornitore Schüco", preview: "Conferma ordine #4521 — materiale pronto per spedizione il 20/02", time: "14:32", cm: "CM-0002", read: false, canale: "email", thread: [
    { who: "Tu", text: "Buongiorno, stato ordine #4521?", time: "09:15", date: "18/02", canale: "email" },
    { who: "Fornitore Schüco", text: "Ordine in lavorazione, consegna prevista 20/02", time: "10:40", date: "18/02", canale: "email" },
    { who: "Tu", text: "Perfetto, confermate anche le maniglie satinate?", time: "11:05", date: "18/02", canale: "email" },
    { who: "Fornitore Schüco", text: "Conferma ordine #4521 — materiale pronto per spedizione il 20/02. Maniglie satinate incluse.", time: "14:32", date: "19/02", canale: "email" },
  ]},
  { id: 2, from: "Mario (posatore)", preview: "Fabio, per la CM-0004 servono i controtelai speciali?", time: "12:15", cm: "CM-0004", read: false, canale: "whatsapp", thread: [
    { who: "Mario", text: "Ciao Fabio, domani vado a posare CM-0004", time: "08:30", date: "19/02", canale: "whatsapp" },
    { who: "Tu", text: "Ok Mario, ricordati il silicone neutro", time: "08:45", date: "19/02", canale: "whatsapp" },
    { who: "Mario", text: "Fabio, per la CM-0004 servono i controtelai speciali?", time: "12:15", date: "19/02", canale: "whatsapp" },
  ]},
  { id: 3, from: "Cliente Rossi", preview: "Grazie per il preventivo, procediamo con l'ordine", time: "Ieri", cm: "CM-0001", read: true, canale: "sms", thread: [
    { who: "Tu", text: "Buongiorno Sig. Rossi, in allegato il preventivo per la sostituzione dei 5 infissi.", time: "16:00", date: "17/02", canale: "email" },
    { who: "Cliente Rossi", text: "Grazie per il preventivo, procediamo con l'ordine", time: "09:30", date: "18/02", canale: "sms" },
  ]},
  { id: 4, from: "Vetreria Milano", preview: "Vetri tripli pronti per il ritiro", time: "11:00", cm: "CM-0002", read: false, canale: "telegram", thread: [
    { who: "Vetreria Milano", text: "Vetri tripli pronti per il ritiro. Magazzino aperto fino alle 17.", time: "11:00", date: "19/02", canale: "telegram" },
  ]},
  { id: 5, from: "Teresa Bruno", preview: "Quando iniziate i lavori?", time: "Ieri", cm: "CM-0002", read: true, canale: "whatsapp", thread: [
    { who: "Teresa Bruno", text: "Buongiorno, quando iniziate i lavori a casa mia?", time: "15:00", date: "18/02", canale: "whatsapp" },
    { who: "Tu", text: "Buongiorno signora Bruno, prevediamo di iniziare la prossima settimana", time: "15:30", date: "18/02", canale: "whatsapp" },
    { who: "Teresa Bruno", text: "Quando iniziate i lavori?", time: "10:00", date: "19/02", canale: "sms" },
  ]},
];

const TEAM_INIT = [
  { id: 1, nome: "Fabio Cozza", ruolo: "Titolare", compiti: "Gestione commesse, preventivi, rapporti clienti", colore: "#007aff" },
  { id: 2, nome: "Marco Ferraro", ruolo: "Posatore", compiti: "Sopralluoghi, misure, installazione", colore: "#34c759" },
  { id: 3, nome: "Sara Greco", ruolo: "Ufficio", compiti: "Ordini, contabilità, assistenza clienti", colore: "#af52de" },
];

const CONTATTI_INIT = [
  { id: 1, nome: "Giuseppe Rossi", tipo: "cliente", tel: "347 1234567", email: "rossi@email.it", preferito: true, canali: ["whatsapp", "email"], cm: "CM-0001" },
  { id: 2, nome: "Teresa Bruno", tipo: "cliente", tel: "338 9876543", email: "bruno@pec.it", preferito: true, canali: ["whatsapp", "sms"], cm: "CM-0002" },
  { id: 3, nome: "Lucia Ferraro", tipo: "cliente", tel: "333 4567890", email: "", preferito: false, canali: ["whatsapp"], cm: "CM-0003" },
  { id: 4, nome: "Antonio Mancini", tipo: "cliente", tel: "340 1112233", email: "mancini@gmail.com", preferito: false, canali: ["whatsapp", "email"], cm: "CM-0004" },
  { id: 5, nome: "Fornitore Schüco", tipo: "fornitore", tel: "0984 123456", email: "ordini@schuco.it", preferito: true, canali: ["email", "telegram"], cm: "" },
  { id: 6, nome: "Vetreria Milano", tipo: "fornitore", tel: "02 9876543", email: "info@vetreriami.it", preferito: true, canali: ["email", "telegram"], cm: "" },
  { id: 7, nome: "Ferramenta Cosenza", tipo: "fornitore", tel: "0984 555666", email: "ordini@ferracosenza.it", preferito: false, canali: ["email", "whatsapp"], cm: "" },
  { id: 8, nome: "Geom. Calabrò", tipo: "professionista", tel: "339 7778899", email: "calabro@studio.it", preferito: false, canali: ["email", "whatsapp"], cm: "" },
];

const COLORI_INIT = [
  { id: 1, nome: "Bianco", code: "RAL 9010", hex: "#f5f5f0", tipo: "RAL" },
  { id: 2, nome: "Grigio antracite", code: "RAL 7016", hex: "#383e42", tipo: "RAL" },
  { id: 3, nome: "Nero", code: "RAL 9005", hex: "#0e0e10", tipo: "RAL" },
  { id: 4, nome: "Marrone", code: "RAL 8014", hex: "#4a3728", tipo: "RAL" },
  { id: 5, nome: "Noce", code: "Noce", hex: "#6b4226", tipo: "Legno" },
  { id: 6, nome: "Rovere", code: "Rovere", hex: "#a0784a", tipo: "Legno" },
];

const SISTEMI_INIT = [
  { id: 1, marca: "Aluplast", sistema: "Ideal 4000", euroMq: 180, prezzoMq: 180, sovRAL: 12, sovLegno: 22, colori: ["RAL 9010", "RAL 7016", "RAL 9005", "Noce"], sottosistemi: ["Classicline", "Roundline"] },
  { id: 2, marca: "Schüco", sistema: "CT70", euroMq: 280, prezzoMq: 280, sovRAL: 15, sovLegno: 25, colori: ["RAL 9010", "RAL 7016", "RAL 9005"], sottosistemi: ["Classic", "Rondo"] },
  { id: 3, marca: "Rehau", sistema: "S80", euroMq: 220, prezzoMq: 220, sovRAL: 12, sovLegno: 20, colori: ["RAL 9010", "RAL 7016", "Noce"], sottosistemi: ["Geneo", "Synego"] },
  { id: 4, marca: "Finstral", sistema: "FIN-Project", euroMq: 350, prezzoMq: 350, sovRAL: 18, sovLegno: 30, colori: ["RAL 9010", "RAL 7016", "RAL 9005", "Rovere"], sottosistemi: ["Nova-line", "Step-line"] },
];

const VETRI_INIT = [
  { id: 1, nome: "Doppio basso emissivo", code: "4/16/4 BE", ug: 1.1, prezzoMq: 45 },
  { id: 2, nome: "Triplo basso emissivo", code: "4/12/4/12/4 BE", ug: 0.6, prezzoMq: 75 },
  { id: 3, nome: "Doppio sicurezza", code: "33.1/16/4 BE", ug: 1.1, prezzoMq: 65 },
  { id: 4, nome: "Triplo sicurezza", code: "33.1/12/4/12/4 BE", ug: 0.6, prezzoMq: 90 },
  { id: 5, nome: "Satinato", code: "4/16/4 SAT", ug: 1.1, prezzoMq: 55 },
  { id: 6, nome: "Fonoisolante", code: "44.2/20/6 BE", ug: 1.0, prezzoMq: 110 },
];

const TIPOLOGIE_RAPIDE = [
  // Finestre
  { code: "F1A",    label: "Finestra 1 anta",           icon: "🪟", cat: "Finestre" },
  { code: "F2A",    label: "Finestra 2 ante",            icon: "🪟", cat: "Finestre" },
  { code: "F3A",    label: "Finestra 3 ante",            icon: "🪟", cat: "Finestre" },
  { code: "F4A",    label: "Finestra 4 ante",            icon: "🪟", cat: "Finestre" },
  { code: "F2AFISDX", label: "Finestra 2A + Fisso DX",  icon: "🪟", cat: "Finestre" },
  { code: "F2AFISSX", label: "Finestra 2A + Fisso SX",  icon: "🪟", cat: "Finestre" },
  { code: "FISDX",  label: "Fisso DX",                  icon: "▮",  cat: "Finestre" },
  { code: "FISSX",  label: "Fisso SX",                  icon: "▮",  cat: "Finestre" },
  { code: "VAS",    label: "Vasistas",                  icon: "⬇",  cat: "Finestre" },
  { code: "RIBALTA",label: "Ribalta",                   icon: "⬆",  cat: "Finestre" },
  // Balconi / Portafinestre
  { code: "PF1A",   label: "Balcone 1 anta",            icon: "🚪", cat: "Balconi" },
  { code: "PF2A",   label: "Balcone 2 ante",            icon: "🚪", cat: "Balconi" },
  { code: "PF3A",   label: "Balcone 3 ante",            icon: "🚪", cat: "Balconi" },
  { code: "PF4A",   label: "Balcone 4 ante",            icon: "🚪", cat: "Balconi" },
  { code: "PF2AFISDX", label: "Balcone 2A + Fisso DX", icon: "🚪", cat: "Balconi" },
  { code: "PF2AFISSX", label: "Balcone 2A + Fisso SX", icon: "🚪", cat: "Balconi" },
  // Scorrevoli / Alzanti
  { code: "SC2A",   label: "Scorrevole 2 ante",         icon: "↔️", cat: "Scorrevoli" },
  { code: "SC4A",   label: "Scorrevole 4 ante",         icon: "↔️", cat: "Scorrevoli" },
  { code: "SCRDX",  label: "Scorrevole DX",             icon: "▶",  cat: "Scorrevoli" },
  { code: "SCRSX",  label: "Scorrevole SX",             icon: "◀",  cat: "Scorrevoli" },
  { code: "ALZDX",  label: "Alzante DX",                icon: "⬆",  cat: "Scorrevoli" },
  { code: "ALZSX",  label: "Alzante SX",                icon: "⬆",  cat: "Scorrevoli" },
  // Persiane
  { code: "PERS1A", label: "Persiana 1 anta",           icon: "🌂", cat: "Persiane" },
  { code: "PERS2A", label: "Persiana 2 ante",           icon: "🌂", cat: "Persiane" },
  { code: "TAPP",   label: "Tapparella",                icon: "⬇",  cat: "Persiane" },
  { code: "ZANZ",   label: "Zanzariera",                icon: "🕸",  cat: "Persiane" },
  // Altro
  { code: "SOPR",   label: "Sopraluce",                 icon: "△",  cat: "Altro" },
  { code: "MONO",   label: "Monoblocco",                icon: "⬜",  cat: "Altro" },
  { code: "BLI",    label: "Porta blindata",            icon: "🛡",  cat: "Altro" },
];

const COPRIFILI_INIT = [
  { id: 1, nome: "Coprifilo piatto 40mm", cod: "CP40", prezzoMl: 4.5 },
  { id: 2, nome: "Coprifilo piatto 50mm", cod: "CP50", prezzoMl: 5.5 },
  { id: 3, nome: "Coprifilo piatto 70mm", cod: "CP70", prezzoMl: 7.0 },
  { id: 4, nome: "Coprifilo angolare 40mm", cod: "CA40", prezzoMl: 5.0 },
  { id: 5, nome: "Coprifilo a Z 50mm", cod: "CZ50", prezzoMl: 6.0 },
];

const LAMIERE_INIT = [
  { id: 1, nome: "Lamiera davanzale 200mm", cod: "LD200", prezzoMl: 8.0 },
  { id: 2, nome: "Lamiera davanzale 250mm", cod: "LD250", prezzoMl: 9.5 },
  { id: 3, nome: "Lamiera davanzale 300mm", cod: "LD300", prezzoMl: 11.0 },
  { id: 4, nome: "Scossalina 150mm", cod: "SC150", prezzoMl: 7.0 },
  { id: 5, nome: "Scossalina 200mm", cod: "SC200", prezzoMl: 8.5 },
];

/* ── ICONS SVG ── */
const Ico = ({ d, s = 20, c = "#888", sw = 1.8 }: { d?: any; s?: number; c?: string; sw?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const ICO = {
  home: <><path d="M2 12L12 3l10 9"/><path d="M5 9.5V20a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V9.5"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/></>,
  chat: <><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M7 8h10M7 12h6"/></>,
  settings: <><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>,
  back: <><polyline points="15 18 9 12 15 6"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  check: <><polyline points="20 6 9 17 4 12"/></>,
  phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>,
  camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  pen: <><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  filter: <><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 10h8M5 6h14M11 14h2M10 18h4"/></>,
  ai: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
};

/* ── MISURE PUNTI ── */
const PUNTI_MISURE = [
  { key: "lAlto", label: "L alto", x: 95, y: 8, color: "acc" },
  { key: "lCentro", label: "L centro", x: 95, y: 125, color: "acc" },
  { key: "lBasso", label: "L basso", x: 95, y: 242, color: "acc" },
  { key: "hSx", label: "H sx", x: 8, y: 125, color: "blue", rot: true },
  { key: "hCentro", label: "H centro", x: 95, y: 170, color: "blue" },
  { key: "hDx", label: "H dx", x: 182, y: 125, color: "blue", rot: true },
  { key: "d1", label: "D1 ↗", x: 50, y: 55, color: "purple" },
  { key: "d2", label: "D2 ↘", x: 140, y: 55, color: "purple" },
];

/* ══════════════════════════════════════ */
/* ══          MAIN COMPONENT          ══ */
/* ══════════════════════════════════════ */

export default function MastroMisure({ user, azienda }: { user?: any; azienda?: any }) {
  const [theme, setTheme] = useState("chiaro");
  const T = THEMES[theme as keyof typeof THEMES];
  
  const [tab, setTab] = useState("home");
  const [homeOrder, setHomeOrder] = useState(["banner","calendario","email","commesse"]);
  const [homeEditMode, setHomeEditMode] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [cantieri, setCantieri] = useState(CANTIERI_INIT);
  const [tasks, setTasks] = useState(TASKS_INIT);
  const [msgs, setMsgs] = useState(MSGS_INIT);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [team, setTeam] = useState(TEAM_INIT);
  const [coloriDB, setColoriDB] = useState(COLORI_INIT);
  const [sistemiDB, setSistemiDB] = useState(SISTEMI_INIT);
  const [vetriDB, setVetriDB] = useState(VETRI_INIT);
  const [coprifiliDB, setCoprifiliDB] = useState(COPRIFILI_INIT);
  const [lamiereDB, setLamiereDB] = useState(LAMIERE_INIT);
  const [pipelineDB, setPipelineDB] = useState(PIPELINE_DEFAULT);
  const [faseOpen, setFaseOpen] = useState(true);
  const [sogliaDays, setSogliaDays] = useState(5);
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [firmaDrawing, setFirmaDrawing] = useState(false);
  const [firmaDataUrl, setFirmaDataUrl] = useState(null);
  const [showPreventivoModal, setShowPreventivoModal] = useState(false);
  const [favTipologie, setFavTipologie] = useState(["F1A", "F2A", "PF2A", "SC2A", "FISDX", "VAS"]);
  
  // Navigation
  const [selectedCM, setSelectedCM] = useState(null);
  const [selectedVano, setSelectedVano] = useState(null);
  const [filterFase, setFilterFase] = useState("tutte");
  const [searchQ, setSearchQ] = useState("");
  const [showModal, setShowModal] = useState(null); // 'task' | 'commessa' | 'vano' | null
  const [settingsTab, setSettingsTab] = useState("generali");
  const [aziendaInfo, setAziendaInfo] = useState({
    ragione: azienda?.ragione || "Walter Cozza Serramenti SRL",
    piva: azienda?.piva || "",
    indirizzo: azienda?.indirizzo || "",
    telefono: azienda?.telefono || "",
    email: azienda?.email || "",
    website: "",
    iban: "",
    cciaa: "",
    logo: null,
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
  const [selDate, setSelDate] = useState(new Date());
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ text: "", time: "", tipo: "appuntamento", cm: "", persona: "", date: "" });
  const [events, setEvents] = useState(() => {
    const t = new Date(); const td = t.toISOString().split("T")[0];
    const tm = new Date(t); tm.setDate(tm.getDate() + 1); const tmStr = tm.toISOString().split("T")[0];
    const t2 = new Date(t); t2.setDate(t2.getDate() + 2); const t2Str = t2.toISOString().split("T")[0];
    return [
      { id: 1, text: "Sopralluogo Ferraro", time: "09:00", date: td, tipo: "appuntamento", cm: "CM-0003", persona: "Fabio Cozza", color: "#ff3b30", addr: "Via G. Barrio" },
      { id: 2, text: "Consegna materiale Bruno", time: "14:00", date: td, tipo: "appuntamento", cm: "CM-0002", persona: "Sara Greco", color: "#007aff", addr: "Via Roma 45, Rende" },
      { id: 3, text: "Posa Cozza — Camera", time: "16:30", date: td, tipo: "appuntamento", cm: "CM-0004", persona: "Marco Ferraro", color: "#34c759", addr: "Via G. Barrio" },
      { id: 4, text: "Ritiro vetri Finstral", time: "10:00", date: tmStr, tipo: "task", cm: "", persona: "Marco Ferraro", color: "#ff9500" },
      { id: 5, text: "Preventivo Rossi", time: "", date: t2Str, tipo: "task", cm: "CM-0001", persona: "Sara Greco", color: "#af52de" },
    ];
  });
  
  // Advance fase notification
  const [faseNotif, setFaseNotif] = useState(null);
  
  // AI Photo
  const [showAIPhoto, setShowAIPhoto] = useState(false);
  const [aiPhotoStep, setAiPhotoStep] = useState(0); // 0=ready, 1=analyzing, 2=done
  const [settingsModal, setSettingsModal] = useState(null); // {type, item?}
  const [settingsForm, setSettingsForm] = useState({});
  const [showAllegatiModal, setShowAllegatiModal] = useState(null); // "nota" | "vocale" | "video" | null
  const [allegatiText, setAllegatiText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recInterval = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [playProgress, setPlayProgress] = useState(0);
  const playInterval = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Drawing state
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const fotoInputRef = useRef(null);
  const firmaRef = useRef(null);
  const fotoVanoRef = useRef(null);
  const [pendingFotoCat, setPendingFotoCat] = useState(null);
  const videoVanoRef = useRef(null);
  const ripFotoRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#1d1d1f");
  const [penSize, setPenSize] = useState(2);
  const [drawPaths, setDrawPaths] = useState([]);

  // New task form
  const [newTask, setNewTask] = useState({ text: "", meta: "", time: "", priority: "media", cm: "" });
  const [taskAllegati, setTaskAllegati] = useState([]); // allegati for new task
  const [msgFilter, setMsgFilter] = useState("tutti"); // tutti/email/whatsapp/sms/telegram
  const [msgSearch, setMsgSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeMsg, setComposeMsg] = useState({ to: "", text: "", canale: "whatsapp", cm: "" });
  const [fabOpen, setFabOpen] = useState(false);
  const [contatti, setContatti] = useState(CONTATTI_INIT);
  const [msgSubTab, setMsgSubTab] = useState("chat"); // "chat" | "rubrica"
  const [rubricaSearch, setRubricaSearch] = useState("");
  const [rubricaFilter, setRubricaFilter] = useState("tutti"); // tutti/preferiti/team/clienti/fornitori
  const [globalSearch, setGlobalSearch] = useState("");
  // New commessa form
  const [newCM, setNewCM] = useState({ cliente: "", indirizzo: "", telefono: "", sistema: "", tipo: "nuova", difficoltaSalita: "", mezzoSalita: "", foroScale: "", pianoEdificio: "", note: "" });
  const [ripSearch, setRipSearch] = useState("");
  const [ripCMSel, setRipCMSel] = useState(null);
  const [ripProblema, setRipProblema] = useState("");
  const [ripFotos, setRipFotos] = useState([]);
  const [ripUrgenza, setRipUrgenza] = useState("media");
  // New vano form
  const [vanoInfoOpen, setVanoInfoOpen] = useState(null); // which accordion section is open
  const [tipCat, setTipCat] = useState("Finestre");
  const [newVano, setNewVano] = useState({ nome: "", tipo: "F1A", stanza: "Soggiorno", piano: "PT", sistema: "", coloreInt: "", coloreEst: "", bicolore: false, coloreAcc: "", vetro: "", telaio: "", telaioAlaZ: "", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "", coprifilo: "", lamiera: "" });
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

  // ── Persistence ──
useEffect(()=>{ (()=>{
      try{const _v=localStorage.getItem("mastro:cantieri");if(_v)setCantieri(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:tasks");if(_v)setTasks(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:events");if(_v)setEvents(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:colori");if(_v)setColoriDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:sistemi");if(_v)setSistemiDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:vetri");if(_v)setVetriDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:coprifili");if(_v)setCoprifiliDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:lamiere");if(_v)setLamiereDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:team");if(_v)setTeam(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:contatti");if(_v)setContatti(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:pipeline");if(_v)setPipelineDB(JSON.parse(_v));}catch(e){}
      try{const _v=localStorage.getItem("mastro:azienda");if(_v)setAziendaInfo(JSON.parse(_v));}catch(e){}
  })();},[ ]);
  // useEffect(()=>{supabase.from("cantieri").upsert(cantieri.map(c=>({...c,azienda_id:azienda.id}))).then(()=>{});},[cantieri]);
  useEffect(()=>{try{localStorage.setItem("mastro:tasks",JSON.stringify(tasks));}catch(e){}},[tasks]);
  useEffect(()=>{try{localStorage.setItem("mastro:events",JSON.stringify(events));}catch(e){}},[events]);
  useEffect(()=>{try{localStorage.setItem("mastro:colori",JSON.stringify(coloriDB));}catch(e){}},[coloriDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:sistemi",JSON.stringify(sistemiDB));}catch(e){}},[sistemiDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:vetri",JSON.stringify(vetriDB));}catch(e){}},[vetriDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:coprifili",JSON.stringify(coprifiliDB));}catch(e){}},[coprifiliDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:lamiere",JSON.stringify(lamiereDB));}catch(e){}},[lamiereDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:team",JSON.stringify(team));}catch(e){}},[team]);
  useEffect(()=>{try{localStorage.setItem("mastro:contatti",JSON.stringify(contatti));}catch(e){}},[contatti]);
  useEffect(()=>{try{localStorage.setItem("mastro:pipeline",JSON.stringify(pipelineDB));}catch(e){}},[pipelineDB]);
  useEffect(()=>{try{localStorage.setItem("mastro:azienda",JSON.stringify(aziendaInfo));}catch(e){}},[aziendaInfo]);

  const PIPELINE = pipelineDB.filter(p => p.attiva !== false);
  const parseDataCM = (s) => {
    const oggi0 = new Date(); oggi0.setHours(0,0,0,0);
    if(!s) return null;
    if(s==="oggi"||s==="Oggi"||s==="Adesso") return oggi0;
    const mesi2 = {gen:0,feb:1,mar:2,apr:3,mag:4,giu:5,lug:6,ago:7,set:8,ott:9,nov:10,dic:11};
    const m2 = s.toLowerCase().match(/(\d+)\s+([a-z]+)/);
    if(m2) return new Date(oggi0.getFullYear(), (mesi2 as any)[m2[2]]??0, parseInt(m2[1]));
    return null;
  };
  const giorniFermaCM = (c) => {
    const oggi0 = new Date(); oggi0.setHours(0,0,0,0);
    const d = parseDataCM(c.aggiornato);
    if(!d) return 0;
    return Math.floor(((oggi0 as any) - (d as any)) / 86400000);
  };
  const isTablet = winW >= 768;
  const isDesktop = winW >= 1024;

  const goBack = () => {
    if (showRiepilogo) { setShowRiepilogo(false); return; }
    if (selectedVano) { setSelectedVano(null); setVanoStep(0); return; }
    if (selectedCM) { setSelectedCM(null); return; }
  };

  /* ── Helpers ── */
  const countVani = () => cantieri.reduce((s, c) => s + c.vani.length, 0);
  const urgentCount = () => cantieri.filter(c => c.alert).length;
  const readyCount = () => cantieri.filter(c => c.fase === "posa" || c.fase === "chiusura").length;
  const faseIndex = (fase) => PIPELINE.findIndex(p => p.id === fase);
  const priColor = (p) => p === "alta" ? T.red : p === "media" ? T.orange : T.sub2;

  const toggleTask = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const addTask = () => {
    if (!newTask.text.trim()) return;
    setTasks(ts => [...ts, { id: Date.now(), ...newTask, done: false, allegati: [...taskAllegati] }]);
    setTaskAllegati([]);
    setNewTask({ text: "", meta: "", time: "", priority: "media", cm: "" });
    setShowModal(null);
  };

  const addCommessa = () => {
    if (!newCM.cliente.trim()) return;
    const code = "S-" + String(cantieri.length + 1).padStart(4, "0");
    const nc = { id: Date.now(), code, cliente: newCM.cliente, cognome: newCM.cognome||"", indirizzo: newCM.indirizzo, telefono: newCM.telefono, email: newCM.email||"", fase: "sopralluogo", vani: [], sistema: newCM.sistema, tipo: newCM.tipo, difficoltaSalita: newCM.difficoltaSalita, mezzoSalita: newCM.mezzoSalita, foroScale: newCM.foroScale, pianoEdificio: newCM.pianoEdificio, note: newCM.note, allegati: [], creato: new Date().toLocaleDateString("it-IT",{day:"numeric",month:"short"}), aggiornato: new Date().toLocaleDateString("it-IT",{day:"numeric",month:"short"}), log: [{ chi: "Fabio", cosa: "creato la commessa", quando: "Adesso", color: T.sub }] };
    setCantieri(cs => [nc, ...cs]);
    setNewCM({ cliente: "", cognome: "", indirizzo: "", telefono: "", email: "", sistema: "", tipo: "nuova", difficoltaSalita: "", mezzoSalita: "", foroScale: "", pianoEdificio: "", note: "" });
    setShowModal(null);
    setSelectedCM(nc);
    setTab("commesse");
  };

  const addVano = () => {
    if (!selectedCM) return;
    const tipObj = TIPOLOGIE_RAPIDE.find(t => t.code === newVano.tipo);
    const nome = newVano.nome.trim() || `${tipObj?.label || newVano.tipo} ${(selectedCM.vani?.length || 0) + 1}`;
    const v = { id: Date.now(), nome, tipo: newVano.tipo, stanza: newVano.stanza, piano: newVano.piano, sistema: newVano.sistema, coloreInt: newVano.coloreInt, coloreEst: newVano.coloreEst, bicolore: newVano.bicolore, coloreAcc: newVano.coloreAcc, vetro: newVano.vetro, telaio: newVano.telaio, telaioAlaZ: newVano.telaioAlaZ, rifilato: newVano.rifilato, rifilSx: newVano.rifilSx, rifilDx: newVano.rifilDx, rifilSopra: newVano.rifilSopra, rifilSotto: newVano.rifilSotto, coprifilo: newVano.coprifilo, lamiera: newVano.lamiera, misure: {}, foto: {}, note: "", cassonetto: false, accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } } };
    setCantieri(cs => cs.map(c => c.id === selectedCM.id ? { ...c, vani: [...c.vani, v], aggiornato: "Oggi" } : c));
    setSelectedCM(prev => ({ ...prev, vani: [...prev.vani, v] }));
    setNewVano(prev => ({ nome: "", tipo: prev.tipo, stanza: "Soggiorno", piano: prev.piano, sistema: prev.sistema, coloreInt: prev.coloreInt, coloreEst: prev.coloreEst, bicolore: prev.bicolore, coloreAcc: prev.coloreAcc, vetro: prev.vetro, telaio: prev.telaio, telaioAlaZ: prev.telaioAlaZ, rifilato: prev.rifilato, rifilSx: prev.rifilSx, rifilDx: prev.rifilDx, rifilSopra: prev.rifilSopra, rifilSotto: prev.rifilSotto, coprifilo: prev.coprifilo, lamiera: prev.lamiera }));
    setShowModal(null);
    setSelectedVano(v);  // ← apre direttamente il vano
    setVanoStep(0);
  };

  const updateMisura = (vanoId, key, value) => {
    const val = value === "" ? "" : value;
    const numVal = parseInt(value) || 0;
    setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? {
      ...c, vani: c.vani.map(v => v.id === vanoId ? { ...v, misure: { ...v.misure, [key]: numVal } } : v)
    } : c));
    if (selectedVano?.id === vanoId) {
      setSelectedVano(prev => ({ ...prev, misure: { ...prev.misure, [key]: numVal } }));
    }
    setSelectedCM(prev => prev ? ({ ...prev, vani: prev.vani.map(v => v.id === vanoId ? { ...v, misure: { ...v.misure, [key]: numVal } } : v) }) : prev);
  };

  const toggleAccessorio = (vanoId, acc) => {
    setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? {
      ...c, vani: c.vani.map(v => v.id === vanoId ? { ...v, accessori: { ...v.accessori, [acc]: { ...v.accessori[acc], attivo: !v.accessori[acc].attivo } } } : v)
    } : c));
    if (selectedVano?.id === vanoId) {
      setSelectedVano(prev => ({ ...prev, accessori: { ...prev.accessori, [acc]: { ...prev.accessori[acc], attivo: !prev.accessori[acc].attivo } } }));
    }
  };

  const updateAccessorio = (vanoId, acc, field, value) => {
    setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? {
      ...c, vani: c.vani.map(v => v.id === vanoId ? { ...v, accessori: { ...v.accessori, [acc]: { ...v.accessori[acc], [field]: value } } } : v)
    } : c));
    if (selectedVano?.id === vanoId) {
      setSelectedVano(prev => ({ ...prev, accessori: { ...prev.accessori, [acc]: { ...prev.accessori[acc], [field]: value } } }));
    }
    setSelectedCM(prev => prev ? ({ ...prev, vani: prev.vani.map(v => v.id === vanoId ? { ...v, accessori: { ...v.accessori, [acc]: { ...v.accessori[acc], [field]: value } } } : v) }) : prev);
  };

  // DELETE functions
  const deleteTask = (taskId) => { if ((()=>{try{return window.confirm("Eliminare questo task?");}catch(e){return false;}})()) setTasks(ts => ts.filter(t => t.id !== taskId)); };
  const deleteVano = (vanoId) => {
    if (!(()=>{try{return window.confirm("Eliminare questo vano e tutte le sue misure?");}catch(e){return false;}})()) return;
    setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, vani: c.vani.filter(v => v.id !== vanoId) } : c));
    setSelectedCM(prev => prev ? ({ ...prev, vani: prev.vani.filter(v => v.id !== vanoId) }) : prev);
    if (selectedVano?.id === vanoId) { setSelectedVano(null); setVanoStep(0); }
  };
  const deleteCommessa = (cmId) => {
    if (!(()=>{try{return window.confirm("Eliminare questa commessa e tutti i suoi vani?");}catch(e){return false;}})()) return;
    setCantieri(cs => cs.filter(c => c.id !== cmId));
    if (selectedCM?.id === cmId) { setSelectedCM(null); setSelectedVano(null); }
  };
  const deleteEvent = (evId) => { if ((()=>{try{return window.confirm("Eliminare questo evento?");}catch(e){return false;}})()) setEvents(ev => ev.filter(e => e.id !== evId)); };
  const deleteMsg = (msgId) => { if ((()=>{try{return window.confirm("Eliminare questo messaggio?");}catch(e){return false;}})()) setMsgs(ms => ms.filter(m => m.id !== msgId)); };

  const addAllegato = (tipo, content) => {
    if (!selectedCM) return;
    const a = { id: Date.now(), tipo, nome: content || (tipo === "file" ? "Allegato" : tipo === "vocale" ? "Nota vocale" : tipo === "video" ? "Video" : "Nota"), data: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), durata: tipo === "vocale" ? "0:" + String(Math.floor(Math.random() * 30 + 5)).padStart(2, "0") : tipo === "video" ? "0:" + String(Math.floor(Math.random() * 45 + 10)).padStart(2, "0") : "" };
    setCantieri(cs => cs.map(x => x.id === selectedCM.id ? { ...x, allegati: [...(x.allegati || []), a] } : x));
    setSelectedCM(p => ({ ...p, allegati: [...(p.allegati || []), a] }));
  };

  const playAllegato = (id) => {
    if (playingId === id) { clearInterval(playInterval.current); setPlayingId(null); setPlayProgress(0); return; }
    clearInterval(playInterval.current);
    setPlayingId(id); setPlayProgress(0);
    let prog = 0;
    playInterval.current = setInterval(() => { prog += 2; setPlayProgress(prog); if (prog >= 100) { clearInterval(playInterval.current); setPlayingId(null); setPlayProgress(0); } }, 100);
  };

  // SETTINGS CRUD
  const addSettingsItem = () => {
    const f = settingsForm;
    if (settingsModal === "sistema" && f.marca && f.sistema) {
      setSistemiDB(s => [...s, { id: Date.now(), marca: f.marca, sistema: f.sistema, euroMq: parseInt(f.euroMq)||0, prezzoMq: parseFloat(f.prezzoMq||f.euroMq)||0, sovRAL: parseInt(f.sovRAL)||0, sovLegno: parseInt(f.sovLegno)||0, colori: [], sottosistemi: f.sottosistemi ? f.sottosistemi.split(",").map(s => s.trim()) : [] }]);
    } else if (settingsModal === "colore" && f.nome && f.code) {
      setColoriDB(c => [...c, { id: Date.now(), nome: f.nome, code: f.code, hex: f.hex || "#888888", tipo: f.tipo || "RAL" }]);
    } else if (settingsModal === "vetro" && f.nome && f.code) {
      setVetriDB(v => [...v, { id: Date.now(), nome: f.nome, code: f.code, ug: parseFloat(f.ug)||1.0, prezzoMq: parseFloat(f.prezzoMq)||0 }]);
    } else if (settingsModal === "coprifilo" && f.nome && f.cod) {
      setCoprifiliDB(c => [...c, { id: Date.now(), nome: f.nome, cod: f.cod, prezzoMl: parseFloat(f.prezzoMl)||0 }]);
    } else if (settingsModal === "lamiera" && f.nome && f.cod) {
      setLamiereDB(l => [...l, { id: Date.now(), nome: f.nome, cod: f.cod, prezzoMl: parseFloat(f.prezzoMl)||0 }]);
    } else if (settingsModal === "tipologia" && f.code && f.label) {
      TIPOLOGIE_RAPIDE.push({ code: f.code, label: f.label, icon: f.icon || "🪟" });
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
        return { ...c, fase: next.id, log: [{ chi: "Fabio", cosa: `avanzato a ${next.nome}`, quando: "Adesso", color: next.color }, ...c.log] };
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

  const addEvent = () => {
    if (!newEvent.text.trim()) return;
    setEvents(ev => [...ev, { id: Date.now(), ...newEvent, date: newEvent.date || selDate.toISOString().split("T")[0], color: newEvent.tipo === "appuntamento" ? "#007aff" : "#ff9500" }]);
    setNewEvent({ text: "", time: "", tipo: "appuntamento", cm: "", persona: "", date: "" });
    setShowNewEvent(false);
  };

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
      resp = `Totale vani: ${countVani()}\nCommesse con vani da misurare:\n${cantieri.filter(c => c.vani.some(v => Object.keys(v.misure || {}).length < 6)).map(c => `• ${c.code}: ${c.vani.filter(v => Object.keys(v.misure || {}).length < 6).length} vani incompleti`).join("\n")}`;
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
    cm.vani.forEach((v, i) => {
      const m = v.misure || {};
      html += `<div class="vano"><h3>${i + 1}. ${v.nome} — ${v.tipo} (${v.stanza}, ${v.piano})</h3><div class="misure-grid">`;
      [["L alto", m.lAlto], ["L centro", m.lCentro], ["L basso", m.lBasso], ["H sinistra", m.hSx], ["H centro", m.hCentro], ["H destra", m.hDx], ["Diag. 1", m.d1], ["Diag. 2", m.d2], ["Spall. SX", m.spSx], ["Spall. DX", m.spDx], ["Architrave", m.arch], ["Dav. int.", m.davInt], ["Dav. est.", m.davEst]].forEach(([l, val]) => {
        html += `<div class="m-item"><div class="m-label">${l}</div><div class="m-val">${val || "—"} mm</div></div>`;
      });
      html += `</div>`;
      if (v.cassonetto) html += `<p style="margin-top:8px;font-size:13px">Cassonetto: ${v.casH || "—"} × ${v.casP || "—"} mm</p>`;
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

  /* ═══════ STYLES ═══════ */
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

  /* ═══════ CALENDAR STRIP ═══════ */
  const today = new Date();
  const calDays = Array.from({ length: 9 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i - 2);
    return { day: d.getDate(), name: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"][d.getDay()], isToday: i === 2, hasDot: [0, 2, 4, 6].includes(i) };
  });

  /* ═══════ PIPELINE COMPONENT ═══════ */
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

  /* ═══════ VANO SVG SCHEMA ═══════ */
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

  /* ═══════ FILTERED CANTIERI ═══════ */
  const filtered = cantieri.filter(c => {
    if (filterFase !== "tutte" && c.fase !== filterFase) return false;
    if (searchQ && !c.cliente.toLowerCase().includes(searchQ.toLowerCase()) && !c.code.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  /* ════════════════════════════════════ */
  /* ════       RENDER SECTIONS       ══ */
  /* ════════════════════════════════════ */

  /* ── HOME TAB ── */
  const renderHome = () => (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 12px", background: T.card, borderBottom: `1px solid ${T.bdr}` }}>
        {/* Logo row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Logo — quadrato nero con M bianca, uguale in tutte le app MASTRO */}
            <div style={{ width: 44, height: 44, borderRadius: 10, background: T.text, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: T.card, fontFamily: FF, letterSpacing: -1 }}>M</span>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: -0.3, lineHeight: 1.1 }}>MASTRO</div>
              <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>misure</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 20 }}>⛅</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>12°</span>
              </div>
              <div style={{ fontSize: 11, color: T.sub }}>Cosenza</div>
            </div>
            <div onClick={() => setHomeEditMode(e => !e)}
              style={{ padding: "4px 10px", borderRadius: 7, background: homeEditMode ? T.acc : T.bg, border: `1px solid ${homeEditMode ? T.acc : T.bdr}`, fontSize: 11, fontWeight: 700, color: homeEditMode ? "#fff" : T.sub, cursor: "pointer" }}>
              {homeEditMode ? "✓ Fine" : "✏ Riordina"}
            </div>
          </div>
        </div>
        {/* Saluto */}
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
          {today.getHours() < 12 ? "Buongiorno" : today.getHours() < 18 ? "Buon pomeriggio" : "Buonasera"}, Fabio
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 1 }}>
          {today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>



      {/* Global search */}
      <div style={{ padding: "0 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}` }}>
          <Ico d={ICO.search} s={16} c={T.sub} />
          <input
            style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: T.text, outline: "none", fontFamily: FF }}
            placeholder="Cerca commesse, clienti, vani..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
          />
          {globalSearch && <div onClick={() => setGlobalSearch("")} style={{ cursor: "pointer", fontSize: 14, color: T.sub }}>✕</div>}
        </div>
        {globalSearch.trim().length > 1 && (() => {
          const q = globalSearch.toLowerCase();
          const cmResults = cantieri.filter(c => c.cliente?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q) || c.indirizzo?.toLowerCase().includes(q));
          const vanoResults = cantieri.flatMap(c => c.vani.filter(v => v.nome?.toLowerCase().includes(q) || v.tipo?.toLowerCase().includes(q) || v.stanza?.toLowerCase().includes(q)).map(v => ({ ...v, cmCode: c.code, cmCliente: c.cliente, cmId: c.id, cm: c })));
          const taskResults = tasks.filter(t => t.text?.toLowerCase().includes(q) || t.meta?.toLowerCase().includes(q));
          const evResults = events.filter(e => e.text?.toLowerCase().includes(q) || e.persona?.toLowerCase().includes(q));
          const total = cmResults.length + vanoResults.length + taskResults.length + evResults.length;
          return total > 0 ? (
            <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}`, marginTop: 6, maxHeight: 280, overflowY: "auto" }}>
              {cmResults.map(c => (
                <div key={c.id} onClick={() => { setSelectedCM(c); setTab("commesse"); setGlobalSearch(""); }} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.bg}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📁</span>
                  <div><div style={{ fontSize: 12, fontWeight: 600 }}>{c.cliente}</div><div style={{ fontSize: 10, color: T.sub }}>{c.code} · {c.indirizzo}</div></div>
                </div>
              ))}
              {vanoResults.map(v => (
                <div key={v.id} onClick={() => { setSelectedCM(v.cm); setSelectedVano(v); setTab("commesse"); setGlobalSearch(""); }} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.bg}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🪟</span>
                  <div><div style={{ fontSize: 12, fontWeight: 600 }}>{v.nome}</div><div style={{ fontSize: 10, color: T.sub }}>{v.cmCode} · {v.stanza} · {v.tipo}</div></div>
                </div>
              ))}
              {taskResults.map(t => (
                <div key={t.id} onClick={() => { setGlobalSearch(""); }} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.bg}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>☑️</span>
                  <div><div style={{ fontSize: 12, fontWeight: 600 }}>{t.text}</div><div style={{ fontSize: 10, color: T.sub }}>{t.cm || "Task"} · {t.meta}</div></div>
                </div>
              ))}
              {evResults.map(e => (
                <div key={e.id} onClick={() => { setTab("agenda"); setAgendaView("giorno"); setSelDate(new Date(e.date)); setGlobalSearch(""); }} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.bg}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <div><div style={{ fontSize: 12, fontWeight: 600 }}>{e.text}</div><div style={{ fontSize: 10, color: T.sub }}>{e.date} {e.time} · {e.persona}</div></div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "10px 14px", background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}`, marginTop: 6, fontSize: 12, color: T.sub, textAlign: "center" }}>Nessun risultato per "{globalSearch}"</div>
          );
        })()}
      </div>

      {/* ── SEZIONI RIORDINABILI ── */}
      {(() => {
        const sections = {
          banner: (() => {
            const todayISO = today.toISOString().split("T")[0];
            const todayEvents = events.filter(e => e.date === todayISO).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
            const urgenti = cantieri.filter(c => c.alert);
            // Calcola giorni ferma
            const oggi2 = new Date(); oggi2.setHours(0,0,0,0);
            // parseDataCM defined at component level
            // giorniFermaCM defined at component level
            const SOGLIA_GIORNI = sogliaDays;
            const ferme = cantieri.filter(c => c.fase !== "chiusura" && giorniFermaCM(c) >= SOGLIA_GIORNI);
            const misureInAttesa = cantieri.filter(c => c.fase === "misure" && c.vani.some(v => Object.keys(v.misure || {}).length < 4));
            const preventiviDaFare = cantieri.filter(c => c.fase === "preventivo");
            const taskUrgenti = tasks.filter(t => !t.done && t.priority === "alta");
            const nextEvent = todayEvents[0];
            let banner = null;
            if (urgenti.length > 0) { const c=urgenti[0]; banner = { color:T.red, bg:"rgba(255,59,48,0.07)", border:"rgba(255,59,48,0.18)", tag:"⚠️ URGENTE", title:c.alert, sub:`${c.code} · ${c.cliente}`, act:()=>{setSelectedCM(c);setTab("commesse");} }; }
            else if (nextEvent) { banner = { color:nextEvent.color||T.acc, bg:`${nextEvent.color||T.acc}10`, border:`${nextEvent.color||T.acc}25`, tag:`📅 OGGI ${nextEvent.time?"ALLE "+nextEvent.time:""}`, title:nextEvent.text, sub:[nextEvent.persona,nextEvent.cm,nextEvent.addr].filter(Boolean).join(" · "), act:()=>{setTab("agenda");setAgendaView("giorno");setSelDate(new Date(nextEvent.date));} }; }
            else if (misureInAttesa.length > 0) { const c=misureInAttesa[0]; const mn=c.vani.filter(v=>Object.keys(v.misure||{}).length<4).length; banner = { color:T.orange, bg:"rgba(255,149,0,0.07)", border:"rgba(255,149,0,0.18)", tag:"📐 MISURE IN ATTESA", title:`${c.code} · ${c.cliente}`, sub:`${mn} ${mn===1?"vano":"vani"} da misurare`, act:()=>{setSelectedCM(c);setTab("commesse");} }; }
            else if (preventiviDaFare.length > 0) { banner = { color:"#7c3aed", bg:"rgba(124,58,237,0.07)", border:"rgba(124,58,237,0.18)", tag:"📋 PREVENTIVI", title:`${preventiviDaFare.length} ${preventiviDaFare.length===1?"preventivo da inviare":"preventivi da inviare"}`, sub:preventiviDaFare.map(c=>c.code).join(" · "), act:()=>setTab("commesse") }; }
            else if (taskUrgenti.length > 0) { const t=taskUrgenti[0]; banner = { color:T.red, bg:"rgba(255,59,48,0.07)", border:"rgba(255,59,48,0.18)", tag:"⚡ TASK URGENTE", title:t.text, sub:t.cm?`Commessa ${t.cm}`:(t.meta||""), act:()=>{} }; }
            else if (ferme.length > 0) { const c=ferme[0]; const gg=giorniFermaCM(c); banner = { color:"#ff6b00", bg:"rgba(255,107,0,0.07)", border:"rgba(255,107,0,0.18)", tag:`🔔 FERMA DA ${gg} GIORNI`, title:`${c.code} · ${c.cliente}`, sub:`In fase "${PIPELINE.find(p=>p.id===c.fase)?.nome||c.fase}" dal ${c.aggiornato}${ferme.length>1?" · e altre "+(ferme.length-1):""}`, act:()=>{setSelectedCM(c);setTab("commesse");} }; }
            else { banner = { color:T.grn, bg:"rgba(52,199,89,0.07)", border:"rgba(52,199,89,0.18)", tag:"✅ TUTTO IN ORDINE", title:"Nessuna azione urgente", sub:`${cantieri.length} commesse attive`, act:null }; }
            return (
              <div onClick={banner.act} style={{ margin:"0 16px 12px", borderRadius:12, background:banner.bg, border:`1px solid ${banner.border}`, padding:"12px 14px", cursor:banner.act?"pointer":"default", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:banner.color, borderRadius:"12px 0 0 12px" }}/>
                <div style={{ paddingLeft:8 }}>
                  <div style={{ fontSize:9, fontWeight:800, color:banner.color, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4, fontFamily:FM }}>{banner.tag}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:T.text, lineHeight:1.3, marginBottom:2 }}>{banner.title}</div>
                  {banner.sub && <div style={{ fontSize:12, color:T.sub, lineHeight:1.4 }}>{banner.sub}</div>}
                  {banner.act && <div style={{ marginTop:6, fontSize:11, fontWeight:700, color:banner.color }}>Tocca per aprire →</div>}
                </div>
              </div>
            );
          })(),

          calendario: <MastroAgendaWidget events={events} cantieri={cantieri} T={T} onEventClick={() => setTab("agenda")} onAddEvent={() => setTab("agenda")} />,

          email: (() => {
            const emailsOnly = msgs.filter(m => m.canale === "email");
            const unreadEmails = emailsOnly.filter(m => !m.read).length;
            return (
              <div style={{ marginBottom:12 }}>
                <div style={S.section}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={S.sectionTitle}>Email</div>
                    {unreadEmails>0 && <div style={{ ...S.badge(T.redLt, T.red), fontSize:10 }}>{unreadEmails}</div>}
                  </div>
                  <button style={S.sectionBtn} onClick={() => { setMsgFilter("email"); setTab("messaggi"); }}>Vedi tutte</button>
                </div>
                <div style={{ padding:"0 16px" }}>
                  <div style={{ background:T.card, borderRadius:T.r, border:`1px solid ${T.bdr}`, overflow:"hidden" }}>
                    {emailsOnly.length===0
                      ? <div style={{ padding:"16px", textAlign:"center", fontSize:12, color:T.sub }}>Nessuna email</div>
                      : emailsOnly.slice(0,3).map((m,i) => (
                        <div key={m.id} onClick={() => { setMsgs(ms => ms.map(x => x.id===m.id?{...x,read:true}:x)); setSelectedMsg(m); }}
                          style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 14px", borderBottom:i<Math.min(emailsOnly.length,3)-1?`1px solid ${T.bg}`:"none", cursor:"pointer", background:m.read?"transparent":T.acc+"05" }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:m.read?"transparent":T.acc, flexShrink:0, marginTop:5 }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                              <div style={{ fontSize:13, fontWeight:m.read?500:700, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.from}</div>
                              <div style={{ fontSize:10, color:T.sub, flexShrink:0 }}>{m.time}</div>
                            </div>
                            <div style={{ fontSize:12, color:T.sub, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.preview}</div>
                            {m.cm && <span style={{ ...S.badge(T.accLt, T.acc), marginTop:3, display:"inline-block" }}>{m.cm}</span>}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            );
          })(),

          commesse: (
            <div>
              <div style={S.section}>
                <div style={S.sectionTitle}>Commesse</div>
                <button style={S.sectionBtn} onClick={() => setTab("commesse")}>Vedi tutte</button>
              </div>
              {cantieri.slice(0, 3).map(c => renderCMCard(c))}
            </div>
          ),
        };

        const LABELS = { banner:"🔔 Avviso", calendario:"📅 Calendario", email:"📧 Email", commesse:"📁 Commesse" };

        return homeOrder.map((id, idx) => (
          <div key={id}
            draggable={homeEditMode}
            onDragStart={() => { if(homeEditMode) setDragIdx(idx); }}
            onDragOver={e => { e.preventDefault(); if(homeEditMode) setDragOverIdx(idx); }}
            onDrop={() => {
              if(!homeEditMode || dragIdx === null) return;
              const newOrder = [...homeOrder];
              const [moved] = newOrder.splice(dragIdx, 1);
              newOrder.splice(idx, 0, moved);
              setHomeOrder(newOrder);
              setDragIdx(null); setDragOverIdx(null);
            }}
            onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
            style={{ opacity: dragIdx === idx ? 0.4 : 1, transition:"opacity 0.15s",
              outline: dragOverIdx === idx && dragIdx !== idx ? `2px dashed ${T.acc}` : "none",
              borderRadius: 12, position:"relative" }}>
            {homeEditMode && (
              <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", zIndex:10, display:"flex", alignItems:"center", gap:6,
                background:T.card, border:`1px solid ${T.bdr}`, borderRadius:8, padding:"4px 10px", boxShadow:"0 1px 6px rgba(0,0,0,0.08)", pointerEvents:"none" }}>
                <span style={{ fontSize:14, color:T.sub }}>☰</span>
                <span style={{ fontSize:11, fontWeight:700, color:T.sub }}>{LABELS[id]}</span>
              </div>
            )}
            <div style={{ filter: homeEditMode ? "brightness(0.97)" : "none", transition:"filter 0.15s" }}>
              {sections[id]}
            </div>
          </div>
        ));
      })()}
    </div>
  );
  /* ── COMMESSA CARD ── */
  const renderCMCard = (c, inGrid) => {
    const fase = PIPELINE.find(p => p.id === c.fase);
    const progress = ((faseIndex(c.fase) + 1) / PIPELINE.length) * 100;
    return (
      <div key={c.id} style={{ ...S.card, margin: inGrid ? "0" : "0 16px 8px" }} onClick={() => { setSelectedCM(c); setTab("commesse"); }}>
        <div style={S.cardInner}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: FM }}>{c.code}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{c.cliente}</span>
              </div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>{c.indirizzo} · {c.vani.length} vani</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {c.tipo === "riparazione" && <span style={S.badge(T.orangeLt, T.orange)}>🔧</span>}
              <span style={S.badge(fase?.color + "18", fase?.color)}>{fase?.nome}</span>
            </div>
          </div>
          {c.alert && <div style={{ ...S.badge(c.alert.includes("Nessun") ? T.orangeLt : T.redLt, c.alert.includes("Nessun") ? T.orange : T.red), marginTop: 6 }}>{c.alert}</div>}
          <div style={{ height: 3, background: T.bdr, borderRadius: 2, marginTop: 8 }}>
            <div style={{ height: "100%", borderRadius: 2, background: fase?.color, width: `${progress}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: T.sub2, display:"flex", alignItems:"center", gap:4 }}>
                  {c.creato} · agg. {c.aggiornato}
                  {giorniFermaCM(c) >= sogliaDays && c.fase !== "chiusura" &&
                    <span style={{background:"#ff6b00",color:"#fff",fontSize:8,padding:"1px 5px",borderRadius:3,fontWeight:800,marginLeft:3}}>FERMA</span>}
                </span>
            <span style={{ fontSize: 10, color: T.sub2 }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    );
  };

  /* ── COMMESSE TAB ── */
  const renderCommesse = () => {
    if (showRiepilogo && selectedCM) return renderRiepilogo();
    if (selectedVano) return renderVanoDetail();
    if (selectedCM) return renderCMDetail();
    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={S.header}>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>Commesse</div>
            <div style={S.headerSub}>{cantieri.length} totali</div>
          </div>
          <div onClick={() => setShowModal("commessa")} style={{ width: 36, height: 36, borderRadius: 10, background: T.acc, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, fontWeight: 300 }}>+</div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={S.chip(filterFase === "tutte")} onClick={() => setFilterFase("tutte")}>Tutte ({cantieri.length})</div>
          {PIPELINE.map(p => {
            const n = cantieri.filter(c => c.fase === p.id).length;
            return n > 0 ? <div key={p.id} style={S.chip(filterFase === p.id)} onClick={() => setFilterFase(p.id)}>{p.nome} ({n})</div> : null;
          })}
        </div>

        {/* Search */}
        <div style={{ display: "flex", gap: 8, padding: "0 16px", marginBottom: 10 }}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Cerca commessa..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>

        <div style={isDesktop ? { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px" } : isTablet ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 16px" } : {}}>
          {filtered.map(c => renderCMCard(c, isTablet || isDesktop))}
        </div>
      </div>
    );
  };

  /* ── COMMESSA DETAIL ── */
  const renderCMDetail = () => {
    const c = selectedCM;
    const fase = PIPELINE.find(p => p.id === c.fase);
    return (
      <div style={{ paddingBottom: 80 }}>
        {/* Header */}
        <div style={S.header}>
          <div onClick={goBack} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={20} c={T.sub} /></div>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>{c.code} · {c.cliente}</div>
            <div style={S.headerSub}>{c.indirizzo}</div>
          </div>
          <div onClick={() => setShowRiepilogo(true)} style={{ padding: "6px 10px", borderRadius: 6, background: T.accLt, cursor: "pointer", marginRight: 6 }}>
            <span style={{ fontSize: 14 }}>📋</span>
          </div>
          <div onClick={exportPDF} style={{ padding: "6px 10px", borderRadius: 6, background: T.redLt, cursor: "pointer" }}>
            <Ico d={ICO.file} s={16} c={T.red} />
          </div>
        </div>

        {/* Info badges */}
        <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {c.tipo === "riparazione" && <span style={S.badge(T.orangeLt, T.orange)}>🔧 Riparazione</span>}
          {c.tipo === "nuova" && <span style={S.badge(T.grnLt, T.grn)}>🆕 Nuova</span>}
          {c.sistema && <span style={S.badge(T.blueLt, T.blue)}>{c.sistema}</span>}
          {c.difficoltaSalita && <span style={S.badge(c.difficoltaSalita === "facile" ? T.grnLt : c.difficoltaSalita === "media" ? T.orangeLt : T.redLt, c.difficoltaSalita === "facile" ? T.grn : c.difficoltaSalita === "media" ? T.orange : T.red)}>Salita: {c.difficoltaSalita}</span>}
          {c.mezzoSalita && <span style={S.badge(T.purpleLt, T.purple)}>🪜 {c.mezzoSalita}</span>}
          {c.pianoEdificio && <span style={S.badge(T.blueLt, T.blue)}>Piano: {c.pianoEdificio}</span>}
          {c.foroScale && <span style={S.badge(T.redLt, T.red)}>Foro: {c.foroScale}</span>}
          {c.telefono && <span onClick={() => window.open(`tel:${c.telefono}`)} style={{ ...S.badge(T.grnLt, T.grn), cursor: "pointer" }}>📞 {c.telefono}</span>}
        </div>
        {/* Note commessa */}
        {c.note && <div style={{ padding: "0 16px", marginBottom: 6 }}><div style={{ padding: "8px 12px", borderRadius: 8, background: T.card, border: `1px solid ${T.bdr}`, fontSize: 12, color: T.sub, lineHeight: 1.4 }}>📝 {c.note}</div></div>}

        {/* Pipeline */}
        <div style={{ padding: "4px 16px 0" }}>
          <PipelineBar fase={c.fase} />
        </div>

        {/* Advance button */}
        <div style={{ marginTop: 8 }}>{renderFasePanel(c)}</div>
        {faseIndex(c.fase) < PIPELINE.length - 1 && (
          <div style={{ padding: "0 16px", marginTop: 4, marginBottom: 4 }}>
            <button onClick={() => advanceFase(c.id)} style={{ ...S.btn, background: fase?.color, fontSize: 13, padding: 10, width:"100%" }}>
              ✓ Avanza a {PIPELINE[faseIndex(c.fase) + 1]?.nome} →
            </button>
          </div>
        )}

        {/* Contact actions */}
        <div style={{ display: "flex", gap: 8, padding: "12px 16px" }}>
          {[
            { ico: ICO.phone, label: "Chiama", col: T.grn, act: () => window.open(`tel:${c.telefono || "+39000000000"}`) },
            { ico: ICO.map, label: "Naviga", col: T.blue, act: () => window.open(`https://maps.google.com/?q=${encodeURIComponent(c.indirizzo || "")}`) },
            { ico: ICO.send, label: "WhatsApp", col: "#25d366", act: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Commessa ${c.code} - ${c.cliente}`)}`) },
          ].map((a, i) => (
            <div key={i} onClick={a.act} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0", background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, cursor: "pointer" }}>
              <Ico d={a.ico} s={18} c={a.col} />
              <span style={{ fontSize: 10, fontWeight: 600, color: T.sub }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* PREVENTIVO + INVIA */}
        <div style={{ padding: "0 16px", marginBottom: 8, display:"flex", gap:8 }}>
          <input ref={fileInputRef} type="file" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const a={id:Date.now(),tipo:"file",nome:f.name,data:new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}),dataUrl:ev.target.result};setCantieri(cs=>cs.map(x=>x.id===selectedCM.id?{...x,allegati:[...(x.allegati||[]),a]}:x));setSelectedCM(p=>({...p,allegati:[...(p.allegati||[]),a]}));};r.readAsDataURL(f);e.target.value="";}}/>
          <input ref={fotoInputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const a={id:Date.now(),tipo:"foto",nome:f.name,data:new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}),dataUrl:ev.target.result};setCantieri(cs=>cs.map(x=>x.id===selectedCM.id?{...x,allegati:[...(x.allegati||[]),a]}:x));setSelectedCM(p=>({...p,allegati:[...(p.allegati||[]),a]}));};r.readAsDataURL(f);e.target.value="";}}/>
          <button onClick={() => setShowPreventivoModal(true)} style={{ flex:1, padding: "12px", borderRadius: 10, border: "1.5px solid #ff9500", background: c.firmaCliente ? "#fff8ec" : "#fff", color: "#ff9500", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, position:"relative" }}>
            📄 {c.firmaCliente ? "Preventivo ✅" : "Crea Preventivo"}
            {(c.vani||[]).some(v=>!v.sistema) && !c.firmaCliente && <span style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"#ff3b30",color:"#fff",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>!</span>}
          </button>
          <button onClick={() => setShowSendModal(true)} style={{ flex:1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #007aff, #0055cc)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,122,255,0.3)" }}>
            <Ico d={ICO.send} s={14} c="#fff" sw={2} /> Invia
          </button>
        </div>

        {/* Allegati / Note / Vocali / Video */}
        <div style={{ padding: "0 16px", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { ico: "📎", label: "File", act: () => fileInputRef.current?.click() },
              { ico: "📷", label: "Foto", act: () => fotoInputRef.current?.click() },
              { ico: "📝", label: "Nota", act: () => { setShowAllegatiModal("nota"); setAllegatiText(""); }},
              { ico: "🎤", label: "Vocale", act: () => { setShowAllegatiModal("vocale"); }},
              { ico: "🎬", label: "Video", act: () => { setShowAllegatiModal("video"); }},
            ].map((b, i) => (
              <div key={i} onClick={b.act} style={{ flex: 1, padding: "10px 4px", background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 18 }}>{b.ico}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.sub, marginTop: 2 }}>{b.label}</div>
              </div>
            ))}
          </div>
          {/* Lista allegati */}
          {(c.allegati || []).length > 0 && (
            <div style={{ marginTop: 6, background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, overflow: "hidden" }}>
              {(c.allegati || []).map(a => (
                <div key={a.id} style={{ borderBottom: `1px solid ${T.bg}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
                    <span style={{ fontSize: 16 }}>{a.tipo === "nota" ? "📝" : a.tipo === "vocale" ? "🎤" : a.tipo === "video" ? "🎬" : a.tipo === "foto" ? "📷" : "📎"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.nome}</div>
                      <div style={{ fontSize: 10, color: T.sub }}>{a.data}{a.durata ? ` · ${a.durata}` : ""}</div>
                      {a.dataUrl && (a.tipo==="foto" ? <a href={a.dataUrl} target="_blank" rel="noreferrer" style={{fontSize:10,color:T.acc,fontWeight:600,marginTop:2,display:"block",textDecoration:"none"}}>🔍 Apri</a> : <a href={a.dataUrl} download={a.nome} style={{fontSize:10,color:T.acc,fontWeight:600,marginTop:2,display:"block",textDecoration:"none"}}>⬇ Scarica</a>)}
                    </div>
                    {a.tipo==="foto"&&a.dataUrl&&<img src={a.dataUrl} style={{width:44,height:44,objectFit:"cover",borderRadius:6,flexShrink:0}} alt=""/>}
                    {(a.tipo === "vocale" || a.tipo === "video") && (
                      <div onClick={() => playAllegato(a.id)} style={{ padding: "3px 8px", borderRadius: 6, background: playingId === a.id ? T.redLt : T.accLt, fontSize: 10, fontWeight: 600, color: playingId === a.id ? T.red : T.acc, cursor: "pointer" }}>
                        {playingId === a.id ? "⏸ Stop" : "▶ Play"}
                      </div>
                    )}
                    {a.tipo === "foto" && <div onClick={() => alert("📷 Anteprima foto: " + a.nome)} style={{ padding: "3px 8px", borderRadius: 6, background: T.accLt, fontSize: 10, fontWeight: 600, color: T.acc, cursor: "pointer" }}>👁 Vedi</div>}
                    {a.tipo === "file" && <div onClick={() => alert("📎 Apertura file: " + a.nome)} style={{ padding: "3px 8px", borderRadius: 6, background: T.accLt, fontSize: 10, fontWeight: 600, color: T.acc, cursor: "pointer" }}>📂 Apri</div>}
                    <div onClick={() => { setCantieri(cs => cs.map(x => x.id === c.id ? { ...x, allegati: (x.allegati || []).filter(al => al.id !== a.id) } : x)); setSelectedCM(p => ({ ...p, allegati: (p.allegati || []).filter(al => al.id !== a.id) })); }} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={12} c={T.sub} /></div>
                  </div>
                  {/* Progress bar for playing */}
                  {playingId === a.id && (
                    <div style={{ height: 3, background: T.bdr, margin: "0 12px 6px" }}>
                      <div style={{ height: "100%", background: a.tipo === "video" ? T.blue : T.acc, borderRadius: 2, width: `${playProgress}%`, transition: "width 0.1s linear" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vani */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Vani ({c.vani.length})</div>
          <button style={S.sectionBtn} onClick={() => {
              if (!selectedCM) return;
              const tipObj = TIPOLOGIE_RAPIDE[0];
              const v = { id: Date.now(), nome: `Vano ${(selectedCM.vani?.length||0)+1}`, tipo: "F1A", stanza: "Soggiorno", piano: "PT", sistema: "", coloreInt: "", coloreEst: "", bicolore: false, coloreAcc: "", vetro: "", telaio: "", telaioAlaZ: "", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "", coprifilo: "", lamiera: "", difficoltaSalita: "", mezzoSalita: "", misure: {}, foto: {}, note: "", cassonetto: false, accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } } };
              setCantieri(cs => cs.map(c => c.id === selectedCM.id ? { ...c, vani: [...c.vani, v], aggiornato: "Oggi" } : c));
              setSelectedCM(prev => ({ ...prev, vani: [...prev.vani, v] }));
              setSelectedVano(v);
              setVanoStep(0);
            }}>+ Nuovo vano</button>
        </div>
        <div style={{ padding: "0 16px", ...((isTablet || isDesktop) && c.vani.length > 0 ? { display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } : {}) }}>
          {c.vani.length === 0 ? (
            <div onClick={() => {
              if (!selectedCM) return;
              const v = { id: Date.now(), nome: `Vano 1`, tipo: "F1A", stanza: "Soggiorno", piano: "PT", sistema: "", coloreInt: "", coloreEst: "", bicolore: false, coloreAcc: "", vetro: "", telaio: "", telaioAlaZ: "", rifilato: false, rifilSx: "", rifilDx: "", rifilSopra: "", rifilSotto: "", coprifilo: "", lamiera: "", difficoltaSalita: "", mezzoSalita: "", misure: {}, foto: {}, note: "", cassonetto: false, accessori: { tapparella: { attivo: false }, persiana: { attivo: false }, zanzariera: { attivo: false } } };
              setCantieri(cs => cs.map(c => c.id === selectedCM.id ? { ...c, vani: [...c.vani, v] } : c));
              setSelectedCM(prev => ({ ...prev, vani: [...prev.vani, v] }));
              setSelectedVano(v);
              setVanoStep(0);
            }} style={{ padding: "20px", textAlign: "center", background: T.card, borderRadius: T.r, border: `1px dashed ${T.bdr}`, cursor: "pointer", color: T.sub, fontSize: 13 }}>
              Nessun vano. Tocca per aggiungerne uno.
            </div>
          ) : c.vani.map(v => {
            const filled = Object.values(v.misure || {}).filter(x => x > 0).length;
            const total = 8;
            const fotoCount = Object.values(v.foto || {}).filter(Boolean).length;
            return (
              <div key={v.id} style={{ ...S.card, margin: "0 0 8px" }} onClick={() => setSelectedVano(v)}>
                <div style={S.cardInner}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: T.accLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.icon || "🪟"}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{v.nome}</div>
                        <div style={{ fontSize: 11, color: T.sub }}>{TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.label || v.tipo} · {v.stanza} · {v.piano}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: filled >= 6 ? T.grn : T.orange }}>{filled}/{total}<div style={{ fontSize: 10, color: T.sub, fontWeight: 400 }}>misure</div></div>
                      <div onClick={e => { e.stopPropagation(); deleteVano(v.id); }} style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: T.redLt, cursor: "pointer" }}><Ico d={ICO.trash} s={13} c={T.red} /></div>
                    </div>
                  </div>
                  {/* Tags */}
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {fotoCount > 0 && <span style={S.badge(T.blueLt, T.blue)}>{fotoCount} foto</span>}
                    {v.cassonetto && <span style={S.badge(T.orangeLt, T.orange)}>Cassonetto</span>}
                    {v.accessori?.tapparella?.attivo && <span style={S.badge(T.grnLt, T.grn)}>Tapparella</span>}
                    {v.accessori?.zanzariera?.attivo && <span style={S.badge(T.purpleLt, T.purple)}>Zanzariera</span>}
                    {v.note && <span style={S.badge(T.cyanLt, T.cyan)}>Note</span>}
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 3, background: T.bdr, borderRadius: 2, marginTop: 8 }}>
                    <div style={{ height: "100%", borderRadius: 2, background: filled >= 6 ? T.grn : T.acc, width: `${(filled / total) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline/Log */}
        {c.log && c.log.length > 0 && (
          <>
            <div style={{ ...S.section, marginTop: 8 }}>
              <div style={S.sectionTitle}>Cronologia</div>
            </div>
            <div style={{ padding: "0 16px" }}>
              {c.log.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                    {i < c.log.length - 1 && <div style={{ width: 1, flex: 1, background: T.bdr, marginTop: 4 }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: T.text, lineHeight: 1.3 }}><strong>{l.chi}</strong> {l.cosa}</div>
                    <div style={{ fontSize: 10, color: T.sub2, marginTop: 1 }}>{l.quando}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Elimina — bottom, small */}
        <div style={{ padding: "16px", textAlign: "center" }}>
          <span onClick={() => deleteCommessa(c.id)} style={{ fontSize: 11, color: T.sub2, cursor: "pointer", textDecoration: "underline" }}>🗑 Elimina commessa</span>
        </div>
      </div>
    );
  };

  /* ── RIEPILOGO COMMESSA — SCHERMATA INVIO ── */
  const [showRiepilogo, setShowRiepilogo] = useState(false);
  const [riepilogoSending, setRiepilogoSending] = useState(false);

  /* ═══════════════════════════════════════════════
     PANNELLI DI FASE — renderFasePanel(c)
     Appare nella commessa detail, sotto la pipeline
     Un pannello specifico per ogni fase
  ═══════════════════════════════════════════════ */
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

    // Campo input riusabile
    const Field = ({ label, field, placeholder, type="text" }) => (
      <div style={{marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
        <input type={type} placeholder={placeholder||""} value={c[field]||""}
          onChange={e => updateCM(field, e.target.value)}
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

    // ─── SOPRALLUOGO ───
    if (c.fase === "sopralluogo") {
      const vaniCompletati = c.vani.filter(v => Object.values(v.misure||{}).filter(x=>x>0).length >= 6).length;
      const tuttiCompletati = vaniCompletati === c.vani.length && c.vani.length > 0;
      return (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={{fontSize:16}}>🔍</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>Sopralluogo</span>
            <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color: tuttiCompletati ? T.grn : T.orange}}>
              {vaniCompletati}/{c.vani.length} vani ✓
            </span>
          </div>
          <div style={{padding:"12px 14px"}}>
            <Chip label="Fotografie scattate" done={c.ck_foto} onClick={()=>updateCM("ck_foto",!c.ck_foto)}/>
            <Chip label="Difficoltà accesso rilevata" done={c.ck_accesso} onClick={()=>updateCM("ck_accesso",!c.ck_accesso)}/>
            <Chip label="Riepilogo inviato al cliente" done={c.ck_riepilogo_inviato} onClick={()=>updateCM("ck_riepilogo_inviato",!c.ck_riepilogo_inviato)}/>
            <Chip label={`Tutte le misure inserite (${vaniCompletati}/${c.vani.length})`} done={tuttiCompletati} onClick={()=>{}}/>
            <Field label="Data sopralluogo" field="dataSopralluogo" type="date"/>
            <Field label="Note sopralluogo" field="noteSopralluogo" placeholder="Annotazioni rapide..."/>
            {tuttiCompletati && (
              <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,background:T.grn+"15",border:`1px solid ${T.grn}30`,fontSize:12,color:T.grn,fontWeight:600,textAlign:"center"}}>
                ✅ Pronto per il preventivo
              </div>
            )}
          </div>
        </div>
      );
    }

    // ─── PREVENTIVO ───
    if (c.fase === "preventivo") {
      const totale = c.vani.reduce((sum, v) => {
        const m = v.misure||{};
        const lc = (m.lCentro||0)/1000;
        const hc = (m.hCentro||0)/1000;
        const mq = lc * hc;
        const pxmq = parseFloat(c.prezzoMq||350);
        return sum + mq * pxmq;
      }, 0);
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

    // ─── CONFERMA ───
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

    // ─── MISURE ───
    if (c.fase === "misure") {
      const vaniOk = c.vani.filter(v => Object.values(v.misure||{}).filter(x=>x>0).length >= 9).length;
      return (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={{fontSize:16}}>📐</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>Rilievo Misure Definitivo</span>
            <span style={{marginLeft:"auto",fontSize:11,fontWeight:700,color: vaniOk===c.vani.length ? T.grn : T.orange}}>
              {vaniOk}/{c.vani.length}
            </span>
          </div>
          <div style={{padding:"12px 14px"}}>
            <Chip label="Tutte le misure verificate" done={c.ck_misure_ok} onClick={()=>updateCM("ck_misure_ok",!c.ck_misure_ok)}/>
            <Chip label="Diagonali controllate" done={c.ck_diag_ok} onClick={()=>updateCM("ck_diag_ok",!c.ck_diag_ok)}/>
            <Chip label="Riepilogo PDF inviato a produzione" done={c.ck_pdf_prod} onClick={()=>updateCM("ck_pdf_prod",!c.ck_pdf_prod)}/>
            <Chip label="Conferma sistema/colori approvata" done={c.ck_sistema_ok} onClick={()=>updateCM("ck_sistema_ok",!c.ck_sistema_ok)}/>
            <Field label="Tecnico misuratore" field="tecnicoMisure" placeholder="Nome tecnico..."/>
            <Field label="Data rilievo definitivo" field="dataRilievo" type="date"/>
          </div>
        </div>
      );
    }

    // ─── ORDINI ───
    if (c.fase === "ordini") {
      return (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={{fontSize:16}}>📦</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>Ordini Fornitore</span>
          </div>
          <div style={{padding:"12px 14px"}}>
            <Field label="Fornitore" field="fornitore" placeholder="Es. Schüco, Rehau..."/>
            <Field label="N° Ordine fornitore" field="numOrdine" placeholder="ORD-2026-XXXX"/>
            <Field label="Data ordine" field="dataOrdine" type="date"/>
            <Field label="Data consegna prevista" field="dataConsegna" type="date"/>
            <Chip label="Ordine inviato" done={c.ck_ordine_inviato} onClick={()=>updateCM("ck_ordine_inviato",!c.ck_ordine_inviato)}/>
            <Chip label="Conferma ricezione da fornitore" done={c.ck_ordine_confermato} onClick={()=>updateCM("ck_ordine_confermato",!c.ck_ordine_confermato)}/>
            <Chip label="Materiale in arrivo comunicato al cliente" done={c.ck_cliente_avvisato} onClick={()=>updateCM("ck_cliente_avvisato",!c.ck_cliente_avvisato)}/>
          </div>
        </div>
      );
    }

    // ─── PRODUZIONE ───
    if (c.fase === "produzione") {
      return (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={{fontSize:16}}>🏭</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>Produzione</span>
          </div>
          <div style={{padding:"12px 14px"}}>
            <Field label="Data consegna in magazzino" field="dataInMagazzino" type="date"/>
            <Chip label="Materiale ricevuto e controllato" done={c.ck_mat_ricevuto} onClick={()=>updateCM("ck_mat_ricevuto",!c.ck_mat_ricevuto)}/>
            <Chip label="Colori verificati" done={c.ck_colori_ok} onClick={()=>updateCM("ck_colori_ok",!c.ck_colori_ok)}/>
            <Chip label="Accessori completi (maniglie, guarnizioni)" done={c.ck_accessori_ok} onClick={()=>updateCM("ck_accessori_ok",!c.ck_accessori_ok)}/>
            <Chip label="Data posa confermata al cliente" done={c.ck_posa_confermata} onClick={()=>updateCM("ck_posa_confermata",!c.ck_posa_confermata)}/>
            <Field label="Note magazzino" field="noteMagazzino" placeholder="Anomalie, sostituzioni..."/>
          </div>
        </div>
      );
    }

    // ─── POSA ───
    if (c.fase === "posa") {
      return (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={{fontSize:16}}>🔧</span>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>Posa in Opera</span>
          </div>
          <div style={{padding:"12px 14px"}}>
            <Field label="Data posa effettiva" field="dataPosa" type="date"/>
            <Field label="Squadra posatori" field="squadraPosa" placeholder="Marco + Luigi..."/>
            <Chip label="Tutti i vani posati" done={c.ck_posati} onClick={()=>updateCM("ck_posati",!c.ck_posati)}/>
            <Chip label="Sigillature e finiture completate" done={c.ck_finiture} onClick={()=>updateCM("ck_finiture",!c.ck_finiture)}/>
            <Chip label="Pulizia cantiere" done={c.ck_pulizia} onClick={()=>updateCM("ck_pulizia",!c.ck_pulizia)}/>
            <Chip label="Test funzionamento maniglie/chiusure" done={c.ck_test} onClick={()=>updateCM("ck_test",!c.ck_test)}/>
            <Chip label="Foto lavoro completato scattate" done={c.ck_foto_posa} onClick={()=>updateCM("ck_foto_posa",!c.ck_foto_posa)}/>
            <Chip label="Cliente presente e soddisfatto" done={c.ck_cliente_ok} onClick={()=>updateCM("ck_cliente_ok",!c.ck_cliente_ok)}/>
            <Field label="Note posa" field="notePosa" placeholder="Problemi riscontrati, extra..."/>
          </div>
        </div>
      );
    }

    // ─── CHIUSURA ───
    if (c.fase === "chiusura") {
      const totale = c.vani.reduce((sum, v) => {
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

  const renderRiepilogo = () => {
    const c = selectedCM;
    if (!c) return null;
    const today = new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"});
    const vaniFilled = c.vani.filter(v=>Object.values(v.misure||{}).filter(x=>x>0).length>=6).length;
    const fuoriSqN = c.vani.filter(v=>{const d=v.misure?.d1>0&&v.misure?.d2>0?Math.abs(v.misure.d1-v.misure.d2):null;return d>5;}).length;

    const SEP = "━━━━━━━━━━━━━━━━━━━━━";
    const waMsg = [
      "📋 *SOPRALLUOGO "+c.code+"*",
      "👤 "+c.cliente+" "+(c.cognome||"")+(c.telefono?" · "+c.telefono:""),
      "📍 "+c.indirizzo,
      [c.pianoEdificio, c.mezzoSalita, c.foroScale].filter(Boolean).map((x,i)=>i===0?"🏢 "+x:x).join(" · "),
      c.sistema?"⚙️ "+c.sistema+" · "+(c.tipo==="nuova"?"Nuova costruzione":"Ristrutturazione"):"",
      "",
      ...c.vani.map((v,i)=>{
        const m=v.misure||{};
        const tl=TIPOLOGIE_RAPIDE.find(tp=>tp.code===v.tipo)?.label||v.tipo||"—";
        const diff=m.d1>0&&m.d2>0?Math.abs(m.d1-m.d2):null;
        const fuori=diff!==null&&diff>5;
        const ok=!fuori;
        const lines=[
          SEP,
          "*"+(i+1)+". "+v.nome.toUpperCase()+"* — "+v.tipo+" · "+v.piano+" "+(fuori?"⚠️":"✅"),
          SEP,
          "📏 L: "+(m.lAlto||"—")+" / *"+(m.lCentro||"—")+"* / "+(m.lBasso||"—"),
          "📐 H: "+(m.hSx||"—")+" / *"+(m.hCentro||"—")+"* / "+(m.hDx||"—"),
          (m.d1>0&&m.d2>0)
            ?(fuori?"⚠️ D: "+m.d1+" / "+m.d2+" — *FUORI SQUADRA +"+diff+"mm*":"↗ D: "+m.d1+" / "+m.d2+" ✅")
            :"",
          (m.spSx>0||m.spDx>0)?"⬛ Sp: "+(m.spSx?"Sx "+m.spSx:"")+(m.spDx?" · Dx "+m.spDx:"")+(m.spSopra?" · Sop "+m.spSopra:""):"",
          "",
          v.sistema?"🔧 "+v.sistema+(v.vetro?" · "+v.vetro:""):"",
          v.coloreInt?"🎨 "+(v.bicolore?"INT: "+v.coloreInt+" / EST: "+v.coloreEst:v.coloreInt):"",
          v.telaio?"📐 Tel "+v.telaio+(v.telaioAlaZ?" "+v.telaioAlaZ+"mm":"")+(v.rifilato&&(v.rifilSx||v.rifilDx)?" · Rif Sx:"+v.rifilSx+" Dx:"+v.rifilDx+(v.rifilSopra?" Sop:"+v.rifilSopra:""):""):"",
          (v.coprifilo||v.lamiera)?"🔩 "+(v.coprifilo||"")+(v.lamiera?" / "+v.lamiera:""):"",
          "",
          v.cassonetto?"📦 Cass "+v.casH+"×"+v.casP:"",
          v.accessori?.tapparella?.attivo?"⬇ Tap "+v.accessori.tapparella.colore+" · "+v.accessori.tapparella.l+"×"+v.accessori.tapparella.h:"",
          v.accessori?.persiana?.attivo?"🪟 Pers "+v.accessori.persiana.colore:"",
          v.accessori?.zanzariera?.attivo?"🕸 Zan "+v.accessori.zanzariera.l+"×"+v.accessori.zanzariera.h:"",
          v.note?"📝 "+v.note:"",
          fuori?"⚠️ Verificare con muratore prima dell'ordine":"",
        ].filter(x=>x!==undefined&&x!==null&&x!=="");
        return lines.join("\n");
      }),
      SEP,
      c.note?"📝 *NOTE GENERALI*\n"+c.note+"\n"+SEP:"",
      "",
      "_Generato con MASTRO · "+today+"_",
    ].filter(Boolean).join("\n");

    const BLU="#2563eb", VRD="#059669", ROS="#dc2626", GRY="#94a3b8", AMB="#d97706", VIO="#7c3aed";
    const FM="'DM Mono',monospace";

    // Disegno SVG per ogni tipologia
    const DrawVano = ({v}) => {
      const m = v.misure||{};
      const lc = m.lCentro||0, hc = m.hCentro||0, hasM = lc>0&&hc>0;
      const diff = m.d1>0&&m.d2>0 ? Math.abs(m.d1-m.d2) : null;
      const fuori = diff!==null && diff>5;
      const t = v.tipo||"";
      // dimensioni fisse proporzionate al tipo
      const isPorta = t==="PF1A"||t==="PF2A"||t==="PF3A"||t==="BLI";
      const isSC = t==="SC2A"||t==="SC4A"||t==="SCRDX"||t==="SCRSX"||t==="ALZDX"||t==="ALZSX"||t==="ALZSC";
      const W = isSC ? 260 : (t==="F3A"||t==="PF3A") ? 300 : (t==="F2A"||t==="PF2A") ? 220 : 160;
      const H = isPorta ? 240 : 160;
      const BW = 6; // bordo telaio fisso
      const GX = BW+10, GY = BW+10; // inizio vetro/anta
      const GW = W-GX*2, GH = H-GY*2;
      const cx = W/2, cy = H/2;
      const F = "monospace";
      const OR = "#e09010"; // arancio OB

      // Anta singola (riusabile)
      const anta1 = (ax,ay,aw,ah,ob,hingeLeft) => {
        const elems = [];
        elems.push(<rect key="v" x={ax} y={ay} width={aw} height={ah} fill="#ddeefa"/>);
        elems.push(<rect key="p" x={ax} y={ay} width={aw} height={ah} fill="none" stroke="#333" strokeWidth={1.2}/>);
        // triangolo: apice al centro del lato di apertura (opposto al cardine)
        if(hingeLeft) {
          // cardine SX → apice centro-DX
          elems.push(<line key="t1" x1={ax} y1={ay} x2={ax+aw} y2={ay+ah/2} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>);
          elems.push(<line key="t2" x1={ax} y1={ay+ah} x2={ax+aw} y2={ay+ah/2} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>);
          if(ob) {
            // OB aggiunge V vasistas in arancio (apice centro-basso)
            elems.push(<line key="ob1" x1={ax} y1={ay} x2={ax+aw/2} y2={ay+ah} stroke={OR} strokeWidth={1.2} strokeDasharray="8,4"/>);
            elems.push(<line key="ob2" x1={ax+aw} y1={ay} x2={ax+aw/2} y2={ay+ah} stroke={OR} strokeWidth={1.2} strokeDasharray="8,4"/>);
          }
          elems.push(<rect key="m" x={ax+aw-5} y={ay+ah/2-9} width={5} height={18} fill="white" stroke="#444" strokeWidth={0.8}/>);
        } else {
          // cardine DX → apice centro-SX
          elems.push(<line key="t1" x1={ax+aw} y1={ay} x2={ax} y2={ay+ah/2} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>);
          elems.push(<line key="t2" x1={ax+aw} y1={ay+ah} x2={ax} y2={ay+ah/2} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>);
          if(ob) {
            elems.push(<line key="ob1" x1={ax} y1={ay} x2={ax+aw/2} y2={ay+ah} stroke={OR} strokeWidth={1.2} strokeDasharray="8,4"/>);
            elems.push(<line key="ob2" x1={ax+aw} y1={ay} x2={ax+aw/2} y2={ay+ah} stroke={OR} strokeWidth={1.2} strokeDasharray="8,4"/>);
          }
          elems.push(<rect key="m" x={ax} y={ay+ah/2-9} width={5} height={18} fill="white" stroke="#444" strokeWidth={0.8}/>);
        }
        return elems;
      };

      let body = null;

      if (t==="F1A"||t==="PF1A") {
        body = anta1(GX,GY,GW,GH,false,true);
      } else if (t==="F2A"||t==="PF2A") {
        const hw = Math.floor((GW-8)/2);
        body = [
          <rect key="mont" x={GX+hw} y={0} width={8} height={H} fill="white" stroke="#333" strokeWidth={2}/>,
          ...anta1(GX, GY, hw, GH, false, true).map((e,i)=><g key={"l"+i}>{e}</g>),
          ...anta1(GX+hw+8, GY, GW-hw-8, GH, false, false).map((e,i)=><g key={"r"+i}>{e}</g>),
        ];
      } else if (t==="F3A"||t==="PF3A") {
        const tw = Math.floor((GW-16)/3);
        body = [
          <rect key="m1" x={GX+tw} y={0} width={8} height={H} fill="white" stroke="#333" strokeWidth={2}/>,
          <rect key="m2" x={GX+tw*2+8} y={0} width={8} height={H} fill="white" stroke="#333" strokeWidth={2}/>,
          ...anta1(GX, GY, tw, GH, true, true).map((e,i)=><g key={"a"+i}>{e}</g>),
          ...anta1(GX+tw+8, GY, tw, GH, false, true).map((e,i)=><g key={"b"+i}>{e}</g>),
          ...anta1(GX+tw*2+16, GY, tw, GH, true, false).map((e,i)=><g key={"c"+i}>{e}</g>),
        ];
      } else if (t==="SC2A"||t==="SC4A"||t==="SCRDX"||t==="SCRSX") {
        const hw = Math.floor(GW/2);
        body = [
          <line key="bt" x1={GX} y1={GY-3} x2={GX+GW} y2={GY-3} stroke="#666" strokeWidth={2}/>,
          <line key="bb" x1={GX} y1={GY+GH+3} x2={GX+GW} y2={GY+GH+3} stroke="#666" strokeWidth={2}/>,
          <rect key="la" x={GX} y={GY} width={hw} height={GH} fill="#ddeefa" stroke="#333" strokeWidth={1.5}/>,
          <rect key="lb" x={GX+hw} y={GY} width={GW-hw} height={GH} fill="#ddeefa" fillOpacity={0.4} stroke="#555" strokeWidth={0.8} strokeDasharray="5,3"/>,
          <rect key="mh" x={GX+hw-4} y={cy-9} width={4} height={18} fill="white" stroke="#444" strokeWidth={0.8}/>,
          <line key="ar" x1={GX+hw+14} y1={cy} x2={GX+hw+GW*0.35} y2={cy} stroke="#1a56db" strokeWidth={1.2}/>,
          <polygon key="ap" points={(GX+hw+GW*0.35)+","+(cy-4)+" "+(GX+hw+GW*0.35)+","+(cy+4)+" "+(GX+hw+GW*0.35+8)+","+cy} fill="#1a56db"/>,
        ];
      } else if (t==="ALZDX"||t==="ALZSX"||t==="ALZSC") {
        const hw = Math.floor(GW/2);
        body = [
          <line key="bt" x1={GX} y1={GY-3} x2={GX+GW} y2={GY-3} stroke="#666" strokeWidth={2}/>,
          <line key="bb" x1={GX} y1={GY+GH+3} x2={GX+GW} y2={GY+GH+3} stroke="#666" strokeWidth={2}/>,
          <rect key="la" x={GX} y={GY} width={hw} height={GH} fill="#ddeefa" stroke="#333" strokeWidth={1.5}/>,
          <rect key="lb" x={GX+hw} y={GY} width={GW-hw} height={GH} fill="#ddeefa" fillOpacity={0.4} stroke="#555" strokeWidth={0.8} strokeDasharray="5,3"/>,
          <line key="av" x1={GX+hw+GW*0.22} y1={cy+12} x2={GX+hw+GW*0.22} y2={cy-14} stroke="#1a56db" strokeWidth={1.2}/>,
          <polygon key="ap" points={(GX+hw+GW*0.22-4)+","+(cy-10)+" "+(GX+hw+GW*0.22+4)+","+(cy-10)+" "+(GX+hw+GW*0.22)+","+(cy-18)} fill="#1a56db"/>,
        ];
      } else if (t==="VAS") {
        body = [
          <rect key="v" x={GX} y={GY} width={GW} height={GH} fill="#ddeefa"/>,
          <rect key="p" x={GX} y={GY} width={GW} height={GH} fill="none" stroke="#333" strokeWidth={1.2}/>,
          <line key="v1" x1={GX} y1={GY} x2={cx} y2={GY+GH} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>,
          <line key="v2" x1={GX+GW} y1={GY} x2={cx} y2={GY+GH} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>,
          <rect key="m" x={cx-12} y={GY+GH-4} width={24} height={4} fill="white" stroke="#444" strokeWidth={0.8}/>,
        ];
      } else if (t==="RIBALTA") {
        body = [
          <rect key="v" x={GX} y={GY} width={GW} height={GH} fill="#ddeefa"/>,
          <rect key="p" x={GX} y={GY} width={GW} height={GH} fill="none" stroke="#333" strokeWidth={1.2}/>,
          <line key="v1" x1={GX} y1={GY+GH} x2={cx} y2={GY} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>,
          <line key="v2" x1={GX+GW} y1={GY+GH} x2={cx} y2={GY} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>,
          <rect key="m" x={cx-12} y={GY} width={24} height={4} fill="white" stroke="#444" strokeWidth={0.8}/>,
        ];
      } else if (t==="BLI") {
        body = [
          <rect key="v" x={GX} y={GY} width={GW} height={GH} fill="#ddeefa"/>,
          <rect key="p" x={GX} y={GY} width={GW} height={GH} fill="none" stroke="#333" strokeWidth={2}/>,
          <line key="t1" x1={GX} y1={GY} x2={GX+GW} y2={cy} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>,
          <line key="t2" x1={GX} y1={GY+GH} x2={GX+GW} y2={cy} stroke="#333" strokeWidth={1} strokeDasharray="8,4"/>,
          <rect key="m" x={GX+GW-5} y={cy-11} width={5} height={22} fill="white" stroke="#444" strokeWidth={0.8}/>,
          <circle key="mk" cx={GX+GW-3} cy={cy} r={5} fill="white" stroke="#333" strokeWidth={1.2}/>,
        ];
      } else if (t==="FISDX"||t==="FISSX"||t==="SOPR") {
        body = [<rect key="v" x={GX} y={GY} width={GW} height={GH} fill="#ddeefa"/>];
      } else {
        body = [
          <rect key="v" x={GX} y={GY} width={GW} height={GH} fill="#ddeefa"/>,
          <text key="tx" x={cx} y={cy+4} textAnchor="middle" fontSize={10} fill="#888" fontFamily={F}>{t||"?"}</text>
        ];
      }

      // soglia per porte
      const hasSoglia = isPorta || t==="SC2A"||t==="ALZDX"||t==="ALZSX";

      return (
        <svg viewBox={"0 0 "+W+" "+H} width="100%" style={{display:"block",background:"white",border:"1px solid #ddd",borderRadius:3}}>
          {/* cassonetto */}
          {v.cassonetto&&<rect x={0} y={-14} width={W} height={14} fill="#fffde7" stroke="#ca8a04" strokeWidth={0.8}/>}
          {v.cassonetto&&<text x={cx} y={-4} textAnchor="middle" fontSize={6} fill="#92400e" fontFamily={F} fontWeight="700">{"CASS. "+v.casH+"×"+v.casP}</text>}
          {/* telaio fisso */}
          <rect x={1} y={1} width={W-2} height={H-2} fill="white" stroke="#333" strokeWidth={BW}/>
          {/* soglia */}
          {hasSoglia&&<line x1={1} y1={H-BW/2} x2={W-1} y2={H-BW/2} stroke="#333" strokeWidth={3}/>}
          {/* corpo */}
          {body}
          {/* quadratura: solo badge, no linee */}
          {fuori&&<rect x={cx-26} y={cy-9} width={52} height={18} rx={3} fill="#dc2626"/>}
          {fuori&&<text x={cx} y={cy+4} textAnchor="middle" fontSize={9} fill="white" fontFamily={F} fontWeight="700">{"⚠ +"+diff+"mm"}</text>}
          {!fuori&&diff!==null&&<rect x={cx-18} y={cy-7} width={36} height={14} rx={3} fill="#15803d"/>}
          {!fuori&&diff!==null&&<text x={cx} y={cy+4} textAnchor="middle" fontSize={8} fill="white" fontFamily={F} fontWeight="700">{"✓ sq."}</text>}
          {/* quote */}
          {hasM&&<rect x={cx-26} y={1} width={52} height={14} rx={2} fill="#1d4ed8"/>}
          {hasM&&<text x={cx} y={12} textAnchor="middle" fontSize={10} fill="white" fontFamily={F} fontWeight="700">{lc}</text>}
          {hasM&&<rect x={1} y={cy-8} width={14} height={16} rx={2} fill="#15803d"/>}
          {hasM&&<text x={8} y={cy+4} textAnchor="middle" fontSize={10} fill="white" fontFamily={F} fontWeight="700" transform={"rotate(-90,8,"+cy+")"}>{hc}</text>}
          {/* badge telaio/accessori */}
          {v.telaio&&<text x={GX+2} y={GY+9} fontSize={6} fill="#6d28d9" fontFamily={F} fontWeight="700">{"Tel."+v.telaio+(v.telaio==="Z"&&v.telaioAlaZ?" "+v.telaioAlaZ:"")}</text>}
          {v.accessori?.tapparella?.attivo&&<text x={GX+GW-2} y={GY+9} textAnchor="end" fontSize={6} fill="#d97706" fontFamily={F} fontWeight="700">TAP</text>}
          {v.accessori?.zanzariera?.attivo&&<text x={GX+GW-2} y={GY+17} textAnchor="end" fontSize={6} fill="#6d28d9" fontFamily={F} fontWeight="700">ZAN</text>}
        </svg>
      );
    };

    return (
      <div style={{paddingBottom:110,background:"#f1f5f9",minHeight:"100vh"}}>
        {/* Header */}
        <div style={{background:"#0f172a",padding:"13px 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10}}>
          <div onClick={()=>setShowRiepilogo(false)} style={{cursor:"pointer",padding:4}}>
            <Ico d={ICO.back} s={20} c="#64748b"/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:"white"}}>Riepilogo Sopralluogo</div>
            <div style={{fontSize:10,color:"#64748b"}}>{c.code} · {c.cliente} {c.cognome||""} · {today}</div>
          </div>
          <div style={{padding:"4px 8px",borderRadius:6,background:vaniFilled===c.vani.length?"#16a34a":"#d97706",fontSize:10,fontWeight:700,color:"white"}}>{vaniFilled}/{c.vani.length} ✓</div>
        </div>

        <div style={{padding:"10px 12px"}}>
          {/* Dati cantiere */}
          <div style={{background:"white",borderRadius:10,border:"1px solid #e2e8f0",padding:"12px 14px",marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:9,fontWeight:800,color:BLU,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>📍 Dati Cantiere</div>
            <div style={{display:"grid",gridTemplateColumns:"80px 1fr",gap:"3px 8px",fontSize:11.5}}>
              <span style={{color:GRY,fontWeight:600}}>Cliente</span><span style={{fontWeight:700}}>{c.cliente} {c.cognome||""}</span>
              <span style={{color:GRY,fontWeight:600}}>Indirizzo</span><span>{c.indirizzo}</span>
              {c.telefono&&<><span style={{color:GRY,fontWeight:600}}>Tel</span><span>{c.telefono}</span></>}
              {c.pianoEdificio&&<><span style={{color:GRY,fontWeight:600}}>Piano</span><span style={{fontWeight:600}}>{c.pianoEdificio}</span></>}
              {c.mezzoSalita&&<><span style={{color:GRY,fontWeight:600}}>Salita</span><span>{c.mezzoSalita}</span></>}
              {c.sistema&&<><span style={{color:GRY,fontWeight:600}}>Sistema</span><span style={{fontWeight:700,color:BLU}}>{c.sistema}</span></>}
            </div>
            {c.note&&<div style={{marginTop:8,padding:"5px 8px",background:"#fffbeb",borderRadius:6,fontSize:11,color:"#713f12",borderLeft:"3px solid "+AMB}}>📝 {c.note}</div>}
          </div>

          {/* Vani */}
          {c.vani.map((v,vi)=>{
            const m=v.misure||{};
            const lc=m.lCentro||0, hc=m.hCentro||0;
            const diff=m.d1>0&&m.d2>0?Math.abs(m.d1-m.d2):null;
            const fuori=diff!==null&&diff>5;
            const misN=Object.values(m).filter(x=>x>0).length;
            const tipLabel=TIPOLOGIE_RAPIDE.find(tp=>tp.code===v.tipo)?.label||v.tipo||"—";
            return (
              <div key={v.id} style={{background:"white",borderRadius:10,border:"1.5px solid "+(fuori?"#fca5a5":"#e2e8f0"),marginBottom:10,overflow:"hidden"}}>
                {/* Header */}
                <div style={{padding:"8px 12px",background:fuori?"#fef2f2":"#0f172a",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:800,color:fuori?"#991b1b":"white"}}>{vi+1}. {v.nome}</span>
                    <span style={{fontSize:10,color:fuori?"#b91c1c":"#64748b",marginLeft:6}}>{tipLabel} · {v.stanza} · {v.piano}</span>
                  </div>
                  <div style={{display:"flex",gap:3}}>
                    {fuori&&<span style={{padding:"2px 6px",borderRadius:3,background:ROS,color:"white",fontSize:8,fontWeight:800}}>⚠ +{diff}mm</span>}
                    <span style={{padding:"2px 6px",borderRadius:3,background:misN>=6?"#16a34a":"#d97706",color:"white",fontSize:8,fontWeight:700}}>{misN}mis</span>
                  </div>
                </div>

                <div style={{display:"flex"}}>
                  {/* SVG disegno */}
                  <div style={{width:"50%",padding:"10px 6px 8px 10px",borderRight:"1px solid #f1f5f9"}}>
                    <div style={{fontSize:7,fontWeight:700,color:GRY,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Schema</div>
                    <DrawVano v={v}/>
                  </div>

                  {/* Misure */}
                  <div style={{flex:1,padding:"10px 10px 8px 10px"}}>
                    <div style={{fontSize:7,fontWeight:700,color:GRY,textTransform:"uppercase",marginBottom:5}}>Misure (mm)</div>
                    {[["LARGH",BLU,[["Alto",m.lAlto],["Centro●",m.lCentro],["Basso",m.lBasso]]],
                      ["ALT",VRD,[["Sx",m.hSx],["Centro●",m.hCentro],["Dx",m.hDx]]]
                    ].map(([lbl,col,rows])=>(
                      <div key={lbl} style={{marginBottom:5}}>
                        <div style={{fontSize:7,fontWeight:800,color:col,marginBottom:2,display:"flex",alignItems:"center",gap:2}}>
                          <span style={{width:6,height:6,borderRadius:1,background:col,display:"inline-block"}}/>
                          {lbl}
                        </div>
                        {rows.map(([l,val])=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:10.5,padding:"1.5px 0",borderBottom:"1px solid #f8fafc"}}>
                            <span style={{color:GRY,fontSize:9.5}}>{l}</span>
                            <span style={{fontWeight:700,color:val?"#0f172a":"#e2e8f0",fontFamily:"'DM Mono',monospace"}}>{val||"—"}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    {(m.d1>0||m.d2>0)&&<div style={{marginBottom:4}}>
                      <div style={{fontSize:7,fontWeight:800,color:fuori?ROS:VIO,marginBottom:2}}>DIAG. {fuori?"⚠ +"+diff:"✓"}</div>
                      {[["D1↗",m.d1],["D2↘",m.d2]].map(([l,val])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:10.5,padding:"1px 0"}}>
                          <span style={{color:GRY,fontSize:9.5}}>{l}</span>
                          <span style={{fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{val||"—"}</span>
                        </div>
                      ))}
                    </div>}
                    {(m.spSx>0||m.spDx>0)&&<div>
                      <div style={{fontSize:7,fontWeight:800,color:AMB,marginBottom:2}}>SPALL.</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {[["Sx",m.spSx],["Dx",m.spDx],["Sop",m.spSopra]].filter(([,val])=>val>0).map(([l,val])=>(
                          <span key={l} style={{fontSize:10}}><span style={{color:GRY,fontSize:9}}>{l} </span><strong style={{fontFamily:"'DM Mono',monospace"}}>{val}</strong></span>
                        ))}
                      </div>
                    </div>}
                  </div>
                </div>

                {/* Prodotto */}
                {(v.sistema||v.vetro||v.telaio||v.accessori?.tapparella?.attivo||v.accessori?.zanzariera?.attivo||v.accessori?.persiana?.attivo||v.cassonetto||v.note)&&(
                  <div style={{padding:"7px 12px",background:"#f8fafc",borderTop:"1px solid #f1f5f9"}}>
                    <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:3}}>
                      {v.sistema&&<span style={{padding:"2px 7px",borderRadius:4,background:"#eff6ff",color:"#1d4ed8",fontSize:9.5,fontWeight:700}}>⚙ {v.sistema}</span>}
                      {v.vetro&&<span style={{padding:"2px 7px",borderRadius:4,background:"#f0fdf4",color:"#15803d",fontSize:9.5,fontWeight:700}}>🔲 {v.vetro}</span>}
                      {v.coloreInt&&<span style={{padding:"2px 7px",borderRadius:4,background:"#fafafa",border:"1px solid #e2e8f0",color:"#374151",fontSize:9.5}}>🎨 {v.bicolore?"INT:"+v.coloreInt+"/EST:"+v.coloreEst:v.coloreInt}</span>}
                      {v.telaio&&<span style={{padding:"2px 7px",borderRadius:4,background:"#f5f3ff",color:"#6d28d9",fontSize:9.5,fontWeight:700}}>📐 Tel.{v.telaio}{v.telaio==="Z"&&v.telaioAlaZ?" ("+v.telaioAlaZ+"mm)":""}</span>}
                      {v.rifilato&&(v.rifilSx||v.rifilDx)&&<span style={{padding:"2px 7px",borderRadius:4,background:"#fdf4ff",color:"#7e22ce",fontSize:9.5}}>Rif Sx:{v.rifilSx} Dx:{v.rifilDx} Sop:{v.rifilSopra}</span>}
                      {v.coprifilo&&<span style={{padding:"2px 7px",borderRadius:4,background:"#fefce8",color:"#92400e",fontSize:9.5}}>🔩 {v.coprifilo}</span>}
                      {v.lamiera&&<span style={{padding:"2px 7px",borderRadius:4,background:"#fff7ed",color:"#9a3412",fontSize:9.5}}>📏 {v.lamiera}</span>}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                      {v.cassonetto&&<span style={{padding:"2px 7px",borderRadius:4,background:"#fef3c7",color:"#b45309",fontSize:9.5,fontWeight:700}}>📦 Cass. {v.casH}×{v.casP}</span>}
                      {v.accessori?.tapparella?.attivo&&<span style={{padding:"2px 7px",borderRadius:4,background:"#fef3c7",color:"#b45309",fontSize:9.5,fontWeight:700}}>⬇ Tap. {v.accessori.tapparella.colore} {v.accessori.tapparella.l}×{v.accessori.tapparella.h}</span>}
                      {v.accessori?.persiana?.attivo&&<span style={{padding:"2px 7px",borderRadius:4,background:"#eff6ff",color:"#1e40af",fontSize:9.5,fontWeight:700}}>🪟 Pers. {v.accessori.persiana.colore}</span>}
                      {v.accessori?.zanzariera?.attivo&&<span style={{padding:"2px 7px",borderRadius:4,background:"#fdf4ff",color:"#6b21a8",fontSize:9.5,fontWeight:700}}>🕸 Zan. {v.accessori.zanzariera.l}×{v.accessori.zanzariera.h}</span>}
                    </div>
                    {v.note&&<div style={{marginTop:5,fontSize:10.5,color:"#475569",fontStyle:"italic",padding:"3px 6px",background:"#fffbeb",borderRadius:4,borderLeft:"2px solid "+AMB}}>📝 {v.note}</div>}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sommario */}
          <div style={{background:"#0f172a",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Sommario</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["Vani",c.vani.length,"#60a5fa"],["Misure ✓",vaniFilled,"#4ade80"],["⚠ Fuori sq.",fuoriSqN,fuoriSqN>0?"#fbbf24":"#4ade80"]].map(([l,val,col])=>(
                <div key={l} style={{textAlign:"center",padding:"8px 4px",background:"rgba(255,255,255,0.05)",borderRadius:8}}>
                  <div style={{fontSize:22,fontWeight:800,color:col,fontFamily:"'DM Mono',monospace"}}>{val}</div>
                  <div style={{fontSize:8,color:"#94a3b8",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Anteprima messaggio WA */}
          <div style={{background:"#dcf8c6",border:"1.5px solid #16a34a",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
            <div style={{fontSize:9,fontWeight:800,color:"#166534",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>📱 Anteprima messaggio</div>
            <pre style={{fontFamily:"'DM Mono',monospace",fontSize:9.5,color:"#14532d",whiteSpace:"pre-wrap",lineHeight:1.65,margin:0,maxHeight:220,overflow:"auto"}}>{waMsg}</pre>
          </div>

        {/* Barra invio */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"2px solid #e2e8f0",padding:"10px 12px 22px",boxShadow:"0 -6px 20px rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:9,fontWeight:700,color:GRY,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,textAlign:"center"}}>Invia riepilogo</div>
          <div style={{display:"flex",gap:8}}>
            <div onClick={()=>window.open("https://wa.me/?text="+encodeURIComponent(waMsg))}
              style={{flex:1,padding:"13px 8px",borderRadius:11,background:"#16a34a",color:"white",textAlign:"center",cursor:"pointer",fontWeight:800,fontSize:13}}>💬 WhatsApp</div>
            <div onClick={()=>window.open("mailto:?subject="+encodeURIComponent("Sopralluogo "+c.code)+"&body="+encodeURIComponent(waMsg.replace(/\*/g,"")))}
              style={{flex:1,padding:"13px 8px",borderRadius:11,background:BLU,color:"white",textAlign:"center",cursor:"pointer",fontWeight:800,fontSize:13}}>📧 Email</div>
            <div onClick={()=>window.print()}
              style={{padding:"13px 14px",borderRadius:11,background:"#f1f5f9",color:"#475569",cursor:"pointer",fontWeight:800,fontSize:15}}>🖨</div>
          </div>
        </div>
      </div>
    );
  };

  /* ── VANO DETAIL — WIZARD A STEP ── */
  const STEPS = [
    { id: "larghezze", title: "LARGHEZZE", desc: "Misura la larghezza in 3 punti: alto, centro, basso", color: "#507aff", icon: "📏", fields: ["lAlto", "lCentro", "lBasso"], labels: ["Larghezza ALTO", "Larghezza CENTRO (luce netta)", "Larghezza BASSO"] },
    { id: "altezze", title: "ALTEZZE", desc: "Misura l'altezza in 3 punti: sinistra, centro, destra", color: "#34c759", icon: "📐", fields: ["hSx", "hCentro", "hDx"], labels: ["Altezza SINISTRA", "Altezza CENTRO", "Altezza DESTRA"] },
    { id: "diagonali", title: "DIAGONALI", desc: "Misura le 2 diagonali per verificare la squadra", color: "#ff9500", icon: "✕", fields: ["d1", "d2"], labels: ["Diagonale 1 ↗", "Diagonale 2 ↘"] },
    { id: "spallette", title: "SPALLETTE", desc: "Misura le spallette e l'imbotte", color: "#32ade6", icon: "🧱", fields: ["spSx", "spDx", "spSopra", "imbotte"], labels: ["Spalletta SINISTRA", "Spalletta DESTRA", "Spalletta SOPRA", "Profondità IMBOTTE"] },
    { id: "davanzale", title: "DAVANZALE", desc: "Davanzale, soglia e cassonetto", color: "#ff2d55", icon: "⬇", fields: ["davProf", "davSporg", "soglia"], labels: ["Davanzale PROFONDITÀ", "Davanzale SPORGENZA", "Altezza SOGLIA"] },
    { id: "accessori", title: "ACCESSORI", desc: "Tapparella, persiana, zanzariera", color: "#af52de", icon: "+" },
    { id: "disegno", title: "DISEGNO + FOTO", desc: "Disegna, fotografa e annota il vano", color: "#ff6b6b", icon: "📷" },
    { id: "riepilogo", title: "RIEPILOGO", desc: "Anteprima completa del vano", color: "#34c759", icon: "📋" },
  ];

  const renderVanoDetail = () => {
    const v = selectedVano;
    const m = v.misure || {};
    const step = STEPS[vanoStep];
    const filled = Object.values(m).filter(x => x > 0).length;
    const TIPO_TIPS = { Scorrevole: { t: "Scorrevole (alzante/traslante)", dim: "2000 × 2200 mm", w: ["Binario inferiore: serve spazio incasso", "Verifica portata parete"] }, Portafinestra: { t: "Portafinestra standard", dim: "800-900 × 2200 mm", w: ["Soglia a taglio termico", "Verifica altezza architrave"] }, Finestra: { t: "Finestra", dim: "1200 × 1400 mm", w: ["Verifica spazio per anta"] } };
    const tip = TIPO_TIPS[v.tipo] || null;
    const hasWarnings = !m.lAlto && !m.lCentro && !m.lBasso;
    const hasHWarnings = !m.hSx && !m.hCentro && !m.hDx;
    const fSq = m.d1 > 0 && m.d2 > 0 ? Math.abs(m.d1 - m.d2) : null;

    // Mini SVG per step
    const MiniSVG = ({ type }) => {
      const w = 60, h = 70;
      return (
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: "block" }}>
          <rect x={5} y={5} width={w-10} height={h-10} fill={step.color + "12"} stroke={step.color + "40"} strokeWidth={1.5} rx={3} />
          {type === "larghezze" && <>
            <line x1={10} y1={18} x2={w-10} y2={18} stroke={step.color} strokeWidth={1.2} strokeDasharray="3,2" />
            <line x1={10} y1={h/2} x2={w-10} y2={h/2} stroke={step.color} strokeWidth={1.2} strokeDasharray="3,2" />
            <line x1={10} y1={h-18} x2={w-10} y2={h-18} stroke={step.color} strokeWidth={1.2} strokeDasharray="3,2" />
          </>}
          {type === "altezze" && <>
            <line x1={14} y1={10} x2={14} y2={h-10} stroke={step.color} strokeWidth={1.2} strokeDasharray="3,2" />
            <line x1={w/2} y1={10} x2={w/2} y2={h-10} stroke={step.color} strokeWidth={1.2} strokeDasharray="3,2" />
            <line x1={w-14} y1={10} x2={w-14} y2={h-10} stroke={step.color} strokeWidth={1.2} strokeDasharray="3,2" />
          </>}
          {type === "diagonali" && <>
            <line x1={10} y1={10} x2={w-10} y2={h-10} stroke={step.color} strokeWidth={1.2} strokeDasharray="3,2" />
            <line x1={w-10} y1={10} x2={10} y2={h-10} stroke={step.color} strokeWidth={1.2} strokeDasharray="3,2" />
          </>}
          {type === "spallette" && <>
            <rect x={2} y={5} width={10} height={h-10} fill={step.color + "25"} stroke={step.color+"60"} rx={1} />
            <rect x={w-12} y={5} width={10} height={h-10} fill={step.color + "25"} stroke={step.color+"60"} rx={1} />
            <rect x={5} y={2} width={w-10} height={8} fill={step.color + "18"} stroke={step.color+"40"} rx={1} />
          </>}
          {type === "davanzale" && <>
            <rect x={5} y={h-16} width={w-10} height={10} fill={step.color + "25"} stroke={step.color+"60"} rx={1} />
          </>}
        </svg>
      );
    };

    // Inline input renderer (no sub-component = no focus loss)
    const bInput = (label, field) => (
      <div key={field} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 4 }}>{label}</div>
        <input
          key={`input-${field}`}
          style={{ width: "100%", padding: "14px 16px", fontSize: 17, fontWeight: 500, fontFamily: FM, textAlign: "center", border: `1px solid ${T.bdr}`, borderRadius: 12, background: m[field] > 0 ? step.color + "08" : T.card, color: T.text, outline: "none", boxSizing: "border-box" }}
          type="number" inputMode="numeric" placeholder="Tocca per inserire" value={m[field] || ""}
          onChange={e => updateMisura(v.id, field, e.target.value)}
        />
      </div>
    );

    return (
      <div style={{ paddingBottom: 80, background: T.bg }}>
        {/* Back + vano name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.card, borderBottom: `1px solid ${T.bdr}` }}>
          <div onClick={() => { setSelectedVano(null); setVanoStep(0); }} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={20} c={T.sub} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{v.nome}</div>
            <div style={{ fontSize: 10, color: T.sub }}>{TIPOLOGIE_RAPIDE.find(t => t.code === v.tipo)?.label || v.tipo} · {v.stanza} · {v.piano}</div>
          </div>
          <div onClick={() => { setShowAIPhoto(true); setAiPhotoStep(0); }} style={{ padding: "5px 10px", borderRadius: 8, background: "linear-gradient(135deg, #af52de20, #007aff20)", border: "1px solid #af52de40", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#af52de" }}>AI</span>
          </div>
        </div>

        {/* ── INFO VANO — fisarmoniche (solo step 0) ── */}
        {vanoStep === 0 && (() => {
          const updateV = (field, val) => {
            setCantieri(cs => cs.map(c => c.id === selectedCM?.id
              ? { ...c, vani: c.vani.map(vn => vn.id === v.id ? { ...vn, [field]: val } : vn) } : c));
            setSelectedVano(prev => ({ ...prev, [field]: val }));
          };
          const cats = ["Finestre","Balconi","Scorrevoli","Persiane","Altro"];
          const pianiList = ["S2","S1","PT","P1","P2","P3","P4","P5","P6","P7","P8","P9","P10","P11","P12","P13","P14","P15","P16","P17","P18","P19","P20","M"];
          const coloriRAL = ["RAL 9010","RAL 9016","RAL 9001","RAL 7016","RAL 7021","RAL 8014","RAL 8016","RAL 1013","Altro"];

          const sections = [
            { id:"accesso", icon:"🏗", label:"Accesso / Difficoltà",
              badge: v.difficoltaSalita||null,
              body: <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",gap:4}}>
                  {[{id:"facile",l:"Facile",c:T.grn,e:"✅"},{id:"media",l:"Media",c:T.orange,e:"⚠️"},{id:"difficile",l:"Difficile",c:T.red,e:"🔴"}].map(d=>(
                    <div key={d.id} onClick={()=>updateV("difficoltaSalita",d.id)}
                      style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1.5px solid ${v.difficoltaSalita===d.id?d.c:T.bdr}`,background:v.difficoltaSalita===d.id?d.c+"15":T.card,textAlign:"center",cursor:"pointer"}}>
                      <div style={{fontSize:13}}>{d.e}</div>
                      <div style={{fontSize:10,fontWeight:700,color:v.difficoltaSalita===d.id?d.c:T.sub}}>{d.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:2}}>MEZZO DI SALITA</div>
                <select style={S.select} value={v.mezzoSalita||""} onChange={e=>updateV("mezzoSalita",e.target.value)}>
                  <option value="">— Seleziona —</option>
                  {mezziSalita.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            },
            { id:"tipologia", icon:"🪟", label:"Tipologia",
              badge: v.tipo||null,
              body: <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",gap:2,borderBottom:`1px solid ${T.bdr}`,paddingBottom:0,marginBottom:4}}>
                  {cats.map(cat=>(
                    <div key={cat} onClick={()=>setTipCat(cat)}
                      style={{padding:"5px 8px",fontSize:10,fontWeight:700,cursor:"pointer",color:tipCat===cat?T.acc:T.sub,borderBottom:`2px solid ${tipCat===cat?T.acc:"transparent"}`,marginBottom:-1,whiteSpace:"nowrap"}}>
                      {cat}
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
                  {TIPOLOGIE_RAPIDE.filter(t=>t.cat===tipCat).map(t=>(
                    <div key={t.code} onClick={()=>updateV("tipo",t.code)}
                      style={{padding:"7px 10px",borderRadius:10,border:`1.5px solid ${v.tipo===t.code?T.acc:T.bdr}`,background:v.tipo===t.code?T.accLt:T.card,fontSize:11,fontWeight:700,color:v.tipo===t.code?T.acc:T.text,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                      {t.icon} {t.code}
                    </div>
                  ))}
                </div>
              </div>
            },
            { id:"posizione", icon:"🏠", label:"Stanza / Piano",
              badge: v.stanza?`${v.stanza} · ${v.piano}`:null,
              body: <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3}}>STANZA</div>
                  <select style={S.select} value={v.stanza||""} onChange={e=>updateV("stanza",e.target.value)}>
                    {["Soggiorno","Cucina","Camera","Bagno","Studio","Ingresso","Corridoio","Altro"].map(x=><option key={x}>{x}</option>)}
                  </select>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3}}>PIANO</div>
                  <select style={S.select} value={v.piano||""} onChange={e=>updateV("piano",e.target.value)}>
                    {pianiList.map(p=><option key={p} value={p}>{p==="S2"?"S2 — 2° Seminterrato":p==="S1"?"S1 — Seminterrato":p==="PT"?"PT — Piano Terra":p==="M"?"M — Mansarda":`${p} — ${p.replace("P","")}° Piano`}</option>)}
                  </select>
                </div>
              </div>
            },
            { id:"sistema", icon:"⚙️", label:"Sistema / Vetro",
              badge: v.sistema?v.sistema.split(" ").slice(0,2).join(" "):null,
              body: <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3}}>SISTEMA</div>
                  <select style={S.select} value={v.sistema||""} onChange={e=>updateV("sistema",e.target.value)}>
                    <option value="">— Seleziona —</option>
                    {sistemiDB.map(s=><option key={s.id} value={`${s.marca} ${s.sistema}`}>{s.marca} {s.sistema}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3}}>VETRO</div>
                  <select style={S.select} value={v.vetro||""} onChange={e=>updateV("vetro",e.target.value)}>
                    <option value="">— Seleziona —</option>
                    {vetriDB.map(g=><option key={g.id} value={g.code}>{g.code} Ug={g.ug}</option>)}
                  </select>
                </div>
              </div>
            },
            { id:"colori", icon:"🎨", label:"Colori profili",
              badge: v.coloreInt||null,
              body: <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.sub}}>INT</div>
                  <div onClick={()=>updateV("bicolore",!v.bicolore)}
                    style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:v.bicolore?T.accLt:"transparent",border:`1px solid ${v.bicolore?T.acc:T.bdr}`,color:v.bicolore?T.acc:T.sub,cursor:"pointer",fontWeight:600}}>
                    Bicolore {v.bicolore?"✓":""}
                  </div>
                </div>
                {!v.bicolore
                  ? <select style={S.select} value={v.coloreInt||""} onChange={e=>updateV("coloreInt",e.target.value)}>
                      <option value="">— Seleziona —</option>
                      {coloriDB.map(c=><option key={c.id} value={c.code}>{c.code} — {c.nome}</option>)}
                    </select>
                  : <div style={{display:"flex",gap:6}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:T.sub,marginBottom:2}}>INT</div>
                        <select style={S.select} value={v.coloreInt||""} onChange={e=>updateV("coloreInt",e.target.value)}>
                          <option value="">—</option>{coloriDB.map(c=><option key={c.id} value={c.code}>{c.code}</option>)}
                        </select>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:T.sub,marginBottom:2}}>EST</div>
                        <select style={S.select} value={v.coloreEst||""} onChange={e=>updateV("coloreEst",e.target.value)}>
                          <option value="">—</option>{coloriDB.map(c=><option key={c.id} value={c.code}>{c.code}</option>)}
                        </select>
                      </div>
                    </div>
                }
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3}}>ACCESSORI</div>
                  <select style={S.select} value={v.coloreAcc||""} onChange={e=>updateV("coloreAcc",e.target.value)}>
                    <option value="">— Come profili —</option>
                    {coloriDB.map(c=><option key={c.id} value={c.code}>{c.code} — {c.nome}</option>)}
                  </select>
                </div>
              </div>
            },
            { id:"telaio", icon:"📐", label:"Telaio / Rifilato",
              badge: v.telaio?(v.telaio==="Z"?"Telaio Z":"Telaio L"):(v.rifilato?"Rifilato":null),
              body: <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",gap:6}}>
                  {[{id:"Z",l:"Telaio a Z"},{id:"L",l:"Telaio a L"}].map(t=>(
                    <div key={t.id} onClick={()=>updateV("telaio",v.telaio===t.id?"":t.id)}
                      style={{flex:1,padding:"9px",borderRadius:8,border:`1.5px solid ${v.telaio===t.id?T.acc:T.bdr}`,background:v.telaio===t.id?T.accLt:T.card,textAlign:"center",fontSize:12,fontWeight:700,color:v.telaio===t.id?T.acc:T.sub,cursor:"pointer"}}>
                      {t.l}
                    </div>
                  ))}
                </div>
                {v.telaio==="Z" && <div>
                  <div style={{fontSize:10,color:T.sub,fontWeight:600,marginBottom:2}}>Lunghezza ala (mm)</div>
                  <input style={S.input} type="number" inputMode="numeric" placeholder="es. 35" value={v.telaioAlaZ||""} onChange={e=>updateV("telaioAlaZ",e.target.value)}/>
                </div>}
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div onClick={()=>updateV("rifilato",!v.rifilato)}
                    style={{width:40,height:22,borderRadius:11,background:v.rifilato?T.acc:T.bdr,cursor:"pointer",position:"relative",flexShrink:0}}>
                    <div style={{position:"absolute",top:2,left:v.rifilato?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.15s"}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>Rifilato</span>
                </div>
                {v.rifilato && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[["rifilSx","↙ Sx"],["rifilDx","↘ Dx"],["rifilSopra","↑ Sopra"],["rifilSotto","↓ Sotto"]].map(([f,l])=>(
                    <div key={f}><div style={{fontSize:9,color:T.sub,fontWeight:600,marginBottom:2}}>{l} (mm)</div>
                    <input style={S.input} type="number" inputMode="numeric" placeholder="0" value={v[f]||""} onChange={e=>updateV(f,e.target.value)}/></div>
                  ))}
                </div>}
              </div>
            },
            { id:"finiture", icon:"🔩", label:"Coprifilo / Lamiera",
              badge: (v.coprifilo||v.lamiera)?"✓":null,
              body: <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3}}>COPRIFILO</div>
                  <select style={S.select} value={v.coprifilo||""} onChange={e=>updateV("coprifilo",e.target.value)}>
                    <option value="">— No —</option>
                    {coprifiliDB.map(c=><option key={c.id} value={c.cod}>{c.cod} — {c.nome}</option>)}
                  </select>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:3}}>LAMIERA</div>
                  <select style={S.select} value={v.lamiera||""} onChange={e=>updateV("lamiera",e.target.value)}>
                    <option value="">— No —</option>
                    {lamiereDB.map(l=><option key={l.id} value={l.cod}>{l.cod} — {l.nome}</option>)}
                  </select>
                </div>
              </div>
            },
          ];

          return (
            <div style={{padding:"6px 16px 2px"}}>
              {sections.map(sec=>{
                const isOpen = vanoInfoOpen===sec.id;
                return (
                  <div key={sec.id} style={{marginBottom:3,borderRadius:10,border:`1px solid ${isOpen?T.acc+"50":T.bdr}`,overflow:"hidden"}}>
                    <div onClick={()=>setVanoInfoOpen(isOpen?null:sec.id)}
                      style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:isOpen?T.acc+"06":T.card,cursor:"pointer"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:14}}>{sec.icon}</span>
                        <span style={{fontSize:12,fontWeight:600,color:T.text}}>{sec.label}</span>
                        {sec.badge && <span style={{...S.badge(T.accLt,T.acc),fontSize:9,padding:"1px 6px"}}>{sec.badge}</span>}
                      </div>
                      <span style={{fontSize:9,color:T.sub,display:"inline-block",transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.15s"}}>▼</span>
                    </div>
                    {isOpen && <div style={{padding:"12px",background:T.bg,borderTop:`1px solid ${T.bdr}`}}>{sec.body}</div>}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Dots progress */}
        <div style={{ display: "flex", justifyContent: "center", gap: 5, padding: "14px 16px 6px" }}>
          {STEPS.map((s, i) => (
            <div key={i} onClick={() => setVanoStep(i)} style={{ width: i === vanoStep ? 18 : 8, height: 8, borderRadius: 4, background: i === vanoStep ? s.color : i < vanoStep ? s.color + "60" : T.bdr, cursor: "pointer", transition: "all 0.2s" }} />
          ))}
        </div>

        <div style={{ padding: "8px 16px" }}>
          {/* Step header card */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: step.color + "10", borderRadius: 14, border: `1px solid ${step.color}25`, marginBottom: 12 }}>
            {(vanoStep <= 4) && <MiniSVG type={step.id} />}
            {vanoStep > 4 && <div style={{ width: 50, height: 50, borderRadius: 12, background: step.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{step.icon}</div>}
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: step.color }}>{step.icon} {step.title}</div>
              <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{step.desc}</div>
              {step.fields && <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginTop: 2 }}>{step.fields.filter(f => m[f] > 0).length}/{step.fields.length} inserite</div>}
            </div>
          </div>

          {/* Warnings */}
          {vanoStep <= 2 && (hasWarnings || hasHWarnings) && (
            <div style={{ padding: "8px 14px", borderRadius: 10, background: "#fff3e0", border: "1px solid #ffe0b2", marginBottom: 12, fontSize: 11, color: "#e65100" }}>
              {hasWarnings && <div>⚠ Nessuna larghezza inserita</div>}
              {hasHWarnings && <div>⚠ Nessuna altezza inserita</div>}
            </div>
          )}

          {/* ═══ STEP 0: LARGHEZZE ═══ */}
          {vanoStep === 0 && (
            <>
              {bInput("Larghezza ALTO", "lAlto")}
              {bInput("Larghezza CENTRO (luce netta)", "lCentro")}
              {bInput("Larghezza BASSO", "lBasso")}
              {tip && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fff8e1", border: "1px solid #ffecb3", marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f57f17" }}>💡 {tip.t}</div>
                  <div style={{ fontSize: 11, color: "#795548" }}>Dimensioni tipiche: {tip.dim}</div>
                  {tip.w.map((w, i) => <div key={i} style={{ fontSize: 10, color: "#e65100", marginTop: 2 }}>⚠ {w}</div>)}
                </div>
              )}
            </>
          )}

          {/* ═══ STEP 1: ALTEZZE ═══ */}
          {vanoStep === 1 && (
            <>
              {bInput("Altezza SINISTRA", "hSx")}
              {bInput("Altezza CENTRO", "hCentro")}
              {bInput("Altezza DESTRA", "hDx")}
              {tip && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fff8e1", border: "1px solid #ffecb3", marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f57f17" }}>💡 {tip.t}</div>
                  <div style={{ fontSize: 11, color: "#795548" }}>Dimensioni tipiche: {tip.dim}</div>
                  {tip.w.map((w, i) => <div key={i} style={{ fontSize: 10, color: "#e65100", marginTop: 2 }}>⚠ {w}</div>)}
                </div>
              )}
            </>
          )}

          {/* ═══ STEP 2: DIAGONALI ═══ */}
          {vanoStep === 2 && (
            <>
              {bInput("Diagonale 1 ↗", "d1")}
              {bInput("Diagonale 2 ↘", "d2")}
              {fSq !== null && fSq > 3 && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "#ffebee", border: "1px solid #ef9a9a", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#c62828" }}>⚠ Fuori squadra: {fSq}mm</div>
                  <div style={{ fontSize: 11, color: "#b71c1c" }}>Differenza superiore a 3mm — segnalare in ufficio</div>
                </div>
              )}
              {fSq !== null && fSq <= 3 && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2e7d32" }}>✅ In squadra — differenza: {fSq}mm</div>
                </div>
              )}
              {tip && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fff8e1", border: "1px solid #ffecb3", marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f57f17" }}>💡 {tip.t}</div>
                  <div style={{ fontSize: 11, color: "#795548" }}>Dimensioni tipiche: {tip.dim}</div>
                  {tip.w.map((w, i) => <div key={i} style={{ fontSize: 10, color: "#e65100", marginTop: 2 }}>⚠ {w}</div>)}
                </div>
              )}
            </>
          )}

          {/* ═══ STEP 3: SPALLETTE ═══ */}
          {vanoStep === 3 && (
            <>
              {bInput("Spalletta SINISTRA", "spSx")}
              {bInput("Spalletta DESTRA", "spDx")}
              {bInput("Spalletta SOPRA", "spSopra")}
              {bInput("Profondità IMBOTTE", "imbotte")}
              {/* DISEGNO LIBERO SPALLETTE */}
              <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, marginTop: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#32ade6" }}>✏️ Disegno spallette</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { const ctx = spCanvasRef.current?.getContext("2d"); ctx?.clearRect(0, 0, 380, 200); }} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>🗑 Pulisci</button>
                    <button style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: T.grn, color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>💾 Salva</button>
                  </div>
                </div>
                <canvas ref={spCanvasRef} width={380} height={200} style={{ width: "100%", height: 200, background: "#fff", touchAction: "none", cursor: "crosshair" }}
                  onPointerDown={e=>{spCanvasRef.current?.setPointerCapture(e.pointerId);setSpDrawing(true);const cv=spCanvasRef.current;const ctx=cv?.getContext("2d");if(ctx&&cv){const r=cv.getBoundingClientRect();const sx=cv.width/r.width,sy=cv.height/r.height;ctx.beginPath();ctx.moveTo((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);ctx.strokeStyle=penColor;ctx.lineWidth=penSize;ctx.lineCap="round";ctx.lineJoin="round";}}}
                  onPointerMove={e=>{if(!spDrawing)return;const cv=spCanvasRef.current;const ctx=cv?.getContext("2d");if(ctx&&cv){const r=cv.getBoundingClientRect();const sx=cv.width/r.width,sy=cv.height/r.height;ctx.lineTo((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);ctx.stroke();}}}
                  onPointerUp={() => setSpDrawing(false)}
                  onPointerLeave={() => setSpDrawing(false)}
                />
                <div style={{ padding: "6px 14px", display: "flex", gap: 4 }}>
                  {["#1d1d1f", "#ff3b30", "#007aff", "#34c759", "#ff9500"].map(c => (
                    <div key={c} onClick={() => setPenColor(c)} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: penColor === c ? `3px solid ${T.acc}` : "2px solid transparent", cursor: "pointer" }} />
                  ))}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                    {[1, 2, 4].map(s => (
                      <div key={s} onClick={() => setPenSize(s)} style={{ width: 22, height: 22, borderRadius: 6, background: penSize === s ? T.accLt : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <div style={{ width: s * 2 + 2, height: s * 2 + 2, borderRadius: "50%", background: T.text }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ STEP 4: DAVANZALE ═══ */}
          {vanoStep === 4 && (
            <>
              {bInput("Davanzale PROFONDITÀ", "davProf")}
              {bInput("Davanzale SPORGENZA", "davSporg")}
              {bInput("Altezza SOGLIA", "soglia")}
              {/* Cassonetto toggle */}
              <div style={{ marginTop: 8, padding: "12px 16px", borderRadius: 12, border: `1px dashed ${T.bdr}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => {
                const nv = { ...v, cassonetto: !v.cassonetto };
                setSelectedVano(nv);
                setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, vani: c.vani.map(x => x.id === v.id ? nv : x) } : c));
              }}>
                <span style={{ fontSize: 12, color: T.sub }}>+</span>
                <span style={{ fontSize: 14 }}>🧊</span>
                <span style={{ fontSize: 13, color: T.sub }}>{v.cassonetto ? "Cassonetto attivo" : "Ha un cassonetto? Tocca per aggiungere"}</span>
              </div>
              {v.cassonetto && (
                <div style={{ marginTop: 8 }}>
                  {bInput("Cassonetto ALTEZZA", "casH")}
                  {bInput("Cassonetto PROFONDITÀ", "casP")}
                </div>
              )}
            </>
          )}

          {/* ═══ STEP 5: ACCESSORI ═══ */}
          {vanoStep === 5 && (
            <>
              {["tapparella", "persiana", "zanzariera", "cassonetto"].map(acc => {
                if (acc === "cassonetto") {
                  return (
                    <div key={acc} onClick={() => {
                      const nv = { ...v, cassonetto: !v.cassonetto };
                      setSelectedVano(nv);
                      setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, vani: c.vani.map(x => x.id === v.id ? nv : x) } : c));
                    }} style={{ padding: "14px 16px", borderRadius: 12, border: `1px dashed ${v.cassonetto ? "#ff9500" : T.bdr}`, background: v.cassonetto ? "#fff8e1" : T.card, marginBottom: 8, cursor: "pointer", textAlign: "center" }}>
                      <span style={{ fontSize: 12, color: v.cassonetto ? "#ff9500" : T.sub }}>+ 🧊 {v.cassonetto ? "Cassonetto attivo — tocca per rimuovere" : "Aggiungi Cassonetto"}</span>
                    </div>
                  );
                }
                const a = v.accessori?.[acc] || { attivo: false };
                const accColors = { tapparella: "#ff9500", persiana: "#007aff", zanzariera: "#ff2d55" };
                const accIcons = { tapparella: "🪟", persiana: "🏠", zanzariera: "🦟" };
                return (
                  <div key={acc} style={{ marginBottom: 8, borderRadius: 12, border: `1px ${a.attivo ? "solid" : "dashed"} ${a.attivo ? accColors[acc] + "40" : T.bdr}`, overflow: "hidden", background: T.card }}>
                    {!a.attivo ? (
                      <div onClick={() => toggleAccessorio(v.id, acc)} style={{ padding: "14px 16px", textAlign: "center", cursor: "pointer" }}>
                        <span style={{ fontSize: 12, color: T.sub }}>+ {accIcons[acc]} Aggiungi {acc.charAt(0).toUpperCase() + acc.slice(1)}</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.bdr}` }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: accColors[acc] }}>{accIcons[acc]} {acc.charAt(0).toUpperCase() + acc.slice(1)}</span>
                          <div onClick={() => toggleAccessorio(v.id, acc)} style={{ fontSize: 11, color: T.sub, cursor: "pointer" }}>▲ Chiudi</div>
                        </div>
                        <div style={{ padding: "12px 16px" }}>
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Larghezza</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={v.accessori?.[acc]?.l || ""} onChange={e => updateAccessorio(v.id, acc, "l", parseInt(e.target.value) || 0)} />
                              <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                            </div>
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11, color: T.text, marginBottom: 4 }}>Altezza</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input style={{ flex: 1, padding: "10px", fontSize: 14, fontFamily: FM, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card }} type="number" inputMode="numeric" placeholder="" value={v.accessori?.[acc]?.h || ""} onChange={e => updateAccessorio(v.id, acc, "h", parseInt(e.target.value) || 0)} />
                              <span style={{ fontSize: 11, color: T.sub, background: T.bg, padding: "6px 8px", borderRadius: 6 }}>mm</span>
                            </div>
                          </div>
                          {acc === "tapparella" && (
                            <>
                              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Materiale</div>
                              <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                                {["PVC", "Alluminio", "Acciaio", "Legno"].map(mat => (
                                  <div key={mat} onClick={() => updateAccessorio(v.id, acc, "materiale", mat)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${v.accessori?.[acc]?.materiale === mat ? "#ff9500" : T.bdr}`, background: v.accessori?.[acc]?.materiale === mat ? "#ff950018" : T.card, fontSize: 12, cursor: "pointer", fontWeight: v.accessori?.[acc]?.materiale === mat ? 700 : 400, color: v.accessori?.[acc]?.materiale === mat ? "#ff9500" : T.text }}>{mat}</div>
                                ))}
                              </div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Motorizzata</div>
                              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                                {["Sì", "No"].map(mot => (
                                  <div key={mot} onClick={() => updateAccessorio(v.id, acc, "motorizzata", mot)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${v.accessori?.[acc]?.motorizzata === mot ? "#34c759" : T.bdr}`, background: v.accessori?.[acc]?.motorizzata === mot ? "#34c75918" : T.card, fontSize: 12, cursor: "pointer", fontWeight: v.accessori?.[acc]?.motorizzata === mot ? 700 : 400, color: v.accessori?.[acc]?.motorizzata === mot ? "#34c759" : T.text }}>{mot}</div>
                                ))}
                              </div>
                            </>
                          )}
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Colore</div>
                          <select style={{ width: "100%", padding: "10px", fontSize: 12, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, fontFamily: FF }} value={v.accessori?.[acc]?.colore || ""} onChange={e => updateAccessorio(v.id, acc, "colore", e.target.value)}>
                            <option value="">Colore</option>
                            {coloriDB.map(c => <option key={c.id} value={c.code}>{c.code} — {c.nome}</option>)}
                          </select>
                          <div onClick={() => toggleAccessorio(v.id, acc)} style={{ marginTop: 10, padding: "8px", borderRadius: 8, border: `1px dashed #ef5350`, textAlign: "center", fontSize: 11, color: "#ef5350", cursor: "pointer" }}>
                            🗑 Rimuovi {acc}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ═══ STEP 6: DISEGNO + FOTO + NOTE ═══ */}
          {vanoStep === 6 && (
            <>
              {/* Disegno mano libera */}
              <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6b6b" }}>✏️ Disegno a mano libera</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { const ctx = canvasRef.current?.getContext("2d"); ctx?.clearRect(0, 0, 380, 340); }} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>🗑 Pulisci</button>
                    <button style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#ff3b30", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>💾 Salva</button>
                  </div>
                </div>
                <canvas ref={canvasRef} width={380} height={340} style={{ width: "100%", height: 340, background: "#fff", touchAction: "none", cursor: "crosshair" }}
                  onPointerDown={e=>{canvasRef.current?.setPointerCapture(e.pointerId);setIsDrawing(true);const cv=canvasRef.current;const ctx=cv?.getContext("2d");if(ctx&&cv){const r=cv.getBoundingClientRect();const sx=cv.width/r.width,sy=cv.height/r.height;ctx.beginPath();ctx.moveTo((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);ctx.strokeStyle=penColor;ctx.lineWidth=penSize;ctx.lineCap="round";ctx.lineJoin="round";}}}
                  onPointerMove={e=>{if(!isDrawing)return;const cv=canvasRef.current;const ctx=cv?.getContext("2d");if(ctx&&cv){const r=cv.getBoundingClientRect();const sx=cv.width/r.width,sy=cv.height/r.height;ctx.lineTo((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);ctx.stroke();}}}
                  onPointerUp={() => setIsDrawing(false)}
                  onPointerLeave={() => setIsDrawing(false)}
                />
                <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 4 }}>
                  {["#1d1d1f", "#ff3b30", "#007aff", "#34c759", "#ff9500", "#af52de", "#ff2d55", "#ffffff"].map(c => (
                    <div key={c} onClick={() => setPenColor(c)} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: penColor === c ? `3px solid ${T.acc}` : c === "#ffffff" ? `1px solid ${T.bdr}` : "2px solid transparent", cursor: "pointer" }} />
                  ))}
                  <div style={{ width: 1, height: 20, background: T.bdr, margin: "0 4px" }} />
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <span style={{ fontSize: 12 }}>🩹</span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                    {[1, 2, 4, 6].map(s => (
                      <div key={s} onClick={() => setPenSize(s)} style={{ width: 24, height: 24, borderRadius: 6, background: penSize === s ? T.accLt : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <div style={{ width: s * 2 + 1, height: s * 2 + 1, borderRadius: "50%", background: T.text }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Foto */}
              <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.blue }}>📷 FOTO ({(v.foto && Object.keys(v.foto).length) || 0})</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => document.getElementById("fotoVanoInput").click()}
                      style={{ padding: "4px 10px", borderRadius: 6, background: T.acc, color: "#fff", border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>📷 Foto</button>
                    <button onClick={() => { setPendingFotoCat(null); videoVanoRef.current?.click(); }}
                      style={{ padding: "4px 10px", borderRadius: 6, background: T.blue, color: "#fff", border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>🎬 Video</button>
                  </div>
                </div>
                <input ref={fotoVanoRef} type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }}
                  onChange={e => {
                    const cat = pendingFotoCat;
                    Array.from(e.target.files || []).forEach(file => {
                      const r = new FileReader();
                      r.onload = ev => {
                        const key = "foto_" + Date.now() + "_" + file.name;
                        const fotoObj = { dataUrl: ev.target.result, nome: file.name, tipo: "foto", categoria: cat || null };
                        setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, vani: c.vani.map(vn => vn.id === v.id ? { ...vn, foto: { ...(vn.foto||{}), [key]: fotoObj } } : vn) } : c));
                        setSelectedVano(prev => ({ ...prev, foto: { ...(prev.foto||{}), [key]: fotoObj } }));
                      };
                      r.readAsDataURL(file);
                    });
                    setPendingFotoCat(null);
                    e.target.value = "";
                  }}/>
                <input ref={videoVanoRef} type="file" accept="video/*" capture="environment" style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const key = "video_" + Date.now();
                    setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, vani: c.vani.map(vn => vn.id === v.id ? { ...vn, foto: { ...(vn.foto||{}), [key]: { nome: file.name, tipo: "video" } } } : vn) } : c));
                    setSelectedVano(prev => ({ ...prev, foto: { ...(prev.foto||{}), [key]: { nome: file.name, tipo: "video" } } }));
                    e.target.value = "";
                  }}/>
                <div style={{ fontSize: 10, color: T.sub, marginBottom: 6 }}>{Object.keys(v.foto||{}).length} allegati</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {[
                    { n: "Panoramica", r: true, c: "#ff3b30" }, { n: "Spalle muro", r: true, c: "#007aff" }, { n: "Soglia", r: true, c: "#007aff" },
                    { n: "Cassonetto", r: false, c: "#34c759" }, { n: "Dettagli critici", r: true, c: "#ff3b30" }, { n: "Imbotto", r: false, c: "#34c759" },
                    { n: "Contesto", r: false, c: "#34c759" }, { n: "Altro", r: false, c: "#34c759" },
                  ].map((cat, i) => {
                    const fotoCount = Object.values(v.foto||{}).filter(f=>f.categoria===cat.n).length;
                    return (
                    <div key={i} onClick={()=>{ setPendingFotoCat(cat.n); fotoVanoRef.current?.click(); }}
                      style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${fotoCount>0 ? "#34c759" : cat.r ? cat.c + "40" : T.bdr}`, background: fotoCount>0 ? "#34c75915" : cat.r ? cat.c + "08" : "transparent", fontSize: 10, fontWeight: 600, color: fotoCount>0 ? "#1a9e40" : cat.r ? cat.c : T.sub, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, position:"relative" }}>
                      {fotoCount>0 ? <span style={{fontSize:8,background:"#34c759",color:"#fff",borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>{fotoCount}</span> : cat.r ? <span style={{ fontSize: 8 }}>✕</span> : null}
                      <span style={{ fontSize: 10 }}>📷</span> {cat.n}
                    </div>
                    );
                  })}
                </div>
                {Object.keys(v.foto||{}).length === 0
                  ? <div style={{ textAlign: "center", padding: "16px 0", color: T.sub, fontSize: 11 }}>Nessun allegato — tocca 📷 Foto o 🎬 Video</div>
                  : <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {Object.entries(v.foto||{}).map(([k, f]) => (
                        <div key={k} style={{ position: "relative", width: 72, height: 72, borderRadius: 8, overflow: "hidden", background: T.bg, border: `1px solid ${T.bdr}` }}>
                          {f.tipo === "foto" && f.dataUrl
                            ? <img src={f.dataUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={f.nome}/>
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontSize: 24 }}>🎬</span>
                                <span style={{ fontSize: 8, color: T.sub, textAlign: "center", padding: "0 4px" }}>{f.nome?.slice(0,12)}</span>
                              </div>
                          }
                          {f.categoria && <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:7,fontWeight:700,padding:"2px 3px",textAlign:"center",lineHeight:1.2}}>{f.categoria}</div>}
                          <div onClick={() => {
                            const newFoto = { ...(v.foto||{}) }; delete newFoto[k];
                            setCantieri(cs => cs.map(c => c.id === selectedCM?.id ? { ...c, vani: c.vani.map(vn => vn.id === v.id ? { ...vn, foto: newFoto } : vn) } : c));
                            setSelectedVano(prev => ({ ...prev, foto: newFoto }));
                          }} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</div>
                        </div>
                      ))}
                    </div>
                }
              </div>

              {/* Note */}
              <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ff9500", marginBottom: 8 }}>📝 NOTE</div>
                <textarea style={{ width: "100%", padding: 10, fontSize: 13, border: `1px solid ${T.bdr}`, borderRadius: 8, background: T.card, minHeight: 60, resize: "vertical", fontFamily: FF, boxSizing: "border-box" }} placeholder="Note sul vano..." defaultValue={v.note || ""} />
              </div>
            </>
          )}

          {/* ═══ STEP 7: RIEPILOGO ═══ */}
          {vanoStep === 7 && (
            <>
              <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: 16, marginBottom: 12 }}>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{v.nome}</div>
                  <div style={{ fontSize: 12, color: T.sub }}>{v.tipo} • {v.stanza} • {v.piano}</div>
                </div>
                {/* Larghezze */}
                <div style={{ borderRadius: 10, border: `1px solid #507aff25`, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ padding: "6px 12px", background: "#507aff10", fontSize: 11, fontWeight: 700, color: "#507aff" }}>📏 LARGHEZZE</div>
                  {[["Alto", m.lAlto], ["Centro", m.lCentro], ["Basso", m.lBasso]].map(([l, val]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", borderTop: `1px solid ${T.bdr}`, fontSize: 12 }}>
                      <span style={{ color: T.text }}>{l}</span>
                      <span style={{ fontFamily: FM, fontWeight: 600, color: val ? T.text : T.sub2 }}>{val || "—"}</span>
                    </div>
                  ))}
                </div>
                {/* Altezze */}
                <div style={{ borderRadius: 10, border: `1px solid #34c75925`, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ padding: "6px 12px", background: "#34c75910", fontSize: 11, fontWeight: 700, color: "#34c759" }}>📐 ALTEZZE</div>
                  {[["Sinistra", m.hSx], ["Centro", m.hCentro], ["Destra", m.hDx]].map(([l, val]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", borderTop: `1px solid ${T.bdr}`, fontSize: 12 }}>
                      <span>{l}</span>
                      <span style={{ fontFamily: FM, fontWeight: 600, color: val ? T.text : T.sub2 }}>{val || "—"}</span>
                    </div>
                  ))}
                </div>
                {/* Diagonali */}
                <div style={{ borderRadius: 10, border: `1px solid #ff950025`, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ padding: "6px 12px", background: "#ff950010", fontSize: 11, fontWeight: 700, color: "#ff9500" }}>✕ DIAGONALI</div>
                  {[["D1", m.d1], ["D2", m.d2], ["Fuori squadra", fSq !== null ? `${fSq}mm` : ""]].map(([l, val]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", borderTop: `1px solid ${T.bdr}`, fontSize: 12 }}>
                      <span>{l}</span>
                      <span style={{ fontFamily: FM, fontWeight: 600, color: l === "Fuori squadra" && fSq > 3 ? "#ff3b30" : val ? T.text : T.sub2 }}>{val || "—"}</span>
                    </div>
                  ))}
                </div>
                {/* Spallette */}
                <div style={{ borderRadius: 10, border: `1px solid #32ade625`, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ padding: "6px 12px", background: "#32ade610", fontSize: 11, fontWeight: 700, color: "#32ade6" }}>🧱 SPALLETTE</div>
                  {[["Sinistra", m.spSx], ["Destra", m.spDx], ["Sopra", m.spSopra], ["Imbotte", m.imbotte]].map(([l, val]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", borderTop: `1px solid ${T.bdr}`, fontSize: 12 }}>
                      <span>{l}</span>
                      <span style={{ fontFamily: FM, fontWeight: 600, color: val ? T.text : T.sub2 }}>{val || "—"}</span>
                    </div>
                  ))}
                </div>
                {/* Davanzale */}
                <div style={{ borderRadius: 10, border: `1px solid #ff2d5525`, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ padding: "6px 12px", background: "#ff2d5510", fontSize: 11, fontWeight: 700, color: "#ff2d55" }}>⬇ DAVANZALE</div>
                  {[["Profondità", m.davProf], ["Sporgenza", m.davSporg], ["Soglia", m.soglia]].map(([l, val]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", borderTop: `1px solid ${T.bdr}`, fontSize: 12 }}>
                      <span>{l}</span>
                      <span style={{ fontFamily: FM, fontWeight: 600, color: val ? T.text : T.sub2 }}>{val || "—"}</span>
                    </div>
                  ))}
                </div>
                {/* Accessori */}
                {(v.accessori?.tapparella?.attivo || v.accessori?.persiana?.attivo || v.accessori?.zanzariera?.attivo) && (
                  <div style={{ borderRadius: 10, border: `1px solid #af52de25`, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ padding: "6px 12px", background: "#af52de10", fontSize: 11, fontWeight: 700, color: "#af52de" }}>✚ ACCESSORI</div>
                    {v.accessori?.tapparella?.attivo && <div style={{ padding: "6px 12px", borderTop: `1px solid ${T.bdr}`, fontSize: 12 }}>🪟 Tapparella</div>}
                    {v.accessori?.persiana?.attivo && <div style={{ padding: "6px 12px", borderTop: `1px solid ${T.bdr}`, fontSize: 12 }}>🏠 Persiana</div>}
                    {v.accessori?.zanzariera?.attivo && <div style={{ padding: "6px 12px", borderTop: `1px solid ${T.bdr}`, fontSize: 12 }}>🦟 Zanzariera</div>}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══ NAV BUTTONS ═══ */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {vanoStep > 0 && (
              <button onClick={() => setVanoStep(s => s - 1)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `1px solid ${T.bdr}`, background: T.card, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FF, color: T.text }}>← Indietro</button>
            )}
            {vanoStep < 7 && (
              <button onClick={() => setVanoStep(s => s + 1)} style={{ flex: vanoStep === 0 ? "1 1 100%" : 1, padding: "14px", borderRadius: 12, border: "none", background: step.color, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>Avanti →</button>
            )}
            {vanoStep === 7 && (
              <button onClick={() => { setVanoStep(0); goBack(); }} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#34c759", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>💾 SALVA TUTTO</button>
            )}
          </div>

          {/* ═══ RIEPILOGO RAPIDO ═══ */}
          <div style={{ marginTop: 12, padding: "8px 12px", background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Riepilogo rapido</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                ["L", m.lCentro || m.lAlto || m.lBasso],
                ["H", m.hCentro || m.hSx || m.hDx],
                ["D1", m.d1], ["D2", m.d2],
                ["F.sq", fSq !== null ? `${fSq}` : null],
              ].map(([l, val]) => (
                <div key={l} style={{ padding: "3px 8px", borderRadius: 4, background: T.bg, fontSize: 10, fontFamily: FM, color: val ? T.text : T.sub2 }}>
                  {l}: {val || "—"}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  };

  /* ── AGENDA TAB — Giorno / Settimana / Mese ── */

  /* ── CHAT / AI TAB ── */

  /* ── SETTINGS TAB ── */

  /* ── AGENDA TAB — Giorno / Settimana / Mese ── */
  const renderAgenda = () => {
    const dateStr = (d) => d.toISOString().split("T")[0];
    const dayEvents = events.filter(e => e.date === dateStr(selDate)).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
    const weekStart = new Date(selDate); weekStart.setDate(selDate.getDate() - selDate.getDay() + 1);
    const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
    const monthStart = new Date(selDate.getFullYear(), selDate.getMonth(), 1);
    const monthDays = Array.from({ length: 35 }, (_, i) => { const d = new Date(monthStart); d.setDate(d.getDate() + i - monthStart.getDay() + 1); return d; });
    const isSameDay = (a, b) => dateStr(a) === dateStr(b);
    const isToday2 = (d) => isSameDay(d, new Date());
    const eventsOn = (d) => events.filter(e => e.date === dateStr(d));

    const navDate = (dir) => {
      const d = new Date(selDate);
      if (agendaView === "giorno") d.setDate(d.getDate() + dir);
      else if (agendaView === "settimana") d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      setSelDate(d);
    };

    const renderEventCard = (ev) => (
      <div key={ev.id} style={{ ...S.card, margin: "0 0 8px" }} onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)}>
        <div style={{ ...S.cardInner, display: "flex", gap: 10 }}>
          <div style={{ width: 3, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
          {ev.time && <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, minWidth: 38, fontFamily: FM }}>{ev.time}</div>}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.text}</div>
            {ev.addr && <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>📍 {ev.addr}</div>}
            <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
              {ev.cm && <span onClick={(e) => { e.stopPropagation(); const cm = cantieri.find(c => c.code === ev.cm); if (cm) { setSelectedCM(cm); setTab("commesse"); } }} style={{ ...S.badge(T.accLt, T.acc), cursor: "pointer" }}>{ev.cm}</span>}
              {ev.persona && <span style={S.badge(T.purpleLt, T.purple)}>{ev.persona}</span>}
              <span style={S.badge(ev.tipo === "appuntamento" ? T.blueLt : T.orangeLt, ev.tipo === "appuntamento" ? T.blue : T.orange)}>{ev.tipo}</span>
            </div>
          </div>
          <div style={{ alignSelf: "center", transition: "transform 0.2s", transform: selectedEvent?.id === ev.id ? "rotate(90deg)" : "rotate(0deg)" }}>
            <Ico d={ICO.back} s={14} c={T.sub} />
          </div>
        </div>
        {/* Expanded detail */}
        {selectedEvent?.id === ev.id && (
          <div style={{ padding: "0 14px 12px", borderTop: `1px solid ${T.bdr}`, marginTop: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 0" }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Data</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{new Date(ev.date).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Orario</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{ev.time || "Tutto il giorno"}</div>
              </div>
              {ev.persona && <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Assegnato a</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>👤 {ev.persona}</div>
              </div>}
              {ev.addr && <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Luogo</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>📍 {ev.addr}</div>
              </div>}
            </div>
            {ev.cm && (
              <div style={{ padding: "8px 10px", background: T.accLt, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.acc, textTransform: "uppercase", letterSpacing: 0.5 }}>Commessa collegata</div>
                <div onClick={(e) => { e.stopPropagation(); const cm = cantieri.find(c => c.code === ev.cm); if (cm) { setSelectedCM(cm); setTab("commesse"); } }} style={{ fontSize: 13, fontWeight: 700, color: T.acc, marginTop: 2, cursor: "pointer" }}>{ev.cm} → Apri commessa</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              <div onClick={(e) => { e.stopPropagation(); if (ev.addr) window.open("https://maps.google.com/?q=" + encodeURIComponent(ev.addr)); }} style={{ flex: 1, padding: "8px", borderRadius: 8, background: T.card, border: `1px solid ${T.bdr}`, textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 600, color: T.blue }}>🗺 Mappa</div>
              <div onClick={(e) => { e.stopPropagation(); if (ev.persona) window.open("tel:"); }} style={{ flex: 1, padding: "8px", borderRadius: 8, background: T.card, border: `1px solid ${T.bdr}`, textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 600, color: T.grn }}>📞 Chiama</div>
              <div onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); setSelectedEvent(null); }} style={{ flex: 1, padding: "8px", borderRadius: 8, background: T.redLt, border: `1px solid ${T.red}30`, textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 600, color: T.red }}>🗑 Elimina</div>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={S.header}>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>Agenda</div>
            <div style={S.headerSub}>
              {agendaView === "giorno" ? selDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }) :
               agendaView === "settimana" ? `${weekDays[0].getDate()}–${weekDays[6].getDate()} ${selDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}` :
               selDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
            </div>
          </div>
          <div onClick={() => setShowNewEvent(true)} style={{ width: 36, height: 36, borderRadius: 10, background: T.acc, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, fontWeight: 300 }}>+</div>
        </div>

        {/* View switcher */}
        <div style={{ display: "flex", gap: 0, margin: "8px 16px", borderRadius: 8, overflow: "hidden", border: `1px solid ${T.bdr}` }}>
          {["giorno", "settimana", "mese"].map(v => (
            <div key={v} onClick={() => setAgendaView(v)} style={{ flex: 1, padding: "8px 4px", textAlign: "center", fontSize: 12, fontWeight: 600, background: agendaView === v ? T.acc : T.card, color: agendaView === v ? "#fff" : T.sub, cursor: "pointer", textTransform: "capitalize" }}>
              {v}
            </div>
          ))}
        </div>

        {/* Nav arrows */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px" }}>
          <div onClick={() => navDate(-1)} style={{ cursor: "pointer", padding: "4px 8px" }}><Ico d={ICO.back} s={18} c={T.sub} /></div>
          <div onClick={() => setSelDate(new Date())} style={{ fontSize: 12, fontWeight: 600, color: T.acc, cursor: "pointer" }}>Oggi</div>
          <div onClick={() => navDate(1)} style={{ cursor: "pointer", padding: "4px 8px", transform: "rotate(180deg)" }}><Ico d={ICO.back} s={18} c={T.sub} /></div>
        </div>

        <div style={{ padding: "0 16px" }}>

          {/* ═══ VISTA MESE ═══ */}
          {agendaView === "mese" && (
            <>
              <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, padding: 12, marginBottom: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
                  {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
                    <div key={i} style={{ fontSize: 10, fontWeight: 600, color: T.sub, padding: "4px 0" }}>{d}</div>
                  ))}
                  {monthDays.map((d, i) => {
                    const inMonth = d.getMonth() === selDate.getMonth();
                    const sel = isSameDay(d, selDate);
                    const tod = isToday2(d);
                    const hasEv = eventsOn(d).length > 0;
                    return (
                      <div key={i} onClick={() => setSelDate(new Date(d))} style={{ padding: "6px 2px", borderRadius: 8, fontSize: 12, fontWeight: sel || tod ? 700 : 400, background: sel ? T.acc : tod ? T.accLt : "transparent", color: sel ? "#fff" : !inMonth ? T.sub2 : T.text, cursor: "pointer", position: "relative" }}>
                        {d.getDate()}
                        {hasEv && <div style={{ width: 4, height: 4, borderRadius: "50%", background: sel ? "#fff" : T.red, margin: "1px auto 0" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                {selDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              {dayEvents.length === 0 ? (
                <div style={{ padding: "16px", textAlign: "center", color: T.sub, fontSize: 12, background: T.card, borderRadius: T.r, border: `1px dashed ${T.bdr}` }}>Nessun evento. Tocca + per aggiungere.</div>
              ) : dayEvents.map(renderEventCard)}
            </>
          )}

          {/* ═══ VISTA SETTIMANA ═══ */}
          {agendaView === "settimana" && (
            <>
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {weekDays.map((d, i) => {
                  const sel = isSameDay(d, selDate);
                  const tod = isToday2(d);
                  const n = eventsOn(d).length;
                  return (
                    <div key={i} onClick={() => setSelDate(new Date(d))} style={{ flex: 1, textAlign: "center", padding: "8px 2px", borderRadius: 10, background: sel ? T.acc : tod ? T.accLt : T.card, border: `1px solid ${sel ? T.acc : T.bdr}`, cursor: "pointer" }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: sel ? "#fff" : T.sub, textTransform: "uppercase" }}>
                        {["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"][i]}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: sel ? "#fff" : T.text, marginTop: 2 }}>{d.getDate()}</div>
                      {n > 0 && <div style={{ width: 5, height: 5, borderRadius: "50%", background: sel ? "#fff" : T.red, margin: "2px auto 0" }} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                {selDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              {dayEvents.length === 0 ? (
                <div style={{ padding: "16px", textAlign: "center", color: T.sub, fontSize: 12, background: T.card, borderRadius: T.r, border: `1px dashed ${T.bdr}` }}>Nessun evento</div>
              ) : dayEvents.map(renderEventCard)}
            </>
          )}

          {/* ═══ VISTA GIORNO ═══ */}
          {agendaView === "giorno" && (
            <>
              {/* Timeline ore */}
              <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, overflow: "hidden", marginBottom: 12 }}>
                {Array.from({ length: 12 }, (_, i) => i + 7).map(h => {
                  const hour = `${String(h).padStart(2, "0")}:00`;
                  const hourEvents = dayEvents.filter(e => e.time && e.time.startsWith(String(h).padStart(2, "0")));
                  return (
                    <div key={h} style={{ display: "flex", borderBottom: `1px solid ${T.bdr}`, minHeight: 48 }}>
                      <div style={{ width: 48, padding: "4px 6px", fontSize: 10, color: T.sub, fontFamily: FM, fontWeight: 600, borderRight: `1px solid ${T.bdr}`, flexShrink: 0 }}>{hour}</div>
                      <div style={{ flex: 1, padding: "4px 8px" }}>
                        {hourEvents.map(ev => (
                          <div key={ev.id}>
                            <div onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)} style={{ padding: "4px 8px", borderRadius: 6, background: ev.color + "18", borderLeft: `3px solid ${ev.color}`, marginBottom: 2, fontSize: 11, fontWeight: 600, color: T.text, cursor: "pointer" }}>
                              {ev.text}
                              {ev.persona && <span style={{ color: T.sub, fontWeight: 400 }}> · {ev.persona}</span>}
                            </div>
                            {selectedEvent?.id === ev.id && (
                              <div style={{ padding: "8px", margin: "2px 0 6px", background: T.card, borderRadius: 8, border: `1px solid ${T.bdr}`, boxShadow: T.cardSh }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                                  {ev.addr && <div style={{ fontSize: 11, color: T.text }}>📍 {ev.addr}</div>}
                                  {ev.persona && <span style={S.badge(T.purpleLt, T.purple)}>👤 {ev.persona}</span>}
                                  {ev.cm && <span onClick={(e) => { e.stopPropagation(); const cm = cantieri.find(c => c.code === ev.cm); if (cm) { setSelectedCM(cm); setTab("commesse"); } }} style={{ ...S.badge(T.accLt, T.acc), cursor: "pointer" }}>📁 {ev.cm}</span>}
                                  <span style={S.badge(ev.tipo === "appuntamento" ? T.blueLt : T.orangeLt, ev.tipo === "appuntamento" ? T.blue : T.orange)}>{ev.tipo}</span>
                                </div>
                                <div style={{ display: "flex", gap: 4 }}>
                                  {ev.addr && <div onClick={(e) => { e.stopPropagation(); window.open("https://maps.google.com/?q=" + encodeURIComponent(ev.addr)); }} style={{ flex: 1, padding: "6px", borderRadius: 6, background: T.blueLt, textAlign: "center", cursor: "pointer", fontSize: 10, fontWeight: 600, color: T.blue }}>🗺 Mappa</div>}
                                  <div onClick={(e) => { e.stopPropagation(); }} style={{ flex: 1, padding: "6px", borderRadius: 6, background: T.grnLt, textAlign: "center", cursor: "pointer", fontSize: 10, fontWeight: 600, color: T.grn }}>📞 Chiama</div>
                                  <div onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); setSelectedEvent(null); }} style={{ flex: 1, padding: "6px", borderRadius: 6, background: T.redLt, textAlign: "center", cursor: "pointer", fontSize: 10, fontWeight: 600, color: T.red }}>🗑 Elimina</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Unscheduled */}
              {dayEvents.filter(e => !e.time).length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: T.sub }}>Senza orario</div>
                  {dayEvents.filter(e => !e.time).map(renderEventCard)}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  /* ── CHAT / AI TAB ── */
  const renderMessaggi = () => {
    const chIco = { email: "📧", whatsapp: "💬", sms: "📱", telegram: "✈️" };
    const chCol = { email: T.blue, whatsapp: "#25d366", sms: T.orange, telegram: "#0088cc" };
    const chBg = { email: T.blueLt, whatsapp: "#25d36618", sms: T.orangeLt, telegram: "#0088cc18" };
    const filteredMsgs = msgs.filter(m => {
      const matchFilter = msgFilter === "tutti" || m.canale === msgFilter;
      const matchSearch = !msgSearch.trim() || m.from.toLowerCase().includes(msgSearch.toLowerCase()) || m.preview.toLowerCase().includes(msgSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
    const unread = msgs.filter(m => !m.read).length;

    const filteredContatti = [...contatti, ...team.map(t => ({ id: "t" + t.id, nome: t.nome, tipo: "team", ruolo: t.ruolo, tel: "", email: "", preferito: true, canali: ["whatsapp", "email"], cm: "", colore: t.colore }))].filter(c => {
      const matchF = rubricaFilter === "tutti" || (rubricaFilter === "preferiti" && c.preferito) || (rubricaFilter === "team" && c.tipo === "team") || (rubricaFilter === "clienti" && c.tipo === "cliente") || (rubricaFilter === "fornitori" && (c.tipo === "fornitore" || c.tipo === "professionista"));
      const matchS = !rubricaSearch.trim() || c.nome.toLowerCase().includes(rubricaSearch.toLowerCase());
      return matchF && matchS;
    }).sort((a, b) => (b.preferito ? 1 : 0) - (a.preferito ? 1 : 0) || a.nome.localeCompare(b.nome));

    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={S.header}>
          <div style={{ flex: 1 }}>
            <div style={S.headerTitle}>Messaggi</div>
            <div style={S.headerSub}>{unread > 0 ? `${unread} non letti` : "Tutti letti"} · {msgs.length} conversazioni</div>
          </div>
          <div onClick={() => setShowCompose(true)} style={{ width: 36, height: 36, borderRadius: 10, background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Ico d={ICO.pen} s={16} c="#fff" />
          </div>
        </div>

        {/* Sub-tabs: Chat / Rubrica */}
        <div style={{ display: "flex", margin: "8px 16px", borderRadius: 10, border: `1px solid ${T.bdr}`, overflow: "hidden" }}>
          {[{ id: "chat", l: "💬 Chat", count: unread }, { id: "rubrica", l: "📒 Rubrica", count: contatti.length + team.length }].map(st => (
            <div key={st.id} onClick={() => setMsgSubTab(st.id)} style={{ flex: 1, padding: "10px 0", textAlign: "center", fontSize: 13, fontWeight: 700, cursor: "pointer", background: msgSubTab === st.id ? T.acc : T.card, color: msgSubTab === st.id ? "#fff" : T.sub, transition: "all 0.2s" }}>
              {st.l} {st.count > 0 && msgSubTab !== st.id && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 8, background: st.id === "chat" && unread > 0 ? T.red : T.bdr, color: st.id === "chat" && unread > 0 ? "#fff" : T.sub, marginLeft: 4 }}>{st.count}</span>}
            </div>
          ))}
        </div>

        {/* ── CHAT TAB ── */}
        {msgSubTab === "chat" && (<>
          <div style={{ padding: "4px 16px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}` }}>
              <Ico d={ICO.search} s={14} c={T.sub} />
              <input style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: T.text, outline: "none", fontFamily: FF }} placeholder="Cerca contatto o messaggio..." value={msgSearch} onChange={e => setMsgSearch(e.target.value)} />
              {msgSearch && <div onClick={() => setMsgSearch("")} style={{ cursor: "pointer", fontSize: 14, color: T.sub }}>✕</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, padding: "0 16px 10px", overflowX: "auto" }}>
            {[
              { id: "tutti", l: "Tutti", c: T.acc },
              { id: "whatsapp", l: "💬 WhatsApp", c: "#25d366" },
              { id: "email", l: "📧 Email", c: T.blue },
              { id: "sms", l: "📱 SMS", c: T.orange },
              { id: "telegram", l: "✈️ Telegram", c: "#0088cc" },
            ].map(f => {
              const unr = f.id === "tutti" ? unread : msgs.filter(m => m.canale === f.id && !m.read).length;
              return (
                <div key={f.id} onClick={() => setMsgFilter(f.id)} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${msgFilter === f.id ? f.c : T.bdr}`, background: msgFilter === f.id ? f.c + "15" : T.card, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: msgFilter === f.id ? f.c : T.sub, display: "flex", alignItems: "center", gap: 4 }}>
                  {f.l}
                  {unr > 0 && <span style={{ width: 16, height: 16, borderRadius: "50%", background: f.c, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unr}</span>}
                </div>
              );
            })}
          </div>
          <div style={{ padding: "0 16px" }}>
            {filteredMsgs.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: T.sub, fontSize: 13 }}>Nessun messaggio</div>
            ) : (
              <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, overflow: "hidden" }}>
                {filteredMsgs.map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${T.bg}`, cursor: "pointer", background: m.read ? "transparent" : T.acc + "06" }} onClick={() => { setMsgs(ms => ms.map(x => x.id === m.id ? { ...x, read: true } : x)); setSelectedMsg(m); }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: chBg[m.canale] || T.bg, border: `2px solid ${chCol[m.canale] || T.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, position: "relative" }}>
                      {m.from.charAt(0).toUpperCase()}
                      <div style={{ position: "absolute", bottom: -2, right: -2, fontSize: 10, background: T.card, borderRadius: "50%", padding: 1 }}>{chIco[m.canale]}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: m.read ? 500 : 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.from}</div>
                        <div style={{ fontSize: 10, color: m.read ? T.sub : T.acc, fontWeight: m.read ? 400 : 700, flexShrink: 0, marginLeft: 8 }}>{m.time}</div>
                      </div>
                      <div style={{ fontSize: 12, color: m.read ? T.sub : T.text, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: m.read ? 400 : 500 }}>{m.preview}</div>
                      {m.cm && <div style={{ marginTop: 3 }}><span style={S.badge(T.accLt, T.acc)}>{m.cm}</span></div>}
                    </div>
                    {!m.read && <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.acc, flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>)}

        {/* ── RUBRICA TAB ── */}
        {msgSubTab === "rubrica" && (<>
          <div style={{ padding: "4px 16px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}` }}>
              <Ico d={ICO.search} s={14} c={T.sub} />
              <input style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: T.text, outline: "none", fontFamily: FF }} placeholder="Cerca nella rubrica..." value={rubricaSearch} onChange={e => setRubricaSearch(e.target.value)} />
              {rubricaSearch && <div onClick={() => setRubricaSearch("")} style={{ cursor: "pointer", fontSize: 14, color: T.sub }}>✕</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, padding: "0 16px 10px", overflowX: "auto" }}>
            {[
              { id: "tutti", l: "Tutti", c: T.acc },
              { id: "preferiti", l: "⭐ Preferiti", c: "#ff9500" },
              { id: "team", l: "👥 Team", c: "#34c759" },
              { id: "clienti", l: "🏠 Clienti", c: T.blue },
              { id: "fornitori", l: "🏭 Fornitori", c: "#af52de" },
            ].map(f => (
              <div key={f.id} onClick={() => setRubricaFilter(f.id)} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${rubricaFilter === f.id ? f.c : T.bdr}`, background: rubricaFilter === f.id ? f.c + "15" : T.card, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: rubricaFilter === f.id ? f.c : T.sub }}>
                {f.l}
              </div>
            ))}
          </div>
          <div style={{ padding: "0 16px" }}>
            <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, overflow: "hidden" }}>
              {filteredContatti.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", color: T.sub, fontSize: 13 }}>Nessun contatto trovato</div>
              ) : filteredContatti.map(c => {
                const tipoColor = c.tipo === "team" ? "#34c759" : c.tipo === "cliente" ? T.blue : c.tipo === "fornitore" ? "#af52de" : "#ff9500";
                const tipoLabel = c.tipo === "team" ? "Team" : c.tipo === "cliente" ? "Cliente" : c.tipo === "fornitore" ? "Fornitore" : "Professionista";
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${T.bg}` }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: (c.colore || tipoColor) + "18", border: `2px solid ${c.colore || tipoColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: c.colore || tipoColor, flexShrink: 0, position: "relative" }}>
                      {c.nome.split(" ").map(w => w[0]).join("").substring(0, 2)}
                      {c.preferito && <div style={{ position: "absolute", top: -4, right: -4, fontSize: 10 }}>⭐</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.nome}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 2, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={S.badge(tipoColor + "18", tipoColor)}>{tipoLabel}</span>
                        {c.ruolo && <span style={{ fontSize: 10, color: T.sub }}>{c.ruolo}</span>}
                        {c.cm && <span style={S.badge(T.accLt, T.acc)}>{c.cm}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(c.canali || []).includes("whatsapp") && (
                        <div onClick={() => { setComposeMsg(m => ({ ...m, canale: "whatsapp", to: c.nome })); setShowCompose(true); }} style={{ width: 32, height: 32, borderRadius: "50%", background: "#25d36618", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>💬</div>
                      )}
                      {(c.canali || []).includes("email") && (
                        <div onClick={() => { setComposeMsg(m => ({ ...m, canale: "email", to: c.nome })); setShowCompose(true); }} style={{ width: 32, height: 32, borderRadius: "50%", background: T.blueLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>📧</div>
                      )}
                      <div onClick={() => { setContatti(cs => cs.map(x => x.id === c.id ? { ...x, preferito: !x.preferito } : x)); }} style={{ width: 32, height: 32, borderRadius: "50%", background: c.preferito ? "#ff950018" : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>
                        {c.preferito ? "⭐" : "☆"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>)}

        {/* FAB — Compose menu */}
        <style>{`
          @keyframes fabPulse { 0%,100% { box-shadow: 0 4px 20px rgba(0,122,255,0.4); } 50% { box-shadow: 0 4px 30px rgba(0,122,255,0.6); } }
        `}</style>
        {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", zIndex: 89 }} />}
        {[
          { ch: "whatsapp", ico: "💬", l: "WhatsApp", c: "#25d366" },
          { ch: "email", ico: "📧", l: "Email", c: "#007aff" },
          { ch: "sms", ico: "📱", l: "SMS", c: "#ff9500" },
          { ch: "telegram", ico: "✈️", l: "Telegram", c: "#0088cc" },
        ].map((item, i) => (
          <div key={item.ch} onClick={() => { setFabOpen(false); setComposeMsg(c => ({ ...c, canale: item.ch })); setShowCompose(true); }} style={{
            position: "fixed", bottom: 90 + (i + 1) * 58, right: 20, zIndex: 90,
            display: "flex", alignItems: "center", gap: 10, flexDirection: "row-reverse",
            opacity: fabOpen ? 1 : 0, transform: fabOpen ? "translateY(0) scale(1)" : "translateY(30px) scale(0.5)",
            transition: `all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) ${fabOpen ? i * 0.06 : 0}s`,
            pointerEvents: fabOpen ? "auto" : "none",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: item.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 4px 16px ${item.c}50`, cursor: "pointer" }}>
              {item.ico}
            </div>
            <div style={{ padding: "6px 12px", borderRadius: 8, background: T.card, border: `1px solid ${T.bdr}`, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", fontSize: 12, fontWeight: 700, color: item.c, whiteSpace: "nowrap" }}>
              {item.l}
            </div>
          </div>
        ))}
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
      </div>
    );
  };

  /* ── SETTINGS TAB ── */
  const renderSettings = () => (
    <div style={{ paddingBottom: 80 }}>
      <div style={S.header}>
        <div style={{ flex: 1 }}>
          <div style={S.headerTitle}>Impostazioni</div>
        </div>
        {/* FIX: rimosso supabase.auth.signOut() — usa localStorage clear */}
        <div onClick={() => { try { localStorage.clear(); } catch(e) {} window.location.reload(); }}
          style={{padding:"6px 12px",borderRadius:8,border:"1px solid #e5e5ea",background:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",color:"#86868b"}}>
          Esci
        </div>
      </div>

      {/* Settings sub-tabs — scrollable */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", margin: "8px 16px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }}>
        <div style={{ display: "flex", minWidth: "max-content" }}>
          {[{ id: "azienda", l: "🏢 Azienda" }, { id: "generali", l: "⚙️ Generali" }, { id: "team", l: "👥 Team" }, { id: "sistemi", l: "🏗 Sistemi" }, { id: "colori", l: "🎨 Colori" }, { id: "vetri", l: "🪟 Vetri" }, { id: "tipologie", l: "📐 Tipologie" }, { id: "coprifili", l: "📏 Coprifili" }, { id: "lamiere", l: "🔩 Lamiere" }, { id: "salita", l: "🪜 Salita" }, { id: "pipeline", l: "📊 Pipeline" }].map(t => (
            <div key={t.id} onClick={() => setSettingsTab(t.id)} style={{ padding: "8px 12px", textAlign: "center", fontSize: 10, fontWeight: 600, background: settingsTab === t.id ? T.acc : T.card, color: settingsTab === t.id ? "#fff" : T.sub, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t.l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* ═══ AZIENDA ═══ */}
        {settingsTab === "azienda" && (
          <div style={{background:"#fff",borderRadius:12,overflow:"hidden",border:`1px solid ${T.bdr}`}}>
            <div style={{padding:"12px 14px",background:T.acc,color:"#fff"}}>
              <div style={{fontSize:13,fontWeight:800}}>Dati Azienda</div>
              <div style={{fontSize:10,opacity:0.8,marginTop:2}}>Questi dati appaiono sul PDF del preventivo</div>
            </div>
            {/* LOGO */}
            <div style={{padding:"14px",borderBottom:`1px solid ${T.bdr}`}}>
              <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.04em"}}>Logo Azienda</div>
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style={{display:"none"}} onChange={e=>{
                const f=e.target.files?.[0]; if(!f) return;
                const r=new FileReader(); r.onload=ev=>setAziendaInfo(a=>({...a,logo:ev.target.result}));
                r.readAsDataURL(f); e.target.value="";
              }}/>
              {aziendaInfo.logo ? (
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:80,height:60,border:`1px solid ${T.bdr}`,borderRadius:8,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#f9f9f9"}}>
                    <img src={aziendaInfo.logo} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}} alt="logo"/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:4}}>Logo caricato ✓</div>
                    <div style={{display:"flex",gap:6}}>
                      <div onClick={()=>logoInputRef.current?.click()} style={{fontSize:11,color:T.acc,fontWeight:700,cursor:"pointer"}}>Cambia</div>
                      <span style={{color:T.bdr}}>·</span>
                      <div onClick={()=>setAziendaInfo(a=>({...a,logo:null}))} style={{fontSize:11,color:"#ff3b30",fontWeight:700,cursor:"pointer"}}>Rimuovi</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div onClick={()=>logoInputRef.current?.click()} style={{border:`2px dashed ${T.bdr}`,borderRadius:10,padding:"16px",textAlign:"center",cursor:"pointer",background:"#fafafa"}}>
                  <div style={{fontSize:24,marginBottom:4}}>🖼</div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text}}>Carica logo</div>
                  <div style={{fontSize:10,color:T.sub,marginTop:2}}>PNG, JPG, SVG · max 2MB</div>
                </div>
              )}
            </div>
            {[
              {label:"Ragione Sociale",field:"ragione",placeholder:"Es. Walter Cozza Serramenti SRL"},
              {label:"Partita IVA",field:"piva",placeholder:"Es. 01234567890"},
              {label:"Indirizzo",field:"indirizzo",placeholder:"Es. Via Roma 1, 87100 Cosenza (CS)"},
              {label:"Telefono",field:"telefono",placeholder:"Es. +39 0984 000000"},
              {label:"Email",field:"email",placeholder:"Es. info@azienda.it"},
              {label:"Sito web",field:"website",placeholder:"Es. www.azienda.it"},
              {label:"IBAN",field:"iban",placeholder:"Es. IT60 X054 2811 1010 0000 0123 456"},
              {label:"CCIAA / REA",field:"cciaa",placeholder:"Es. CS-123456"},
            ].map(({label,field,placeholder})=>(
              <div key={field} style={{padding:"10px 14px",borderBottom:`1px solid ${T.bdr}`}}>
                <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</div>
                <input
                  value={aziendaInfo[field]||""}
                  onChange={e=>setAziendaInfo(a=>({...a,[field]:e.target.value}))}
                  placeholder={placeholder}
                  style={{width:"100%",border:"none",fontSize:13,fontWeight:600,color:T.text,background:"transparent",fontFamily:FF,outline:"none",padding:0,boxSizing:"border-box"}}
                />
              </div>
            ))}
            <div style={{padding:"12px 14px",background:"#f0fdf4",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>✅</span>
              <span style={{fontSize:11,color:"#1a9e40",fontWeight:600}}>Salvato automaticamente in ogni preventivo PDF</span>
            </div>
          </div>
        )}

        {/* ═══ GENERALI ═══ */}
        {settingsTab === "generali" && (
          <>
            <div style={{...S.card,marginBottom:8}}><div style={S.cardInner}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700}}>🔔 Soglia commesse ferme</div>
                  <div style={{fontSize:11,color:T.sub}}>Alert se una commessa non avanza da N giorni</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <input type="number" min="1" max="30" value={sogliaDays} onChange={e=>setSogliaDays(parseInt(e.target.value)||5)}
                    style={{width:50,padding:"5px 8px",borderRadius:8,border:`1px solid ${T.bdr}`,fontSize:14,fontWeight:700,textAlign:"center",fontFamily:FF}}/>
                  <span style={{fontSize:11,color:T.sub}}>giorni</span>
                </div>
              </div>
            </div></div>
            <div style={S.card}><div style={S.cardInner}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {aziendaInfo.logo
                  ? <img src={aziendaInfo.logo} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",border:`1px solid ${T.bdr}`}} alt="logo"/>
                  : <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700 }}>FC</div>
                }
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Fabio Cozza</div>
                  <div style={{ fontSize: 12, color: T.sub }}>{aziendaInfo.ragione}</div>
                </div>
              </div>
            </div></div>
            <div style={{ ...S.card, marginTop: 8 }}><div style={S.cardInner}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 8 }}>TEMA</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["chiaro", "☀️"], ["scuro", "🌙"], ["oceano", "🌊"]].map(([id, ico]) => (
                  <div key={id} onClick={() => setTheme(id)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, border: `1.5px solid ${theme === id ? T.acc : T.bdr}`, textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 18 }}>{ico}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "capitalize", marginTop: 2 }}>{id}</div>
                  </div>
                ))}
              </div>
            </div></div>
            <div style={{ ...S.card, marginTop: 8 }}><div style={S.cardInner}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 8 }}>STATISTICHE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 12 }}>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: T.acc }}>{cantieri.length}</div>Commesse</div>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: T.blue }}>{countVani()}</div>Vani</div>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: T.grn }}>{tasks.filter(t => t.done).length}/{tasks.length}</div>Task</div>
              </div>
            </div></div>
          </>
        )}

        {/* ═══ TEAM ═══ */}
        {settingsTab === "team" && (
          <>
            {team.map(m => (
              <div key={m.id} style={{ ...S.card, marginBottom: 8 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.colore, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{m.nome.split(" ").map(n => n[0]).join("")}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.nome}</div>
                  <div style={{ fontSize: 11, color: T.sub }}>{m.ruolo} — {m.compiti}</div>
                </div>
                <Ico d={ICO.pen} s={14} c={T.sub} />
              </div></div>
            ))}
            <div onClick={() => { setSettingsModal("membro"); setSettingsForm({ nome: "", ruolo: "Posatore", compiti: "" }); }} style={{ padding: "14px", borderRadius: T.r, border: `1px dashed ${T.bdr}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600 }}>+ Aggiungi membro</div>
          </>
        )}

        {/* ═══ SISTEMI E SOTTOSISTEMI ═══ */}
        {settingsTab === "sistemi" && (
          <>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>Configura marche, sistemi e sottosistemi con colori collegati</div>
            {sistemiDB.map(s => (
              <div key={s.id} style={{ ...S.card, marginBottom: 8 }}><div style={S.cardInner}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.acc }}>{s.marca}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{s.sistema}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.grn, fontFamily: FM }}>€{s.euroMq}/mq</div>
                    <div style={{ fontSize: 9, color: T.sub }}>+{s.sovRAL}% RAL · +{s.sovLegno}% Legno</div>
                  </div>
                </div>
                {s.sottosistemi && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", marginBottom: 3 }}>Sottosistemi</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {s.sottosistemi.map(ss => <span key={ss} style={S.badge(T.blueLt, T.blue)}>{ss}</span>)}
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", marginBottom: 3 }}>Colori disponibili</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {s.colori.map(c => {
                    const col = coloriDB.find(x => x.code === c);
                    return <span key={c} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: col?.hex + "20", color: T.text, border: `1px solid ${col?.hex || T.bdr}40` }}>{col?.hex && <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: col.hex, marginRight: 4, verticalAlign: "middle" }} />}{c}</span>;
                  })}
                </div>
              </div></div>
            ))}
            <div onClick={() => { setSettingsModal("sistema"); setSettingsForm({ marca: "", sistema: "", euroMq: "", sovRAL: "", sovLegno: "", sottosistemi: "" }); }} style={{ padding: "14px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600 }}>+ Aggiungi sistema</div>
          </>
        )}

        {/* ═══ COLORI ═══ */}
        {settingsTab === "colori" && (
          <>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>Colori disponibili — collegati ai sistemi</div>
            {coloriDB.map(c => (
              <div key={c.id} style={{ ...S.card, marginBottom: 6 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: c.hex, border: `1px solid ${T.bdr}`, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nome}</div>
                  <div style={{ fontSize: 10, color: T.sub }}>{c.code} · {c.tipo}</div>
                </div>
                <div style={{ fontSize: 10, color: T.sub }}>{sistemiDB.filter(s => s.colori.includes(c.code)).map(s => s.marca).join(", ") || "—"}</div>
                <div onClick={() => deleteSettingsItem("colore", c.id)} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
              </div></div>
            ))}
            <div onClick={() => { setSettingsModal("colore"); setSettingsForm({ nome: "", code: "", hex: "#888888", tipo: "RAL" }); }} style={{ padding: "14px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600 }}>+ Aggiungi colore</div>
          </>
        )}

        {/* ═══ VETRI ═══ */}
        {settingsTab === "vetri" && (
          <>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>Tipologie vetro disponibili per i vani</div>
            {vetriDB.map(g => (
              <div key={g.id} style={{ ...S.card, marginBottom: 6 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{g.nome}</div>
                  <div style={{ fontSize: 11, color: T.sub, fontFamily: FM }}>{g.code}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ padding: "3px 8px", borderRadius: 6, background: g.ug <= 0.7 ? T.grnLt : g.ug <= 1.0 ? T.orangeLt : T.redLt, fontSize: 12, fontWeight: 700, fontFamily: FM, color: g.ug <= 0.7 ? T.grn : g.ug <= 1.0 ? T.orange : T.red }}>Ug={g.ug}</span>
                  <div onClick={() => deleteSettingsItem("vetro", g.id)} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
                </div>
              </div></div>
            ))}
            <div onClick={() => { setSettingsModal("vetro"); setSettingsForm({ nome: "", code: "", ug: "" }); }} style={{ padding: "14px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600 }}>+ Aggiungi vetro</div>
          </>
        )}

        {/* ═══ TIPOLOGIE ═══ */}
        {settingsTab === "tipologie" && (
          <>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>Tipologie serramento — trascina ⭐ per i preferiti</div>
            {TIPOLOGIE_RAPIDE.map(t => {
              const isFav = favTipologie.includes(t.code);
              return (
                <div key={t.code} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px" }}>
                  <div onClick={() => setFavTipologie(fav => isFav ? fav.filter(f => f !== t.code) : [...fav, t.code])} style={{ cursor: "pointer" }}>
                    <span style={{ fontSize: 16, color: isFav ? "#ff9500" : T.bdr }}>{isFav ? "⭐" : "☆"}</span>
                  </div>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: FM }}>{t.code}</span>
                    <span style={{ fontSize: 11, color: T.sub, marginLeft: 6 }}>{t.label}</span>
                  </div>
                  <Ico d={ICO.pen} s={14} c={T.sub} />
                </div></div>
              );
            })}
            <div onClick={() => { setSettingsModal("tipologia"); setSettingsForm({ code: "", label: "", icon: "🪟" }); }} style={{ padding: "14px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi tipologia</div>
          </>
        )}

        {/* ═══ COPRIFILI ═══ */}
        {settingsTab === "coprifili" && (
          <>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>Lista coprifili disponibili nella creazione vano</div>
            {coprifiliDB.map(c => (
              <div key={c.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: FM, color: T.acc }}>{c.cod}</span>
                  <span style={{ fontSize: 12, marginLeft: 8 }}>{c.nome}</span>
                </div>
                <div onClick={() => deleteSettingsItem("coprifilo", c.id)} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
              </div></div>
            ))}
            <div onClick={() => { setSettingsModal("coprifilo"); setSettingsForm({ nome: "", cod: "" }); }} style={{ padding: "14px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi coprifilo</div>
          </>
        )}

        {/* ═══ LAMIERE ═══ */}
        {settingsTab === "lamiere" && (
          <>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>Lista lamiere e scossaline</div>
            {lamiereDB.map(l => (
              <div key={l.id} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: FM, color: T.orange }}>{l.cod}</span>
                  <span style={{ fontSize: 12, marginLeft: 8 }}>{l.nome}</span>
                </div>
                <div onClick={() => deleteSettingsItem("lamiera", l.id)} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
              </div></div>
            ))}
            <div onClick={() => { setSettingsModal("lamiera"); setSettingsForm({ nome: "", cod: "" }); }} style={{ padding: "14px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi lamiera</div>
          </>
        )}

        {/* ═══ SALITA ═══ */}
        {settingsTab === "salita" && (
          <>
            <div style={{ fontSize: 11, color: T.sub, marginBottom: 8 }}>Configura i mezzi di salita disponibili</div>
            {mezziSalita.map((m, i) => (
              <div key={i} style={{ ...S.card, marginBottom: 4 }}><div style={{ ...S.cardInner, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🪜</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m}</span>
                </div>
                <div onClick={() => { if ((()=>{try{return window.confirm(`Eliminare "${m}"?`);}catch(e){return false;}})()) setMezziSalita(ms => ms.filter((_, j) => j !== i)); }} style={{ cursor: "pointer" }}><Ico d={ICO.trash} s={14} c={T.sub} /></div>
              </div></div>
            ))}
            <div onClick={() => { let n; try{n=window.prompt("Nome mezzo di salita:");}catch(e){} if (n?.trim()) setMezziSalita(ms => [...ms, n.trim()]); }} style={{ padding: "14px", borderRadius: T.r, border: `1px dashed ${T.acc}`, textAlign: "center", cursor: "pointer", color: T.acc, fontSize: 12, fontWeight: 600, marginTop: 4 }}>+ Aggiungi mezzo salita</div>
          </>
        )}

        {/* ═══ PIPELINE ═══ */}
        {settingsTab === "pipeline" && (
          <>
            <div style={{fontSize:12,color:T.sub,padding:"0 4px 10px",lineHeight:1.5}}>Personalizza il flusso di lavoro. Disattiva le fasi che non usi, rinominale o riordinale.</div>
            {pipelineDB.map((p, i) => (
              <div key={p.id} style={{...S.card, marginBottom:6, opacity: p.attiva===false ? 0.45 : 1}}>
                <div style={{display:"flex", alignItems:"center", gap:8, padding:"10px 12px"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:1}}>
                    <div onClick={()=>{ if(i===0) return; const a=[...pipelineDB]; [a[i-1],a[i]]=[a[i],a[i-1]]; setPipelineDB(a); }} style={{fontSize:10,cursor:i===0?"default":"pointer",color:i===0?T.bdr:T.sub,lineHeight:1}}>▲</div>
                    <div onClick={()=>{ if(i===pipelineDB.length-1) return; const a=[...pipelineDB]; [a[i],a[i+1]]=[a[i+1],a[i]]; setPipelineDB(a); }} style={{fontSize:10,cursor:i===pipelineDB.length-1?"default":"pointer",color:i===pipelineDB.length-1?T.bdr:T.sub,lineHeight:1}}>▼</div>
                  </div>
                  <span style={{fontSize:20,flexShrink:0}}>{p.ico}</span>
                  <input value={p.nome} onChange={e=>setPipelineDB(db=>db.map((x,j)=>j===i?{...x,nome:e.target.value}:x))}
                    style={{flex:1,border:"none",background:"transparent",fontSize:13,fontWeight:700,color:T.text,fontFamily:FF,outline:"none",padding:0}}/>
                  <div style={{width:12,height:12,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                  <div onClick={()=>{ if(p.id==="chiusura") return; setPipelineDB(db=>db.map((x,j)=>j===i?{...x,attiva:x.attiva===false?true:false}:x)); }}
                    style={{width:36,height:20,borderRadius:10,background:p.attiva===false?T.bdr:T.grn,cursor:p.id==="chiusura"?"default":"pointer",transition:"background 0.2s",position:"relative",flexShrink:0}}>
                    <div style={{position:"absolute",top:2,left:p.attiva===false?2:18,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                  </div>
                  {p.custom && <div onClick={()=>setPipelineDB(db=>db.filter((_,j)=>j!==i))} style={{fontSize:12,cursor:"pointer",color:T.red}}>✕</div>}
                </div>
              </div>
            ))}
            <div onClick={()=>{ let nome; try{nome=window.prompt("Nome nuova fase:");}catch(e){} if(nome?.trim()) setPipelineDB(db=>[...db.slice(0,-1),{id:"custom_"+Date.now(),nome:nome.trim(),ico:"⭐",color:"#8e8e93",attiva:true,custom:true},...db.slice(-1)]); }}
              style={{...S.card,marginTop:4,textAlign:"center",padding:"10px",cursor:"pointer",color:T.acc,fontSize:13,fontWeight:700}}>+ Aggiungi fase personalizzata</div>
            <div onClick={()=>{if((()=>{try{return window.confirm("Ripristinare le fasi predefinite?");}catch(e){return false;}})())setPipelineDB(PIPELINE_DEFAULT);}}
              style={{textAlign:"center",padding:"10px 0 4px",fontSize:11,color:T.sub,cursor:"pointer"}}>Ripristina predefinita</div>
          </>
        )}
      </div>
    </div>
  );

  /* ═══════ MODALS ═══════ */
  const renderModal = () => {
    if (!showModal) return null;
    return (
      <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowModal(null)}>
        <div style={S.modalInner}>
          {/* TASK MODAL */}
          {showModal === "task" && (
            <>
              <div style={S.modalTitle}>Nuovo task</div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Cosa devi fare?</label>
                <input style={S.input} placeholder="es. Sopralluogo, chiamare fornitore..." value={newTask.text} onChange={e => setNewTask(t => ({ ...t, text: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={S.fieldLabel}>Data</label>
                  <input style={S.input} type="date" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.fieldLabel}>Ora (opz.)</label>
                  <input style={S.input} type="time" value={newTask.time} onChange={e => setNewTask(t => ({ ...t, time: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Priorità</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[{ id: "alta", l: "Urgente", c: T.red }, { id: "media", l: "Normale", c: T.orange }, { id: "bassa", l: "Bassa", c: T.sub }].map(p => (
                    <div key={p.id} onClick={() => setNewTask(t => ({ ...t, priority: p.id }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${newTask.priority === p.id ? p.c : T.bdr}`, background: newTask.priority === p.id ? p.c + "18" : "transparent", color: p.c, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {p.l}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Collega a commessa (opzionale)</label>
                <select style={S.select} value={newTask.cm} onChange={e => setNewTask(t => ({ ...t, cm: e.target.value }))}>
                  <option value="">— Nessuna —</option>
                  {cantieri.map(c => <option key={c.id} value={c.code}>{c.code} · {c.cliente}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Note (opzionale)</label>
                <input style={S.input} placeholder="Dettagli, materiale da portare..." value={newTask.meta} onChange={e => setNewTask(t => ({ ...t, meta: e.target.value }))} />
              </div>
              {/* Task Allegati */}
              <div style={{ marginBottom: 14 }}>
                <label style={S.fieldLabel}>Allegati</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { ico: "📎", l: "File", act: () => setTaskAllegati(a => [...a, { id: Date.now(), tipo: "file", nome: "Allegato_" + (a.length + 1) }]) },
                    { ico: "📝", l: "Nota", act: () => { let txt; try{txt=window.prompt("Nota:");}catch(e){} if (txt) setTaskAllegati(a => [...a, { id: Date.now(), tipo: "nota", nome: txt }]); }},
                    { ico: "🎤", l: "Audio", act: () => setTaskAllegati(a => [...a, { id: Date.now(), tipo: "vocale", nome: "Audio " + (a.length + 1) }]) },
                    { ico: "📷", l: "Foto", act: () => setTaskAllegati(a => [...a, { id: Date.now(), tipo: "foto", nome: "Foto " + (a.length + 1) }]) },
                  ].map((b, i) => (
                    <div key={i} onClick={b.act} style={{ flex: 1, padding: "8px 4px", background: T.bg, borderRadius: 8, border: `1px solid ${T.bdr}`, textAlign: "center", cursor: "pointer" }}>
                      <div style={{ fontSize: 16 }}>{b.ico}</div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: T.sub, marginTop: 1 }}>{b.l}</div>
                    </div>
                  ))}
                </div>
                {taskAllegati.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {taskAllegati.map(a => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: T.bg, border: `1px solid ${T.bdr}`, fontSize: 10 }}>
                        <span>{a.tipo === "nota" ? "📝" : a.tipo === "vocale" ? "🎤" : a.tipo === "foto" ? "📷" : "📎"}</span>
                        <span style={{ color: T.text, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nome}</span>
                        <span onClick={() => setTaskAllegati(al => al.filter(x => x.id !== a.id))} style={{ cursor: "pointer", color: T.red }}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button style={S.btn} onClick={addTask}>Crea task</button>
              <button style={S.btnCancel} onClick={() => setShowModal(null)}>Annulla</button>
            </>
          )}

          {/* COMMESSA MODAL */}
          {showModal === "commessa" && (
            <>
              <div style={S.modalTitle}>Nuova commessa</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                {[{ id: "nuova", l: "🆕 Nuova installazione", c: T.acc }, { id: "riparazione", l: "🔧 Riparazione", c: T.orange }].map(t => (
                  <div key={t.id} onClick={() => { setNewCM(c => ({ ...c, tipo: t.id })); setRipSearch(""); setRipCMSel(null); setRipProblema(""); setRipFotos([]); setRipUrgenza("media"); }}
                    style={{ flex: 1, padding: "12px 6px", borderRadius: 12, border: `2px solid ${newCM.tipo === t.id ? (t.id==="nuova"?T.acc:T.orange) : T.bdr}`, background: newCM.tipo === t.id ? (t.id==="nuova"?T.acc:T.orange)+"12" : T.card, textAlign: "center", cursor: "pointer", transition:"all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: newCM.tipo === t.id ? (t.id==="nuova"?T.acc:T.orange) : T.sub }}>{t.l}</div>
                  </div>
                ))}
              </div>

              {/* ── FLUSSO RIPARAZIONE ── */}
              {newCM.tipo === "riparazione" && (() => {
                const addRipFoto = (e) => {
                  const file = e.target.files?.[0]; if(!file) return;
                  const r = new FileReader();
                  r.onload = ev => setRipFotos(fs => [...fs, { id: Date.now(), dataUrl: ev.target.result, nome: file.name }]);
                  r.readAsDataURL(file); e.target.value = "";
                };
                const cmResults = ripSearch.length > 1
                  ? cantieri.filter(c => c.cliente.toLowerCase().includes(ripSearch.toLowerCase()) || c.code.toLowerCase().includes(ripSearch.toLowerCase()) || c.indirizzo.toLowerCase().includes(ripSearch.toLowerCase()))
                  : [];
                const addRiparazione = () => {
                  if (!ripProblema.trim()) return;
                  const code = "CM-" + String(cantieri.length + 1).padStart(4, "0");
                  const nuova = {
                    id: Date.now(), code,
                    cliente: ripCMSel ? ripCMSel.cliente : (newCM.cliente || ripSearch),
                    indirizzo: newCM.indirizzo || ripCMSel?.indirizzo || "",
                    telefono: newCM.telefono || ripCMSel?.telefono || "",
                    sistema: ripCMSel?.sistema || "",
                    tipo: "riparazione", fase: "sopralluogo",
                    cmCollegata: ripCMSel?.code || null,
                    problema: ripProblema,
                    tipoProblema: newCM.tipoProblema || "",
                    tipoInfisso: newCM.tipoInfisso || "",
                    vanoProblema: newCM.vanoProblema || "",
                    dataRichiesta: newCM.dataRichiesta || "",
                    chiSegnala: newCM.chiSegnala || "",
                    preventivoStimato: newCM.preventivoStimato || "",
                    urgenza: ripUrgenza,
                    fotoProblema: ripFotos,
                    vani: ripCMSel?.vani || [], note: ripProblema,
                    alert: ripUrgenza === "urgente" ? "⚠️ Riparazione urgente" : null,
                    creato: new Date().toLocaleDateString("it-IT", {day:"numeric",month:"short"}),
                    aggiornato: new Date().toLocaleDateString("it-IT", {day:"numeric",month:"short"}),
                    allegati: [],
                  };
                  setCantieri(cs => [nuova, ...cs]);
                  setRipSearch(""); setRipCMSel(null); setRipProblema(""); setRipFotos([]); setRipUrgenza("media");
                  setNewCM(c => ({...c, tipo:"nuova", cliente:"", indirizzo:"", telefono:"", tipoProblema:"", tipoInfisso:"", vanoProblema:"", dataRichiesta:"", chiSegnala:"", preventivoStimato:""}));
                  setShowModal(null);
                  setSelectedCM(nuova); setTab("commesse");
                };
                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

                    <div>
                      <label style={S.fieldLabel}>Cliente o commessa esistente</label>
                      <input style={S.input} placeholder="Cerca nome, codice CM, indirizzo…"
                        value={ripSearch} onChange={e => { setRipSearch(e.target.value); if(ripCMSel) setRipCMSel(null); }}/>
                      {cmResults.length > 0 && !ripCMSel && (
                        <div style={{ marginTop:4, background:T.card, border:`1px solid ${T.bdr}`, borderRadius:10, overflow:"hidden" }}>
                          {cmResults.slice(0,4).map(c => (
                            <div key={c.id} onClick={() => { setRipCMSel(c); setRipSearch(c.cliente); setNewCM(x=>({...x,indirizzo:c.indirizzo,telefono:c.telefono})); }}
                              style={{ padding:"10px 14px", borderBottom:`1px solid ${T.bg}`, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <div>
                                <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{c.cliente}</div>
                                <div style={{ fontSize:11, color:T.sub, marginTop:1 }}>{c.code} · {c.indirizzo}</div>
                                {c.vani.length>0 && <div style={{ fontSize:10, color:T.sub }}>{c.vani.length} vani</div>}
                              </div>
                              <div style={{ fontSize:10, fontWeight:600, color:T.acc }}>Collega →</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {ripCMSel && (
                        <div style={{ marginTop:6, padding:"8px 12px", background:T.accLt, border:`1px solid ${T.acc}30`, borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div>
                            <div style={{ fontSize:12, fontWeight:700, color:T.acc }}>✓ Collegata a {ripCMSel.code}</div>
                            <div style={{ fontSize:11, color:T.sub, marginTop:1 }}>{ripCMSel.cliente} · {ripCMSel.indirizzo}</div>
                          </div>
                          <div onClick={() => { setRipCMSel(null); setRipSearch(""); setNewCM(x=>({...x,indirizzo:"",telefono:""})); }} style={{ fontSize:14, color:T.sub, cursor:"pointer", padding:4 }}>✕</div>
                        </div>
                      )}
                      {!ripCMSel && (
                        <div style={{ fontSize:10, color:T.sub, marginTop:3 }}>Lascia vuoto per cliente nuovo</div>
                      )}
                    </div>

                    {!ripCMSel && (
                      <div style={{ padding:"12px", background:T.bg, borderRadius:10, border:`1px solid ${T.bdr}`, display:"flex", flexDirection:"column", gap:8 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:T.sub, textTransform:"uppercase", letterSpacing:"0.06em" }}>Dati cliente nuovo</div>
                        <input style={S.input} placeholder="Nome e cognome" value={newCM.cliente} onChange={e=>setNewCM(c=>({...c,cliente:e.target.value}))}/>
                        <div style={{ display:"flex", gap:8 }}>
                          <input style={{...S.input,flex:2}} placeholder="Indirizzo" value={newCM.indirizzo} onChange={e=>setNewCM(c=>({...c,indirizzo:e.target.value}))}/>
                          <input style={{...S.input,flex:1}} placeholder="Telefono" value={newCM.telefono} onChange={e=>setNewCM(c=>({...c,telefono:e.target.value}))}/>
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={S.fieldLabel}>Urgenza</label>
                      <div style={{ display:"flex", gap:6 }}>
                        {[{id:"normale",l:"Normale",c:T.grn,e:"🟢"},{id:"media",l:"Media",c:T.orange,e:"🟡"},{id:"urgente",l:"Urgente",c:T.red,e:"🔴"}].map(u => (
                          <div key={u.id} onClick={() => setRipUrgenza(u.id)}
                            style={{ flex:1, padding:"8px 4px", borderRadius:8, border:`1.5px solid ${ripUrgenza===u.id?u.c:T.bdr}`, background:ripUrgenza===u.id?u.c+"15":T.card, textAlign:"center", cursor:"pointer", transition:"all 0.12s" }}>
                            <div style={{ fontSize:14 }}>{u.e}</div>
                            <div style={{ fontSize:10, fontWeight:700, color:ripUrgenza===u.id?u.c:T.sub, marginTop:2 }}>{u.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={S.fieldLabel}>Tipo problema</label>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {["Vetro rotto","Cardine","Guarnizione","Serratura","Maniglia","Tapparella","Infiltrazioni","Deformazione","Altro"].map(t => (
                          <div key={t} onClick={() => setNewCM(c=>({...c,tipoProblema:c.tipoProblema===t?"":t}))}
                            style={{ padding:"5px 10px", borderRadius:20, border:`1.5px solid ${newCM.tipoProblema===t?T.orange:T.bdr}`, background:newCM.tipoProblema===t?T.orangeLt:T.card, fontSize:11, fontWeight:600, color:newCM.tipoProblema===t?T.orange:T.sub, cursor:"pointer", transition:"all 0.12s" }}>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={S.fieldLabel}>Tipo infisso</label>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {["Finestra","Porta","Portafinestra","Scorrevole","Tapparella","Persiana","Zanzariera","Altro"].map(t => (
                          <div key={t} onClick={() => setNewCM(c=>({...c,tipoInfisso:c.tipoInfisso===t?"":t}))}
                            style={{ padding:"5px 10px", borderRadius:20, border:`1.5px solid ${newCM.tipoInfisso===t?T.acc:T.bdr}`, background:newCM.tipoInfisso===t?T.accLt:T.card, fontSize:11, fontWeight:600, color:newCM.tipoInfisso===t?T.acc:T.sub, cursor:"pointer", transition:"all 0.12s" }}>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    {ripCMSel && ripCMSel.vani.length > 0 && (
                      <div>
                        <label style={S.fieldLabel}>Vano con il problema</label>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                          {ripCMSel.vani.map(v => (
                            <div key={v.id} onClick={() => setNewCM(c=>({...c,vanoProblema:c.vanoProblema===v.nome?"":v.nome}))}
                              style={{ padding:"5px 10px", borderRadius:20, border:`1.5px solid ${newCM.vanoProblema===v.nome?T.acc:T.bdr}`, background:newCM.vanoProblema===v.nome?T.accLt:T.card, fontSize:11, fontWeight:600, color:newCM.vanoProblema===v.nome?T.acc:T.sub, cursor:"pointer" }}>
                              {v.nome}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={S.fieldLabel}>Descrizione problema *</label>
                      <textarea style={{ ...S.input, minHeight:70, resize:"vertical" }}
                        placeholder="Descrivi il problema in dettaglio…"
                        value={ripProblema} onChange={e => setRipProblema(e.target.value)}/>
                    </div>

                    <div>
                      <label style={S.fieldLabel}>Chi segnala</label>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {["Cliente","Posatore","Tecnico","Subappaltatore","Altro"].map(t => (
                          <div key={t} onClick={() => setNewCM(c=>({...c,chiSegnala:c.chiSegnala===t?"":t}))}
                            style={{ padding:"5px 10px", borderRadius:20, border:`1.5px solid ${newCM.chiSegnala===t?T.acc:T.bdr}`, background:newCM.chiSegnala===t?T.accLt:T.card, fontSize:11, fontWeight:600, color:newCM.chiSegnala===t?T.acc:T.sub, cursor:"pointer" }}>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={S.fieldLabel}>Data richiesta intervento</label>
                      <input type="date" style={S.input} value={newCM.dataRichiesta} onChange={e=>setNewCM(c=>({...c,dataRichiesta:e.target.value}))}/>
                    </div>

                    <div>
                      <label style={S.fieldLabel}>Preventivo stimato (€)</label>
                      <input style={S.input} type="number" inputMode="numeric" placeholder="es. 250" value={newCM.preventivoStimato} onChange={e=>setNewCM(c=>({...c,preventivoStimato:e.target.value}))}/>
                    </div>

                    <div>
                      <label style={S.fieldLabel}>Foto del problema ({ripFotos.length})</label>
                      {ripFotos.length === 0
                        ? <div onClick={() => ripFotoRef.current?.click()}
                            style={{ border:`1.5px dashed ${T.bdr}`, borderRadius:10, padding:"20px", textAlign:"center", cursor:"pointer" }}>
                            <div style={{ fontSize:28, marginBottom:4 }}>📷</div>
                            <div style={{ fontSize:12, color:T.sub }}>Scatta o allega una foto</div>
                            <div style={{ fontSize:10, color:T.sub2||T.sub, marginTop:2 }}>Puoi aggiungerne quante vuoi</div>
                          </div>
                        : <div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                              {ripFotos.map((f,i) => (
                                <div key={f.id} style={{ position:"relative", width:76, height:76, borderRadius:10, overflow:"hidden", background:T.bg }}>
                                  <img src={f.dataUrl} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={`Foto ${i+1}`}/>
                                  <div onClick={() => setRipFotos(fs => fs.filter(x => x.id !== f.id))}
                                    style={{ position:"absolute", top:3, right:3, width:20, height:20, borderRadius:"50%", background:"rgba(0,0,0,0.55)", color:"#fff", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontWeight:700 }}>✕</div>
                                  <div style={{ position:"absolute", bottom:2, left:4, fontSize:9, color:"#fff", fontWeight:700, textShadow:"0 1px 2px rgba(0,0,0,0.7)" }}>#{i+1}</div>
                                </div>
                              ))}
                              {/* FIX: usa ref invece di getElementById */}
                              <div onClick={() => ripFotoRef.current?.click()}
                                style={{ width:76, height:76, borderRadius:10, border:`1.5px dashed ${T.bdr}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", color:T.sub }}>
                                <div style={{ fontSize:22 }}>+</div>
                                <div style={{ fontSize:9, fontWeight:600 }}>Aggiungi</div>
                              </div>
                            </div>
                          </div>
                      }
                      <input ref={ripFotoRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={addRipFoto}/>
                    </div>

                    <div style={{ paddingTop:4 }}>
                      {!ripProblema.trim() && (
                        <div style={{ fontSize:11, color:T.orange, fontWeight:600, marginBottom:8, textAlign:"center" }}>⚠️ Descrivi il problema per procedere</div>
                      )}
                      <button style={{ ...S.btn, background:ripProblema.trim()?T.orange:"#ccc", cursor:ripProblema.trim()?"pointer":"not-allowed" }}
                        onClick={addRiparazione} disabled={!ripProblema.trim()}>
                        🔧 Crea riparazione
                      </button>
                      <button style={S.btnCancel} onClick={() => setShowModal(null)}>Annulla</button>
                    </div>

                  </div>
                );
              })()}

              {/* ── FLUSSO NUOVA INSTALLAZIONE ── */}
              {newCM.tipo === "nuova" && (() => {
                const AccordionSection = ({ id, icon, label, badge, children }) => {
                  const open = newCM._open === id;
                  return (
                    <div style={{ marginBottom:8, borderRadius:10, border:`1px solid ${T.bdr}`, overflow:"hidden" }}>
                      <div onClick={() => setNewCM(c=>({...c,_open:open?null:id}))}
                        style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", background:T.card, cursor:"pointer" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:16 }}>{icon}</span>
                          <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{label}</span>
                          {badge && <span style={{ ...S.badge(T.accLt,T.acc), fontSize:10 }}>{badge}</span>}
                        </div>
                        <span style={{ fontSize:12, color:T.sub, transition:"transform 0.2s", display:"inline-block", transform:open?"rotate(180deg)":"rotate(0deg)" }}>▼</span>
                      </div>
                      {open && <div style={{ padding:"12px 14px", background:T.bg, borderTop:`1px solid ${T.bdr}` }}>{children}</div>}
                    </div>
                  );
                };

                const previewCode = "S-" + String(cantieri.length + 1).padStart(4,"0");

                return (
                  <>
                    <div style={{ marginBottom:14, padding:"8px 12px", background:T.bg, borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:11, color:T.sub }}>Numero commessa:</span>
                      <span style={{ fontSize:13, fontWeight:800, color:T.acc, fontFamily:FM }}>{previewCode}</span>
                      <span style={{ fontSize:10, color:T.sub }}>(assegnato automaticamente)</span>
                    </div>

                    <div style={{ marginBottom:14, padding:"14px", background:T.card, borderRadius:12, border:`1.5px solid ${T.bdr}` }}>
                      <div style={{ fontSize:10, fontWeight:800, color:T.sub, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>👤 Dati cliente *</div>
                      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                        <input style={{...S.input,flex:1}} placeholder="Nome" value={newCM.cliente} onChange={e=>setNewCM(c=>({...c,cliente:e.target.value}))}/>
                        <input style={{...S.input,flex:1}} placeholder="Cognome" value={newCM.cognome||""} onChange={e=>setNewCM(c=>({...c,cognome:e.target.value}))}/>
                      </div>
                      <input style={{...S.input,marginBottom:8}} placeholder="Indirizzo lavori (Via, CAP, Città)" value={newCM.indirizzo} onChange={e=>setNewCM(c=>({...c,indirizzo:e.target.value}))}/>
                      <div style={{ display:"flex", gap:8 }}>
                        <input style={{...S.input,flex:1}} placeholder="Telefono" inputMode="tel" value={newCM.telefono} onChange={e=>setNewCM(c=>({...c,telefono:e.target.value}))}/>
                        <input style={{...S.input,flex:1}} placeholder="Email" inputMode="email" value={newCM.email||""} onChange={e=>setNewCM(c=>({...c,email:e.target.value}))}/>
                      </div>
                    </div>

                    <AccordionSection id="accesso" icon="🏗" label="Accesso / Difficoltà salita"
                      badge={newCM.difficoltaSalita||null}>
                      <div style={{ display:"flex", gap:4, marginBottom:8 }}>
                        {[{id:"facile",l:"Facile",c:T.grn,e:"✅"},{id:"media",l:"Media",c:T.orange,e:"⚠️"},{id:"difficile",l:"Difficile",c:T.red,e:"🔴"}].map(d => (
                          <div key={d.id} onClick={()=>setNewCM(c=>({...c,difficoltaSalita:d.id}))}
                            style={{ flex:1, padding:"8px 4px", borderRadius:8, border:`1.5px solid ${newCM.difficoltaSalita===d.id?d.c:T.bdr}`, background:newCM.difficoltaSalita===d.id?d.c+"15":T.card, textAlign:"center", cursor:"pointer" }}>
                            <div style={{ fontSize:14 }}>{d.e}</div>
                            <div style={{ fontSize:10, fontWeight:600, color:newCM.difficoltaSalita===d.id?d.c:T.sub }}>{d.l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:10, color:T.sub, fontWeight:600, marginBottom:2 }}>Piano edificio</div>
                          <select style={S.select} value={newCM.pianoEdificio} onChange={e=>setNewCM(c=>({...c,pianoEdificio:e.target.value}))}>
                            <option value="">— Seleziona —</option>
                            {["S2 — 2° Seminterrato","S1 — Seminterrato","PT — Piano Terra","P1 — 1° Piano","P2 — 2° Piano","P3 — 3° Piano","P4 — 4° Piano","P5 — 5° Piano","P6 — 6° Piano","P7 — 7° Piano","P8 — 8° Piano","P9 — 9° Piano","P10 — 10° Piano","P11 — 11° Piano","P12 — 12° Piano","P13 — 13° Piano","P14 — 14° Piano","P15 — 15° Piano","P16 — 16° Piano","P17 — 17° Piano","P18 — 18° Piano","P19 — 19° Piano","P20 — 20° Piano","M — Mansarda"].map(p=><option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:10, color:T.sub, fontWeight:600, marginBottom:2 }}>Foro scale (cm)</div>
                          <input style={S.input} placeholder="es. 80×200" value={newCM.foroScale} onChange={e=>setNewCM(c=>({...c,foroScale:e.target.value}))}/>
                        </div>
                      </div>
                      <div style={{ fontSize:10, color:T.sub, fontWeight:600, marginBottom:2 }}>Mezzo di salita</div>
                      <select style={S.select} value={newCM.mezzoSalita} onChange={e=>setNewCM(c=>({...c,mezzoSalita:e.target.value}))}>
                        <option value="">— Seleziona —</option>
                        {mezziSalita.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </AccordionSection>

                    <AccordionSection id="note" icon="📝" label="Note aggiuntive"
                      badge={newCM.note ? "✓" : null}>
                      <textarea style={{...S.input,minHeight:70,resize:"vertical"}}
                        placeholder="Note aggiuntive sulla commessa…"
                        defaultValue={newCM.note} onBlur={e=>setNewCM(c=>({...c,note:e.target.value}))}/>
                    </AccordionSection>

                    <div style={{ marginTop:6 }}>
                      {!newCM.cliente.trim() && (
                        <div style={{ fontSize:11, color:T.sub, textAlign:"center", marginBottom:8 }}>Inserisci almeno il nome per procedere</div>
                      )}
                      <button style={{ ...S.btn, background:newCM.cliente.trim()?T.acc:"#ccc", cursor:newCM.cliente.trim()?"pointer":"not-allowed" }}
                        onClick={addCommessa} disabled={!newCM.cliente.trim()}>
                        ✓ Crea commessa {previewCode}
                      </button>
                      <button style={S.btnCancel} onClick={() => setShowModal(null)}>Annulla</button>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>
    );
  };


  const generaPreventivoPDF = (c) => {
    const calcolaVanoPDF = (v) => {
      const m = v.misure||{};
      const lc=(m.lCentro||0)/1000, hc=(m.hCentro||0)/1000;
      const mq=lc*hc, perim=2*(lc+hc);
      const sysRec = sistemiDB.find(s=>(s.marca+" "+s.sistema)===v.sistema||s.sistema===v.sistema);
      let tot = mq * parseFloat(sysRec?.prezzoMq||sysRec?.euroMq||c.prezzoMq||350);
      const vetroRec = vetriDB.find(g=>g.code===v.vetro||g.nome===v.vetro);
      if(vetroRec?.prezzoMq) tot += mq * parseFloat(vetroRec.prezzoMq);
      const copRec = coprifiliDB.find(cp=>cp.cod===v.coprifilo);
      if(copRec?.prezzoMl) tot += perim * parseFloat(copRec.prezzoMl);
      const lamRec = lamiereDB.find(l=>l.cod===v.lamiera);
      if(lamRec?.prezzoMl) tot += lc * parseFloat(lamRec.prezzoMl);
      const tapp=v.accessori?.tapparella; if(tapp?.attivo&&c.prezzoTapparella){const tmq=((tapp.l||m.lCentro||0)/1000)*((tapp.h||m.hCentro||0)/1000);tot+=tmq*parseFloat(c.prezzoTapparella);}
      const pers=v.accessori?.persiana; if(pers?.attivo&&c.prezzoPersiana){const pmq=((pers.l||m.lCentro||0)/1000)*((pers.h||m.hCentro||0)/1000);tot+=pmq*parseFloat(c.prezzoPersiana);}
      const zanz=v.accessori?.zanzariera; if(zanz?.attivo&&c.prezzoZanzariera){const zmq=((zanz.l||m.lCentro||0)/1000)*((zanz.h||m.hCentro||0)/1000);tot+=zmq*parseFloat(c.prezzoZanzariera);}
      return { tot, mq };
    };
    const totale = c.vani.reduce((s,v)=>s+calcolaVanoPDF(v).tot, 0);
    const sconto = parseFloat(c.sconto||0);
    const scontoVal = totale * sconto / 100;
    const imponibile = totale - scontoVal;
    const iva = imponibile * 0.10;
    const totIva = imponibile + iva;
    const oggi = new Date().toLocaleDateString("it-IT");
    const righeVani = c.vani.map((v, i) => {
      const { tot: sub, mq } = calcolaVanoPDF(v);
      const m = v.misure||{};
      return '<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">'+(i+1)+'</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;">'+(v.nome||"Vano "+(i+1))+'</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">'+(v.tipo||"")+" — "+(v.stanza||"")+'</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">'+(v.sistema||c.sistema||"")+'</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">'+(m.lCentro||0)+" × "+(m.hCentro||0)+' mm</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">'+mq.toFixed(2)+' mq</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:700;">€ '+sub.toFixed(2)+'</td></tr>';
    }).join("");
    const scontoHtml = sconto>0 ? '<div class="row" style="color:#ff9500;"><span>Sconto '+sconto+'%</span><span>− € '+scontoVal.toFixed(2)+'</span></div><div class="row"><span>Imponibile netto</span><span>€ '+imponibile.toFixed(2)+'</span></div>' : '';
    const noteHtml = c.notePreventivo ? '<div style="border:1px solid #eee;border-radius:10px;padding:14px 18px;margin-bottom:24px;font-size:12px;color:#444;line-height:1.6;"><strong>Note:</strong> '+c.notePreventivo+'</div>' : '';
    const firmaHtml = c.firmaCliente ? '<img src="'+c.firmaCliente+'" style="max-height:60px;max-width:100%;display:block;margin:0 auto 4px;"/>' : '<div class="linea"></div>';
    const dataFirmaHtml = c.dataFirma ? ' — '+c.dataFirma : '';
    const html = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/><title>Preventivo '+c.code+'</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:-apple-system,Arial,sans-serif;color:#1a1a1c;font-size:13px;padding:40px;max-width:900px;margin:0 auto;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #007aff;}.azienda{font-size:22px;font-weight:900;color:#007aff;}.doc-title{text-align:right;}.doc-title h1{font-size:28px;font-weight:900;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}thead{background:#007aff;color:white;}thead th{padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;}thead th:last-child,thead th:nth-last-child(-n+3){text-align:right;}.totali{max-width:340px;margin-left:auto;background:#f5f5f7;border-radius:10px;padding:16px 20px;margin-bottom:24px;}.totali .row{display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;}.totali .row.main{font-size:16px;font-weight:900;padding-top:10px;border-top:2px solid #1a1a1c;margin-top:4px;color:#007aff;}.cliente-box{background:#f5f5f7;border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;gap:40px;}.cliente-box .label{font-size:10px;font-weight:700;color:#999;text-transform:uppercase;margin-bottom:4px;}.cliente-box .val{font-size:14px;font-weight:700;}.validita{background:#fff8ec;border:1px solid #ffb800;border-radius:8px;padding:10px 16px;font-size:11px;color:#7a5000;margin-bottom:20px;}.firma{display:flex;gap:40px;margin-top:40px;padding-top:20px;border-top:1px solid #eee;}.firma .box{flex:1;text-align:center;}.firma .linea{border-bottom:1px solid #999;margin-bottom:6px;height:50px;}.firma .label{font-size:10px;color:#666;text-transform:uppercase;}.footer{font-size:10px;color:#999;text-align:center;padding-top:20px;border-top:1px solid #eee;}@media print{body{padding:20px;}button{display:none!important;}}</style></head><body>'
      +(aziendaInfo.logo?'<div class="header" style="display:flex;justify-content:space-between;align-items:flex-start;"><div style="display:flex;align-items:center;gap:14px;"><img src="'+aziendaInfo.logo+'" style="height:56px;max-width:120px;object-fit:contain;" alt="logo"/><div>':'<div class="header"><div>')+'<div style="font-size:20px;font-weight:900;color:#007aff;">'+aziendaInfo.ragione+'</div>'+'<div style="font-size:11px;color:#666;">'+aziendaInfo.indirizzo+'</div>'+'<div style="font-size:11px;color:#666;">'+aziendaInfo.telefono+(aziendaInfo.email?' · '+aziendaInfo.email:'')+'</div>'+(aziendaInfo.piva?'<div style="font-size:10px;color:#999;">P.IVA '+aziendaInfo.piva+(aziendaInfo.cciaa?' · CCIAA '+aziendaInfo.cciaa:'')+'</div>':'')+(aziendaInfo.logo?'</div></div>':'</div>')+'<div style="text-align:right">'+'<h1 style="font-size:28px;font-weight:900;">PREVENTIVO</h1>'+'<div style="font-size:14px;color:#007aff;font-weight:700;">'+c.code+'</div>'+'<div style="font-size:11px;color:#666;">Data: '+oggi+'</div>'+'</div></div>'
      +'<div class="cliente-box"><div><div class="label">Cliente</div><div class="val">'+c.cliente+' '+(c.cognome||'')+'</div><div style="font-size:12px;color:#444;">'+(c.indirizzo||'')+'</div></div><div><div class="label">Contatto</div><div class="val">'+(c.telefono||'—')+'</div></div><div><div class="label">Vani</div><div class="val">'+c.vani.length+'</div></div></div>'
      +'<button onclick="window.print()" style="margin-bottom:16px;padding:10px 24px;background:#007aff;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">🖨 Stampa / Salva PDF</button>'
      +'<table><thead><tr><th>#</th><th>Vano</th><th>Tipologia</th><th>Sistema</th><th>Misura</th><th>Mq</th><th>Importo</th></tr></thead><tbody>'+righeVani+'</tbody></table>'
      +'<div class="totali"><div class="row"><span>Totale imponibile</span><span>€ '+totale.toFixed(2)+'</span></div>'+scontoHtml+'<div class="row"><span>IVA 10%</span><span>€ '+iva.toFixed(2)+'</span></div><div class="row main"><span>TOTALE</span><span>€ '+totIva.toFixed(2)+'</span></div></div>'
      +noteHtml
      +'<div class="validita">⏰ Preventivo valido 30 giorni. Prezzi IVA 10% inclusa per lavori di ristrutturazione.</div>'
      +'<div class="firma"><div class="box"><div class="linea"></div><div class="label">Timbro e firma azienda</div></div><div class="box">'+firmaHtml+'<div class="label">Firma cliente per accettazione'+dataFirmaHtml+'</div></div></div>'
      +'<div class="footer">'+aziendaInfo.ragione+(aziendaInfo.piva?' · P.IVA '+aziendaInfo.piva:'')+(aziendaInfo.iban?'<br>IBAN: '+aziendaInfo.iban:'')+'</div></body></html>';
    const blob = new Blob([html], {type:"text/html"});
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };


  const renderFirmaModal = () => {
    if (!showFirmaModal) return null;
    const c = selectedCM;
    const clearFirma = () => { const cv=firmaRef.current; if(cv){const ctx=cv.getContext("2d");ctx.clearRect(0,0,cv.width,cv.height);} };
    const salvaFirma = () => {
      const cv=firmaRef.current; if(!cv)return;
      const dataUrl=cv.toDataURL("image/png");
      setCantieri(cs=>cs.map(x=>x.id===c.id?{...x,firmaCliente:dataUrl,dataFirma:new Date().toLocaleDateString("it-IT")}:x));
      setSelectedCM(p=>({...p,firmaCliente:dataUrl,dataFirma:new Date().toLocaleDateString("it-IT")}));
      setShowFirmaModal(false);
    };
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:420,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #eee",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>✍️</span>
            <div><div style={{fontSize:14,fontWeight:800}}>Firma del Cliente</div><div style={{fontSize:11,color:"#666"}}>{c?.code}</div></div>
            <div onClick={()=>setShowFirmaModal(false)} style={{marginLeft:"auto",width:28,height:28,borderRadius:"50%",background:"#f5f5f7",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>✕</div>
          </div>
          <div style={{padding:"12px 16px 0"}}>
            <div style={{fontSize:11,color:"#666",marginBottom:8,textAlign:"center"}}>Firma nella casella qui sotto</div>
            <div style={{border:"2px solid #007aff",borderRadius:10,overflow:"hidden",background:"#fafafa",touchAction:"none"}}>
              <canvas ref={firmaRef} width={388} height={160} style={{width:"100%",height:160,display:"block",cursor:"crosshair"}}
                onPointerDown={e=>{firmaRef.current?.setPointerCapture(e.pointerId);setFirmaDrawing(true);const cv=firmaRef.current;const r=cv.getBoundingClientRect();const sx=cv.width/r.width,sy=cv.height/r.height;const ctx=cv.getContext("2d");ctx.beginPath();ctx.moveTo((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);ctx.strokeStyle="#1a1a1c";ctx.lineWidth=2.5;ctx.lineCap="round";ctx.lineJoin="round";}}
                onPointerMove={e=>{if(!firmaDrawing)return;const cv=firmaRef.current;const r=cv.getBoundingClientRect();const sx=cv.width/r.width,sy=cv.height/r.height;const ctx=cv.getContext("2d");ctx.lineTo((e.clientX-r.left)*sx,(e.clientY-r.top)*sy);ctx.stroke();}}
                onPointerUp={()=>setFirmaDrawing(false)} onPointerLeave={()=>setFirmaDrawing(false)}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0 10px"}}>
              <div style={{fontSize:10,color:"#999"}}>📅 {new Date().toLocaleDateString("it-IT")}</div>
              <div onClick={clearFirma} style={{fontSize:11,color:"#ff3b30",cursor:"pointer",fontWeight:600}}>🗑 Cancella</div>
            </div>
          </div>
          <div style={{padding:"0 16px 16px",display:"flex",gap:8}}>
            <button onClick={()=>setShowFirmaModal(false)} style={{flex:1,padding:12,borderRadius:10,border:"1px solid #eee",background:"#f5f5f7",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",color:"#666"}}>Annulla</button>
            <button onClick={salvaFirma} style={{flex:2,padding:12,borderRadius:10,border:"none",background:"linear-gradient(135deg,#34c759,#1a9e40)",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>✅ Conferma firma</button>
          </div>
        </div>
      </div>
    );
  };


  const renderPreventivoModal = () => {
    if (!showPreventivoModal || !selectedCM) return null;
    const c = selectedCM;
    const updateCMp = (field, val) => { setCantieri(cs=>cs.map(x=>x.id===c.id?{...x,[field]:val}:x)); setSelectedCM(p=>({...p,[field]:val})); };
    const calcolaVano = (v) => {
      const m=v.misure||{}; const lc=(m.lCentro||0)/1000,hc=(m.hCentro||0)/1000; const mq=lc*hc,perim=2*(lc+hc);
      const sysRec=sistemiDB.find(s=>(s.marca+" "+s.sistema)===v.sistema||s.sistema===v.sistema);
      let tot=mq*parseFloat(sysRec?.prezzoMq||sysRec?.euroMq||c.prezzoMq||350);
      const vetroRec=vetriDB.find(g=>g.code===v.vetro||g.nome===v.vetro); if(vetroRec?.prezzoMq) tot+=mq*parseFloat(vetroRec.prezzoMq);
      const copRec=coprifiliDB.find(cp=>cp.cod===v.coprifilo); if(copRec?.prezzoMl) tot+=perim*parseFloat(copRec.prezzoMl);
      const lamRec=lamiereDB.find(l=>l.cod===v.lamiera); if(lamRec?.prezzoMl) tot+=lc*parseFloat(lamRec.prezzoMl);
      const tapp=v.accessori?.tapparella; if(tapp?.attivo&&c.prezzoTapparella){const tmq=((tapp.l||m.lCentro||0)/1000)*((tapp.h||m.hCentro||0)/1000);tot+=tmq*parseFloat(c.prezzoTapparella);}
      const pers=v.accessori?.persiana; if(pers?.attivo&&c.prezzoPersiana){const pmq=((pers.l||m.lCentro||0)/1000)*((pers.h||m.hCentro||0)/1000);tot+=pmq*parseFloat(c.prezzoPersiana);}
      const zanz=v.accessori?.zanzariera; if(zanz?.attivo&&c.prezzoZanzariera){const zmq=((zanz.l||m.lCentro||0)/1000)*((zanz.h||m.hCentro||0)/1000);tot+=zmq*parseFloat(c.prezzoZanzariera);}
      return {tot,mq,sysRec,vetroRec,copRec,lamRec};
    };
    const vaniCalc=(c.vani||[]).map(v=>({...v,calc:calcolaVano(v)}));
    const totale=vaniCalc.reduce((s,v)=>s+v.calc.tot,0);
    const vaniSenzaSistema = vaniCalc.filter(v=>!v.calc.sysRec && !v.sistema);
    const vaniSenzaMisure = vaniCalc.filter(v=>!(v.misure?.lCentro) || !(v.misure?.hCentro));
    const hasWarnings = vaniSenzaSistema.length>0 || vaniSenzaMisure.length>0;
    const scontoVal=totale*parseFloat(c.sconto||0)/100;
    const imponibile=totale-scontoVal; const iva=imponibile*0.10; const totIva=imponibile+iva;
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setShowPreventivoModal(false)}>
        <div style={{background:"#f5f5f7",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto",paddingBottom:24}}>
          <div style={{padding:"16px 16px 10px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,background:"#f5f5f7",zIndex:1}}>
            <span style={{fontSize:20}}>📄</span>
            <div><div style={{fontSize:15,fontWeight:800}}>Preventivo</div><div style={{fontSize:11,color:"#666"}}>{c.code} — {c.cliente} {c.cognome||""}</div></div>
            <div onClick={()=>setShowPreventivoModal(false)} style={{marginLeft:"auto",width:28,height:28,borderRadius:"50%",background:"#e5e5ea",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>✕</div>
          </div>
          <div style={{padding:"0 16px"}}>
            <div style={{background:"#fff",borderRadius:12,padding:"14px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",marginBottom:10}}>Parametri</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div><div style={{fontSize:10,fontWeight:700,color:"#999",marginBottom:4}}>SCONTO %</div><input type="number" value={c.sconto||0} onChange={e=>updateCMp("sconto",e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e5e5ea",fontSize:15,fontWeight:700,textAlign:"right",boxSizing:"border-box"}}/></div>
                <div><div style={{fontSize:10,fontWeight:700,color:"#999",marginBottom:4}}>ACCONTO €</div><input type="number" value={c.accontoRicevuto||0} onChange={e=>updateCMp("accontoRicevuto",e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e5e5ea",fontSize:15,fontWeight:700,textAlign:"right",boxSizing:"border-box"}}/></div>
              </div>
              <div><div style={{fontSize:10,fontWeight:700,color:"#999",marginBottom:4}}>NOTE</div><textarea value={c.notePreventivo||""} onChange={e=>updateCMp("notePreventivo",e.target.value)} placeholder="Condizioni, garanzie..." style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e5e5ea",fontSize:12,minHeight:50,resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div>
            </div>
            {hasWarnings && (
              <div style={{background:"#fff8ec",borderRadius:12,padding:"12px 14px",marginBottom:10,border:"1.5px solid #ff9500"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:16}}>⚠️</span>
                  <span style={{fontSize:12,fontWeight:800,color:"#7a4500"}}>Preventivo incompleto</span>
                </div>
                {vaniSenzaSistema.length>0 && (
                  <div style={{fontSize:11,color:"#7a4500",marginBottom:4}}>
                    • {vaniSenzaSistema.length} vano/i senza sistema assegnato → prezzo €0
                    <div onClick={()=>{setShowPreventivoModal(false);setSelectedVano(vaniSenzaSistema[0]);setVanoStep(2);}} style={{display:"inline",marginLeft:8,color:"#007aff",fontWeight:700,cursor:"pointer"}}>Vai →</div>
                  </div>
                )}
                {vaniSenzaMisure.length>0 && (
                  <div style={{fontSize:11,color:"#7a4500"}}>
                    • {vaniSenzaMisure.length} vano/i senza misure → calcolo non accurato
                    <div onClick={()=>{setShowPreventivoModal(false);setSelectedVano(vaniSenzaMisure[0]);setVanoStep(1);}} style={{display:"inline",marginLeft:8,color:"#007aff",fontWeight:700,cursor:"pointer"}}>Vai →</div>
                  </div>
                )}
              </div>
            )}
            <div style={{background:"#fff",borderRadius:12,padding:"14px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#999",textTransform:"uppercase",marginBottom:8}}>Voci</div>
              {vaniCalc.length===0?<div style={{fontSize:12,color:"#999",textAlign:"center",padding:12}}>Nessun vano</div>:vaniCalc.map((v,i)=>(
                <div key={v.id} style={{padding:"8px 0",borderBottom:"1px solid #f5f5f7",background:v.calc.tot===0?"#fff5f5":"transparent",borderRadius:v.calc.tot===0?8:0}}>
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>{v.nome||"Vano "+(i+1)}{v.calc.tot===0&&<span style={{fontSize:9,background:"#ff3b30",color:"#fff",padding:"1px 5px",borderRadius:3,fontWeight:800}}>MANCA SISTEMA</span>}</div><div style={{fontSize:10,color:"#666"}}>{v.tipo} · {(v.misure?.lCentro||0)}×{(v.misure?.hCentro||0)}mm · {v.calc.mq.toFixed(2)} mq</div></div><div style={{fontSize:13,fontWeight:800,color:v.calc.tot===0?"#ff3b30":"#1a1a1c"}}>€ {v.calc.tot.toFixed(2)}</div></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:3}}>
                    {v.calc.sysRec&&<span style={{fontSize:9,background:"#007aff15",color:"#007aff",padding:"1px 5px",borderRadius:4}}>{v.calc.sysRec.sistema}</span>}
                    {v.calc.vetroRec&&<span style={{fontSize:9,background:"#34c75915",color:"#1a9e40",padding:"1px 5px",borderRadius:4}}>{v.calc.vetroRec.code}</span>}
                    {v.calc.copRec&&<span style={{fontSize:9,background:"#ff950015",color:"#7a4500",padding:"1px 5px",borderRadius:4}}>{v.calc.copRec.cod}</span>}
                    {v.calc.lamRec&&<span style={{fontSize:9,background:"#af52de15",color:"#7c2d9e",padding:"1px 5px",borderRadius:4}}>{v.calc.lamRec.cod}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:"14px",marginBottom:10}}>
              {parseFloat(c.sconto||0)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#ff9500",marginBottom:6}}><span>Sconto {c.sconto}%</span><span>− € {scontoVal.toFixed(2)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#666",marginBottom:6}}><span>Imponibile</span><span>€ {imponibile.toFixed(2)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#666",marginBottom:10}}><span>IVA 10%</span><span>€ {iva.toFixed(2)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900,paddingTop:10,borderTop:"2px solid #1a1a1c"}}><span>TOTALE</span><span style={{color:"#007aff"}}>€ {totIva.toFixed(2)}</span></div>
              {parseFloat(c.accontoRicevuto||0)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#34c759",marginTop:8,fontWeight:700}}><span>Saldo da incassare</span><span>€ {(totIva-parseFloat(c.accontoRicevuto)).toFixed(2)}</span></div>}
            </div>
            {c.firmaCliente?(<div style={{background:"#f0fdf4",borderRadius:12,padding:14,border:"1.5px solid #34c759",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span>✅</span><span style={{fontSize:12,fontWeight:700,color:"#1a9e40"}}>Firmato {c.dataFirma}</span><div onClick={()=>{setCantieri(cs=>cs.map(x=>x.id===c.id?{...x,firmaCliente:null,dataFirma:null}:x));setSelectedCM(p=>({...p,firmaCliente:null,dataFirma:null}));}} style={{marginLeft:"auto",fontSize:11,color:"#ff3b30",cursor:"pointer"}}>✕ Rimuovi</div></div><img src={c.firmaCliente} style={{width:"100%",maxHeight:70,objectFit:"contain",background:"#fff",borderRadius:8}} alt=""/></div>):(<button onClick={()=>{setShowPreventivoModal(false);setShowFirmaModal(true);}} style={{width:"100%",padding:13,borderRadius:12,border:"1.5px solid #34c759",background:"#f0fdf4",color:"#1a9e40",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>✍️ Firma cliente sul telefono</button>)}
            {hasWarnings && (
              <div style={{fontSize:11,color:"#999",textAlign:"center",marginBottom:6}}>⚠️ Correggi i problemi per un preventivo accurato</div>
            )}
            <button onClick={()=>generaPreventivoPDF(c)} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:hasWarnings?"linear-gradient(135deg,#8e8e93,#636366)":"linear-gradient(135deg,#007aff,#0055cc)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:hasWarnings?"none":"0 4px 12px rgba(0,122,255,0.3)"}}>
              {hasWarnings?"⚠️ Genera PDF (incompleto)":"📄 Genera & Scarica PDF"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════ MAIN RENDER ═══════ */
  return (
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
        {tab === "messaggi" && !selectedMsg && renderMessaggi()}
        {tab === "agenda" && renderAgenda()}
        {tab === "settings" && renderSettings()}

        {/* MESSAGE DETAIL OVERLAY */}
        {selectedMsg && (() => {
          const chIco = { email: "📧", whatsapp: "💬", sms: "📱", telegram: "✈️" };
          const chCol = { email: T.blue, whatsapp: "#25d366", sms: T.orange, telegram: "#0088cc" };
          const [replyChannel, setReplyChannelX] = [selectedMsg._replyChannel || selectedMsg.canale, (ch) => setSelectedMsg(p => ({...p, _replyChannel: ch}))];
          return (
          <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 100, display: "flex", flexDirection: "column" }}>
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
              <div style={{ padding: "8px 16px 10px", display: "flex", gap: 8, alignItems: "center" }}>
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
                  <div style={{ flex: 1 }}><label style={S.fieldLabel}>€/mq</label><input style={S.input} type="number" placeholder="180" value={settingsForm.euroMq || ""} onChange={e => setSettingsForm(f => ({ ...f, euroMq: e.target.value }))} /></div>
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
              </>)}

              <button style={S.btn} onClick={addSettingsItem}>Salva</button>
              <button style={S.btnCancel} onClick={() => setSettingsModal(null)}>Annulla</button>
            </div>
          </div>
        )}

        {/* Tab Bar */}
        {!selectedVano && (
          <div style={S.tabBar}>
            {[
              { id: "home", ico: ICO.home, label: "Home" },
              { id: "commesse", ico: ICO.filter, label: "Commesse" },
              { id: "messaggi", ico: ICO.chat, label: "Email" },
              { id: "agenda", ico: ICO.calendar, label: "Agenda" },
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
              <div style={S.modalTitle}>Nuovo evento</div>
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
                <div style={{ display: "flex", gap: 6 }}>
                  {[{ id: "appuntamento", l: "📅 Appuntamento", c: T.blue }, { id: "task", l: "✅ Task", c: T.orange }].map(t => (
                    <div key={t.id} onClick={() => setNewEvent(ev => ({ ...ev, tipo: t.id }))} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${newEvent.tipo === t.id ? t.c : T.bdr}`, background: newEvent.tipo === t.id ? t.c + "18" : "transparent", textAlign: "center", fontSize: 12, fontWeight: 600, color: newEvent.tipo === t.id ? t.c : T.sub, cursor: "pointer" }}>
                      {t.l}
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
                  {team.map(m => <option key={m.id} value={m.nome}>{m.nome} — {m.ruolo}</option>)}
                </select>
              </div>
              <button style={S.btn} onClick={addEvent}>Crea evento</button>
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
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>🎤 Nota vocale</div>
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    {isRecording && (
                      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: FM, color: T.red, marginBottom: 12 }}>
                        {Math.floor(recSeconds / 60)}:{String(recSeconds % 60).padStart(2, "0")}
                      </div>
                    )}
                    <div onClick={() => {
                      if (!isRecording) {
                        setIsRecording(true); setRecSeconds(0);
                        recInterval.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
                      } else {
                        clearInterval(recInterval.current);
                        setIsRecording(false);
                        addAllegato("vocale", "Nota vocale " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
                        setShowAllegatiModal(null); setRecSeconds(0);
                      }
                    }} style={{ width: 70, height: 70, borderRadius: "50%", background: isRecording ? "linear-gradient(135deg, #ff3b30, #cc0000)" : "linear-gradient(135deg, #ff3b30, #ff6b6b)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: "pointer", boxShadow: isRecording ? "0 0 24px rgba(255,59,48,0.5)" : "0 4px 16px rgba(255,59,48,0.3)", animation: isRecording ? "pulse 1.5s infinite" : "none" }}>
                      <span style={{ fontSize: 28, color: "#fff" }}>{isRecording ? "⏹" : "🎤"}</span>
                    </div>
                    <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }`}</style>
                    <div style={{ fontSize: 12, color: isRecording ? T.red : T.sub, marginTop: 10, fontWeight: isRecording ? 700 : 400 }}>
                      {isRecording ? "Registrazione... tocca per fermare" : "Tocca per registrare"}
                    </div>
                  </div>
                </>
              )}
              {showAllegatiModal === "video" && (
                <>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>🎬 Video</div>
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    {isRecording && (
                      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: FM, color: T.red, marginBottom: 12 }}>
                        {Math.floor(recSeconds / 60)}:{String(recSeconds % 60).padStart(2, "0")}
                      </div>
                    )}
                    <div onClick={() => {
                      if (!isRecording) {
                        setIsRecording(true); setRecSeconds(0);
                        recInterval.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
                      } else {
                        clearInterval(recInterval.current);
                        setIsRecording(false);
                        addAllegato("video", "Video " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
                        setShowAllegatiModal(null); setRecSeconds(0);
                      }
                    }} style={{ width: 70, height: 70, borderRadius: "50%", background: isRecording ? "linear-gradient(135deg, #ff3b30, #cc0000)" : "linear-gradient(135deg, #007aff, #5856d6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", cursor: "pointer", boxShadow: isRecording ? "0 0 24px rgba(255,59,48,0.5)" : "0 4px 16px rgba(0,122,255,0.3)", animation: isRecording ? "pulse 1.5s infinite" : "none" }}>
                      <span style={{ fontSize: 28, color: "#fff" }}>{isRecording ? "⏹" : "🎬"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: isRecording ? T.red : T.sub, marginTop: 10, fontWeight: isRecording ? 700 : 400 }}>
                      {isRecording ? "Registrazione... tocca per fermare" : "Tocca per registrare"}
                    </div>
                  </div>
                </>
              )}
              <button onClick={() => { clearInterval(recInterval.current); setIsRecording(false); setRecSeconds(0); setShowAllegatiModal(null); }} style={S.btnCancel}>Annulla</button>
            </div>
          </div>
        )}

        {/* AI PHOTO MODAL */}
        {showAIPhoto && (() => {
          const vt = selectedVano?.tipo || "F1A";
          const sizes = {
            "F1A": [700, 1200], "F2A": [1200, 1400], "F3A": [1800, 1400],
            "PF1A": [800, 2200], "PF2A": [1400, 2200], "PF3A": [2100, 2200],
            "VAS": [700, 500], "SOPR": [800, 400], "FIS": [600, 1000], "FISTONDO": [600, 600],
            "SC2A": [1600, 2200], "SC4A": [2800, 2200], "ALZSC": [3000, 2200],
            "BLI": [900, 2100], "TRIANG": [800, 800], "OBLICA": [700, 1200]
          };
          const [stdW, stdH] = sizes[vt] || [1100, 1300];
          const existing = selectedVano?.misure || {};
          const hasExisting = existing.lCentro > 0 || existing.hCentro > 0;
          const baseW = hasExisting && existing.lCentro > 0 ? existing.lCentro + Math.floor(Math.random() * 7 - 3) : stdW + Math.floor(Math.random() * 11 - 5);
          const baseH = hasExisting && existing.hCentro > 0 ? existing.hCentro + Math.floor(Math.random() * 7 - 3) : stdH + Math.floor(Math.random() * 11 - 5);
          const tipLabel = TIPOLOGIE_RAPIDE.find(t => t.code === vt)?.label || vt;
          return (
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
                    {[["Larghezza stimata", `~${baseW} mm`, T.acc], ["Altezza stimata", `~${baseH} mm`, T.blue], ["Tipo rilevato", tipLabel, T.purple]].map(([l, val, col]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${T.bdr}`, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: T.sub }}>{l}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FM, color: col }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "#fff3e0", border: "1px solid #ffe0b2", marginBottom: 12, fontSize: 10, color: "#e65100" }}>
                    ⚠️ Le misure AI sono approssimative. Usa sempre il metro laser per le misure definitive.
                  </div>
                  <button onClick={() => {
                    if (selectedVano) {
                      updateMisura(selectedVano.id, "lAlto", baseW + Math.floor(Math.random() * 5 - 2));
                      updateMisura(selectedVano.id, "lCentro", baseW);
                      updateMisura(selectedVano.id, "lBasso", baseW - Math.floor(Math.random() * 4));
                      updateMisura(selectedVano.id, "hSx", baseH);
                      updateMisura(selectedVano.id, "hCentro", baseH + Math.floor(Math.random() * 3 - 1));
                      updateMisura(selectedVano.id, "hDx", baseH - Math.floor(Math.random() * 4));
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
          );
        })()}
      </div>
    </>
  );
}
