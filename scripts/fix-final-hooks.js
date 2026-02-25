// fix-final-hooks.js — Move last stray hooks to main body
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Remove calTouchStartRef and calTouchEndRef from current position
const old1 = '  const calTouchStartRef = React.useRef(0);\n';
const old2 = '  const calTouchEndRef = React.useRef(0);\n';

// Count occurrences
const count1 = (c.match(/calTouchStartRef = React\.useRef/g) || []).length;
const count2 = (c.match(/calTouchEndRef = React\.useRef/g) || []).length;
console.log('calTouchStartRef declarations: ' + count1);
console.log('calTouchEndRef declarations: ' + count2);

// Remove the declarations (they appear once each as definition lines)
c = c.replace('  const calTouchStartRef = React.useRef(0);\n  const calTouchEndRef = React.useRef(0);\n', '');
console.log('✓ Removed from old position');

// Insert after the last useRef in the main hooks section (after firmaRef/fotoVanoRef)
const anchor = 'const fotoVanoRef = useRef(null);\n';
const idx = c.indexOf(anchor);
if (idx === -1) { console.error('Anchor not found, trying alternative'); 
  // Try another anchor
  const alt = 'const [pendingFotoCat, setPendingFotoCat] = useState(null);\n';
  const altIdx = c.indexOf(alt);
  if (altIdx === -1) { console.error('No anchor found'); process.exit(1); }
  const insertAt = altIdx + alt.length;
  c = c.substring(0, insertAt) + '  const calTouchStartRef = React.useRef(0);\n  const calTouchEndRef = React.useRef(0);\n' + c.substring(insertAt);
} else {
  const insertAt = idx + anchor.length;
  c = c.substring(0, insertAt) + '  const calTouchStartRef = React.useRef(0);\n  const calTouchEndRef = React.useRef(0);\n' + c.substring(insertAt);
}
console.log('✓ Moved to main hooks section');

// Verify no more hooks after line 500
const lines = c.split('\n');
let stray = [];
lines.forEach((l, i) => {
  if (i > 500 && (l.includes('useState(') || l.includes('useEffect(') || l.includes('useRef(') || l.includes('useMemo(')) && !l.trim().startsWith('//')) {
    stray.push((i+1) + ': ' + l.trim().substring(0, 80));
  }
});
if (stray.length) {
  console.log('\n⚠️ Stray hooks remaining:');
  stray.forEach(s => console.log(s));
} else {
  console.log('\n✅ All hooks in correct position!');
}

fs.writeFileSync(file, c);
console.log('Lines: ' + c.split('\n').length);
