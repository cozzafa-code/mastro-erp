const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'MastroERP.tsx');
let code = fs.readFileSync(file, 'utf8');
const original = code;

console.log('🔧 Fix Data/Ora editabili nel popup\n');

// Stringa esatta dal codice (riga 6128-6130)
const oldDate = `                    <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>
                      {new Date(ev.date).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                      {ev.time && \` alle \${ev.time}\`}
                    </div>`;

const newDate = `                    <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                      <input type="date" defaultValue={ev.date} onChange={(e) => { if (e.target.value) { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, date: e.target.value } : x)); setSelectedEvent({ ...ev, date: e.target.value }); } }} style={{ fontSize: 13, color: T.sub, border: \`1px solid \${T.bdr}\`, borderRadius: 8, padding: "4px 8px", background: T.card, fontFamily: "inherit" }} />
                      <input type="time" defaultValue={ev.time || "09:00"} onChange={(e) => { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, time: e.target.value } : x)); setSelectedEvent({ ...ev, time: e.target.value }); }} style={{ fontSize: 13, color: T.sub, border: \`1px solid \${T.bdr}\`, borderRadius: 8, padding: "4px 8px", background: T.card, fontFamily: "inherit" }} />
                    </div>`;

const count = code.split(oldDate).length - 1;
console.log(`📍 Trovate ${count} occorrenze della data statica`);

if (count > 0) {
  code = code.replace(oldDate, newDate);
  console.log('✅ Data/Ora → date picker + time picker');
} else {
  console.log('❌ Stringa data non trovata');
}

if (code !== original) {
  fs.writeFileSync(file, code, 'utf8');
  console.log('\n✅ Salvato! Esegui: npm run dev');
} else {
  console.log('\n⚠️  Nessuna modifica');
}
