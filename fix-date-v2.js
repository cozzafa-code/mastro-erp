const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'MastroERP.tsx');
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changed = false;

console.log('🔧 Fix Data/Ora — line by line\n');

for (let i = 0; i < lines.length; i++) {
  // Trova la riga con la data formattata nel popup
  if (lines[i].includes('fontSize: 13, color: T.sub, marginTop: 4') && 
      i + 2 < lines.length &&
      lines[i + 1].includes('toLocaleDateString("it-IT"') &&
      lines[i + 2].includes('ev.time && ` alle')) {
    
    console.log(`📍 Trovata data statica a riga ${i + 1}`);
    
    // Trova la riga </div> che chiude questo blocco
    let closeIdx = i + 3;
    for (let j = i + 3; j < i + 6; j++) {
      if (lines[j].trimStart().startsWith('</div>')) {
        closeIdx = j;
        break;
      }
    }
    
    // Calcola indentazione
    const indent = lines[i].match(/^(\s*)/)[1];
    
    // Sostituisci le righe
    const newLines = [
      `${indent}<div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>`,
      `${indent}  <input type="date" defaultValue={ev.date} onChange={(e) => { if (e.target.value) { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, date: e.target.value } : x)); setSelectedEvent({ ...ev, date: e.target.value }); } }} style={{ fontSize: 13, color: T.sub, border: \`1px solid \${T.bdr}\`, borderRadius: 8, padding: "4px 8px", background: T.card, fontFamily: "inherit" }} />`,
      `${indent}  <input type="time" defaultValue={ev.time || "09:00"} onChange={(e) => { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, time: e.target.value } : x)); setSelectedEvent({ ...ev, time: e.target.value }); }} style={{ fontSize: 13, color: T.sub, border: \`1px solid \${T.bdr}\`, borderRadius: 8, padding: "4px 8px", background: T.card, fontFamily: "inherit" }} />`,
      `${indent}</div>`,
    ];
    
    lines.splice(i, closeIdx - i + 1, ...newLines);
    changed = true;
    console.log(`✅ Righe ${i + 1}-${closeIdx + 1} sostituite con date+time picker`);
    break; // Solo la prima occorrenza (nel popup visibile)
  }
}

if (changed) {
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('\n✅ Salvato! Esegui: npm run dev');
} else {
  console.log('\n❌ Data statica non trovata');
  // Debug: mostra le righe con "marginTop: 4"
  lines.forEach((l, i) => {
    if (l.includes('marginTop: 4') && l.includes('fontSize: 13')) {
      console.log(`   Riga ${i + 1}: ${l.trim().substring(0, 80)}...`);
    }
  });
}
