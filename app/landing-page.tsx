"use client";
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — Landing Page
// File: app/page.tsx (sostituisce la root page)
// Reindirizza a /dashboard se già loggato
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from "react";

// ═══ COLORS (MASTRO DS) ═══
const C = {
  bg: "#F2F1EC", card: "#FFFFFF", dark: "#1A1A1C", text: "#1A1A1C", sub: "#86868b",
  acc: "#D08008", accLt: "#D0800815", grn: "#1A9E73", red: "#DC4444",
  blue: "#3B7FE0", purple: "#7c3aed", orange: "#E8890C", brown: "#8B5E34",
};

// ═══ SETTORI ═══
const SETTORI = [
  { id: "serramenti", icon: "🪟", name: "Serramenti", color: "#507aff", desc: "Finestre, portefinestre, scorrevoli. 8 punti misura, disegno tecnico, sistema/vetro/controtelaio.", features: ["Voice AI in cantiere", "Disegno tecnico integrato", "8 punti misura + diagonali", "Controtelaio automatico"] },
  { id: "porte", icon: "🚪", name: "Porte Interne", color: C.acc, desc: "Battente, scorrevole, scomparsa, filomuro. Ferramenta HOPPE/CISA, cerniere, soglie.", features: ["Misure rapide (60-100×210/240)", "Catalogo maniglie HOPPE", "Serrature CISA integrate", "Controtelaio dedicato"] },
  { id: "boxdoccia", icon: "🚿", name: "Box Doccia", color: C.blue, desc: "Nicchia, angolo, walk-in, vasca. Vetri, profili, trattamento anti-calcare.", features: ["Tipi: nicchia, angolo, walk-in", "Vetri e profili configurabili", "Trattamento anti-calcare", "Guarnizioni e accessori"] },
  { id: "cancelli", icon: "🏗️", name: "Cancelli", color: C.brown, desc: "Battente, scorrevole, sezionale. Automazione FAAC/CAME/BFT, fotocellule.", features: ["Automazione FAAC/CAME/BFT/Nice", "Tamponamento e finiture", "Accessori: fotocellule, antenna", "Serratura ed elettroblocco"] },
  { id: "tendesole", icon: "☀️", name: "Tende da Sole", color: C.orange, desc: "Bracci, cassonetto, pergole bioclimatiche. Motorizzazione, sensori.", features: ["Bracci, cassonetto, cappottina", "Pergole bioclimatiche", "Motorizzazione Somfy", "Sensori vento/sole"] },
  { id: "persiane", icon: "🏠", name: "Persiane", color: C.grn, desc: "Alluminio, PVC, legno. Ante, stecche, motorizzazione.", features: ["Alluminio, PVC, legno, blindata", "Configurazione ante", "Colori RAL completi", "Motorizzazione integrata"] },
];

const FEATURES = [
  { icon: "📱", title: "Mobile-first", desc: "Progettato per il cantiere. Funziona su tablet e telefono, anche offline." },
  { icon: "🎙️", title: "Voice AI", desc: "Ditta le misure a voce. L'AI compila i campi automaticamente." },
  { icon: "📄", title: "PDF automatici", desc: "Preventivo, misure produzione, conferma d'ordine. Un click." },
  { icon: "✍️", title: "Firma digitale", desc: "Il cliente firma sul tuo telefono. Invia via WhatsApp." },
  { icon: "📊", title: "Pipeline visiva", desc: "Sopralluogo → Preventivo → Conferma → Produzione → Posa → Collaudo." },
  { icon: "👥", title: "Squadre e montaggi", desc: "Assegna installazioni, traccia avanzamento, gestisci calendari." },
  { icon: "💰", title: "Contabilità", desc: "Fatture, acconti, saldi, scadenze. Tutto in un posto." },
  { icon: "📧", title: "Email e messaggi", desc: "Gmail integrata. Inbox per commessa, comunicazioni tracciabili." },
];

const PIPELINE_STEPS = [
  { icon: "📐", label: "Sopralluogo", desc: "Rilievo misure in cantiere" },
  { icon: "📋", label: "Preventivo", desc: "Calcolo automatico + PDF" },
  { icon: "✍️", label: "Firma", desc: "Firma digitale del cliente" },
  { icon: "📦", label: "Ordine", desc: "Ordini ai fornitori" },
  { icon: "🏭", label: "Produzione", desc: "Tracking stato produzione" },
  { icon: "🚛", label: "Consegna", desc: "Logistica e spedizione" },
  { icon: "🔧", label: "Posa", desc: "Squadre e calendario" },
  { icon: "✅", label: "Collaudo", desc: "Chiusura commessa" },
];

