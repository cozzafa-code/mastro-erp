// fix-buttons-safe.js — SAFE: only insert lines, no regex on existing code
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// STEP 1: Find the selectedEvent detail button row (with deleteEvent + selectedEvent.id)
// and add action buttons AFTER that row's closing </div>
let inserted1 = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('deleteEvent(selectedEvent.id)')) {
    // Found the Elimina button in selectedEvent detail
    // Find the next </div> that closes the button row
    for (let j = i + 1; j < i + 5; j++) {
      if (lines[j].trim() === '</div>') {
        // Insert action buttons after this closing div
        const indent = '                  ';
        const newLines = [
          indent + '<div style={{ display: "flex", gap: 6, marginTop: 6 }}>',
          indent + '  <div onClick={() => { const cm = ev.cm ? cantieri.find(c => c.code === ev.cm) : null; if (cm) { setSelectedCM(cm); setTab("commesse"); } else { setShowModal("commessa"); } setSelectedEvent(null); }} style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#f0f4ff", border: "1px solid #007aff30", textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#007aff" }}>&#x1F4C1; Commessa</div>',
          indent + '  <div onClick={() => { const cm = ev.cm ? cantieri.find(c => c.code === ev.cm) : null; if (cm) { setSelectedCM(cm); setTab("commesse"); } else { setShowModal("commessa"); } setSelectedEvent(null); }} style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#fff5eb", border: "1px solid #ff950030", textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#ff9500" }}>&#x1F4CF; Misure</div>',
          indent + '  <div onClick={() => { const code = "INT-" + Date.now().toString().slice(-4); const nc = { id: "c" + Date.now(), code, cliente: selectedEvent?.persona || "", cognome: "", indirizzo: selectedEvent?.addr || "", telefono: "", tipo: "nuova", fase: "sopralluogo", vani: [], note: "Intervento: " + (selectedEvent?.text || "") }; setCantieri(prev => [...prev, nc]); setSelectedCM(nc); setSelectedEvent(null); setTab("commesse"); }} style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#f0fff4", border: "1px solid #34c75930", textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#34c759" }}>&#x1F527; Intervento</div>',
          indent + '</div>',
        ];
        lines.splice(j + 1, 0, ...newLines);
        inserted1 = true;
        console.log('+ Inserted action buttons after selectedEvent detail (line ' + (j + 2) + ')');
        break;
      }
    }
    break;
  }
}

// STEP 2: Find the inline event list Elimina button (deleteEvent + setSelectedEvent(null) but NOT selectedEvent.id)
let inserted2 = false;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('deleteEvent(ev.id)') && lines[i].includes('setSelectedEvent(null)') && !lines[i].includes('selectedEvent.id')) {
    // Found inline list Elimina
    for (let j = i + 1; j < i + 5; j++) {
      if (lines[j].trim() === '</div>') {
        const indent = '                                  ';
        const newLines = [
          indent + '<div style={{ display: "flex", gap: 4, marginTop: 4 }}>',
          indent + '  <div onClick={(e) => { e.stopPropagation(); const cm = ev.cm ? cantieri.find(c => c.code === ev.cm) : null; if (cm) { setSelectedCM(cm); setTab("commesse"); } else { setShowModal("commessa"); } setSelectedEvent(null); }} style={{ flex: 1, padding: "6px", borderRadius: 6, background: "#fff5eb", textAlign: "center", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#ff9500" }}>&#x1F4CF; Misure</div>',
          indent + '  <div onClick={(e) => { e.stopPropagation(); setSelectedEvent(null); setTab("commesse"); }} style={{ flex: 1, padding: "6px", borderRadius: 6, background: "#f0fff4", textAlign: "center", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#34c759" }}>&#x1F527; Intervento</div>',
          indent + '</div>',
        ];
        lines.splice(j + 1, 0, ...newLines);
        inserted2 = true;
        console.log('+ Inserted action buttons in day event list (line ' + (j + 2) + ')');
        break;
      }
    }
    break;
  }
}

if (!inserted1) console.log('! selectedEvent detail buttons not found');
if (!inserted2) console.log('! day event list buttons not found');

fs.writeFileSync(file, lines.join('\n'));
console.log('\nLines: ' + lines.length);
console.log(inserted1 && inserted2 ? '✅ Done!' : '⚠️ Partial fix');
