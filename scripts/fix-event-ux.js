// fix-event-ux.js — 1 click = all actions visible
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find renderEventCard and replace it with a simpler version that shows all actions on 1 click
let cardStart = -1;
let cardEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const renderEventCard = (ev) => (')) {
    cardStart = i;
    break;
  }
}

if (cardStart === -1) { console.error('renderEventCard not found'); process.exit(1); }

// Find the end - matching the closing ");"
let depth = 0;
let foundOpen = false;
for (let i = cardStart; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '(') { depth++; foundOpen = true; }
    if (line[j] === ')') { depth--; }
    if (foundOpen && depth === 0) {
      cardEnd = i;
      break;
    }
  }
  if (cardEnd !== -1) break;
}

console.log('renderEventCard: lines ' + (cardStart+1) + ' to ' + (cardEnd+1));

// Replace with new version
const newCard = `    const renderEventCard = (ev) => {
      const isOpen = selectedEvent?.id === ev.id;
      const cmObj = ev.cm ? cantieri.find(c => c.code === ev.cm) : null;
      return (
      <div key={ev.id} style={{ ...S.card, margin: "0 0 8px", borderLeft: \`3px solid \${ev.color || T.acc}\` }}>
        <div onClick={() => setSelectedEvent(isOpen ? null : ev)} style={{ ...S.cardInner, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{ev.text}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                {ev.time && <span style={{ fontSize: 11, fontWeight: 700, color: T.sub, fontFamily: FM }}>{ev.time}</span>}
                {ev.persona && <span style={S.badge(T.purpleLt, T.purple)}>\u{1F464} {ev.persona}</span>}
                {ev.cm && <span style={S.badge(T.blueLt, T.blue)}>\u{1F4C1} {ev.cm}</span>}
                {ev.reminder && <span style={S.badge(T.accLt, T.acc)}>\u{23F0} {ev.reminder}</span>}
                <span style={S.badge(ev.tipo==="appuntamento"?T.blueLt:ev.tipo==="task"?T.accLt:T.redLt, ev.tipo==="appuntamento"?T.blue:ev.tipo==="task"?T.acc:T.red)}>{ev.tipo}</span>
              </div>
              {ev.addr && <div style={{ fontSize: 11, color: T.sub, marginTop: 3 }}>\u{1F4CD} {ev.addr}</div>}
            </div>
            <div style={{ fontSize: 18, color: T.sub, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>\u{25BE}</div>
          </div>
        </div>
        {isOpen && (
          <div style={{ padding: "0 12px 12px", borderTop: \`1px solid \${T.bdr}\` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 10 }}>
              {ev.addr && <div onClick={() => window.open("https://maps.google.com/?q=" + encodeURIComponent(ev.addr))} style={{ padding: "10px 4px", borderRadius: 8, background: T.blueLt, textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.blue }}>\u{1F4CD} Mappa</div>}
              {(ev.persona || cmObj) && <div onClick={() => { const tel = cmObj?.telefono || contatti.find(c => c.nome === ev.persona)?.telefono; if (tel) window.open("tel:" + tel); }} style={{ padding: "10px 4px", borderRadius: 8, background: T.grnLt, textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.grn }}>\u{1F4DE} Chiama</div>}
              <div onClick={() => {
                const cliente = cmObj ? \`\${cmObj.cliente} \${cmObj.cognome||""}\`.trim() : (ev.persona || "Cliente");
                const dataFmt = new Date(ev.date).toLocaleDateString("it-IT", { weekday:"long", day:"numeric", month:"long" });
                const tpl = \`Gentile \${cliente},\\n\\nLe confermo l'appuntamento:\\n\\n\u{1F4C5} \${dataFmt}\${ev.time ? " alle " + ev.time : ""}\\n\u{1F4CD} \${ev.addr || "da concordare"}\\n\\n\${ev.text}\\n\\nCordiali saluti,\\nFabio Cozza\\nWalter Cozza Serramenti\`;
                setMailBody(tpl);
                setShowMailModal({ ev, cm: cmObj });
              }} style={{ padding: "10px 4px", borderRadius: 8, background: T.accLt, textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.acc }}>\u{2709}\u{FE0F} Mail</div>
              <div onClick={() => deleteEvent(ev.id)} style={{ padding: "10px 4px", borderRadius: 8, background: T.redLt, textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.red }}>\u{1F5D1}\u{FE0F} Elimina</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 6 }}>
              <div onClick={() => { if (cmObj) { setSelectedCM(cmObj); } else { const code = "CM-" + Date.now().toString().slice(-4); const nc = { id: "c" + Date.now(), code, cliente: ev.persona || "Nuovo", cognome: "", indirizzo: ev.addr || "", telefono: "", tipo: "nuova", fase: "sopralluogo", vani: [], note: ev.text }; setCantieri(prev => [...prev, nc]); setSelectedCM(nc); } setSelectedEvent(null); setTab("commesse"); }} style={{ padding: "10px 4px", borderRadius: 10, background: "linear-gradient(135deg, #007aff15, #007aff08)", border: "1px solid #007aff25", textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 800, color: "#007aff" }}>\u{1F4C1} Commessa</div>
              <div onClick={() => { if (cmObj) { setSelectedCM(cmObj); } else { const code = "CM-" + Date.now().toString().slice(-4); const nc = { id: "c" + Date.now(), code, cliente: ev.persona || "Nuovo", cognome: "", indirizzo: ev.addr || "", telefono: "", tipo: "nuova", fase: "sopralluogo", vani: [], note: "Misure: " + ev.text }; setCantieri(prev => [...prev, nc]); setSelectedCM(nc); } setSelectedEvent(null); setTab("commesse"); }} style={{ padding: "10px 4px", borderRadius: 10, background: "linear-gradient(135deg, #ff950015, #ff950008)", border: "1px solid #ff950025", textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 800, color: "#ff9500" }}>\u{1F4CF} Misure</div>
              <div onClick={() => { const code = "INT-" + Date.now().toString().slice(-4); const nc = { id: "c" + Date.now(), code, cliente: ev.persona || "", cognome: "", indirizzo: ev.addr || "", telefono: "", tipo: "nuova", fase: "sopralluogo", vani: [], note: "Intervento: " + ev.text }; setCantieri(prev => [...prev, nc]); setSelectedCM(nc); setSelectedEvent(null); setTab("commesse"); }} style={{ padding: "10px 4px", borderRadius: 10, background: "linear-gradient(135deg, #34c75915, #34c75908)", border: "1px solid #34c75925", textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 800, color: "#34c759" }}>\u{1F527} Intervento</div>
            </div>
          </div>
        )}
      </div>
      );
    };`;

