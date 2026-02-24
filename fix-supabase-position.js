// fix-supabase-position.js — Move Supabase block after all hooks
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Extract the Supabase block
const startMarker = '  // === SUPABASE DATA LAYER ===';
const startIdx = c.indexOf(startMarker);
if (startIdx === -1) { console.error('Start marker not found'); process.exit(1); }

// Find end of the block - look for the next non-Supabase code
// The block ends after the last auto-save useEffect
const lines = c.split('\n');
let startLine = -1;
let endLine = -1;
lines.forEach((l, i) => {
  if (l.includes('// === SUPABASE DATA LAYER ===')) startLine = i;
});

// Find the end: after the pipelineDB auto-save useEffect
for (let i = startLine; i < lines.length; i++) {
  if (lines[i].includes('[pipelineDB, azId, dbLoading]')) {
    // Go to the closing of this useEffect
    endLine = i + 1; // include the line with });
    // Skip blank lines after
    while (endLine < lines.length && lines[endLine].trim() === '') endLine++;
    break;
  }
}

if (endLine === -1) { console.error('End not found'); process.exit(1); }

console.log('Supabase block: lines ' + (startLine+1) + ' to ' + (endLine));
const block = lines.slice(startLine, endLine).join('\n');

// Remove from current position
const newLines = [...lines.slice(0, startLine), ...lines.slice(endLine)];

// Find insert point: after all the localStorage useEffects
// Look for the last localStorage.setItem useEffect
let insertAt = -1;
newLines.forEach((l, i) => {
  if (l.includes('localStorage.setItem("mastro:azienda"')) insertAt = i + 1;
});

if (insertAt === -1) {
  // Fallback: after localStorage.setItem("mastro:pipeline"
  newLines.forEach((l, i) => {
    if (l.includes('localStorage.setItem("mastro:pipeline"')) insertAt = i + 1;
  });
}

if (insertAt === -1) { console.error('Insert point not found'); process.exit(1); }

console.log('Inserting after line ' + (insertAt + 1));

// Insert
const finalLines = [...newLines.slice(0, insertAt), '', block, '', ...newLines.slice(insertAt)];
c = finalLines.join('\n');

fs.writeFileSync(file, c);
console.log('✅ Supabase block moved! Lines: ' + finalLines.length);
