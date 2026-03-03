"use client";
// @ts-nocheck
// ═══════════════════════════════════════════════════════════
// MASTRO ERP — HomePanel v4 — Cruscotto Operativo
// Header brand + 3 blocchi: ADESSO → OGGI → PIPELINE
// Zero scroll per capire il quadro
// ═══════════════════════════════════════════════════════════
import React from "react";
import { useMastro } from "./MastroContext";
import { FF, FM, ICO, Ico, I } from "./mastro-constants";

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

  // ─── Urgency data ───
  const ferme = cantieri.filter(c => c.fase !== "chiusura" && giorniFermaCM(c) >= SOGLIA);
  const preventiviDaFare = cantieri.filter(c => c.fase === "preventivo");
  const misureInAttesa = cantieri.filter(c => c.fase === "misure" && getVaniAttivi(c).some(v => Object.keys(v.misure || {}).length < 4));
  const todayEvents = events.filter(e => e.date === todayISO).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  const taskUrgenti = tasks.filter(t => !t.done && t.priority === "alta");
  const problemiAperti = problemi.filter(p => p.stato !== "risolto");

  // ─── ADESSO: single most urgent action ───
  const getAdesso = () => {
    if (problemiAperti.length > 0) {
      const p = problemiAperti[0];
      return { titolo: "Problema: " + (p.titolo || (p.descrizione || "").slice(0, 40) || "da risolvere"), sotto: problemiAperti.length + " problemi aperti", color: T.red, icon: "alertCircle", action: () => setShowProblemiView(true) };
    }
    if (ferme.length > 0) {
      const c = ferme[0];
      return { titolo: "Sblocca " + c.cliente, sotto: c.code + " · ferma da " + giorniFermaCM(c) + " giorni", color: T.red, icon: "alert", action: () => { setSelectedCM(c); setTab("commesse"); } };
    }
    if (preventiviDaFare.length > 0) {
      const c = preventiviDaFare[0];
      return { titolo: "Invia preventivo a " + c.cliente, sotto: c.code + " · " + preventiviDaFare.length + " in attesa", color: "#af52de", icon: "clipboard", action: () => { setSelectedCM(c); setTab("commesse"); } };
    }
    if (misureInAttesa.length > 0) {
      const c = misureInAttesa[0];
      const tot = getVaniAttivi(c).length;
      const ok = getVaniAttivi(c).filter(v => Object.keys(v.misure || {}).length >= 4).length;
      return { titolo: "Completa misure " + c.cliente, sotto: ok + "/" + tot + " vani misurati", color: "#E8A020", icon: "ruler", action: () => { setSelectedCM(c); setTab("commesse"); } };
    }
    if (taskUrgenti.length > 0) {
      const t = taskUrgenti[0];
      return { titolo: t.text, sotto: t.meta || "Priorità alta", color: T.red, icon: "checkCircle", action: () => setTab("agenda") };
    }
    if (todayEvents.length > 0) {
      const e = todayEvents[0];
      return { titolo: e.text, sotto: (e.time || "—") + " · " + (e.persona || ""), color: e.color || T.acc, icon: "mapPin", action: () => setSelectedEvent(e) };
    }
    return null;
  };
  const adesso = getAdesso();

  // ─── PIPELINE counts ───
  const pipelineFasi = (PIPELINE || []).filter(f => f.attiva);
  const faseCounts = {};
  pipelineFasi.forEach(f => { faseCounts[f.id] = cantieri.filter(c => c.fase === f.id).length; });
  const totAttive = cantieri.filter(c => c.fase !== "chiusura").length;

  // ─── Financial summary ───
  const cmConf = cantieri.filter(c => c.confermato);
  const totPrev = cantieri.filter(c => c.euro && c.fase !== "chiusura").reduce((s, c) => s + (parseFloat(c.euro) || 0), 0);
  const totConf = cmConf.reduce((s, c) => s + (parseFloat(c.euro) || 0), 0);
  const fatAtt = fattureDB.filter(f => !f.pagata);
  const totFat = fatAtt.reduce((s, f) => s + (f.importo || 0), 0);
  const ordAtt = ordiniFornDB.filter(o => o.stato !== "consegnato");
  const montAtt = montaggiDB.filter(m => m.stato !== "completato");

  // ─── Day navigation ───
  const dayNames = ["L", "M", "M", "G", "V", "S", "D"];
  const weekDays = [];
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  for (let i = 0; i < 7; i++) { const d = new Date(monday); d.setDate(monday.getDate() + i); weekDays.push(d); }

  const getDateForOffset = (off) => { const d = new Date(today); d.setDate(d.getDate() + off); return d; };
  const dayDate = getDateForOffset(dayOffset);
  const dayISO = dayDate.toISOString().split("T")[0];
  const dayEvents = events.filter(e => e.date === dayISO).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  const dayLabel = dayOffset === 0 ? "Oggi" : dayOffset === -1 ? "Ieri" : dayOffset === 1 ? "Domani" : dayDate.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
  const isPast = dayOffset < 0;

  // ═══ RENDER ═══
  return (
    <div style={{ paddingBottom: 80 }}>

      {/* ─── TOP BRAND BAR: [M] MASTRO ERP ... meteo ─── */}
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: T.acc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: FM, letterSpacing: "-0.04em" }}>M</div>
          <div><span style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>MASTRO</span> <span style={{ fontSize: 15, fontWeight: 400, color: T.sub }}>ERP</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <I d={ICO.sun} s={18} c="#F5A623" />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: FM, lineHeight: 1 }}>12°</div>
            <div style={{ fontSize: 9, color: T.sub, fontWeight: 600 }}>Cosenza</div>
          </div>
        </div>
      </div>

      {/* ─── HEADER SALUTO ─── */}
      <div style={{ padding: "12px 20px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div suppressHydrationWarning style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "-0.03em" }}>{saluto}</div>
            <div suppressHydrationWarning style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>
              {today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
          <div onClick={() => setHomeEditMode(e => !e)}
            style={{ padding: "5px 10px", borderRadius: 6, background: homeEditMode ? T.acc : T.bg, border: "1px solid " + (homeEditMode ? T.acc : T.bdr), fontSize: 10, fontWeight: 700, color: homeEditMode ? "#fff" : T.sub, cursor: "pointer" }}>
            {homeEditMode ? "✓ Fine" : "⋮"}
          </div>
        </div>
      </div>

      {/* ─── Trial / Free banner ─── */}
      {activePlan === "trial" && (
        <div onClick={() => { setSettingsTab("piano"); setTab("settings"); }}
          style={{ margin: "12px 20px 0", padding: "10px 14px", borderRadius: 10, background: T.acc + "08", border: "1px solid " + T.acc + "15", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span suppressHydrationWarning style={{ fontSize: 12, fontWeight: 600, color: T.acc }}>Trial · {trialDaysLeft} giorni rimasti</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.acc }}>Piani →</span>
        </div>
      )}
      {activePlan === "free" && (
        <div onClick={() => { setSettingsTab("piano"); setTab("settings"); }}
          style={{ margin: "12px 20px 0", padding: "10px 14px", borderRadius: 10, background: T.red + "06", border: "1px solid " + T.red + "15", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.red }}>Trial scaduto</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.acc }}>Attiva →</span>
        </div>
      )}


      {/* ═══ ① ADESSO — La cosa più urgente ═══ */}
      {adesso ? (
        <div onClick={adesso.action}
          style={{ margin: "16px 20px 0", padding: "16px 18px", borderRadius: 14, background: T.card, border: "1.5px solid " + adesso.color + "20", cursor: "pointer", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: adesso.color, borderRadius: "14px 0 0 14px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 8 }}>
            <I d={ICO[adesso.icon] || ICO.alert} s={22} c={adesso.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: adesso.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Adesso</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{adesso.titolo}</div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>{adesso.sotto}</div>
            </div>
            <span style={{ fontSize: 14, color: T.sub }}>›</span>
          </div>
        </div>
      ) : (
        <div style={{ margin: "16px 20px 0", padding: "20px 18px", borderRadius: 14, background: T.card, border: "1px solid " + T.bdr, textAlign: "center" }}>
          <div style={{ marginBottom: 6 }}><I d={ICO.checkCircle} s={22} c="#1A9E73" /></div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Tutto in ordine</div>
          <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>Nessuna azione urgente</div>
        </div>
      )}


      {/* ═══ ② OGGI — Settimana + eventi ═══ */}
      <div style={{ margin: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Oggi</span>
          <span onClick={() => setTab("agenda")} style={{ fontSize: 11, fontWeight: 600, color: T.acc, cursor: "pointer" }}>Agenda →</span>
        </div>

        {/* Week strip */}
        <div style={{ display: "flex", gap: 0, marginBottom: 10 }}>
          {weekDays.map((d, i) => {
            const dISO = d.toISOString().split("T")[0];
            const isToday = dISO === todayISO;
            const isSel = dISO === dayISO;
            const hasEvt = events.some(e => e.date === dISO);
            return (
              <div key={i} onClick={() => setDayOffset(Math.round((d.getTime() - today.getTime()) / 86400000))}
                style={{ flex: 1, textAlign: "center", cursor: "pointer", padding: "6px 0", borderRadius: 10, background: isSel && !isToday ? T.card : "transparent", border: isSel && !isToday ? "1px solid " + T.bdr : "1px solid transparent" }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: i >= 5 ? T.acc : T.sub, letterSpacing: "0.04em" }}>{dayNames[i]}</div>
                <div suppressHydrationWarning style={{
                  width: 26, height: 26, borderRadius: "50%", margin: "3px auto 0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: isToday ? 800 : 500, fontFamily: FM,
                  background: isToday ? T.text : "transparent", color: isToday ? "#fff" : T.text,
                }}>{d.getDate()}</div>
                {hasEvt && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.acc, margin: "3px auto 0" }} />}
              </div>
            );
          })}
        </div>

        {dayOffset !== 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{dayLabel}</span>
            <span onClick={() => setDayOffset(0)} style={{ fontSize: 11, color: T.acc, fontWeight: 600, cursor: "pointer" }}>Oggi</span>
          </div>
        )}

        {dayEvents.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center", background: T.card, borderRadius: 12, border: "1px solid " + T.bdr }}>
            <div style={{ fontSize: 12, color: T.sub }}>{isPast ? "Nessuna attività" : "Giornata libera"}</div>
          </div>
        ) : (
          <div style={{ borderRadius: 12, border: "1px solid " + T.bdr, overflow: "hidden", background: T.card }}>
            {dayEvents.slice(0, 5).map((ev, i) => (
              <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", borderBottom: i < Math.min(dayEvents.length, 5) - 1 ? "1px solid " + T.bdr : "none", opacity: isPast ? 0.5 : 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.sub, fontFamily: FM, width: 36, flexShrink: 0 }}>{ev.time || "—"}</div>
                <div style={{ width: 3, height: 24, borderRadius: 2, background: ev.color || T.acc, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.text}</div>
                  {(ev.persona || ev.addr) && <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{ev.persona}{ev.addr ? " · " + ev.addr : ""}</div>}
                </div>
              </div>
            ))}
            {dayEvents.length > 5 && (
              <div onClick={() => setTab("agenda")} style={{ padding: "8px 14px", fontSize: 11, fontWeight: 600, color: T.acc, textAlign: "center", cursor: "pointer", background: T.bg }}>
                +{dayEvents.length - 5} altri →
              </div>
            )}
          </div>
        )}
      </div>


      {/* ═══ ③ PIPELINE — Barra visuale fasi ═══ */}
      <div style={{ margin: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pipeline</span>
          <span onClick={() => setTab("commesse")} style={{ fontSize: 11, fontWeight: 600, color: T.acc, cursor: "pointer" }}>{totAttive} attive →</span>
        </div>

        {totAttive > 0 ? (
          <>
            <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", background: T.bdr }}>
              {pipelineFasi.filter(f => faseCounts[f.id] > 0).map(f => {
                const pct = Math.max(8, (faseCounts[f.id] / totAttive) * 100);
                return (
                  <div key={f.id} onClick={() => { setFilterFase(f.id); setTab("commesse"); }}
                    title={f.nome + ": " + faseCounts[f.id]}
                    style={{ width: pct + "%", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "opacity 0.15s", minWidth: 24 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: FM, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{faseCounts[f.id]}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {pipelineFasi.filter(f => faseCounts[f.id] > 0).map(f => (
                <div key={f.id} onClick={() => { setFilterFase(f.id); setTab("commesse"); }}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: f.color + "10", cursor: "pointer" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.color }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.text }}>{f.nome}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: f.color, fontFamily: FM }}>{faseCounts[f.id]}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: "16px", textAlign: "center", background: T.card, borderRadius: 12, border: "1px solid " + T.bdr }}>
            <div style={{ fontSize: 12, color: T.sub }}>Nessuna commessa attiva</div>
          </div>
        )}
      </div>


      {/* ═══ NUMERI — Una riga ═══ */}
      <div style={{ margin: "20px 20px 0", display: "flex", gap: 6 }}>
        <div onClick={() => setTab("commesse")}
          style={{ flex: 1, background: T.card, borderRadius: 10, border: "1px solid " + T.bdr, padding: "10px 10px", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Preventivato</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.text, fontFamily: FM, marginTop: 3 }}>€{totPrev > 999 ? Math.round(totPrev / 1000) + "k" : totPrev.toLocaleString("it-IT")}</div>
        </div>
        <div onClick={() => { setFilterFase("conferma"); setTab("commesse"); }}
          style={{ flex: 1, background: T.card, borderRadius: 10, border: "1px solid " + T.bdr, padding: "10px 10px", cursor: "pointer", textAlign: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Confermato</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.grn, fontFamily: FM, marginTop: 3 }}>€{totConf > 999 ? Math.round(totConf / 1000) + "k" : totConf.toLocaleString("it-IT")}</div>
        </div>
        {fatAtt.length > 0 && (
          <div onClick={() => setShowContabilita(true)}
            style={{ flex: 1, background: T.card, borderRadius: 10, border: "1px solid " + T.bdr, padding: "10px 10px", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Da incassare</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.red, fontFamily: FM, marginTop: 3 }}>€{totFat > 999 ? Math.round(totFat / 1000) + "k" : totFat.toLocaleString("it-IT")}</div>
          </div>
        )}
      </div>

      {/* ─── Quick links ─── */}
      {(ordAtt.length > 0 || montAtt.length > 0) && (
        <div style={{ margin: "12px 20px 0", display: "flex", gap: 6 }}>
          {ordAtt.length > 0 && (
            <div onClick={() => setTab("commesse")}
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: T.card, border: "1px solid " + T.bdr, cursor: "pointer" }}>
              <I d={ICO.package} s={16} c={T.acc} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: FM }}>{ordAtt.length}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: T.sub }}>Ordini attivi</div>
              </div>
            </div>
          )}
          {montAtt.length > 0 && (
            <div onClick={() => setTab("commesse")}
              style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: T.card, border: "1px solid " + T.bdr, cursor: "pointer" }}>
              <I d={ICO.wrench} s={16} c={T.acc} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: FM }}>{montAtt.length}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: T.sub }}>Montaggi</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}
