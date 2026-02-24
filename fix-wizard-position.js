// fix-wizard-position.js — Move wizard+tour before {!selectedVano && (}
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// Find wizard block start
const wizStart = c.indexOf('{/* === ONBOARDING WIZARD === */}');
if (wizStart === -1) { console.error('Wizard not found'); process.exit(1); }

// Find tour block end - look for the closing of the tour block
// The tour ends with a specific pattern
const tourComment = c.indexOf('{/* === TOUR === */}', wizStart);
if (tourComment === -1) { console.error('Tour not found'); process.exit(1); }

// Find the closing of the tour: after the tour there's the tabBar div
const tabBarAnchor = '<div style={S.tabBar}>';
const tabBarIdx = c.indexOf(tabBarAnchor, tourComment);
if (tabBarIdx === -1) { console.error('TabBar not found'); process.exit(1); }

// The wizard+tour block is everything from wizStart to tabBarIdx
const wizardBlock = c.substring(wizStart, tabBarIdx);

// Remove wizard block from current position
c = c.substring(0, wizStart) + c.substring(tabBarIdx);

// Now find {!selectedVano && ( which wraps the tabBar
const condStart = c.lastIndexOf('{!selectedVano && (', c.indexOf(tabBarAnchor));
if (condStart === -1) { console.error('!selectedVano not found'); process.exit(1); }

// Insert wizard BEFORE the conditional
c = c.substring(0, condStart) + wizardBlock + '\n      ' + c.substring(condStart);

fs.writeFileSync(file, c);
console.log('✅ Wizard moved before {!selectedVano && (}');
console.log('Lines: ' + c.split('\n').length);
