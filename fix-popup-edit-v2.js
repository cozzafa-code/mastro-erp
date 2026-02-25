const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'MastroERP.tsx');
let code = fs.readFileSync(file, 'utf8');
const original = code;

console.log('🔧 Fix Popup Edit v2 - Aggiunge modifica titolo/data/ora/tipo nel popup evento\n');

// ============================================================
// STEP 1: Trova il popup evento e identifica la struttura
// ============================================================

// Cerca il pattern del popup che mostra il titolo dell'evento selezionato
// Tipicamente: selectedEvent.title o selectedEvent.titolo in un <h2> o <p>

// Pattern comuni per il titolo nel popup
const titlePatterns = [
  // Pattern: <h2 className="...">{selectedEvent.title}</h2>
  /(<h2[^>]*>)\{selectedEvent\.titolo?\}(<\/h2>)/,
  /(<h2[^>]*>)\{selectedEvent\.title?\}(<\/h2>)/,
  /(<h2[^>]*>)\{selectedEvent\?.titolo?\}(<\/h2>)/,
  /(<h2[^>]*>)\{selectedEvent\?.title?\}(<\/h2>)/,
  // Pattern: <p className="text-xl...">{selectedEvent...}</p>
  /(<(?:h2|h3|p|div|span)[^>]*(?:text-xl|text-2xl|text-lg|font-bold|font-semibold)[^>]*>)\{selectedEvent\??\.(titolo|title)\}(<\/(?:h2|h3|p|div|span)>)/,
];

let titleMatch = null;
let titleField = 'title';
for (const pat of titlePatterns) {
  const m = code.match(pat);
  if (m) {
    titleMatch = m;
    if (m[0].includes('.titolo')) titleField = 'titolo';
    else titleField = 'title';
    console.log(`✅ Trovato titolo evento: ${m[0].substring(0, 80)}...`);
    break;
  }
}