lines.splice(cardStart, cardEnd - cardStart + 1, ...newCard.split('\n'));
console.log('✓ renderEventCard replaced with 1-click UX');

// Also remove the old inline detail panel in the giorno view (lines 4461-4478 area)
// since renderEventCard now handles everything
let c = lines.join('\n');

// Remove the old selectedEvent detail inside the giorno timeline
// The pattern is: {selectedEvent?.id === ev.id && ( ... )} inside the hourEvents.map
const giornoDetailStart = '{selectedEvent?.id === ev.id && (\n                               <div style={{ padding: "8px", margin: "2px 0 6px"';
if (c.includes(giornoDetailStart)) {
  // Find and remove this block
  const idx = c.indexOf(giornoDetailStart);
  // Count from { to matching }
  let depth2 = 0;
  let start2 = idx;
  let end2 = idx;
  for (let k = idx; k < c.length; k++) {
    if (c[k] === '{' && c[k-1] !== '\\') depth2++;
    if (c[k] === '}' && c[k-1] !== '\\') { depth2--; if (depth2 === 0) { end2 = k + 1; break; } }
  }
  // Remove and replace with just using renderEventCard
  // Actually, let's just leave it — the giorno view uses its own inline render, not renderEventCard
  // The renderEventCard is used in settimana and mese views
  console.log('Note: giorno view has its own inline event render — keeping as is');
}

// Now fix the giorno view to use renderEventCard too
// Replace the inline hour event render with renderEventCard
const oldHourRender = `{hourEvents.map(ev => (
                          <div key={ev.id}>
                            <div onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)} style={{ padding: "4px`;
if (c.includes(oldHourRender)) {
  // Find the end of this block
  const hIdx = c.indexOf(oldHourRender);
  // Find the matching closing for the outer div
  let hEnd = c.indexOf('                        ))}', hIdx);
  if (hEnd !== -1) {
    hEnd += '                        ))}' .length;
    const newHourRender = `{hourEvents.map(ev => renderEventCard(ev))}`;
    c = c.substring(0, hIdx) + newHourRender + c.substring(hEnd);
    console.log('✓ Giorno timeline now uses renderEventCard');
  }
}

fs.writeFileSync(file, c);
console.log('\n✅ Event UX simplified!');
console.log('Lines: ' + c.split('\n').length);
