"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — HomePanel v3 — Linear/Notion minimal
// Principle: Guide the user. Less noise, clear hierarchy.
// 3 sections: Da fare → Programma → Situazione
// ═══════════════════════════════════════════════════════════
import React from "react";
import { useMastro } from "./MastroContext";
import { FF, FM, ICO, Ico } from "./mastro-constants";

export default function HomePanel() {
  const {
    T, S, isDesktop, fs, PIPELINE,
    cantieri, events, tasks, problemi,
    fattureDB, ordiniFornDB, montaggiDB, squadreDB,
    sogliaDays, collapsed, globalSearch, setGlobalSearch,
    homeEditMode, setHomeEditMode, homeView, setHomeView,
    ioChecked, setIoChecked, dayOffset, setDayOffset,
    cmFaseIdx, setCmFaseIdx,
    montView, setMontView, montExpandId, setMontExpandId, montCalDate, setMontCalDate,
    setTab, setFilterFase, setSelectedCM, setSelectedEvent, setSelectedVano,
    setSettingsTab, setShowContabilita, setShowProblemiView,
    getVaniAttivi, giorniFermaCM, toggleCollapse, SectionHead,
    filtered, calDays, today, ORDINE_STATI, activePlan, trialDaysLeft, drag,
    apriInboxDocumento,
  } = useMastro();

  // ─── Computed ───
  const todayISO = today.toISOString().split("T")[0];
  const h = today.getHours();
  const saluto = h < 12 ? "Buongiorno" : h < 18 ? "Buon pomeriggio" : "Buonasera";
  const SOGLIA = sogliaDays;
  const ferme = cantieri.filter(c => c.fase !== "chiusura" && giorniFermaCM(c) >= SOGLIA);
  const preventiviDaFare = cantieri.filter(c => c.fase === "preventivo");
  const misureInAttesa = cantieri.filter(c => c.fase === "misure" && getVaniAttivi(c).some(v => Object.keys(v.misure || {}).length < 4));
  const todayEvents = events.filter(e => e.date === todayISO).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  const taskUrgenti = tasks.filter(t => !t.done && t.priority === "alta");
  const problemiAperti = problemi.filter(p => p.stato !== "risolto");
  const attenzioneCount = ferme.length + problemiAperti.length;

  // ─── IO actions ───
  const ioActions: Array<{ id: string; titolo: string; sotto: string; urgenza: string; color: string; icon: string }> = [];
  ferme.slice(0, 3).forEach(c => ioActions.push({ id: "f-" + c.id, titolo: `Sbloccare ${c.cliente}`, sotto: `${c.code} · ferma ${giorniFermaCM(c)}gg`, urgenza: "alta", color: T.red, icon: "⚠️" }));
  preventiviDaFare.slice(0, 2).forEach(c => ioActions.push({ id: "p-" + c.id, titolo: `Inviare preventivo ${c.cliente}`, sotto: c.code, urgenza: "alta", color: "#af52de", icon: "📋" }));
  misureInAttesa.slice(0, 2).forEach(c => { const tot = getVaniAttivi(c).length; const ok = getVaniAttivi(c).filter(v => Object.keys(v.misure || {}).length >= 4).length; ioActions.push({ id: "m-" + c.id, titolo: `Completare misure ${c.cliente}`, sotto: `${ok}/${tot} vani`, urgenza: "media", color: "#ff9500", icon: "📐" }); });
  todayEvents.slice(0, 1).forEach(e => ioActions.push({ id: "e-" + e.id, titolo: e.text, sotto: `${e.time || "—"} · ${e.persona || ""}`, urgenza: "media", color: e.color || "#007aff", icon: "📍" }));
  taskUrgenti.slice(0, 2).forEach(t => ioActions.push({ id: "t-" + t.id, titolo: t.text, sotto: t.meta || "Urgente", urgenza: "alta", color: T.red, icon: "☑️" }));
  const ioRemaining = ioActions.filter(a => !ioChecked[a.id]);
  const ioDone = ioActions.filter(a => ioChecked[a.id]);

  // ─── Day navigation ───
  const getDateForOffset = (off: number) => { const d = new Date(today); d.setDate(d.getDate() + off); return d; };
  const dayDate = getDateForOffset(dayOffset);
  const dayISO = dayDate.toISOString().split("T")[0];
  const dayEvents = events.filter(e => e.date === dayISO).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  const dayLabel = dayOffset === 0 ? "Oggi" : dayOffset === -1 ? "Ieri" : dayOffset === 1 ? "Domani" : dayDate.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
  const isPast = dayOffset < 0;

  // ─── Week strip ───
  const weekDays: Date[] = [];
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  for (let i = 0; i < 7; i++) { const d = new Date(monday); d.setDate(monday.getDate() + i); weekDays.push(d); }
  const dayNames = ["L", "M", "M", "G", "V", "S", "D"];

  // ─── Collapsible Section header ───
  const Section = ({ id, text, count, right, onRight, children }: { id: string; text: string; count?: number; right?: string; onRight?: () => void; children: React.ReactNode }) => {
    const isOpen = !collapsed[`home_${id}`];
    return (
      <div style={{ marginTop: 4 }}>
        <div onClick={() => toggleCollapse(`home_${id}`)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: T.sub, transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s", display: "inline-block" }}>▼</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>{text}</span>
            {count !== undefined && count > 0 && <span style={{ fontSize: 9, fontWeight: 800, color: T.acc, background: T.acc + "12", padding: "1px 6px", borderRadius: 10, fontFamily: FM }}>{count}</span>}
          </div>
          {right && <span onClick={e => { e.stopPropagation(); onRight?.(); }} style={{ fontSize: 11, fontWeight: 600, color: T.acc, cursor: "pointer" }}>{right}</span>}
        </div>
        {isOpen && children}
      </div>
    );
  };

  // ═══ SUBPAGE: Ordini ═══
  if (homeView === "ordini") {
    const allOrd = ordiniFornDB.sort((a, b) => (a.consegna?.prevista || "z").localeCompare(b.consegna?.prevista || "z"));
    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div onClick={() => setHomeView(null)} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={18} c={T.sub} /></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>Ordini Fornitore</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{allOrd.length} totali · {allOrd.filter(o => o.stato !== "consegnato").length} attivi</div>
          </div>
        </div>
        <div style={{ padding: "0 20px" }}>
          {allOrd.map(o => {
            const st = ORDINE_STATI.find(s => s.id === o.stato) || ORDINE_STATI[0];
            const isLate = o.consegna?.prevista && new Date(o.consegna.prevista) < new Date();
            const cm = cantieri.find(cc => cc.id === o.cmId);
            return (
              <div key={o.id} onClick={() => { if (cm) { setSelectedCM(cm); setHomeView(null); setTab("commesse"); } }}
                style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "14px 16px", marginBottom: 8, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{o.fornitore?.nome || "—"}</div>
                    <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{o.cmCode} · {cm?.cliente || ""}</div>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: st.color + "10", color: st.color }}>{st.label}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: T.sub }}>
                  <span>€{(o.totaleIva || o.totale || 0).toLocaleString("it-IT")}</span>
                  {o.consegna?.prevista && <span style={{ color: isLate ? T.red : T.sub, fontWeight: isLate ? 700 : 400 }}>{isLate ? "⚠ " : ""}Consegna {new Date(o.consegna.prevista).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</span>}
                </div>
              </div>
            );
          })}
          {allOrd.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.sub, fontSize: 13 }}>Nessun ordine</div>}
        </div>
      </div>
    );
  }

  // ═══ SUBPAGE: Montaggi ═══
  if (homeView === "montaggi") {
    const allMont = montaggiDB.sort((a, b) => { if (a.stato === "completato" && b.stato !== "completato") return 1; if (a.stato !== "completato" && b.stato === "completato") return -1; return (a.data || "z").localeCompare(b.data || "z"); });
    const daFare = allMont.filter(m => m.stato !== "completato").length;
    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div onClick={() => setHomeView(null)} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={18} c={T.sub} /></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>Montaggi</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{allMont.length} totali · {daFare} da completare</div>
          </div>
        </div>
        <div style={{ padding: "0 20px" }}>
          {allMont.map(m => {
            const sq = squadreDB.find(s => s.id === m.squadraId);
            const cm = cantieri.find(cc => cc.id === m.cmId);
            const done = m.stato === "completato";
            return (
              <div key={m.id} onClick={() => { if (cm) { setSelectedCM(cm); setHomeView(null); setTab("commesse"); } }}
                style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "14px 16px", marginBottom: 8, cursor: "pointer", opacity: done ? 0.6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{done ? "✓ " : ""}{m.cliente}</div>
                    <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{m.cmCode} · {m.vani || "?"} vani{sq ? ` · ${sq.nome}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: done ? T.grn : T.acc }}>{m.data ? new Date(m.data).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : "—"}</div>
                </div>
              </div>
            );
          })}
          {allMont.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.sub, fontSize: 13 }}>Nessun montaggio</div>}
        </div>
      </div>
    );
  }

  // ═══ SUBPAGE: Fatture ═══
  if (homeView === "fatture") {
    const fatAtt = fattureDB.filter(f => !f.pagata);
    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div onClick={() => setHomeView(null)} style={{ cursor: "pointer", padding: 4 }}><Ico d={ICO.back} s={18} c={T.sub} /></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>Fatture</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{fattureDB.length} totali · {fatAtt.length} da incassare</div>
          </div>
        </div>
        <div style={{ padding: "0 20px" }}>
          {fatAtt.map(f => (
            <div key={f.id} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>N.{f.numero}/{f.anno}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.red, fontFamily: FM }}>€{f.importo?.toLocaleString("it-IT")}</div>
              </div>
              <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>{f.data} · {f.tipo}</div>
            </div>
          ))}
          {fatAtt.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.sub, fontSize: 13 }}>Tutto incassato</div>}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // MAIN HOME — 3 clear sections
  // ═══════════════════════════════════════════

  const cmConf = cantieri.filter(c => c.confermato);
  const totPrev = cantieri.filter(c => c.euro && c.fase !== "chiusura").reduce((s, c) => s + (parseFloat(c.euro) || 0), 0);
  const totConf = cmConf.reduce((s, c) => s + (parseFloat(c.euro) || 0), 0);
  const ordAtt = ordiniFornDB.filter(o => o.stato !== "consegnato");
  const montAtt = montaggiDB.filter(m => m.stato !== "completato");
  const fatAtt = fattureDB.filter(f => !f.pagata);
  const totFat = fatAtt.reduce((s, f) => s + f.importo, 0);

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* ─── Header ─── */}
      <div style={{ padding: "20px 20px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div suppressHydrationWarning style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>{saluto}</div>
            <div suppressHydrationWarning style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>
              {today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
          <div onClick={() => setHomeEditMode(e => !e)}
            style={{ padding: "5px 10px", borderRadius: 6, background: homeEditMode ? T.acc : T.bg, border: `1px solid ${homeEditMode ? T.acc : T.bdr}`, fontSize: 10, fontWeight: 700, color: homeEditMode ? "#fff" : T.sub, cursor: "pointer" }}>
            {homeEditMode ? "✓ Fine" : "⋮"}
          </div>
        </div>
      </div>

      {/* ─── Trial / Free banner ─── */}
      {activePlan === "trial" && (
        <div onClick={() => { setSettingsTab("piano"); setTab("settings"); }}
          style={{ margin: "12px 20px 0", padding: "10px 14px", borderRadius: 10, background: T.acc + "08", border: `1px solid ${T.acc}15`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.acc }}>Trial · {trialDaysLeft} giorni rimasti</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.acc }}>Piani →</span>
        </div>
      )}
      {activePlan === "free" && (
        <div onClick={() => { setSettingsTab("piano"); setTab("settings"); }}
          style={{ margin: "12px 20px 0", padding: "10px 14px", borderRadius: 10, background: T.red + "06", border: `1px solid ${T.red}15`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.red }}>Trial scaduto</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.acc }}>Attiva →</span>
        </div>
      )}

      {/* ─── Attenzione alert (compact) ─── */}
      {attenzioneCount > 0 && (
        <div onClick={() => setTab("commesse")}
          style={{ margin: "12px 20px 0", padding: "10px 14px", borderRadius: 10, background: T.red + "06", border: `1px solid ${T.red}12`, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1 }}>
            {ferme.length > 0 && `${ferme.length} commesse ferme`}
            {ferme.length > 0 && problemiAperti.length > 0 && " · "}
            {problemiAperti.length > 0 && `${problemiAperti.length} problemi aperti`}
          </span>
          <span style={{ fontSize: 11, color: T.sub }}>→</span>
        </div>
      )}

      {/* ═══ 1. DA FARE ═══ */}
      {ioActions.length > 0 && (
        <Section id="dafare" text="Da fare" count={ioRemaining.length} right={`${ioDone.length}/${ioActions.length}`}>
          <div style={{ padding: "0 20px" }}>
            <div style={{ borderRadius: 12, border: `1px solid ${T.bdr}`, overflow: "hidden", background: T.card }}>
              {ioRemaining.map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < ioRemaining.length - 1 ? `1px solid ${T.bdr}` : "none" }}>
                  <div onClick={() => setIoChecked(prev => ({ ...prev, [a.id]: true }))}
                    style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${T.bdr}`, flexShrink: 0, cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = a.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = T.bdr)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{a.icon} {a.titolo}</div>
                    <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{a.sotto}</div>
                  </div>
                  {a.urgenza === "alta" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, flexShrink: 0 }} />}
                </div>
              ))}
              {ioDone.length > 0 && (
                <div style={{ padding: "8px 16px", background: T.bg }}>
                  {ioDone.map(a => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.grn + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.grn, flexShrink: 0 }}>✓</div>
                      <span style={{ fontSize: 12, color: T.sub, textDecoration: "line-through", flex: 1 }}>{a.titolo}</span>
                      <span onClick={() => setIoChecked(prev => { const n = { ...prev }; delete n[a.id]; return n; })} style={{ fontSize: 10, color: T.sub, cursor: "pointer" }}>↩</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ═══ 2. PROGRAMMA ═══ */}
      <Section id="programma" text="Programma" count={todayEvents.length} right="Agenda →" onRight={() => setTab("agenda")}>
        <div style={{ padding: "0 20px" }}>

        {/* Week strip */}
        <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
          {weekDays.map((d, i) => {
            const dISO = d.toISOString().split("T")[0];
            const isToday = dISO === todayISO;
            const isSel = dISO === dayISO;
            const hasEvt = events.some(e => e.date === dISO);
            return (
              <div key={i} onClick={() => setDayOffset(Math.round((d.getTime() - today.getTime()) / 86400000))}
                style={{ flex: 1, textAlign: "center", cursor: "pointer", padding: "8px 0", borderRadius: 10, background: isSel && !isToday ? T.card : "transparent", border: isSel && !isToday ? `1px solid ${T.bdr}` : "1px solid transparent" }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: i >= 5 ? T.acc : T.sub, letterSpacing: "0.04em" }}>{dayNames[i]}</div>
                <div suppressHydrationWarning style={{
                  width: 28, height: 28, borderRadius: "50%", margin: "4px auto 0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: isToday ? 800 : 500, fontFamily: FM,
                  background: isToday ? T.text : "transparent", color: isToday ? "#fff" : T.text,
                }}>{d.getDate()}</div>
                {hasEvt && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.acc, margin: "4px auto 0" }} />}
              </div>
            );
          })}
        </div>

        {/* Day label if not today */}
        {dayOffset !== 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{dayLabel}</span>
            <span onClick={() => setDayOffset(0)} style={{ fontSize: 11, color: T.acc, fontWeight: 600, cursor: "pointer" }}>Oggi</span>
          </div>
        )}

        {/* Events */}
        {dayEvents.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}` }}>
            <div style={{ fontSize: 13, color: T.sub }}>{isPast ? "Nessuna attività" : "Giornata libera"}</div>
          </div>
        ) : (
          <div style={{ borderRadius: 12, border: `1px solid ${T.bdr}`, overflow: "hidden", background: T.card }}>
            {dayEvents.map((ev, i) => (
              <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", borderBottom: i < dayEvents.length - 1 ? `1px solid ${T.bdr}` : "none", opacity: isPast ? 0.5 : 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.sub, fontFamily: FM, width: 40, flexShrink: 0 }}>{ev.time || "—"}</div>
                <div style={{ width: 3, height: 28, borderRadius: 2, background: ev.color || T.acc, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{ev.text}</div>
                  {(ev.persona || ev.addr) && <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{ev.persona}{ev.addr ? ` · ${ev.addr}` : ""}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </Section>

      {/* ═══ 3. SITUAZIONE ═══ */}
      <Section id="situazione" text="Situazione" right="Contabilità →" onRight={() => setShowContabilita(true)}>
        <div style={{ padding: "0 20px" }}>

        {/* Financial summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.sub, letterSpacing: "0.04em", textTransform: "uppercase" }}>Preventivi</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: FM, marginTop: 4 }}>€{totPrev.toLocaleString("it-IT")}</div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{cantieri.filter(c => c.euro && c.fase !== "chiusura").length} attivi</div>
          </div>
          <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.sub, letterSpacing: "0.04em", textTransform: "uppercase" }}>Confermati</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.grn, fontFamily: FM, marginTop: 4 }}>€{totConf.toLocaleString("it-IT")}</div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{cmConf.length} commesse · {cantieri.length > 0 ? Math.round(cmConf.length / cantieri.length * 100) : 0}%</div>
          </div>
        </div>

        {/* Operational cards */}
        {(ordAtt.length > 0 || montAtt.length > 0 || fatAtt.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: ordAtt.length > 0 && montAtt.length > 0 && fatAtt.length > 0 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 }}>
            {ordAtt.length > 0 && (
              <div onClick={() => setHomeView("ordini")} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "14px 12px", cursor: "pointer" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: FM }}>{ordAtt.length}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.sub, marginTop: 2 }}>Ordini attivi</div>
              </div>
            )}
            {montAtt.length > 0 && (
              <div onClick={() => setHomeView("montaggi")} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "14px 12px", cursor: "pointer" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: FM }}>{montAtt.length}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.sub, marginTop: 2 }}>Montaggi</div>
              </div>
            )}
            {fatAtt.length > 0 && (
              <div onClick={() => setHomeView("fatture")} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: "14px 12px", cursor: "pointer" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.red, fontFamily: FM }}>€{totFat.toLocaleString("it-IT")}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.sub, marginTop: 2 }}>Da incassare</div>
              </div>
            )}
          </div>
        )}
        </div>
      </Section>

      {/* Bottom spacer */}
      <div style={{ height: 20 }} />
    </div>
  );
}
