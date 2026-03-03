// @ts-nocheck
"use client";
import { useState, useRef } from "react";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00
const DAYS_IT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS_IT = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

const EVENT_TYPES = {
  sopralluogo: { label: "Sopralluogo", color: "#007aff", icon: "📐" },
  posa:        { label: "Posa",        color: "#34c759", icon: "🔧" },
  consegna:    { label: "Consegna",    color: "#ff9500", icon: "🚚" },
  misura:      { label: "Misura",      color: "#af52de", icon: "📏" },
  chiamata:    { label: "Chiamata",    color: "#5ac8fa", icon: "📞" },
  altro:       { label: "Altro",       color: "#8e8e93", icon: "📌" },
};

export default function MastroCalendario({ events = [], cantieri = [], team = [], T, S, onAddEvent, onEditEvent, onDeleteEvent }) {
  const [view, setView] = useState("settimana");
  const [selDate, setSelDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ text: "", date: "", time: "", timeEnd: "", tipo: "sopralluogo", cm: "", persona: "", note: "" });
  const [editingId, setEditingId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const scrollRef = useRef(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const dateStr = (d) => d instanceof Date ? d.toISOString().split("T")[0] : d;

  // --- WEEK ---
  const getWeekStart = (d) => {
    const dd = new Date(d);
    const day = dd.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    dd.setDate(dd.getDate() + diff);
    dd.setHours(0,0,0,0);
    return dd;
  };
  const weekStart = getWeekStart(selDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // --- MONTH ---
  const monthStart = new Date(selDate.getFullYear(), selDate.getMonth(), 1);
  const monthFirstDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const daysInMonth = new Date(selDate.getFullYear(), selDate.getMonth() + 1, 0).getDate();
  const monthCells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(monthStart);
    d.setDate(1 - monthFirstDay + i);
    return d;
  });

  const eventsOn = (d) => events.filter(e => e.date === dateStr(d));
  const todayEvents = eventsOn(today);

  const navDate = (dir) => {
    const d = new Date(selDate);
    if (view === "giorno") d.setDate(d.getDate() + dir);
    else if (view === "settimana") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setSelDate(d);
  };

  const openForm = (date = "", time = "") => {
    setEditingId(null);
    setFormData({ text: "", date: date || todayStr, time, timeEnd: "", tipo: "sopralluogo", cm: "", persona: "", note: "" });
    setShowForm(true);
  };

  const openEdit = (ev) => {
    setEditingId(ev.id);
    setFormData({ text: ev.text || "", date: ev.date || "", time: ev.time || "", timeEnd: ev.timeEnd || "", tipo: ev.tipo || "sopralluogo", cm: ev.cm || "", persona: ev.persona || "", note: ev.note || "" });
    setShowForm(true);
    setSelectedEvent(null);
  };

  const saveEvent = () => {
    if (!formData.text.trim() || !formData.date) return;
    const tipo = EVENT_TYPES[formData.tipo] || EVENT_TYPES.altro;
    const ev = { ...formData, color: tipo.color, id: editingId || Date.now() };
    if (editingId) onEditEvent?.(ev);
    else onAddEvent?.(ev);
    setShowForm(false);
  };

  const getCMColor = (cmCode) => {
    const cm = cantieri.find(c => c.code === cmCode);
    return cm ? "#D08008" : null;
  };

  // --- HEADER TITLE ---
  const headerTitle = () => {
    if (view === "giorno") return selDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
    if (view === "settimana") {
      const end = weekDays[6];
      return weekDays[0].getDate() + " — " + end.getDate() + " " + MONTHS_IT[end.getMonth()] + " " + end.getFullYear();
    }
    return MONTHS_IT[selDate.getMonth()] + " " + selDate.getFullYear();
  };

  // ─── VIEWS ───

  const renderDayView = () => {
    const dayEvs = eventsOn(selDate).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    return (
      <div style={{ flex: 1, overflowY: "auto" }} ref={scrollRef}>
        <div style={{ display: "flex", minHeight: HOURS.length * 64 }}>
          {/* Time column */}
          <div style={{ width: 48, flexShrink: 0 }}>
            {HOURS.map(h => (
              <div key={h} style={{ height: 64, borderBottom: "1px solid " + T.bdr, display: "flex", alignItems: "flex-start", paddingTop: 4, justifyContent: "center" }}>
                <span style={{ fontSize: 10, color: T.sub, fontWeight: 600 }}>{h}:00</span>
              </div>
            ))}
          </div>
          {/* Events column */}
          <div style={{ flex: 1, position: "relative", borderLeft: "1px solid " + T.bdr }}>
            {HOURS.map(h => (
              <div key={h} onClick={() => openForm(dateStr(selDate), h + ":00")}
                style={{ height: 64, borderBottom: "1px solid " + T.bdr + "60", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.accLt}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              />
            ))}
            {dayEvs.filter(e => e.time).map(ev => {
              const [hh, mm] = (ev.time || "7:00").split(":").map(Number);
              const top = ((hh - 7) + (mm / 60)) * 64;
              const tipo = EVENT_TYPES[ev.tipo] || EVENT_TYPES.altro;
              return (
                <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                  style={{ position: "absolute", left: 4, right: 4, top, minHeight: 56, background: tipo.color + "20", border: "1.5px solid " + tipo.color, borderRadius: 10, padding: "6px 10px", cursor: "pointer", zIndex: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tipo.color }}>{tipo.icon} {ev.text}</div>
                  <div style={{ fontSize: 11, color: T.sub }}>{ev.time}{ev.timeEnd ? " → " + ev.timeEnd : ""}</div>
                  {ev.cm && <div style={{ fontSize: 10, fontWeight: 600, color: T.acc, marginTop: 2 }}>📋 {ev.cm}</div>}
                  {ev.persona && <div style={{ fontSize: 10, color: T.sub }}>👤 {ev.persona}</div>}
                </div>
              );
            })}
            {dayEvs.filter(e => !e.time).map((ev, i) => {
              const tipo = EVENT_TYPES[ev.tipo] || EVENT_TYPES.altro;
              return (
                <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                  style={{ position: "absolute", left: 4, right: 4, top: i * 32, height: 28, background: tipo.color + "15", border: "1.5px solid " + tipo.color, borderRadius: 8, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11 }}>{tipo.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: tipo.color, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => (
    <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }} ref={scrollRef}>
      {/* Day headers */}
      <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10, background: T.bg, borderBottom: "2px solid " + T.bdr }}>
        <div style={{ width: 48, flexShrink: 0 }} />
        {weekDays.map((d, i) => {
          const isToday = dateStr(d) === todayStr;
          const dayEvs = eventsOn(d);
          return (
            <div key={i} onClick={() => { setSelDate(d); setView("giorno"); }}
              style={{ flex: 1, textAlign: "center", padding: "8px 4px", cursor: "pointer", borderLeft: "1px solid " + T.bdr, minWidth: 80 }}>
              <div style={{ fontSize: 10, color: T.sub, fontWeight: 600, textTransform: "uppercase" }}>{DAYS_IT[i]}</div>
              <div style={{ width: 30, height: 30, borderRadius: "50%", margin: "4px auto 2px", background: isToday ? T.acc : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: isToday ? "#fff" : T.text }}>{d.getDate()}</span>
              </div>
              {dayEvs.length > 0 && (
                <div style={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                  {dayEvs.slice(0, 3).map((ev, j) => {
                    const tipo = EVENT_TYPES[ev.tipo] || EVENT_TYPES.altro;
                    return <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: tipo.color }} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Grid */}
      <div style={{ display: "flex" }}>
        <div style={{ width: 48, flexShrink: 0 }}>
          {HOURS.map(h => (
            <div key={h} style={{ height: 56, borderBottom: "1px solid " + T.bdr + "40", display: "flex", alignItems: "flex-start", paddingTop: 4, justifyContent: "center" }}>
              <span style={{ fontSize: 10, color: T.sub, fontWeight: 600 }}>{h}:00</span>
            </div>
          ))}
        </div>
        {weekDays.map((d, di) => {
          const dayEvs = eventsOn(d).filter(e => e.time);
          return (
            <div key={di} style={{ flex: 1, position: "relative", borderLeft: "1px solid " + T.bdr + "60", minWidth: 80 }}>
              {HOURS.map(h => (
                <div key={h} onClick={() => { openForm(dateStr(d), h + ":00"); }}
                  style={{ height: 56, borderBottom: "1px solid " + T.bdr + "30", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.accLt}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                />
              ))}
              {dayEvs.map((ev, ei) => {
                const [hh, mm] = (ev.time || "7:00").split(":").map(Number);
                const top = ((hh - 7) + (mm / 60)) * 56;
                const tipo = EVENT_TYPES[ev.tipo] || EVENT_TYPES.altro;
                return (
                  <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                    style={{ position: "absolute", left: 2, right: 2, top, minHeight: 44, background: tipo.color + "20", border: "1.5px solid " + tipo.color, borderRadius: 8, padding: "4px 6px", cursor: "pointer", zIndex: 2, overflow: "hidden" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: tipo.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tipo.icon} {ev.text}</div>
                    <div style={{ fontSize: 9, color: T.sub }}>{ev.time}</div>
                    {ev.cm && <div style={{ fontSize: 9, color: T.acc, fontWeight: 600 }}>{ev.cm}</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Day names */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid " + T.bdr }}>
        {DAYS_IT.map(d => (
          <div key={d} style={{ textAlign: "center", padding: "8px 0", fontSize: 11, fontWeight: 700, color: T.sub, textTransform: "uppercase" }}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: "repeat(6, 1fr)", overflow: "hidden" }}>
        {monthCells.map((d, i) => {
          const isCurrentMonth = d.getMonth() === selDate.getMonth();
          const isToday = dateStr(d) === todayStr;
          const isSelected = dateStr(d) === dateStr(selDate);
          const dayEvs = eventsOn(d);
          return (
            <div key={i} onClick={() => { setSelDate(d); if (!isCurrentMonth) {} }}
              style={{ border: "1px solid " + T.bdr + "50", padding: "4px", cursor: "pointer", background: isSelected && !isToday ? T.accLt : "transparent", overflow: "hidden", minHeight: 70 }}
              onMouseEnter={e => !isToday && (e.currentTarget.style.background = T.bg2)}
              onMouseLeave={e => !isToday && (e.currentTarget.style.background = isSelected ? T.accLt : "transparent")}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: isToday ? T.acc : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "#fff" : isCurrentMonth ? T.text : T.sub }}>{d.getDate()}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {dayEvs.slice(0, 3).map((ev, j) => {
                  const tipo = EVENT_TYPES[ev.tipo] || EVENT_TYPES.altro;
                  return (
                    <div key={j} onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                      style={{ background: tipo.color, borderRadius: 3, padding: "1px 4px", fontSize: 9, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tipo.icon} {ev.text}
                    </div>
                  );
                })}
                {dayEvs.length > 3 && <div style={{ fontSize: 9, color: T.sub, paddingLeft: 2 }}>+{dayEvs.length - 3} altri</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── EVENT DETAIL POPUP ───
  const renderEventDetail = () => {
    if (!selectedEvent) return null;
    const tipo = EVENT_TYPES[selectedEvent.tipo] || EVENT_TYPES.altro;
    const cm = cantieri.find(c => c.code === selectedEvent.cm);
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        onClick={() => setSelectedEvent(null)}>
        <div onClick={e => e.stopPropagation()}
          style={{ background: T.card, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: 24, paddingBottom: 36 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: tipo.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              {tipo.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>{selectedEvent.text}</div>
              <div style={{ fontSize: 12, color: tipo.color, fontWeight: 600, marginTop: 2 }}>{tipo.label}</div>
            </div>
            <div onClick={() => setSelectedEvent(null)} style={{ fontSize: 20, color: T.sub, cursor: "pointer", padding: 4 }}>✕</div>
          </div>
          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.bg, borderRadius: 12 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{selectedEvent.date}</div>
                {selectedEvent.time && <div style={{ fontSize: 11, color: T.sub }}>{selectedEvent.time}{selectedEvent.timeEnd ? " → " + selectedEvent.timeEnd : ""}</div>}
              </div>
            </div>
            {selectedEvent.cm && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.bg, borderRadius: 12 }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.acc }}>{selectedEvent.cm}</div>
                  {cm && <div style={{ fontSize: 11, color: T.sub }}>{cm.cliente} · {cm.indirizzo}</div>}
                </div>
              </div>
            )}
            {selectedEvent.persona && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.bg, borderRadius: 12 }}>
                <span style={{ fontSize: 18 }}>👤</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{selectedEvent.persona}</div>
              </div>
            )}
            {selectedEvent.note && (
              <div style={{ padding: "10px 14px", background: T.bg, borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: T.sub, marginBottom: 4 }}>NOTE</div>
                <div style={{ fontSize: 13, color: T.text }}>{selectedEvent.note}</div>
              </div>
            )}
          </div>
          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={() => openEdit(selectedEvent)}
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: T.acc, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              ✏️ Modifica
            </button>
            <button onClick={() => { onDeleteEvent?.(selectedEvent.id); setSelectedEvent(null); }}
              style={{ width: 48, height: 48, borderRadius: 12, border: "none", background: "#ff3b3020", color: "#ff3b30", fontWeight: 700, fontSize: 18, cursor: "pointer" }}>
              🗑
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── ADD/EDIT FORM ───
  const renderForm = () => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={() => setShowForm(false)}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: T.card, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, padding: 24, paddingBottom: 36, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>{editingId ? "✏️ Modifica evento" : "➕ Nuovo evento"}</div>
        {/* Tipo */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 8, textTransform: "uppercase" }}>Tipo</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(EVENT_TYPES).map(([key, val]) => (
              <div key={key} onClick={() => setFormData(f => ({ ...f, tipo: key }))}
                style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid " + (formData.tipo === key ? val.color : T.bdr), background: formData.tipo === key ? val.color + "20" : "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: formData.tipo === key ? val.color : T.sub, display: "flex", alignItems: "center", gap: 4 }}>
                {val.icon} {val.label}
              </div>
            ))}
          </div>
        </div>
        {/* Titolo */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Titolo</div>
          <input style={{ ...S.input, fontSize: 15 }} placeholder="es. Sopralluogo Rossi..." value={formData.text} onChange={e => setFormData(f => ({ ...f, text: e.target.value }))} autoFocus />
        </div>
        {/* Data + Orario */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1.5 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Data</div>
            <input type="date" style={S.input} value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Dalle</div>
            <input type="time" style={S.input} value={formData.time} onChange={e => setFormData(f => ({ ...f, time: e.target.value }))} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Alle</div>
            <input type="time" style={S.input} value={formData.timeEnd} onChange={e => setFormData(f => ({ ...f, timeEnd: e.target.value }))} />
          </div>
        </div>
        {/* Commessa */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Commessa</div>
          <select style={S.select} value={formData.cm} onChange={e => setFormData(f => ({ ...f, cm: e.target.value }))}>
            <option value="">— Nessuna —</option>
            {cantieri.map(c => <option key={c.id} value={c.code}>{c.code} · {c.cliente}</option>)}
          </select>
        </div>
        {/* Persona */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Assegna a</div>
          <select style={S.select} value={formData.persona} onChange={e => setFormData(f => ({ ...f, persona: e.target.value }))}>
            <option value="">— Nessuno —</option>
            {team.map(m => <option key={m.id} value={m.nome}>{m.nome} — {m.ruolo}</option>)}
          </select>
        </div>
        {/* Note */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 6, textTransform: "uppercase" }}>Note</div>
          <textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }} placeholder="Note aggiuntive..." value={formData.note} onChange={e => setFormData(f => ({ ...f, note: e.target.value }))} />
        </div>
        <button onClick={saveEvent}
          style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: formData.text.trim() ? T.acc : "#ccc", color: "#fff", fontWeight: 800, fontSize: 15, cursor: formData.text.trim() ? "pointer" : "not-allowed" }}>
          {editingId ? "Salva modifiche" : "Crea evento"}
        </button>
      </div>
    </div>
  );

  // ─── TODAY STRIP ───
  const renderTodayStrip = () => {
    if (todayEvents.length === 0) return null;
    return (
      <div style={{ padding: "8px 12px", background: T.acc + "15", borderBottom: "1px solid " + T.acc + "30", display: "flex", gap: 8, overflowX: "auto", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: T.acc, flexShrink: 0 }}>OGGI</span>
        {todayEvents.map(ev => {
          const tipo = EVENT_TYPES[ev.tipo] || EVENT_TYPES.altro;
          return (
            <div key={ev.id} onClick={() => setSelectedEvent(ev)}
              style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 20, background: tipo.color, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12 }}>{tipo.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{ev.text}</span>
              {ev.time && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{ev.time}</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg, overflow: "hidden" }}>
      {/* HEADER */}
      <div style={{ padding: "12px 16px 8px", background: T.bg, borderBottom: "1px solid " + T.bdr }}>
        {/* Nav + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <button onClick={() => navDate(-1)} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: T.card, color: T.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{headerTitle()}</div>
          </div>
          <button onClick={() => navDate(1)} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: T.card, color: T.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          <button onClick={() => { setSelDate(new Date()); }} style={{ padding: "6px 12px", borderRadius: 10, border: "none", background: T.acc + "20", color: T.acc, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Oggi</button>
        </div>
        {/* View switcher */}
        <div style={{ display: "flex", gap: 4, background: T.card, borderRadius: 12, padding: 3 }}>
          {[["giorno","Giorno"],["settimana","Settimana"],["mese","Mese"]].map(([v, l]) => (
            <div key={v} onClick={() => setView(v)}
              style={{ flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: 10, background: view === v ? T.acc : "transparent", cursor: "pointer", fontSize: 12, fontWeight: 700, color: view === v ? "#fff" : T.sub, transition: "all 0.2s" }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* TODAY STRIP */}
      {renderTodayStrip()}

      {/* CONTENT */}
      {view === "giorno" && renderDayView()}
      {view === "settimana" && renderWeekView()}
      {view === "mese" && renderMonthView()}

      {/* FAB */}
      <button onClick={() => openForm(dateStr(selDate))}
        style={{ position: "fixed", bottom: 80, right: 16, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, " + T.acc + ", #b86a00)", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", boxShadow: "0 4px 20px rgba(208,128,8,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
        +
      </button>

      {/* MODALS */}
      {showForm && renderForm()}
      {selectedEvent && renderEventDetail()}
    </div>
  );
}
