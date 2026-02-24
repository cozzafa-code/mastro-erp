// fix-extra-div.js
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the FAB button closing line (rotate(45deg)) then remove the extra </div> after it
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('rotate(45deg)') && lines[i].includes('✏️')) {
    // Next line should be "        </div>" (closing FAB button)
    // Line after that should be "      </div>" (extra - needs removal)
    if (lines[i+1] && lines[i+1].trim() === '</div>' && 
        lines[i+2] && lines[i+2].trim() === '</div>') {
      console.log('Removing extra </div> at line ' + (i+3));
      lines.splice(i+2, 1);
      break;
    }
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('✅ Fixed! Lines: ' + lines.length);
