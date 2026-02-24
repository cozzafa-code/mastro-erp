// fix-msg-close.js — Add back missing </div> in renderMessaggi
const fs = require('fs');
const file = 'components/MastroERP.tsx';
let c = fs.readFileSync(file, 'utf8');

// The problem: after removing FAB, renderMessaggi lost its outer closing </div>
// Current: </>)}\n\n    );\n  };
// Should be: </>)}\n      </div>\n    );\n  };

const broken = `</>)}\n\n    );\n  };\n\n  /* == SETTINGS TAB == */`;
const fixed = `</>)}\n      </div>\n    );\n  };\n\n  /* == SETTINGS TAB == */`;

if (c.includes(broken)) {
  c = c.replace(broken, fixed);
  console.log('✓ Added missing </div>');
} else {
  console.log('Pattern not found, trying alternative...');
  // Try to find the specific spot
  const lines = c.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '</>)}' && lines[i+2] && lines[i+2].trim() === ');' && lines[i+3] && lines[i+3].trim() === '};' && lines[i+5] && lines[i+5].includes('SETTINGS TAB')) {
      lines.splice(i + 1, 0, '      </div>');
      console.log('✓ Inserted </div> after line ' + (i+1));
      c = lines.join('\n');
      break;
    }
  }
}

fs.writeFileSync(file, c);
console.log('Lines: ' + c.split('\n').length);