// Cerca pattern data/ora nel popup
const datePatterns = [
  // Formato italiano: "mercoledì 25 febbraio alle 09:00"
  /(\{[^}]*(?:toLocaleDateString|format|giorni|mesi|getDay|getMonth)[^}]*\}[^<]*(?:alle|ore|at)[^<]*\{[^}]*(?:ora|time|hour|getHours)[^}]*\})/,
  // Template literal
  /(\{`[^`]*\$\{[^}]*\}[^`]*\$\{[^}]*\}[^`]*`\})/,
  // Funzione formatDate o simile
  /(\{format(?:Date|Data|DateTime|Evento)[^}]*\})/,
];

// Cerca il tipo appuntamento
const typePatterns = [
  /appuntamento|sopralluogo|consegna|montaggio|intervento/,
];

// ============================================================
// STEP 2: Aggiungi stati per editing nel popup
// ============================================================

// Trova dove sono dichiarati gli stati del selectedEvent
const statePatterns = [
  /(const \[selectedEvent, setSelectedEvent\] = useState[^;]*;)/,
  /(const \[selectedEvent, setSelectedEvent\][^;]*;)/,
];

let stateInserted = false;
for (const pat of statePatterns) {
  const m = code.match(pat);
  if (m) {
    const editStates = `
  // Stati per editing popup evento
  const [editingEvent, setEditingEvent] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editType, setEditType] = useState('');`;
    
    if (!code.includes('editingEvent')) {
      code = code.replace(m[1], m[1] + editStates);
      console.log('✅ Aggiunti stati editingEvent, editTitle, editDate, editTime, editType');
      stateInserted = true;
    } else {
      console.log('⚠️  Stati editing già presenti');
      stateInserted = true;
    }
    break;
  }
}

if (!stateInserted) {
  console.log('⚠️  Non trovato useState per selectedEvent, cerco alternativa...');
  // Cerca qualsiasi useState vicino a "selected" o "evento"
  const altMatch = code.match(/(const \[(?:evento|event|sel)[^;]*useState[^;]*;)/i);
  if (altMatch) {
    const editStates = `
  const [editingEvent, setEditingEvent] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editType, setEditType] = useState('');`;
    if (!code.includes('editingEvent')) {
      code = code.replace(altMatch[1], altMatch[1] + editStates);
      console.log('✅ Aggiunti stati editing (metodo alternativo)');
      stateInserted = true;
    }
  }
}

// ============================================================
// STEP 3: Aggiungi funzione di salvataggio evento
// ============================================================

const saveFunction = `
  // Salva modifiche evento dal popup
  const handleSaveEventEdit = () => {
    if (!selectedEvent) return;
    const updated = {
      ...selectedEvent,
      ${titleField}: editTitle,
      data: editDate,
      ora: editTime,
      tipo: editType,
    };
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelectedEvent(updated);
    setEditingEvent(false);
    // Sync con Supabase se disponibile
    if (typeof syncEventToSupabase === 'function') {
      syncEventToSupabase(updated);
    }
  };

  // Inizia editing evento
  const handleStartEditEvent = () => {
    if (!selectedEvent) return;
    setEditTitle(selectedEvent.${titleField} || '');
    setEditDate(selectedEvent.data || '');
    setEditTime(selectedEvent.ora || '09:00');
    setEditType(selectedEvent.tipo || 'appuntamento');
    setEditingEvent(true);
  };`;

if (!code.includes('handleSaveEventEdit')) {
  // Inserisci prima del return principale
  const returnMatch = code.match(/(\n  return \(\n)/);
  if (returnMatch) {
    code = code.replace(returnMatch[1], saveFunction + returnMatch[1]);
    console.log('✅ Aggiunte funzioni handleSaveEventEdit e handleStartEditEvent');
  } else {
    // Prova dopo l'ultimo useEffect
    const lastEffect = code.lastIndexOf('}, [');
    if (lastEffect > -1) {
      const insertPoint = code.indexOf(']);', lastEffect) + 3;
      code = code.slice(0, insertPoint) + '\n' + saveFunction + code.slice(insertPoint);
      console.log('✅ Aggiunte funzioni editing (dopo useEffect)');
    }
  }
}

// ============================================================
// STEP 4: Trova e modifica il popup per rendering editabile
// ============================================================

// Strategia: cerchiamo il blocco del popup modale e sostituiamo il contenuto
// Cerchiamo il pattern: selectedEvent && (... popup JSX ...)

// Cerco la sezione del popup che contiene il titolo e la X di chiusura
// Pattern tipico: {selectedEvent && (<div className="fixed ...

// Approccio più robusto: cerca la riga con il titolo dell'evento nel popup
// e sostituisci l'intero blocco titolo + data + tipo

// Cerca blocco: titolo + data formattata + pills tipo
const popupContentRegex = /(\{\/\*\s*Popup[^*]*\*\/\}[\s\S]{0,200}|selectedEvent\s*&&\s*\(\s*<div[^>]*(?:fixed|modal|overlay|popup)[^>]*>[\s\S]{0,500})/;

// Cerchiamo il titolo nel popup in modo più specifico
// Il popup mostra: LIDIA (titolo), data, e poi i pills

// Approach: Find the specific h2/title rendering in the popup context
// Look for the close button (X) near the title - this confirms we're in the popup

const closeButtonNearTitle = code.match(/(onClick={[^}]*setSelectedEvent\(null\)[^}]*}[\s\S]{0,100}<\/button>[\s\S]{0,50}<h2[^>]*>\{selectedEvent\??\.(titolo|title)\}<\/h2>)/);

if (closeButtonNearTitle) {
  console.log('✅ Trovato blocco popup con titolo e pulsante chiudi');
}

// Let's find the ENTIRE popup section more carefully
// Search for the popup modal div that contains selectedEvent info

// Find all occurrences of selectedEvent.titolo or selectedEvent.title in JSX
const allTitleRefs = [];
const titleRefRegex = /\{selectedEvent\??\.(?:titolo|title)\}/g;
let match;
while ((match = titleRefRegex.exec(code)) !== null) {
  allTitleRefs.push({ index: match.index, text: match[0] });
}

console.log(`\n📍 Trovati ${allTitleRefs.length} riferimenti al titolo evento nel codice`);

// For each title ref, check if it's inside the popup (look for nearby modal/fixed/overlay classes)
for (const ref of allTitleRefs) {
  const context = code.substring(Math.max(0, ref.index - 500), ref.index + 200);
  if (context.includes('fixed') || context.includes('modal') || context.includes('popup') || context.includes('overlay') || context.includes('z-50') || context.includes('z-[')) {
    console.log(`📍 Titolo nel popup trovato a posizione ${ref.index}`);
    
    // Now find the exact lines around this title
    const lineStart = code.lastIndexOf('\n', ref.index);
    const surroundingCode = code.substring(lineStart - 200, ref.index + 300);
    console.log('\n--- Contesto popup (200 chars prima e dopo il titolo) ---');
    console.log(surroundingCode.substring(0, 100) + '...');
  }
}

// ============================================================
// STEP 5: Sostituzione diretta del contenuto popup
// ============================================================

// Cerca il pattern esatto del popup: titolo + data formattata
// Dal screenshot: "LIDIA" come h2, poi "mercoledì 25 febbraio alle 09:00" come p

// Pattern 1: h2 con titolo, poi p con data formattata
const popupTitleBlock = code.match(
  /(<h2[^>]*>\s*\{selectedEvent\??\.(titolo|title)\}\s*<\/h2>\s*<p[^>]*>)([\s\S]*?)(<\/p>)/
);

if (popupTitleBlock) {
  const field = popupTitleBlock[2]; // titolo or title
  const oldBlock = popupTitleBlock[0];
  
  const newBlock = `{editingEvent ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xl font-bold border-b-2 border-blue-500 bg-transparent outline-none pb-1"
                    placeholder="Nome evento"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="border rounded px-2 py-1 text-sm bg-white"
                    />
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="border rounded px-2 py-1 text-sm bg-white"
                    />
                  </div>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="border rounded px-3 py-1.5 text-sm bg-white w-full"
                  >
                    <option value="appuntamento">📋 Appuntamento</option>
                    <option value="sopralluogo">📐 Sopralluogo</option>
                    <option value="consegna">📦 Consegna</option>
                    <option value="montaggio">🔧 Montaggio</option>
                    <option value="intervento">🛠️ Intervento</option>
                    <option value="preventivo">💰 Preventivo</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEventEdit}
                      className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
                    >
                      ✅ Salva
                    </button>
                    <button
                      onClick={() => setEditingEvent(false)}
                      className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold cursor-pointer hover:text-blue-600" onClick={handleStartEditEvent}>{selectedEvent?.${field}}</h2>
                  <p className="text-gray-500 text-sm cursor-pointer hover:text-blue-600" onClick={handleStartEditEvent}>${popupTitleBlock[3]}</p>
                </>
              )}`;

  code = code.replace(oldBlock, newBlock);
  console.log('\n✅ Popup titolo+data sostituito con versione editabile!');
} else {
  console.log('\n⚠️  Pattern popup titolo+data non trovato con regex standard');
  console.log('   Provo approccio alternativo...\n');
  
  // Approccio alternativo: cerca qualsiasi h2 con selectedEvent nel popup
  // e aggiungi onClick per editare
  
  // Find h2 with selectedEvent
  const h2Match = code.match(/<h2([^>]*)>\{selectedEvent\??\.(titolo|title)\}<\/h2>/);
  if (h2Match) {
    const field = h2Match[2];
    const oldH2 = h2Match[0];
    
    // Trova anche la riga successiva (data/ora)
    const h2Index = code.indexOf(oldH2);
    const afterH2 = code.substring(h2Index + oldH2.length, h2Index + oldH2.length + 500);
    
    // Cerca il <p> con la data subito dopo
    const pMatch = afterH2.match(/^(\s*<p[^>]*>)([\s\S]*?)(<\/p>)/);
    
    let oldBlock, dateContent;
    if (pMatch) {
      oldBlock = oldH2 + pMatch[0];
      dateContent = pMatch[2];
    } else {
      oldBlock = oldH2;
      dateContent = '';
    }
    
    const newBlock = `{editingEvent ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xl font-bold border-b-2 border-blue-500 bg-transparent outline-none pb-1"
                    placeholder="Nome evento"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="border rounded px-2 py-1 text-sm bg-white"
                    />
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="border rounded px-2 py-1 text-sm bg-white"
                    />
                  </div>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="border rounded px-3 py-1.5 text-sm bg-white w-full"
                  >
                    <option value="appuntamento">📋 Appuntamento</option>
                    <option value="sopralluogo">📐 Sopralluogo</option>
                    <option value="consegna">📦 Consegna</option>
                    <option value="montaggio">🔧 Montaggio</option>
                    <option value="intervento">🛠️ Intervento</option>
                    <option value="preventivo">💰 Preventivo</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEventEdit}
                      className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
                    >
                      ✅ Salva
                    </button>
                    <button
                      onClick={() => setEditingEvent(false)}
                      className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2${h2Match[1]} className="cursor-pointer hover:text-blue-600" onClick={handleStartEditEvent}>{selectedEvent?.${field}}</h2>
                  ${pMatch ? `<p className="text-gray-500 text-sm cursor-pointer hover:text-blue-600" onClick={handleStartEditEvent}>${dateContent}</p>` : ''}
                </>
              )}`;
    
    code = code.replace(oldBlock, newBlock);
    console.log('✅ Popup modificato con approccio alternativo!');
  } else {
    console.log('❌ Non riesco a trovare il titolo nel popup.');
    console.log('   Nomi campo trovati nel codice:');
    
    // Debug: mostra quali campi selectedEvent usa
    const fieldMatches = code.match(/selectedEvent\??\.(\w+)/g);
    if (fieldMatches) {
      const uniqueFields = [...new Set(fieldMatches)].slice(0, 20);
      uniqueFields.forEach(f => console.log(`   - ${f}`));
    }
  }
}

// ============================================================
// STEP 6: Aggiungi pulsante "Modifica" (✏️) se non c'è già
// ============================================================

// Cerca la riga dei bottoni azione (Mappa, Chiama, Mail, Elimina)
// e aggiungi un bottone Modifica prima di Elimina

if (!code.includes('handleStartEditEvent') || !code.match(/Modifica|✏️.*edit|Edit.*pencil/i)) {
  // Cerca il bottone Elimina nel popup
  const eliminaPattern = code.match(/((?:<button|<div)[^>]*(?:onClick={[^}]*(?:delete|elimina|remove)[^}]*}|className="[^"]*red[^"]*")[^>]*>[\s\S]*?(?:Elimina|🗑️)[\s\S]*?<\/(?:button|div)>)/i);
  
  if (eliminaPattern) {
    const editButton = `<button
                    onClick={handleStartEditEvent}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm"
                  >
                    ✏️ Modifica
                  </button>
                  `;
    
    code = code.replace(eliminaPattern[0], editButton + eliminaPattern[0]);
    console.log('✅ Aggiunto bottone ✏️ Modifica prima di Elimina');
  }
}

// ============================================================
// STEP 7: Reset editing quando si chiude il popup
// ============================================================

// Quando si chiude il popup (setSelectedEvent(null)), resetta anche editingEvent
const closePatterns = [
  /setSelectedEvent\(null\)/g,
];

let closeCount = 0;
code = code.replace(/setSelectedEvent\(null\)/g, (match) => {
  closeCount++;
  return 'setSelectedEvent(null); setEditingEvent(false)';
});

if (closeCount > 0) {
  console.log(`✅ Aggiunto reset editingEvent in ${closeCount} punti di chiusura popup`);
}

// ============================================================
// STEP 8: Aggiungi anche il pill "tipo" cliccabile
// ============================================================

// Il pill "appuntamento" dal screenshot - rendiamolo cliccabile per editare
const tipoPillRegex = /(\{selectedEvent\??\.tipo\})/;
if (code.match(tipoPillRegex) && !code.includes('onClick={handleStartEditEvent}')) {
  // Già gestito sopra nel blocco editing
}

// ============================================================
// SALVA
// ============================================================

if (code !== original) {
  fs.writeFileSync(file, code, 'utf8');
  console.log('\n✅ File salvato con successo!');
  console.log('\n📋 Funzionalità aggiunte:');
  console.log('   1. Click su titolo/data → apre modalità editing');
  console.log('   2. Input testo per titolo');
  console.log('   3. Date picker + Time picker');
  console.log('   4. Select tipo (appuntamento/sopralluogo/consegna/montaggio/intervento/preventivo)');
  console.log('   5. Bottone ✏️ Modifica nel popup');
  console.log('   6. Salva → aggiorna evento + sync Supabase');
  console.log('   7. Annulla → torna alla vista normale');
  console.log('\n🚀 Esegui: npm run dev');
} else {
  console.log('\n⚠️  Nessuna modifica applicata. Il file potrebbe avere una struttura diversa.');
  console.log('   Invia il contenuto del popup nel codice e lo sistemo manualmente.');
}