const PREZZI = [
  { name: "Base", price: "49", period: "/mese", desc: "1 utente · 1 settore", features: ["Commesse illimitate", "Rilievo misure + Voice AI", "Preventivi + PDF", "Firma digitale", "Pipeline completa", "App mobile"], cta: "Inizia gratis", accent: false },
  { name: "Pro", price: "79", period: "/mese", desc: "3 utenti · 2 settori", features: ["Tutto Base +", "Multi-utente (3)", "2 settori inclusi", "Montaggi e squadre", "Contabilità", "Email Gmail integrata"], cta: "Prova 14 giorni", accent: true },
  { name: "Team", price: "129", period: "/mese", desc: "Illimitati · 3 settori", features: ["Tutto Pro +", "Utenti illimitati", "3 settori inclusi", "Rete commerciale", "Admin desktop", "Report e statistiche"], cta: "Contattaci", accent: false },
];

const TESTIMONIALS = [
  { name: "Marco R.", role: "Serramentista, Brescia", text: "Facevo tutto con Excel e WhatsApp. Ora faccio il preventivo in cantiere e lo invio firmato in 5 minuti.", stars: 5 },
  { name: "Giuseppe L.", role: "Installatore porte, Napoli", text: "Finalmente un software che capisce il mio mestiere. Non devo più adattarmi a gestionali generici.", stars: 5 },
  { name: "Andrea B.", role: "Tendagista, Verona", text: "La dettatura vocale è una svolta. Misuro, parlo, e il preventivo è già pronto quando torno in ufficio.", stars: 5 },
];

