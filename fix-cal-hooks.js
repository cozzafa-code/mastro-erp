// fix-cal-hooks.js — Remove duplicate hooks inside render
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Remove the ones inside the render (around line 984)
// They look like: "            const calTouchStartRef = React.useRef(0);\n            const calTouchEndRef = React.useRef(0);\n"
const pattern = '            const calTouchStartRef = React.useRef(0);\n            const calTouchEndRef = React.useRef(0);\n';
if (c.includes(pattern)) {
  c = c.replace(pattern, '');
  console.log('✓ Removed nested hooks (indented version)');
} else {
  // Try with different indentation
  const lines = c.split('\n');
  let removeLines = [];
  lines.forEach((l, i) => {
    if (i > 500 && l.includes('calTouchStartRef = React.useRef(0)')) removeLines.push(i);
    if (i > 500 && l.includes('calTouchEndRef = React.useRef(0)')) removeLines.push(i);
  });
  if (removeLines.length) {
    console.log('Removing lines: ' + removeLines.map(r=>r+1).join(', '));
    const newLines = lines.filter((_, i) => !removeLines.includes(i));
    c = newLines.join('\n');
    console.log('✓ Removed nested hooks');
  } else {
    console.log('⚠️ Nested hooks not found');
  }
}

// Verify
const remaining = (c.match(/calTouchStartRef = React\.useRef/g) || []).length;
console.log('calTouchStartRef declarations remaining: ' + remaining);

fs.writeFileSync(file, c);
console.log('Lines: ' + c.split('\n').length);
