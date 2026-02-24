// fix-tuto-hooks.js — Move tutoStep to main component body with other hooks
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Remove the tutorial block from current position
const tutoStart = c.indexOf('// === ONBOARDING TUTORIAL ===');
if (tutoStart === -1) { console.error('Tutorial block not found'); process.exit(1); }

// Find end of tutorial block - look for the next const or function definition
const lines = c.substring(tutoStart).split('\n');
let blockEnd = 0;
for (let i = 0; i < lines.length; i++) {
  blockEnd += lines[i].length + 1;
  // End after the nextTuto line
  if (lines[i].includes('nextTuto')) { 
    // Include the blank line after
    blockEnd += lines[i+1] ? lines[i+1].length + 1 : 0;
    break; 
  }
}

const tutoBlock = c.substring(tutoStart, tutoStart + blockEnd);
c = c.substring(0, tutoStart) + c.substring(tutoStart + blockEnd);
console.log('✓ Tutorial block extracted (' + tutoBlock.split('\n').length + ' lines)');

// 2. Insert it right after the settingsTab useState
const settingsTabLine = c.indexOf('const [settingsTab, setSettingsTab]');
if (settingsTabLine === -1) { console.error('settingsTab not found'); process.exit(1); }
const insertAfter = c.indexOf('\n', settingsTabLine) + 1;

c = c.substring(0, insertAfter) + '\n  ' + tutoBlock + '\n' + c.substring(insertAfter);
console.log('✓ Tutorial hooks moved after settingsTab');

fs.writeFileSync(file, c);
console.log('\n✅ Done! Lines: ' + c.split('\n').length);
