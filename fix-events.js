// fix-events.js — Remove demo events
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Replace the demo events array with empty
const old = `return [
      { id: 1, text: "Sopralluogo Ferraro"`;
const idx = c.indexOf(old);
if (idx === -1) { console.error('Not found'); process.exit(1); }

// Find the closing ];
const end = c.indexOf('];\n  });', idx);
if (end === -1) { console.error('End not found'); process.exit(1); }

c = c.substring(0, idx) + 'return [];' + c.substring(end + 2);

fs.writeFileSync(file, c);
console.log('✅ Demo events removed');
