import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const nacrti = JSON.parse(fs.readFileSync(SCRATCH + '/tura4-nacrti.json', 'utf8'));
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let a = fs.readFileSync('../../app.js', 'utf8');
let fails = 0;

for (const n of nacrti) {
  if (n.html.includes('`') || n.html.includes('${')) { console.log('FAIL: opasan znak u ' + n.key); process.exit(1); }
  if (/[А-Яа-яЁёЂђЉљЊњЋћЏџ]/.test(n.html)) { console.log('FAIL: ćirilica u ' + n.key); process.exit(1); }
  n.html = n.html.replace(/<!--\s*SVG:[\s\S]*?-->\s*/g, '');
}
console.log('ok  [provere sadržaja]');

function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// dve nove kartice
const blokovi = nacrti.map((k) =>
  "// --- " + k.key + " (Tura 4; kontrola bez blokirajućih nalaza) ---\n" +
  "CARDS['" + k.key + "'] = {\n  title: '" + k.naslov.replace(/'/g, "\\'") + "',\n  html: `" + k.html + "`,\n};\n\n"
).join('');
s = rep(s, 'const BYSUB = {', blokovi + 'const BYSUB = {', 'kartice');

// mapiranja: 118 uređaji, 103 zdravlje; premapiranja iz plana (91, 163, 168, 170)
s = rep(s, "BYSUB[161] = 'oznake-kolovoz';",
`BYSUB[118] = 'uredjaji-oprema';        // sklopovi, uređaji i oprema vozila
BYSUB[103] = 'vozac-zdravlje-alkohol'; // psihofizički uslovi, umor, alkohol
BYSUB[91] = 'razno-pravila';           // ko reguliše i ko kontroliše saobraćaj
BYSUB[163] = 'oznake-kolovoz';         // svetlosne oznake na putu
BYSUB[168] = 'vozilo-tehnika';         // teret na vozilu
BYSUB[170] = 'pesaci-bicikli';         // prevoz lica vozilima
BYSUB[161] = 'oznake-kolovoz';`, 'mapiranja');

// redosled u pojmovniku
a = rep(a, "['grp1', ['slicni-pojmovi', 'put-pojmovi', 'kategorije-vozila', 'brzine']],",
          "['grp1', ['slicni-pojmovi', 'put-pojmovi', 'kategorije-vozila', 'brzine', 'vozac-zdravlje-alkohol']],", 'grupa1');
a = rep(a, "['grp5', ['dozvole', 'vozilo-tehnika',",
          "['grp5', ['dozvole', 'vozilo-tehnika', 'uredjaji-oprema',", 'grupa5');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
fs.writeFileSync('../../app.js', a);
console.log('tura 4 integrisana');
