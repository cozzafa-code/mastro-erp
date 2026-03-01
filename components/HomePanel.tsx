"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — HomePanel
// Estratto S5: ~957 righe (Dashboard Home)
// ═══════════════════════════════════════════════════════════
import React from "react";
import { useMastro } from "./MastroContext";
import { FF, FM, ICO, Ico } from "./mastro-constants";

export default function HomePanel() {
  const {
    T, S, isDesktop, fs, PIPELINE,
    // State
    cantieri, events, tasks, problemi,
    fattureDB, ordiniFornDB, montaggiDB, squadreDB,
    sogliaDays, collapsed, globalSearch, setGlobalSearch,
    homeEditMode, setHomeEditMode, homeView, setHomeView,
    ioChecked, setIoChecked, dayOffset, setDayOffset,
    cmFaseIdx, setCmFaseIdx,
    montView, setMontView, montExpandId, setMontExpandId, montCalDate, setMontCalDate,
    // Navigation
    setTab, setFilterFase, setSelectedCM, setSelectedEvent, setSelectedVano,
    setSettingsTab, setShowContabilita, setShowProblemiView,
    // Helpers
    getVaniAttivi, giorniFermaCM, toggleCollapse, SectionHead,
    // Computed
    filtered, calDays, today, ORDINE_STATI, activePlan, trialDaysLeft, drag,
    apriInboxDocumento,
  } = useMastro();

    const todayISO = today.toISOString().split("T")[0];
    const h = today.getHours();
    const saluto = h < 12 ? "Buongiorno" : h < 18 ? "Buon pomeriggio" : "Buonasera";
    const SOGLIA_GIORNI = sogliaDays;
    const ferme = cantieri.filter(c => c.fase !== "chiusura" && giorniFermaCM(c) >= SOGLIA_GIORNI);
    const misureInAttesa = cantieri.filter(c => c.fase === "misure" && getVaniAttivi(c).some(v => Object.keys(v.misure || {}).length < 4));
    const preventiviDaFare = cantieri.filter(c => c.fase === "preventivo");
    const todayEvents = events.filter(e => e.date === todayISO).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
    const taskUrgenti = tasks.filter(t => !t.done && t.priority === "alta");

    // Build IO actions
    const ioActions: Array<{ id: string; titolo: string; sotto: string; urgenza: string; color: string; icon: string }> = [];
    ferme.slice(0, 2).forEach(c => ioActions.push({ id: "f-" + c.id, titolo: `Sbloccare ${c.cliente}`, sotto: `${c.code} · ferma ${giorniFermaCM(c)}gg · fase ${PIPELINE.find(p => p.id === c.fase)?.nome || c.fase}`, urgenza: "alta", color: T.red, icon: "⚠️" }));
    preventiviDaFare.slice(0, 1).forEach(c => ioActions.push({ id: "p-" + c.id, titolo: `Inviare preventivo ${c.cliente}`, sotto: `${c.code} · ${c.indirizzo || "—"}`, urgenza: "alta", color: "#af52de", icon: "📋" }));
    misureInAttesa.slice(0, 1).forEach(c => { const tot = getVaniAttivi(c).length; const ok = getVaniAttivi(c).filter(v => Object.keys(v.misure || {}).length >= 4).length; ioActions.push({ id: "m-" + c.id, titolo: `Completare misure ${c.cliente}`, sotto: `${c.code} · ${ok}/${tot} vani misurati`, urgenza: "media", color: "#ff9500", icon: "📐" }); });
    todayEvents.slice(0, 1).forEach(e => ioActions.push({ id: "e-" + e.id, titolo: e.text, sotto: `${e.time || "—"} · ${e.persona || "—"} · ${e.addr || "—"}`, urgenza: "media", color: e.color || "#007aff", icon: "📍" }));
    taskUrgenti.slice(0, 1).forEach(t => ioActions.push({ id: "t-" + t.id, titolo: t.text, sotto: t.meta || "Task urgente", urgenza: "alta", color: T.red, icon: "☑️" }));
    const ioRemaining = ioActions.filter(a => !ioChecked[a.id]);
    const ioDone = ioActions.filter(a => ioChecked[a.id]);

    // Day navigation for programma
    const getDateForOffset = (off: number) => { const d = new Date(today); d.setDate(d.getDate() + off); return d; };
    const dayDate = getDateForOffset(dayOffset);
    const dayISO = dayDate.toISOString().split("T")[0];
    const dayEvents = events.filter(e => e.date === dayISO).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
    const dayLabel = dayOffset === 0 ? "Oggi" : dayOffset === -1 ? "Ieri" : dayOffset === 1 ? "Domani" : dayDate.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
    const isPast = dayOffset < 0;

    // Week strip
    const weekDays: Date[] = [];
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    for (let i = 0; i < 7; i++) { const d = new Date(monday); d.setDate(monday.getDate() + i); weekDays.push(d); }
    const dayNames = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];

    // Commesse filtered
    const fasi = ["tutte", ...PIPELINE.filter(p => p.attiva).map(p => p.id)];
    const faseSel = fasi[cmFaseIdx];
    const cmFiltrate = faseSel === "tutte" ? cantieri : cantieri.filter(c => c.fase === faseSel);

    const sections: Record<string, any> = {
      // ═══ CONTATORI ═══
      contatori: (
        <div key="contatori">
          <SectionHead id="contatori" icon="" title="Stato lavori" />
          {!collapsed["contatori"] && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 16px", marginBottom: 8 }}>
              {[
                { id: "misure", icon: "📐", label: "In misure", count: cantieri.filter(c => c.fase === "misure").length, color: "#ff9500", sub: `${misureInAttesa.length} da completare` },
                { id: "prev", icon: "📋", label: "Preventivi", count: preventiviDaFare.length, color: "#af52de", sub: preventiviDaFare.length > 0 ? `${preventiviDaFare[0]?.cliente}` : "Nessuno" },
                { id: "ferme", icon: "⚠️", label: "Ferme", count: ferme.length, color: T.red, sub: ferme.length > 0 ? `da ${ferme[0] ? giorniFermaCM(ferme[0]) : 0}gg` : "Tutto ok" },
                { id: "oggi", icon: "📅", label: "Oggi", count: todayEvents.length, color: "#007aff", sub: todayEvents[0] ? `Prossimo: ${todayEvents[0].time || "—"}` : "Nessun evento" },
              ].map(c => (
                <div key={c.id} onClick={() => {
                  if (c.id === "misure") { setFilterFase("misure"); setTab("commesse"); }
                  else if (c.id === "prev") { setFilterFase("preventivo"); setTab("commesse"); }
                  else if (c.id === "ferme") { setFilterFase("tutte"); setTab("commesse"); }
                  else if (c.id === "oggi") { setTab("agenda"); }
                }} style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, boxShadow: T.cardSh, padding: "10px 12px", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(135deg, ${c.color}, ${c.color}80)` }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontFamily: FM, lineHeight: 1 }}>{c.count}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, textTransform: "uppercase" as const, letterSpacing: 0.5, marginTop: 2 }}>{c.label}</div>
                      <div style={{ fontSize: 9, color: T.sub, marginTop: 1 }}>{c.sub}</div>
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{c.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),

      // ═══ IO — briefing personale ═══
      io: (() => {
        if (ioActions.length === 0) return null;
        return (
          <div key="io">
            <SectionHead id="io" icon="👤" title="IO · Da fare oggi" count={ioRemaining.length} countColor={ioRemaining.some(a => a.urgenza === "alta") ? T.red : "#ff9500"} />
            {!collapsed["io"] && (
              <div style={{ padding: "0 16px", marginBottom: 8 }}>
                <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, boxShadow: T.cardSh, overflow: "hidden" }}>
                  <div style={{ padding: "8px 12px", background: T.acc + "08", borderBottom: `1px solid ${T.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.acc }}>Completamento giornata</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: T.acc, fontFamily: FM }}>{ioDone.length}/{ioActions.length}</span>
                  </div>
                  <div style={{ height: 3, background: T.bg }}><div style={{ height: "100%", background: T.acc, width: `${ioActions.length > 0 ? (ioDone.length / ioActions.length) * 100 : 0}%`, transition: "width 0.3s", borderRadius: 2 }} /></div>
                  {ioRemaining.map(a => (
                    <div key={a.id} style={{ padding: "10px 12px", borderBottom: `1px solid ${T.bg}`, display: "flex", alignItems: "center", gap: 10 }}>
                      <div onClick={() => setIoChecked(prev => ({ ...prev, [a.id]: true }))}
                        style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${a.color}`, flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                          <span style={{ fontSize: 12 }}>{a.icon}</span>
                          {a.urgenza === "alta" && <span style={{ ...S.badge(T.red + "15", T.red), fontSize: 8, fontWeight: 800, padding: "1px 5px" }}>URGENTE</span>}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{a.titolo}</div>
                        <div style={{ fontSize: 10, color: T.sub }}>{a.sotto}</div>
                      </div>
                    </div>
                  ))}
                  {ioDone.length > 0 && (
                    <div style={{ padding: "6px 12px", background: T.grn + "08" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: T.grn, marginBottom: 4 }}>✓ COMPLETATE ({ioDone.length})</div>
                      {ioDone.map(a => (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: 0.5 }}>
                          <span style={{ fontSize: 10, color: T.grn }}>✓</span>
                          <span style={{ fontSize: 10, color: T.sub, textDecoration: "line-through" }}>{a.titolo}</span>
                          <span onClick={() => setIoChecked(prev => { const n = { ...prev }; delete n[a.id]; return n; })} style={{ fontSize: 8, color: T.sub, cursor: "pointer", marginLeft: "auto" }}>↩</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })(),

      // ═══ ATTENZIONE ═══
      attenzione: (ferme.length > 0 || problemi.filter(p => p.stato !== "risolto").length > 0) ? (
        <div key="attenzione">
          <div style={{ margin: "0 16px 8px" }}>
            <div onClick={() => toggleCollapse("attenzione")} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: !collapsed["attenzione"] ? `${T.r}px ${T.r}px 0 0` : T.r,
              background: T.red + "10", border: `1px solid ${T.red}18`, cursor: "pointer"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: T.red, textTransform: "uppercase" as const, letterSpacing: "0.1em", fontFamily: FM }}>⚠️ ATTENZIONE</span>
                <span style={{ ...S.badge(T.red, "#fff") }}>{ferme.length + problemi.filter(p => p.stato !== "risolto").length}</span>
              </div>
              <span style={{ fontSize: 9, color: T.sub, display: "inline-block", transform: collapsed["attenzione"] ? "rotate(-90deg)" : "none", transition: "transform 0.15s" }}>▼</span>
            </div>
            {!collapsed["attenzione"] && (<>
            {/* Problemi aperti */}
            {problemi.filter(p => p.stato !== "risolto").map((p, i) => (
              <div key={p.id} onClick={() => { const cm = cantieri.find(c => c.id === p.commessaId); if (cm) { setSelectedCM(cm); setTab("commesse"); setTimeout(() => setShowProblemiView(true), 200); } }}
                style={{
                  padding: "10px 14px", background: T.card,
                  borderLeft: `3px solid #FF3B30`, borderRight: `1px solid ${T.red}18`,
                  borderBottom: `1px solid ${T.red}18`,
                  borderRadius: i === 0 && ferme.length === 0 ? 0 : 0,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10
                }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ ...S.badge("#FF3B3015", "#FF3B30"), fontSize: 9, fontWeight: 800, fontFamily: FM }}>🚨 {p.stato === "in_corso" ? "IN CORSO" : "APERTO"}</span>
                    <span style={{ fontSize: 10, color: T.sub, fontFamily: FM }}>{p.commessaCode}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.titolo}</div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{p.cliente}{p.assegnatoA ? ` · 👤 ${p.assegnatoA}` : ""}</div>
                </div>
                <span style={{ color: T.sub, fontSize: 16 }}>›</span>
              </div>
            ))}
            {/* Commesse ferme */}
            {ferme.map((c, i) => (
              <div key={c.id} onClick={() => { setSelectedCM(c); setTab("commesse"); }}
                style={{
                  padding: "10px 14px", background: T.card,
                  borderLeft: `3px solid ${T.red}`, borderRight: `1px solid ${T.red}18`,
                  borderBottom: `1px solid ${T.red}18`,
                  borderRadius: i === ferme.length - 1 ? `0 0 ${T.r}px ${T.r}px` : 0,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10
                }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ ...S.badge(T.red + "15", T.red), fontSize: 9, fontWeight: 800, fontFamily: FM }}>FERMA {giorniFermaCM(c)}gg</span>
                    <span style={{ fontSize: 10, color: T.sub, fontFamily: FM }}>{c.code}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{c.cliente}</div>
                  <div style={{ fontSize: 11, color: T.acc, fontWeight: 600, marginTop: 2 }}>→ {PIPELINE.find(p => p.id === c.fase)?.nome || c.fase}</div>
                </div>
                <span style={{ color: T.sub, fontSize: 16 }}>›</span>
              </div>
            ))}
            </>)}
          </div>
        </div>
      ) : null,

      // ═══ PROGRAMMA OGGI — swipeable ═══
      programma: (() => {
        return (
          <div key="programma">
            <SectionHead id="programma" icon="📋" title="Programma" count={todayEvents.length} countColor="#007aff" />
            {!collapsed["programma"] && (
              <div style={{ padding: "0 16px", marginBottom: 8 }}>
                <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, boxShadow: T.cardSh, overflow: "hidden" }}>
                  {/* Day navigation */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: `1px solid ${T.bdr}`, background: T.bg }}>
                    <div onClick={() => setDayOffset(d => d - 1)} style={{ padding: "4px 10px", cursor: "pointer", fontSize: 14, color: T.sub }}>‹</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: dayOffset === 0 ? T.acc : T.text }}>{dayLabel}</div>
                      <div style={{ fontSize: 9, color: T.sub }}>{dayDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</div>
                    </div>
                    <div onClick={() => setDayOffset(d => d + 1)} style={{ padding: "4px 10px", cursor: "pointer", fontSize: 14, color: T.sub }}>›</div>
                  </div>
                  {dayOffset !== 0 && (
                    <div onClick={() => setDayOffset(0)} style={{ textAlign: "center", padding: "4px", fontSize: 10, color: T.acc, fontWeight: 600, cursor: "pointer", background: T.acc + "06" }}>
                      ← Torna a oggi
                    </div>
                  )}
                  {dayEvents.length === 0 ? (
                    <div style={{ padding: "24px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{isPast ? "✓" : "☀️"}</div>
                      <div style={{ fontSize: 12, color: T.sub }}>
                        {isPast ? "Nessuna attività registrata" : "Nessuna attività programmata"}
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: "relative", padding: "8px 0" }}>
                      <div style={{ position: "absolute", left: 33, top: 16, bottom: 16, width: 2, background: T.bdr, zIndex: 0 }} />
                      {dayEvents.map(ev => (
                        <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                          style={{ display: "flex", gap: 12, position: "relative", zIndex: 1, cursor: "pointer", padding: "0 12px" }}>
                          <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", width: 44, flexShrink: 0, paddingTop: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: ev.color || "#007aff", border: `2px solid ${T.card}`, boxShadow: `0 0 0 2px ${(ev.color || "#007aff")}40`, zIndex: 2 }} />
                            {ev.time && <div style={{ fontSize: 9, fontWeight: 700, color: ev.color || "#007aff", fontFamily: FM, marginTop: 3 }}>{ev.time}</div>}
                          </div>
                          <div style={{
                            flex: 1, padding: "8px 12px", borderRadius: T.r, background: T.card,
                            border: `1px solid ${T.bdr}`, borderLeft: `3px solid ${ev.color || "#007aff"}`,
                            marginBottom: 6, boxShadow: T.cardSh, opacity: isPast ? 0.6 : 1
                          }}>
                            {isPast && <span style={{ ...S.badge(T.grn + "15", T.grn), fontSize: 8, fontWeight: 800, marginBottom: 4, display: "inline-block" }}>✓ FATTO</span>}
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{ev.text}</div>
                            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                              {ev.persona && `${ev.persona} · `}{ev.addr || ""}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })(),

      // ═══ SETTIMANA ═══
      settimana: (
        <div key="settimana">
          <SectionHead id="settimana" icon="📅" title="Questa settimana" extra={<button onClick={() => setTab("agenda")} style={S.sectionBtn}>Apri agenda</button>} />
          {!collapsed["settimana"] && (
            <div style={{ padding: "0 16px", marginBottom: 8 }}>
              <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, boxShadow: T.cardSh, padding: "10px 6px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {weekDays.map((d, i) => {
                  const dISO = d.toISOString().split("T")[0];
                  const isToday = dISO === todayISO;
                  const evs = events.filter(e => e.date === dISO);
                  return (
                    <div key={i} onClick={() => { setDayOffset(Math.round((d.getTime() - today.getTime()) / 86400000)); }} style={{ textAlign: "center" as const, cursor: "pointer", padding: "4px 0" }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: i >= 5 ? "#ff9500" : T.sub, textTransform: "uppercase" as const }}>{dayNames[i]}</div>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", margin: "4px auto",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: isToday ? 800 : 500,
                        background: isToday ? T.acc : "transparent", color: isToday ? "#fff" : T.text,
                      }}>{d.getDate()}</div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 2, minHeight: 6, marginTop: 2 }}>
                        {evs.slice(0, 3).map((ev, j) => (
                          <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: ev.color || "#007aff" }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ),

      // ═══ COMMESSE ═══
      commesse: (
        <div key="commesse">
          <SectionHead id="commesse" icon="📁" title={`Commesse ${cmFiltrate.length}`} extra={<button onClick={() => setTab("commesse")} style={S.sectionBtn}>Vedi tutte</button>} />
          {!collapsed["commesse"] && (
            <div>
              <div style={{ display: "flex", gap: 5, padding: "0 16px 8px", overflowX: "auto" as const }}>
                {fasi.map((f, i) => {
                  const p = PIPELINE.find(x => x.id === f);
                  const n = f === "tutte" ? cantieri.length : cantieri.filter(c => c.fase === f).length;
                  if (n === 0 && f !== "tutte") return null;
                  return (
                    <div key={f} onClick={() => setCmFaseIdx(i)} style={{
                      padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const,
                      background: cmFaseIdx === i ? (p?.color || T.acc) : T.card,
                      color: cmFaseIdx === i ? "#fff" : T.sub,
                      border: `1px solid ${cmFaseIdx === i ? (p?.color || T.acc) : T.bdr}`,
                    }}>
                      {p?.ico || "📁"} {p?.nome || "Tutte"} {n > 0 && <span style={{ fontWeight: 800 }}>{n}</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "0 16px" }}>
                {cmFiltrate.slice(0, 5).map(c => {
                  const p = PIPELINE.find(x => x.id === c.fase);
                  const isFerma = giorniFermaCM(c) >= SOGLIA_GIORNI;
                  const vaniTot = getVaniAttivi(c).length;
                  const vaniOk = getVaniAttivi(c).filter(v => Object.keys(v.misure || {}).length >= 4).length;
                  const faseIdx = PIPELINE.findIndex(x => x.id === c.fase);
                  const progFase = faseIdx >= 0 ? Math.round((faseIdx + 1) / PIPELINE.length * 100) : 0;
                  return (
                    <div key={c.id} onClick={() => { setSelectedCM(c); setTab("commesse"); }}
                      style={{
                        background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, boxShadow: T.cardSh,
                        padding: "11px 13px", cursor: "pointer", marginBottom: 8, overflow: "hidden",
                        borderLeft: `3px solid ${isFerma ? T.red : p?.color || T.acc}`,
                      }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
                            <span style={{ fontSize: 11, color: T.sub, fontFamily: FM }}>{c.code}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{c.cliente}</span>
                            {isFerma && <span style={{ ...S.badge(T.red + "15", T.red), fontSize: 9, fontWeight: 800 }}>FERMA {giorniFermaCM(c)}gg</span>}
                          </div>
                          <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{c.indirizzo || "—"}</div>
                          <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" as const, alignItems: "center" }}>
                            <span style={{ ...S.badge((p?.color || T.acc) + "18", p?.color || T.acc), fontSize: 10 }}>{p?.ico} {p?.nome}</span>
                            {vaniTot > 0 && <span style={{ fontSize: 10, color: T.sub }}>{vaniOk}/{vaniTot} vani</span>}
                          </div>
                          {/* Prossima azione */}
                          <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, background: T.acc + "08", border: `1px solid ${T.acc}15`, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: T.acc, fontWeight: 800 }}>→</span>
                            <span style={{ fontSize: 11, color: T.acc, fontWeight: 600, lineHeight: "1.3" }}>
                              {c.fase === "misure" ? `Completare misure (${vaniOk}/${vaniTot})` :
                               c.fase === "preventivo" ? "Preparare e inviare preventivo" :
                               c.fase === "sopralluogo" ? "Eseguire sopralluogo" :
                               c.fase === "ordini" ? "Verificare ordini materiali" :
                               c.fase === "produzione" ? "Seguire produzione" :
                               c.fase === "posa" ? "Programmare posa in opera" :
                               `Fase: ${p?.nome || c.fase}`}
                            </span>
                          </div>
                        </div>
                        <span style={{ color: T.sub, fontSize: 16, flexShrink: 0 }}>›</span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontSize: 10, color: T.sub }}>Pipeline</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: isFerma ? T.red : p?.color || T.acc }}>{progFase}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: T.bg, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 2, background: isFerma ? T.red : p?.color || T.acc, width: `${progFase}%`, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ),

      // ═══ WORKFLOW COMMESSE ═══
      azioni: (() => {
        const totale = cantieri.length;
        const faseData = PIPELINE.filter(p => p.attiva).map(p => ({
          ...p, count: cantieri.filter(c => c.fase === p.id).length
        }));
        const maxCount = Math.max(...faseData.map(f => f.count), 1);
        return (
          <div key="azioni">
            <SectionHead id="azioni" icon="🔄" title="Workflow commesse" count={totale} countColor={T.acc} extra={<button onClick={() => setTab("commesse")} style={S.sectionBtn}>Vedi tutte</button>} />
            {!collapsed["azioni"] && (
              <div style={{ padding: "0 16px", marginBottom: 16 }}>
                <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, boxShadow: T.cardSh, overflow: "hidden" }}>
                  {/* Pipeline flow */}
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 12px 6px", gap: 2, overflowX: "auto" as const, WebkitOverflowScrolling: "touch" as any, scrollbarWidth: "none" as any }}>
                    {faseData.map((f, i) => (
                      <div key={f.id} style={{ display: "flex", alignItems: "center", flexShrink: 0, minWidth: 56 }}>
                        <div onClick={() => { setFilterFase(f.id); setTab("commesse"); }}
                          style={{ width: 56, textAlign: "center" as const, cursor: "pointer", padding: "4px 2px", borderRadius: 6, background: f.count > 0 ? f.color + "10" : "transparent", transition: "background 0.15s" }}>
                          <div style={{ fontSize: 16 }}>{f.ico}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: f.count > 0 ? f.color : T.sub + "60", fontFamily: FM, lineHeight: 1 }}>{f.count}</div>
                          <div style={{ fontSize: 7, fontWeight: 700, color: f.count > 0 ? f.color : T.sub, textTransform: "uppercase" as const, letterSpacing: 0.3, marginTop: 1, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{f.nome}</div>
                        </div>
                        {i < faseData.length - 1 && <span style={{ fontSize: 8, color: T.bdr, flexShrink: 0, margin: "0 1px" }}>›</span>}
                      </div>
                    ))}
                  </div>
                  {/* Bar chart */}
                  <div style={{ display: "flex", gap: 3, padding: "4px 12px 10px", alignItems: "flex-end", height: 32, overflowX: "auto" as const, scrollbarWidth: "none" as any }}>
                    {faseData.map(f => (
                      <div key={f.id} style={{ flexShrink: 0, minWidth: 56, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 0 }}>
                        <div style={{
                          width: "100%", borderRadius: "3px 3px 0 0",
                          height: f.count > 0 ? Math.max(4, (f.count / maxCount) * 28) : 2,
                          background: f.count > 0 ? f.color : T.bdr,
                          opacity: f.count > 0 ? 0.7 : 0.3,
                          transition: "height 0.3s"
                        }} />
                      </div>
                    ))}
                  </div>
                  {/* Ferme alert inline */}
                  {ferme.length > 0 && (
                    <div style={{ padding: "6px 12px", background: T.red + "06", borderTop: `1px solid ${T.red}12`, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10 }}>⚠️</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.red }}>{ferme.length} ferme da &gt;{SOGLIA_GIORNI}gg</span>
                      <span style={{ fontSize: 9, color: T.sub, marginLeft: "auto" }}>{ferme.map(c => c.code).join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })(),

      // ═══ DASHBOARD ECONOMICA ═══
      dashboard: (() => {
        const cmConf = cantieri.filter(c => c.confermato);
        const cmChiuse = cantieri.filter(c => c.fase === "chiusura");
        const fattMese = cantieri.filter(c => {
          if (!c.euro) return false;
          const d = c.dataConferma || "";
          const now = new Date();
          return d.includes("/" + (now.getMonth() + 1).toString().padStart(2,"0") + "/" + now.getFullYear()) || c.fase === "chiusura";
        }).reduce((s, c) => s + (parseFloat(c.euro) || 0), 0);
        const totPrev = cantieri.filter(c => c.euro && c.fase !== "chiusura").reduce((s, c) => s + (parseFloat(c.euro) || 0), 0);
        const totConf = cmConf.reduce((s, c) => s + (parseFloat(c.euro) || 0), 0);
        const totChiuse = cmChiuse.reduce((s, c) => s + (parseFloat(c.euro) || 0), 0);
        const convRate = cantieri.length > 0 ? Math.round(cmConf.length / cantieri.length * 100) : 0;
        return (
          <div key="dashboard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionHead id="dashboard" icon="📊" title="Dashboard" />
                <div onClick={() => setShowContabilita(true)} style={{ padding: "4px 10px", borderRadius: 6, background: T.accLt, color: T.acc, fontSize: 10, fontWeight: 700, cursor: "pointer", marginRight: 16 }}>💰 Contabilità →</div>
              </div>
            {!collapsed["dashboard"] && (
              <div style={{ padding: "0 16px", marginBottom: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, padding: "10px 12px" }}>
                    <div style={{ fontSize: 8, color: T.sub, textTransform: "uppercase", fontWeight: 700 }}>Preventivi aperti</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>€{totPrev.toLocaleString("it-IT")}</div>
                    <div style={{ fontSize: 9, color: T.sub }}>{cantieri.filter(c => c.euro && c.fase !== "chiusura").length} commesse</div>
                  </div>
                  <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, padding: "10px 12px" }}>
                    <div style={{ fontSize: 8, color: T.sub, textTransform: "uppercase", fontWeight: 700 }}>Confermati</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#34c759" }}>€{totConf.toLocaleString("it-IT")}</div>
                    <div style={{ fontSize: 9, color: T.sub }}>{cmConf.length} commesse · {convRate}% conv.</div>
                  </div>
                  <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, padding: "10px 12px" }}>
                    <div style={{ fontSize: 8, color: T.sub, textTransform: "uppercase", fontWeight: 700 }}>Chiusi/Fatturati</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#007aff" }}>€{totChiuse.toLocaleString("it-IT")}</div>
                    <div style={{ fontSize: 9, color: T.sub }}>{cmChiuse.length} commesse</div>
                  </div>
                  <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, padding: "10px 12px" }}>
                    <div style={{ fontSize: 8, color: T.sub, textTransform: "uppercase", fontWeight: 700 }}>In produzione</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#5856d6" }}>{cantieri.filter(c => c.trackingStato && !["montato"].includes(c.trackingStato)).length}</div>
                    <div style={{ fontSize: 9, color: T.sub }}>{cantieri.filter(c => c.trackingStato === "pronto").length} pronti da consegnare</div>
                  </div>
                </div>
                {/* Scadenzario rapido */}
                {cantieri.filter(c => c.confermato && c.euro && c.fase !== "chiusura").length > 0 && (
                  <div style={{ marginTop: 8, background: T.card, borderRadius: T.r, border: `1px solid ${T.bdr}`, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", marginBottom: 6 }}>💰 Da incassare</div>
                    {cantieri.filter(c => c.confermato && c.euro && c.fase !== "chiusura").slice(0, 5).map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.bdr}`, fontSize: 11 }}>
                        <span style={{ color: T.text }}>{c.cliente} <span style={{ color: T.sub, fontSize: 9 }}>{c.code}</span></span>
                        <span style={{ fontWeight: 700, color: "#34c759" }}>€{parseFloat(c.euro).toLocaleString("it-IT")}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* ═══ QUICK ACCESS CARDS ═══ */}
                {(() => {
                  const ordAtt = ordiniFornDB.filter(o => o.stato !== "consegnato");
                  const montAtt = montaggiDB.filter(m => m.stato !== "completato");
                  const fatAtt = fattureDB.filter(f => !f.pagata);
                  const totFat = fatAtt.reduce((s,f) => s + f.importo, 0);
                  const cards = [
                    ordAtt.length > 0 && { key: "ordini", ico: "📦", title: "Ordini Fornitore", count: ordAtt.length, sub: ordAtt.filter(o => o.conferma?.ricevuta).length + " confermati", col: "#ff9500" },
                    montAtt.length > 0 && { key: "montaggi", ico: "🔧", title: "Prossimi Montaggi", count: montAtt.length, sub: montAtt[0]?.data ? new Date(montAtt[0].data).toLocaleDateString("it-IT",{day:"numeric",month:"short"}) + " prossimo" : "", col: "#007aff" },
                    fatAtt.length > 0 && { key: "fatture", ico: "⏳", title: "Fatture da Incassare", count: fatAtt.length, sub: "€" + totFat.toLocaleString("it-IT"), col: "#ff3b30" },
                  ].filter(Boolean);
                  if (cards.length === 0) return null;
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: cards.length >= 3 ? "1fr 1fr 1fr" : cards.length === 2 ? "1fr 1fr" : "1fr", gap: 6, marginTop: 8 }}>
                      {cards.map(cd => (
                        <div key={cd.key} onClick={() => setHomeView(cd.key)}
                          style={{ background: T.card, borderRadius: T.r, border: "1px solid " + T.bdr, padding: "12px 10px", cursor: "pointer", textAlign: "center", transition: "all .15s" }}>
                          <div style={{ fontSize: 22 }}>{cd.ico}</div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: cd.col, marginTop: 2 }}>{cd.count}</div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: T.text, marginTop: 1 }}>{cd.title}</div>
                          <div style={{ fontSize: 8, color: T.sub }}>{cd.sub}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })(),
    };

    // ═══ PAGINE DEDICATE — Ordini / Montaggi / Fatture ═══
    if (homeView) {
      const backBtn = <div onClick={() => setHomeView(null)} style={{ cursor:"pointer", padding:4 }}><Ico d={ICO.back} s={20} c={T.sub} /></div>;
      
      if (homeView === "ordini") {
        const allOrd = ordiniFornDB.sort((a,b) => (a.consegna?.prevista||"z").localeCompare(b.consegna?.prevista||"z"));
        return (
          <div style={{ paddingBottom: 80 }}>
            <div style={S.header}>
              {backBtn}
              <div style={{ flex:1 }}><div style={S.headerTitle}>📦 Ordini Fornitore</div><div style={S.headerSub}>{allOrd.length} totali · {allOrd.filter(o=>o.stato!=="consegnato").length} attivi</div></div>
            </div>
            <div style={{ padding:"0 16px" }}>
              {allOrd.map(o => {
                const st = ORDINE_STATI.find(s => s.id === o.stato) || ORDINE_STATI[0];
                const isLate = o.consegna?.prevista && new Date(o.consegna.prevista) < new Date();
                const cm = cantieri.find(cc => cc.id === o.cmId);
                return (
                  <div key={o.id} onClick={() => { if(cm) { setSelectedCM(cm); setHomeView(null); setTab("commesse"); } }}
                    style={{ background:T.card, borderRadius:12, border:"1px solid "+T.bdr, padding:"12px 14px", marginBottom:8, cursor:"pointer",
                      borderLeft:"4px solid "+st.color }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{st.icon} {o.fornitore?.nome||"—"}</div>
                        <div style={{ fontSize:11, color:T.sub }}>{o.cmCode} · {cm?.cliente||""} {cm?.cognome||""}</div>
                      </div>
                      <span style={{ padding:"3px 8px", borderRadius:6, fontSize:9, fontWeight:700, background:st.color+"18", color:st.color }}>{st.label}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11 }}>
                      <span style={{ color:T.sub }}>Totale: <b style={{ color:T.text }}>€{(o.totaleIva||o.totale||0).toLocaleString("it-IT")}</b></span>
                      {o.consegna?.prevista && <span style={{ color:isLate?"#ff3b30":T.sub, fontWeight:isLate?700:400 }}>{isLate?"⚠️ ":""}Consegna: {new Date(o.consegna.prevista).toLocaleDateString("it-IT",{day:"numeric",month:"short"})}</span>}
                    </div>
                    {o.conferma?.ricevuta && <div style={{ fontSize:10, color:"#34c759", marginTop:4 }}>✅ Conferma ricevuta{o.conferma.dataRicezione ? " il "+o.conferma.dataRicezione : ""}</div>}
                  </div>
                );
              })}
              {allOrd.length === 0 && <div style={{ textAlign:"center", padding:30, color:T.sub }}>Nessun ordine</div>}
            </div>
          </div>
        );
      }

      if (homeView === "montaggi") {
        const allMont = montaggiDB.sort((a,b) => {
          if(a.stato==="completato" && b.stato!=="completato") return 1;
          if(a.stato!=="completato" && b.stato==="completato") return -1;
          return (a.data||"z").localeCompare(b.data||"z");
        });
        const daFare = allMont.filter(m => m.stato !== "completato").length;

        // Calendar helpers
        const mcd = montCalDate;
        const mcdY = mcd.getFullYear(), mcdM = mcd.getMonth();
        const daysInMonth = new Date(mcdY, mcdM + 1, 0).getDate();
        const firstDow = (new Date(mcdY, mcdM, 1).getDay() + 6) % 7; // Mon=0
        const montByDate: Record<string, typeof allMont> = {};
        allMont.forEach(m => { if (m.data) { (montByDate[m.data] = montByDate[m.data] || []).push(m); } });
        const todayStr = new Date().toISOString().split("T")[0];

        // Week view
        const weekStart = new Date(mcd);
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
        const weekDays: Date[] = [];
        for (let i = 0; i < 7; i++) { const d = new Date(weekStart); d.setDate(d.getDate() + i); weekDays.push(d); }

        // Render a montaggio card
        const renderMontCard = (m: any, expanded: boolean) => {
          const sq = squadreDB.find(s => s.id === m.squadraId);
          const cm = cantieri.find(cc => cc.id === m.cmId);
          const done = m.stato === "completato";
          const isExp = expanded;
          return (
            <div key={m.id} style={{ background:T.card, borderRadius:12, border:"1px solid "+T.bdr, marginBottom:8,
              borderLeft:"4px solid "+(done?"#34c759":"#007aff"), opacity:done?0.7:1 }}>
              <div onClick={() => setMontExpandId(isExp ? null : m.id)}
                style={{ padding:"12px 14px", cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{done?"✅":"🔧"} {m.cliente}</div>
                    <div style={{ fontSize:11, color:T.sub }}>{m.cmCode} · {m.vani||"?"} vani · {m.durata||""}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:done?"#34c759":"#007aff" }}>{m.data ? new Date(m.data).toLocaleDateString("it-IT",{weekday:"short",day:"numeric",month:"short"}) : "—"}</div>
                    {sq && <div style={{ fontSize:10, color:sq.colore||T.sub, fontWeight:600 }}>{sq.nome}</div>}
                  </div>
                </div>
              </div>
              {isExp && (
                <div style={{ padding:"0 14px 14px", borderTop:"1px solid "+T.bdr }}>
                  {/* Detail grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10 }}>
                    <div style={{ padding:8, borderRadius:8, background:T.bg }}>
                      <div style={{ fontSize:8, color:T.sub, fontWeight:700 }}>CLIENTE</div>
                      <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{m.cliente}</div>
                      {cm?.indirizzo && <div style={{ fontSize:10, color:T.sub }}>📍 {cm.indirizzo}</div>}
                      {cm?.telefono && <div onClick={(e) => { e.stopPropagation(); window.location.href="tel:"+cm.telefono; }} style={{ fontSize:10, color:T.acc, cursor:"pointer", marginTop:2 }}>📞 {cm.telefono}</div>}
                    </div>
                    <div style={{ padding:8, borderRadius:8, background:T.bg }}>
                      <div style={{ fontSize:8, color:T.sub, fontWeight:700 }}>PROGRAMMAZIONE</div>
                      <div style={{ fontSize:12, fontWeight:700, color:T.text }}>{m.data ? new Date(m.data).toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"}) : "Da programmare"}</div>
                      <div style={{ fontSize:10, color:T.sub }}>Ore: {m.orario||"—"} · Durata: {m.durata||m.giorni+"g"||"—"}</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:6 }}>
                    <div style={{ padding:8, borderRadius:8, background:T.bg }}>
                      <div style={{ fontSize:8, color:T.sub, fontWeight:700 }}>SQUADRA</div>
                      <div style={{ fontSize:12, fontWeight:700, color:sq?.colore||T.text }}>{sq?.nome||"Da assegnare"}</div>
                      <div style={{ fontSize:10, color:T.sub }}>{m.vani||"?"} vani</div>
                    </div>
                    <div style={{ padding:8, borderRadius:8, background:done?"#34c75910":"#007aff10" }}>
                      <div style={{ fontSize:8, color:T.sub, fontWeight:700 }}>STATO</div>
                      <div style={{ fontSize:12, fontWeight:700, color:done?"#34c759":"#007aff" }}>{done?"✅ Completato":"⏳ "+m.stato}</div>
                    </div>
                  </div>
                  {m.note && <div style={{ marginTop:8, padding:8, borderRadius:8, background:"#ff950008", border:"1px solid #ff950020" }}>
                    <div style={{ fontSize:8, color:"#ff9500", fontWeight:700 }}>NOTE</div>
                    <div style={{ fontSize:11, color:T.text }}>{m.note}</div>
                  </div>}
                  {cm && <div onClick={(e) => { e.stopPropagation(); setSelectedCM(cm); setHomeView(null); setTab("commesse"); }}
                    style={{ marginTop:8, padding:10, borderRadius:8, background:T.acc+"10", textAlign:"center", fontSize:11, fontWeight:700, color:T.acc, cursor:"pointer", border:"1px solid "+T.acc+"30" }}>
                    📁 Apri commessa {cm.code}
                  </div>}
                </div>
              )}
            </div>
          );
        };

        return (
          <div style={{ paddingBottom: 80 }}>
            <div style={S.header}>
              {backBtn}
              <div style={{ flex:1 }}><div style={S.headerTitle}>🔧 Montaggi</div><div style={S.headerSub}>{allMont.length} totali · {daFare} da fare</div></div>
            </div>
            {/* View switcher */}
            <div style={{ display:"flex", gap:2, padding:"0 16px 8px" }}>
              {[{id:"lista",l:"📋 Lista"},{id:"mese",l:"📅 Mese"},{id:"settimana",l:"📆 Settimana"},{id:"giorno",l:"📌 Giorno"}].map(v => (
                <div key={v.id} onClick={() => setMontView(v.id)}
                  style={{ flex:1, padding:"7px 4px", borderRadius:8, textAlign:"center", fontSize:10, fontWeight:700, cursor:"pointer",
                    background:montView===v.id?"#007aff15":T.bg, color:montView===v.id?"#007aff":T.sub,
                    border:"1.5px solid "+(montView===v.id?"#007aff":T.bdr) }}>{v.l}</div>
              ))}
            </div>

            {/* ═══ LISTA ═══ */}
            {montView === "lista" && (
              <div style={{ padding:"0 16px" }}>
                {allMont.map(m => renderMontCard(m, montExpandId === m.id))}
                {allMont.length === 0 && <div style={{ textAlign:"center", padding:30, color:T.sub }}>Nessun montaggio</div>}
              </div>
            )}

            {/* ═══ MESE ═══ */}
            {montView === "mese" && (
              <div style={{ padding:"0 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div onClick={() => setMontCalDate(new Date(mcdY, mcdM-1, 1))} style={{ padding:"6px 12px", cursor:"pointer", fontSize:16 }}>◀</div>
                  <div style={{ fontSize:14, fontWeight:800, color:T.text }}>{mcd.toLocaleDateString("it-IT",{month:"long",year:"numeric"})}</div>
                  <div onClick={() => setMontCalDate(new Date(mcdY, mcdM+1, 1))} style={{ padding:"6px 12px", cursor:"pointer", fontSize:16 }}>▶</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
                  {["Lu","Ma","Me","Gi","Ve","Sa","Do"].map(d => <div key={d} style={{ textAlign:"center", fontSize:9, fontWeight:700, color:T.sub, padding:4 }}>{d}</div>)}
                  {Array.from({length: firstDow}).map((_,i) => <div key={"e"+i}/>)}
                  {Array.from({length: daysInMonth}).map((_,i) => {
                    const day = i + 1;
                    const dateStr = `${mcdY}-${String(mcdM+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const monts = montByDate[dateStr] || [];
                    const isToday = dateStr === todayStr;
                    return (
                      <div key={day} onClick={() => { if(monts.length > 0) { setMontCalDate(new Date(dateStr)); setMontView("giorno"); } }}
                        style={{ minHeight:40, padding:3, borderRadius:6, background:monts.length>0?"#007aff08":isToday?"#ff950008":"transparent",
                          border:isToday?"1.5px solid #ff9500":"1px solid "+T.bdr+"40", cursor:monts.length>0?"pointer":"default", position:"relative" as const }}>
                        <div style={{ fontSize:10, fontWeight:isToday?800:600, color:isToday?"#ff9500":T.text, textAlign:"center" }}>{day}</div>
                        {monts.map((m,mi) => {
                          const sq = squadreDB.find(s => s.id === m.squadraId);
                          const done = m.stato === "completato";
                          return <div key={mi} style={{ fontSize:7, fontWeight:700, padding:"1px 3px", borderRadius:3, marginTop:1,
                            background:done?"#34c75920":"#007aff20", color:done?"#34c759":"#007aff", overflow:"hidden", whiteSpace:"nowrap" as const, textOverflow:"ellipsis" }}>
                            {m.cliente?.split(" ")[0]}
                          </div>;
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ SETTIMANA ═══ */}
            {montView === "settimana" && (
              <div style={{ padding:"0 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div onClick={() => { const d = new Date(montCalDate); d.setDate(d.getDate()-7); setMontCalDate(d); }} style={{ padding:"6px 12px", cursor:"pointer", fontSize:16 }}>◀</div>
                  <div style={{ fontSize:13, fontWeight:800, color:T.text }}>
                    {weekDays[0].toLocaleDateString("it-IT",{day:"numeric",month:"short"})} — {weekDays[6].toLocaleDateString("it-IT",{day:"numeric",month:"short",year:"numeric"})}
                  </div>
                  <div onClick={() => { const d = new Date(montCalDate); d.setDate(d.getDate()+7); setMontCalDate(d); }} style={{ padding:"6px 12px", cursor:"pointer", fontSize:16 }}>▶</div>
                </div>
                {weekDays.map(wd => {
                  const dateStr = wd.toISOString().split("T")[0];
                  const monts = montByDate[dateStr] || [];
                  const isToday = dateStr === todayStr;
                  const isSun = wd.getDay() === 0;
                  return (
                    <div key={dateStr} style={{ marginBottom:6, borderRadius:10, border:"1px solid "+(isToday?"#ff9500":T.bdr), background:isToday?"#ff950005":isSun?T.bg+"80":"transparent", overflow:"hidden" }}>
                      <div style={{ padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center",
                        background:isToday?"#ff950010":"transparent", borderBottom:monts.length>0?"1px solid "+T.bdr:"none" }}>
                        <div style={{ fontSize:12, fontWeight:isToday?800:600, color:isToday?"#ff9500":isSun?T.sub:T.text }}>
                          {wd.toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"short"})}
                        </div>
                        {monts.length > 0 && <span style={{ fontSize:9, fontWeight:700, color:"#007aff", background:"#007aff12", padding:"2px 6px", borderRadius:4 }}>{monts.length} mont.</span>}
                      </div>
                      {monts.map(m => renderMontCard(m, montExpandId === m.id))}
                      {monts.length === 0 && <div style={{ padding:"4px 12px 8px", fontSize:10, color:T.sub }}>—</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ═══ GIORNO ═══ */}
            {montView === "giorno" && (
              <div style={{ padding:"0 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div onClick={() => { const d = new Date(montCalDate); d.setDate(d.getDate()-1); setMontCalDate(d); }} style={{ padding:"6px 12px", cursor:"pointer", fontSize:16 }}>◀</div>
                  <div style={{ fontSize:14, fontWeight:800, color:T.text }}>
                    {montCalDate.toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                  </div>
                  <div onClick={() => { const d = new Date(montCalDate); d.setDate(d.getDate()+1); setMontCalDate(d); }} style={{ padding:"6px 12px", cursor:"pointer", fontSize:16 }}>▶</div>
                </div>
                <div onClick={() => setMontCalDate(new Date())} style={{ textAlign:"center", fontSize:10, color:T.acc, cursor:"pointer", marginBottom:8, fontWeight:700 }}>📌 Oggi</div>
                {(() => {
                  const dateStr = montCalDate.toISOString().split("T")[0];
                  const monts = montByDate[dateStr] || [];
                  if (monts.length === 0) return <div style={{ textAlign:"center", padding:30, color:T.sub }}>Nessun montaggio per questa data</div>;
                  return monts.map(m => renderMontCard(m, montExpandId === m.id));
                })()}
              </div>
            )}
          </div>
        );
      }

      if (homeView === "fatture") {
        const allFat = fattureDB.sort((a,b) => (a.pagata===b.pagata ? (a.scadenza||"z").localeCompare(b.scadenza||"z") : a.pagata ? 1 : -1));
        const totInc = allFat.filter(f=>f.pagata).reduce((s,f)=>s+f.importo,0);
        const totDaInc = allFat.filter(f=>!f.pagata).reduce((s,f)=>s+f.importo,0);
        return (
          <div style={{ paddingBottom: 80 }}>
            <div style={S.header}>
              {backBtn}
              <div style={{ flex:1 }}><div style={S.headerTitle}>📄 Fatture</div><div style={S.headerSub}>{allFat.length} totali · €{totInc.toLocaleString("it-IT")} incassato · €{totDaInc.toLocaleString("it-IT")} da incassare</div></div>
            </div>
            <div style={{ padding:"0 16px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                <div style={{ padding:12, borderRadius:10, background:"#34c75910", textAlign:"center", border:"1px solid #34c75930" }}>
                  <div style={{ fontSize:8, fontWeight:700, color:"#34c759" }}>INCASSATO</div>
                  <div style={{ fontSize:18, fontWeight:900, color:"#34c759" }}>€{totInc.toLocaleString("it-IT")}</div>
                </div>
                <div style={{ padding:12, borderRadius:10, background:"#ff3b3010", textAlign:"center", border:"1px solid #ff3b3030" }}>
                  <div style={{ fontSize:8, fontWeight:700, color:"#ff3b30" }}>DA INCASSARE</div>
                  <div style={{ fontSize:18, fontWeight:900, color:"#ff3b30" }}>€{totDaInc.toLocaleString("it-IT")}</div>
                </div>
              </div>
              {allFat.map(f => {
                const scaduta = !f.pagata && f.scadenza && f.scadenza < new Date().toISOString().split("T")[0];
                const cm = cantieri.find(cc => cc.id === f.cmId);
                return (
                  <div key={f.id} onClick={() => { if(cm) { setSelectedCM(cm); setHomeView(null); setTab("commesse"); } }}
                    style={{ background:T.card, borderRadius:12, border:"1px solid "+T.bdr, padding:"12px 14px", marginBottom:8, cursor:"pointer",
                      borderLeft:"4px solid "+(f.pagata?"#34c759":scaduta?"#ff3b30":"#ff9500"), opacity:f.pagata?0.7:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{f.pagata?"✅":"📄"} {f.cliente}</div>
                        <div style={{ fontSize:11, color:T.sub }}>N.{f.numero}/{f.anno} · {f.tipo} · {f.cmCode}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:15, fontWeight:900, color:f.pagata?"#34c759":scaduta?"#ff3b30":T.text }}>€{f.importo.toLocaleString("it-IT")}</div>
                        {f.scadenza && !f.pagata && <div style={{ fontSize:9, color:scaduta?"#ff3b30":"#ff9500", fontWeight:600 }}>{scaduta?"⚠️ Scaduta":"Scad."} {new Date(f.scadenza).toLocaleDateString("it-IT",{day:"numeric",month:"short"})}</div>}
                        {f.pagata && <div style={{ fontSize:9, color:"#34c759" }}>Pagata{f.dataPagamento?" il "+f.dataPagamento:""}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {allFat.length === 0 && <div style={{ textAlign:"center", padding:30, color:T.sub }}>Nessuna fattura</div>}
            </div>
          </div>
        );
      }

      setHomeView(null);
    }

    return (
      <div style={{ paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ padding: "14px 16px 12px", background: T.card, borderBottom: `1px solid ${T.bdr}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: T.text, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: T.card, fontFamily: FF, letterSpacing: -1 }}>M</span>
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: -0.3, lineHeight: 1.1 }}>MASTRO</div>
                <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>misure</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 6 }}>
              <div style={{ textAlign: "right" as const }}>
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
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>{saluto}, Fabio</div>
          <div style={{ fontSize: 12, color: T.sub, marginTop: 1 }}>
            {today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Trial banner */}
        {activePlan === "trial" && (
          <div onClick={() => { setSettingsTab("piano"); setTab("settings"); }}
            style={{ margin: "0 16px 8px", padding: "8px 14px", borderRadius: 10, background: `linear-gradient(135deg, ${T.acc}20, ${T.acc}08)`, border: `1px solid ${T.acc}30`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>💎</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.acc }}>Trial gratuito · {trialDaysLeft} giorni rimasti</div>
                <div style={{ fontSize: 9, color: T.sub }}>Tutte le funzionalità sbloccate</div>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.acc }}>Vedi piani ›</span>
          </div>
        )}
        {activePlan === "free" && (
          <div onClick={() => { setSettingsTab("piano"); setTab("settings"); }}
            style={{ margin: "0 16px 8px", padding: "8px 14px", borderRadius: 10, background: T.red + "10", border: `1px solid ${T.red}30`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.red }}>Trial scaduto</div>
                <div style={{ fontSize: 9, color: T.sub }}>Funzionalità limitate · {cantieri.length}/5 commesse</div>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.acc }}>Attiva piano ›</span>
          </div>
        )}

        {/* Search */}
        <div style={{ padding: "0 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}` }}>
            <Ico d={ICO.search} s={16} c={T.sub} />
            <input style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: T.text, outline: "none", fontFamily: FF }}
              placeholder="Cerca commesse, clienti, vani..." value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} />
            {globalSearch && <div onClick={() => setGlobalSearch("")} style={{ cursor: "pointer", fontSize: 14, color: T.sub }}>✕</div>}
          </div>
          {globalSearch.trim().length > 1 && (() => {
            const q = globalSearch.toLowerCase();
            const cmResults = cantieri.filter(c => c.cliente?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q) || c.indirizzo?.toLowerCase().includes(q));
            const vanoResults = cantieri.flatMap(c => getVaniAttivi(c).filter(v => v.nome?.toLowerCase().includes(q) || v.tipo?.toLowerCase().includes(q) || v.stanza?.toLowerCase().includes(q)).map(v => ({ ...v, cmCode: c.code, cmCliente: c.cliente, cmId: c.id, cm: c })));
            const total = cmResults.length + vanoResults.length;
            return total > 0 ? (
              <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}`, marginTop: 6, maxHeight: 280, overflowY: "auto" as const }}>
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
              </div>
            ) : (
              <div style={{ padding: "10px 14px", background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}`, marginTop: 6, fontSize: 12, color: T.sub, textAlign: "center" as const }}>Nessun risultato per "{globalSearch}"</div>
            );
          })()}
        </div>

        {/* 📥 INBOX RAPIDO — ordini in attesa di conferma */}
        {(() => {
          const ordiniInAttesa = ordiniFornDB.filter(o => o.stato && o.stato !== "bozza" && !o.conferma?.ricevuta);
          if (ordiniInAttesa.length === 0) return null;
          return (
            <div style={{ margin: "0 16px 10px" }}>
              <div onClick={() => apriInboxDocumento()} style={{
                padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                background: "linear-gradient(135deg, #af52de15, #af52de08)",
                border: "2px solid #af52de30", display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#af52de", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, position: "relative" }}>
                  📥
                  <div style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", background: T.red, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ordiniInAttesa.length}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#af52de" }}>
                    {ordiniInAttesa.length} conferma{ordiniInAttesa.length > 1 ? "e" : ""} in attesa
                  </div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>
                    Carica PDF/foto da email, WhatsApp o portale → AI legge tutto
                  </div>
                </div>
                <div style={{ fontSize: 16, color: "#af52de" }}>→</div>
              </div>
            </div>
          );
        })()}

        {/* Composable sections */}
        {drag.order.map(id => {
          if (!sections[id]) return null;
          return (
            <div key={id}
              draggable={homeEditMode}
              onDragStart={() => { if(homeEditMode) drag.start(id); }}
              onDragOver={e => { e.preventDefault(); if(homeEditMode) drag.onOver(id); }}
              onDrop={e => { e.preventDefault(); if(homeEditMode) drag.drop(id); }}
              onDragEnd={() => { if(homeEditMode) drag.end(); }}
              style={{ opacity: drag.dragging === id ? 0.4 : 1, borderTop: drag.over === id ? `2px solid ${T.acc}` : "none", transition: "opacity 0.15s" }}>
              {homeEditMode && (
                <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
                  <span style={{ fontSize: 14, color: T.sub, cursor: "grab" }}>⠿</span>
                </div>
              )}
              <div style={{ filter: homeEditMode ? "brightness(0.97)" : "none", transition: "filter 0.15s" }}>
                {sections[id]}
              </div>
            </div>
          );
        })}
      </div>
    );

}
