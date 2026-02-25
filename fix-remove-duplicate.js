const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'MastroERP.tsx');
let lines = fs.readFileSync(file, 'utf8').split('\n');

console.log('🔧 Cleanup — Rimuovi popup duplicato\n');
console.log(`📄 File: ${lines.length} righe\n`);

// Trova il SECONDO commento "EVENT POPUP OVERLAY"
let firstFound = -1;
let secondFound = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('EVENT POPUP OVERLAY')) {
    if (firstFound === -1) {
      firstFound = i;
      console.log(`📍 Primo popup trovato a riga ${i + 1}`);
    } else {
      secondFound = i;
      console.log(`📍 Secondo popup (DUPLICATO) trovato a riga ${i + 1}`);
      break;
    }
  }
}

if (secondFound === -1) {
  console.log('✅ Nessun popup duplicato trovato — già pulito!');
  process.exit(0);
}

// Trova la fine del secondo popup: cerca })()}  dopo secondFound
let endLine = -1;
for (let i = secondFound + 1; i < lines.length; i++) {
  if (lines[i].trim() === '})()}') {
    endLine = i;
    console.log(`📍 Fine secondo popup a riga ${i + 1}`);
    break;
  }
}

if (endLine === -1) {
  console.log('❌ Non trovo la fine del secondo popup');
  process.exit(1);
}

// Rimuovi le righe del secondo popup
const removed = endLine - secondFound + 1;
lines.splice(secondFound, removed);
console.log(`\n✅ Rimosse ${removed} righe (da riga ${secondFound + 1} a ${endLine + 1})`);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log(`✅ File salvato! (${lines.length} righe)`);
console.log('\n🚀 Esegui: npm run dev');