export default function LandingPage() {
  const [activeSector, setActiveSector] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate sectors
  useEffect(() => {
    const timer = setInterval(() => setActiveSector(prev => (prev + 1) % SETTORI.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const goToDashboard = () => window.location.href = "/dashboard";

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: C.text, background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .fadeUp { animation: fadeUp 0.6s ease both; }
        .fadeUp2 { animation: fadeUp 0.6s ease 0.15s both; }
        .fadeUp3 { animation: fadeUp 0.6s ease 0.3s both; }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 50 ? "rgba(242,241,236,0.92)" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? `1px solid ${C.sub}20` : "none",
        transition: "all 0.3s",
        padding: "0 20px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: C.acc }}>M</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px" }}>MASTRO</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: C.acc, background: C.accLt, padding: "2px 8px", borderRadius: 4 }}>ERP</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="#settori" style={{ fontSize: 13, fontWeight: 600, color: C.sub, textDecoration: "none" }}>Settori</a>
            <a href="#funzionalita" style={{ fontSize: 13, fontWeight: 600, color: C.sub, textDecoration: "none" }}>Funzionalità</a>
            <a href="#prezzi" style={{ fontSize: 13, fontWeight: 600, color: C.sub, textDecoration: "none" }}>Prezzi</a>
            <div onClick={goToDashboard} style={{ padding: "8px 20px", borderRadius: 8, background: C.dark, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Accedi →</div>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ padding: "140px 20px 80px", textAlign: "center", position: "relative" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="fadeUp" style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, background: C.accLt, border: `1px solid ${C.acc}30`, marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.acc }}>🚀 L'ERP italiano per chi installa</span>
          </div>
          <h1 className="fadeUp2" style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-2px", marginBottom: 20, color: C.dark }}>
            Dal cantiere al <span style={{ color: C.acc }}>preventivo</span>.<br />In un tocco.
          </h1>
          <p className="fadeUp3" style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: C.sub, lineHeight: 1.6, maxWidth: 580, margin: "0 auto 32px" }}>
            MASTRO è il gestionale che parla la tua lingua. Misuri, preventivi, firmi, installi — tutto dal telefono. Fatto da un serramentista per gli installatori.
          </p>
          <div className="fadeUp3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <div onClick={goToDashboard} style={{ padding: "14px 32px", borderRadius: 12, background: C.acc, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px rgba(208,128,8,0.35)" }}>
              Prova gratis 14 giorni →
            </div>
            <a href="#demo" style={{ padding: "14px 32px", borderRadius: 12, background: C.card, color: C.text, fontSize: 16, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${C.sub}30`, textDecoration: "none" }}>
              ▶ Guarda la demo
            </a>
          </div>
          <p style={{ fontSize: 12, color: C.sub, marginTop: 12 }}>Nessuna carta di credito · Setup in 2 minuti · Cancella quando vuoi</p>
        </div>

        {/* Mock phone */}
        <div style={{ maxWidth: 340, margin: "50px auto 0", background: C.dark, borderRadius: 28, padding: "8px", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", animation: "float 4s ease-in-out infinite" }}>
          <div style={{ background: C.bg, borderRadius: 22, overflow: "hidden", padding: "12px" }}>
            <div style={{ background: C.dark, borderRadius: 12, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.acc, fontWeight: 900, fontSize: 14 }}>M</span>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, flex: 1 }}>S-0042 · Rossi Mario</span>
              <span style={{ color: C.acc, fontSize: 14, fontWeight: 900 }}>€2.450</span>
            </div>
            {PIPELINE_STEPS.slice(0, 5).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: i < 3 ? `${C.grn}10` : C.card, marginBottom: 3 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, flex: 1 }}>{s.label}</span>
                {i < 3 && <span style={{ fontSize: 10, color: C.grn, fontWeight: 700 }}>✓</span>}
                {i === 3 && <span style={{ fontSize: 8, background: C.orange + "20", color: C.orange, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>IN CORSO</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SETTORI ═══ */}
      <section id="settori" style={{ padding: "80px 20px", background: C.card }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 12 }}>Un ERP. <span style={{ color: C.acc }}>Ogni settore.</span></h2>
            <p style={{ fontSize: 16, color: C.sub, maxWidth: 500, margin: "0 auto" }}>Attiva solo i settori che ti servono. Paga solo quello che usi.</p>
          </div>

          {/* Sector tabs */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {SETTORI.map((s, i) => (
              <div key={s.id} onClick={() => setActiveSector(i)}
                style={{ padding: "10px 18px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                  background: activeSector === i ? s.color + "15" : C.bg,
                  border: `2px solid ${activeSector === i ? s.color : "transparent"}`,
                  color: activeSector === i ? s.color : C.sub,
                  fontWeight: 700, fontSize: 13,
                }}>
                {s.icon} {s.name}
              </div>
            ))}
          </div>

          {/* Active sector detail */}
          {(() => {
            const s = SETTORI[activeSector];
            return (
              <div key={s.id} style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ flex: "1 1 400px", maxWidth: 500 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{s.icon}</div>
                    <div>
                      <h3 style={{ fontSize: 24, fontWeight: 800 }}>{s.name}</h3>
                      <p style={{ fontSize: 13, color: C.sub }}>{s.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {s.features.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: C.bg }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: s.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 12, color: s.color, fontWeight: 800 }}>✓</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: "1 1 300px", maxWidth: 360 }}>
                  {/* Mock form preview */}
                  <div style={{ background: C.bg, borderRadius: 20, padding: 16, border: `1px solid ${C.sub}15`, boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 12px", background: C.dark, borderRadius: 10 }}>
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Rilievo {s.name}</span>
                    </div>
                    {/* Step dots */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 10 }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: i === 0 ? 16 : 8, height: 6, borderRadius: 3, background: i === 0 ? s.color : C.sub + "30" }} />)}
                    </div>
                    {/* Accordion sections preview */}
                    {["📏 Misure", "🪵 Materiale", "🔑 Ferramenta", "📋 Riepilogo"].map((lab, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: C.card, marginBottom: 4, border: `1px solid ${i === 0 ? s.color + "40" : C.sub + "15"}` }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: i === 0 ? s.color : C.text }}>{lab}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {i < 2 && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.grn }} />}
                          <span style={{ fontSize: 8, color: C.sub }}>▼</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ═══ FUNZIONALITÀ ═══ */}
      <section id="funzionalita" style={{ padding: "80px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 12 }}>Tutto quello che serve. <span style={{ color: C.acc }}>Niente di più.</span></h2>
            <p style={{ fontSize: 16, color: C.sub }}>Costruito da chi va in cantiere ogni giorno.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="hover-lift" style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.sub}12` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PIPELINE ═══ */}
      <section style={{ padding: "80px 20px", background: C.dark }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 12, color: "#fff" }}>Dal primo contatto al <span style={{ color: C.acc }}>collaudo</span>.</h2>
          <p style={{ fontSize: 16, color: "#ffffff60", marginBottom: 48 }}>8 fasi. Un flusso. Zero carta.</p>
          <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
            {PIPELINE_STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div style={{ width: 100, textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${C.acc}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 6px" }}>{s.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: "#ffffff50" }}>{s.desc}</div>
                </div>
                {i < PIPELINE_STEPS.length - 1 && <div style={{ width: 20, height: 2, background: `${C.acc}40`, margin: "0 -4px", marginBottom: 20 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "80px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 40, textAlign: "center" }}>Chi lo usa, <span style={{ color: C.acc }}>non torna indietro</span>.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="hover-lift" style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.sub}12` }}>
                <div style={{ fontSize: 14, color: C.acc, marginBottom: 8 }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontStyle: "italic", color: C.text }}>&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.sub }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PREZZI ═══ */}
      <section id="prezzi" style={{ padding: "80px 20px", background: C.card }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 12 }}>Prezzi <span style={{ color: C.acc }}>chiari</span>.</h2>
            <p style={{ fontSize: 16, color: C.sub }}>Paga solo i settori che attivi. Ogni settore aggiuntivo: +€19/mese.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {PREZZI.map((p, i) => (
              <div key={i} className="hover-lift" style={{
                background: p.accent ? C.dark : "#fff", borderRadius: 20, padding: 28,
                border: p.accent ? `2px solid ${C.acc}` : `1px solid ${C.sub}15`,
                color: p.accent ? "#fff" : C.text,
                position: "relative", overflow: "hidden",
              }}>
                {p.accent && <div style={{ position: "absolute", top: 12, right: -28, background: C.acc, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 32px", transform: "rotate(35deg)" }}>POPOLARE</div>}
                <div style={{ fontSize: 14, fontWeight: 700, color: p.accent ? C.acc : C.sub, marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: p.accent ? "#fff" : C.sub }}>€</span>
                  <span style={{ fontSize: 48, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: p.accent ? "#ffffff80" : C.sub }}>{p.period}</span>
                </div>
                <div style={{ fontSize: 12, color: p.accent ? "#ffffff80" : C.sub, marginBottom: 20 }}>{p.desc}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {p.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
                      <span style={{ color: C.grn, fontSize: 12 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div onClick={goToDashboard} style={{
                  padding: "12px", borderRadius: 10, textAlign: "center", fontSize: 14, fontWeight: 800, cursor: "pointer",
                  background: p.accent ? C.acc : C.bg,
                  color: p.accent ? "#fff" : C.text,
                  border: p.accent ? "none" : `1px solid ${C.sub}20`,
                }}>{p.cta}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.sub }}>
            <strong style={{ color: C.acc }}>+€19/mese</strong> per ogni settore aggiuntivo · IVA esclusa · Disdici quando vuoi
          </div>
        </div>
      </section>

      {/* ═══ CTA FINALE ═══ */}
      <section style={{ padding: "80px 20px", background: `linear-gradient(135deg, ${C.dark} 0%, #2a2a2e 100%)`, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>Basta Excel e WhatsApp.</h2>
          <p style={{ fontSize: 18, color: "#ffffff80", marginBottom: 32, lineHeight: 1.5 }}>Prova MASTRO gratis per 14 giorni. Se non ti convince, non paghi nulla.</p>
          <div onClick={goToDashboard} style={{ display: "inline-block", padding: "16px 40px", borderRadius: 14, background: C.acc, color: "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(208,128,8,0.4)" }}>
            Inizia gratis →
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 24, fontSize: 12, color: "#ffffff60" }}>
            <span>✓ Nessuna carta</span>
            <span>✓ Setup 2 min</span>
            <span>✓ Supporto italiano</span>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "40px 20px", background: C.dark, borderTop: `1px solid #ffffff10` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.acc}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: C.acc }}>M</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>MASTRO</span>
            <span style={{ fontSize: 10, color: "#ffffff50" }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#ffffff60" }}>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Termini</a>
            <a href="mailto:info@mastro.app" style={{ color: "inherit", textDecoration: "none" }}>info@mastro.app</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
