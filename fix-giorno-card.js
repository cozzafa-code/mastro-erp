// fix-giorno-card.js — Use renderEventCard in giorno view
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Replace lines 4456-4483 (the inline hourEvents render) with renderEventCard
// Line 4456: {hourEvents.map(ev => (
// Line 4483: ))}

// Verify
console.log('4456: ' + lines[4455].trim().substring(0, 40));
console.log('4483: ' + lines[4482].trim().substring(0, 40));

if (lines[4455].trim().startsWith('{hourEvents.map(ev =>')) {
  // Replace the whole block with single line
  lines.splice(4455, 4482 - 4455 + 1, '                        {hourEvents.map(ev => renderEventCard(ev))}');
  console.log('✓ Replaced giorno inline render with renderEventCard');
} else {
  console.error('✗ Expected hourEvents.map at line 4456');
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Lines: ' + lines.length);
