// Тура 3б, други корак (05.09.2026): мапирање питања подобласти 159 на шест нових картица.
// Извор: два независна суда (workflow zn-ob-mapiranje) — примењује се САМО оно где су се оба
// сложила; несложена је прегледао човек и уписао их у RESENO (образложење уз сваку одлуку је
// у сесијском дневнику). Кључ 'nijedna' значи: питање остаје само са својим објашњењем.
// Покретање:  node tools/arhiva/deoba-znakova-obavestenja-2.mjs <putanja-do-json-a>
// JSON: { slozeni: [{id, kartica}], reseno: [{id, kartica}] }
import fs from 'node:fs';

const put = process.argv[2];
if (!put) { console.log('FAIL: nema putanje do JSON-a sa dodelama'); process.exit(1); }
const u = JSON.parse(fs.readFileSync(put, 'utf8'));
const dodele = [...(u.slozeni || []), ...(u.reseno || [])];
if (!dodele.length) { console.log('FAIL: nema dodela'); process.exit(1); }

const DOZVOLJENE = new Set(['znakovi-obavestenja', 'zn-ob-kraj-zone', 'zn-ob-parovi', 'zn-ob-autoput', 'zn-ob-vodjenje', 'zn-ob-ostalo', 'nijedna']);
const vidjeni = new Set();
for (const d of dodele) {
  if (!Number.isInteger(d.id) || !DOZVOLJENE.has(d.kartica)) { console.log('FAIL: loša dodela ' + JSON.stringify(d)); process.exit(1); }
  if (vidjeni.has(d.id)) { console.log('FAIL: duplikat ' + d.id); process.exit(1); }
  vidjeni.add(d.id);
}
if (dodele.length !== 147) { console.log('FAIL: dodela ' + dodele.length + ', očekivano 147'); process.exit(1); }

const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');
const SIDRO = 'const out = {';
const i = t.indexOf(SIDRO);
if (i === -1 || t.indexOf(SIDRO, i + 1) !== -1) { console.log('FAIL: sidro out'); process.exit(1); }

const poKartici = {};
for (const d of dodele) if (d.kartica !== 'nijedna') (poKartici[d.kartica] = poKartici[d.kartica] || []).push(d.id);

let blok = '// --- Znakovi obaveštenja: kartica PO PITANJU posle deobe na šest (05.09.2026) ---\n'
  + '// Dva nezavisna suda + čovek za nesložene; "nijedna" znači samo objašnjenje, bez kartice.\n';
let n = 0;
for (const [k, ids] of Object.entries(poKartici)) {
  ids.sort((a, b) => a - b);
  n += ids.length;
  for (let j = 0; j < ids.length; j += 14) {
    blok += 'for (const id of [' + ids.slice(j, j + 14).join(', ') + "]) X[id] = { ...(X[id] || {}), card: '" + k + "' };\n";
  }
}
blok += '\n';
t = t.slice(0, i) + blok + t.slice(i);
fs.writeFileSync(P, t);
console.log('upisano: kartica za ' + n + ' pitanja, bez kartice ' + (147 - n));
console.log('sledi: cd tools && node build-explanations.mjs');
