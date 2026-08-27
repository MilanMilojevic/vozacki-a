import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const SP = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad/';
const c1 = (await import(pathToFileURL(SP + 'topups-c1.mjs').href)).default;
const c2 = (await import(pathToFileURL(SP + 'topups-c2.mjs').href)).default;
const c3 = (await import(pathToFileURL(SP + 'topups-c3.mjs').href)).default;
const c4 = JSON.parse(fs.readFileSync(SP + 'topups-c4.json', 'utf8'));
const all = { ...c1, ...c2, ...c3, ...c4 };
console.log('ukupno dopuna:', Object.keys(all).length);

let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0, done = 0;
for (const [id, text] of Object.entries(all)) {
  const anchor = 'X[' + id + '] = ';
  // kod duplih dodela (override blokovi) poslednja važi u runtime-u — menjamo POSLEDNJU
  const i = s.lastIndexOf(anchor);
  if (i < 0) { console.log('FAIL [X' + id + '] anchor (nema)'); fails++; continue; }
  const end = s.indexOf(';\n', i);
  if (end < 0) { console.log('FAIL [X' + id + '] end'); fails++; continue; }
  // sačuvaj postojeći card ako ga red ima
  const oldLine = s.slice(i, end);
  const cardM = oldLine.match(/card:\s*'([^']+)'/);
  const cardPart = cardM ? ", card: '" + cardM[1] + "'" : '';
  s = s.slice(0, i) + 'X[' + id + '] = { x: ' + JSON.stringify(text) + cardPart + ' }' + s.slice(end);
  done++;
}
if (fails) { console.log('NE PIŠEM — ' + fails + ' promašaja'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('primenjeno dopuna:', done);
