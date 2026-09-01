import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const nacrti = JSON.parse(fs.readFileSync(SCRATCH + '/tura3-nacrti.json', 'utf8'));
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let a = fs.readFileSync('../../app.js', 'utf8');
let fails = 0;

// bezbednosne provere svakog nacrta
for (const n of nacrti) {
  if (n.html.includes('`') || n.html.includes('${')) { console.log('FAIL: opasan znak u ' + n.key); process.exit(1); }
  if (/[А-Яа-яЁёЂђЉљЊњЋћЏџ]/.test(n.html)) { console.log('FAIL: ćirilica u ' + n.key); process.exit(1); }
  // ukloni neiskorišćene SVG placeholdere (kontrola ih je prijavila kao sitan nalaz)
  n.html = n.html.replace(/<!--\s*SVG:[\s\S]*?-->\s*/g, '');
}
console.log('ok  [provere sadržaja + uklonjeni placeholderi]');

function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// 1) NOVA kartica policajac-znaci
const pol = nacrti.find((n) => n.key === 'policajac-znaci');
const blok = "// --- policajac-znaci (Tura 3; kontrola + ručna provera slika 9457/9464) ---\n" +
  "CARDS['policajac-znaci'] = {\n  title: '" + pol.naslov.replace(/'/g, "\\'") + "',\n  html: `" + pol.html + "`,\n};\n\n";
s = rep(s, 'const BYSUB = {', blok + 'const BYSUB = {', 'kartica-policajac');
s = rep(s, "BYSUB[166] = 'prvenstvo-prolaza';", "BYSUB[166] = 'policajac-znaci';", 'bysub-166');

// 2) DOPUNE postojećih kartica — dodaju se na kraj html-a odgovarajuće kartice
function dopuni(key, dopunaHtml, label) {
  // pronađi CARDS['key'] = { ... html: `...` } i ubaci pred zatvarajući backtick tog bloka
  const poc = s.indexOf("CARDS['" + key + "']");
  if (poc < 0) { console.log('FAIL [' + label + '] nema kartice'); fails++; return; }
  const htmlPoc = s.indexOf('html: `', poc);
  if (htmlPoc < 0) { console.log('FAIL [' + label + '] nema html polja'); fails++; return; }
  const kraj = s.indexOf('`,', htmlPoc + 7);
  if (kraj < 0) { console.log('FAIL [' + label + '] nema kraja html-a'); fails++; return; }
  s = s.slice(0, kraj) + '\n' + dopunaHtml + '\n' + s.slice(kraj);
  console.log('ok  [' + label + ']');
}
dopuni('prvenstvo-prolaza', nacrti.find((n) => n.key === 'prvenstvo-prolaza').html, 'dopuna-prvenstvo');
dopuni('skretanje', nacrti.find((n) => n.key === 'skretanje').html, 'dopuna-skretanje');

// 3) premapiranje 137 (saobraćaj na raskrsnici) sa prvenstvo-prolaza na skretanje
s = rep(s, "  137: 'prvenstvo-prolaza',   // saobraćaj na raskrsnici", "  137: 'skretanje',   // saobraćaj na raskrsnici (prestrojavanje, ulazak, zaustavljanje u raskrsnici)", 'bysub-137');

// 4) redosled u pojmovniku: policajac-znaci u grupu 2 (uz prvenstvo)
a = rep(a, "['grp2', ['prvenstvo-prolaza', 'znakovi-porodice'", "['grp2', ['prvenstvo-prolaza', 'policajac-znaci', 'znakovi-porodice'", 'grupe');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
fs.writeFileSync('../../app.js', a);
console.log('tura 3 integrisana');
