// Тура 3б (05.09.2026): картица „Знакови обавештења" (32 KB извора, 147 питања једне подобласти)
// дели се на ШЕСТ мањих, фокусираних картица — Миланова реч: „још појмова, али краћих,
// фокусиранијих". Садржај се прерасподељује по блоковима највишег нивоа, НЕ преписује;
// једина текстуална измена је пренумерисање наслова тачака унутар нових картица (нпр. „6."
// постаје „1." кад тачка постане прва у својој картици).
//
// Подела (индекси блокова у изворној картици):
//   znakovi-obavestenja (остаје кључ, постаје УВОД): 0, 2, 52 — чл. 34, боја подлоге, тактика
//   zn-ob-kraj-zone:  1, 3–12, 16–18 — крај (црвена трака), престанак (две породице), зоне
//   zn-ob-parovi:     13–15, 19–21   — ромб и парови табла/круг/троугао
//   zn-ob-autoput:    22–33          — траке на аутопуту, радови, преусмеравање, девијација
//   zn-ob-vodjenje:   34–41          — вођење саобраћаја, услуге, тунел
//   zn-ob-ostalo:     42–51          — путарина, радар, гранична табла, раздeлно острво, бројеви
//
// BYSUB[159] се брише: питања подобласти 159 добијају картицу ПО ПИТАЊУ (двоструки суд), у
// посебном кораку — до тада имају само своје објашњење, што је по правилу „боље ниједна него
// погрешна". Покретање:  node tools/arhiva/deoba-znakova-obavestenja.mjs
import fs from 'node:fs';

const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');

const sidro = "CARDS['znakovi-obavestenja'] = {";
const i0 = t.indexOf(sidro);
if (i0 === -1 || t.indexOf(sidro, i0 + 1) !== -1) { console.log('FAIL: sidro kartice'); process.exit(1); }
const h = t.indexOf('html: `', i0) + 7;
const kraj = t.indexOf('`,\n};', h);
const html = t.slice(h, kraj);
if (html.includes('zn-ob-')) { console.log('PRESKOČENO: već podeljeno'); process.exit(0); }

// blokovi najvišeg nivoa (isti parser kao u pojmovnik-ksek.mjs)
let dubina = 0, start = 0;
const b = [];
{
  const re = /<(\/?)(div|table|p|svg|h4|ul|ol)\b[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    if (!m[1]) { if (dubina === 0) start = m.index; dubina++; }
    else { dubina--; if (dubina === 0) b.push(html.slice(start, re.lastIndex)); }
  }
}
if (b.length !== 53 || dubina !== 0) { console.log('FAIL: blokova ' + b.length + ', dubina ' + dubina); process.exit(1); }

const uzmi = (indeksi) => indeksi.map((x) => b[x]).join('\n');
const KARTICE = [
  ['znakovi-obavestenja', 'Znakovi obaveštenja — kako ih čitaš (boja, oblik, precrtano)', uzmi([0, 2, 52]), []],
  ['zn-ob-kraj-zone', 'Znakovi obaveštenja — kraj, prestanak i zone', uzmi([1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 17, 18]),
    [['<p style="margin-top:10px"><b>4. Zone', '<p style="margin-top:10px"><b>3. Zone']]],
  ['zn-ob-parovi', 'Znakovi obaveštenja — romb i parovi tabla/krug/trougao', uzmi([13, 14, 15, 19, 20, 21]),
    [['<p style="margin-top:10px"><b>3. Romb', '<p style="margin-top:10px"><b>1. Romb'], ['<p style="margin-top:10px"><b>5. Parovi', '<p style="margin-top:10px"><b>2. Parovi']]],
  ['zn-ob-autoput', 'Znakovi obaveštenja — trake, radovi i preusmeravanje', uzmi([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]),
    [['<p style="margin-top:10px"><b>6. Autoput', '<p style="margin-top:10px"><b>1. Autoput'], ['<p style="margin-top:10px"><b>7. Radovi', '<p style="margin-top:10px"><b>2. Radovi']]],
  ['zn-ob-vodjenje', 'Znakovi obaveštenja — vođenje, usluge i tunel', uzmi([34, 35, 36, 37, 38, 39, 40, 41]),
    [['<p style="margin-top:10px"><b>8. Vođenje', '<p style="margin-top:10px"><b>1. Vođenje'], ['<p style="margin-top:10px"><b>9. Usluge', '<p style="margin-top:10px"><b>2. Usluge'], ['<p style="margin-top:10px"><b>10. Tunel', '<p style="margin-top:10px"><b>3. Tunel']]],
  ['zn-ob-ostalo', 'Znakovi obaveštenja — putarina, table i brojevi', uzmi([42, 43, 44, 45, 46, 47, 48, 49, 50, 51]),
    [['<p style="margin-top:10px"><b>11. Putarina', '<p style="margin-top:10px"><b>1. Putarina'], ['<p style="margin-top:10px"><b>12. Tabla na granici', '<p style="margin-top:10px"><b>2. Tabla na granici'],
     ['<p style="margin-top:10px"><b>13. Razdelno ostrvo', '<p style="margin-top:10px"><b>3. Razdelno ostrvo'], ['<p style="margin-top:10px"><b>14. Brojevi', '<p style="margin-top:10px"><b>4. Brojevi']]],
];

// pokrivenost: svaki blok tačno jednom
{
  const svi = [0, 2, 52, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 17, 18, 13, 14, 15, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
    42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
  if (new Set(svi).size !== 53 || svi.length !== 53) { console.log('FAIL: pokrivenost blokova'); process.exit(1); }
}

let novo = '';
for (const [kljuc, naslov, telo, zamene] of KARTICE) {
  let telo2 = telo;
  for (const [a, bb] of zamene) {
    if (telo2.split(a).length - 1 !== 1) { console.log('FAIL: prenumerisanje -> ' + a); process.exit(1); }
    telo2 = telo2.replace(a, bb);
  }
  novo += "CARDS['" + kljuc + "'] = {\n  title: '" + naslov + "',\n  html: `\n" + telo2 + "`,\n};\n\n";
}
novo = novo.trimEnd();

// zameni celu staru definiciju (od sidra do kraja objekta) sa šest novih
const krajDef = t.indexOf('`,\n};', h) + 5;
t = t.slice(0, i0) + novo + t.slice(krajDef);

// bySub veza odlazi — mapiranje po pitanju ide u posebnom koraku
const bs = "BYSUB[159] = 'znakovi-obavestenja';";
if (t.split(bs).length - 1 !== 1) { console.log('FAIL: BYSUB[159]'); process.exit(1); }
t = t.replace(bs, "// BYSUB[159] — UKINUTO 05.09.2026: kartica je podeljena na šest manjih (deoba-znakova-obavestenja),\n// pa pitanja podoblasti 159 dobijaju karticu PO PITANJU (X[id].card), ne po podoblasti.");

fs.writeFileSync(P, t);
console.log('podeljeno na ' + KARTICE.length + ' kartica; BYSUB[159] ukinut');
console.log('sledi: GRUPE u app.js, pa build, pa mapiranje pitanja');
