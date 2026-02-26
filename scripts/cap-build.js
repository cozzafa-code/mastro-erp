// scripts/cap-build.js
// Run: node scripts/cap-build.js [android|ios|all]
// Builds Next.js static export + syncs with Capacitor

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platform = process.argv[2] || 'all';

function run(cmd, label) {
  console.log(`\n🔧 ${label}...`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`✅ ${label} completato`);
  } catch (e) {
    console.error(`❌ ${label} fallito`);
    process.exit(1);
  }
}

console.log('🏗️  MASTRO ERP — Build Nativo\n');
console.log(`Platform: ${platform}`);
console.log('─'.repeat(40));

// Step 1: Build Next.js static
run('npx next build', 'Build Next.js (static export)');

// Step 2: Verify out/ directory exists
if (!fs.existsSync(path.join(__dirname, '..', 'out'))) {
  console.error('❌ Directory "out" non trovata. Verifica output: "export" in next.config.js');
  process.exit(1);
}
console.log('✅ Directory "out" trovata');

// Step 3: Copy service worker to out/
const swSrc = path.join(__dirname, '..', 'public', 'sw.js');
const swDest = path.join(__dirname, '..', 'out', 'sw.js');
if (fs.existsSync(swSrc)) {
  fs.copyFileSync(swSrc, swDest);
  console.log('✅ Service worker copiato in out/');
}

// Step 4: Sync Capacitor
if (platform === 'android' || platform === 'all') {
  run('npx cap sync android', 'Sync Android');
}
if (platform === 'ios' || platform === 'all') {
  run('npx cap sync ios', 'Sync iOS');
}

console.log('\n🎉 Build completato!');
console.log('─'.repeat(40));

if (platform === 'android' || platform === 'all') {
  console.log('\n📱 Android:');
  console.log('  npx cap open android    → Apri Android Studio');
  console.log('  npx cap run android     → Run su device/emulatore');
}
if (platform === 'ios' || platform === 'all') {
  console.log('\n🍎 iOS:');
  console.log('  npx cap open ios        → Apri Xcode');
  console.log('  npx cap run ios         → Run su simulatore');
  console.log('  Oppure usa Codemagic per build cloud');
}

console.log('\n💡 Per live reload durante lo sviluppo:');
console.log('  1. Decommenta server.url in capacitor.config.ts');
console.log('  2. Imposta il tuo IP locale');
console.log('  3. npm run dev');
console.log('  4. npx cap run android/ios');
