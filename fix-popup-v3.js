const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'MastroERP.tsx');
let code = fs.readFileSync(file, 'utf8');
const original = code;

console.log('🔧 Fix Popup v3 — Chirurgico su stringhe esatte\n');

// ============================================================
// STEP 1: Rimuovi il PRIMO popup duplicato
// Il primo popup finisce con })()}  subito prima del commento
// {/* EVENT POPUP OVERLAY — Google Calendar style */}
// ============================================================

const marker = '{/* EVENT POPUP OVERLAY — Google Calendar style */}';
const markerIdx = code.indexOf(marker);

if (markerIdx === -1) {
  console.log('❌ Commento popup non trovato');
  process.exit(1);
}

// Cerco dove inizia il primo popup — cerco indietro dal marker
// Il primo popup inizia con: {selectedEvent && (tab === "agenda" || tab === "home") && (() => {
const searchBefore = code.substring(0, markerIdx);
const firstPopupStart = searchBefore.lastIndexOf('{selectedEvent && (tab === "agenda" || tab === "home") && (() => {');

if (firstPopupStart > -1) {
  // Il primo popup va da firstPopupStart fino a })()}  prima del marker
  const betweenCode = code.substring(firstPopupStart, markerIdx);
  // Trova l'ultimo })()}  in questo blocco
  const lastIIFE = betweenCode.lastIndexOf('})()}');
  if (lastIIFE > -1) {
    const firstPopupEnd = firstPopupStart + lastIIFE + 5; // +5 per "})()}"
    const removed = code.substring(firstPopupStart, firstPopupEnd);
    code = code.substring(0, firstPopupStart) + code.substring(firstPopupEnd);
    console.log(`✅ Rimosso primo popup duplicato (${removed.length} chars, da pos ${firstPopupStart})`);
  }
} else {
  console.log('ℹ️  Primo popup non trovato — potrebbe essercene solo uno');
}

// ============================================================
// STEP 2: Sostituisci titolo statico con input editabile
// DA: <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{ev.text}</div>
// A:  <input ...>
// ============================================================

const staticTitle = '<div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{ev.text}</div>';
const editableTitle = '<input defaultValue={ev.text} onBlur={(e) => { const val = e.target.value.trim(); if (val && val !== ev.text) { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, text: val } : x)); setSelectedEvent({ ...ev, text: val }); } }} style={{ fontSize: 18, fontWeight: 800, color: T.text, border: "none", background: "transparent", width: "100%", outline: "none", padding: 0, fontFamily: "inherit" }} />';

if (code.includes(staticTitle)) {
  code = code.replace(staticTitle, editableTitle);
  console.log('✅ Titolo → input editabile (salva on blur)');
} else {
  console.log('⚠️  Titolo statico non trovato (potrebbe essere già editabile)');
}

// ============================================================
// STEP 3: Sostituisci data/ora statici con date+time picker
// DA: <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
//       {new Date(ev.date)...}
//       {ev.time && ` alle ${ev.time}`}
//     </div>
// A:  <div con input date + input time>
// ============================================================

const staticDate = `<div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
                      {new Date(ev.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                      {ev.time && \` alle \${ev.time}\`}
                    </div>`;

const editableDate = `<div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                      <input type="date" defaultValue={ev.date} onChange={(e) => { if (e.target.value) { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, date: e.target.value } : x)); setSelectedEvent({ ...ev, date: e.target.value }); } }} style={{ fontSize: 13, color: T.sub, border: \`1px solid \${T.bdr}\`, borderRadius: 8, padding: "4px 8px", background: T.card, fontFamily: "inherit" }} />
                      <input type="time" defaultValue={ev.time || "09:00"} onChange={(e) => { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, time: e.target.value } : x)); setSelectedEvent({ ...ev, time: e.target.value }); }} style={{ fontSize: 13, color: T.sub, border: \`1px solid \${T.bdr}\`, borderRadius: 8, padding: "4px 8px", background: T.card, fontFamily: "inherit" }} />
                    </div>`;

if (code.includes(staticDate)) {
  code = code.replace(staticDate, editableDate);
  console.log('✅ Data/Ora → date picker + time picker');
} else {
  console.log('⚠️  Data/ora statici non trovati');
}

// ============================================================
// STEP 4: Sostituisci badge tipo statico con select dropdown
// DA: <span style={S.badge(...)}>{ev.tipo}</span>
// A:  <select ...>
// ============================================================

const staticTipo = `<span style={S.badge(ev.tipo==="appuntamento"?T.blueLt:ev.tipo==="task"?T.accLt:T.redLt, ev.tipo==="appuntamento"?T.blue:ev.tipo==="task"?T.acc:T.red)}>{ev.tipo}</span>`;

const editableTipo = `<select defaultValue={ev.tipo || "appuntamento"} onChange={(e) => { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, tipo: e.target.value } : x)); setSelectedEvent({ ...ev, tipo: e.target.value }); }} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: \`1px solid \${T.bdr}\`, background: ev.tipo==="appuntamento"?T.blueLt:ev.tipo==="task"?T.accLt:T.redLt, color: ev.tipo==="appuntamento"?T.blue:ev.tipo==="task"?T.acc:T.red, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    <option value="appuntamento">appuntamento</option>
                    <option value="sopralluogo">sopralluogo</option>
                    <option value="consegna">consegna</option>
                    <option value="montaggio">montaggio</option>
                    <option value="intervento">intervento</option>
                    <option value="preventivo">preventivo</option>
                    <option value="task">task</option>
                  </select>`;

if (code.includes(staticTipo)) {
  code = code.replace(staticTipo, editableTipo);
  console.log('✅ Tipo → select dropdown (7 opzioni)');
} else {
  console.log('⚠️  Badge tipo non trovato');
}

// ============================================================
// SALVA
// ============================================================

if (code !== original) {
  fs.writeFileSync(file, code, 'utf8');
  const lines = code.split('\n').length;
  console.log(`\n✅ File salvato! (${lines} righe)`);
  console.log('\n📋 Popup evento ora ha:');
  console.log('   ✏️  Titolo editabile (click + scrivi, salva on blur)');
  console.log('   📅 Date picker per cambiare giorno');
  console.log('   🕐 Time picker per cambiare ora');
  console.log('   📋 Select per tipo (appuntamento/sopralluogo/consegna/...)');
  console.log('   🗑️ Popup duplicato rimosso');
  console.log('\n🚀 Esegui: npm run dev');
} else {
  console.log('\n⚠️  Nessuna modifica applicata');
}
