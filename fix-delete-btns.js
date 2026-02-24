// fix-delete-btns.js — Fix all broken delete buttons
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Find all lines with deleteEvent and fix the label
const lines = c.split('\n');
let fixed = 0;
for (let i = 0; i < lines.length; i++) {
  // Fix truncated ones like >🗝'</div> or >🗝' </div>
  if (lines[i].includes('deleteEvent') && lines[i].includes("🗝'")) {
    lines[i] = lines[i].replace(/🗝'[^<]*/g, '🗑️ Elimina');
    fixed++;
    console.log('Fixed line ' + (i+1));
  }
  // Fix ones where regex removed text: >🗑️ Elimina</div> that got turned into just >🗑️ Elimina<
  // Actually check for any deleteEvent line missing "Elimina"
  if (lines[i].includes('deleteEvent') && !lines[i].includes('Elimina') && !lines[i].includes('const deleteEvent')) {
    // This line has deleteEvent but no Elimina text - might be broken
    // Check if it has a display text
    const match = lines[i].match(/>([^<]*)<\/div>\s*$/);
    if (match && !match[1].includes('Elimina')) {
      lines[i] = lines[i].replace(/>([^<]*)<\/div>\s*$/, '>🗑️ Elimina</div>');
      fixed++;
      console.log('Restored Elimina on line ' + (i+1));
    }
  }
}

c = lines.join('\n');
fs.writeFileSync(file, c);
console.log('\n✅ Fixed ' + fixed + ' buttons');
console.log('Lines: ' + lines.length);
