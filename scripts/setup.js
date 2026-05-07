#!/usr/bin/env node
/**
 * scripts/setup.js
 *
 * Copies shared assets from the SleepDiaries sibling repo into ScoreMe.
 * Run once after cloning: `node scripts/setup.js`
 *
 * Assumes the directory layout:
 *   GitHub/
 *     SleepDiaries/
 *     ScoreMe/          ← you are here
 */
const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '..');
const SLEEP_ROOT = path.resolve(ROOT, '..', 'SleepDiaries');

const copies = [
  // fonts
  { src: 'assets/fonts/Livvic-Bold.ttf',    dst: 'assets/fonts/Livvic-Bold.ttf'    },
  { src: 'assets/fonts/Afacad-Bold.ttf',    dst: 'assets/fonts/Afacad-Bold.ttf'    },
  { src: 'assets/fonts/Afacad-Medium.ttf',  dst: 'assets/fonts/Afacad-Medium.ttf'  },
  { src: 'assets/fonts/Afacad-Regular.ttf', dst: 'assets/fonts/Afacad-Regular.ttf' },
  // icon & splash (optional — ScoreMe can use its own later)
  { src: 'assets/favicon.png',              dst: 'assets/favicon.png'              },
  { src: 'assets/icon.png',                 dst: 'assets/icon.png'                 },
  { src: 'assets/splash-icon.png',          dst: 'assets/splash-icon.png'          },
];

let ok = 0, skip = 0, fail = 0;

for (const { src, dst } of copies) {
  const srcPath = path.join(SLEEP_ROOT, src);
  const dstPath = path.join(ROOT, dst);

  if (!fs.existsSync(srcPath)) {
    console.warn(`  SKIP  ${src}  (not found in SleepDiaries)`);
    skip++;
    continue;
  }

  fs.mkdirSync(path.dirname(dstPath), { recursive: true });
  fs.copyFileSync(srcPath, dstPath);
  console.log(`  OK    ${dst}`);
  ok++;
}

console.log(`\nDone: ${ok} copied, ${skip} skipped, ${fail} failed.`);
if (ok > 0) {
  console.log('\nNext steps:');
  console.log('  npm install');
  console.log('  npx expo start');
}
