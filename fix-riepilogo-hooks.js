// fix-riepilogo-hooks.js — Move showRiepilogo/riepilogoSending hooks
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Remove from current position
const old1 = '  const [showRiepilogo, setShowRiepilogo] = useState(false);\n';
const old2 = '  const [riepilogoSending, setRiepilogoSending] = useState(false);\n';
c = c.replace(old1, '');
c = c.replace(old2, '');
console.log('✓ Removed from old position');

// Insert after settingsTab useState
const anchor = 'const [settingsTab, setSettingsTab] = useState("generali");\n';
const idx = c.indexOf(anchor);
if (idx === -1) { console.error('Anchor not found'); process.exit(1); }
const insertAt = idx + anchor.length;

c = c.substring(0, insertAt) + '  const [showRiepilogo, setShowRiepilogo] = useState(false);\n  const [riepilogoSending, setRiepilogoSending] = useState(false);\n' + c.substring(insertAt);
console.log('✓ Moved to main body');

// Check for any more hooks after line 1000
const lines = c.split('\n');
let found = [];
lines.forEach((l, i) => {
  if ((l.includes('useState(') || l.includes('useEffect(')) && i > 1000 && !l.trim().startsWith('//')) {
    found.push((i+1) + ': ' + l.substring(0, 80));
  }
});
if (found.length) {
  console.log('\n⚠️ More hooks found after line 1000:');
  found.forEach(f => console.log(f));
} else {
  console.log('\n✅ No more hooks after line 1000!');
}

fs.writeFileSync(file, c);
console.log('Lines: ' + c.split('\n').length);
