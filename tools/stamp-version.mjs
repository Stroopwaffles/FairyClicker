// Stamps a version onto every script/style URL so browsers fetch fresh files
// after each release (GitHub Pages lets browsers cache files for 10 minutes).
// Usage: node tools/stamp-version.mjs 3.7.1
// Updates: index.html (stylesheet, main script, FC_V, title-screen version) and
// every relative import in js/*.js.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const v = process.argv[2];
if (!v || !/^[\w.-]+$/.test(v)) { console.error('Usage: node tools/stamp-version.mjs <version>'); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const q = `?v=${v}`;

const jsDir = join(root, 'js');
for (const f of readdirSync(jsDir).filter((x) => x.endsWith('.js'))) {
  const p = join(jsDir, f);
  const before = readFileSync(p, 'utf8');
  const after = before.replace(/(from\s+'\.\/[\w-]+\.js)(\?v=[\w.-]+)?'/g, `$1${q}'`);
  if (after !== before) writeFileSync(p, after);
}

const html = join(root, 'index.html');
let s = readFileSync(html, 'utf8');
s = s.replace(/href="css\/style\.css(\?v=[\w.-]+)?"/, `href="css/style.css${q}"`)
  .replace(/src="js\/main\.js(\?v=[\w.-]+)?"/, `src="js/main.js${q}"`)
  .replace(/window\.FC_V = '[^']*'/, `window.FC_V = '${q}'`)
  .replace(/Version [\w.]+ ·/, `Version ${v} ·`);
writeFileSync(html, s);
console.log(`Stamped version ${v}`);
