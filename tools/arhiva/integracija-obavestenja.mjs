import fs from 'node:fs';
const SCRATCH = 'C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad';
const html = JSON.parse(fs.readFileSync(SCRATCH + '/obavestenja-final.json', 'utf8')).html;
let s = fs.readFileSync('../build-explanations.mjs', 'utf8');
let a = fs.readFileSync('../../app.js', 'utf8');
let fails = 0;

// bezbednosne provere sadržaja
if (html.includes('`') || html.includes('${')) { console.log('FAIL: opasan znak u html'); process.exit(1); }
if (/[А-Яа-яЁёЂђЉљЊњЋћЏџ]/.test(html)) { console.log('FAIL: ćirilica u html'); process.exit(1); }
if (html.length < 20000) { console.log('FAIL: sumnjivo kratak html'); process.exit(1); }
console.log('ok  [provere sadržaja]');

function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

const blok = "// --- znakovi-obavestenja (Tura 2; tri runde revizije, poslednja kontrola bez blokirajućih nalaza) ---\n" +
  "CARDS['znakovi-obavestenja'] = {\n  title: 'Znakovi obaveštenja — precrtano znači kraj',\n  html: `" + html + "`,\n};\n\n";
s = rep(s, 'const BYSUB = {', blok + 'const BYSUB = {', 'kartica');
s = rep(s, "BYSUB[159] = 'znakovi-porodice';", "BYSUB[159] = 'znakovi-obavestenja';", 'bysub-159');

a = rep(a, "'znakovi-opasnosti', 'znakovi-naredbi', 'semafori'", "'znakovi-opasnosti', 'znakovi-naredbi', 'znakovi-obavestenja', 'semafori'", 'grupe');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', s);
fs.writeFileSync('../../app.js', a);
console.log('kartica obaveštenja integrisana');
