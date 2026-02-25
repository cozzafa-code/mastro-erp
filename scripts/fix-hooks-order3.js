// fix-hooks-order3.js — Move onboarding out of renderCommesse
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Find the onboarding block
const onbStart = c.indexOf('// === ONBOARDING V2 ===');
if (onbStart === -1) { console.error('Not found'); process.exit(1); }

let onbEnd = c.indexOf('// Advance fase notification', onbStart);
if (onbEnd === -1) {
  // Find end by looking for next function or early return after the block
  // The block ends before "if (selectedRilievo) return" 
  onbEnd = c.indexOf('if (selectedRilievo) return', onbStart);
  if (onbEnd === -1) onbEnd = c.indexOf('if (selectedCM) return', onbStart);
  if (onbEnd === -1) { console.error('End not found'); process.exit(1); }
  // Go to start of that line
  onbEnd = c.lastIndexOf('\n', onbEnd) + 1;
}

const onbBlock = c.substring(onbStart, onbEnd);
console.log('Block: ' + onbBlock.split('\n').length + ' lines');

// Remove from current position
c = c.substring(0, onbStart) + c.substring(onbEnd);

// Insert BEFORE "const renderCommesse" — this is in the main component body
const target = c.indexOf('const renderCommesse');
if (target === -1) { console.error('renderCommesse not found'); process.exit(1); }

// Go to start of line
let insertPos = c.lastIndexOf('\n', target) + 1;

c = c.substring(0, insertPos) + '  ' + onbBlock + '\n' + c.substring(insertPos);

fs.writeFileSync(file, c);
console.log('✅ Hooks moved to main component body (before renderCommesse)');
console.log('Lines: ' + c.split('\n').length);
