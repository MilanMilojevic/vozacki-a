import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const nacrti = JSON.parse(fs.readFileSync(SCRATCH + '/tura2-nacrti.json', 'utf8'));
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let a = fs.readFileSync('../../app.js', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// samo dve kartice koje su PROŠLE reviziju (obaveštenja čeka doradu)
const uzmi = (key) => nacrti.find((n) => n.key === key);
const kartice = [uzmi('znakovi-opasnosti'), uzmi('znakovi-naredbi')];
for (const k of kartice) {
  if (!k) { console.log('FAIL: nema nacrta'); process.exit(1); }
  if (k.html.includes('`') || k.html.includes('${')) { console.log('FAIL: opasni znak u html ' + k.key); process.exit(1); }
  if (/[А-Яа-яЁёЂђЉљЊњЋћЏџ]/.test(k.html)) { console.log('FAIL: ćirilica u ' + k.key); process.exit(1); }
}

// ubaci CARDS blokove ODMAH POSLE parking-table bloka (pre BYSUB sekcije)
const sidro = "// --- BYSUB";
if (s.split(sidro).length - 1 !== 1) {
  // rezervno sidro: definicija BYSUB
  const alt = 'const BYSUB = {';
  if (s.split(alt).length - 1 !== 1) { console.log('FAIL: nema BYSUB sidra'); process.exit(1); }
  const blokovi = kartice.map((k) =>
    "// --- " + k.key + " (Tura 2 revizije pojmovnika; revizija bez primedbi) ---\n" +
    "CARDS['" + k.key + "'] = {\n  title: '" + k.naslov.replace(/'/g, "\\'") + "',\n  html: `" + k.html + "`,\n};\n\n"
  ).join('');
  s = s.split(alt).join(blokovi + alt);
  console.log('ok  [cards ubačene pre BYSUB]');
} else {
  console.log('koristim // --- BYSUB sidro');
  const blokovi = kartice.map((k) =>
    "// --- " + k.key + " (Tura 2 revizije pojmovnika; revizija bez primedbi) ---\n" +
    "CARDS['" + k.key + "'] = {\n  title: '" + k.naslov.replace(/'/g, "\\'") + "',\n  html: `" + k.html + "`,\n};\n\n"
  ).join('');
  s = s.split(sidro).join(blokovi + sidro);
}

// premapiraj podoblasti: 157 → opasnosti, 158 → naredbi (159 ostaje do dorade)
s = rep(s, "BYSUB[157] = 'znakovi-porodice';", "BYSUB[157] = 'znakovi-opasnosti';", 'bysub-157');
s = rep(s, "BYSUB[158] = 'znakovi-porodice';", "BYSUB[158] = 'znakovi-naredbi';", 'bysub-158');

// redosled u pojmovniku: nove kartice u grupu 2, odmah posle znakovi-porodice
a = rep(a, "['grp2', ['prvenstvo-prolaza', 'znakovi-porodice', 'semafori', 'oznake-kolovoz']],",
          "['grp2', ['prvenstvo-prolaza', 'znakovi-porodice', 'znakovi-opasnosti', 'znakovi-naredbi', 'semafori', 'oznake-kolovoz']],", 'grupe');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
fs.writeFileSync('../../app.js', a);
console.log('dve kartice integrisane');
