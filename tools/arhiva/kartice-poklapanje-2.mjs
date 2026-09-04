// Revizija poklapanja kartica, drugi deo (04.09.2026) — pitanja koja su ostala bez kartice
// podoblasti, a kojima ODGOVARA neka druga postojeća kartica.
//
// Postupak: prvi prolaz je uz svaku odluku ponudio i predlog druge kartice (58 predloga).
// Predlozi NISU primenjeni na reč jedne sesije — svaki je prošao kroz DVA nezavisna suda koja
// nisu videla odluku onog drugog. Prihvaćeno je samo ono gde su oba rekla DA: 24 od 58.
// Slaganje je bilo potpuno (0 neslaganja), a odbijeni predlozi su odbijeni sa razlogom koji se
// da proveriti u tekstu kartice (npr. kartica „Autoput" govori o PONAŠANJU na autoputu, a
// pitanje traži zakonsku DEFINICIJU autoputa — u kartici je nema).
//
// Sopstvena kartica (X[id].card) se prikazuje i kad pitanje ima nocard: nocard gasi samo
// karticu podoblasti. Zato ovaj blok mora da SPAJA (spread), ne da prepisuje.
// Pokretanje:  node tools/arhiva/kartice-poklapanje-2.mjs
import fs from 'node:fs';

const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');

const PRIHVACENO = [
  ['kategorije-vozila', [7996, 7997, 7998, 8008, 8009, 8010, 8013, 8015, 8016]],
  ['oznake-kolovoz', [9615, 9618, 9685, 10061]],
  ['znakovi-naredbi', [9675, 9679, 9862, 9865]],
  ['pesaci-bicikli', [9535, 9536, 9538]],
  ['pruga', [8113]],
  ['iskljucenje', [8465]],
  ['semafori', [11044]],
  ['policajac-znaci', [10550]],
];

const SIDRO = 'const out = {';
const i = t.indexOf(SIDRO);
if (i === -1 || t.indexOf(SIDRO, i + 1) !== -1) { console.log('FAIL: sidro out nije jedinstveno'); process.exit(1); }

let n = 0;
let blok = '// --- Prava kartica umesto pogrešne (revizija 04.09.2026, drugi deo) ---\n'
  + '// Ova pitanja su ostala bez kartice svoje podoblasti, ali im odgovara druga postojeća kartica.\n'
  + '// Svaki par je potvrdilo DVA nezavisna suda; gde se nisu složili, kartice nema.\n'
  // 11044 bi jedino imalo DVE kartice. Odlučuje ga zeleno svetlo, a ne linija zaustavljanja,
  // pa mu ostaje samo kartica o semaforima — pravilo je jedna kartica, i to prava.
  + 'X[11044] = { ...(X[11044] || {}), nocard: 1 };\n';
for (const [kartica, ids] of PRIHVACENO) {
  n += ids.length;
  blok += 'for (const id of [' + ids.join(', ') + ']) X[id] = { ...(X[id] || {}), card: \'' + kartica + '\' };\n';
}
blok += '\n';

t = t.slice(0, i) + blok + t.slice(i);
fs.writeFileSync(P, t);
console.log('upisano: prava kartica za ' + n + ' pitanja');
console.log('sledi: cd tools && node build-explanations.mjs');
