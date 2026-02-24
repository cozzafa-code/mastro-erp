// fix-hooks-order2.js — Move onboarding hooks before early returns
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Find the onboarding block
const onbStart = c.indexOf('// === ONBOARDING V2 ===');
if (onbStart === -1) { console.error('Onboarding V2 not found'); process.exit(1); }

// Find end - it's before "// Advance fase notification" OR before "/* ======= MAIN RENDER"
let onbEnd = c.indexOf('// Advance fase notification', onbStart);
if (onbEnd === -1) onbEnd = c.indexOf('/* ======= MAIN RENDER', onbStart);
if (onbEnd === -1) { console.error('End anchor not found'); process.exit(1); }

// Extract the block
const onbBlock = c.substring(onbStart, onbEnd);
console.log('Block: ' + onbBlock.split('\n').length + ' lines');

// Remove from current position  
c = c.substring(0, onbStart) + c.substring(onbEnd);

// Find "if (selectedRilievo) return" — insert BEFORE this line
const earlyReturn = c.indexOf('if (selectedRilievo) return');
if (earlyReturn === -1) { console.error('Early return not found'); process.exit(1); }

// Go to start of that line
let insertPos = c.lastIndexOf('\n', earlyReturn) + 1;

// Insert onboarding block before early returns
c = c.substring(0, insertPos) + '\n  ' + onbBlock + '\n' + c.substring(insertPos);

fs.writeFileSync(file, c);
console.log('✅ Hooks moved before early returns');
console.log('Lines: ' + c.split('\n').length);
