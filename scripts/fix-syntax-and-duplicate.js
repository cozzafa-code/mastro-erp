const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'MastroERP.tsx');
let code = fs.readFileSync(file, 'utf8');
const original = code;

console.log('🔧 Fix Syntax Errors + Remove Duplicate Popup\n');

// ============================================================
// FIX 1: Arrow functions senza {} — "() => setSelectedEvent(null); setEditingEvent(false)"
// Deve diventare: "() => { setSelectedEvent(null); setEditingEvent(false); }"
// ============================================================

// Pattern: onClick={() => setSelectedEvent(null); setEditingEvent(false)}
// Broken because arrow without {} only executes first statement
const brokenArrow = /\(\)\s*=>\s*setSelectedEvent\(null\);\s*setEditingEvent\(false\)/g;
const matches = code.match(brokenArrow);
console.log(`📍 Trovati ${matches ? matches.length : 0} arrow functions rotte`);

code = code.replace(brokenArrow, '() => { setSelectedEvent(null); setEditingEvent(false); }');
console.log('✅ Fix 1: Arrow functions corrette con {}');

// ============================================================
// FIX 2: Rimuovi il SECONDO popup duplicato
// Cerca il secondo "{/* EVENT POPUP OVERLAY — Google Calendar style */}"
// ============================================================

const popupMarker = '{/* EVENT POPUP OVERLAY — Google Calendar style */}';
const firstIdx = code.indexOf(popupMarker);
const secondIdx = code.indexOf(popupMarker, firstIdx + 1);

if (secondIdx > -1) {
  console.log(`\n📍 Primo popup a posizione: ${firstIdx}`);
  console.log(`📍 Secondo popup (duplicato) a posizione: ${secondIdx}`);
  
  // Trova la fine del secondo popup — cerca il pattern di chiusura "})()}"
  // Il popup è una IIFE: {selectedEvent && ... (() => { ... })()}
  // Ends with: })()}
  const afterSecond = code.substring(secondIdx);
  
  // Count braces to find the end of the second popup block
  // Start from the "{selectedEvent &&" after the comment
  const blockStart = afterSecond.indexOf('{selectedEvent');
  let braceCount = 0;
  let endPos = -1;
  let inString = false;
  let stringChar = '';
  
  for (let i = blockStart; i < afterSecond.length; i++) {
    const ch = afterSecond[i];
    const prev = i > 0 ? afterSecond[i-1] : '';
    
    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false;
      continue;
    }
    
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    
    if (ch === '{') braceCount++;
    if (ch === '}') {
      braceCount--;
      if (braceCount === 0) {
        endPos = i + 1;
        break;
      }
    }
  }
  
  if (endPos > -1) {
    const secondPopupCode = afterSecond.substring(0, endPos);
    const fullSecondBlock = popupMarker + '\n        ' + afterSecond.substring(0, endPos);
    
    // Remove the second popup
    code = code.substring(0, secondIdx) + code.substring(secondIdx + fullSecondBlock.length);
    console.log(`✅ Fix 2: Rimosso secondo popup duplicato (${secondPopupCode.length} caratteri)`);
  } else {
    console.log('⚠️  Non riesco a trovare la fine del secondo popup, provo metodo alternativo...');
    
    // Alternative: find the })() pattern that ends the IIFE
    // The second popup ends with:  })()}
    // followed by newlines and possibly more JSX
    
    // Find "})()}" after secondIdx
    const searchArea = code.substring(secondIdx);
    const iifEnds = [];
    let searchPos = 0;
    while (true) {
      const pos = searchArea.indexOf('})()}', searchPos);
      if (pos === -1) break;
      iifEnds.push(pos);
      searchPos = pos + 5;
    }
    
    if (iifEnds.length > 0) {
      // The first })() after the second popup marker should end it
      const cutEnd = secondIdx + iifEnds[0] + 5;
      const removed = code.substring(secondIdx, cutEnd);
      code = code.substring(0, secondIdx) + code.substring(cutEnd);
      console.log(`✅ Fix 2 (alt): Rimosso secondo popup (${removed.length} chars)`);
    }
  }
} else {
  console.log('ℹ️  Nessun popup duplicato trovato');
}

// ============================================================
// FIX 3: Verifica che il primo popup abbia l'editing inline
// (dovrebbe già averlo — input text, date, time)
// ============================================================

if (code.includes('defaultValue={ev.text}') && code.includes('type="date"') && code.includes('type="time"')) {
  console.log('\n✅ Il primo popup ha già editing inline (titolo + data + ora)');
} else {
  console.log('\n⚠️  Il primo popup potrebbe non avere editing inline');
}

// ============================================================
// FIX 4: Aggiungi select per tipo appuntamento nel primo popup
// (se non c'è già)
// ============================================================

if (!code.includes('select') || !code.includes('sopralluogo')) {
  // Trova il primo popup, dopo i badge (persona, addr, cm, tipo)
  // Aggiungi un select per cambiare tipo
  
  // Cerca il badge tipo nel primo popup
  const tipoBadge = code.indexOf('{ev.tipo}</span>', firstIdx);
  if (tipoBadge > -1 && tipoBadge < (secondIdx > -1 ? secondIdx : code.length)) {
    // Find the closing </div> of the badges flex container
    const afterTipo = code.substring(tipoBadge);
    const closingDiv = afterTipo.indexOf('</div>');
    if (closingDiv > -1) {
      const insertPos = tipoBadge + closingDiv + 6;
      const typeSelect = `
                <div style={{ marginBottom: 8 }}>
                  <select defaultValue={ev.tipo || "appuntamento"} onChange={(e) => { setEvents(prev => prev.map(x => x.id === ev.id ? { ...x, tipo: e.target.value } : x)); setSelectedEvent({ ...ev, tipo: e.target.value }); }} style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: \`1px solid \${T.bdr}\`, background: T.card, fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "inherit", cursor: "pointer" }}>
                    <option value="appuntamento">📋 Appuntamento</option>
                    <option value="sopralluogo">📐 Sopralluogo</option>
                    <option value="consegna">📦 Consegna</option>
                    <option value="montaggio">🔧 Montaggio</option>
                    <option value="intervento">🛠️ Intervento</option>
                    <option value="preventivo">💰 Preventivo</option>
                    <option value="task">✅ Task</option>
                  </select>
                </div>`;
      
      code = code.substring(0, insertPos) + typeSelect + code.substring(insertPos);
      console.log('✅ Fix 4: Aggiunto select tipo appuntamento nel popup');
    }
  }
}

// ============================================================
// SAVE
// ============================================================

if (code !== original) {
  fs.writeFileSync(file, code, 'utf8');
  console.log('\n✅ File salvato!');
  console.log('\n🚀 Esegui: npm run dev');
  console.log('\n📋 Riepilogo:');
  console.log('   - Arrow functions fixate (syntax error risolto)');
  console.log('   - Popup duplicato rimosso');
  console.log('   - Editing inline: titolo, data, ora, tipo');
} else {
  console.log('\n⚠️  Nessuna modifica necessaria');
}
