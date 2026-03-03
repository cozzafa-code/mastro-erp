"use client";
// @ts-nocheck
import { useState } from "react";

const EVENT_TYPES = {
  sopralluogo: { label: "Sopralluogo", color: "#007aff", icon: "📐" },
  posa:        { label: "Posa",        color: "#34c759", icon: "🔧" },
  consegna:    { label: "Consegna",    color: "#ff9500", icon: "🚚" },
  misura:      { label: "Misura",      color: "#af52de", icon: "📏" },
  chiamata:    { label: "Chiamata",    color: "#5ac8fa", icon: "📞" },
  appuntamento:{ label: "Appuntamento",color: "#007aff", icon: "📅" },
  task:        { label: "Task",        color: "#ff9500", icon: "✅" },
  altro:       { label: "Altro",       color: "#8e8e93", icon: "📌" },
};

const DAYS_IT = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
const DAYS_FULL = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

export default function MastroAgendaWidget({ events = [], cantieri = [], T, onEventClick, onAddEvent }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const [selDate, setSelDate] = useState(new Date(today));
  const [weekOffset, setWeekOffset] = useState(0);

  const dateStr = (d) => {
    const dd = new Date(d);
    return dd.getFullYear() + "-" + String(dd.getMonth()+1).padStart(2,"0") + "-" + String(dd.getDate()).padStart(2,"0");
  };

  const todayStr = dateStr(today);
  const selStr = dateStr(selDate);
  const isToday = selStr === todayStr;

  // Genera 7 giorni partendo da lunedì della settimana corrente + offset
  const getWeekDays = () => {
    const base = new Date(today);
    const day = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7);
    return Array.from({length:7}, (_,i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays();
  const eventsOn = (d) => events.filter(e => e.date === dateStr(d));
  const selEvents = eventsOn(selDate).sort((a,b) => (a.time||"99:99").localeCompare(b.time||"99:99"));

  // Prossimi eventi (oggi + futuro)
  const upcoming = events
    .filter(e => e.date >= todayStr)
    .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time))
    .slice(0,5);

  // Commesse con lavori oggi
  const todayCommesse = [...new Set(eventsOn(today).map(e => e.cm).filter(Boolean))];

  const getTypeInfo = (ev) => EVENT_TYPES[ev.tipo] || EVENT_TYPES[ev.type] || EVENT_TYPES.altro;

  return (
    <div style={{ background: T.card, borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>

      {/* HEADER */}
      <div style={{ padding: "14px 16px 10px", background: "linear-gradient(135deg, " + T.acc + "18, " + T.acc + "08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
              {isToday ? "📅 Oggi" : DAYS_FULL[selDate.getDay()]}
            </div>
            <div style={{ fontSize: 12, color: T.sub }}>
              {selDate.toLocaleDateString("it-IT", {day:"numeric", month:"long", year:"numeric"})}
              {selEvents.length > 0 && <span style={{ marginLeft: 8, color: T.acc, fontWeight: 700 }}>{selEvents.length} {selEvents.length === 1 ? "impegno" : "impegni"}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setWeekOffset(w => w-1)} style={{ width:30, height:30, borderRadius:8, border:"none", background:T.bg, color:T.text, fontSize:14, cursor:"pointer" }}>‹</button>
            {!isToday && <button onClick={() => { setSelDate(new Date(today)); setWeekOffset(0); }} style={{ padding:"0 8px", height:30, borderRadius:8, border:"none", background:T.acc+"20", color:T.acc, fontSize:11, fontWeight:700, cursor:"pointer" }}>Oggi</button>}
            <button onClick={() => setWeekOffset(w => w+1)} style={{ width:30, height:30, borderRadius:8, border:"none", background:T.bg, color:T.text, fontSize:14, cursor:"pointer" }}>›</button>
          </div>
        </div>

        {/* WEEK STRIP */}
        <div style={{ display:"flex", gap:4 }}>
          {weekDays.map((d, i) => {
            const dStr = dateStr(d);
            const isT = dStr === todayStr;
            const isSel = dStr === selStr;
            const dayEvs = eventsOn(d);
            const isPast = d < today && !isT;
            return (
              <div key={i} onClick={() => setSelDate(new Date(d))}
                style={{ flex:1, textAlign:"center", padding:"6px 2px", borderRadius:10, cursor:"pointer",
                  background: isSel ? T.acc : isT ? T.acc+"25" : "transparent",
                  border: isT && !isSel ? "1.5px solid " + T.acc : "1.5px solid transparent",
                  opacity: isPast ? 0.5 : 1 }}>
                <div style={{ fontSize:9, fontWeight:700, color: isSel ? "#fff" : T.sub, textTransform:"uppercase" }}>
                  {DAYS_IT[d.getDay()]}
                </div>
                <div style={{ fontSize:14, fontWeight:800, color: isSel ? "#fff" : isT ? T.acc : T.text, margin:"2px 0" }}>
                  {d.getDate()}
                </div>
                <div style={{ display:"flex", gap:2, justifyContent:"center", minHeight:6 }}>
                  {dayEvs.slice(0,3).map((ev,j) => {
                    const ti = getTypeInfo(ev);
                    return <div key={j} style={{ width:5, height:5, borderRadius:"50%", background: isSel ? "rgba(255,255,255,0.7)" : ti.color }} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EVENTI DEL GIORNO */}
      <div style={{ padding: "12px 16px" }}>
        {selEvents.length === 0 ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🗓</div>
            <div style={{ fontSize:13, color:T.sub, marginBottom:12 }}>Nessun impegno {isToday ? "oggi" : "questo giorno"}</div>
            <button onClick={() => onAddEvent?.(selStr)}
              style={{ padding:"8px 20px", borderRadius:20, border:"none", background:T.acc, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              + Aggiungi evento
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {selEvents.map(ev => {
              const ti = getTypeInfo(ev);
              const cm = cantieri.find(c => c.code === ev.cm);
              const now = new Date();
              const isNow = ev.time && (() => {
                const [h,m] = ev.time.split(":").map(Number);
                const evTime = new Date(selDate); evTime.setHours(h,m,0,0);
                const endTime = new Date(evTime); endTime.setHours(h+1,m,0,0);
                return isToday && now >= evTime && now <= endTime;
              })();
              return (
                <div key={ev.id} onClick={() => onEventClick?.(ev)}
                  style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"10px 12px", borderRadius:12,
                    background: isNow ? ti.color+"15" : T.bg,
                    border: isNow ? "1.5px solid "+ti.color : "1.5px solid transparent",
                    cursor:"pointer" }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:ti.color+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                    {ti.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{ev.text}</span>
                      {isNow && <span style={{ fontSize:9, fontWeight:800, color:"#fff", background:ti.color, borderRadius:4, padding:"1px 6px" }}>ORA</span>}
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:3, flexWrap:"wrap", alignItems:"center" }}>
                      {ev.time && <span style={{ fontSize:11, fontWeight:700, color:ti.color }}>🕐 {ev.time}{ev.timeEnd?" → "+ev.timeEnd:""}</span>}
                      {ev.cm && <span style={{ fontSize:11, fontWeight:600, color:T.acc, background:T.acc+"15", borderRadius:6, padding:"1px 6px" }}>{ev.cm}</span>}
                      {ev.persona && <span style={{ fontSize:11, color:T.sub }}>👤 {ev.persona}</span>}
                    </div>
                    {cm && <div style={{ fontSize:10, color:T.sub, marginTop:2 }}>📍 {cm.indirizzo || cm.cliente}</div>}
                  </div>
                </div>
              );
            })}
            <button onClick={() => onAddEvent?.(selStr)}
              style={{ padding:"8px", borderRadius:10, border:"1.5px dashed "+T.acc, background:"transparent", color:T.acc, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              + Aggiungi evento
            </button>
          </div>
        )}
      </div>

      {/* PROSSIMI (solo se guardo oggi) */}
      {isToday && upcoming.filter(e => e.date > todayStr).length > 0 && (
        <div style={{ borderTop:"1px solid "+T.bdr, padding:"10px 16px 14px" }}>
          <div style={{ fontSize:11, fontWeight:800, color:T.sub, textTransform:"uppercase", marginBottom:8 }}>Prossimi</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {upcoming.filter(e => e.date > todayStr).slice(0,3).map(ev => {
              const ti = getTypeInfo(ev);
              const evDate = new Date(ev.date + "T00:00:00");
              const diff = Math.round((evDate - today) / 86400000);
              return (
                <div key={ev.id} onClick={() => { setSelDate(evDate); onEventClick?.(ev); }}
                  style={{ display:"flex", gap:8, alignItems:"center", cursor:"pointer" }}>
                  <div style={{ width:4, height:32, borderRadius:2, background:ti.color, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{ev.text}</div>
                    <div style={{ fontSize:10, color:T.sub }}>{diff === 1 ? "Domani" : "Fra "+diff+" giorni"} {ev.time ? "· "+ev.time : ""}</div>
                  </div>
                  {ev.cm && <span style={{ fontSize:10, fontWeight:600, color:T.acc, background:T.acc+"15", borderRadius:6, padding:"2px 6px" }}>{ev.cm}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
