// fix-event-create.js — Auto-fill title + fix trash icon
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Change addEvent to auto-fill title from persona if empty
const oldCheck = "if (!newEvent.text.trim()) return;";
const newCheck = `const evText = newEvent.text.trim() || (newEvent.persona ? "Appuntamento " + newEvent.persona : "");
    if (!evText) return;
    newEvent.text = evText;`;

if (c.includes(oldCheck)) {
  c = c.replace(oldCheck, newCheck);
  console.log('✓ Auto-fill title from client name');
} else {
  console.error('✗ addEvent check not found');
}

// 2. Fix trash icon — search for the broken encoding pattern
// The actual bytes might be different, so find by context
const lines = c.split('\n');
let fixed = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Elimina') && lines[i].includes('deleteEvent')) {
    // Replace whatever is before "Elimina" with 🗑️
    lines[i] = lines[i].replace(/>[^<]*Elimina</, '>🗑️ Elimina<');
    fixed++;
  }
}
if (fixed > 0) {
  c = lines.join('\n');
  console.log('✓ Fixed ' + fixed + ' trash icons');
} else {
  console.log('⚠️ No trash icons found by context');
}

// 3. Also auto-fill event title in the Client dropdown onChange
// When selecting existing client, auto-set title
const clientDropdown = `const val = e.target.value;
                    if (val === "__new__") {
                      setNewEvent(ev => ({ ...ev, persona: "", _newCliente: true }));
                    } else {
                      const ct = contatti.find(c => c.nome === val);
                      setNewEvent(ev => ({ ...ev, persona: val, addr: ct?.indirizzo || ev.addr, _newCliente: false }));`;

const clientDropdownFixed = `const val = e.target.value;
                    if (val === "__new__") {
                      setNewEvent(ev => ({ ...ev, persona: "", _newCliente: true }));
                    } else {
                      const ct = contatti.find(c => c.nome === val);
                      setNewEvent(ev => ({ ...ev, persona: val, addr: ct?.indirizzo || ev.addr, text: ev.text || ("Appuntamento " + val), _newCliente: false }));`;

if (c.includes(clientDropdown)) {
  c = c.replace(clientDropdown, clientDropdownFixed);
  console.log('✓ Auto-fill title on client select');
}

fs.writeFileSync(file, c);
console.log('\n✅ Done! Lines: ' + c.split('\n').length);
