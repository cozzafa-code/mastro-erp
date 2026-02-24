// fix-trash-icon.js
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Replace wrong emoji with correct trash can
const count = (c.match(/🗝' Elimina/g) || []).length;
c = c.replaceAll("🗝' Elimina", "🗑️ Elimina");

fs.writeFileSync(file, c);
console.log('✅ Fixed ' + count + ' trash icons');
