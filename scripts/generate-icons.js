// scripts/generate-icons.js
// Run: node scripts/generate-icons.js
// Generates all PWA icon sizes from a base design

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const padding = size * 0.1;

  // Background — MASTRO cream
  ctx.fillStyle = '#F2F1EC';
  ctx.fillRect(0, 0, size, size);

  // Dark rounded square
  const squareSize = size - padding * 2;
  const radius = size * 0.15;
  const x = padding;
  const y = padding;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + squareSize - radius, y);
  ctx.quadraticCurveTo(x + squareSize, y, x + squareSize, y + radius);
  ctx.lineTo(x + squareSize, y + squareSize - radius);
  ctx.quadraticCurveTo(x + squareSize, y + squareSize, x + squareSize - radius, y + squareSize);
  ctx.lineTo(x + radius, y + squareSize);
  ctx.quadraticCurveTo(x, y + squareSize, x, y + squareSize - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = '#1A1A1C';
  ctx.fill();

  // Golden wrench emoji replacement — "M" letter
  const fontSize = size * 0.4;
  ctx.font = `bold ${fontSize}px "Inter", "Helvetica", "Arial", sans-serif`;
  ctx.fillStyle = '#D08008';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', size / 2, size / 2 + size * 0.02);

  // Small wrench accent line under M
  const lineY = size / 2 + fontSize * 0.35;
  const lineW = size * 0.2;
  ctx.strokeStyle = '#D08008';
  ctx.lineWidth = size * 0.025;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(size / 2 - lineW / 2, lineY);
  ctx.lineTo(size / 2 + lineW / 2, lineY);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

// Generate all sizes
sizes.forEach((size) => {
  const buffer = generateIcon(size);
  const filepath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ Generated ${filepath} (${size}x${size})`);
});

// Generate favicon.ico (use 32x32)
const favicon = generateIcon(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), favicon);
console.log('✅ Generated favicon.ico');

// Generate Apple splash screens
const splashConfigs = [
  { w: 1170, h: 2532, name: 'apple-splash-1170x2532.png' }, // iPhone 13
  { w: 1284, h: 2778, name: 'apple-splash-1284x2778.png' }, // iPhone 13 Pro Max
  { w: 1290, h: 2796, name: 'apple-splash-1290x2796.png' }, // iPhone 15 Pro Max
];

splashConfigs.forEach(({ w, h, name }) => {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#F2F1EC';
  ctx.fillRect(0, 0, w, h);

  // Centered icon
  const iconSize = w * 0.25;
  const iconX = (w - iconSize) / 2;
  const iconY = (h - iconSize) / 2 - h * 0.05;
  const radius = iconSize * 0.15;

  ctx.beginPath();
  ctx.moveTo(iconX + radius, iconY);
  ctx.lineTo(iconX + iconSize - radius, iconY);
  ctx.quadraticCurveTo(iconX + iconSize, iconY, iconX + iconSize, iconY + radius);
  ctx.lineTo(iconX + iconSize, iconY + iconSize - radius);
  ctx.quadraticCurveTo(iconX + iconSize, iconY + iconSize, iconX + iconSize - radius, iconY + iconSize);
  ctx.lineTo(iconX + radius, iconY + iconSize);
  ctx.quadraticCurveTo(iconX, iconY + iconSize, iconX, iconY + iconSize - radius);
  ctx.lineTo(iconX, iconY + radius);
  ctx.quadraticCurveTo(iconX, iconY, iconX + radius, iconY);
  ctx.closePath();
  ctx.fillStyle = '#1A1A1C';
  ctx.fill();

  // M
  const fontSize = iconSize * 0.5;
  ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
  ctx.fillStyle = '#D08008';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', w / 2, h / 2 - h * 0.04);

  // "MASTRO" text below
  const textSize = w * 0.06;
  ctx.font = `600 ${textSize}px "Inter", sans-serif`;
  ctx.fillStyle = '#1A1A1C';
  ctx.fillText('MASTRO', w / 2, iconY + iconSize + textSize * 1.5);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, name), buffer);
  console.log(`✅ Generated splash ${name}`);
});

console.log('\n🎉 All icons generated!');
